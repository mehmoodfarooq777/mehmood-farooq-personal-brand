import type { MouseEvent } from 'react';
import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { sanitizeHref, type LiveSiteContent } from '../data/siteConfig';
import { ExecutiveImage } from './ExecutiveImage';

interface HeroSectionProps {
  content: LiveSiteContent;
  onNavigate?: (path: string) => void;
}

export function HeroSection({ content, onNavigate }: HeroSectionProps) {
  const isExternalPrimary = content.heroPrimaryCtaUrl.startsWith('http');
  const isExternalSecondary = content.heroSecondaryCtaUrl.startsWith('http');

  const handleCtaClick = (e: MouseEvent<HTMLAnchorElement>, url: string) => {
    if (!onNavigate || !url.startsWith('/')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onNavigate(url);
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden border-b border-white/10 bg-[#080808] py-14 lg:py-20"
    >
      {/* Subtle ambient gold vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(212,175,55,0.08),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Typographic Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-7"
          >
            {/* Unboxed Metadata Kicker */}
            <p className="mb-5 text-xs font-medium tracking-[0.18em] text-[#D4AF37] uppercase sm:text-sm">
              {content.profession}{' '}
              <span aria-hidden="true" className="mx-1.5 text-white/30">
                ·
              </span>{' '}
              {content.location}
            </p>

            {/* Primary Display H1 */}
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-[#F5F5F4] text-balance sm:text-5xl lg:text-[3.6rem]">
              {content.heroHeading}
            </h1>

            {/* Tagline Subheading */}
            <p className="mt-4 font-display text-2xl font-medium italic tracking-wide text-[#F2D675] sm:text-3xl">
              {content.tagline}
            </p>

            <div className="my-7 h-px w-20 bg-[#D4AF37]/60" aria-hidden="true" />

            {/* Executive Description */}
            <p className="max-w-xl text-base leading-relaxed text-[#B8B8B3] sm:text-lg">
              {content.heroDescription}
            </p>

            {/* Action Controls */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={sanitizeHref(content.heroPrimaryCtaUrl)}
                onClick={(e) => handleCtaClick(e, content.heroPrimaryCtaUrl)}
                target={isExternalPrimary ? '_blank' : undefined}
                rel={isExternalPrimary ? 'noopener noreferrer' : undefined}
                className="inline-flex min-h-[46px] items-center gap-2.5 bg-[#D4AF37] px-7 py-3 text-sm font-semibold tracking-wide text-[#080808] transition-colors duration-200 hover:bg-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2D675] whitespace-nowrap shrink-0"
              >
                <span>{content.heroPrimaryCtaLabel}</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href={sanitizeHref(content.heroSecondaryCtaUrl)}
                onClick={(e) => handleCtaClick(e, content.heroSecondaryCtaUrl)}
                target={isExternalSecondary ? '_blank' : undefined}
                rel={isExternalSecondary ? 'noopener noreferrer' : undefined}
                className="inline-flex min-h-[46px] items-center gap-2.5 border border-[#D4AF37]/45 bg-[#151515] px-7 py-3 text-sm font-medium tracking-wide text-[#F5F5F4] transition-colors duration-200 hover:border-[#F2D675] hover:text-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] whitespace-nowrap shrink-0"
              >
                <span>{content.heroSecondaryCtaLabel}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </motion.div>

          {/* Right Portrait Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex lg:col-span-5"
          >
            <div className="relative w-full overflow-hidden border border-[#D4AF37]/30 bg-[#151515] p-2.5 sm:p-3">
              <div className="relative aspect-[3/4] w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[500px]">
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
                  imgClassName="object-top transition-transform duration-500 hover:scale-[1.02]"
                  fallbackTitle={content.brandName}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent"
                />
                <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between border-t border-white/15 pt-3 text-xs tracking-wider text-[#D4D4D0] uppercase">
                  <span>{content.brandName}</span>
                  <span className="text-[#F2D675]">{content.location}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
