'use strict';
/**
 * Catálogo público de afiliados — Vercel Serverless Function (Node.js / CommonJS).
 * NÃO há criação de anúncios, login do visitante ou movimentação de pagamentos.
 * Mantém os 54 links de afiliado originais, sem reconstruí-los ou retirar parâmetros.
 * Não inserir tokens no arquivo; configure ML_ACCESS_TOKEN na Vercel somente se
 * possuir um token OAuth autorizado e válido. NÃO tenta client_credentials.
 * Sem autenticação no endpoint oficial /sale_price, NÃO exibe valores monetários.
 * Isso é intencional: um preço incorreto prejudica compradores e o afiliado.
 *
 * A extração pública de páginas é um recurso de MELHOR ESFORÇO e pode falhar ou
 * mudar sem aviso. Nenhuma avaliação, frete, desconto ou preço é inventado.
 */

const LISTA_LINKS_AFILIADO = [
  { numero: '01', linkMercadoLivre: 'https://meli.la/2PySxJz' },
  { numero: '02', linkMercadoLivre: 'https://meli.la/1oUjudQ' },
  { numero: '03', linkMercadoLivre: 'https://meli.la/1iqhiaQ' },
  { numero: '04', linkMercadoLivre: 'https://meli.la/2NELsie' },
  { numero: '05', linkMercadoLivre: 'https://meli.la/28R1rTN' },
  { numero: '06', linkMercadoLivre: 'https://meli.la/2ygKFoV' },
  { numero: '07', linkMercadoLivre: 'https://meli.la/18PAVkX' },
  { numero: '08', linkMercadoLivre: 'https://meli.la/2R8x15H' },
  { numero: '09', linkMercadoLivre: 'https://meli.la/19k8FKN' },
  { numero: '10', linkMercadoLivre: 'https://meli.la/23d3jrZ' },
  { numero: '11', linkMercadoLivre: 'https://meli.la/2dhqHqC' },
  { numero: '12', linkMercadoLivre: 'https://meli.la/2anpjd3' },
  { numero: '13', linkMercadoLivre: 'https://meli.la/1GfEE37' },
  { numero: '14', linkMercadoLivre: 'https://meli.la/27KWSzY' },
  { numero: '15', linkMercadoLivre: 'https://meli.la/1p6g6E4' },
  { numero: '16', linkMercadoLivre: 'https://meli.la/2hTfzEg' },
  { numero: '17', linkMercadoLivre: 'https://meli.la/1xsU2sV' },
  { numero: '18', linkMercadoLivre: 'https://meli.la/1fHMNJY', codigoBuscaML: '2WT0PJ-NL8A' },
  { numero: '19', linkMercadoLivre: 'https://meli.la/2t1b8fz' },
  { numero: '20', linkMercadoLivre: 'https://meli.la/2Lf2TL1' },
  { numero: '21', linkMercadoLivre: 'https://meli.la/2LuPfwu' },
  { numero: '22', linkMercadoLivre: 'https://meli.la/19z8oa8' },
  { numero: '23', linkMercadoLivre: 'https://meli.la/1VhJjtV' },
  { numero: '24', linkMercadoLivre: 'https://meli.la/1azx2fa' },
  { numero: '25', linkMercadoLivre: 'https://meli.la/28FYDKM' },
  { numero: '26', linkMercadoLivre: 'https://meli.la/1Tb8UbS' },
  { numero: '27', linkMercadoLivre: 'https://meli.la/2gjob76' },
  { numero: '28', linkMercadoLivre: 'https://meli.la/16wkLWy' },
  { numero: '29', linkMercadoLivre: 'https://meli.la/1SiCt92' },
  { numero: '30', linkMercadoLivre: 'https://meli.la/2HwaEUR' },
  { numero: '31', linkMercadoLivre: 'https://meli.la/2bHThvM' },
  { numero: '32', linkMercadoLivre: 'https://meli.la/2AhCALu' },
  { numero: '33', linkMercadoLivre: 'https://meli.la/1bpKWQS' },
  { numero: '34', linkMercadoLivre: 'https://meli.la/2pdqm3W' },
  { numero: '35', linkMercadoLivre: 'https://meli.la/15vRaYV' },
  { numero: '36', linkMercadoLivre: 'https://meli.la/1Zib8Wr' },
  { numero: '37', linkMercadoLivre: 'https://meli.la/2kTnvBH' },
  { numero: '38', linkMercadoLivre: 'https://meli.la/18QMLho' },
  { numero: '39', linkMercadoLivre: 'https://meli.la/2zYw37j' },
  { numero: '40', linkMercadoLivre: 'https://meli.la/1jhyWja' },
  { numero: '41', linkMercadoLivre: 'https://meli.la/1n16mQq' },
  { numero: '42', linkMercadoLivre: 'https://meli.la/2UsBwWX' },
  { numero: '43', linkMercadoLivre: 'https://meli.la/14Z2kip' },
  { numero: '44', linkMercadoLivre: 'https://meli.la/2UmEAJ6' },
  { numero: '45', linkMercadoLivre: 'https://meli.la/1DJjjPw' },
  { numero: '46', linkMercadoLivre: 'https://meli.la/1PnpV5m' },
  { numero: '47', linkMercadoLivre: 'https://meli.la/2yQKQkM' },
  { numero: '48', linkMercadoLivre: 'https://meli.la/2jxtrix' },
  { numero: '49', linkMercadoLivre: 'https://meli.la/1iYSLkf' },
  { numero: '50', linkMercadoLivre: 'https://meli.la/1KKe6oC' },
  { numero: '51', linkMercadoLivre: 'https://meli.la/2zjSj19' },
  { numero: '52', linkMercadoLivre: 'https://meli.la/2qQ1gwC' },
  { numero: '53', linkMercadoLivre: 'https://meli.la/1UPqCNE' },
  { numero: '54', linkMercadoLivre: 'https://meli.la/2zyX3xy' }
];

// Cache curto em memória: não afirmar que o preço permanece fixo.
const CACHE_TTL_MS = 2 * 60 * 1000;
const itemCache = new Map();
const detailCache = new Map();
const MAX_HTML_BYTES = 2_500_000;
const MAX_REDIRECTS = 5;
const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f1f5f9"/><path d="M175 130h50v140h-50zM130 175h140v50H130z" fill="#cbd5e1"/><text x="200" y="330" text-anchor="middle" font-size="17" fill="#64748b" font-family="Arial">Foto indisponível</text></svg>'
);

function urlEhSegura(urlString) {
  try {
    const u = new URL(urlString);
    const host = u.hostname.toLowerCase();
    return u.protocol === 'https:' && !u.username && !u.password && !u.port &&
      (host === 'meli.la' || host === 'mercadolivre.com.br' || host.endsWith('.mercadolivre.com.br'));
  } catch { return false; }
}
function urlImagemSegura(urlString) {
  try {
    const u = new URL(urlString);
    const host = u.hostname.toLowerCase();
    return u.protocol === 'https:' && !u.username && !u.password && !u.port &&
      (host === 'mlstatic.com' || host.endsWith('.mlstatic.com'));
  } catch { return false; }
}
function unicaImagem(url) {
  const valor = String(url || '').replace(/&amp;/g, '&');
  return urlImagemSegura(valor) ? valor : '';
}
function textoLimpo(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:amp|#38);/gi, '&').replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => { const code = Number(n); return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''; })
    .replace(/\s+/g, ' ').trim().slice(0, 400);
}
function nomeValido(titulo) {
  const t = textoLimpo(titulo);
  return t.length >= 6 && !/^(?:mercado livre|mercadolivre|recomendações de|social)/i.test(t);
}
function metaHTML(html, key) {
  for (const tag of html.match(/<meta\s[^>]*>/gi) || []) {
    const props = {};
    for (const attr of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      props[attr[1].toLowerCase()] = attr[2] ?? attr[3] ?? '';
    }
    if (props.property === key || props.name === key) return textoLimpo(props.content || '');
  }
  return '';
}

// Fallbacks de metadados para páginas de recomendação/social em que OG não traz
// título e foto da oferta. Os resultados continuam de melhor esforço.
function tituloPagina(html) {
  const candidates = [
    metaHTML(html, 'og:title'), metaHTML(html, 'twitter:title'),
    (html.match(/<h1[^>]*class=["'][^"']*ui-pdp-title[^"']*["'][^>]*>([\s\S]{1,350}?)<\/h1>/i) || [])[1],
    (html.match(/<a[^>]*class=["'][^"']*poly-component__title[^"']*["'][^>]*>([\s\S]{1,350}?)<\/a>/i) || [])[1],
    (html.match(/<h[1-5][^>]*class=["'][^"']*poly-component__title[^"']*["'][^>]*>([\s\S]{1,350}?)<\/h[1-5]>/i) || [])[1]
  ];
  for (const value of candidates) {
    const txt = textoLimpo(value);
    if (nomeValido(txt) && !/mercado livre.*\b(ofertas|recomendações|benefícios|comprar)\b/i.test(txt)) return txt;
  }
  return '';
}
function imagemPagina(html) {
  const candidates = [metaHTML(html, 'og:image'), metaHTML(html, 'twitter:image')];
  for (const m of html.matchAll(/https:\/\/http2\.mlstatic\.com\/D_NQ_NP_[a-zA-Z0-9_-]+\.(?:webp|jpg|png)/gi)) {
    candidates.push(m[0]);
    if (candidates.length > 8) break;
  }
  return candidates.map(unicaImagem).find(Boolean) || '';
}

function idAnuncio(url, html = '') {
  const candidates = [url, metaHTML(html, 'og:url'),
    (html.match(/"item_id"\s*:\s*"(MLB-?\d{7,13})"/i) || [])[1],
    (html.match(/"itemId"\s*:\s*"(MLB-?\d{7,13})"/i) || [])[1]];
  for (const candidate of candidates) {
    const match = String(candidate || '').match(/\bMLB-?(\d{7,13})\b/i);
    if (match) return `MLB${match[1]}`;
  }
  return '';
}
// O identificador para consultar PREÇO deve estar no próprio URL de um
// anúncio, NÃO em IDs soltos de uma vitrine social que pode listar vários itens.
function idConfiavelDaPagina(urlString) {
  if (!urlEhSegura(urlString)) return '';
  try {
    const url = new URL(urlString);
    if (/^\/(?:social|lista|busca|categorias)(?:\/|$)/i.test(url.pathname)) return '';
    const m = url.pathname.match(/(?:^|\/|-)MLB-?(\d{7,13})(?=$|\/|-)/i);
    return m ? `MLB${m[1]}` : '';
  } catch { return ''; }
}

// Somente /sale_price pode fornecer um valor exibível. Campos antigos de
// /items, HTML/OG e textos do cartão NUNCA são usados como preço.
async function precoVendaOficial(itemId, token) {
  if (!/^MLB\d{7,13}$/.test(itemId) || !token) return null;
  try {
    const url = `https://api.mercadolibre.com/items/${itemId}/sale_price?context=channel_marketplace`;
    const resp = await fetchTimeout(url, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    }, 3000);
    if (!resp.ok) return null;
    const registro = await resp.json();
    if (!registro || (registro.item_id && registro.item_id !== itemId) || registro.currency_id !== 'BRL') return null;
    const atual = obterPreco(registro.amount);
    if (!atual) return null;
    const regular = obterPreco(registro.regular_amount);
    return {
      atual,
      anterior: regular && regular > atual ? regular : null,
      consultadoEm: new Date().toISOString(),
      fonte: 'api-oficial-sale-price-channel-marketplace'
    };
  } catch { return null; }
}

function categoriaDoTitulo(titulo, manual = '') {
  if (manual) return String(manual).slice(0, 70);
  const t = titulo.toLowerCase();
  if (/(celular|smartphone|iphone|samsung|galaxy|motorola|redmi|xiaomi|realme)/.test(t)) return 'Celulares & Smartphones';
  if (/(whey|creatina|suplemento|esteira|fitness|halter|bicicleta|muscula|academia)/.test(t)) return 'Suplementos & Fitness';
  if (/(lençol|lencol|travesseiro|toalha|edredom|colchão|colchao|fronha|cobertor|manta)/.test(t)) return 'Cama, Mesa & Banho';
  if (/(playstation|ps[45]|xbox|nintendo|gamer|console|steam)/.test(t)) return 'Games & Consoles';
  if (/(fone|bluetooth|caixa de som|jbl|smartwatch|carregador|televis|smart tv|monitor|notebook|tablet|microfone|camera|câmera|projetor)/.test(t)) return 'Eletrônicos & Áudio';
  if (/(fritadeira|air.?fryer|panela|liquidificador|cafeteira|cozinha|aspirador|mop|ventilador|organizador|lixeira|pote)/.test(t)) return 'Casa & Cozinha';
  if (/(furadeira|parafusadeira|ferramenta|impressora|filamento|extensão|disjuntor|tomada|alicate|trena|serra|solda|compressor)/.test(t)) return 'Ferramentas & Tech';
  if (/(perfume|shampoo|escova|secador|maquiagem|barbeador|aparador|hidratante)/.test(t)) return 'Beleza & Cuidado';
  if (/(tênis|tenis|camiseta|calça|calca|mochila|bolsa|sapato|chinelo|sandália|jaqueta|bermuda|boné)/.test(t)) return 'Moda & Acessórios';
  return 'Casa & Utilidades';
}
function obterPreco(valor) {
  const n = typeof valor === 'number' ? valor : Number(String(valor || '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n < 1e9 ? n : null;
}
function formatarReais(n) { return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
async function fetchTimeout(url, opts = {}, ms = 3800) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { ...opts, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}
async function abrirUrlPermitida(url, timeout = 3800) {
  let current = url;
  const deadline = Date.now() + 4300;
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    if (!urlEhSegura(current)) throw new Error('Destino não permitido');
    const restante = deadline - Date.now();
    if (restante <= 0) throw new Error('Limite de tempo');
    const response = await fetchTimeout(current, {
      redirect: 'manual',
      headers: { Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'pt-BR,pt;q=0.9', 'User-Agent': 'Mozilla/5.0 (compatible; ComprarOnline/1.0; +https://vercel.com)'  }
    }, Math.min(timeout, restante));
    if ([301,302,303,307,308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Redirecionamento sem destino');
      const next = new URL(location, current).href;
      if (!urlEhSegura(next)) throw new Error('Redirecionamento externo bloqueado');
      current = next;
      continue;
    }
    if (!response.ok) throw new Error(`Anúncio indisponível (${response.status})`);
    const len = Number(response.headers.get('content-length') || 0);
    if (len > MAX_HTML_BYTES) throw new Error('Página muito grande');
    const html = await response.text();
    if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) throw new Error('Página muito grande');
    return { url: current, html };
  }
  throw new Error('Excesso de redirecionamentos');
}
async function detalhesDoItem(id, token) {
  if (!/^MLB\d{7,13}$/.test(id)) return null;
  try {
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const r = await fetchTimeout(`https://api.mercadolibre.com/items/${id}`, { headers }, 3000);
    if (!r.ok) return null;
    const data = await r.json();
    return data && data.id === id ? data : null;
  } catch { return null; }
}
function imagensDoItem(data, ogImagem) {
  const urls = [];
  const add = (url) => { const s = unicaImagem(url); if (s && !urls.includes(s) && urls.length < 10) urls.push(s); };
  if (data && Array.isArray(data.pictures)) data.pictures.forEach(p => add(p.secure_url || p.url));
  if (data && data.thumbnail) add(data.thumbnail);
  add(ogImagem);
  return urls;
}
function fotosDaPaginaDoProduto(pagina) {
  if (!pagina || !/\bMLB-?\d{7,13}\b/i.test(pagina.url)) return [];
  const html = pagina.html || '';
  const lista = [];
  const add = (valor) => {
    const url = unicaImagem(String(valor || '').replace(/\\\//g, '/'));
    if (url && !lista.includes(url) && lista.length < 10) lista.push(url);
  };
  for (const m of html.matchAll(/data-zoom=["'](https:\/\/[^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/"(?:secure_url|url)"\s*:\s*"(https?:\\?\/\\?\/[^"\s]+)"/gi)) {
    add(m[1]);
    if (lista.length >= 10) break;
  }
  return lista;
}

function especificacoesDoItem(data) {
  if (!data || !Array.isArray(data.attributes)) return [];
  return data.attributes.filter(a => a && a.name && a.value_name).slice(0, 10).map(a =>
    `${textoLimpo(a.name)}: ${textoLimpo(a.value_name)}`);
}
function curadoriaNeutra() {
  return {
    seloCuradoria: 'Selecionado para a vitrine',
    recomendacaoAmigo: 'Confira as características, opiniões, prazo de entrega e condições diretamente no anúncio antes de finalizar a compra.'
  };
}
function construirProduto(config, pagina, dados, erro = false, precoOficial = null) {
  const id = String(config.numero).padStart(2, '0');
  const tituloOG = pagina ? tituloPagina(pagina.html) : '';
  const tituloBruto = nomeValido(dados?.title) ? dados.title : tituloOG;
  const titulo = nomeValido(tituloBruto) ? textoLimpo(tituloBruto).replace(/\s*\|\s*Mercado Livre.*$/i, '') : `Produto #${id} — Ver anúncio`;
  const categoria = categoriaDoTitulo(titulo, config.categoria || '');
  const fotoOG = pagina ? imagemPagina(pagina.html) : '';
  const fotos = imagensDoItem(dados, fotoOG);
  if (!dados || !Array.isArray(dados.pictures) || !dados.pictures.length) {
    for (const url of fotosDaPaginaDoProduto(pagina)) {
      if (fotos.length < 10 && !fotos.includes(url)) fotos.push(url);
    }
  }
  // Sem acesso AUTORIZADO ao preço de venda, NÃO mostrar números.
  // Isso impede exibir preço de parcela, promoção de outro anúncio ou
  // ofertas restritas a um comprador como se fossem universais.
  const preco = precoOficial && obterPreco(precoOficial.atual);
  const precoAntigoNum = preco && obterPreco(precoOficial.anterior);
  const temDesconto = Boolean(preco && precoAntigoNum && precoAntigoNum > preco);
  const pct = temDesconto ? Math.round(100 * (precoAntigoNum - preco) / precoAntigoNum) : 0;
  const bloqueado = Boolean(dados && dados.status && dados.status !== 'active');
  const curadoria = curadoriaNeutra();
  return {
    numero: id,
    categoria,
    titulo,
    descricao: curadoria.recomendacaoAmigo,
    recomendacaoAmigo: curadoria.recomendacaoAmigo,
    seloCuradoria: curadoria.seloCuradoria,
    imagemUrl: fotos[0] || FALLBACK_IMAGE,
    fotosGaleria: fotos.length ? fotos : [FALLBACK_IMAGE],
    caracteristicas: especificacoesDoItem(dados),
    vendidosTexto: '', avaliacaoNota: '', avaliacaoQtd: '', lojaOficial: '',
    precoAntigo: temDesconto ? formatarReais(precoAntigoNum) : '',
    precoAtual: preco ? formatarReais(preco) : 'Consultar preço no anúncio',
    precoNumerico: preco || 999999,
    precoConfirmado: Boolean(preco),
    precoFonte: preco ? precoOficial.fonte : '',
    precoConsultadoEm: preco ? precoOficial.consultadoEm : '',
    precoAviso: preco
      ? 'Preço padrão do canal marketplace consultado na API. Pode variar por conta, CEP, promoção e horário.'
      : 'Sem preço confirmado para este anúncio. Consulte o valor diretamente no Mercado Livre.',
    parcelamento: '',
    descontoTag: pct > 0 ? `${pct}% OFF` : '',
    temBlackFriday: false,
    linkMercadoLivre: config.linkMercadoLivre,
    codigoBuscaML: config.codigoBuscaML || '',
    indisponivel: bloqueado,
    aviso: erro ? 'Não foi possível atualizar este item agora. Confira os dados no Mercado Livre.' : '',
    atualizadoEm: new Date().toISOString()
  };
}
function pegarCache(map, key) {
  const cached = map.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
  if (cached) map.delete(key);
  return null;
}
async function carregarUmProduto(item) {
  const key = item.numero;
  const cached = pegarCache(itemCache, key);
  if (cached) return cached;
  let pagina = null, data = null, precoOficial = null, falhou = false;
  try {
    pagina = await abrirUrlPermitida(item.linkMercadoLivre);
    const id = idAnuncio(pagina.url, pagina.html);
    if (id) data = await detalhesDoItem(id, process.env.ML_ACCESS_TOKEN || '');
    // Preço somente do ID inequívoco do próprio anúncio no destino.
    const idPreco = idConfiavelDaPagina(pagina.url);
    if (idPreco && data && data.id === idPreco && data.status === 'active') {
      precoOficial = await precoVendaOficial(idPreco, process.env.ML_ACCESS_TOKEN || '');
    }
  } catch { falhou = true; }
  const result = construirProduto(item, pagina, data, falhou, precoOficial);
  // Erros não ficam armazenados no cache por muito tempo.
  if (!falhou && (nomeValido(data?.title) || (pagina && nomeValido(tituloPagina(pagina.html))))) {
    itemCache.set(key, { timestamp: Date.now(), data: result });
  } else if (falhou) {
    itemCache.set(key, { timestamp: Date.now() - CACHE_TTL_MS + 60_000, data: result });
  }
  return result;
}
async function carregarDetalhe(item) {
  const cached = pegarCache(detailCache, item.numero);
  if (cached) return cached;
  const produto = await carregarUmProduto(item);
  const detalhes = {
    fotosGaleria: produto.fotosGaleria,
    caracteristicas: produto.caracteristicas,
    vendidosTexto: produto.vendidosTexto,
    avaliacaoNota: produto.avaliacaoNota,
    avaliacaoQtd: produto.avaliacaoQtd,
    lojaOficial: produto.lojaOficial,
    parcelamentoTexto: produto.parcelamento
  };
  detailCache.set(item.numero, {timestamp:Date.now(),data:detalhes});
  return detalhes;
}
function numeroSeguro(valor, fallback, min, max) {
  if (typeof valor === 'object') return fallback;
  const n = Number(valor);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}
async function emLotes(arr, tamanho, fn) {
  const results = [];
  for (let i = 0; i < arr.length; i += tamanho) {
    const lote = await Promise.all(arr.slice(i, i + tamanho).map(fn));
    results.push(...lote);
  }
  return results;
}
module.exports = async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Impede que a CDN exiba preço antigo após a validade do cache local.
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido' });
  }
  try {
    const q = req.query || {};
    if (q.detalhe === '1' || q.detalhe === 1) {
      // Nunca consulta URLs arbitrárias enviadas pelo usuário; apenas itens do catálogo.
      const item = LISTA_LINKS_AFILIADO.find(i =>
        (typeof q.numero === 'string' && q.numero === i.numero) ||
        (typeof q.link === 'string' && q.link === i.linkMercadoLivre));
      if (!item) return res.status(404).json({ error: 'Produto não encontrado' });
      const detalhes = await carregarDetalhe(item);
      return res.status(200).json({ok: true, detalhes});
    }
    const tamanho = numeroSeguro(q.tamanho, 12, 1, 20);
    const total = LISTA_LINKS_AFILIADO.length;
    const totalLotes = Math.ceil(total / tamanho);
    const lote = numeroSeguro(q.lote, 1, 1, totalLotes);
    const inicio = (lote - 1) * tamanho;
    const selecionados = LISTA_LINKS_AFILIADO.slice(inicio, inicio + tamanho);
    const produtos = await Promise.all(selecionados.map(carregarUmProduto));
    produtos.sort((a, b) => (a.precoNumerico - b.precoNumerico) || (a.numero.localeCompare(b.numero)));
    return res.status(200).json({totalGeral: total, lote, totalLotes,
      totalRetornado: produtos.length, produtos});
  } catch {
    return res.status(503).json({error: 'Catálogo temporariamente indisponível. Tente novamente.'});
  }
};

// Exportações de apoio apenas para testes locais, sem expor endpoints administrativos.
module.exports._internals = {LISTA_LINKS_AFILIADO, urlEhSegura, urlImagemSegura, numeroSeguro, construirProduto, idConfiavelDaPagina, precoVendaOficial};
