import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import {
  DEFAULT_LIVE_CONTENT,
  normalizeSiteConfig,
  SITE_CONFIG,
  type JourneyStage,
  type LiveSiteContent,
  type PrincipleItem,
} from '../data/siteConfig';
import { db } from '../lib/firebase';

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

export function applyDynamicSeoMetadata(content: LiveSiteContent) {
  if (typeof document === 'undefined') return;

  if (content.seoTitle) {
    document.title = content.seoTitle;
  }

  const updateMeta = (attr: 'name' | 'property', key: string, value: string) => {
    if (!value) return;
    let tag = document.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', value);
  };

  updateMeta('name', 'description', content.seoDescription);
  updateMeta('name', 'keywords', content.seoKeywords);
  updateMeta('property', 'og:title', content.seoTitle);
  updateMeta('property', 'og:description', content.seoDescription);
  updateMeta('name', 'twitter:title', content.seoTitle);
  updateMeta('name', 'twitter:description', content.seoDescription);

  if (content.seoOgImageUrl) {
    updateMeta('property', 'og:image', content.seoOgImageUrl);
    updateMeta('name', 'twitter:image', content.seoOgImageUrl);
  }

  if (content.seoFaviconUrl) {
    let iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.href = content.seoFaviconUrl;
  }
}

interface PublicSiteState {
  content: LiveSiteContent;
  journeyStages: JourneyStage[];
  principles: PrincipleItem[];
  loading: boolean;
}

export function useSiteContent() {
  const [state, setState] = useState<PublicSiteState>(() => ({
    content: {
      ...DEFAULT_LIVE_CONTENT,
      ...readCachedWelcomePrefs(),
    },
    journeyStages: SITE_CONFIG.journey.stages,
    principles: SITE_CONFIG.principles.items,
    loading: true,
  }));

  useEffect(() => {
    let active = true;

    async function loadPublicData() {
      try {
        const [configSnap, stagesSnap, principlesSnap] = await Promise.all([
          getDoc(doc(db, 'siteConfig', 'public')),
          getDocs(
            query(
              collection(db, 'journeyStages'),
              where('isPublished', '==', true)
            )
          ),
          getDocs(
            query(
              collection(db, 'principles'),
              where('isPublished', '==', true)
            )
          ),
        ]);

        if (!active) return;

        const nextContent = configSnap.exists()
          ? normalizeSiteConfig(configSnap.data() as Record<string, unknown>)
          : DEFAULT_LIVE_CONTENT;

        writeCachedWelcomePrefs(nextContent);
        applyDynamicSeoMetadata(nextContent);

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

        const nextPrinciples: PrincipleItem[] = principlesSnap.empty
          ? SITE_CONFIG.principles.items
          : principlesSnap.docs
              .map((d) => ({
                ...(d.data() as Omit<PrincipleItem, 'id'>),
                id: d.id,
              }))
              .sort((a, b) => a.order - b.order);

        setState({
          content: nextContent,
          journeyStages: nextStages,
          principles: nextPrinciples,
          loading: false,
        });
      } catch (err) {
        console.warn('Using bundled default site content:', err);
        if (active) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    void loadPublicData();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
