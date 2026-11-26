import {
  DEFAULT_BLOG_POSTS,
  type BlogPost,
  type LiveSiteContent,
  type PublicPageKey,
} from '../data/siteConfig.ts';

export interface ResolvedSeoMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImageUrl: string;
  ogType: 'website' | 'profile' | 'article';
  robots: 'index, follow' | 'noindex, nofollow';
  structuredData: Record<string, unknown> | null;
}

export function normalizePathname(pathname: string): string {
  const clean = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return clean || '/';
}

export function isAdminPath(pathname: string): boolean {
  const p = normalizePathname(pathname);
  return p === '/admin' || p === '/admin/login' || p === '/admin/dashboard';
}

export function resolveSiteOrigin(
  siteBaseUrl: string | undefined,
  fallbackOrigin: string
): string {
  const candidate = (siteBaseUrl || '').trim().replace(/\/+$/, '');
  if (candidate.startsWith('https://') || candidate.startsWith('http://')) {
    return candidate;
  }
  return fallbackOrigin.replace(/\/+$/, '');
}

export function resolveAbsoluteAssetUrl(url: string, origin: string): string {
  const clean = (url || '').trim();
  if (!clean) return '';
  if (clean.startsWith('https://') || clean.startsWith('http://')) {
    return clean;
  }
  if (clean.startsWith('data:')) {
    return '';
  }
  if (clean.startsWith('/')) {
    return `${origin}${clean}`;
  }
  return '';
}

/**
 * Only returns true when the URL is a genuine user profile URL rather than
 * a bare social network homepage placeholder (e.g. https://www.linkedin.com/).
 */
export function isGenuineSocialProfileUrl(rawUrl: string): boolean {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname.replace(/\/+$/, '');
    // Reject bare homepages like https://www.instagram.com/
    if (!path || path === '/') {
      return false;
    }
    return path.length >= 2;
  } catch {
    return false;
  }
}

export function collectGenuineSocialUrls(content: LiveSiteContent): string[] {
  const candidates = [
    content.tiktokUrl,
    content.instagramUrl,
    content.linkedinUrl,
    content.facebookUrl,
    ...(content.customSocialLinks || []).map((item) => item.url),
  ];

  const seen = new Set<string>();
  const valid: string[] = [];

  for (const raw of candidates) {
    const clean = (raw || '').trim();
    if (isGenuineSocialProfileUrl(clean) && !seen.has(clean)) {
      seen.add(clean);
      valid.push(clean);
    }
  }
  return valid;
}

function buildCanonical(
  customCanonical: string,
  routePath: string,
  origin: string
): string {
  const trimmed = (customCanonical || '').trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed === '/' ? '/' : trimmed.replace(/\/+$/, '')}`;
  }
  return routePath === '/' ? `${origin}/` : `${origin}${routePath}`;
}

export function buildStructuredDataGraph(
  routePath: string,
  content: LiveSiteContent,
  origin: string,
  pageTitle: string,
  pageDescription: string,
  canonicalUrl: string,
  activePost?: BlogPost
): Record<string, unknown> {
  const personId = `${origin}/#person`;
  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const portraitAbs = resolveAbsoluteAssetUrl(content.heroPortraitUrl, origin);
  const logoAbs = resolveAbsoluteAssetUrl(content.businessLogoUrl, origin);
  const sameAs = collectGenuineSocialUrls(content);

  const personNode: Record<string, unknown> = {
    '@type': 'Person',
    '@id': personId,
    name: content.brandName || 'Mehmood Farooq',
    url: `${origin}/`,
    jobTitle: 'Entrepreneur & Business Owner',
    description: content.heroDescription,
    nationality: {
      '@type': 'Country',
      name: content.location || 'Pakistan',
    },
    founder: { '@id': orgId },
    worksFor: { '@id': orgId },
  };
  if (portraitAbs) {
    personNode.image = portraitAbs;
  }
  if (sameAs.length > 0) {
    personNode.sameAs = sameAs;
  }

  const orgNode: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: content.businessName || 'TITAN ROUTE DISPATCH (TRD) LLC',
    url: content.businessWebsiteUrl || 'https://trdispatch.us/',
    email: content.publicEmail || 'info@trdisaptch.us',
    description: content.businessDescription,
    founder: { '@id': personId },
    location: {
      '@type': 'AdministrativeArea',
      name: `${content.businessState || 'Wyoming, USA'}, ${
        content.businessCountry || 'United States of America'
      }`,
    },
    knowsAbout: content.businessIndustry || 'Trucking and Logistics',
  };
  if (logoAbs) {
    orgNode.logo = logoAbs;
  }

  const websiteNode: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': websiteId,
    name: content.brandName || 'Mehmood Farooq',
    url: `${origin}/`,
    description: content.seoDescription,
    inLanguage: 'en',
    publisher: { '@id': personId },
  };

  const breadcrumbs: Array<{ name: string; item: string }> = [
    { name: 'Home', item: `${origin}/` },
  ];

  const routeNames: Record<string, string> = {
    '/about': 'About Mehmood Farooq',
    '/journey': 'My Entrepreneurial Journey',
    '/business': content.businessName || 'TITAN ROUTE DISPATCH (TRD) LLC',
    '/experience': 'Professional Experience',
    '/contact': 'Contact Me',
    '/blog': 'Blog & Insights',
  };

  if (routePath.startsWith('/blog/') && activePost) {
    breadcrumbs.push({ name: 'Blog & Insights', item: `${origin}/blog` });
    breadcrumbs.push({ name: activePost.title, item: canonicalUrl });
  } else if (routePath !== '/' && routeNames[routePath]) {
    breadcrumbs.push({ name: routeNames[routePath], item: canonicalUrl });
  }

  const breadcrumbNode: Record<string, unknown> = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  };

  const webPageType =
    routePath === '/about'
      ? 'AboutPage'
      : routePath === '/contact'
        ? 'ContactPage'
        : routePath === '/blog'
          ? 'CollectionPage'
          : routePath === '/'
            ? 'ProfilePage'
            : 'WebPage';

  const webPageNode: Record<string, unknown> = {
    '@type': webPageType,
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: { '@id': websiteId },
    about: { '@id': personId },
    breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
  };

  const graph: Record<string, unknown>[] = [
    personNode,
    orgNode,
    websiteNode,
    webPageNode,
    breadcrumbNode,
  ];

  if (activePost) {
    const coverAbs = resolveAbsoluteAssetUrl(activePost.coverImageUrl, origin);
    const articleNode: Record<string, unknown> = {
      '@type': 'BlogPosting',
      '@id': `${canonicalUrl}#article`,
      headline: activePost.title,
      description: activePost.seoDescription || activePost.excerpt,
      datePublished: activePost.publishedDate,
      dateModified: activePost.publishedDate,
      articleSection: activePost.category,
      mainEntityOfPage: { '@id': `${canonicalUrl}#webpage` },
      author: { '@id': personId },
      publisher: { '@id': personId },
      url: canonicalUrl,
    };
    if (coverAbs) {
      articleNode.image = coverAbs;
    }
    graph.push(articleNode);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function resolveRouteSeo(
  pathname: string,
  content: LiveSiteContent,
  blogPosts: BlogPost[],
  fallbackOrigin: string
): ResolvedSeoMeta {
  const path = normalizePathname(pathname);
  const origin = resolveSiteOrigin(content.siteBaseUrl, fallbackOrigin);
  const defaultOgImage =
    resolveAbsoluteAssetUrl(content.seoOgImageUrl, origin) ||
    resolveAbsoluteAssetUrl(content.heroPortraitUrl, origin);

  // Private Admin Portal routes must NEVER be indexed
  if (isAdminPath(path)) {
    return {
      title: 'Private Administrator Portal | Mehmood Farooq',
      description: 'Private administration portal.',
      keywords: '',
      canonicalUrl: `${origin}${path}`,
      ogImageUrl: '',
      ogType: 'website',
      robots: 'noindex, nofollow',
      structuredData: null,
    };
  }

  // Blog article detail page (/blog/:slug)
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    const post = blogPosts.find((p) => p.slug === slug && p.isPublished);
    if (post) {
      const title = post.seoTitle || `${post.title} | ${content.brandName}`;
      const description = post.seoDescription || post.excerpt;
      const keywords = post.seoKeywords || content.seoKeywords;
      const canonicalUrl = buildCanonical(
        post.canonicalUrl,
        `/blog/${post.slug}`,
        origin
      );
      const ogImageUrl =
        resolveAbsoluteAssetUrl(post.coverImageUrl, origin) || defaultOgImage;

      return {
        title,
        description,
        keywords,
        canonicalUrl,
        ogImageUrl,
        ogType: 'article',
        robots: 'index, follow',
        structuredData: buildStructuredDataGraph(
          path,
          content,
          origin,
          title,
          description,
          canonicalUrl,
          post
        ),
      };
    }
  }

  const pageMap: Record<string, PublicPageKey> = {
    '/about': 'about',
    '/journey': 'journey',
    '/business': 'business',
    '/experience': 'experience',
    '/contact': 'contact',
    '/blog': 'blog',
  };

  const pageKey = pageMap[path];
  if (pageKey) {
    const entry = content.pageSeo[pageKey];
    const title = entry.title || content.seoTitle;
    const description = entry.description || content.seoDescription;
    const keywords = entry.keywords || content.seoKeywords;
    const canonicalUrl = buildCanonical(entry.canonicalUrl, path, origin);
    const ogImageUrl =
      resolveAbsoluteAssetUrl(entry.ogImageUrl, origin) || defaultOgImage;

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImageUrl,
      ogType: 'website',
      robots: 'index, follow',
      structuredData: buildStructuredDataGraph(
        path,
        content,
        origin,
        title,
        description,
        canonicalUrl
      ),
    };
  }

  // Homepage ('/') or fallback unknown route
  const canonicalUrl = buildCanonical(content.canonicalUrl, '/', origin);
  return {
    title: content.seoTitle,
    description: content.seoDescription,
    keywords: content.seoKeywords,
    canonicalUrl,
    ogImageUrl: defaultOgImage,
    ogType: 'profile',
    robots: 'index, follow',
    structuredData: buildStructuredDataGraph(
      '/',
      content,
      origin,
      content.seoTitle,
      content.seoDescription,
      canonicalUrl
    ),
  };
}

export function applyClientSeo(
  meta: ResolvedSeoMeta,
  content: LiveSiteContent
): void {
  if (typeof document === 'undefined') return;

  document.title = meta.title;

  const upsertMeta = (
    attr: 'name' | 'property',
    key: string,
    value: string
  ) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!value) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };

  upsertMeta('name', 'description', meta.description);
  upsertMeta('name', 'keywords', meta.keywords);
  upsertMeta('name', 'robots', meta.robots);
  upsertMeta(
    'name',
    'google-site-verification',
    (content.googleSiteVerification || '').trim()
  );

  upsertMeta('property', 'og:type', meta.ogType);
  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:url', meta.canonicalUrl);
  upsertMeta('property', 'og:site_name', content.brandName || 'Mehmood Farooq');
  if (meta.ogImageUrl) {
    upsertMeta('property', 'og:image', meta.ogImageUrl);
    upsertMeta('name', 'twitter:image', meta.ogImageUrl);
  }

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', meta.title);
  upsertMeta('name', 'twitter:description', meta.description);

  // Canonical link
  let canonicalLink = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = meta.canonicalUrl;

  // Favicon
  if (content.seoFaviconUrl) {
    let iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.href = content.seoFaviconUrl;
  }

  // JSON-LD Structured Data
  const existingScripts = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  if (meta.structuredData) {
    const jsonString = JSON.stringify(meta.structuredData);
    if (existingScripts.length > 0) {
      existingScripts[0].textContent = jsonString;
      for (let i = 1; i < existingScripts.length; i++) {
        existingScripts[i].remove();
      }
    } else {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = jsonString;
      document.head.appendChild(script);
    }
  } else {
    existingScripts.forEach((s) => s.remove());
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildSitemapXml(
  originInput: string,
  content?: LiveSiteContent,
  blogPosts?: BlogPost[]
): string {
  const origin = resolveSiteOrigin(content?.siteBaseUrl, originInput);
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/about', changefreq: 'monthly', priority: '0.9' },
    { path: '/journey', changefreq: 'monthly', priority: '0.8' },
    { path: '/business', changefreq: 'monthly', priority: '0.9' },
    { path: '/experience', changefreq: 'monthly', priority: '0.8' },
    { path: '/blog', changefreq: 'weekly', priority: '0.9' },
    { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  ];

  const posts = (blogPosts && blogPosts.length > 0
    ? blogPosts
    : DEFAULT_BLOG_POSTS
  ).filter((p) => p.isPublished && p.slug);

  const urls = [
    ...staticPages.map(
      (page) => `  <url>
    <loc>${escapeXml(`${origin}${page.path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    ),
    ...posts.map(
      (post) => `  <url>
    <loc>${escapeXml(`${origin}/blog/${post.slug}`)}</loc>
    <lastmod>${escapeXml(post.publishedDate || today)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export function buildRobotsTxt(
  originInput: string,
  content?: LiveSiteContent
): string {
  const origin = resolveSiteOrigin(content?.siteBaseUrl, originInput);
  return `User-agent: *
Allow: /
Allow: /about
Allow: /journey
Allow: /business
Allow: /experience
Allow: /blog
Allow: /contact

Disallow: /admin
Disallow: /admin/
Disallow: /admin/login
Disallow: /admin/dashboard

Sitemap: ${origin}/sitemap.xml
`;
}
