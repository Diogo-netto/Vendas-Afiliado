// Testes locais sem dependências extras (Node.js).
// Uso: node testes/testar-busca-zoom.js
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const marker = html.indexOf('const MEUS_PRODUTOS');
assert.ok(marker >= 0, 'Script principal não encontrado');
const inicio = html.lastIndexOf('<script>', marker) + '<script>'.length;
const fim = html.indexOf('</script>', marker);
assert.ok(inicio > 0 && fim > inicio, 'Bloco de script inválido');
const script = html.slice(inicio, fim);
new vm.Script(script, {filename: 'index.html'});

const elementos = new Map();
function elemento(id) {
  if (!elementos.has(id)) elementos.set(id, {
    style: {}, textContent: '', clientWidth: 0, clientHeight: 0,
    naturalWidth: 0, naturalHeight: 0, complete: true,
    value: '', max: '260'
  });
  return elementos.get(id);
}
const ctx = vm.createContext({
  console,
  window: {addEventListener() {}, devicePixelRatio: 1},
  document: {getElementById: elemento},
  Image: class ImageMock {}
});
vm.runInContext(script, ctx, {timeout: 3000});

const catalogo = Array.from({length: 54}, (_, i) => ({
  numero: String(i + 1).padStart(2, '0'),
  titulo: `Produto genérico sem semelhança ${i + 1}`,
  categoria: 'Casa & Utilidades',
  precoNumerico: i + 20
}));
catalogo[2] = {...catalogo[2], titulo: 'Televisor LG 43 polegadas', categoria: 'Eletrônicos & Áudio'};
catalogo[3] = {...catalogo[3], titulo: 'Monitor gamer 24 polegadas', categoria: 'Eletrônicos & Áudio'};
catalogo[11] = {...catalogo[11], titulo: 'Disjuntor bipolar para quadro', categoria: 'Ferramentas & Tech'};
catalogo[33] = {...catalogo[33], titulo: 'Celular Samsung Galaxy A17', categoria: 'Celulares & Smartphones'};
catalogo[34] = {...catalogo[34], titulo: 'Smart TV TCL 55 polegadas 4K', categoria: 'Eletrônicos & Áudio'};
catalogo[35] = {...catalogo[35], titulo: 'Smart TV Samsung 50 polegadas', categoria: 'Eletrônicos & Áudio'};
catalogo[36] = {...catalogo[36], titulo: 'Fita LED Samsung para decoração', categoria: 'Eletrônicos & Áudio'};
catalogo[37] = {...catalogo[37], titulo: 'Esteira ergométrica elétrica', categoria: 'Suplementos & Fitness'};
catalogo[38] = {...catalogo[38], titulo: 'Furadeira e parafusadeira elétrica', categoria: 'Ferramentas & Tech'};
vm.runInContext('activeProducts = ' + JSON.stringify(catalogo), ctx);

function buscar(q) {
  vm.runInContext('searchQuery = ' + JSON.stringify(q), ctx);
  return JSON.parse(JSON.stringify(vm.runInContext('executarBuscaMercadoLivre()', ctx, {timeout: 3000})));
}
function numeros(resultado) { return resultado.principais.map(p => p.numero); }

for (const palavra of ['televisão', 'televisor', 'TV', 'tevê', 'televizao', 'smart tv', 'quero uma televisão']) {
  const encontrados = numeros(buscar(palavra));
  assert.ok(encontrados.includes('35'), `${palavra}: precisa encontrar Smart TV #35`);
  assert.ok(encontrados.includes('36'), `${palavra}: precisa encontrar Smart TV #36`);
  if (palavra !== 'smart tv') assert.ok(encontrados.includes('03'), `${palavra}: precisa encontrar televisor #03`);
  assert.ok(!encontrados.includes('34'), `${palavra}: não deve incluir celular Samsung`);
  assert.ok(!encontrados.includes('37'), `${palavra}: não deve incluir fita LED`);
}
for (const codigo of ['35', '#35', '035', 'produto 35', 'código 35', 'numero 35', 'nº35']) {
  const resultado = buscar(codigo);
  assert.deepEqual(numeros(resultado), ['35'], `${codigo}: #35 deve ser o único resultado principal`);
  assert.ok(resultado.relacionados.some(p => p.numero === '36'), `${codigo}: Smart TV #36 deve ser relacionada`);
  assert.ok(!resultado.relacionados.some(p => p.numero === '34'), `${codigo}: celular não é TV relacionada`);
}
const tvSamsung = buscar('36');
assert.ok(!tvSamsung.relacionados.some(p => p.numero === '34'), 'Marca Samsung isolada não torna celular semelhante a Smart TV');
assert.deepEqual(numeros(buscar('disjuntor')), ['12']);
assert.deepEqual(numeros(buscar('palavrainventadainexistente')), []);
assert.ok(numeros(buscar('furadeira')).includes('39'));
assert.ok(numeros(buscar('smart')).includes('35'));

const foto = elemento('zoom-image');
foto.clientWidth = 320;
foto.clientHeight = 320;
foto.naturalWidth = 400;
foto.naturalHeight = 400;
vm.runInContext('viewerState.inlineZoomScale = 2.6; aplicarTransformacao3DPanoramica()', ctx);
const zoomBaixo = vm.runInContext('viewerState.inlineZoomScale', ctx);
assert.ok(zoomBaixo <= 1.26 && zoomBaixo >= 1.24, 'Imagem de 400px deve ter zoom limitado a 1.25x');
assert.equal(foto.style.filter, 'none', 'Filtro artificial não deve aplicar desfoque');
foto.naturalWidth = 1200;
foto.naturalHeight = 1200;
vm.runInContext('viewerState.inlineZoomScale = 2.6; aplicarTransformacao3DPanoramica()', ctx);
const zoomAlto = vm.runInContext('viewerState.inlineZoomScale', ctx);
assert.equal(zoomAlto, 2.6, 'Foto de 1200px deve permitir até 2.6x');

// Mesmo que algum cache ou backend antigo forneça um desconto inexistente,
// a vitrine deve recusar preços sem comprovação da API oficial.
const semPreco = JSON.parse(vm.runInContext(`JSON.stringify(normalizarProdutoRecebido({
  numero:'22',titulo:'Fralda Pampers XXG',categoria:'Casa & Utilidades',
  precoAtual:'R$ 43,17',precoAntigo:'R$ 259,00',precoNumerico:43.17,
  descontoTag:'83% OFF BLACK FRIDAY',precoConfirmado:false,
  linkMercadoLivre:'https://meli.la/19z8oa8'
}))`,ctx));
assert.equal(semPreco.precoAtual,'Consultar preço no anúncio');
assert.equal(semPreco.precoAntigo,'');
assert.equal(semPreco.descontoTag,'');
assert.equal(semPreco.precoNumerico,999999);
const confirmado = JSON.parse(vm.runInContext(`JSON.stringify(normalizarProdutoRecebido({
  numero:'22',titulo:'Fralda Pampers XXG',categoria:'Casa & Utilidades',
  precoAtual:'R$ 267,00',precoNumerico:267,descontoTag:'',
  precoConfirmado:true,precoFonte:'api-oficial-sale-price-channel-marketplace',
  linkMercadoLivre:'https://meli.la/19z8oa8'
}))`,ctx));
assert.equal(confirmado.precoAtual,'R$ 267,00');

console.log('OK: 54 registros, aliases TV/regionais, código #35 primeiro, relacionados pertinentes, busca vazia e zoom por resolução.');
