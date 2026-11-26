import { ArrowUpRight, Truck } from 'lucide-react';
import { sanitizeHref, SITE_CONFIG, type LiveSiteContent } from '../data/siteConfig';
import { ExecutiveImage } from './ExecutiveImage';

interface BusinessSectionProps {
  content: LiveSiteContent;
}

export function BusinessSection({ content }: BusinessSectionProps) {
  const services = content.businessServices || [];

  return (
    <section
      id="business"
      className="border-b border-white/10 bg-[#0C0C0C] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
            {SITE_CONFIG.business.kicker}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] text-balance sm:text-4xl lg:text-5xl">
            {content.businessHeading}
          </h2>
          <div className="mt-6 h-px w-16 bg-[#D4AF37]/60" aria-hidden="true" />
        </div>

        {/* Featured Venture Card */}
        <div className="mt-14 grid grid-cols-1 items-stretch border border-[#D4AF37]/25 bg-[#151515] lg:grid-cols-12">
          {/* Visual Column */}
          <div className="relative overflow-hidden border-b border-white/10 lg:col-span-7 lg:border-r lg:border-b-0">
            <div className="aspect-video h-full w-full">
              <ExecutiveImage
                src={content.businessShowcaseUrl}
                alt={SITE_CONFIG.images.businessShowcase.alt}
                className="h-full w-full"
                imgClassName="transition-transform duration-500 hover:scale-[1.02]"
                fallbackTitle={content.businessName}
              />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#151515]/50"
            />
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-5 lg:p-12">
            <div>
              <div className="flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-[#D4AF37] uppercase">
                {content.businessLogoUrl ? (
                  <img
                    src={content.businessLogoUrl}
                    alt={`${content.businessName} logo`}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 border border-[#D4AF37]/30 bg-[#080808] object-contain p-0.5"
                  />
                ) : (
                  <Truck className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />
                )}
                <span>Featured Business</span>
              </div>

              <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] text-balance sm:text-4xl">
                {content.businessName}
              </h3>

              <div className="my-6 h-px w-12 bg-[#D4AF37]/50" aria-hidden="true" />

              <p className="text-base leading-relaxed text-[#C2C2BC]">
                {content.businessDescription}
              </p>

              <dl className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-xs tracking-wider uppercase">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#8C8C86]">Registration</dt>
                  <dd className="font-medium text-[#F2D675]">
                    {content.businessRegistration}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#8C8C86]">Industry</dt>
                  <dd className="font-medium text-[#D4D4D0]">
                    {content.businessIndustry}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-10 pt-4">
              <a
                href={sanitizeHref(content.businessWebsiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] items-center gap-2.5 bg-[#D4AF37] px-7 py-3 text-sm font-semibold tracking-wide text-[#080808] transition-colors duration-200 hover:bg-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2D675] whitespace-nowrap shrink-0"
              >
                <span>{SITE_CONFIG.business.ctaLabel}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Business Services Grid */}
        {services.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="border border-white/10 bg-[#151515] p-6 transition-colors duration-200 hover:border-[#D4AF37]/40"
              >
                <span className="font-display text-lg font-semibold tabular-nums text-[#D4AF37]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#F5F5F4]">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#B8B8B3]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
