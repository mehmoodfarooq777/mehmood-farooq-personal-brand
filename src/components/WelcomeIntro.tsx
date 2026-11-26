import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type { WelcomeAnimationStyle } from '../data/siteConfig';

interface WelcomeIntroProps {
  name: string;
  tagline: string;
  durationMs: number;
  bgColor: string;
  styleVariant: WelcomeAnimationStyle;
  isPreview?: boolean;
  onComplete: () => void;
}

const AMBIENT_PARTICLES = [
  { id: 1, left: '22%', top: '34%', delay: 0.25, duration: 2.8, size: 2 },
  { id: 2, left: '76%', top: '28%', delay: 0.45, duration: 3.1, size: 2 },
  { id: 3, left: '34%', top: '68%', delay: 0.35, duration: 2.6, size: 3 },
  { id: 4, left: '66%', top: '64%', delay: 0.55, duration: 3.0, size: 2 },
  { id: 5, left: '48%', top: '22%', delay: 0.4, duration: 2.9, size: 2 },
  { id: 6, left: '54%', top: '74%', delay: 0.5, duration: 2.7, size: 2 },
];

export function WelcomeIntro({
  name,
  tagline,
  durationMs,
  bgColor,
  styleVariant,
  isPreview = false,
  onComplete,
}: WelcomeIntroProps) {
  const [exiting, setExiting] = useState(false);

  const safeDuration = Math.min(6000, Math.max(2000, durationMs || 3600));
  const scaleFactor = safeDuration / 3600;
  const fadeOutMs = 520;
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion && !isPreview) {
      onComplete();
      return;
    }

    const exitStart = Math.max(800, safeDuration - fadeOutMs);
    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, exitStart);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, safeDuration);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeDuration, reducedMotion, isPreview]);

  function handleSkip() {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => {
      onComplete();
    }, 200);
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome introduction"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? 0.5 : 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{ backgroundColor: bgColor || '#080808' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 text-center select-none"
    >
      {/* Step 2: Subtle golden radial illumination in center */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: styleVariant === 'minimal' ? 0.65 : 1,
          scale: 1,
        }}
        transition={{
          duration: 1.1 * scaleFactor,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.18)_0%,rgba(212,175,55,0.05)_34%,transparent_68%)]"
      />

      {/* Restrained ambient gold dust motes for cinematic style */}
      {styleVariant === 'cinematic' && !reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {AMBIENT_PARTICLES.map((particle) => (
            <motion.span
              key={particle.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: [0, 0.45, 0], y: -24 }}
              transition={{
                duration: particle.duration * scaleFactor,
                delay: particle.delay * scaleFactor,
                ease: 'easeOut',
              }}
              style={{
                left: particle.left,
                top: particle.top,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              className="absolute rounded-full bg-[#F2D675] blur-[0.5px]"
            />
          ))}
        </div>
      )}

      {/* Editorial architectural border framing */}
      {styleVariant === 'editorial' && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 * scaleFactor, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-6 border border-[#D4AF37]/20 sm:inset-10"
        />
      )}

      {/* Center Typographic Sequence */}
      <div className="relative z-10 flex max-w-4xl flex-col items-center">
        {/* Step 3 & 4: Name with smooth gold reveal */}
        <motion.h1
          initial={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 16, filter: 'blur(4px)' }
          }
          animate={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: 'blur(0px)' }
          }
          transition={{
            duration: 0.95 * scaleFactor,
            delay: 0.35 * scaleFactor,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="font-display bg-gradient-to-b from-[#FFFDF7] via-[#F2D675] to-[#D4AF37] bg-clip-text text-[clamp(2.25rem,6.5vw,5rem)] font-semibold tracking-[0.06em] text-transparent text-balance"
        >
          {name}
        </motion.h1>

        {/* Step 5: Tagline */}
        <motion.p
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{
            duration: 0.8 * scaleFactor,
            delay: 1.05 * scaleFactor,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-4 text-xs font-medium tracking-[0.28em] text-[#D4D4D0] uppercase sm:text-sm md:text-base"
        >
          {tagline}
        </motion.p>

        {/* Step 6: Expanding gold line beneath the tagline */}
        <motion.div
          aria-hidden="true"
          initial={reducedMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: 0.85 * scaleFactor,
            delay: 1.45 * scaleFactor,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-6 h-px w-44 origin-center bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent sm:w-64"
        />
      </div>

      {/* Skip Intro / Close Preview Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="absolute right-6 bottom-6 z-20 sm:right-10 sm:bottom-10"
      >
        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex min-h-[44px] items-center gap-2 border border-[#D4AF37]/35 bg-[#151515]/85 px-5 py-2.5 text-xs font-semibold tracking-[0.16em] text-[#F2D675] uppercase backdrop-blur-sm transition-colors duration-200 hover:border-[#F2D675] hover:bg-[#D4AF37] hover:text-[#080808] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2D675]"
        >
          {isPreview && <X className="h-3.5 w-3.5" aria-hidden="true" />}
          <span>{isPreview ? 'Close Preview' : 'Skip Intro'}</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
