import { Fragment, useState, type MouseEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Mail,
  Truck,
} from 'lucide-react';
import {
  sanitizeHref,
  SITE_CONFIG,
  type BlogPost,
  type JourneyStage,
  type LiveSiteContent,
  type PrincipleItem,
} from '../data/siteConfig';
import { ConnectSection } from './ConnectSection';
import { ExecutiveImage } from './ExecutiveImage';
import { PrinciplesSection } from './PrinciplesSection';

interface PageShellProps {
  kicker: string;
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
}

function handleInternalNav(
  e: MouseEvent<HTMLAnchorElement>,
  path: string,
  onNavigate: (p: string) => void
) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return;
  }
  e.preventDefault();
  onNavigate(path);
}

function PublicPageHeader({
  kicker,
  title,
  subtitle,
  breadcrumbLabel,
  onNavigate,
}: Omit<PageShellProps, 'children'>) {
  return (
    <section className="border-b border-white/10 bg-[#080808] py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
        >
          <a
            href="/"
            onClick={(e) => handleInternalNav(e, '/', onNavigate)}
            className="transition-colors hover:text-[#F2D675]"
          >
            Home
          </a>
          <span aria-hidden="true" className="text-white/30">
            /
          </span>
          <span className="text-[#D4AF37]">{breadcrumbLabel}</span>
        </nav>

        <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
          {kicker}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[#F5F5F4] text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <div className="my-7 h-px w-20 bg-[#D4AF37]/60" aria-hidden="true" />
        <p className="max-w-3xl text-base leading-relaxed text-[#B8B8B3] sm:text-lg">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. ABOUT MEHMOOD FAROOQ (/about)                                           */
/* -------------------------------------------------------------------------- */
export function AboutPage({
  content,
  principles,
  onNavigate,
}: {
  content: LiveSiteContent;
  principles: PrincipleItem[];
  onNavigate: (path: string) => void;
}) {
  const paragraphs = content.aboutParagraphs.filter((p) => p.trim().length > 0);

  return (
    <>
      <PublicPageHeader
        kicker="Personal Brand Profile"
        title={`About ${content.brandName}`}
        subtitle={`${content.brandName} is an entrepreneur and business owner from ${content.location}, and founder of ${content.businessName}, a US trucking and logistics company registered in ${content.businessState || content.businessRegistration}.`}
        breadcrumbLabel={`About ${content.brandName}`}
        onNavigate={onNavigate}
      />

      <section className="border-b border-white/10 bg-[#0C0C0C] py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-6 lg:col-span-5">
              <div className="border border-[#D4AF37]/25 bg-[#151515] p-3">
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <ExecutiveImage
                    src={content.heroPortraitUrl}
                    alt={
                      content.heroPortraitAlt ||
                      `${content.brandName} — ${content.profession}`
                    }
                    width={900}
                    height={1200}
                    priority
                    className="h-full w-full"
                    imgClassName="object-top"
                    fallbackTitle={content.brandName}
                  />
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-4 border border-white/10 bg-[#151515] p-6">
                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                    Name
                  </dt>
                  <dd className="text-right text-sm font-medium text-[#F5F5F4]">
                    {content.brandName}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                    Personal Base
                  </dt>
                  <dd className="text-right text-sm font-medium text-[#F5F5F4]">
                    {content.location}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                    Founded Venture
                  </dt>
                  <dd className="text-right text-sm font-medium text-[#F2D675]">
                    {content.businessName}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                    Company Registration
                  </dt>
                  <dd className="text-right text-sm font-medium text-[#F5F5F4]">
                    {content.businessState || content.businessRegistration},{' '}
                    {content.businessCountry}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                    Industry
                  </dt>
                  <dd className="text-right text-sm font-medium text-[#F5F5F4]">
                    {content.businessIndustry}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-7">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] sm:text-4xl">
                {content.aboutHeading}
              </h2>
              <div className="my-6 h-px w-16 bg-[#D4AF37]/60" aria-hidden="true" />

              <div className="space-y-6 text-base leading-relaxed text-[#C2C2BC] sm:text-lg">
                {paragraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === paragraphs.length - 1
                        ? 'font-medium text-[#F5F5F4]'
                        : ''
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-10 border border-white/10 bg-[#151515] p-3">
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <ExecutiveImage
                    src={content.aboutWorkspaceUrl}
                    alt={
                      content.aboutWorkspaceAlt ||
                      SITE_CONFIG.images.aboutWorkspace.alt
                    }
                    width={1280}
                    height={720}
                    className="h-full w-full"
                    fallbackTitle="Executive Workspace"
                  />
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="/business"
                  onClick={(e) => handleInternalNav(e, '/business', onNavigate)}
                  className="inline-flex min-h-[46px] items-center gap-2 bg-[#D4AF37] px-6 py-3 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors hover:bg-[#F2D675]"
                >
                  <span>Explore {content.businessName}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="/journey"
                  onClick={(e) => handleInternalNav(e, '/journey', onNavigate)}
                  className="inline-flex min-h-[46px] items-center gap-2 border border-[#D4AF37]/45 bg-[#151515] px-6 py-3 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase transition-colors hover:border-[#F2D675] hover:text-[#F2D675]"
                >
                  <span>My Entrepreneurial Journey</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PrinciplesSection items={principles} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. MY ENTREPRENEURIAL JOURNEY (/journey)                                   */
/* -------------------------------------------------------------------------- */
export function JourneyPage({
  content,
  stages,
  onNavigate,
}: {
  content: LiveSiteContent;
  stages: JourneyStage[];
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      <PublicPageHeader
        kicker="Entrepreneurial Progression"
        title="My Entrepreneurial Journey"
        subtitle={`How ${content.brandName} progressed from early study of US freight dispatching in ${content.location} to founding ${content.businessName} in ${content.businessState || content.businessRegistration}.`}
        breadcrumbLabel="My Journey"
        onNavigate={onNavigate}
      />

      <section className="border-b border-white/10 bg-[#0C0C0C] py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <ol className="space-y-8">
            {stages.map((stage, idx) => (
              <li
                key={stage.id || stage.step}
                className="grid grid-cols-1 items-stretch gap-8 border border-white/10 bg-[#151515] p-7 transition-colors hover:border-[#D4AF37]/45 lg:grid-cols-12 lg:p-10"
              >
                <div className="flex flex-col justify-between lg:col-span-3 lg:border-r lg:border-white/10 lg:pr-8">
                  <div>
                    <span className="font-display text-4xl font-semibold tabular-nums text-[#D4AF37]">
                      {stage.step}
                    </span>
                    <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-[#9E9E98] uppercase">
                      {stage.dateLabel || `Milestone ${idx + 1}`}
                    </p>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mt-6 h-px w-12 bg-[#D4AF37]/50"
                  />
                </div>

                <div
                  className={
                    stage.imageUrl ? 'lg:col-span-5' : 'lg:col-span-9'
                  }
                >
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F5F5F4]">
                    {stage.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-[#C2C2BC]">
                    {stage.description}
                  </p>
                </div>

                {stage.imageUrl && (
                  <div className="overflow-hidden border border-white/10 bg-[#080808] lg:col-span-4">
                    <div className="aspect-[16/10] h-full w-full">
                      <ExecutiveImage
                        src={stage.imageUrl}
                        alt={`${stage.title} — ${content.brandName}`}
                        width={800}
                        height={500}
                        className="h-full w-full"
                        fallbackTitle={stage.title}
                      />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border border-[#D4AF37]/25 bg-[#151515] p-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
                Next Chapter
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#F5F5F4] sm:text-3xl">
                Explore {content.businessName} &amp; Ongoing Operations
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/experience"
                onClick={(e) => handleInternalNav(e, '/experience', onNavigate)}
                className="inline-flex min-h-[44px] items-center gap-2 border border-white/20 bg-[#080808] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase hover:border-[#D4AF37] hover:text-[#F2D675]"
              >
                <span>View Experience</span>
              </a>
              <a
                href="/contact"
                onClick={(e) => handleInternalNav(e, '/contact', onNavigate)}
                className="inline-flex min-h-[44px] items-center gap-2 bg-[#D4AF37] px-6 py-2.5 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
              >
                <span>Connect With {content.brandName}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. BUSINESS & TITAN ROUTE DISPATCH (TRD) LLC (/business)                   */
/* -------------------------------------------------------------------------- */
export function BusinessPage({
  content,
  onNavigate,
}: {
  content: LiveSiteContent;
  onNavigate: (path: string) => void;
}) {
  const services = content.businessServices || [];

  return (
    <>
      <PublicPageHeader
        kicker="United States Venture"
        title={`Business & ${content.businessName}`}
        subtitle={`Founded by ${content.brandName}, ${content.businessName} is a United States-based ${content.businessIndustry.toLowerCase()} company registered in ${content.businessState || content.businessRegistration}.`}
        breadcrumbLabel={content.businessName}
        onNavigate={onNavigate}
      />

      <section className="border-b border-white/10 bg-[#0C0C0C] py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch border border-[#D4AF37]/25 bg-[#151515] lg:grid-cols-12">
            <div className="relative overflow-hidden border-b border-white/10 lg:col-span-7 lg:border-r lg:border-b-0">
              <div className="aspect-video h-full w-full">
                <ExecutiveImage
                  src={content.businessShowcaseUrl}
                  alt={
                    content.businessShowcaseAlt ||
                    SITE_CONFIG.images.businessShowcase.alt
                  }
                  width={1280}
                  height={720}
                  priority
                  className="h-full w-full"
                  fallbackTitle={content.businessName}
                />
              </div>
            </div>

            <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-5">
              <div>
                <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-[#D4AF37] uppercase">
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  <span>Official Corporate Profile</span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-semibold text-[#F5F5F4]">
                  {content.businessName}
                </h2>
                <div className="my-5 h-px w-12 bg-[#D4AF37]/50" aria-hidden="true" />
                <p className="text-base leading-relaxed text-[#C2C2BC]">
                  {content.businessDescription}
                </p>

                <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs tracking-wider uppercase">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#8C8C86]">Founder</dt>
                    <dd className="font-medium text-[#F5F5F4]">
                      {content.brandName}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#8C8C86]">Country</dt>
                    <dd className="font-medium text-[#F5F5F4]">
                      {content.businessCountry}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#8C8C86]">Registered State</dt>
                    <dd className="font-medium text-[#F2D675]">
                      {content.businessState || content.businessRegistration}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#8C8C86]">Industry</dt>
                    <dd className="font-medium text-[#D4D4D0]">
                      {content.businessIndustry}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#8C8C86]">Business Email</dt>
                    <dd className="font-medium lowercase text-[#F2D675]">
                      <a
                        href={`mailto:${content.publicEmail}`}
                        className="hover:underline"
                      >
                        {content.publicEmail}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={sanitizeHref(content.businessWebsiteUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[46px] items-center gap-2 bg-[#D4AF37] px-6 py-3 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors hover:bg-[#F2D675]"
                >
                  <span>Visit {content.businessName}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="/contact"
                  onClick={(e) => handleInternalNav(e, '/contact', onNavigate)}
                  className="inline-flex min-h-[46px] items-center gap-2 border border-white/20 bg-[#080808] px-5 py-3 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase hover:border-[#D4AF37] hover:text-[#F2D675]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Contact</span>
                </a>
              </div>
            </div>
          </div>

          {services.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-3xl font-semibold text-[#F5F5F4]">
                Dispatch &amp; Logistics Capabilities
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {services.map((service, idx) => (
                  <article
                    key={idx}
                    className="border border-white/10 bg-[#151515] p-7"
                  >
                    <span className="font-display text-xl font-semibold tabular-nums text-[#D4AF37]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-[#F5F5F4]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#B8B8B3] sm:text-base">
                      {service.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. PROFESSIONAL EXPERIENCE (/experience)                                   */
/* -------------------------------------------------------------------------- */
export function ExperiencePage({
  content,
  principles,
  onNavigate,
}: {
  content: LiveSiteContent;
  principles: PrincipleItem[];
  onNavigate: (path: string) => void;
}) {
  const experience = content.aboutExperience || [];

  return (
    <>
      <PublicPageHeader
        kicker="Leadership & Operations"
        title={`Professional Experience — ${content.brandName}`}
        subtitle={`Hands-on experience across US freight dispatching, carrier communication, sales, and business leadership at ${content.businessName}.`}
        breadcrumbLabel="Experience"
        onNavigate={onNavigate}
      />

      <section className="border-b border-white/10 bg-[#0C0C0C] py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {experience.map((exp, idx) => (
              <article
                key={idx}
                className="flex flex-col justify-between border border-[#D4AF37]/25 bg-[#151515] p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <span className="text-xs font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
                      {exp.period}
                    </span>
                    <Briefcase
                      className="h-4 w-4 text-[#9E9E98]"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="mt-5 font-display text-3xl font-semibold text-[#F5F5F4]">
                    {exp.role}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#F2D675]">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                    <span>{exp.organization}</span>
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-[#C2C2BC]">
                    {exp.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="border border-white/10 bg-[#151515] p-8 lg:col-span-7">
              <h2 className="font-display text-2xl font-semibold text-[#F5F5F4] sm:text-3xl">
                Operational Focus in US Trucking &amp; Logistics
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#C2C2BC]">
                Working in the United States freight market from {content.location} requires consistency, clear communication, and preparation across every phase of carrier support—from lane planning and broker outreach to rate negotiation and paperwork coordination.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="/business"
                  onClick={(e) => handleInternalNav(e, '/business', onNavigate)}
                  className="inline-flex min-h-[44px] items-center gap-2 bg-[#D4AF37] px-6 py-2.5 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
                >
                  <span>View {content.businessName}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="/blog"
                  onClick={(e) => handleInternalNav(e, '/blog', onNavigate)}
                  className="inline-flex min-h-[44px] items-center gap-2 border border-white/20 bg-[#080808] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase hover:border-[#D4AF37] hover:text-[#F2D675]"
                >
                  <span>Read Logistics Insights</span>
                </a>
              </div>
            </div>

            <div className="border border-white/10 bg-[#151515] p-8 lg:col-span-5">
              <h3 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                Core Focus Areas
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-[#B8B8B3]">
                <li className="border-b border-white/10 pb-2.5">
                  US Freight Dispatching &amp; Load Planning
                </li>
                <li className="border-b border-white/10 pb-2.5">
                  Broker Negotiation &amp; Carrier Communication
                </li>
                <li className="border-b border-white/10 pb-2.5">
                  Sales Outreach &amp; Client Onboarding
                </li>
                <li>Cross-Border Business Operations Leadership</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PrinciplesSection items={principles} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. CONTACT ME (/contact)                                                   */
/* -------------------------------------------------------------------------- */
export function ContactPage({
  content,
  onNavigate,
}: {
  content: LiveSiteContent;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      <PublicPageHeader
        kicker="Direct Inquiries"
        title={`Contact ${content.brandName}`}
        subtitle={`Reach out regarding ${content.businessName} (${content.businessState || content.businessRegistration}), logistics partnerships, or professional collaborations.`}
        breadcrumbLabel="Contact"
        onNavigate={onNavigate}
      />
      <ConnectSection content={content} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. BLOG INDEX (/blog) & ARTICLE DETAIL (/blog/:slug)                       */
/* -------------------------------------------------------------------------- */
export function BlogListPage({
  content,
  posts,
  onNavigate,
}: {
  content: LiveSiteContent;
  posts: BlogPost[];
  onNavigate: (path: string) => void;
}) {
  const published = posts.filter((p) => p.isPublished);
  const categories = [
    'All',
    ...Array.from(new Set(published.map((p) => p.category).filter(Boolean))),
  ];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts =
    selectedCategory === 'All'
      ? published
      : published.filter((p) => p.category === selectedCategory);

  return (
    <>
      <PublicPageHeader
        kicker="Editorial Journal"
        title={`Insights & Articles by ${content.brandName}`}
        subtitle={`Original perspectives on entrepreneurship, US trucking and logistics operations, and building ${content.businessName}.`}
        breadcrumbLabel="Blog"
        onNavigate={onNavigate}
      />

      <section className="border-b border-white/10 bg-[#0C0C0C] py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Interactive Category Filter Buttons */}
          {categories.length > 1 && (
            <div
              role="group"
              aria-label="Filter articles by category"
              className="mb-10 flex flex-wrap gap-2 border-b border-white/10 pb-6"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#D4AF37] text-[#080808]'
                      : 'border border-white/15 bg-[#151515] text-[#B8B8B3] hover:border-[#D4AF37]/60 hover:text-[#F2D675]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="border border-white/10 bg-[#151515] p-12 text-center text-sm text-[#9E9E98]">
              No published articles available in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col justify-between border border-white/10 bg-[#151515] transition-colors duration-200 hover:border-[#D4AF37]/50"
                >
                  <div>
                    <a
                      href={`/blog/${post.slug}`}
                      onClick={(e) =>
                        handleInternalNav(e, `/blog/${post.slug}`, onNavigate)
                      }
                      className="block aspect-video w-full overflow-hidden border-b border-white/10 bg-[#080808]"
                    >
                      <ExecutiveImage
                        src={post.coverImageUrl}
                        alt={post.coverImageAlt || post.title}
                        width={960}
                        height={540}
                        className="h-full w-full"
                        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                        fallbackTitle={post.title}
                      />
                    </a>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#9E9E98]">
                        <span className="text-[#D4AF37]">{post.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.publishedDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {post.readTimeMinutes} min read
                        </span>
                      </div>
                      <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-[#F5F5F4] transition-colors group-hover:text-[#F2D675]">
                        <a
                          href={`/blog/${post.slug}`}
                          onClick={(e) =>
                            handleInternalNav(
                              e,
                              `/blog/${post.slug}`,
                              onNavigate
                            )
                          }
                        >
                          {post.title}
                        </a>
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-[#B8B8B3]">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <a
                      href={`/blog/${post.slug}`}
                      onClick={(e) =>
                        handleInternalNav(e, `/blog/${post.slug}`, onNavigate)
                      }
                      className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase hover:text-[#F2D675]"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/**
 * Safely renders structured plain-text / lightweight markdown without dangerouslySetInnerHTML.
 */
function renderInlineEmphasis(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#F5F5F4]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}

function ArticleBody({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/\n{2,}/);

  return (
    <div className="space-y-6 text-base leading-relaxed text-[#C2C2BC] sm:text-lg">
      {blocks.map((rawBlock, idx) => {
        const block = rawBlock.trim();
        if (!block) return null;

        if (block.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="pt-4 font-display text-2xl font-semibold tracking-tight text-[#F5F5F4] sm:text-3xl"
            >
              {block.slice(3).trim()}
            </h2>
          );
        }

        if (block.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="pt-2 font-display text-xl font-semibold text-[#F2D675] sm:text-2xl"
            >
              {block.slice(4).trim()}
            </h3>
          );
        }

        const lines = block.split('\n').map((l) => l.trim());
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul
              key={idx}
              className="space-y-2.5 border border-white/10 bg-[#151515] p-6 text-sm leading-relaxed text-[#D4D4D0] sm:text-base"
            >
              {lines.map((line, liIdx) => (
                <li key={liIdx} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#D4AF37]"
                  />
                  <span>{renderInlineEmphasis(line.slice(2).trim())}</span>
                </li>
              ))}
            </ul>
          );
        }

        return <p key={idx}>{renderInlineEmphasis(block)}</p>;
      })}
    </div>
  );
}

export function BlogArticlePage({
  slug,
  content,
  posts,
  onNavigate,
}: {
  slug: string;
  content: LiveSiteContent;
  posts: BlogPost[];
  onNavigate: (path: string) => void;
}) {
  const post = posts.find((p) => p.slug === slug && p.isPublished);
  const related = posts
    .filter((p) => p.isPublished && p.slug !== slug)
    .slice(0, 2);

  if (!post) {
    return (
      <section className="border-b border-white/10 bg-[#080808] py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
            Article Not Found
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-[#F5F5F4]">
            This Article Is Unavailable
          </h1>
          <p className="mt-4 text-base text-[#B8B8B3]">
            The article you requested could not be found or has not been published.
          </p>
          <a
            href="/blog"
            onClick={(e) => handleInternalNav(e, '/blog', onNavigate)}
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 bg-[#D4AF37] px-6 py-2.5 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Return to Blog</span>
          </a>
        </div>
      </section>
    );
  }

  return (
    <article className="border-b border-white/10 bg-[#080808]">
      <header className="border-b border-white/10 py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
          >
            <a
              href="/"
              onClick={(e) => handleInternalNav(e, '/', onNavigate)}
              className="hover:text-[#F2D675]"
            >
              Home
            </a>
            <span aria-hidden="true" className="text-white/30">
              /
            </span>
            <a
              href="/blog"
              onClick={(e) => handleInternalNav(e, '/blog', onNavigate)}
              className="hover:text-[#F2D675]"
            >
              Blog
            </a>
            <span aria-hidden="true" className="text-white/30">
              /
            </span>
            <span className="truncate text-[#D4AF37]">{post.category}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
            <span className="text-[#D4AF37]">{post.category}</span>
            <span aria-hidden="true">·</span>
            <span>{post.publishedDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{post.readTimeMinutes} min read</span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[#F5F5F4] text-balance sm:text-5xl">
            {post.title}
          </h1>

          <p className="mt-5 text-base leading-relaxed text-[#B8B8B3] sm:text-lg">
            {post.excerpt}
          </p>

          <p className="mt-6 text-xs font-medium tracking-wider text-[#D4D4D0] uppercase">
            By{' '}
            <a
              href="/about"
              onClick={(e) => handleInternalNav(e, '/about', onNavigate)}
              className="text-[#F2D675] hover:underline"
            >
              {content.brandName}
            </a>{' '}
            · Founder, {content.businessName}
          </p>
        </div>
      </header>

      {post.coverImageUrl && (
        <div className="border-b border-white/10 bg-[#0C0C0C] py-8">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="border border-white/10 bg-[#151515] p-2.5">
              <div className="aspect-video w-full overflow-hidden">
                <ExecutiveImage
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt || post.title}
                  width={1280}
                  height={720}
                  priority
                  className="h-full w-full"
                  fallbackTitle={post.title}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0C0C0C] py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <ArticleBody markdown={post.content} />

          {/* Author Attribution Box */}
          <div className="mt-14 border border-[#D4AF37]/30 bg-[#151515] p-7">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
              About the Author
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#F5F5F4]">
              {content.brandName}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#B8B8B3]">
              {content.heroDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold tracking-wider uppercase">
              <a
                href="/about"
                onClick={(e) => handleInternalNav(e, '/about', onNavigate)}
                className="text-[#F2D675] hover:underline"
              >
                About {content.brandName}
              </a>
              <a
                href="/business"
                onClick={(e) => handleInternalNav(e, '/business', onNavigate)}
                className="text-[#D4D4D0] hover:text-[#F2D675]"
              >
                {content.businessName}
              </a>
              <a
                href="/contact"
                onClick={(e) => handleInternalNav(e, '/contact', onNavigate)}
                className="text-[#D4D4D0] hover:text-[#F2D675]"
              >
                Contact
              </a>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-14 border-t border-white/10 pt-10">
              <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                More Articles by {content.brandName}
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {related.map((item) => (
                  <a
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    onClick={(e) =>
                      handleInternalNav(e, `/blog/${item.slug}`, onNavigate)
                    }
                    className="group border border-white/10 bg-[#151515] p-5 transition-colors hover:border-[#D4AF37]/50"
                  >
                    <p className="text-xs text-[#D4AF37]">
                      {item.category} · {item.publishedDate}
                    </p>
                    <p className="mt-2 font-display text-xl font-semibold text-[#F5F5F4] group-hover:text-[#F2D675]">
                      {item.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <a
              href="/blog"
              onClick={(e) => handleInternalNav(e, '/blog', onNavigate)}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase hover:text-[#F2D675]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to All Articles</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
