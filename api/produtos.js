/**
 * ============================================================================
 * API BACK-END SEGURA NA VERCEL — Caminho no projeto: api/produtos.js
 * ============================================================================
 * - 36 produtos configurados em lotes rápidos.
 * - Conversor automático de imagem para ULTRA-HD (D_NQ_NP_2X e sufixo -F / -O)
 *   para a Lupa estilo Mercado Livre nunca embaçar!
 * - Não mistura fotos de outros produtos recomendados na página social.
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
let cachedOAuthToken = {
  token: null,
  expiresAt: 0
};
const CACHE_TTL_MS = 45 * 60 * 1000;

const DOMINIOS_PERMITIDOS = [
  'meli.la',
  'www.mercadolivre.com.br',
  'mercadolivre.com.br',
  'produto.mercadolivre.com.br'
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

/**
 * Converte qualquer miniatura do Mercado Livre (-P, -V, -W, -I, D_Q_NP)
 * para a versão Original em Alta Definição (-O.webp / D_NQ_NP_2X) de ~1200px!
 */
function converterImagemParaUltraHD(url = '') {
  if (!url || !url.includes('mlstatic.com')) return url;
  return url
    .replace('/D_Q_NP_', '/D_NQ_NP_2X_')
    .replace('/D_NQ_NP_', '/D_NQ_NP_2X_')
    .replace(/-[A-Z]\.(webp|jpg|jpeg|png)$/i, '-F.$1');
}

async function fetchComTimeout(url, options = {}, timeoutMs = 4200) {
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
  if (/(whey|creatina|hipercalórico|hipercalorico|suplemento|max titanium|integralmedica|pré treino|pre treino)/.test(t)) {
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
  if (/(airfryer|fritadeira|panela|liquidificador|cafeteira|cozinha|copo|térmico|termico|garrafa|aspirador|mop)/.test(t)) {
    return 'Casa & Cozinha';
  }
  if (/(furadeira|parafusadeira|ferramenta|chave|kit ferramentas|lavadora|impressora|filamento|3d)/.test(t)) {
    return 'Ferramentas & Tech';
  }
  if (/(perfume|creme|shampoo|escova|secador|chapinha|maquiagem|beleza|barbeador)/.test(t)) {
    return 'Beleza & Cuidado';
  }
  if (/(tênis|tenis|camisa|camiseta|blusa|calça|calca|mochila|bolsa|óculos|oculos|sapato)/.test(t)) {
    return 'Moda & Acessórios';
  }
  return 'Ofertas Black Friday';
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
    let precoAtualNum = null;
    let precoAntigoNum = null;

    // 1. Se tiver código MLB do anúncio, busca todas as fotos reais daquele exato produto
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
              .slice(0, 6)
              .map(p => converterImagemParaUltraHD(p.secure_url || p.url))
              .filter(Boolean);
            imagemUrl = fotosGaleria[0] || '';
          } else if (data.thumbnail) {
            imagemUrl = converterImagemParaUltraHD(data.thumbnail);
            fotosGaleria = [imagemUrl];
          }
          if (typeof data.price === 'number') precoAtualNum = data.price;
          if (typeof data.original_price === 'number') precoAntigoNum = data.original_price;
        }
      } catch (e) {}
    }

    // 2. Extração do Título na página Social (/social/...) ou página do Produto
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

    // 3. Imagem Principal em ULTRA-HD (Sem puxar fotos de outros produtos recomendados abaixo!)
    if (fotosGaleria.length === 0) {
      const imgMatch =
        html.match(/https:\/\/http2\.mlstatic\.com\/D_(?:NQ_)?Q?_?NP_[A-Za-z0-9_-]+\.(?:webp|jpg|png)/i) ||
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

      if (imgMatch) {
        const rawUrl = imgMatch[1] || imgMatch[0];
        imagemUrl = converterImagemParaUltraHD(rawUrl);
        fotosGaleria = [imagemUrl];
      }
    }

    // 4. Preço Atual e Preço Antigo
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

    const precoAtual = precoAtualNum ? formatBRL(precoAtualNum) : 'Conferir Oferta';
    let precoAntigo = '';
    let descontoTag = 'BLACK FRIDAY';

    if (precoAntigoNum && precoAtualNum && precoAntigoNum > precoAtualNum) {
      precoAntigo = formatBRL(precoAntigoNum);
      const pct = Math.round(((precoAntigoNum - precoAtualNum) / precoAntigoNum) * 100);
      descontoTag = `${pct}% OFF`;
    }

    const TemTituloReal = tituloEhValido(titulo);
    const tituloFinal = TemTituloReal
      ? titulo
      : `Oferta Black Friday #${numFormatado} — Clique para Ver no Mercado Livre`;
    const categoriaFinal = detectarCategoriaAutomatica(tituloFinal, itemConfig.categoria);
    const imgFinal =
      imagemUrl ||
      'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years_v2.png';

    const resultado = {
      numero: numFormatado,
      categoria: categoriaFinal,
      titulo: tituloFinal,
      descricao:
        itemConfig.descricao ||
        'Oferta selecionada com compra garantida e envio Full pelo Mercado Livre.',
      imagemUrl: imgFinal,
      fotosGaleria: fotosGaleria.length > 0 ? fotosGaleria : [imgFinal],
      precoAntigo,
      precoAtual,
      parcelamento: 'em até 12x ou com desconto extra no Pix',
      descontoTag,
      linkMercadoLivre: linkLimpo,
      codigoBuscaML: itemConfig.codigoBuscaML || '',
      avaliacoesTexto: '4.9 ★ Mais Vendido'
    };

    if (TemTituloReal && imagemUrl) {
      itemCache.set(linkLimpo, { timestamp: Date.now(), data: resultado });
    }

    return resultado;
  } catch (err) {
    return {
      numero: numFormatado,
      categoria: itemConfig.categoria || 'Ofertas Black Friday',
      titulo: `Oferta Especial Black Friday #${numFormatado}`,
      descricao: 'Clique abaixo para abrir o produto com desconto exclusivo no Mercado Livre.',
      imagemUrl:
        'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years_v2.png',
      fotosGaleria: [
        'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years_v2.png'
      ],
      precoAntigo: '',
      precoAtual: 'Ver Preço Hoje',
      parcelamento: 'Desconto exclusivo no aplicativo oficial',
      descontoTag: 'BLACK FRIDAY',
      linkMercadoLivre: linkLimpo,
      codigoBuscaML: itemConfig.codigoBuscaML || '',
      avaliacoesTexto: '4.9 ★ Oferta Verificada'
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

  const [mlToken, todosOsLinks] = await Promise.all([
    obterTokenOficialMercadoLivre(),
    obterListaDeLinks()
  ]);

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