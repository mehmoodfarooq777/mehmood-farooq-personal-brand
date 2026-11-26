/**
 * Centralized content, media, and schema definitions for Mehmood Farooq's personal brand website & CMS.
 */

export type WelcomeAnimationStyle = 'cinematic' | 'editorial' | 'minimal';

export type MediaCategory =
  | 'profile'
  | 'hero'
  | 'about'
  | 'journey'
  | 'business'
  | 'seo'
  | 'general';

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
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaUrl: string;
  aboutHeading: string;
  aboutParagraphs: string[];
  aboutExperience: AboutExperienceItem[];
  aboutWorkspaceUrl: string;
  businessHeading: string;
  businessName: string;
  businessRegistration: string;
  businessIndustry: string;
  businessDescription: string;
  businessWebsiteUrl: string;
  businessLogoUrl: string;
  businessShowcaseUrl: string;
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
    heroHeading: 'MEHMOOD FAROOQ',
    tagline: 'Building Beyond Borders.',
    profession: 'Entrepreneur | Business Owner | Logistics Professional',
    location: 'Pakistan',
    copyright: '© 2026 Mehmood Farooq. All Rights Reserved.',
  },

  images: {
    heroPortrait: {
      src: '/src/assets/images/hero_executive_portrait_1795727162039.jpg',
      alt: 'Mehmood Farooq — Entrepreneur and Logistics Professional',
    },
    aboutWorkspace: {
      src: '/src/assets/images/vision_executive_workspace_1795727162915.jpg',
      alt: 'Minimalist luxury executive desk overlooking a twilight skyline',
    },
    businessShowcase: {
      src: '/src/assets/images/business_logistics_highway_1795727163116.jpg',
      alt: 'Commercial freight truck operating along a US interstate highway at golden hour',
    },
  },

  hero: {
    description:
      'A young entrepreneur from Pakistan, building experience in international business, logistics, and entrepreneurship.',
    primaryCta: 'Explore My Journey',
    primaryCtaUrl: '#journey',
    secondaryCta: 'Connect With Me',
    secondaryCtaUrl: '#connect',
  },

  about: {
    kicker: 'About Me',
    heading: 'The Journey Behind the Vision',
    paragraphs: [
      'My journey started with an interest in business and a determination to build something meaningful. I began working in the US trucking and logistics industry at a young age, gaining practical experience in dispatching, operations, communication, and sales.',
      'Today, I am focused on developing my entrepreneurial skills, growing my business, and building opportunities beyond borders.',
      'I believe success comes from consistency, learning, discipline, and taking action.',
    ],
    experience: [
      {
        role: 'Founder & Business Owner',
        organization: 'Titan Route Dispatch (TRD LLC)',
        period: 'Present',
        summary:
          'Leading dispatch operations, carrier support, and client growth across the US freight market.',
      },
      {
        role: 'Logistics & Dispatch Operations',
        organization: 'US Trucking Industry',
        period: 'Early Career',
        summary:
          'Built hands-on expertise in freight dispatching, rate negotiation, broker communication, and sales.',
      },
    ] as AboutExperienceItem[],
  },

  journey: {
    kicker: 'Progression',
    heading: 'My Journey',
    stages: [
      {
        id: 'stage-01',
        step: '01',
        order: 1,
        dateLabel: 'Foundation',
        title: 'The Beginning',
        description: 'Started learning about trucking and logistics.',
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
          'Developed practical experience in US trucking operations and dispatching.',
        imageUrl: '',
        isPublished: true,
      },
      {
        id: 'stage-03',
        step: '03',
        order: 3,
        dateLabel: 'Venture',
        title: 'Entrepreneurship',
        description:
          'Started building business opportunities and working with clients.',
        imageUrl: '',
        isPublished: true,
      },
      {
        id: 'stage-04',
        step: '04',
        order: 4,
        dateLabel: '2026 & Beyond',
        title: 'The Vision',
        description:
          'Growing internationally and developing a strong personal brand.',
        imageUrl: '',
        isPublished: true,
      },
    ] as JourneyStage[],
  },

  business: {
    kicker: 'Venture',
    heading: 'Business & Entrepreneurship',
    name: 'Titan Route Dispatch (TRD LLC)',
    registration: 'Wyoming, USA',
    industry: 'Trucking and Logistics',
    description:
      'Providing professional dispatch support and logistics solutions for the US trucking industry.',
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
      'For business opportunities, professional connections, and collaborations, reach out via our official business email or connect through my social media profiles.',
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

export const DEFAULT_LIVE_CONTENT: LiveSiteContent = {
  brandName: SITE_CONFIG.brand.name,
  heroHeading: SITE_CONFIG.brand.heroHeading,
  tagline: SITE_CONFIG.brand.tagline,
  profession: SITE_CONFIG.brand.profession,
  location: SITE_CONFIG.brand.location,
  heroDescription: SITE_CONFIG.hero.description,
  heroPortraitUrl: SITE_CONFIG.images.heroPortrait.src,
  heroPrimaryCtaLabel: SITE_CONFIG.hero.primaryCta,
  heroPrimaryCtaUrl: SITE_CONFIG.hero.primaryCtaUrl,
  heroSecondaryCtaLabel: SITE_CONFIG.hero.secondaryCta,
  heroSecondaryCtaUrl: SITE_CONFIG.hero.secondaryCtaUrl,
  aboutHeading: SITE_CONFIG.about.heading,
  aboutParagraphs: [...SITE_CONFIG.about.paragraphs],
  aboutExperience: [...SITE_CONFIG.about.experience],
  aboutWorkspaceUrl: SITE_CONFIG.images.aboutWorkspace.src,
  businessHeading: SITE_CONFIG.business.heading,
  businessName: SITE_CONFIG.business.name,
  businessRegistration: SITE_CONFIG.business.registration,
  businessIndustry: SITE_CONFIG.business.industry,
  businessDescription: SITE_CONFIG.business.description,
  businessWebsiteUrl: SITE_CONFIG.business.url,
  businessLogoUrl: '',
  businessShowcaseUrl: SITE_CONFIG.images.businessShowcase.src,
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
    'Mehmood Farooq | Entrepreneur & Logistics Professional — Building Beyond Borders',
  seoDescription:
    'Mehmood Farooq is a young entrepreneur from Pakistan and founder of Titan Route Dispatch (TRD LLC), building international business and US logistics solutions.',
  seoKeywords:
    'Mehmood Farooq, Titan Route Dispatch, TRD LLC, US Trucking Dispatch, Logistics Entrepreneur, Pakistan Entrepreneur, Building Beyond Borders',
  seoOgImageUrl: SITE_CONFIG.images.heroPortrait.src,
  seoFaviconUrl: '',
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

export function normalizeSiteConfig(
  raw: Record<string, unknown> | undefined | null
): LiveSiteContent {
  if (!raw) return DEFAULT_LIVE_CONTENT;

  // Support migrating legacy aboutParagraph1/2/3 fields if present
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

  return {
    ...DEFAULT_LIVE_CONTENT,
    ...(raw as Partial<LiveSiteContent>),
    aboutParagraphs:
      aboutParagraphs.length > 0
        ? aboutParagraphs
        : DEFAULT_LIVE_CONTENT.aboutParagraphs,
    aboutExperience: Array.isArray(raw.aboutExperience)
      ? (raw.aboutExperience as AboutExperienceItem[])
      : DEFAULT_LIVE_CONTENT.aboutExperience,
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

