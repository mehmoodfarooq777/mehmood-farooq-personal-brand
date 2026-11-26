import { Globe } from 'lucide-react';
import { type LiveSiteContent, type SocialProfile } from '../data/siteConfig';
import { SocialIcon } from './SocialIcons';

interface FooterProps {
  content: LiveSiteContent;
}

function safeHref(url: string): string {
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

export function Footer({ content }: FooterProps) {
  const socialProfiles: SocialProfile[] = [
    {
      id: 'tiktok',
      name: 'TikTok',
      label: 'Connect on TikTok',
      url: content.tiktokUrl,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      label: 'Connect on Instagram',
      url: content.instagramUrl,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      label: 'Connect on LinkedIn',
      url: content.linkedinUrl,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      label: 'Connect on Facebook',
      url: content.facebookUrl,
    },
  ];

  const customSocials = (content.customSocialLinks || []).filter(
    (s) => s.label.trim() && s.url.trim()
  );

  return (
    <footer className="bg-[#080808] py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-10 md:flex-row md:items-center">
          <div>
            <a
              href="#top"
              className="font-display text-2xl font-semibold tracking-wide text-[#F5F5F4] transition-colors hover:text-[#F2D675]"
            >
              {content.brandName}
            </a>
            <p className="mt-1.5 text-sm font-medium tracking-wide text-[#D4AF37]">
              {content.footerDescription || content.tagline}
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-6 text-sm text-[#9E9E98]"
          >
            {content.sectionVisibility.about && (
              <a
                href="#about"
                className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
              >
                About
              </a>
            )}
            {content.sectionVisibility.journey && (
              <a
                href="#journey"
                className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
              >
                Journey
              </a>
            )}
            {content.sectionVisibility.business && (
              <a
                href="#business"
                className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
              >
                Business
              </a>
            )}
            {content.sectionVisibility.principles && (
              <a
                href="#principles"
                className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
              >
                Principles
              </a>
            )}
            <a
              href={safeHref(content.businessWebsiteUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
            >
              TRD LLC
            </a>
            <a
              href={`mailto:${content.publicEmail}`}
              className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
            >
              {content.publicEmail}
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            {socialProfiles.map((social) => (
              <a
                key={social.id}
                href={safeHref(social.url)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#151515] text-[#B8B8B3] transition-colors duration-200 hover:border-[#D4AF37]/60 hover:text-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
              >
                <SocialIcon id={social.id} className="h-4 w-4" />
              </a>
            ))}
            {customSocials.map((custom, idx) => (
              <a
                key={idx}
                href={safeHref(custom.url)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={custom.label}
                className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#151515] text-[#B8B8B3] transition-colors duration-200 hover:border-[#D4AF37]/60 hover:text-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs tracking-wide text-[#8C8C86] sm:flex-row sm:items-center">
          <p>{content.footerCopyright}</p>
          <p>
            {content.businessName} · {content.businessRegistration}
          </p>
        </div>
      </div>
    </footer>
  );
}
