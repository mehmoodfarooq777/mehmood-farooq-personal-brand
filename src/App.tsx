import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { JourneySection } from './components/JourneySection';
import { BusinessSection } from './components/BusinessSection';
import { PrinciplesSection } from './components/PrinciplesSection';
import { ConnectSection } from './components/ConnectSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { WelcomeIntro } from './components/WelcomeIntro';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSiteContent } from './hooks/useSiteContent';

const WELCOME_SESSION_KEY = 'mf_welcome_seen';

function normalizePath(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, '');
  return cleaned || '/';
}

type AdminRoute = '/admin' | '/admin/login' | '/admin/dashboard';

function getAdminRoute(path: string): AdminRoute | null {
  if (path === '/admin' || path === '/admin/login' || path === '/admin/dashboard') {
    return path;
  }
  return null;
}

function shouldShowInitialWelcome(enabled: boolean): boolean {
  if (!enabled || typeof window === 'undefined') return false;
  if (getAdminRoute(normalizePath(window.location.pathname)) !== null) {
    return false;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  try {
    return window.sessionStorage.getItem(WELCOME_SESSION_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );
  const { content, journeyStages, principles, loading } = useSiteContent();
  const [showWelcome, setShowWelcome] = useState<boolean>(() =>
    shouldShowInitialWelcome(content.welcomeEnabled)
  );

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Dismiss welcome overlay immediately if Firestore specifies welcomeEnabled === false
  useEffect(() => {
    if (!loading && !content.welcomeEnabled && showWelcome) {
      setShowWelcome(false);
    }
  }, [loading, content.welcomeEnabled, showWelcome]);

  function handleWelcomeComplete() {
    try {
      window.sessionStorage.setItem(WELCOME_SESSION_KEY, '1');
    } catch {
      // Ignore storage errors
    }
    setShowWelcome(false);
  }

  function navigateTo(path: string) {
    const target = normalizePath(path);
    if (target !== currentPath) {
      window.history.pushState({}, '', target);
      setCurrentPath(target);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  const adminRoute = getAdminRoute(currentPath);

  return (
    <ErrorBoundary>
      {adminRoute ? (
        <AdminDashboard route={adminRoute} onNavigate={navigateTo} />
      ) : (
        <div className="min-h-screen bg-[#080808] text-[#F5F5F4]">
          {showWelcome && content.welcomeEnabled && (
            <WelcomeIntro
              name={content.welcomeName}
              tagline={content.welcomeTagline}
              durationMs={content.welcomeDurationMs}
              bgColor={content.welcomeBgColor}
              styleVariant={content.welcomeStyle}
              onComplete={handleWelcomeComplete}
            />
          )}

          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-[#D4AF37] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#080808]"
          >
            Skip to main content
          </a>

          <Navbar
            brandName={content.brandName}
            sectionVisibility={content.sectionVisibility}
          />

          <main id="main-content">
            <HeroSection content={content} />
            {content.sectionVisibility.about && <AboutSection content={content} />}
            {content.sectionVisibility.journey && (
              <JourneySection stages={journeyStages} />
            )}
            {content.sectionVisibility.business && (
              <BusinessSection content={content} />
            )}
            {content.sectionVisibility.principles && (
              <PrinciplesSection items={principles} />
            )}
            {content.sectionVisibility.connect && (
              <ConnectSection content={content} />
            )}
          </main>

          <Footer content={content} />
        </div>
      )}
    </ErrorBoundary>
  );
}
