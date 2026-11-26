import { SITE_CONFIG, type PrincipleItem } from '../data/siteConfig';

interface PrinciplesSectionProps {
  items: PrincipleItem[];
}

export function PrinciplesSection({ items }: PrinciplesSectionProps) {
  return (
    <section
      id="principles"
      className="border-b border-white/10 bg-[#080808] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
            {SITE_CONFIG.principles.kicker}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] text-balance sm:text-4xl lg:text-5xl">
            {SITE_CONFIG.principles.heading}
          </h2>
          <div className="mt-6 h-px w-16 bg-[#D4AF37]/60" aria-hidden="true" />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((principle) => (
            <article
              key={principle.id || principle.number}
              className="group flex flex-col justify-between border border-white/10 bg-[#151515] p-7 transition-colors duration-200 hover:border-[#D4AF37]/50"
            >
              <div>
                <span className="font-display text-xl font-semibold tabular-nums text-[#D4AF37] transition-colors duration-200 group-hover:text-[#F2D675]">
                  {principle.number}
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-[#F5F5F4]">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#B8B8B3]">
                  {principle.summary}
                </p>
              </div>
              <div
                aria-hidden="true"
                className="mt-8 h-px w-full bg-white/10 transition-colors duration-200 group-hover:bg-[#D4AF37]/40"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
