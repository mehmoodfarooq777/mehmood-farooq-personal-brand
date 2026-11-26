import { Check, Eye, X } from 'lucide-react';
import type {
  JourneyStage,
  LiveSiteContent,
  PrincipleItem,
} from '../../data/siteConfig';
import { Navbar } from '../Navbar';
import { HeroSection } from '../HeroSection';
import { AboutSection } from '../AboutSection';
import { JourneySection } from '../JourneySection';
import { BusinessSection } from '../BusinessSection';
import { PrinciplesSection } from '../PrinciplesSection';
import { ConnectSection } from '../ConnectSection';
import { Footer } from '../Footer';

interface SitePreviewModalProps {
  content: LiveSiteContent;
  stages: JourneyStage[];
  principles: PrincipleItem[];
  onPublish: () => void;
  onClose: () => void;
}

export function SitePreviewModal({
  content,
  stages,
  principles,
  onPublish,
  onClose,
}: SitePreviewModalProps) {
  const publishedStages = stages.filter((s) => s.isPublished !== false);
  const publishedPrinciples = principles.filter((p) => p.isPublished !== false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Draft website preview"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#080808] text-[#F5F5F4]"
    >
      {/* Preview Control Bar */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 border-b border-[#D4AF37]/40 bg-[#151515]/95 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3 text-xs font-semibold tracking-wider text-[#F2D675] uppercase">
          <Eye className="h-4 w-4" aria-hidden="true" />
          <span>Live Draft Preview Mode</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPublish}
            className="inline-flex min-h-[38px] items-center gap-2 bg-[#D4AF37] px-4 py-1.5 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Publish Changes</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[38px] items-center gap-1.5 border border-white/20 bg-[#080808] px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase hover:border-[#D4AF37]"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Editor</span>
          </button>
        </div>
      </div>

      <Navbar
        brandName={content.brandName}
        sectionVisibility={content.sectionVisibility}
      />

      <main>
        <HeroSection content={content} />
        {content.sectionVisibility.about && <AboutSection content={content} />}
        {content.sectionVisibility.journey && (
          <JourneySection stages={publishedStages} />
        )}
        {content.sectionVisibility.business && (
          <BusinessSection content={content} />
        )}
        {content.sectionVisibility.principles && (
          <PrinciplesSection items={publishedPrinciples} />
        )}
        {content.sectionVisibility.connect && (
          <ConnectSection content={content} isPreview />
        )}
      </main>

      <Footer content={content} />
    </div>
  );
}
