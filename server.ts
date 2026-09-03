import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

let cachedAi: GoogleGenAI | null = null;
function getAiInstance(apiKey: string): GoogleGenAI {
  if (!cachedAi) {
    cachedAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedAi;
}

const PUBLIC_ROUTES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/guide', priority: '0.9', changefreq: 'weekly' },
  { path: '/curriculum', priority: '0.9', changefreq: 'weekly' },
  { path: '/faq', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.6', changefreq: 'monthly' },
];

function getBaseUrl(req: express.Request): string {
  // If APP_URL or PUBLIC_URL is explicitly set in deployment environment
  const envUrl = (process.env.APP_URL || process.env.PUBLIC_URL || process.env.VITE_APP_URL || '').trim().replace(/\/+$/, '');
  if (envUrl && !envUrl.includes('ais-dev-') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Derive dynamically from request headers (supports custom domains, Cloud Run, reverse proxies)
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = (typeof forwardedProto === 'string' ? forwardedProto.split(',')[0].trim() : req.protocol) || 'https';
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = (typeof forwardedHost === 'string' ? forwardedHost.split(',')[0].trim() : req.get('host')) || 'localhost:3000';
  
  return `${proto}://${host}`.replace(/\/+$/, '');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Dynamic, production-aware sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const today = new Date().toISOString().split('T')[0];
    const urlsXml = PUBLIC_ROUTES.map(r => `  <url>
    <loc>${baseUrl}${r.path ? r.path : '/'}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Dynamic, production-aware robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const robots = `User-agent: *
Allow: /
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /faq
Allow: /guide
Allow: /curriculum

# Disallow private application, admin, and backend endpoints
Disallow: /api/
Disallow: /admin
Disallow: /admin-portal
Disallow: /settings
Disallow: /reset-password

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
  });

  // Serve static files from public (ads.txt, assets, icons)
  app.use(express.static(path.join(process.cwd(), 'public')));
  app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));

  // API Route for Gemini Proxy (Server-side model generation)
  app.post('/api/ai/generateContent', async (req: any, res: any) => {
    try {
      const { model, contents, config, systemInstruction, generationConfig } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(400).json({ error: "GEMINI_API_KEY environment variable is not configured on the backend server." });
      }
      
      const effectiveConfig = config || {
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(generationConfig || {})
      };

      const targetModel = model || 'gemini-3.7-flash';
      const ai = getAiInstance(key);
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: effectiveConfig
      });
      
      res.json({
        text: response.text,
        candidates: response.candidates || null
      });
    } catch (err: any) {
      console.error("[Backend Gemini Proxy Error]:", err);
      const isQuota = err?.status === 429 || 
                      err?.message?.includes('429') || 
                      err?.message?.includes('RESOURCE_EXHAUSTED') ||
                      err?.message?.includes('quota');
      const statusCode = isQuota ? 429 : (err.status || err.statusCode || 500);
      res.status(statusCode).json({ 
        error: err.message || String(err),
        code: statusCode,
        status: isQuota ? 'RESOURCE_EXHAUSTED' : 'INTERNAL_ERROR'
      });
    }
  });

  // API Route for direct, safe server-side web content fetching
  app.post('/api/web/fetch', async (req: any, res: any) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
        return res.status(400).json({ error: "Invalid URL provided. Please provide a valid HTTP or HTTPS URL." });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 GenPaperAI/2.0 (Educational Academic Research)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Website responded with HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status 
        });
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text') && !contentType.includes('html') && !contentType.includes('json') && !contentType.includes('xml')) {
        return res.status(400).json({ error: "Provided URL does not point to readable educational text or HTML content." });
      }

      const html = await response.text();
      res.json({ contents: html, url, ok: true });
    } catch (err: any) {
      console.warn("[Backend Web Fetch Error]:", err.message);
      if (err.name === 'AbortError') {
        return res.status(504).json({ error: "Web request timed out after 8 seconds. The target website may be slow or unreachable." });
      }
      res.status(500).json({ error: err.message || "Failed to fetch webpage content." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
