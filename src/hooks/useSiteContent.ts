import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocFromServer,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  DEFAULT_BLOG_POSTS,
  DEFAULT_LIVE_CONTENT,
  normalizeSiteConfig,
  SITE_CONFIG,
  type BlogPost,
  type JourneyStage,
  type LiveSiteContent,
  type PrincipleItem,
} from '../data/siteConfig';
import { db } from '../lib/firebase';
import { applyClientSeo, resolveRouteSeo } from '../lib/seo';

const WELCOME_CACHE_KEY = 'mf_welcome_prefs_v1';

function readCachedWelcomePrefs(): Partial<LiveSiteContent> {
  try {
    const raw = window.localStorage.getItem(WELCOME_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<LiveSiteContent>;
  } catch {
    return {};
  }
}

function writeCachedWelcomePrefs(content: LiveSiteContent) {
  try {
    window.localStorage.setItem(
      WELCOME_CACHE_KEY,
      JSON.stringify({
        welcomeEnabled: content.welcomeEnabled,
        welcomeName: content.welcomeName,
        welcomeTagline: content.welcomeTagline,
        welcomeDurationMs: content.welcomeDurationMs,
        welcomeBgColor: content.welcomeBgColor,
        welcomeStyle: content.welcomeStyle,
      })
    );
  } catch {
    // Ignore storage errors
  }
}

export function applyDynamicSeoMetadata(
  content: LiveSiteContent,
  pathname = '/',
  blogPosts: BlogPost[] = DEFAULT_BLOG_POSTS
) {
  if (typeof window === 'undefined') return;
  const resolved = resolveRouteSeo(
    pathname,
    content,
    blogPosts,
    window.location.origin
  );
  applyClientSeo(resolved, content);
}

interface PublicSiteState {
  content: LiveSiteContent;
  journeyStages: JourneyStage[];
  principles: PrincipleItem[];
  blogPosts: BlogPost[];
  loading: boolean;
  hasPublishedConfig: boolean;
  lastSyncedAt: number | null;
}

export function useSiteContent() {
  const [state, setState] = useState<PublicSiteState>(() => ({
    content: {
      ...DEFAULT_LIVE_CONTENT,
      ...readCachedWelcomePrefs(),
    },
    journeyStages: SITE_CONFIG.journey.stages,
    principles: SITE_CONFIG.principles.items,
    blogPosts: DEFAULT_BLOG_POSTS,
    loading: true,
    hasPublishedConfig: false,
    lastSyncedAt: null,
  }));

  useEffect(() => {
    let active = true;
    const publicConfigRef = doc(db, 'siteConfig', 'public');

    // Force an authoritative server fetch on initial load to avoid stale browser cache
    void getDocFromServer(publicConfigRef)
      .then((snap) => {
        if (!active) return;
        const exists = snap.exists();
        const nextContent = exists
          ? normalizeSiteConfig(snap.data() as Record<string, unknown>)
          : DEFAULT_LIVE_CONTENT;
        writeCachedWelcomePrefs(nextContent);
        setState((prev) => ({
          ...prev,
          content: nextContent,
          hasPublishedConfig: exists,
          loading: false,
          lastSyncedAt: Date.now(),
        }));
      })
      .catch(() => {
        // Real-time listener below handles cached/offline state cleanly
      });

    // 1. Live published site configuration listener
    const unsubConfig = onSnapshot(
      publicConfigRef,
      (configSnap) => {
        if (!active) return;
        const exists = configSnap.exists();
        const nextContent = exists
          ? normalizeSiteConfig(configSnap.data() as Record<string, unknown>)
          : DEFAULT_LIVE_CONTENT;

        writeCachedWelcomePrefs(nextContent);
        setState((prev) => ({
          ...prev,
          content: nextContent,
          hasPublishedConfig: exists,
          loading: false,
          lastSyncedAt: Date.now(),
        }));
      },
      (err) => {
        console.warn('Public siteConfig listener fell back to defaults:', err);
        if (active) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    );

    // 2. Live published journey stages listener
    const unsubStages = onSnapshot(
      query(collection(db, 'journeyStages'), where('isPublished', '==', true)),
      (stagesSnap) => {
        if (!active) return;
        const nextStages: JourneyStage[] = stagesSnap.empty
          ? SITE_CONFIG.journey.stages
          : stagesSnap.docs
              .map((d) => {
                const raw = d.data() as Partial<JourneyStage>;
                return {
                  id: d.id,
                  step: raw.step ?? '01',
                  order: raw.order ?? 1,
                  dateLabel: raw.dateLabel ?? '',
                  title: raw.title ?? '',
                  description: raw.description ?? '',
                  imageUrl: raw.imageUrl ?? '',
                  isPublished: raw.isPublished ?? true,
                };
              })
              .sort((a, b) => a.order - b.order);

        setState((prev) => ({
          ...prev,
          journeyStages: nextStages,
          lastSyncedAt: Date.now(),
        }));
      },
      (err) => {
        console.warn('Journey stages listener fell back to defaults:', err);
      }
    );

    // 3. Live published executive principles listener
    const unsubPrinciples = onSnapshot(
      query(collection(db, 'principles'), where('isPublished', '==', true)),
      (principlesSnap) => {
        if (!active) return;
        const nextPrinciples: PrincipleItem[] = principlesSnap.empty
          ? SITE_CONFIG.principles.items
          : principlesSnap.docs
              .map((d) => ({
                ...(d.data() as Omit<PrincipleItem, 'id'>),
                id: d.id,
              }))
              .sort((a, b) => a.order - b.order);

        setState((prev) => ({
          ...prev,
          principles: nextPrinciples,
          lastSyncedAt: Date.now(),
        }));
      },
      (err) => {
        console.warn('Principles listener fell back to defaults:', err);
      }
    );

    // 4. Live published blog articles listener
    const unsubBlogs = onSnapshot(
      query(collection(db, 'blogPosts'), where('isPublished', '==', true)),
      (blogSnap) => {
        if (!active) return;
        const nextPosts: BlogPost[] = blogSnap.empty
          ? DEFAULT_BLOG_POSTS
          : blogSnap.docs
              .map((d) => ({
                ...(d.data() as Omit<BlogPost, 'id'>),
                id: d.id,
              }))
              .sort((a, b) =>
                (b.publishedDate || '').localeCompare(a.publishedDate || '')
              );

        setState((prev) => ({
          ...prev,
          blogPosts: nextPosts,
          lastSyncedAt: Date.now(),
        }));
      },
      (err) => {
        console.warn('Blog posts listener fell back to defaults:', err);
      }
    );

    return () => {
      active = false;
      unsubConfig();
      unsubStages();
      unsubPrinciples();
      unsubBlogs();
    };
  }, []);

  return state;
}
