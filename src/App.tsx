import { lazy, Suspense, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { JourneySection } from './components/JourneySection';
import { BusinessSection } from './components/BusinessSection';
import { PrinciplesSection } from './components/PrinciplesSection';
import { BlogPreviewSection } from './components/BlogPreviewSection';
import { ConnectSection } from './components/ConnectSection';
import { Footer } from './components/Footer';
import {
  AboutPage,
  BlogArticlePage,
  BlogListPage,
  BusinessPage,
  ContactPage,
  ExperiencePage,
  JourneyPage,
} from './components/PublicPages';
import { WelcomeIntro } from './components/WelcomeIntro';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  applyDynamicSeoMetadata,
  useSiteContent,
} from './hooks/useSiteContent';

const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((mod) => ({
    default: mod.AdminDashboard,
  }))
);

const WELCOME_SESSION_KEY = 'mf_welcome_seen';

function normalizePath(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, '');
  return cleaned || '/';
}

type AdminRoute = '/admin' | '/admin/login' | '/admin/dashboard';

function getAdminRoute(path: string): AdminRoute | null {
  if (
    path === '/admin' ||
    path === '/admin/login' ||
    path === '/admin/dashboard'
  ) {
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
  const { content, journeyStages, principles, blogPosts, loading } =
    useSiteContent();
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

  // Sync page title, meta description, canonical URL, Open Graph, and JSON-LD on every route or CMS update
  useEffect(() => {
    applyDynamicSeoMetadata(content, currentPath, blogPosts);
  }, [content, currentPath, blogPosts]);

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

  function renderPublicMain() {
    if (currentPath === '/about') {
      return (
        <AboutPage
          content={content}
          principles={principles}
          onNavigate={navigateTo}
        />
      );
    }
    if (currentPath === '/journey') {
      return (
        <JourneyPage
          content={content}
          stages={journeyStages}
          onNavigate={navigateTo}
        />
      );
    }
    if (currentPath === '/business') {
      return <BusinessPage content={content} onNavigate={navigateTo} />;
    }
    if (currentPath === '/experience') {
      return (
        <ExperiencePage
          content={content}
          principles={principles}
          onNavigate={navigateTo}
        />
      );
    }
    if (currentPath === '/contact') {
      return <ContactPage content={content} onNavigate={navigateTo} />;
    }
    if (currentPath === '/blog') {
      return (
        <BlogListPage
          content={content}
          posts={blogPosts}
          onNavigate={navigateTo}
        />
      );
    }
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.slice('/blog/'.length);
      return (
        <BlogArticlePage
          slug={slug}
          content={content}
          posts={blogPosts}
          onNavigate={navigateTo}
        />
      );
    }

    // Default Homepage ('/')
    return (
      <>
        <HeroSection content={content} onNavigate={navigateTo} />
        {content.sectionVisibility.about && (
          <AboutSection content={content} onNavigate={navigateTo} />
        )}
        {content.sectionVisibility.journey && (
          <JourneySection stages={journeyStages} onNavigate={navigateTo} />
        )}
        {content.sectionVisibility.business && (
          <BusinessSection content={content} onNavigate={navigateTo} />
        )}
        {content.sectionVisibility.principles && (
          <PrinciplesSection items={principles} />
        )}
        <BlogPreviewSection posts={blogPosts} onNavigate={navigateTo} />
        {content.sectionVisibility.connect && (
          <ConnectSection content={content} />
        )}
      </>
    );
  }

  return (
    <ErrorBoundary>
      {adminRoute ? (
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-[#F5F5F4]">
              <div className="border border-[#D4AF37]/25 bg-[#151515] px-8 py-6 text-sm tracking-wide text-[#B8B8B3]">
                Loading private administrator portal...
              </div>
            </div>
          }
        >
          <AdminDashboard route={adminRoute} onNavigate={navigateTo} />
        </Suspense>
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
            currentPath={currentPath}
            onNavigate={navigateTo}
          />

          <main id="main-content">{renderPublicMain()}</main>

          <Footer content={content} onNavigate={navigateTo} />
        </div>
      )}
    </ErrorBoundary>
  );
}
