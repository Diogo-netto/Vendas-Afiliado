'use strict';
// Testes offline da política fail-closed de preço, segurança e catálogo.
// Não consulta Mercado Livre real nem altera banco de dados.
const assert = require('node:assert/strict');
const path = require('node:path');
const apiPath = path.resolve(__dirname, '../api/produtos.js');
const originalFetch = global.fetch;
const originalToken = process.env.ML_ACCESS_TOKEN;

function loadFreshApi() {
  delete require.cache[require.resolve(apiPath)];
  return require(apiPath);
}
function resMock() {
  return { code:0, body:null, headers:{}, setHeader(k,v){this.headers[k]=v;}, status(c){this.code=c;return this;}, json(body){this.body=body;return this;} };
}
function mockFetch({salePrice, landing='direct', corruptPrice=true}={}) {
  const seen=[];
  global.fetch = async function(url,opts={}) {
    seen.push({url,opts});
    if (String(url).startsWith('https://meli.la/')) {
      const dest=landing==='social'
        ? 'https://www.mercadolivre.com.br/social/colecao/recomendacoes'
        : 'https://www.mercadolivre.com.br/p/MLB123456789';
      return new Response(null,{status:302,headers:{location:dest}});
    }
    if (String(url).startsWith('https://www.mercadolivre.com.br/')) {
      return new Response(`<html><head><meta property="og:title" content="Fralda Pampers Pants XXG 120 Unidades"><meta property="og:image" content="https://http2.mlstatic.com/foto.jpg"><meta property="product:price:amount" content="43.17"></head><body><a href="https://www.mercadolivre.com.br/p/MLB123456789">MLB123456789</a></body></html>`,{status:200,headers:{'content-type':'text/html'}});
    }
    if (String(url)==='https://api.mercadolibre.com/items/MLB123456789') {
      return new Response(JSON.stringify({id:'MLB123456789',status:'active',title:'Fralda Pampers Pants XXG 120 Unidades',price:43.17,original_price:259,pictures:[{secure_url:'https://http2.mlstatic.com/foto.jpg'}],attributes:[]}),{status:200});
    }
    if (String(url)==='https://api.mercadolibre.com/items/MLB123456789/sale_price?context=channel_marketplace') {
      assert.match(opts.headers.Authorization,/^Bearer token-teste$/);
      if (!salePrice) return new Response(JSON.stringify({error:'not_available'}),{status:403});
      return new Response(JSON.stringify(salePrice),{status:200});
    }
    throw new Error('URL não esperada: '+url);
  };
  return seen;
}
async function getPage(api,query={lote:'2',tamanho:'12'}) {
  const r=resMock(); await api({method:'GET',query},r); assert.equal(r.code,200); return r;
}
async function run() {
  process.env.ML_ACCESS_TOKEN='';
  let api=loadFreshApi(),lib=api._internals;
  assert.equal(lib.LISTA_LINKS_AFILIADO.length,54);
  assert.equal(new Set(lib.LISTA_LINKS_AFILIADO.map(x=>x.linkMercadoLivre)).size,54);
  assert.equal(lib.LISTA_LINKS_AFILIADO.find(x=>x.numero==='22').linkMercadoLivre,'https://meli.la/19z8oa8');
  assert.equal(lib.idConfiavelDaPagina('https://www.mercadolivre.com.br/p/MLB123456789'),'MLB123456789');
  assert.equal(lib.idConfiavelDaPagina('https://www.mercadolivre.com.br/social/anuncio/MLB123456789'),'');
  assert.equal(lib.urlEhSegura('https://meli.la/2PySxJz'),true);
  for(const bad of ['https://meli.la.evil.test/foo','http://meli.la/foo','https://127.0.0.1','https://user:pwd@meli.la/foo']) {
    assert.equal(lib.urlEhSegura(bad),false);
  }
  const tried = mockFetch();
  const blocked=resMock(); await api({method:'POST',query:{}},blocked);
  assert.equal(blocked.code,405);
  const invalid=resMock(); await api({method:'GET',query:{detalhe:'1',numero:'999'}},invalid);
  assert.equal(invalid.code,404);
  assert.equal(tried.length,0);
  let resp=await getPage(api);
  assert.equal(resp.body.totalGeral,54);
  assert.equal(resp.body.totalLotes,5);
  assert.equal(resp.body.produtos.length,12);
  assert.match(resp.headers['Cache-Control'],/no-store/);
  let p=resp.body.produtos.find(x=>x.numero==='22');
  assert.equal(p.precoAtual,'Consultar preço no anúncio');
  assert.equal(p.precoConfirmado,false);
  assert.equal(p.precoAntigo,'');
  assert.equal(p.descontoTag,'');
  assert.equal(p.temBlackFriday,false);
  assert.equal(p.linkMercadoLivre,'https://meli.la/19z8oa8');
  assert.equal(tried.some(x=>x.url.includes('/sale_price')),false,'sem token não consulta API de preço');

  // Com token e preço oficial para o MESMO ID de anúncio, usar 267.
  process.env.ML_ACCESS_TOKEN='token-teste';
  api=loadFreshApi();
  const seen=mockFetch({salePrice:{price_id:'133',amount:267,regular_amount:267,currency_id:'BRL'}});
  resp=await getPage(api);
  p=resp.body.produtos.find(x=>x.numero==='22');
  assert.equal(p.precoConfirmado,true);
  assert.match(p.precoAtual,/267,00/);
  assert.equal(p.precoAntigo,'');
  assert.equal(p.descontoTag,'');
  assert.equal(p.precoFonte,'api-oficial-sale-price-channel-marketplace');
  assert.ok(seen.some(x=>x.url.includes('/sale_price?context=channel_marketplace')));

  // Em página social, um ID da listagem não autoriza mostrar preço de outro anúncio.
  api=loadFreshApi();
  mockFetch({salePrice:{amount:43.17,regular_amount:259,currency_id:'BRL'}, landing:'social'});
  resp=await getPage(api);
  p=resp.body.produtos.find(x=>x.numero==='22');
  assert.equal(p.precoConfirmado,false);
  assert.equal(p.descontoTag,'');

  // Quando a consulta oficial falha (403, 429, timeout), não usa números do HTML.
  api=loadFreshApi();
  mockFetch({salePrice:null});
  resp=await getPage(api);
  p=resp.body.produtos.find(x=>x.numero==='22');
  assert.equal(p.precoConfirmado,false);
  assert.equal(p.precoAtual,'Consultar preço no anúncio');

  // Se /sale_price confirma promoção, só então publica desconto, sem inventar Black Friday.
  api=loadFreshApi();
  mockFetch({salePrice:{amount:90,regular_amount:100,currency_id:'BRL'}});
  resp=await getPage(api);
  p=resp.body.produtos.find(x=>x.numero==='22');
  assert.equal(p.precoConfirmado,true);
  assert.equal(p.descontoTag,'10% OFF');
  assert.equal(p.temBlackFriday,false);

  console.log('OK: 54 links, #22, sem preço falso (43,17), preço oficial (267), desconto confirmado, social, erros, segurança e 5 lotes.');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{global.fetch=originalFetch; if(originalToken===undefined)delete process.env.ML_ACCESS_TOKEN;else process.env.ML_ACCESS_TOKEN=originalToken;});
