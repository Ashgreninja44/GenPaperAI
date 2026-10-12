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

const DEFAULT_PRODUCTION_URL = "https://genpaperai.pages.dev";

function getBaseUrl(req: express.Request): string {
  // If APP_URL or PUBLIC_URL is explicitly set in deployment environment
  const envUrl = (process.env.APP_URL || process.env.PUBLIC_URL || process.env.VITE_APP_URL || '').trim().replace(/\/+$/, '');
  if (envUrl && !envUrl.includes('ais-dev-') && !envUrl.includes('ais-pre-') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Derive dynamically from request headers if on a custom domain or cloudflare pages
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = (typeof forwardedHost === 'string' ? forwardedHost.split(',')[0].trim() : req.get('host')) || '';
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('ais-dev-') && !host.includes('ais-pre-')) {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto = (typeof forwardedProto === 'string' ? forwardedProto.split(',')[0].trim() : req.protocol) || 'https';
    return `${proto}://${host}`.replace(/\/+$/, '');
  }
  
  return DEFAULT_PRODUCTION_URL;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

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

  function normalizeModel(modelName?: string): string {
    if (!modelName) return 'gemini-3.8-flash';
    const m = modelName.trim().toLowerCase();
    if (m === 'gemini-2.5-flash' || m === 'gemini-3-flash-preview' || m === 'gemini-3.7-flash' || m.includes('flash-preview')) {
      return 'gemini-3.8-flash';
    }
    return modelName;
  }

  // API Route for Gemini Proxy (Server-side model generation)
  app.post(['/api/ai/generateContent', '/api/ai/generateContent/', '/api/ai/generate', '/api/gemini/generate'], async (req: any, res: any) => {
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

      const targetModel = normalizeModel(model);
      const ai = getAiInstance(key);

      // If an image model was specifically requested, handle potential free-tier quota limits (limit: 0)
      if (typeof targetModel === 'string' && (targetModel.includes('image') || targetModel === 'gemini-3.1-flash-lite-image')) {
        try {
          const response = await ai.models.generateContent({
            model: targetModel,
            contents,
            config: effectiveConfig
          });
          return res.json({
            text: response.text,
            candidates: response.candidates || null
          });
        } catch (imgErr: any) {
          console.info(`[Backend Gemini Proxy] Model '${targetModel}' failed (${imgErr?.status || imgErr?.message || 'unavailable'}). Automatically generating vector SVG diagram via gemini-3.7-flash.`);
          try {
            // Extract text prompt from contents
            let promptText = '';
            if (typeof contents === 'string') {
              promptText = contents;
            } else if (contents?.parts && Array.isArray(contents.parts)) {
              promptText = contents.parts.map((p: any) => p.text || '').join(' ');
            } else if (Array.isArray(contents)) {
              promptText = contents.map((c: any) => c?.parts?.map((p: any) => p.text || '').join(' ') || '').join(' ');
            }

            const svgPrompt = `Generate a clean, high-precision academic examination SVG vector diagram for:
${promptText}

Requirements:
- Return ONLY valid, complete SVG code starting with <svg and ending with </svg>.
- White background (<rect width="100%" height="100%" fill="white"/>), clean black vector lines (stroke="#111827", stroke-width="2"), high contrast.
- Clear labels (A, B, C, dimensions, angles) matching the prompt.
- viewBox="0 0 500 350".`;

            const fallbackResp = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: svgPrompt,
              config: { temperature: 0.2 }
            });

            const svgText = fallbackResp.text || '';
            const svgMatch = svgText.match(/<svg[\s\S]*?<\/svg>/i);
            const finalSvg = svgMatch 
              ? svgMatch[0] 
              : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350"><rect width="100%" height="100%" fill="white"/><text x="250" y="175" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#374151">Academic Diagram: ${promptText.slice(0, 50)}</text></svg>`;
            
            const base64Data = Buffer.from(finalSvg).toString('base64');
            return res.json({
              text: finalSvg,
              candidates: [{
                content: {
                  parts: [{
                    inlineData: {
                      mimeType: 'image/svg+xml',
                      data: base64Data
                    }
                  }]
                }
              }]
            });
          } catch (fallbackErr: any) {
            console.warn("[Backend Gemini Proxy] SVG fallback generation failed, returning schematic SVG placeholder:", fallbackErr?.message);
            const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350"><rect width="100%" height="100%" fill="white" stroke="#e5e7eb"/><text x="250" y="175" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#374151">Academic Diagram</text></svg>`;
            const base64Data = Buffer.from(finalSvg).toString('base64');
            return res.json({
              text: finalSvg,
              candidates: [{
                content: {
                  parts: [{
                    inlineData: {
                      mimeType: 'image/svg+xml',
                      data: base64Data
                    }
                  }]
                }
              }]
            });
          }
        }
      }

      let response;
      const executeWithRetry = async (modelToUse: string) => {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            return await ai.models.generateContent({
              model: modelToUse,
              contents,
              config: effectiveConfig
            });
          } catch (err: any) {
            const errStr = String(err?.message || '').toLowerCase();
            const isNetworkOrTransient = 
              errStr.includes('fetch failed') ||
              errStr.includes('econnreset') ||
              errStr.includes('etimedout') ||
              errStr.includes('econnrefused') ||
              err?.status === 503 || err?.status === 429;
            
            if (isNetworkOrTransient && attempt < 3) {
              console.warn(`[Backend Gemini Proxy] Attempt ${attempt} for model '${modelToUse}' failed (${err?.message || 'transient'}). Retrying in ${600 * attempt}ms...`);
              await new Promise(r => setTimeout(r, 600 * attempt));
              continue;
            }
            throw err;
          }
        }
        throw new Error("Max execution attempts reached");
      };

      try {
        response = await executeWithRetry(targetModel);
      } catch (primaryErr: any) {
        const isUnavailable = primaryErr?.status === 503 || 
                              primaryErr?.status === 429 ||
                              String(primaryErr?.message || '').includes('503') ||
                              String(primaryErr?.message || '').includes('UNAVAILABLE') ||
                              String(primaryErr?.message || '').includes('high demand') ||
                              String(primaryErr?.message || '').includes('RESOURCE_EXHAUSTED') ||
                              String(primaryErr?.message || '').toLowerCase().includes('fetch failed');
        if (isUnavailable) {
          const fallbackModel = targetModel === 'gemini-3.8-flash' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';
          console.info(`[Backend Gemini Proxy] Model '${targetModel}' unavailable/failed (${primaryErr?.message}), automatically falling back to '${fallbackModel}'...`);
          try {
            response = await executeWithRetry(fallbackModel);
          } catch (secondaryErr: any) {
            throw secondaryErr;
          }
        } else {
          throw primaryErr;
        }
      }
      
      res.json({
        text: response.text,
        candidates: response.candidates || null
      });
    } catch (err: any) {
      const isQuota = err?.status === 429 || 
                      err?.message?.includes('429') || 
                      err?.message?.includes('RESOURCE_EXHAUSTED') ||
                      err?.message?.includes('quota');
      if (isQuota) {
        console.info(`[Backend Gemini Proxy] Model '${req.body?.model || 'default'}' rate/quota reached.`);
      } else {
        console.error("[Backend Gemini Proxy Error]:", err?.message || err);
      }
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

  // Explicit 404 handler for any unhandled /api routes so they NEVER fall through to HTML/Vite
  app.use('/api', (req: any, res: any) => {
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
      code: 404,
      status: 'NOT_FOUND'
    });
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
