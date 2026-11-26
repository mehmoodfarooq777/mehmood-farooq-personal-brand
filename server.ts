import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_BLOG_POSTS,
  DEFAULT_LIVE_CONTENT,
  normalizeSiteConfig,
  type BlogPost,
  type LiveSiteContent,
} from './src/data/siteConfig.ts';
import {
  buildRobotsTxt,
  buildSitemapXml,
  isAdminPath,
  resolveRouteSeo,
  type ResolvedSeoMeta,
} from './src/lib/seo.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

interface FirebaseAppletConfig {
  projectId?: string;
  firestoreDatabaseId?: string;
}

function loadFirebaseConfig(): FirebaseAppletConfig {
  try {
    const raw = fs.readFileSync(
      path.join(__dirname, 'firebase-applet-config.json'),
      'utf-8'
    );
    return JSON.parse(raw) as FirebaseAppletConfig;
  } catch {
    return {};
  }
}

const FIREBASE_CONFIG = loadFirebaseConfig();

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

function decodeFirestoreValue(val: FirestoreValue | undefined): unknown {
  if (!val) return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map((item) =>
      decodeFirestoreValue(item)
    );
  }
  if ('mapValue' in val) {
    const out: Record<string, unknown> = {};
    const fields = val.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return undefined;
}

function decodeFirestoreDocument(
  fields: Record<string, FirestoreValue> | undefined
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!fields) return result;
  for (const [key, val] of Object.entries(fields)) {
    result[key] = decodeFirestoreValue(val);
  }
  return result;
}

interface CachedSeoData {
  content: LiveSiteContent;
  blogPosts: BlogPost[];
  expiresAt: number;
}

let cachedData: CachedSeoData = {
  content: DEFAULT_LIVE_CONTENT,
  blogPosts: DEFAULT_BLOG_POSTS,
  expiresAt: 0,
};

async function fetchPublicSeoData(): Promise<{
  content: LiveSiteContent;
  blogPosts: BlogPost[];
}> {
  const now = Date.now();
  if (now < cachedData.expiresAt) {
    return { content: cachedData.content, blogPosts: cachedData.blogPosts };
  }

  const projectId = FIREBASE_CONFIG.projectId;
  const databaseId = FIREBASE_CONFIG.firestoreDatabaseId || '(default)';
  if (!projectId) {
    return { content: DEFAULT_LIVE_CONTENT, blogPosts: DEFAULT_BLOG_POSTS };
  }

  const baseApi = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/${encodeURIComponent(databaseId)}/documents`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);

  let nextContent = DEFAULT_LIVE_CONTENT;
  let nextPosts = DEFAULT_BLOG_POSTS;

  try {
    const [configRes, postsRes] = await Promise.all([
      fetch(`${baseApi}/siteConfig/public`, { signal: controller.signal }),
      fetch(`${baseApi}/blogPosts?pageSize=100`, { signal: controller.signal }),
    ]);

    if (configRes.ok) {
      const configJson = (await configRes.json()) as {
        fields?: Record<string, FirestoreValue>;
      };
      if (configJson.fields) {
        nextContent = normalizeSiteConfig(
          decodeFirestoreDocument(configJson.fields)
        );
      }
    }

    if (postsRes.ok) {
      const postsJson = (await postsRes.json()) as {
        documents?: Array<{
          name: string;
          fields?: Record<string, FirestoreValue>;
        }>;
      };
      if (Array.isArray(postsJson.documents) && postsJson.documents.length > 0) {
        const parsedPosts: BlogPost[] = [];
        for (const docItem of postsJson.documents) {
          const obj = decodeFirestoreDocument(docItem.fields);
          if (obj.isPublished === true && typeof obj.slug === 'string') {
            const id = docItem.name.split('/').pop() || obj.slug;
            parsedPosts.push({
              id,
              slug: String(obj.slug),
              title: String(obj.title || ''),
              excerpt: String(obj.excerpt || ''),
              content: String(obj.content || ''),
              category: String(obj.category || 'Entrepreneurship'),
              coverImageUrl: String(obj.coverImageUrl || ''),
              coverImageAlt: String(obj.coverImageAlt || ''),
              seoTitle: String(obj.seoTitle || ''),
              seoDescription: String(obj.seoDescription || ''),
              seoKeywords: String(obj.seoKeywords || ''),
              canonicalUrl: String(obj.canonicalUrl || ''),
              readTimeMinutes: Number(obj.readTimeMinutes) || 4,
              publishedDate: String(obj.publishedDate || ''),
              isPublished: true,
            });
          }
        }
        if (parsedPosts.length > 0) {
          parsedPosts.sort((a, b) =>
            (b.publishedDate || '').localeCompare(a.publishedDate || '')
          );
          nextPosts = parsedPosts;
        }
      }
    }
  } catch {
    // Gracefully fall back to bundled defaults on timeout or network outage
  } finally {
    clearTimeout(timer);
  }

  cachedData = {
    content: nextContent,
    blogPosts: nextPosts,
    expiresAt: now + 30000,
  };

  return { content: nextContent, blogPosts: nextPosts };
}

function getRequestOrigin(req: Request): string {
  const envUrl = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (
    (envUrl.startsWith('https://') || envUrl.startsWith('http://')) &&
    !envUrl.includes('MY_APP_URL')
  ) {
    return envUrl;
  }
  const forwardedProto = req.get('x-forwarded-proto');
  const proto = forwardedProto
    ? forwardedProto.split(',')[0].trim()
    : req.protocol || 'http';
  const host =
    req.get('x-forwarded-host')?.split(',')[0].trim() ||
    req.get('host') ||
    `localhost:${PORT}`;
  return `${proto}://${host}`;
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectRouteSeoIntoHtml(
  html: string,
  meta: ResolvedSeoMeta,
  content: LiveSiteContent
): string {
  let out = html;

  out = out.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtmlText(meta.title)}</title>`
  );

  const replaceMeta = (
    attr: 'name' | 'property',
    key: string,
    val: string
  ) => {
    const regex = new RegExp(
      `<meta\\s+${attr}=["']${key}["'][^>]*\\/?>`,
      'i'
    );
    if (!val) {
      out = out.replace(regex, '');
      return;
    }
    const tag = `<meta ${attr}="${key}" content="${escapeHtmlAttr(val)}" />`;
    if (regex.test(out)) {
      out = out.replace(regex, tag);
    } else {
      out = out.replace('</head>', `    ${tag}\n  </head>`);
    }
  };

  replaceMeta('name', 'description', meta.description);
  replaceMeta('name', 'keywords', meta.keywords);
  replaceMeta('name', 'robots', meta.robots);

  const verificationCode = (content.googleSiteVerification || '').trim();
  if (verificationCode && meta.robots === 'index, follow') {
    replaceMeta('name', 'google-site-verification', verificationCode);
  } else {
    replaceMeta('name', 'google-site-verification', '');
  }

  replaceMeta('property', 'og:type', meta.ogType);
  replaceMeta('property', 'og:title', meta.title);
  replaceMeta('property', 'og:description', meta.description);
  replaceMeta('property', 'og:url', meta.canonicalUrl);
  replaceMeta(
    'property',
    'og:site_name',
    content.brandName || 'Mehmood Farooq'
  );
  replaceMeta('property', 'og:image', meta.ogImageUrl);

  replaceMeta('name', 'twitter:card', 'summary_large_image');
  replaceMeta('name', 'twitter:title', meta.title);
  replaceMeta('name', 'twitter:description', meta.description);
  replaceMeta('name', 'twitter:image', meta.ogImageUrl);

  const canonicalTag = `<link rel="canonical" href="${escapeHtmlAttr(
    meta.canonicalUrl
  )}" />`;
  const canonicalRegex = /<link\s+rel=["']canonical["'][^>]*\/?>/i;
  if (canonicalRegex.test(out)) {
    out = out.replace(canonicalRegex, canonicalTag);
  } else {
    out = out.replace('</head>', `    ${canonicalTag}\n  </head>`);
  }

  const ldJsonRegex =
    /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i;
  if (meta.structuredData) {
    const safeJson = JSON.stringify(meta.structuredData).replace(
      /</g,
      '\\u003c'
    );
    const ldScript = `<script type="application/ld+json">${safeJson}</script>`;
    if (ldJsonRegex.test(out)) {
      out = out.replace(ldJsonRegex, ldScript);
    } else {
      out = out.replace('</head>', `    ${ldScript}\n  </head>`);
    }
  } else {
    out = out.replace(ldJsonRegex, '');
  }

  return out;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);

  // Security & crawl hygiene headers for private admin paths
  app.use((req, res, next) => {
    if (isAdminPath(req.path) || req.path.startsWith('/admin/')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  });

  // Dynamic robots.txt
  app.get('/robots.txt', async (req: Request, res: Response) => {
    const { content } = await fetchPublicSeoData();
    const origin = getRequestOrigin(req);
    res
      .status(200)
      .type('text/plain; charset=utf-8')
      .set('Cache-Control', 'public, max-age=3600')
      .send(buildRobotsTxt(origin, content));
  });

  // Dynamic XML Sitemap
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    const { content, blogPosts } = await fetchPublicSeoData();
    const origin = getRequestOrigin(req);
    res
      .status(200)
      .type('application/xml; charset=utf-8')
      .set('Cache-Control', 'public, max-age=900')
      .send(buildSitemapXml(origin, content, blogPosts));
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use(async (req: Request, res: Response, next) => {
      if ((req.method !== 'GET' && req.method !== 'HEAD') || path.extname(req.path)) {
        return next();
      }
      try {
        const templatePath = path.resolve(__dirname, 'index.html');
        const rawHtml = fs.readFileSync(templatePath, 'utf-8');
        const transformed = await vite.transformIndexHtml(
          req.originalUrl,
          rawHtml
        );
        const { content, blogPosts } = await fetchPublicSeoData();
        const origin = getRequestOrigin(req);
        const meta = resolveRouteSeo(req.path, content, blogPosts, origin);
        const finalHtml = injectRouteSeoIntoHtml(transformed, meta, content);
        res.status(200).type('text/html; charset=utf-8').send(finalHtml);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distDir, {
        index: false,
        maxAge: '7d',
      })
    );

    const distHtmlPath = path.join(distDir, 'index.html');
    app.use(async (req: Request, res: Response, next) => {
      if ((req.method !== 'GET' && req.method !== 'HEAD') || path.extname(req.path)) {
        return next();
      }
      try {
        const rawHtml = fs.readFileSync(distHtmlPath, 'utf-8');
        const { content, blogPosts } = await fetchPublicSeoData();
        const origin = getRequestOrigin(req);
        const meta = resolveRouteSeo(req.path, content, blogPosts, origin);
        const finalHtml = injectRouteSeoIntoHtml(rawHtml, meta, content);
        res
          .status(200)
          .type('text/html; charset=utf-8')
          .set('Cache-Control', isAdminPath(req.path) ? 'no-store' : 'no-cache')
          .send(finalHtml);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
