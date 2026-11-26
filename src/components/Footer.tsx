import type { MouseEvent } from 'react';
import { Globe } from 'lucide-react';
import { type LiveSiteContent, type SocialProfile } from '../data/siteConfig';
import { SocialIcon } from './SocialIcons';

interface FooterProps {
  content: LiveSiteContent;
  onNavigate?: (path: string) => void;
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

export function Footer({ content, onNavigate }: FooterProps) {
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

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!onNavigate) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="bg-[#080808] py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-center">
          <div>
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
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
            className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-[#9E9E98]"
          >
            {content.sectionVisibility.about && (
              <a
                href="/about"
                onClick={(e) => handleLinkClick(e, '/about')}
                className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
              >
                About
              </a>
            )}
            {content.sectionVisibility.journey && (
              <a
                href="/journey"
                onClick={(e) => handleLinkClick(e, '/journey')}
                className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
              >
                Journey
              </a>
            )}
            {content.sectionVisibility.business && (
              <a
                href="/business"
                onClick={(e) => handleLinkClick(e, '/business')}
                className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
              >
                Business
              </a>
            )}
            <a
              href="/experience"
              onClick={(e) => handleLinkClick(e, '/experience')}
              className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
            >
              Experience
            </a>
            <a
              href="/blog"
              onClick={(e) => handleLinkClick(e, '/blog')}
              className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
            >
              Blog
            </a>
            <a
              href="/contact"
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
            >
              Contact
            </a>
            <a
              href={safeHref(content.businessWebsiteUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#F2D675] whitespace-nowrap"
            >
              {content.businessName}
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
            {content.businessName} · Registered in{' '}
            {content.businessState || content.businessRegistration},{' '}
            {content.businessCountry}
          </p>
        </div>
      </div>
    </footer>
  );
}
