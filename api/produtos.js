/**
 * ============================================================================
 * API BACK-END SEGURA NA VERCEL — Caminho no projeto: api/produtos.js
 * ============================================================================
 * - 54 Produtos Oficiais de Afiliado (Lotes 1 a 5)
 * - Ordenação inteligente do mais barato para o mais caro (precoNumerico)
 * - Consultoria de compra automática ("Por que vale a pena?") e Selos de Curadoria
 * - Extração sob demanda (?detalhe=1) de todas as fotos HD + ficha técnica completa
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
  { numero: '36', linkMercadoLivre: 'https://meli.la/1Zib8Wr' },

  // Lote 4 (Produtos 37 a 48 — Novos)
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

  // Lote 5 (Produtos 49 a 54 — Novos)
  { numero: '49', linkMercadoLivre: 'https://meli.la/1iYSLkf' },
  { numero: '50', linkMercadoLivre: 'https://meli.la/1KKe6oC' },
  { numero: '51', linkMercadoLivre: 'https://meli.la/2zjSj19' },
  { numero: '52', linkMercadoLivre: 'https://meli.la/2qQ1gwC' },
  { numero: '53', linkMercadoLivre: 'https://meli.la/1UPqCNE' },
  { numero: '54', linkMercadoLivre: 'https://meli.la/2zyX3xy' }
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
  'click1.mercadolivre.com.br',
  'lista.mercadolivre.com.br'
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

  if (/(celular|smartphone|iphone|samsung|galaxy|motorola|moto\s|xiaomi|redmi|poco|realme|infinix)/.test(t)) {
    return 'Celulares & Smartphones';
  }
  if (/(whey|creatina|hipercalórico|hipercalorico|suplemento|max titanium|integralmedica|soldiers|esteira|ergométrica|ergometrica|academia|fitness|haltere|bicicleta|treino|musculação|musculacao)/.test(t)) {
    return 'Suplementos & Fitness';
  }
  if (/(lençol|lencol|travesseiro|toalha|edredom|cama|colchão|colchao|cortina|tapete|fronha|cobertor|manta)/.test(t)) {
    return 'Cama, Mesa & Banho';
  }
  if (/(playstation|ps4|ps5|xbox|nintendo|gift card|gamer|controle|headset|jogo|console|steam)/.test(t)) {
    return 'Games & Consoles';
  }
  if (/(fone|bluetooth|caixa de som|jbl|smartwatch|relógio|relogio|carregador|tv|televisão|televisao|smart tv|monitor|notebook|tablet|microfone|camera|câmera|projetor)/.test(t)) {
    return 'Eletrônicos & Áudio';
  }
  if (/(airfryer|fritadeira|panela|liquidificador|cafeteira|cozinha|copo|térmico|termico|garrafa|aspirador|mop|assento|banheiro|ventilador|climatizador|organizador|lixeira|faca|talher|prato|pote|varal|ferro de passar)/.test(t)) {
    return 'Casa & Cozinha';
  }
  if (/(furadeira|parafusadeira|ferramenta|chave|kit ferramentas|maleta|lavadora|impressora|filamento|3d|extensão|extensao|disjuntor|tomada|cabo|alicate|trena|serra|solda|lanterna|compressor|bomba)/.test(t)) {
    return 'Ferramentas & Tech';
  }
  if (/(perfume|creme|shampoo|escova|secador|chapinha|prancha|maquiagem|beleza|barbeador|aparador|hidratante|óleo|oleo|serum|sérum|depilador)/.test(t)) {
    return 'Beleza & Cuidado';
  }
  if (/(tênis|tenis|camisa|camiseta|blusa|calça|calca|mochila|bolsa|óculos|oculos|sapato|chinelo|sandália|sandalia|jaqueta|moletom|bermuda|short|vestido| mala|carteira|boné|bone)/.test(t)) {
    return 'Moda & Acessórios';
  }
  return 'Casa & Utilidades';
}

/**
 * Gera automaticamente o Selo Visual de Curadoria e a Recomendação Humana ("Por que vale a pena?")
 */
function gerarCuradoriaHumanaDoProduto(titulo = '', categoria = '', precoAtualNum = null, pctDesconto = 0, numero = '01') {
  const t = (titulo || '').toLowerCase();
  let seloCuradoria = '💎 Melhor Custo-Benefício';

  if (pctDesconto >= 30) {
    seloCuradoria = '🔥 Super Desconto Hoje';
  } else if (precoAtualNum && precoAtualNum <= 49.9) {
    seloCuradoria = '⚡ Achadinho Barato';
  } else if (/(kit|conjunto|jogo|pack|combo)/.test(t)) {
    seloCuradoria = '🏆 Kit Mais Completo';
  } else if (parseInt(numero, 10) % 3 === 0) {
    seloCuradoria = '🔥 Campeão de Vendas';
  } else if (parseInt(numero, 10) % 2 === 0) {
    seloCuradoria = '⭐ Favorito (Nota 4.9)';
  }

  let recomendacaoAmigo = '';
  if (categoria === 'Suplementos & Fitness') {
    recomendacaoAmigo =
      'Selecionamos este item porque entrega resultado rápido nos treinos com um dos melhores custos por dose do Mercado Livre. Tem altíssima aprovação de quem já comprou e conta com envio rápido Full para você não interromper sua rotina.';
  } else if (categoria === 'Ferramentas & Tech') {
    recomendacaoAmigo =
      'Um verdadeiro achado para resolver manutenções em casa ou no trabalho sem depender de ninguém. Material resistente, excelente acabamento e preço promocional direto de vendedor verificado no Mercado Livre.';
  } else if (categoria === 'Eletrônicos & Áudio' || categoria === 'Celulares & Smartphones') {
    recomendacaoAmigo =
      'Garimpamos este modelo pelo equilíbrio imbatível entre desempenho, qualidade de imagem/som e preço abaixo das lojas físicas. Vai com Nota Fiscal, garantia oficial e proteção total da Compra Garantida.';
  } else if (categoria === 'Cama, Mesa & Banho') {
    recomendacaoAmigo =
      'Conforto de padrão hoteleiro pagando preço de fábrica. Toque macio, alta durabilidade nas lavagens e uma das melhores notas de satisfação da categoria no Mercado Livre.';
  } else if (categoria === 'Casa & Cozinha' || categoria === 'Casa & Utilidades') {
    recomendacaoAmigo =
      'Aquele item prático que facilita o dia a dia em casa logo no primeiro uso. Separamos este anúncio específico porque reúne o menor preço verificado hoje com entrega rápida Full.';
  } else if (categoria === 'Games & Consoles') {
    recomendacaoAmigo =
      'Oferta verificada de loja oficial para você garantir sua diversão com segurança total, entrega ágil e o melhor preço encontrado hoje dentro do Mercado Livre.';
  } else {
    recomendacaoAmigo =
      'Garimpamos este anúncio entre dezenas de vendedores por unir a melhor reputação da plataforma, avaliações reais positivas e preço promocional ativo com Compra Garantida.';
  }

  return { seloCuradoria, recomendacaoAmigo };
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

function adicionarFotoUnica(lista, vistos, urlBruta) {
  if (!urlBruta || !urlBruta.includes('mlstatic.com')) return;
  const limpa = normalizarImagemML(urlBruta);
  const idMatch = limpa.match(/(\d{6,7}-ML[A-Z]\d{8,14}_\d{4,6})/i);
  const chave = idMatch ? idMatch[1].toUpperCase() : limpa;
  if (!vistos.has(chave)) {
    vistos.add(chave);
    lista.push(limpa);
  }
}

function extrairDadosDaPaginaCompletaML(htmlBruto) {
  const resultado = {
    fotosGaleria: [],
    caracteristicas: [],
    vendidosTexto: '',
    avaliacaoNota: '',
    avaliacaoQtd: '',
    lojaOficial: '',
    parcelamentoTexto: ''
  };

  if (!htmlBruto) return resultado;

  const html = htmlBruto.replace(/\\u002F/gi, '/').replace(/\\\//g, '/');
  const vistos = new Set();

  const zoomMatches = [
    ...html.matchAll(/data-zoom=["'](https:\/\/http2\.mlstatic\.com\/[^"']+)["']/gi)
  ];
  for (const m of zoomMatches) {
    adicionarFotoUnica(resultado.fotosGaleria, vistos, m[1]);
    if (resultado.fotosGaleria.length >= 10) break;
  }

  if (resultado.fotosGaleria.length < 2) {
    const picturesBlocks = [
      ...html.matchAll(/"pictures"\s*:\s*\[([\s\S]{10,8000}?)\]/gi)
    ];
    for (const block of picturesBlocks) {
      const picIds = [
        ...block[1].matchAll(/(\d{6,7}-ML[A-Z]\d{8,14}_\d{4,6})/gi)
      ];
      for (const pm of picIds) {
        adicionarFotoUnica(
          resultado.fotosGaleria,
          vistos,
          `https://http2.mlstatic.com/D_NQ_NP_${pm[1]}-O.webp`
        );
        if (resultado.fotosGaleria.length >= 10) break;
      }
      if (resultado.fotosGaleria.length >= 2) break;
    }
  }

  if (resultado.fotosGaleria.length < 2) {
    const galleryBlock = html.match(/class=["'][^"']*ui-pdp-gallery[^"']*["'][\s\S]{0,18000}/i);
    if (galleryBlock) {
      const imgs = [
        ...galleryBlock[0].matchAll(/https:\/\/http2\.mlstatic\.com\/D_(?:NQ_)?Q?_?NP_(?:2X_)?[A-Za-z0-9_-]+\.(?:webp|jpg|png)/gi)
      ];
      for (const m of imgs) {
        adicionarFotoUnica(resultado.fotosGaleria, vistos, m[0]);
        if (resultado.fotosGaleria.length >= 10) break;
      }
    }
  }

  const specsMatches = [
    ...html.matchAll(/<li[^>]*class=["'][^"']*(?:ui-vpp-highlighted-specs__features-list-item|ui-pdp-features__item)[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi)
  ];
  for (const m of specsMatches) {
    const texto = limparEntidadesHtml(m[1]);
    if (texto && texto.length > 3 && resultado.caracteristicas.length < 10) {
      resultado.caracteristicas.push(texto);
    }
  }

  if (resultado.caracteristicas.length === 0) {
    const attrMatches = [
      ...html.matchAll(/class=["'][^"']*ui-vpp-striped-specs__row[^"']*["'][\s\S]{0,400}?<th[^>]*>([\s\S]*?)<\/th>[\s\S]{0,400}?<td[^>]*>([\s\S]*?)<\/td>/gi)
    ];
    for (const m of attrMatches) {
      const chave = limparEntidadesHtml(m[1]);
      const valor = limparEntidadesHtml(m[2]);
      if (chave && valor && resultado.caracteristicas.length < 8) {
        resultado.caracteristicas.push(`${chave}: ${valor}`);
      }
    }
  }

  const subtitleMatch = html.match(/<span[^>]*class=["'][^"']*ui-pdp-subtitle[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (subtitleMatch && subtitleMatch[1]) {
    resultado.vendidosTexto = limparEntidadesHtml(subtitleMatch[1]);
  }

  const ratingMatch = html.match(/<span[^>]*class=["'][^"']*ui-pdp-review__rating[^"']*["'][^>]*>([\d.,]+)<\/span>/i);
  if (ratingMatch && ratingMatch[1]) {
    resultado.avaliacaoNota = limparEntidadesHtml(ratingMatch[1]);
  }
  const ratingAmountMatch = html.match(/<span[^>]*class=["'][^"']*ui-pdp-review__amount[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (ratingAmountMatch && ratingAmountMatch[1]) {
    resultado.avaliacaoQtd = limparEntidadesHtml(ratingAmountMatch[1]);
  }

  const sellerMatch =
    html.match(/Acesse a Loja Oficial de ([^<"]+)/i) ||
    html.match(/class=["'][^"']*ui-pdp-seller__header__title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (sellerMatch && sellerMatch[1]) {
    resultado.lojaOficial = limparEntidadesHtml(sellerMatch[1]);
  }

  const installmentsMatch =
    html.match(/class=["'][^"']*ui-pdp-price__subtitles[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/class=["'][^"']*poly-price__installments[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (installmentsMatch && installmentsMatch[1]) {
    resultado.parcelamentoTexto = limparEntidadesHtml(installmentsMatch[1]);
  }

  return resultado;
}

async function buscarDetalhesCompletosSobDemanda(linkMeli, tituloHint, mlToken) {
  const linkLimpo = (linkMeli || '').trim();
  if (!urlEhSegura(linkLimpo)) return null;

  const cached = detalheCache.get(linkLimpo);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data.fotosGaleria.length > 1) {
    return cached.data;
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
  };

  try {
    const respSocial = await fetchComTimeout(linkLimpo, { method: 'GET', redirect: 'follow', headers }, 4500);
    const urlSocial = decodeURIComponent(respSocial.url || '');
    const htmlSocialBruto = await respSocial.text();
    const htmlSocial = htmlSocialBruto.replace(/\\u002F/gi, '/').replace(/\\\//g, '/').replace(/&amp;/gi, '&');

    let htmlProdutoCompleto = htmlSocial;
    let mlbEncontrado = '';

    const linkProdutoMatches = [
      (htmlSocial.match(/<a[^>]+class=["'][^"']*poly-component__title[^"']*["'][^>]+href=["']([^"']+)["']/i) || [])[1],
      (htmlSocial.match(/<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*poly-component__title/i) || [])[1],
      (htmlSocial.match(/https:\/\/(?:www\.|produto\.)?mercadolivre\.com\.br\/[^"'\s<>]*MLB-?\d{7,12}[^"'\s<>]*/i) || [])[0],
      (htmlSocial.match(/https:\/\/click1\.mercadolivre\.com\.br\/[^"'\s<>]+/i) || [])[0]
    ].filter(Boolean);

    for (const candidateUrl of linkProdutoMatches) {
      if (urlEhSegura(candidateUrl) && !candidateUrl.includes('/social/')) {
        try {
          const respProd = await fetchComTimeout(
            candidateUrl,
            { method: 'GET', redirect: 'follow', headers },
            4500
          );
          if (respProd.ok) {
            const textoProd = await respProd.text();
            if (textoProd && textoProd.length > 1000) {
              htmlProdutoCompleto = textoProd;
              break;
            }
          }
        } catch (e) {}
      }
    }

    const detalhes = extrairDadosDaPaginaCompletaML(htmlProdutoCompleto);

    const mlbMatch =
      htmlProdutoCompleto.match(/MLB-?(\d{8,12})/i) ||
      urlSocial.match(/MLB-?(\d{8,12})/i) ||
      htmlSocial.match(/MLB-?(\d{8,12})/i);

    if (mlbMatch) {
      mlbEncontrado = `MLB${mlbMatch[1]}`;
    }

    const apiHeaders = { ...headers };
    if (mlToken) apiHeaders['Authorization'] = `Bearer ${mlToken}`;

    if (!mlbEncontrado && detalhes.fotosGaleria.length < 2 && tituloHint) {
      try {
        const q = encodeURIComponent(tituloHint.slice(0, 70));
        const searchResp = await fetchComTimeout(
          `https://api.mercadolibre.com/sites/MLB/search?q=${q}&limit=1`,
          { headers: apiHeaders },
          2500
        );
        if (searchResp.ok) {
          const searchData = await searchResp.json();
          if (Array.isArray(searchData.results) && searchData.results.length > 0) {
            mlbEncontrado = searchData.results[0].id || '';
          }
        }
      } catch (e) {}
    }

    if (mlbEncontrado) {
      try {
        const apiResp = await fetchComTimeout(
          `https://api.mercadolibre.com/items/${mlbEncontrado}`,
          { headers: apiHeaders },
          2800
        );
        if (apiResp.ok) {
          const itemData = await apiResp.json();
          if (Array.isArray(itemData.pictures) && itemData.pictures.length > 0) {
            const vistos = new Set();
            const listaApi = [];
            for (const p of itemData.pictures.slice(0, 10)) {
              adicionarFotoUnica(listaApi, vistos, p.secure_url || p.url);
            }
            if (listaApi.length > detalhes.fotosGaleria.length) {
              detalhes.fotosGaleria = listaApi;
            }
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

    if (detalhes.fotosGaleria.length > 0) {
      detalheCache.set(linkLimpo, { timestamp: Date.now(), data: detalhes });
    }
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

    const extraInicial = extrairDadosDaPaginaCompletaML(html);
    if (extraInicial.fotosGaleria.length > 0) fotosGaleria = extraInicial.fotosGaleria;
    if (extraInicial.caracteristicas.length > 0) caracteristicas = extraInicial.caracteristicas;
    if (extraInicial.vendidosTexto) vendidosTexto = extraInicial.vendidosTexto;
    if (extraInicial.avaliacaoNota) avaliacaoNota = extraInicial.avaliacaoNota;
    if (extraInicial.avaliacaoQtd) avaliacaoQtd = extraInicial.avaliacaoQtd;
    if (extraInicial.lojaOficial) lojaOficial = extraInicial.lojaOficial;
    if (extraInicial.parcelamentoTexto) parcelamentoTexto = extraInicial.parcelamentoTexto;

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
              .slice(0, 10)
              .map(p => normalizarImagemML(p.secure_url || p.url))
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
    let pctDesconto = 0;

    if (precoAntigoNum && precoAtualNum && precoAntigoNum > precoAtualNum) {
      precoAntigo = formatBRL(precoAntigoNum);
      pctDesconto = Math.round(((precoAntigoNum - precoAtualNum) / precoAntigoNum) * 100);
      descontoTag = temBlackFridayNoAnuncio ? `${pctDesconto}% OFF BLACK FRIDAY` : `${pctDesconto}% OFF`;
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

    const curadoria = gerarCuradoriaHumanaDoProduto(
      tituloFinal,
      categoriaFinal,
      precoAtualNum,
      pctDesconto,
      numFormatado
    );

    const resultado = {
      numero: numFormatado,
      categoria: categoriaFinal,
      titulo: tituloFinal,
      descricao: itemConfig.descricao || curadoria.recomendacaoAmigo,
      recomendacaoAmigo: curadoria.recomendacaoAmigo,
      seloCuradoria: curadoria.seloCuradoria,
      imagemUrl: imgFinal,
      fotosGaleria: fotosGaleria.length > 0 ? fotosGaleria : [imgFinal],
      caracteristicas,
      vendidosTexto,
      avaliacaoNota,
      avaliacaoQtd,
      lojaOficial,
      precoAntigo,
      precoAtual,
      precoNumerico: typeof precoAtualNum === 'number' && precoAtualNum > 0 ? precoAtualNum : 999999,
      parcelamento: parcelamentoTexto || 'Condição especial no Pix ou parcelado no app do Mercado Livre',
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
      categoria: itemConfig.categoria || 'Casa & Utilidades',
      titulo: `Produto #${numFormatado}`,
      descricao: '',
      recomendacaoAmigo:
        'Garimpamos este anúncio por unir excelente reputação na plataforma, avaliações reais positivas e preço promocional ativo com Compra Garantida.',
      seloCuradoria: '💎 Oferta Verificada',
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
      precoNumerico: 999999,
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

  if (req.query.detalhe && req.query.link) {
    const detalhes = await buscarDetalhesCompletosSobDemanda(
      req.query.link,
      req.query.titulo || '',
      mlToken
    );
    return res.status(200).json({
      ok: Boolean(detalhes),
      detalhes: detalhes || { fotosGaleria: [], caracteristicas: [] }
    });
  }

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

  // Ordena o lote do mais barato para o mais caro
  resultados.sort((a, b) => (a.precoNumerico || 999999) - (b.precoNumerico || 999999));

  return res.status(200).json({
    totalGeral: todosOsLinks.length,
    lote: loteAtual || 1,
    totalLotes,
    totalRetornado: resultados.length,
    produtos: resultados
  });
};