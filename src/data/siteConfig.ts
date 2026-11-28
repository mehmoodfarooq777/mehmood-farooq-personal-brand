/**
 * Centralized content, media, blog, SEO, and schema definitions for Mehmood Farooq's personal brand website & CMS.
 */

export type WelcomeAnimationStyle = 'cinematic' | 'editorial' | 'minimal';

export type MediaCategory =
  | 'profile'
  | 'hero'
  | 'about'
  | 'journey'
  | 'business'
  | 'blog'
  | 'seo'
  | 'general';

export type PublicPageKey =
  | 'about'
  | 'journey'
  | 'business'
  | 'experience'
  | 'contact'
  | 'blog';

export interface PageSeoEntry {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImageUrl: string;
}

export type PageSeoMap = Record<PublicPageKey, PageSeoEntry>;

export interface AboutExperienceItem {
  role: string;
  organization: string;
  period: string;
  summary: string;
}

export interface BusinessServiceItem {
  title: string;
  description: string;
}

export interface CustomSocialLink {
  label: string;
  url: string;
}

export interface SectionVisibility {
  about: boolean;
  journey: boolean;
  business: boolean;
  principles: boolean;
  connect: boolean;
}

export interface JourneyStage {
  id?: string;
  step: string;
  order: number;
  dateLabel: string;
  title: string;
  description: string;
  imageUrl: string;
  isPublished?: boolean;
}

export interface PrincipleItem {
  id?: string;
  number: string;
  order: number;
  title: string;
  summary: string;
  isPublished?: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImageUrl: string;
  coverImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  readTimeMinutes: number;
  publishedDate: string;
  isPublished: boolean;
  updatedByUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SocialProfile {
  id: 'tiktok' | 'instagram' | 'linkedin' | 'facebook';
  name: string;
  label: string;
  url: string;
}

export interface MediaItemRecord {
  id: string;
  title: string;
  description: string;
  category: MediaCategory;
  url: string;
  storagePath?: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  uploadedByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SiteVersionRecord {
  id: string;
  label: string;
  snapshot: LiveSiteContent;
  createdByUid: string;
  createdAt?: { toDate?: () => Date } | unknown;
}

export interface LiveSiteContent {
  brandName: string;
  heroHeading: string;
  tagline: string;
  profession: string;
  location: string;
  heroDescription: string;
  heroPortraitUrl: string;
  heroPortraitAlt: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaUrl: string;
  aboutHeading: string;
  aboutParagraphs: string[];
  aboutExperience: AboutExperienceItem[];
  aboutWorkspaceUrl: string;
  aboutWorkspaceAlt: string;
  businessHeading: string;
  businessName: string;
  businessCountry: string;
  businessState: string;
  businessRegistration: string;
  businessIndustry: string;
  businessDescription: string;
  businessWebsiteUrl: string;
  businessLogoUrl: string;
  businessShowcaseUrl: string;
  businessShowcaseAlt: string;
  businessServices: BusinessServiceItem[];
  connectHeading: string;
  connectDescription: string;
  publicEmail: string;
  tiktokUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
  customSocialLinks: CustomSocialLink[];
  welcomeEnabled: boolean;
  welcomeName: string;
  welcomeTagline: string;
  welcomeDurationMs: number;
  welcomeBgColor: string;
  welcomeStyle: WelcomeAnimationStyle;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImageUrl: string;
  seoFaviconUrl: string;
  siteBaseUrl: string;
  canonicalUrl: string;
  googleSiteVerification: string;
  pageSeo: PageSeoMap;
  footerDescription: string;
  footerCopyright: string;
  sectionVisibility: SectionVisibility;
}

export interface InquiryRecord {
  id: string;
  senderName: string;
  senderEmail: string;
  company: string;
  subject: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  adminNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const SITE_CONFIG = {
  brand: {
    name: 'Mehmood Farooq',
    heroHeading: 'Mehmood Farooq – Entrepreneur & Business Owner',
    tagline: 'Building Beyond Borders.',
    profession: 'Entrepreneur | Business Owner | Logistics Professional',
    location: 'Pakistan',
    copyright: '© 2026 Mehmood Farooq. All Rights Reserved.',
  },

  images: {
    heroPortrait: {
      src: '/src/assets/images/hero_executive_portrait_1795727162039.jpg',
      alt: 'Mehmood Farooq – Entrepreneur and Business Owner, Founder of TITAN ROUTE DISPATCH (TRD) LLC',
    },
    aboutWorkspace: {
      src: '/src/assets/images/vision_executive_workspace_1795727162915.jpg',
      alt: 'Executive workspace representing Mehmood Farooq international business and logistics operations',
    },
    businessShowcase: {
      src: '/src/assets/images/business_logistics_highway_1795727163116.jpg',
      alt: 'US commercial freight truck operating for TITAN ROUTE DISPATCH (TRD) LLC, registered in Wyoming, USA',
    },
  },

  hero: {
    description:
      'Mehmood Farooq is a young entrepreneur from Pakistan and founder of TITAN ROUTE DISPATCH (TRD) LLC, building hands-on experience in international business, US trucking and logistics, and entrepreneurship.',
    primaryCta: 'Explore My Journey',
    primaryCtaUrl: '/journey',
    secondaryCta: 'Connect With Me',
    secondaryCtaUrl: '/contact',
  },

  about: {
    kicker: 'About Mehmood Farooq',
    heading: 'The Journey Behind the Vision',
    paragraphs: [
      'My name is Mehmood Farooq, and my journey started with a deep interest in business and a determination to build something meaningful beyond local boundaries. I began working in the US trucking and logistics industry at a young age, gaining practical experience in freight dispatching, carrier operations, broker communication, and sales.',
      'Today, as an entrepreneur and founder of TITAN ROUTE DISPATCH (TRD) LLC, a United States-based trucking and logistics company registered in Wyoming, USA, I remain focused on strengthening operational discipline and creating opportunities beyond borders from Pakistan.',
      'I believe lasting business growth comes from consistency, continuous learning, clear communication, and taking deliberate action every day.',
    ],
    experience: [
      {
        role: 'Founder & Business Owner',
        organization: 'TITAN ROUTE DISPATCH (TRD) LLC',
        period: 'Present',
        summary:
          'Leading United States-based dispatch operations, carrier support, and client growth for TITAN ROUTE DISPATCH (TRD) LLC, registered in Wyoming, USA.',
      },
      {
        role: 'Logistics & Dispatch Operations',
        organization: 'US Trucking Industry',
        period: 'Early Career',
        summary:
          'Built hands-on expertise in freight dispatching, rate negotiation, broker communication, and sales across North American freight lanes.',
      },
    ] as AboutExperienceItem[],
  },

  journey: {
    kicker: 'Progression',
    heading: 'My Entrepreneurial Journey',
    stages: [
      {
        id: 'stage-01',
        step: '01',
        order: 1,
        dateLabel: 'Foundation',
        title: 'The Beginning',
        description:
          'Started learning the fundamentals of US trucking, freight markets, and logistics operations.',
        imageUrl: '',
        isPublished: true,
      },
      {
        id: 'stage-02',
        step: '02',
        order: 2,
        dateLabel: 'Operations',
        title: 'Building Experience',
        description:
          'Developed practical experience in US trucking dispatch, broker coordination, and sales communication.',
        imageUrl: '',
        isPublished: true,
      },
      {
        id: 'stage-03',
        step: '03',
        order: 3,
        dateLabel: 'Venture',
        title: 'TITAN ROUTE DISPATCH (TRD) LLC',
        description:
          'Founded TITAN ROUTE DISPATCH (TRD) LLC, registered in Wyoming, USA, serving the US trucking and logistics industry.',
        imageUrl: '',
        isPublished: true,
      },
      {
        id: 'stage-04',
        step: '04',
        order: 4,
        dateLabel: '2026 & Beyond',
        title: 'Building Beyond Borders',
        description:
          'Growing international logistics operations and establishing a strong global personal brand as Mehmood Farooq.',
        imageUrl: '',
        isPublished: true,
      },
    ] as JourneyStage[],
  },

  business: {
    kicker: 'United States Venture',
    heading: 'Business & TITAN ROUTE DISPATCH (TRD) LLC',
    name: 'TITAN ROUTE DISPATCH (TRD) LLC',
    country: 'United States of America',
    state: 'Wyoming, USA',
    registration: 'Wyoming, USA',
    industry: 'Trucking and Logistics',
    description:
      'TITAN ROUTE DISPATCH (TRD) LLC is a United States-based trucking and logistics company registered in Wyoming, USA, founded by Mehmood Farooq to deliver dependable dispatch support and freight solutions for the US trucking industry.',
    ctaLabel: 'Visit Business Website',
    url: 'https://trdispatch.us/',
    services: [
      {
        title: 'Freight Dispatch Support',
        description:
          'End-to-end load sourcing, lane planning, and broker coordination for US carriers.',
      },
      {
        title: 'Carrier Operations & Sales',
        description:
          'Dedicated dispatch communication, paperwork management, and operational consistency.',
      },
    ] as BusinessServiceItem[],
  },

  principles: {
    kicker: 'Core Values',
    heading: 'My Principles',
    items: [
      {
        id: 'principle-01',
        number: '01',
        order: 1,
        title: 'Discipline',
        summary:
          'Executing daily responsibilities with structure, focus, and accountability regardless of circumstance.',
        isPublished: true,
      },
      {
        id: 'principle-02',
        number: '02',
        order: 2,
        title: 'Consistency',
        summary:
          'Showing up steadily every day to compound small operational improvements into lasting results.',
        isPublished: true,
      },
      {
        id: 'principle-03',
        number: '03',
        order: 3,
        title: 'Continuous Learning',
        summary:
          'Studying markets, freight operations, and communication to sharpen decision-making at every stage.',
        isPublished: true,
      },
      {
        id: 'principle-04',
        number: '04',
        order: 4,
        title: 'Building Trust',
        summary:
          'Earning long-term professional relationships through reliability, clear communication, and follow-through.',
        isPublished: true,
      },
    ] as PrincipleItem[],
  },

  connect: {
    kicker: 'Connect',
    heading: "Let's Build Something Meaningful",
    description:
      'For business opportunities, logistics partnerships, and professional collaborations with Mehmood Farooq or TITAN ROUTE DISPATCH (TRD) LLC, reach out via our official business email or send an inquiry below.',
    publicEmail: 'info@trdisaptch.us',
  },

  socialLinks: [
    {
      id: 'tiktok',
      name: 'TikTok',
      label: 'Connect on TikTok',
      url: 'https://www.tiktok.com/',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      label: 'Connect on Instagram',
      url: 'https://www.instagram.com/',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      label: 'Connect on LinkedIn',
      url: 'https://www.linkedin.com/',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      label: 'Connect on Facebook',
      url: 'https://www.facebook.com/',
    },
  ] as SocialProfile[],
} as const;

export const DEFAULT_PAGE_SEO: PageSeoMap = {
  about: {
    title: 'About Mehmood Farooq | Entrepreneur & Business Owner',
    description:
      'Learn about Mehmood Farooq, a young entrepreneur from Pakistan and founder of TITAN ROUTE DISPATCH (TRD) LLC in Wyoming, USA.',
    keywords:
      'Mehmood Farooq, About Mehmood Farooq, Mehmood Farooq Entrepreneur, Mehmood Farooq Pakistan, Titan Route Dispatch LLC',
    canonicalUrl: '',
    ogImageUrl: '',
  },
  journey: {
    title: 'My Entrepreneurial Journey | Mehmood Farooq',
    description:
      'Explore the entrepreneurial journey of Mehmood Farooq from learning US freight dispatching to founding TITAN ROUTE DISPATCH (TRD) LLC.',
    keywords:
      'Mehmood Farooq Journey, Mehmood Farooq Entrepreneur, Mehmood Farooq Logistics, Building Beyond Borders',
    canonicalUrl: '',
    ogImageUrl: '',
  },
  business: {
    title: 'TITAN ROUTE DISPATCH (TRD) LLC | Mehmood Farooq Business',
    description:
      'TITAN ROUTE DISPATCH (TRD) LLC is a US-based trucking and logistics company registered in Wyoming, USA, founded by Mehmood Farooq.',
    keywords:
      'TITAN ROUTE DISPATCH (TRD) LLC, Titan Route Dispatch LLC, Mehmood Farooq TRD, US Trucking Dispatch, Wyoming Logistics',
    canonicalUrl: '',
    ogImageUrl: '',
  },
  experience: {
    title: 'Professional Experience | Mehmood Farooq Logistics',
    description:
      'Review Mehmood Farooq’s professional experience in US trucking dispatch, broker communication, carrier operations, and business leadership.',
    keywords:
      'Mehmood Farooq Experience, Mehmood Farooq Logistics, Mehmood Farooq Business Owner, US Freight Dispatching',
    canonicalUrl: '',
    ogImageUrl: '',
  },
  contact: {
    title: 'Contact Mehmood Farooq | Business & Logistics Inquiries',
    description:
      'Connect with Mehmood Farooq and TITAN ROUTE DISPATCH (TRD) LLC for trucking dispatch services, partnerships, and professional inquiries.',
    keywords:
      'Contact Mehmood Farooq, TITAN ROUTE DISPATCH (TRD) LLC Contact, Mehmood Farooq Business Owner',
    canonicalUrl: '',
    ogImageUrl: '',
  },
  blog: {
    title: 'Insights & Articles | Mehmood Farooq',
    description:
      'Read original articles by Mehmood Farooq on entrepreneurship, US trucking and logistics, dispatch operations, and international business.',
    keywords:
      'Mehmood Farooq Blog, Mehmood Farooq Logistics Articles, Trucking Dispatch Insights, TITAN ROUTE DISPATCH (TRD) LLC',
    canonicalUrl: '',
    ogImageUrl: '',
  },
};

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post_building_beyond_borders',
    slug: 'building-beyond-borders-pakistan-to-us-logistics',
    title: 'Building Beyond Borders: Operating a US Trucking Dispatch Company from Pakistan',
    excerpt:
      'How Mehmood Farooq approached the US trucking and logistics industry at a young age and established TITAN ROUTE DISPATCH (TRD) LLC in Wyoming, United States.',
    category: 'Entrepreneurship',
    coverImageUrl: '/src/assets/images/blog_freight_dispatch_1795733092980.jpg',
    coverImageAlt:
      'Commercial semi-trucks lined up at a Wyoming freight terminal at twilight representing TITAN ROUTE DISPATCH (TRD) LLC',
    seoTitle: 'Building Beyond Borders | Mehmood Farooq on US Logistics',
    seoDescription:
      'Mehmood Farooq shares his perspective on building cross-border business discipline and founding TITAN ROUTE DISPATCH (TRD) LLC in Wyoming, USA.',
    seoKeywords:
      'Mehmood Farooq, Mehmood Farooq Entrepreneur, TITAN ROUTE DISPATCH (TRD) LLC, Mehmood Farooq Logistics, Building Beyond Borders',
    canonicalUrl: '',
    readTimeMinutes: 4,
    publishedDate: '2026-11-18',
    isPublished: true,
    content: `## Starting With Curiosity and Operational Discipline

Building an international business requires more than ambition—it demands daily familiarity with how an industry actually moves. When I first began studying the United States trucking and logistics market from Pakistan, I focused on the fundamentals: how carriers plan lanes, how brokers evaluate reliability, and why consistent communication keeps freight moving on schedule.

Working across time zones taught me early that location never limits accountability. What matters to a US carrier or freight broker is responsiveness, preparation, and follow-through on every single load.

## Establishing TITAN ROUTE DISPATCH (TRD) LLC

As my experience in dispatching, sales, and carrier communication matured, I founded **TITAN ROUTE DISPATCH (TRD) LLC**, a United States-based trucking and logistics company registered in Wyoming, USA. Structuring the venture in the United States allowed us to align directly with the operational expectations of American carriers and brokers while continuing to grow from my home base in Pakistan.

- Clear separation between personal identity and US corporate registration in Wyoming, USA
- Focused dispatch support built around carrier communication and lane planning
- Direct accountability on paperwork, rate negotiation, and broker follow-ups

## The Meaning Behind Building Beyond Borders

"Building Beyond Borders" is not just a tagline—it reflects a practical approach to entrepreneurship. Young founders in Pakistan can participate meaningfully in global industries when they commit to learning real skills, maintaining professional standards, and showing up consistently over time.`,
  },
  {
    id: 'post_dispatch_operations_principles',
    slug: 'core-principles-of-us-freight-dispatching-and-carrier-support',
    title: 'Core Principles of Effective US Freight Dispatching and Carrier Support',
    excerpt:
      'Practical operational habits that strengthen carrier relationships, broker communication, and lane planning across US trucking and logistics.',
    category: 'Trucking & Logistics',
    coverImageUrl: '/src/assets/images/business_logistics_highway_1795727163116.jpg',
    coverImageAlt:
      'US interstate freight truck hauling at golden hour representing TITAN ROUTE DISPATCH (TRD) LLC dispatch operations',
    seoTitle: 'US Freight Dispatch Principles | Mehmood Farooq & TRD LLC',
    seoDescription:
      'Explore practical principles of US freight dispatching and carrier operations shared by Mehmood Farooq, founder of TITAN ROUTE DISPATCH (TRD) LLC.',
    seoKeywords:
      'Mehmood Farooq Logistics, Mehmood Farooq TRD, Titan Route Dispatch LLC, US Freight Dispatching',
    canonicalUrl: '',
    readTimeMinutes: 5,
    publishedDate: '2026-11-10',
    isPublished: true,
    content: `## Why Reliability Matters More Than Volume

In US trucking and logistics, a dispatch operation is only as strong as the trust it builds with carriers and brokers. Moving freight efficiently requires attention to timing, route realism, and transparent communication whenever market conditions change.

At TITAN ROUTE DISPATCH (TRD) LLC, our focus centers on structured daily execution rather than shortcuts.

## Three Operational Habits That Protect Carriers

- **Lane Preparation Before Negotiation**: Understanding market rates, deadhead miles, and reload options before calling a broker leads to stronger decisions.
- **Clean Paperwork & Documentation**: Accurate rate confirmations, carrier packets, and prompt updates prevent unnecessary delays at pickup and delivery.
- **Consistent Communication**: Keeping drivers and brokers informed early builds long-term working relationships that endure across freight cycles.

## Looking Ahead in Logistics

Logistics rewards teams that stay calm under pressure and keep refining their systems. Every interaction—from an initial outreach call to final delivery confirmation—contributes to a company's reputation in the marketplace.`,
  },
  {
    id: 'post_entrepreneurial_consistency',
    slug: 'why-discipline-and-consistency-matter-in-entrepreneurship',
    title: 'Why Discipline and Consistency Outlast Short-Term Motivation in Business',
    excerpt:
      'Reflections from Mehmood Farooq on developing professional habits, learning from daily operations, and building a resilient personal brand.',
    category: 'Leadership',
    coverImageUrl: '/src/assets/images/blog_global_strategy_1795733092073.jpg',
    coverImageAlt:
      'Executive leather journal, fountain pen, and brass compass on a dark desk symbolizing Mehmood Farooq business discipline',
    seoTitle: 'Discipline and Consistency in Business | Mehmood Farooq',
    seoDescription:
      'Mehmood Farooq reflects on how discipline, continuous learning, and steady execution shape long-term entrepreneurial growth.',
    seoKeywords:
      'Mehmood Farooq Business Owner, Mehmood Farooq Entrepreneur, Entrepreneurship Discipline, Mehmood Farooq',
    canonicalUrl: '',
    readTimeMinutes: 3,
    publishedDate: '2026-11-02',
    isPublished: true,
    content: `## Beyond Early Enthusiasm

Most people enter business with strong motivation, yet motivation naturally fluctuates from week to week. What separates sustainable ventures from brief experiments is structured discipline—doing the essential work cleanly even on ordinary days.

## Four Habits I Rely On Daily

- **Structure Before Speed**: Organize outreach, follow-ups, and operational priorities before the workday starts.
- **Steady Daily Output**: Small, repeatable improvements in sales and communication compound over months.
- **Continuous Market Study**: Treat every conversation with clients and partners as an opportunity to learn.
- **Direct Accountability**: Stand behind your commitments and communicate clearly when challenges arise.

## Building for the Long Term

Whether managing freight operations for TITAN ROUTE DISPATCH (TRD) LLC or developing my personal brand as Mehmood Farooq, the standard remains constant: stay disciplined, keep learning, and earn trust through consistent execution.`,
  },
];

export const DEFAULT_LIVE_CONTENT: LiveSiteContent = {
  brandName: SITE_CONFIG.brand.name,
  heroHeading: SITE_CONFIG.brand.heroHeading,
  tagline: SITE_CONFIG.brand.tagline,
  profession: SITE_CONFIG.brand.profession,
  location: SITE_CONFIG.brand.location,
  heroDescription: SITE_CONFIG.hero.description,
  heroPortraitUrl: SITE_CONFIG.images.heroPortrait.src,
  heroPortraitAlt: SITE_CONFIG.images.heroPortrait.alt,
  heroPrimaryCtaLabel: SITE_CONFIG.hero.primaryCta,
  heroPrimaryCtaUrl: SITE_CONFIG.hero.primaryCtaUrl,
  heroSecondaryCtaLabel: SITE_CONFIG.hero.secondaryCta,
  heroSecondaryCtaUrl: SITE_CONFIG.hero.secondaryCtaUrl,
  aboutHeading: SITE_CONFIG.about.heading,
  aboutParagraphs: [...SITE_CONFIG.about.paragraphs],
  aboutExperience: [...SITE_CONFIG.about.experience],
  aboutWorkspaceUrl: SITE_CONFIG.images.aboutWorkspace.src,
  aboutWorkspaceAlt: SITE_CONFIG.images.aboutWorkspace.alt,
  businessHeading: SITE_CONFIG.business.heading,
  businessName: SITE_CONFIG.business.name,
  businessCountry: SITE_CONFIG.business.country,
  businessState: SITE_CONFIG.business.state,
  businessRegistration: SITE_CONFIG.business.registration,
  businessIndustry: SITE_CONFIG.business.industry,
  businessDescription: SITE_CONFIG.business.description,
  businessWebsiteUrl: SITE_CONFIG.business.url,
  businessLogoUrl: '',
  businessShowcaseUrl: SITE_CONFIG.images.businessShowcase.src,
  businessShowcaseAlt: SITE_CONFIG.images.businessShowcase.alt,
  businessServices: [...SITE_CONFIG.business.services],
  connectHeading: SITE_CONFIG.connect.heading,
  connectDescription: SITE_CONFIG.connect.description,
  publicEmail: SITE_CONFIG.connect.publicEmail,
  tiktokUrl: SITE_CONFIG.socialLinks[0].url,
  instagramUrl: SITE_CONFIG.socialLinks[1].url,
  linkedinUrl: SITE_CONFIG.socialLinks[2].url,
  facebookUrl: SITE_CONFIG.socialLinks[3].url,
  customSocialLinks: [],
  welcomeEnabled: true,
  welcomeName: 'MEHMOOD FAROOQ',
  welcomeTagline: 'BUILDING BEYOND BORDERS.',
  welcomeDurationMs: 3600,
  welcomeBgColor: '#080808',
  welcomeStyle: 'cinematic',
  seoTitle:
    'Mehmood Farooq | Entrepreneur & Founder of TITAN ROUTE DISPATCH (TRD) LLC',
  seoDescription:
    'Discover Mehmood Farooq, an entrepreneur and founder of TITAN ROUTE DISPATCH (TRD) LLC, a US-based trucking and logistics company registered in Wyoming.',
  seoKeywords:
    'Mehmood Farooq, Mehmood Farooq Entrepreneur, Mehmood Farooq Business Owner, Mehmood Farooq TRD, Titan Route Dispatch LLC, Mehmood Farooq Logistics, TITAN ROUTE DISPATCH (TRD) LLC',
  seoOgImageUrl: SITE_CONFIG.images.heroPortrait.src,
  seoFaviconUrl: '',
  siteBaseUrl: '',
  canonicalUrl: '',
  googleSiteVerification: '',
  pageSeo: DEFAULT_PAGE_SEO,
  footerDescription: SITE_CONFIG.brand.tagline,
  footerCopyright: SITE_CONFIG.brand.copyright,
  sectionVisibility: {
    about: true,
    journey: true,
    business: true,
    principles: true,
    connect: true,
  },
};

function normalizePageSeo(rawPageSeo: unknown): PageSeoMap {
  const src = (rawPageSeo && typeof rawPageSeo === 'object'
    ? rawPageSeo
    : {}) as Partial<Record<PublicPageKey, Partial<PageSeoEntry>>>;

  const keys: PublicPageKey[] = [
    'about',
    'journey',
    'business',
    'experience',
    'contact',
    'blog',
  ];

  const result = {} as PageSeoMap;
  for (const key of keys) {
    const fallback = DEFAULT_PAGE_SEO[key];
    const incoming = src[key] || {};
    result[key] = {
      title:
        typeof incoming.title === 'string' && incoming.title.trim()
          ? incoming.title
          : fallback.title,
      description:
        typeof incoming.description === 'string' && incoming.description.trim()
          ? incoming.description
          : fallback.description,
      keywords:
        typeof incoming.keywords === 'string' && incoming.keywords.trim()
          ? incoming.keywords
          : fallback.keywords,
      canonicalUrl:
        typeof incoming.canonicalUrl === 'string' ? incoming.canonicalUrl : '',
      ogImageUrl:
        typeof incoming.ogImageUrl === 'string' ? incoming.ogImageUrl : '',
    };
  }
  return result;
}

export function normalizeSiteConfig(
  raw: Record<string, unknown> | undefined | null
): LiveSiteContent {
  if (!raw) return DEFAULT_LIVE_CONTENT;

  const legacyParagraphs = [
    raw.aboutParagraph1,
    raw.aboutParagraph2,
    raw.aboutParagraph3,
  ].filter((p): p is string => typeof p === 'string' && p.trim().length > 0);

  const aboutParagraphs = Array.isArray(raw.aboutParagraphs)
    ? raw.aboutParagraphs.filter(
        (p): p is string => typeof p === 'string' && p.trim().length > 0
      )
    : legacyParagraphs.length > 0
      ? legacyParagraphs
      : DEFAULT_LIVE_CONTENT.aboutParagraphs;

  const rawVis = (raw.sectionVisibility || {}) as Partial<SectionVisibility>;
  const upgradeLegacyCompanyText = (val: unknown, fallback: string): string => {
    if (typeof val !== 'string' || !val.trim()) return fallback;
    return val.replace(
      /Titan Route Dispatch\s*\(TRD LLC\)/gi,
      'TITAN ROUTE DISPATCH (TRD) LLC'
    );
  };

  const merged = {
    ...DEFAULT_LIVE_CONTENT,
    ...(raw as Partial<LiveSiteContent>),
  };

  const resolvedState =
    typeof raw.businessState === 'string' && raw.businessState.trim()
      ? raw.businessState
      : typeof raw.businessRegistration === 'string' &&
          raw.businessRegistration.trim()
        ? raw.businessRegistration
        : DEFAULT_LIVE_CONTENT.businessState;

  const resolvedCountry =
    typeof raw.businessCountry === 'string' && raw.businessCountry.trim()
      ? raw.businessCountry
      : DEFAULT_LIVE_CONTENT.businessCountry;

  const normalizedExperience = (
    Array.isArray(raw.aboutExperience)
      ? (raw.aboutExperience as AboutExperienceItem[])
      : DEFAULT_LIVE_CONTENT.aboutExperience
  ).map((exp) => ({
    ...exp,
    organization: upgradeLegacyCompanyText(exp.organization, exp.organization),
  }));

  // Upgrade older default homepage SEO/H1 strings if still set to earlier placeholders
  const rawSeoTitle = typeof merged.seoTitle === 'string' ? merged.seoTitle.trim() : '';
  const resolvedSeoTitle =
    !rawSeoTitle ||
    rawSeoTitle ===
      'Mehmood Farooq | Entrepreneur & Logistics Professional — Building Beyond Borders'
      ? DEFAULT_LIVE_CONTENT.seoTitle
      : rawSeoTitle;

  const rawHeroHeading =
    typeof merged.heroHeading === 'string' ? merged.heroHeading.trim() : '';
  const resolvedHeroHeading =
    !rawHeroHeading
      ? DEFAULT_LIVE_CONTENT.heroHeading
      : rawHeroHeading;

  const rawSeoDesc = upgradeLegacyCompanyText(
    merged.seoDescription,
    DEFAULT_LIVE_CONTENT.seoDescription
  );
  const resolvedSeoDesc =
    rawSeoDesc ===
    'Mehmood Farooq is an entrepreneur from Pakistan and founder of TITAN ROUTE DISPATCH (TRD) LLC, a United States-based trucking and logistics company registered in Wyoming, USA.'
      ? DEFAULT_LIVE_CONTENT.seoDescription
      : rawSeoDesc;

  // Upgrade anchor CTA URLs from single-page hashes to dedicated SEO pages if unchanged
  const resolvedPrimaryCtaUrl =
    merged.heroPrimaryCtaUrl === '#journey'
      ? '/journey'
      : merged.heroPrimaryCtaUrl;
  const resolvedSecondaryCtaUrl =
    merged.heroSecondaryCtaUrl === '#connect'
      ? '/contact'
      : merged.heroSecondaryCtaUrl;

  return {
    ...merged,
    heroHeading: resolvedHeroHeading,
    heroPortraitAlt:
      typeof raw.heroPortraitAlt === 'string' && raw.heroPortraitAlt.trim()
        ? raw.heroPortraitAlt
        : DEFAULT_LIVE_CONTENT.heroPortraitAlt,
    heroPrimaryCtaUrl: resolvedPrimaryCtaUrl,
    heroSecondaryCtaUrl: resolvedSecondaryCtaUrl,
    aboutWorkspaceAlt:
      typeof raw.aboutWorkspaceAlt === 'string' && raw.aboutWorkspaceAlt.trim()
        ? raw.aboutWorkspaceAlt
        : DEFAULT_LIVE_CONTENT.aboutWorkspaceAlt,
    businessName: upgradeLegacyCompanyText(
      merged.businessName,
      DEFAULT_LIVE_CONTENT.businessName
    ),
    businessCountry: resolvedCountry,
    businessState: resolvedState,
    businessRegistration: resolvedState,
    businessShowcaseAlt:
      typeof raw.businessShowcaseAlt === 'string' &&
      raw.businessShowcaseAlt.trim()
        ? raw.businessShowcaseAlt
        : DEFAULT_LIVE_CONTENT.businessShowcaseAlt,
    seoTitle: resolvedSeoTitle,
    seoDescription: resolvedSeoDesc,
    seoKeywords: upgradeLegacyCompanyText(
      merged.seoKeywords,
      DEFAULT_LIVE_CONTENT.seoKeywords
    ),
    siteBaseUrl: typeof raw.siteBaseUrl === 'string' ? raw.siteBaseUrl : '',
    canonicalUrl: typeof raw.canonicalUrl === 'string' ? raw.canonicalUrl : '',
    googleSiteVerification:
      typeof raw.googleSiteVerification === 'string'
        ? raw.googleSiteVerification
        : '',
    pageSeo: normalizePageSeo(raw.pageSeo),
    aboutParagraphs:
      aboutParagraphs.length > 0
        ? aboutParagraphs
        : DEFAULT_LIVE_CONTENT.aboutParagraphs,
    aboutExperience: normalizedExperience,
    businessServices: Array.isArray(raw.businessServices)
      ? (raw.businessServices as BusinessServiceItem[])
      : DEFAULT_LIVE_CONTENT.businessServices,
    customSocialLinks: Array.isArray(raw.customSocialLinks)
      ? (raw.customSocialLinks as CustomSocialLink[])
      : DEFAULT_LIVE_CONTENT.customSocialLinks,
    sectionVisibility: {
      about: rawVis.about ?? true,
      journey: rawVis.journey ?? true,
      business: rawVis.business ?? true,
      principles: rawVis.principles ?? true,
      connect: rawVis.connect ?? true,
    },
  };
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function clampString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function sanitizeHref(url: string): string {
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return '#';
}
