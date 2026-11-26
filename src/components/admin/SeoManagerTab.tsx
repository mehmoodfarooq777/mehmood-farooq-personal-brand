import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  DEFAULT_PAGE_SEO,
  type LiveSiteContent,
  type MediaCategory,
  type PageSeoEntry,
  type PublicPageKey,
} from '../../data/siteConfig';
import {
  collectGenuineSocialUrls,
  resolveSiteOrigin,
} from '../../lib/seo';
import {
  AdminInput,
  AdminTextarea,
  ImageSlotEditor,
} from './AdminSectionEditors';

interface SeoManagerTabProps {
  draft: LiveSiteContent;
  onChange: (next: LiveSiteContent) => void;
  onPickImage: (
    title: string,
    category: MediaCategory,
    currentUrl: string,
    onSelect: (url: string) => void
  ) => void;
}

const PAGE_TABS: { key: PublicPageKey; label: string; path: string }[] = [
  { key: 'about', label: 'About Page', path: '/about' },
  { key: 'journey', label: 'Journey Page', path: '/journey' },
  { key: 'business', label: 'Business Page', path: '/business' },
  { key: 'experience', label: 'Experience Page', path: '/experience' },
  { key: 'blog', label: 'Blog Index', path: '/blog' },
  { key: 'contact', label: 'Contact Page', path: '/contact' },
];

function LengthHint({
  len,
  min,
  max,
}: {
  len: number;
  min: number;
  max: number;
}) {
  const optimal = len >= min && len <= max;
  return (
    <span
      className={`text-[11px] tabular-nums ${
        optimal ? 'text-emerald-400' : 'text-[#9E9E98]'
      }`}
    >
      {len} chars (recommended {min}–{max})
    </span>
  );
}

export function SeoManagerTab({
  draft,
  onChange,
  onPickImage,
}: SeoManagerTabProps) {
  const [selectedPage, setSelectedPage] = useState<PublicPageKey>('about');
  const [copiedKey, setCopiedKey] = useState<string>('');
  const [endpointCheck, setEndpointCheck] = useState<{
    loading: boolean;
    sitemapOk?: boolean;
    robotsOk?: boolean;
    message?: string;
  }>({ loading: false });

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const resolvedOrigin = resolveSiteOrigin(draft.siteBaseUrl, currentOrigin);
  const sitemapUrl = `${resolvedOrigin}/sitemap.xml`;
  const robotsUrl = `${resolvedOrigin}/robots.txt`;

  const genuineSocials = collectGenuineSocialUrls(draft);
  const activePageEntry: PageSeoEntry =
    draft.pageSeo?.[selectedPage] || DEFAULT_PAGE_SEO[selectedPage];
  const activePageMeta = PAGE_TABS.find((t) => t.key === selectedPage)!;

  function updatePageSeo(patch: Partial<PageSeoEntry>) {
    onChange({
      ...draft,
      pageSeo: {
        ...draft.pageSeo,
        [selectedPage]: {
          ...activePageEntry,
          ...patch,
        },
      },
    });
  }

  async function handleCopy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(''), 1800);
    } catch {
      // Ignore clipboard failure
    }
  }

  async function handleVerifyEndpoints() {
    setEndpointCheck({ loading: true });
    try {
      const [sRes, rRes] = await Promise.all([
        fetch('/sitemap.xml'),
        fetch('/robots.txt'),
      ]);
      const [sText, rText] = await Promise.all([sRes.text(), rRes.text()]);
      const sitemapOk = sRes.ok && sText.includes('<urlset');
      const robotsOk = rRes.ok && rText.includes('Disallow: /admin');
      setEndpointCheck({
        loading: false,
        sitemapOk,
        robotsOk,
        message:
          sitemapOk && robotsOk
            ? 'Live sitemap.xml and robots.txt are reachable and properly configured.'
            : 'One or more crawl endpoints returned an unexpected response.',
      });
    } catch {
      setEndpointCheck({
        loading: false,
        sitemapOk: false,
        robotsOk: false,
        message: 'Could not verify endpoints from browser.',
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. HOMEPAGE SEO & BRAND GRAPH */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-5 border border-white/10 bg-[#151515] p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                Homepage SEO &amp; Search Snippet
              </h2>
              <p className="mt-1 text-xs text-[#9E9E98]">
                Primary metadata for `/` targeting &ldquo;Mehmood Farooq&rdquo; and{' '}
                {draft.businessName}.
              </p>
            </div>
            <span className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Route: /
            </span>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                Homepage Title (&lt;title&gt;)
              </span>
              <LengthHint len={draft.seoTitle.length} min={45} max={75} />
            </div>
            <input
              type="text"
              value={draft.seoTitle}
              maxLength={160}
              onChange={(e) => onChange({ ...draft, seoTitle: e.target.value })}
              className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                Homepage Meta Description
              </span>
              <LengthHint len={draft.seoDescription.length} min={120} max={165} />
            </div>
            <textarea
              rows={3}
              value={draft.seoDescription}
              maxLength={320}
              onChange={(e) =>
                onChange({ ...draft, seoDescription: e.target.value })
              }
              className="w-full resize-y border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <AdminTextarea
            label="Editorial Planning Keywords (Comma-Separated)"
            value={draft.seoKeywords}
            maxLength={400}
            rows={2}
            onChange={(v) => onChange({ ...draft, seoKeywords: v })}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput
              label="Primary Production Domain (Optional)"
              value={draft.siteBaseUrl}
              maxLength={300}
              placeholder="https://mehmoodfarooq.com"
              onChange={(v) => onChange({ ...draft, siteBaseUrl: v })}
            />
            <AdminInput
              label="Homepage Canonical URL Override (Optional)"
              value={draft.canonicalUrl}
              maxLength={300}
              placeholder="Leave blank to auto-use domain root"
              onChange={(v) => onChange({ ...draft, canonicalUrl: v })}
            />
          </div>

          {/* Search Result Snippet Preview */}
          <div className="border border-white/10 bg-[#080808] p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#9E9E98] uppercase">
              <Search className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
              <span>Google Search Snippet Preview</span>
            </p>
            <p className="truncate text-xs text-[#9E9E98]">
              {draft.canonicalUrl || `${resolvedOrigin}/`}
            </p>
            <p className="mt-1 truncate text-base font-medium text-[#93C5FD]">
              {draft.seoTitle}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#B8B8B3]">
              {draft.seoDescription}
            </p>
          </div>
        </section>

        {/* Social Share Image, Favicon & Google Search Console */}
        <div className="space-y-6 lg:col-span-5">
          <section className="space-y-5 border border-white/10 bg-[#151515] p-6">
            <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
              Default Social Share &amp; Favicon
            </h2>
            <ImageSlotEditor
              label="Default Open Graph Share Image (og:image)"
              url={draft.seoOgImageUrl}
              onChangeUrl={(url) => onChange({ ...draft, seoOgImageUrl: url })}
              onClear={() => onChange({ ...draft, seoOgImageUrl: '' })}
              onOpenPicker={() =>
                onPickImage(
                  'Select Social Share Image',
                  'seo',
                  draft.seoOgImageUrl,
                  (url) => onChange({ ...draft, seoOgImageUrl: url })
                )
              }
            />
            <ImageSlotEditor
              label="Website Favicon"
              url={draft.seoFaviconUrl}
              onChangeUrl={(url) => onChange({ ...draft, seoFaviconUrl: url })}
              onClear={() => onChange({ ...draft, seoFaviconUrl: '' })}
              onOpenPicker={() =>
                onPickImage(
                  'Select Website Favicon',
                  'seo',
                  draft.seoFaviconUrl,
                  (url) => onChange({ ...draft, seoFaviconUrl: url })
                )
              }
            />
          </section>

          <section className="space-y-4 border border-[#D4AF37]/30 bg-[#151515] p-6">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                Google Search Console
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-[#9E9E98]">
              Paste your HTML tag verification token from Google Search Console (only the{' '}
              <code className="text-[#F2D675]">content=&quot;...&quot;</code> code). Once published, Google can verify ownership and crawl your live sitemap.
            </p>
            <AdminInput
              label="Google Site Verification Code"
              value={draft.googleSiteVerification}
              maxLength={200}
              placeholder="e.g. abcDEF123456_verificationToken"
              onChange={(v) =>
                onChange({ ...draft, googleSiteVerification: v })
              }
            />

            <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center justify-between gap-2 bg-[#080808] px-3 py-2">
                <span className="truncate font-mono text-[#D4D4D0]">
                  {sitemapUrl}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy('sitemap', sitemapUrl)}
                    className="text-[#D4AF37] hover:text-[#F2D675]"
                    title="Copy sitemap URL"
                  >
                    {copiedKey === 'sitemap' ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9E9E98] hover:text-[#F2D675]"
                    title="Open sitemap.xml"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 bg-[#080808] px-3 py-2">
                <span className="truncate font-mono text-[#D4D4D0]">
                  {robotsUrl}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy('robots', robotsUrl)}
                    className="text-[#D4AF37] hover:text-[#F2D675]"
                    title="Copy robots.txt URL"
                  >
                    {copiedKey === 'robots' ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9E9E98] hover:text-[#F2D675]"
                    title="Open robots.txt"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={endpointCheck.loading}
              onClick={handleVerifyEndpoints}
              className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 border border-[#D4AF37]/50 bg-[#080808] px-4 py-2 text-xs font-semibold tracking-wider text-[#F2D675] uppercase hover:bg-[#D4AF37] hover:text-[#080808]"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {endpointCheck.loading
                  ? 'Checking Crawl Files...'
                  : 'Verify Live Sitemap & Robots'}
              </span>
            </button>

            {endpointCheck.message && (
              <p
                className={`flex items-start gap-2 text-xs ${
                  endpointCheck.sitemapOk && endpointCheck.robotsOk
                    ? 'text-emerald-400'
                    : 'text-amber-300'
                }`}
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{endpointCheck.message}</span>
              </p>
            )}
          </section>
        </div>
      </div>

      {/* 2. PER-PAGE SEO MANAGER */}
      <section className="space-y-6 border border-white/10 bg-[#151515] p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
              Per-Page SEO &amp; Canonical Settings
            </h2>
            <p className="mt-1 text-xs text-[#9E9E98]">
              Customize unique title tags, meta descriptions, keywords, and social images for every public route.
            </p>
          </div>
          <span className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
            Route: {activePageMeta.path}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedPage(tab.key)}
              className={`min-h-[38px] px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                selectedPage === tab.key
                  ? 'bg-[#D4AF37] text-[#080808]'
                  : 'border border-white/15 bg-[#080808] text-[#B8B8B3] hover:border-[#D4AF37]/60 hover:text-[#F2D675]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Page Title (&lt;title&gt;)
                </span>
                <LengthHint len={activePageEntry.title.length} min={35} max={70} />
              </div>
              <input
                type="text"
                value={activePageEntry.title}
                maxLength={160}
                onChange={(e) => updatePageSeo({ title: e.target.value })}
                className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Meta Description
                </span>
                <LengthHint
                  len={activePageEntry.description.length}
                  min={110}
                  max={165}
                />
              </div>
              <textarea
                rows={3}
                value={activePageEntry.description}
                maxLength={320}
                onChange={(e) => updatePageSeo({ description: e.target.value })}
                className="w-full resize-y border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <AdminTextarea
              label="Target Keywords"
              value={activePageEntry.keywords}
              maxLength={400}
              rows={2}
              onChange={(v) => updatePageSeo({ keywords: v })}
            />
          </div>

          <div className="space-y-4 lg:col-span-5">
            <AdminInput
              label="Canonical URL Override (Optional)"
              value={activePageEntry.canonicalUrl}
              maxLength={300}
              placeholder={`${resolvedOrigin}${activePageMeta.path}`}
              onChange={(v) => updatePageSeo({ canonicalUrl: v })}
            />
            <ImageSlotEditor
              label="Page Social Share Image Override (og:image)"
              url={activePageEntry.ogImageUrl}
              onChangeUrl={(url) => updatePageSeo({ ogImageUrl: url })}
              onClear={() => updatePageSeo({ ogImageUrl: '' })}
              onOpenPicker={() =>
                onPickImage(
                  `Select Share Image — ${activePageMeta.label}`,
                  'seo',
                  activePageEntry.ogImageUrl,
                  (url) => updatePageSeo({ ogImageUrl: url })
                )
              }
            />
            <p className="text-xs text-[#8C8C86]">
              Private routes (<code className="text-[#D4AF37]">/admin</code>,{' '}
              <code className="text-[#D4AF37]">/admin/login</code>,{' '}
              <code className="text-[#D4AF37]">/admin/dashboard</code>) are permanently excluded from indexing via{' '}
              <code>noindex, nofollow</code> and <code>robots.txt</code>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. IMAGE ALT DESCRIPTIONS & SCHEMA.ORG SAMEAS AUDIT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-4 border border-white/10 bg-[#151515] p-6 lg:col-span-7">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            Image Alt Descriptions (Accessibility &amp; Image SEO)
          </h2>
          <p className="text-xs text-[#9E9E98]">
            Descriptive alt text helps Google Images and screen readers understand your portrait, workspace, and US logistics imagery.
          </p>
          <AdminInput
            label="Hero / Executive Portrait Alt Text"
            value={draft.heroPortraitAlt}
            maxLength={240}
            onChange={(v) => onChange({ ...draft, heroPortraitAlt: v })}
          />
          <AdminInput
            label="About Workspace Image Alt Text"
            value={draft.aboutWorkspaceAlt}
            maxLength={240}
            onChange={(v) => onChange({ ...draft, aboutWorkspaceAlt: v })}
          />
          <AdminInput
            label="Business Showcase Image Alt Text"
            value={draft.businessShowcaseAlt}
            maxLength={240}
            onChange={(v) => onChange({ ...draft, businessShowcaseAlt: v })}
          />
        </section>

        <section className="space-y-4 border border-white/10 bg-[#151515] p-6 lg:col-span-5">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            Schema.org &amp; Social Profile Integrity
          </h2>
          <p className="text-xs leading-relaxed text-[#9E9E98]">
            Your <code className="text-[#F2D675]">Person</code> and{' '}
            <code className="text-[#F2D675]">Organization</code> JSON-LD graphs automatically connect genuine profile URLs under <code className="text-[#F2D675]">sameAs</code>. Generic platform homepages (like bare <code>linkedin.com/</code>) are skipped until you add your exact profile handle in the Social Media tab.
          </p>
          {genuineSocials.length === 0 ? (
            <div className="border border-white/10 bg-[#080808] p-4 text-xs text-[#B8B8B3]">
              No specific social profile handles configured yet. Add your personal TikTok, Instagram, LinkedIn, or Facebook profile URLs in the Social Media tab to populate Schema.org{' '}
              <code>sameAs</code>.
            </div>
          ) : (
            <ul className="space-y-2 border border-white/10 bg-[#080808] p-4 text-xs">
              {genuineSocials.map((url) => (
                <li
                  key={url}
                  className="flex items-center gap-2 truncate text-emerald-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{url}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
