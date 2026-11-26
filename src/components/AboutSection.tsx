import { SITE_CONFIG, type LiveSiteContent } from '../data/siteConfig';
import { ExecutiveImage } from './ExecutiveImage';

interface AboutSectionProps {
  content: LiveSiteContent;
}

export function AboutSection({ content }: AboutSectionProps) {
  const paragraphs = content.aboutParagraphs.filter((p) => p.trim().length > 0);
  const experience = content.aboutExperience || [];

  return (
    <section
      id="about"
      className="border-b border-white/10 bg-[#0C0C0C] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Visual & Executive Profile Summary */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-5">
            <div className="border border-white/10 bg-[#151515] p-2.5">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <ExecutiveImage
                  src={content.aboutWorkspaceUrl}
                  alt={SITE_CONFIG.images.aboutWorkspace.alt}
                  className="h-full w-full"
                  fallbackTitle="Executive Vision"
                />
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-4 border border-white/10 bg-[#151515] p-6 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Company
                </dt>
                <dd className="text-right text-sm font-medium text-[#F2D675]">
                  {content.businessName}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Company Country
                </dt>
                <dd className="text-right text-sm font-medium text-[#F5F5F4]">
                  {content.businessCountry}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Registered State
                </dt>
                <dd className="text-right text-sm font-medium text-[#F5F5F4]">
                  {content.businessState || content.businessRegistration}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Industry
                </dt>
                <dd className="text-right text-sm font-medium text-[#F5F5F4]">
                  {content.businessIndustry}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Personal Base
                </dt>
                <dd className="text-right text-sm font-medium text-[#F5F5F4]">
                  {content.location}
                </dd>
              </div>
            </dl>
          </div>

          {/* Right Editorial Narrative & Professional Experience */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
              {SITE_CONFIG.about.kicker}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] text-balance sm:text-4xl lg:text-5xl">
              {content.aboutHeading}
            </h2>
            <div className="my-7 h-px w-16 bg-[#D4AF37]/60" aria-hidden="true" />

            <div className="space-y-6 text-base leading-relaxed text-[#C2C2BC] sm:text-lg">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === paragraphs.length - 1
                      ? 'font-medium text-[#F5F5F4]'
                      : ''
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {experience.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="border border-white/10 bg-[#151515] p-5"
                  >
                    <p className="text-xs font-medium tracking-wider text-[#D4AF37] uppercase">
                      {exp.period}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-[#F5F5F4]">
                      {exp.role}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-[#9E9E98]">
                      {exp.organization}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#B8B8B3]">
                      {exp.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
