import type { MouseEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { SITE_CONFIG, type JourneyStage } from '../data/siteConfig';
import { ExecutiveImage } from './ExecutiveImage';

interface JourneySectionProps {
  stages: JourneyStage[];
  onNavigate?: (path: string) => void;
}

export function JourneySection({ stages, onNavigate }: JourneySectionProps) {
  const handleNav = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!onNavigate) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <section
      id="journey"
      className="border-b border-white/10 bg-[#080808] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
              {SITE_CONFIG.journey.kicker}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] text-balance sm:text-4xl lg:text-5xl">
              {SITE_CONFIG.journey.heading}
            </h2>
            <div className="mt-6 h-px w-16 bg-[#D4AF37]/60" aria-hidden="true" />
          </div>

          <a
            href="/journey"
            onClick={(e) => handleNav(e, '/journey')}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase transition-colors hover:text-[#F2D675] shrink-0"
          >
            <span>Explore Full Journey</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        {/* Architectural Timeline */}
        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, idx) => (
            <li
              key={stage.id || stage.step}
              className="group relative flex flex-col justify-between border border-white/10 bg-[#151515] p-7 transition-colors duration-200 hover:border-[#D4AF37]/50"
            >
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <span className="font-display text-2xl font-semibold tabular-nums text-[#D4AF37] transition-colors duration-200 group-hover:text-[#F2D675]">
                    {stage.step}
                  </span>
                  <span className="text-xs font-medium tracking-wider text-[#8C8C86] uppercase">
                    {stage.dateLabel || `Stage ${idx + 1}`}
                  </span>
                </div>

                {stage.imageUrl && (
                  <div className="mt-5 aspect-[16/10] w-full overflow-hidden border border-white/10">
                    <ExecutiveImage
                      src={stage.imageUrl}
                      alt={`${stage.title} — Mehmood Farooq Entrepreneurial Journey`}
                      width={800}
                      height={500}
                      className="h-full w-full"
                      fallbackTitle={stage.title}
                    />
                  </div>
                )}

                <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-[#F5F5F4]">
                  {stage.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-[#B8B8B3] sm:text-base">
                  {stage.description}
                </p>
              </div>

              <div
                aria-hidden="true"
                className="mt-8 h-px w-8 bg-[#D4AF37]/30 transition-all duration-200 group-hover:w-16 group-hover:bg-[#D4AF37]"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
