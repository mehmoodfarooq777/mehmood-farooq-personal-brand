import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { SITE_CONFIG, type SectionVisibility } from '../data/siteConfig';

interface NavbarProps {
  brandName?: string;
  sectionVisibility?: SectionVisibility;
}

export function Navbar({
  brandName = SITE_CONFIG.brand.name,
  sectionVisibility = {
    about: true,
    journey: true,
    business: true,
    principles: true,
    connect: true,
  },
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: 'About', href: '#about', visible: sectionVisibility.about },
    { label: 'Journey', href: '#journey', visible: sectionVisibility.journey },
    { label: 'Business', href: '#business', visible: sectionVisibility.business },
    {
      label: 'Principles',
      href: '#principles',
      visible: sectionVisibility.principles,
    },
  ].filter((item) => item.visible);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        scrolled
          ? 'border-b border-[#D4AF37]/20 bg-[#080808]/95 backdrop-blur-md'
          : 'border-b border-white/10 bg-[#080808]/80 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-xl font-semibold tracking-wide text-[#F5F5F4] transition-colors duration-200 hover:text-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] whitespace-nowrap shrink-0"
        >
          {brandName}
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 text-sm font-medium tracking-wide text-[#B8B8B3] transition-colors duration-200 hover:text-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#D4AF37] after:transition-all after:duration-200 hover:after:w-full whitespace-nowrap shrink-0"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action (+ responsive menu trigger on mobile) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={sectionVisibility.connect ? '#connect' : '#top'}
            className="hidden border border-[#D4AF37] bg-[#D4AF37] px-5 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors duration-200 hover:border-[#F2D675] hover:bg-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2D675] sm:inline-flex whitespace-nowrap shrink-0"
          >
            Connect
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center border border-white/15 bg-[#151515] text-[#F5F5F4] transition-colors duration-200 hover:border-[#D4AF37]/60 hover:text-[#F2D675] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[#D4AF37]/20 bg-[#0E0E0E] px-6 py-5 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="flex min-h-[44px] items-center border-b border-white/5 py-2 text-sm font-medium tracking-wide text-[#D4D4D0] transition-colors hover:text-[#F2D675]"
              >
                {item.label}
              </a>
            ))}
            {sectionVisibility.connect && (
              <a
                href="#connect"
                onClick={handleNavClick}
                className="mt-2 inline-flex min-h-[44px] items-center justify-center bg-[#D4AF37] px-5 py-3 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors hover:bg-[#F2D675]"
              >
                Connect With Me
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
