/**
 * ============================================================================
 * API BACK-END SEGURA NA VERCEL — Caminho no projeto: api/produtos.js
 * ============================================================================
 * 1. Modo Grade Rápida (?lote=1, 2, 3): Carrega os 36 cards da vitrine.
 * 2. Modo Ficha Completa Sob Demanda (?detalhe=1&link=https://meli.la/...):
 *    Quando o cliente clica num produto, entra na página completa do anúncio
 *    e puxa TODAS as fotos da galeria em Ultra-HD (data-zoom), a lista
 *    "O que você precisa saber sobre este produto", "+100 mil vendidos",
 *    nota das estrelas (4.9 ★) e parcelamento real!
 */

const LISTA_LINKS_AFILIADO = [
  // Lote 1 (Produtos 01 a 12)
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

  // Lote 2 (Produtos 13 a 24)
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

  // Lote 3 (Produtos 25 a 36)
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
  { numero: '36', linkMercadoLivre: 'https://meli.la/1Zib8Wr' }
];

const itemCache = new Map();
const detalheCache = new Map();
let cachedOAuthToken = {
  token: null,
  expiresAt: 0
};
const CACHE_TTL_MS = 45 * 60 * 1000;

const DOMINIOS_PERMITIDOS = [
  'meli.la',
  'www.mercadolivre.com.br',
  'mercadolivre.com.br',
  'produto.mercadolivre.com.br',
  'click1.mercadolivre.com.br'
];

function urlEhSegura(urlString) {
  try {
    const parsed = new URL((urlString || '').trim());
    if (parsed.protocol !== 'https:') return false;
    return DOMINIOS_PERMITIDOS.some(
      d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
    );
  } catch (e) {
    return false;
  }
}

function normalizarImagemML(url = '') {
  if (!url || !url.includes('mlstatic.com')) return url;
  return url.replace(/\/D_(?:NQ_)?Q?_?NP_(?:2X_)*/i, '/D_NQ_NP_');
}

async function fetchComTimeout(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function detectarCategoriaAutomatica(titulo = '', categoriaManual = '') {
  if (categoriaManual && categoriaManual.trim()) return categoriaManual.trim();
  const t = titulo.toLowerCase();

  if (/(celular|smartphone|iphone|samsung|galaxy|motorola|moto\s|xiaomi|redmi|poco)/.test(t)) {
    return 'Celulares & Smartphones';
  }
  if (/(whey|creatina|hipercalórico|hipercalorico|suplemento|max titanium|integralmedica|esteira|ergométrica|ergometrica|academia|fitness|haltere|bicicleta)/.test(t)) {
    return 'Suplementos & Fitness';
  }
  if (/(lençol|lencol|travesseiro|toalha|edredom|cama|colchão|colchao|cortina|tapete)/.test(t)) {
    return 'Cama, Mesa & Banho';
  }
  if (/(playstation|ps4|ps5|xbox|nintendo|gift card|gamer|controle|headset|jogo)/.test(t)) {
    return 'Games & Consoles';
  }
  if (/(fone|bluetooth|caixa de som|jbl|smartwatch|relógio|relogio|carregador|tv|monitor|notebook|tablet)/.test(t)) {
    return 'Eletrônicos & Áudio';
  }
  if (/(airfryer|fritadeira|panela|liquidificador|cafeteira|cozinha|copo|térmico|termico|garrafa|aspirador|mop|assento|banheiro)/.test(t)) {
    return 'Casa & Cozinha';
  }
  if (/(furadeira|parafusadeira|ferramenta|chave|kit ferramentas|lavadora|impressora|filamento|3d|extensão|extensao|disjuntor|tomada|cabo)/.test(t)) {
    return 'Ferramentas & Tech';
  }
  if (/(perfume|creme|shampoo|escova|secador|chapinha|maquiagem|beleza|barbeador)/.test(t)) {
    return 'Beleza & Cuidado';
  }
  if (/(tênis|tenis|camisa|camiseta|blusa|calça|calca|mochila|bolsa|óculos|oculos|sapato)/.test(t)) {
    return 'Moda & Acessórios';
  }
  return 'Geral';
}

async function obterTokenOficialMercadoLivre() {
  if (process.env.ML_ACCESS_TOKEN) {
    return process.env.ML_ACCESS_TOKEN;
  }

  const appId = process.env.ML_APP_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!appId || !clientSecret) return null;

  const now = Date.now();
  if (cachedOAuthToken.token && now < cachedOAuthToken.expiresAt) {
    return cachedOAuthToken.token;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', appId);
    params.append('client_secret', clientSecret);

    const resp = await fetchComTimeout(
      'https://api.mercadolibre.com/oauth/token',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      },
      3000
    );

    if (resp.ok) {
      const data = await resp.json();
      if (data.access_token) {
        cachedOAuthToken = {
          token: data.access_token,
          expiresAt: now + ((data.expires_in || 21600) - 300) * 1000
        };
        return data.access_token;
      }
    }
  } catch (e) {}

  return null;
}

async function obterListaDeLinks() {
  if (process.env.FIREBASE_DB_URL) {
    try {
      const baseUrl = process.env.FIREBASE_DB_URL.replace(/\/$/, '');
      const resp = await fetchComTimeout(`${baseUrl}/produtos.json`, {}, 3000);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.filter(Boolean);
        }
        if (data && typeof data === 'object') {
          return Object.values(data).filter(Boolean);
        }
      }
    } catch (e) {}
  }
  return LISTA_LINKS_AFILIADO;
}

function limparEntidadesHtml(str = '') {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u002F/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

function tituloEhValido(t = '') {
  if (!t || t.length < 5) return false;
  const lower = t.toLowerCase();
  if (
    lower === 'mercado livre' ||
    lower === 'mercadolivre' ||
    lower.startsWith('recomendações de') ||
    lower.includes('mercado livre brasil')
  ) {
    return false;
  }
  return true;
}

/**
 * Extrai dados ricos da página completa do produto no Mercado Livre
 * (Todas as fotos da galeria data-zoom, "O que você precisa saber sobre este produto",
 *  "Novo | +100 mil vendidos", nota 4.9 ★, Loja Oficial e opções de parcelamento)
 */
function extrairDadosDaPaginaCompletaML(htmlProduto) {
  const resultado = {
    fotosGaleria: [],
    caracteristicas: [],
    vendidosTexto: '',
    avaliacaoNota: '',
    avaliacaoQtd: '',
    lojaOficial: '',
    parcelamentoTexto: '',
    entregaTexto: ''
  };

  if (!htmlProduto) return resultado;

  // 1. Fotos em Ultra-HD da galeria lateral do produto (atributo data-zoom ou ui-pdp-gallery)
  const zoomMatches = [
    ...htmlProduto.matchAll(/data-zoom=["'](https:\/\/http2\.mlstatic\.com\/[^"']+)["']/gi)
  ].map(m => m[1]);

  if (zoomMatches.length > 0) {
    resultado.fotosGaleria = [...new Set(zoomMatches)].slice(0, 8);
  } else {
    // Busca fotos dentro do bloco ui-pdp-gallery
    const galleryBlock = htmlProduto.match(/class=["'][^"']*ui-pdp-gallery[^"']*["'][\s\S]{0,12000}/i);
    if (galleryBlock) {
      const imgs = [
        ...galleryBlock[0].matchAll(/https:\/\/http2\.mlstatic\.com\/D_(?:NQ_)?Q?_?NP_(?:2X_)?[A-Za-z0-9_-]+\.(?:webp|jpg|png)/gi)
      ].map(m => normalizarImagemML(m[0]).replace(/-[A-Z]\.(webp|jpg|png)$/i, '-O.$1'));
      const unicas = [];
      const vistos = new Set();
      for (const u of imgs) {
        const base = u.replace(/-[A-Z0-9]+\.(webp|jpg|png)$/i, '');
        if (!vistos.has(base)) {
          vistos.add(base);
          unicas.push(u);
        }
        if (unicas.length >= 8) break;
      }
      resultado.fotosGaleria = unicas;
    }
  }

  // 2. "O que você precisa saber sobre este produto" (bullet points da ficha técnica)
  const specsMatches = [
    ...htmlProduto.matchAll(/<li[^>]*class=["'][^"']*(?:ui-vpp-highlighted-specs__features-list-item|ui-pdp-features__item)[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi)
  ];
  for (const m of specsMatches) {
    const texto = limparEntidadesHtml(m[1]);
    if (texto && texto.length > 3 && resultado.caracteristicas.length < 10) {
      resultado.caracteristicas.push(texto);
    }
  }

  // Fallback para características em tabela/atributos se não houver lista de bullets
  if (resultado.caracteristicas.length === 0) {
    const attrMatches = [
      ...htmlProduto.matchAll(/class=["'][^"']*ui-vpp-striped-specs__row[^"']*["'][\s\S]{0,400}?<th[^>]*>([\s\S]*?)<\/th>[\s\S]{0,400}?<td[^>]*>([\s\S]*?)<\/td>/gi)
    ];
    for (const m of attrMatches) {
      const chave = limparEntidadesHtml(m[1]);
      const valor = limparEntidadesHtml(m[2]);
      if (chave && valor && resultado.caracteristicas.length < 8) {
        resultado.caracteristicas.push(`${chave}: ${valor}`);
      }
    }
  }

  // 3. "Novo | +100 mil vendidos" (ui-pdp-subtitle)
  const subtitleMatch = htmlProduto.match(/<span[^>]*class=["'][^"']*ui-pdp-subtitle[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (subtitleMatch && subtitleMatch[1]) {
    resultado.vendidosTexto = limparEntidadesHtml(subtitleMatch[1]);
  }

  // 4. Nota das Estrelas (ex: 4.9) e Quantidade de Avaliações (ex: (40249))
  const ratingMatch = htmlProduto.match(/<span[^>]*class=["'][^"']*ui-pdp-review__rating[^"']*["'][^>]*>([\d.,]+)<\/span>/i);
  if (ratingMatch && ratingMatch[1]) {
    resultado.avaliacaoNota = limparEntidadesHtml(ratingMatch[1]);
  }
  const ratingAmountMatch = htmlProduto.match(/<span[^>]*class=["'][^"']*ui-pdp-review__amount[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (ratingAmountMatch && ratingAmountMatch[1]) {
    resultado.avaliacaoQtd = limparEntidadesHtml(ratingAmountMatch[1]);
  }

  // 5. Loja Oficial / Vendedor (ex: "Loja oficial Voolt3D")
  const sellerMatch =
    htmlProduto.match(/Acesse a Loja Oficial de ([^<"]+)/i) ||
    htmlProduto.match(/class=["'][^"']*ui-pdp-seller__header__title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (sellerMatch && sellerMatch[1]) {
    resultado.lojaOficial = limparEntidadesHtml(sellerMatch[1]);
  }

  // 6. Parcelamento real (ex: "ou R$ 104,90 em outros meios" / "4x R$ 29,75 sem juros")
  const installmentsMatch =
    htmlProduto.match(/class=["'][^"']*ui-pdp-price__subtitles[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    htmlProduto.match(/class=["'][^"']*poly-price__installments[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (installmentsMatch && installmentsMatch[1]) {
    resultado.parcelamentoTexto = limparEntidadesHtml(installmentsMatch[1]);
  }

  return resultado;
}

/**
 * Rota chamada quando o usuário CLICA num produto para ver mais fotos e a ficha completa
 */
async function buscarDetalhesCompletosSobDemanda(linkMeli, mlToken) {
  const linkLimpo = (linkMeli || '').trim();
  if (!urlEhSegura(linkLimpo)) return null;

  const cached = detalheCache.get(linkLimpo);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
  };

  try {
    // 1. Abre o link meli.la (que cai na página /social/ ou direto no produto)
    const respSocial = await fetchComTimeout(linkLimpo, { method: 'GET', redirect: 'follow', headers }, 4500);
    const urlSocial = respSocial.url || '';
    const htmlSocial = await respSocial.text();

    let htmlProdutoCompleto = htmlSocial;

    // 2. Se caiu na página /social/, descobre o link do botão "Ir para produto" do 1º card
    if (urlSocial.includes('/social/')) {
      let urlProdutoDireto = '';

      // Procura o href do 1º produto recomendado (poly-component__title ou botão Ir para produto)
      const linkCardMatch =
        htmlSocial.match(/<a[^>]+class=["'][^"']*poly-component__title[^"']*["'][^>]+href=["']([^"']+)["']/i) ||
        htmlSocial.match(/<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*poly-component__title/i) ||
        htmlSocial.match(/href=["'](https:\/\/(?:www\.|produto\.|click1\.)?mercadolivre\.com\.br\/[^"'\s<>]+)["']/i);

      if (linkCardMatch && linkCardMatch[1]) {
        const candidateUrl = linkCardMatch[1].replace(/&amp;/g, '&');
        if (urlEhSegura(candidateUrl) && !candidateUrl.includes('/social/')) {
          urlProdutoDireto = candidateUrl;
        }
      }

      // Se encontrou o link direto da página do produto, abre ela para pegar as 6+ fotos e a ficha técnica!
      if (urlProdutoDireto) {
        try {
          const respProd = await fetchComTimeout(
            urlProdutoDireto,
            { method: 'GET', redirect: 'follow', headers },
            4500
          );
          if (respProd.ok) {
            htmlProdutoCompleto = await respProd.text();
          }
        } catch (e) {}
      }
    }

    const detalhes = extrairDadosDaPaginaCompletaML(htmlProdutoCompleto);

    // Também tenta complementar com a API pública se houver código MLB
    const mlbMatch = htmlProdutoCompleto.match(/MLB-?(\d{8,12})/i);
    if (mlbMatch) {
      const mlbId = `MLB${mlbMatch[1]}`;
      const apiHeaders = { ...headers };
      if (mlToken) apiHeaders['Authorization'] = `Bearer ${mlToken}`;
      try {
        const apiResp = await fetchComTimeout(
          `https://api.mercadolibre.com/items/${mlbId}`,
          { headers: apiHeaders },
          2500
        );
        if (apiResp.ok) {
          const itemData = await apiResp.json();
          if (Array.isArray(itemData.pictures) && itemData.pictures.length > detalhes.fotosGaleria.length) {
            detalhes.fotosGaleria = itemData.pictures
              .slice(0, 8)
              .map(p => p.secure_url || p.url)
              .filter(Boolean);
          }
          if (detalhes.caracteristicas.length === 0 && Array.isArray(itemData.attributes)) {
            detalhes.caracteristicas = itemData.attributes
              .filter(a => a && a.name && a.value_name)
              .slice(0, 8)
              .map(a => `${a.name}: ${a.value_name}`);
          }
        }
      } catch (e) {}
    }

    detalheCache.set(linkLimpo, { timestamp: Date.now(), data: detalhes });
    return detalhes;
  } catch (err) {
    return null;
  }
}

async function extrairDadosDoLinkMeli(itemConfig, mlToken) {
  const numFormatado = String(itemConfig.numero || '01').padStart(2, '0');
  const linkLimpo = (itemConfig.linkMercadoLivre || '').trim();

  if (!urlEhSegura(linkLimpo)) {
    return null;
  }

  const cached = itemCache.get(linkLimpo);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
  };

  const apiHeaders = { ...headers };
  if (mlToken) {
    apiHeaders['Authorization'] = `Bearer ${mlToken}`;
  }

  try {
    const resp = await fetchComTimeout(
      linkLimpo,
      {
        method: 'GET',
        redirect: 'follow',
        headers
      },
      4200
    );

    const finalUrl = decodeURIComponent(resp.url || '');
    const html = await resp.text();

    let titulo = '';
    let imagemUrl = '';
    let fotosGaleria = [];
    let caracteristicas = [];
    let vendidosTexto = '';
    let avaliacaoNota = '';
    let avaliacaoQtd = '';
    let lojaOficial = '';
    let parcelamentoTexto = '';
    let precoAtualNum = null;
    let precoAntigoNum = null;
    let temBlackFridayNoAnuncio = /black\s*friday/i.test(html);

    // Se a página já tiver dados de ficha técnica, já extrai
    const extraInicial = extrairDadosDaPaginaCompletaML(html);
    if (extraInicial.fotosGaleria.length > 0) fotosGaleria = extraInicial.fotosGaleria;
    if (extraInicial.caracteristicas.length > 0) caracteristicas = extraInicial.caracteristicas;
    if (extraInicial.vendidosTexto) vendidosTexto = extraInicial.vendidosTexto;
    if (extraInicial.avaliacaoNota) avaliacaoNota = extraInicial.avaliacaoNota;
    if (extraInicial.avaliacaoQtd) avaliacaoQtd = extraInicial.avaliacaoQtd;
    if (extraInicial.lojaOficial) lojaOficial = extraInicial.lojaOficial;
    if (extraInicial.parcelamentoTexto) parcelamentoTexto = extraInicial.parcelamentoTexto;

    // 1. Se tiver código MLB do anúncio, busca os dados oficiais
    const mlbMatch =
      finalUrl.match(/MLB-?(\d{8,12})/i) ||
      html.match(/MLB-?(\d{8,12})/i);

    if (mlbMatch) {
      const mlbId = `MLB${mlbMatch[1]}`;
      try {
        const apiResp = await fetchComTimeout(
          `https://api.mercadolibre.com/items/${mlbId}`,
          { headers: apiHeaders },
          2800
        );
        if (apiResp.ok) {
          const data = await apiResp.json();
          if (tituloEhValido(data.title)) titulo = data.title;
          if (Array.isArray(data.pictures) && data.pictures.length > 0) {
            fotosGaleria = data.pictures
              .slice(0, 8)
              .map(p => p.secure_url || p.url)
              .filter(Boolean);
            imagemUrl = fotosGaleria[0] || '';
          } else if (data.thumbnail) {
            imagemUrl = normalizarImagemML(data.thumbnail);
            if (fotosGaleria.length === 0) fotosGaleria = [imagemUrl];
          }
          if (typeof data.price === 'number') precoAtualNum = data.price;
          if (typeof data.original_price === 'number') precoAntigoNum = data.original_price;
          if (caracteristicas.length === 0 && Array.isArray(data.attributes)) {
            caracteristicas = data.attributes
              .filter(a => a && a.name && a.value_name)
              .slice(0, 8)
              .map(a => `${a.name}: ${a.value_name}`);
          }
          if (Array.isArray(data.tags) && data.tags.some(t => /black_friday/i.test(t))) {
            temBlackFridayNoAnuncio = true;
          }
        }
      } catch (e) {}
    }

    // 2. Extração do Título real na página do link
    if (!tituloEhValido(titulo)) {
      const candidatosTitulo = [
        (html.match(/class=["'][^"']*poly-component__title[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|h[1-6]|span)>/i) || [])[1],
        (html.match(/<h[1-4][^>]*class=["'][^"']*ui-pdp-title[^"']*["'][^>]*>([\s\S]*?)<\/h[1-4]>/i) || [])[1],
        (html.match(/<img[^>]+src=["']https:\/\/http2\.mlstatic\.com\/D_[^"']+["'][^>]+alt=["']([^"']{8,220})["']/i) || [])[1],
        (html.match(/<img[^>]+alt=["']([^"']{8,220})["'][^>]+src=["']https:\/\/http2\.mlstatic\.com\/D_[^"']+["']/i) || [])[1],
        (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || [])[1],
        (html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) || [])[1],
        (html.match(/"title"\s*:\s*"([^"\\]{10,200})"/) || [])[1]
      ];

      for (const bruto of candidatosTitulo) {
        if (!bruto) continue;
        const limpo = limparEntidadesHtml(bruto).replace(/\s*[-|]\s*Mercado\s*Livre.*/i, '');
        if (tituloEhValido(limpo)) {
          titulo = limpo;
          break;
        }
      }
    }

    // 3. Imagem Principal Real do Link
    if (!imagemUrl) {
      if (fotosGaleria.length > 0) {
        imagemUrl = fotosGaleria[0];
      } else {
        const imgMatch =
          html.match(/https:\/\/http2\.mlstatic\.com\/D_(?:NQ_)?Q?_?NP_(?:2X_)?[A-Za-z0-9_-]+\.(?:webp|jpg|png)/i) ||
          html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

        if (imgMatch) {
          const rawUrl = imgMatch[1] || imgMatch[0];
          imagemUrl = normalizarImagemML(rawUrl);
          fotosGaleria = [imagemUrl];
        }
      }
    }

    // 4. Preço Atual e Preço Antigo Reais do Link
    if (!precoAtualNum) {
      const fractionMatches = [
        ...html.matchAll(/andes-money-amount__fraction[^>]*>([\d.]+)<\/span>(?:[\s\S]{0,120}?andes-money-amount__cents[^>]*>(\d{2})<\/span>)?/gi)
      ];
      if (fractionMatches.length > 0) {
        const parsedPrices = fractionMatches
          .map(m => {
            const intPart = (m[1] || '0').replace(/\./g, '');
            const centsPart = m[2] || '00';
            return parseFloat(`${intPart}.${centsPart}`);
          })
          .filter(n => !isNaN(n) && n > 0);

        if (parsedPrices.length >= 2 && parsedPrices[0] > parsedPrices[1]) {
          precoAntigoNum = parsedPrices[0];
          precoAtualNum = parsedPrices[1];
        } else if (parsedPrices.length >= 1) {
          precoAtualNum = parsedPrices[0];
        }
      } else {
        const priceJsonMatch = html.match(/"price"\s*:\s*(\d+(?:\.\d+)?)/);
        if (priceJsonMatch) {
          precoAtualNum = parseFloat(priceJsonMatch[1]);
        }
      }
    }

    const formatBRL = valor =>
      valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const precoAtual = precoAtualNum ? formatBRL(precoAtualNum) : 'Ver no Mercado Livre';
    let precoAntigo = '';
    let descontoTag = '';

    if (precoAntigoNum && precoAtualNum && precoAntigoNum > precoAtualNum) {
      precoAntigo = formatBRL(precoAntigoNum);
      const pct = Math.round(((precoAntigoNum - precoAtualNum) / precoAntigoNum) * 100);
      descontoTag = temBlackFridayNoAnuncio ? `${pct}% OFF BLACK FRIDAY` : `${pct}% OFF`;
    } else if (temBlackFridayNoAnuncio) {
      descontoTag = 'BLACK FRIDAY';
    }

    const TemTituloReal = tituloEhValido(titulo);
    const tituloFinal = TemTituloReal
      ? titulo
      : `Produto #${numFormatado} — Clique para Ver no Mercado Livre`;
    const categoriaFinal = detectarCategoriaAutomatica(tituloFinal, itemConfig.categoria);
    const imgFinal =
      imagemUrl ||
      'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years_v2.png';

    const resultado = {
      numero: numFormatado,
      categoria: categoriaFinal,
      titulo: tituloFinal,
      descricao: itemConfig.descricao || '',
      imagemUrl: imgFinal,
      fotosGaleria: fotosGaleria.length > 0 ? fotosGaleria : [imgFinal],
      caracteristicas,
      vendidosTexto,
      avaliacaoNota,
      avaliacaoQtd,
      lojaOficial,
      precoAntigo,
      precoAtual,
      parcelamento: parcelamentoTexto || 'Condição oficial no site ou app do Mercado Livre',
      descontoTag,
      temBlackFriday: temBlackFridayNoAnuncio,
      linkMercadoLivre: linkLimpo,
      codigoBuscaML: itemConfig.codigoBuscaML || ''
    };

    if (TemTituloReal && imagemUrl) {
      itemCache.set(linkLimpo, { timestamp: Date.now(), data: resultado });
    }

    return resultado;
  } catch (err) {
    return {
      numero: numFormatado,
      categoria: itemConfig.categoria || 'Geral',
      titulo: `Produto #${numFormatado}`,
      descricao: '',
      imagemUrl:
        'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years_v2.png',
      fotosGaleria: [
        'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years_v2.png'
      ],
      caracteristicas: [],
      vendidosTexto: '',
      avaliacaoNota: '',
      avaliacaoQtd: '',
      lojaOficial: '',
      precoAntigo: '',
      precoAtual: 'Ver no Mercado Livre',
      parcelamento: '',
      descontoTag: '',
      temBlackFriday: false,
      linkMercadoLivre: linkLimpo,
      codigoBuscaML: itemConfig.codigoBuscaML || ''
    };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido. Use apenas GET.' });
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');

  const mlToken = await obterTokenOficialMercadoLivre();

  // MODO 1: Quando o cliente CLICA num produto (?detalhe=1&link=https://meli.la/...)
  // Busca todas as fotos da galeria + "O que você precisa saber sobre este produto" + Vendidos!
  if (req.query.detalhe && req.query.link) {
    const detalhes = await buscarDetalhesCompletosSobDemanda(req.query.link, mlToken);
    return res.status(200).json({
      ok: Boolean(detalhes),
      detalhes: detalhes || { fotosGaleria: [], caracteristicas: [] }
    });
  }

  // MODO 2: Lista de cards para a vitrine principal em lotes rápidos
  const todosOsLinks = await obterListaDeLinks();
  const tamanhoLote = Math.min(Math.max(parseInt(req.query.tamanho || '12', 10), 1), 20);
  const loteAtual = parseInt(req.query.lote || '0', 10);

  let linksParaProcessar = todosOsLinks;
  let totalLotes = Math.ceil(todosOsLinks.length / tamanhoLote);

  if (loteAtual > 0) {
    const inicio = (loteAtual - 1) * tamanhoLote;
    linksParaProcessar = todosOsLinks.slice(inicio, inicio + tamanhoLote);
  }

  const resultados = [];
  const subLoteParalelo = 6;

  for (let i = 0; i < linksParaProcessar.length; i += subLoteParalelo) {
    const fatia = linksParaProcessar.slice(i, i + subLoteParalelo);
    const dadosFatia = await Promise.all(
      fatia.map(item => extrairDadosDoLinkMeli(item, mlToken))
    );
    resultados.push(...dadosFatia.filter(Boolean));
  }

  return res.status(200).json({
    totalGeral: todosOsLinks.length,
    lote: loteAtual || 1,
    totalLotes,
    totalRetornado: resultados.length,
    produtos: resultados
  });
};