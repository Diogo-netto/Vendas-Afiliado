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
  {
    numero: '01',
    categoria: 'Impressão 3D & Tech',
    linkMercadoLivre: 'https://meli.la/1fHMNJY',
    codigoBuscaML: '2WT0PJ-NL8A'
  }
  // Você pode colocar seus 100 links aqui OU buscá-los direto do seu Firebase!
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
 * Obtém automaticamente o Access Token oficial do Mercado Livre Developers
 * usando ML_APP_ID e ML_CLIENT_SECRET salvos no Cofre da Vercel (Environment Variables)
 */
async function obterTokenOficialMercadoLivre() {
  // 1. Se você salvou um token direto em ML_ACCESS_TOKEN na Vercel:
  if (process.env.ML_ACCESS_TOKEN) {
    return process.env.ML_ACCESS_TOKEN;
  }

  // 2. Se você salvou ML_APP_ID e ML_CLIENT_SECRET do DevCenter na Vercel,
  //    gera e renova o token sozinho a cada 6 horas:
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
 * Opcional: Se você já usa Firebase, basta colocar a URL do seu Realtime Database
 * na variável `FIREBASE_DB_URL` lá na Vercel para puxar a lista de links do Firebase!
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

    const finalUrl = resp.url || '';
    const html = await resp.text();

    const mlbMatch =
      finalUrl.match(/MLB-?(\d{7,12})/i) ||
      html.match(/MLB-?(\d{7,12})/i);

    let titulo = '';
    let imagemUrl = '';
    let precoAtualNum = null;
    let precoAntigoNum = null;

    // 1. Consulta a API Oficial do Mercado Livre (autenticada com seu Token Oficial se configurado)
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

    // 2. Fallback automático caso o link redirecione para a vitrine Social (/social/...)
    if (!titulo) {
      const ogTitle =
        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<h3[^>]*class=["'][^"']*poly-component__title[^"']*["'][^>]*>([^<]+)<\/h3>/i) ||
        html.match(/<h1[^>]*class=["'][^"']*ui-pdp-title[^"']*["'][^>]*>([^<]+)<\/h1>/i) ||
        html.match(/<title>([^<|]+)/i);

      if (ogTitle && ogTitle[1]) {
        titulo = ogTitle[1]
          .replace(/\s*\|\s*Mercado\s*Livre.*/i, '')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .trim();
      }
    }

    if (!imagemUrl) {
      const imgMatch =
        html.match(/https:\/\/http2\.mlstatic\.com\/D_NQ_NP_[A-Za-z0-9_-]+\.(?:webp|jpg|png)/i) ||
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);

      if (imgMatch) {
        imagemUrl = imgMatch[1] || imgMatch[0];
      }
    }

    if (!precoAtualNum) {
      const priceJsonMatch = html.match(/"price"\s*:\s*(\d+(?:\.\d+)?)/);
      if (priceJsonMatch) {
        precoAtualNum = parseFloat(priceJsonMatch[1]);
      } else {
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

    return {
      numero: String(itemConfig.numero).padStart(2, '0'),
      categoria: itemConfig.categoria || 'Achadinhos do Dia',
      titulo: titulo || `Oferta Selecionada #${itemConfig.numero}`,
      descricao:
        itemConfig.descricao ||
        'Produto verificado com compra segura e envio rápido pelo Mercado Livre.',
      imagemUrl:
        imagemUrl ||
        'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years_v2.png',
      precoAntigo,
      precoAtual,
      parcelamento: 'Condição especial no Pix ou parcelado no App',
      descontoTag,
      linkMercadoLivre: itemConfig.linkMercadoLivre,
      codigoBuscaML: itemConfig.codigoBuscaML || '',
      avaliacoesTexto: '4.9 ★ Recomendação Verificada',
      beneficios: [
        'Envio Full rápido para todo o Brasil',
        'Compra Garantida direto no app oficial'
      ]
    };
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido. Use apenas GET.' });
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  const now = Date.now();
  if (memoryCache.produtos.length > 0 && now - memoryCache.timestamp < CACHE_TTL_MS) {
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
}