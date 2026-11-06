/**
 * ============================================================================
 * API BACK-END SEGURA NA VERCEL — Caminho no projeto: api/produtos.js
 * ============================================================================
 * IMPORTANTE SOBRE SEGURANÇA (GITHUB vs VERCEL):
 * - Este arquivo `api/produtos.js` VAI para o GitHub e para a Vercel porque é
 *   a Vercel quem executa este código 24h por dia quando seu PC está desligado.
 * - NENHUMA SENHA OU CHAVE FICA ESCRITA AQUI DENTRO!
 * - Aqui usamos apenas `process.env.ML_APP_ID`, `process.env.ML_CLIENT_SECRET`
 *   e `process.env.ML_ACCESS_TOKEN`.
 * - As chaves reais ficam trancadas no Cofre da Vercel (Settings -> Environment Variables)
 *   ou num arquivo `.env` local (que o `.gitignore` impede de ir para o GitHub).
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
  { numero: '18', linkMercadoLivre: 'https://meli.la/1fHMNJY', codigoBuscaML: '2WT0PJ-NL8A' }
];

// Cache em memória no servidor da Vercel
let memoryCache = {
  timestamp: 0,
  produtos: []
};
let cachedOAuthToken = {
  token: null,
  expiresAt: 0
};
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

// Lista Branca (Allowlist) de domínios permitidos
const DOMINIOS_PERMITIDOS = [
  'meli.la',
  'www.mercadolivre.com.br',
  'mercadolivre.com.br',
  'produto.mercadolivre.com.br'
];

function urlEhSegura(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'https:') return false;
    return DOMINIOS_PERMITIDOS.some(
      d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
    );
  } catch (e) {
    return false;
  }
}

/**
 * Detecta automaticamente a categoria pelo título do produto no Mercado Livre
 * caso você envie apenas o link `meli.la` sem especificar categoria!
 */
function detectarCategoriaAutomatica(titulo = '', categoriaManual = '') {
  if (categoriaManual && categoriaManual.trim()) return categoriaManual.trim();
  const t = titulo.toLowerCase();

  if (/(celular|smartphone|iphone|samsung|galaxy|motorola|moto\s|xiaomi|redmi|poco)/.test(t)) {
    return 'Celulares & Smartphones';
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
  if (/(airfryer|fritadeira|panela|liquidificador|cafeteira|cozinha|copo|térmico|termico|garrafa|aspirador)/.test(t)) {
    return 'Casa & Cozinha';
  }
  if (/(furadeira|parafusadeira|ferramenta|chave|kit ferramentas|lavadora|impressora|filamento|3d)/.test(t)) {
    return 'Ferramentas & Tech';
  }
  if (/(perfume|creme|shampoo|escova|secador|chapinha|maquiagem|beleza|barbeador)/.test(t)) {
    return 'Beleza & Cuidado';
  }
  if (/(tênis|tenis|camisa|camiseta|blusa|calça|calca|mochila|bolsa|óculos|oculos)/.test(t)) {
    return 'Moda & Acessórios';
  }
  return 'Achadinhos em Destaque';
}

/**
 * Obtém automaticamente o Access Token oficial do Mercado Livre Developers
 * usando ML_APP_ID e ML_CLIENT_SECRET salvos no Cofre da Vercel (Environment Variables)
 */
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

    const resp = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

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

/**
 * Opcional: Se você configurar a variável `FIREBASE_DB_URL` na Vercel no próximo passo,
 * puxa os links direto do seu Firebase Realtime Database!
 */
async function obterListaDeLinks() {
  if (process.env.FIREBASE_DB_URL) {
    try {
      const baseUrl = process.env.FIREBASE_DB_URL.replace(/\/$/, '');
      const resp = await fetch(`${baseUrl}/produtos.json`);
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
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extrairDadosDoLinkMeli(itemConfig, mlToken) {
  if (!itemConfig || !urlEhSegura(itemConfig.linkMercadoLivre)) {
    return null;
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
    const resp = await fetch(itemConfig.linkMercadoLivre, {
      method: 'GET',
      redirect: 'follow',
      headers
    });

    const finalUrl = decodeURIComponent(resp.url || '');
    const html = await resp.text();

    let titulo = '';
    let imagemUrl = '';
    let precoAtualNum = null;
    let precoAntigoNum = null;

    // 1. Procura código MLB na URL redirecionada ou no HTML (ex: MLB384920192)
    const mlbMatch =
      finalUrl.match(/MLB-?(\d{8,12})/i) ||
      html.match(/MLB-?(\d{8,12})/i);

    if (mlbMatch) {
      const mlbId = `MLB${mlbMatch[1]}`;
      try {
        const apiResp = await fetch(`https://api.mercadolibre.com/items/${mlbId}`, {
          headers: apiHeaders
        });
        if (apiResp.ok) {
          const data = await apiResp.json();
          titulo = data.title || '';
          if (data.pictures && data.pictures.length > 0) {
            imagemUrl = data.pictures[0].secure_url || data.pictures[0].url || '';
          } else if (data.thumbnail) {
            imagemUrl = data.thumbnail.replace('-I.jpg', '-O.jpg');
          }
          if (typeof data.price === 'number') precoAtualNum = data.price;
          if (typeof data.original_price === 'number') precoAntigoNum = data.original_price;
        }
      } catch (e) {}
    }

    // 2. Extração direta da página Social de Afiliado (/social/...) ou página de Produto
    if (!titulo) {
      const polyTitle =
        html.match(/class=["'][^"']*poly-component__title[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|h[1-4]|span)>/i) ||
        html.match(/<h1[^>]*class=["'][^"']*ui-pdp-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);

      if (polyTitle && polyTitle[1]) {
        const candidate = limparEntidadesHtml(polyTitle[1]).replace(/\s*\|\s*Mercado\s*Livre.*/i, '');
        if (candidate && candidate.toLowerCase() !== 'mercado livre') {
          titulo = candidate;
        }
      }
    }

    if (!imagemUrl) {
      const imgMatch =
        html.match(/https:\/\/http2\.mlstatic\.com\/D_(?:NQ_)?Q?_?NP_[A-Za-z0-9_-]+\.(?:webp|jpg|png)/i) ||
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);

      if (imgMatch) {
        imagemUrl = (imgMatch[1] || imgMatch[0]).replace('D_Q_NP_', 'D_NQ_NP_');
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

    const precoAtual = precoAtualNum ? formatBRL(precoAtualNum) : 'Ver Oferta no App';
    let precoAntigo = '';
    let descontoTag = 'OFERTA VERIFICADA';

    if (precoAntigoNum && precoAtualNum && precoAntigoNum > precoAtualNum) {
      precoAntigo = formatBRL(precoAntigoNum);
      const pct = Math.round(((precoAntigoNum - precoAtualNum) / precoAntigoNum) * 100);
      descontoTag = `${pct}% OFF HOJE`;
    }

    const tituloFinal = titulo || `Oferta Selecionada #${String(itemConfig.numero).padStart(2, '0')}`;
    const categoriaFinal = detectarCategoriaAutomatica(tituloFinal, itemConfig.categoria);

    return {
      numero: String(itemConfig.numero).padStart(2, '0'),
      categoria: categoriaFinal,
      titulo: tituloFinal,
      descricao:
        itemConfig.descricao ||
        'Oferta selecionada com compra garantida e envio rápido pelo aplicativo oficial do Mercado Livre.',
      imagemUrl:
        imagemUrl ||
        'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years_v2.png',
      precoAntigo,
      precoAtual,
      parcelamento: 'Condição especial no Pix ou parcelado no App',
      descontoTag,
      linkMercadoLivre: itemConfig.linkMercadoLivre,
      codigoBuscaML: itemConfig.codigoBuscaML || '',
      avaliacoesTexto: '4.9 ★ Mais Vendido',
      beneficios: [
        'Envio Full rápido para todo o Brasil',
        'Compra Garantida direto no app oficial'
      ]
    };
  } catch (err) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido. Use apenas GET.' });
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  const now = Date.now();
  if (memoryCache.produtos.length > 0 && now - memoryCache.timestamp < CACHE_TTL_MS && !req.query.refresh) {
    return res.status(200).json({
      total: memoryCache.produtos.length,
      cached: true,
      produtos: memoryCache.produtos
    });
  }

  const [mlToken, linksParaProcessar] = await Promise.all([
    obterTokenOficialMercadoLivre(),
    obterListaDeLinks()
  ]);

  const resultados = [];
  const tamanhoLote = 10;

  for (let i = 0; i < linksParaProcessar.length; i += tamanhoLote) {
    const lote = linksParaProcessar.slice(i, i + tamanhoLote);
    const dadosLote = await Promise.all(
      lote.map(item => extrairDadosDoLinkMeli(item, mlToken))
    );
    resultados.push(...dadosLote.filter(Boolean));
  }

  memoryCache = {
    timestamp: now,
    produtos: resultados
  };

  return res.status(200).json({
    total: resultados.length,
    cached: false,
    produtos: resultados
  });
};