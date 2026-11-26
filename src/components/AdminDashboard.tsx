import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  Eye,
  FileText,
  Globe,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Share2,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react';
import {
  clampString,
  DEFAULT_BLOG_POSTS,
  DEFAULT_LIVE_CONTENT,
  DEFAULT_PAGE_SEO,
  EMAIL_REGEX,
  HEX_COLOR_REGEX,
  normalizeSiteConfig,
  SITE_CONFIG,
  SLUG_REGEX,
  slugifyTitle,
  type BlogPost,
  type InquiryRecord,
  type JourneyStage,
  type LiveSiteContent,
  type MediaCategory,
  type MediaItemRecord,
  type PageSeoMap,
  type PrincipleItem,
  type PublicPageKey,
  type SiteVersionRecord,
  type WelcomeAnimationStyle,
} from '../data/siteConfig';
import { applyDynamicSeoMetadata } from '../hooks/useSiteContent';
import {
  auth,
  AUTHORIZED_ADMIN_EMAIL,
  configureAuthPersistence,
  db,
  handleFirestoreError,
  isAuthorizedAdminEmail,
  isAuthorizedAdminUser,
  OperationType,
} from '../lib/firebase';
import { WelcomeIntro } from './WelcomeIntro';
import { AccountSettingsTab } from './admin/AccountSettingsTab';
import { AdminLogin } from './admin/AdminLogin';
import {
  AboutEditor,
  AdminInput,
  AdminTextarea,
  BusinessEditor,
  HomepageEditor,
  ImageSlotEditor,
  JourneyStageControls,
  PrincipleCardEditor,
  ProfileEditor,
} from './admin/AdminSectionEditors';
import { BlogManagerTab } from './admin/BlogManagerTab';
import {
  MediaLibraryTab,
  type ImageAssignTarget,
} from './admin/MediaLibraryTab';
import { MediaPickerModal } from './admin/MediaPickerModal';
import { SeoManagerTab } from './admin/SeoManagerTab';
import { SitePreviewModal } from './admin/SitePreviewModal';

interface AdminDashboardProps {
  route: '/admin' | '/admin/login' | '/admin/dashboard';
  onNavigate: (path: string) => void;
}

type AdminSection =
  | 'overview'
  | 'profile'
  | 'homepage'
  | 'about'
  | 'media'
  | 'journey'
  | 'business'
  | 'blog'
  | 'social'
  | 'contact'
  | 'welcome'
  | 'seo'
  | 'footer'
  | 'preview'
  | 'account';

interface PickerState {
  title: string;
  category: MediaCategory;
  currentUrl: string;
  onSelect: (url: string) => void;
}

const SESSION_PREF_KEY = 'mf_admin_remember_me';
const IDLE_TIMEOUT_PREF_KEY = 'mf_admin_idle_minutes';
const SESSION_START_KEY = 'mf_admin_session_start';

export function AdminDashboard({ route, onNavigate }: AdminDashboardProps) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');

  // Session persistence & idle expiration tracking
  const [rememberMeActive, setRememberMeActive] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(SESSION_PREF_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState<number>(() => {
    try {
      const saved = Number(window.localStorage.getItem(IDLE_TIMEOUT_PREF_KEY));
      return [15, 30, 60].includes(saved) ? saved : 30;
    } catch {
      return 30;
    }
  });
  const [sessionRemainingMinutes, setSessionRemainingMinutes] =
    useState<number>(idleTimeoutMinutes);
  const lastActivityRef = useRef<number>(Date.now());

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Draft & Publish State
  const [draftContent, setDraftContent] =
    useState<LiveSiteContent>(DEFAULT_LIVE_CONTENT);
  const [hasPublishedDoc, setHasPublishedDoc] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showSitePreview, setShowSitePreview] = useState(false);
  const [previewWelcome, setPreviewWelcome] = useState(false);

  // Collections State
  const [stages, setStages] = useState<JourneyStage[]>(SITE_CONFIG.journey.stages);
  const [newStage, setNewStage] = useState({
    step: '05',
    order: 5,
    dateLabel: '',
    title: '',
    description: '',
    imageUrl: '',
    isPublished: true,
  });

  const [principles, setPrinciples] = useState<PrincipleItem[]>(
    SITE_CONFIG.principles.items
  );
  const [newPrinciple, setNewPrinciple] = useState({
    number: '05',
    order: 5,
    title: '',
    summary: '',
    isPublished: true,
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItemRecord[]>([]);
  const [versions, setVersions] = useState<SiteVersionRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<
    'all' | 'new' | 'reviewed' | 'archived'
  >('all');

  const [pickerState, setPickerState] = useState<PickerState | null>(null);

  const isAuthorized = isAuthorizedAdminUser(user);

  const performSignOut = useCallback(
    async (reason?: string) => {
      await signOut(auth);
      setUser(null);
      setNeedsVerification(false);
      setVerificationNotice('');
      setInquiries([]);
      try {
        window.sessionStorage.removeItem(SESSION_START_KEY);
      } catch {
        // Ignore storage errors
      }
      if (reason) {
        setAuthError(reason);
      }
      onNavigate('/admin/login');
    },
    [onNavigate]
  );

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setNeedsVerification(false);
        setAuthReady(true);
        return;
      }

      if (!isAuthorizedAdminEmail(nextUser)) {
        await signOut(auth);
        setUser(null);
        setNeedsVerification(false);
        setAuthError(
          'Access denied. This account is not authorized to access the private administrator portal.'
        );
        setAuthReady(true);
        return;
      }

      if (!nextUser.emailVerified) {
        setUser(nextUser);
        setNeedsVerification(true);
        setAuthReady(true);
        return;
      }

      lastActivityRef.current = Date.now();
      setUser(nextUser);
      setNeedsVerification(false);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Route guard enforcement across /admin, /admin/login, /admin/dashboard
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthorized && route !== '/admin/login') {
      onNavigate('/admin/login');
    } else if (isAuthorized && (route === '/admin' || route === '/admin/login')) {
      onNavigate('/admin/dashboard');
    }
  }, [authReady, isAuthorized, route, onNavigate]);

  // Activity tracking & session expiration enforcement while signed in
  useEffect(() => {
    if (!isAuthorized) return;

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events: (keyof WindowEventMap)[] = [
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];
    events.forEach((evt) =>
      window.addEventListener(evt, recordActivity, { passive: true })
    );

    const interval = window.setInterval(() => {
      const elapsedMs = Date.now() - lastActivityRef.current;
      const limitMs = idleTimeoutMinutes * 60 * 1000;
      const remaining = Math.max(0, Math.ceil((limitMs - elapsedMs) / 60000));
      setSessionRemainingMinutes(remaining);

      if (elapsedMs >= limitMs) {
        void performSignOut(
          'Your administrator session expired due to inactivity. Please sign in again.'
        );
        return;
      }

      // Enforce maximum session lifetime (12 hours when Remember Me is off, 7 days when on)
      try {
        const startedAt = Number(
          window.sessionStorage.getItem(SESSION_START_KEY) || '0'
        );
        const maxAgeMs = rememberMeActive
          ? 7 * 24 * 60 * 60 * 1000
          : 12 * 60 * 60 * 1000;
        if (startedAt > 0 && Date.now() - startedAt >= maxAgeMs) {
          void performSignOut(
            'Your authentication session reached its maximum lifetime. Please sign in again.'
          );
        }
      } catch {
        // Ignore storage errors
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, recordActivity));
      window.clearInterval(interval);
    };
  }, [isAuthorized, idleTimeoutMinutes, rememberMeActive, performSignOut]);

  // Load CMS data only when verified administrator is authenticated
  useEffect(() => {
    if (!authReady || !isAuthorized || !user) {
      return;
    }

    let mounted = true;

    async function loadAdminWorkspace() {
      try {
        const [
          draftSnap,
          publicSnap,
          stagesSnap,
          principlesSnap,
          blogSnap,
          mediaSnap,
          versionsSnap,
        ] = await Promise.all([
          getDoc(doc(db, 'siteConfig', 'draft')),
          getDoc(doc(db, 'siteConfig', 'public')),
          getDocs(collection(db, 'journeyStages')),
          getDocs(collection(db, 'principles')),
          getDocs(collection(db, 'blogPosts')),
          getDocs(collection(db, 'mediaItems')),
          getDocs(collection(db, 'siteVersions')),
        ]);

        if (!mounted) return;

        const publishedExists = publicSnap.exists();
        setHasPublishedDoc(publishedExists);

        if (draftSnap.exists()) {
          const normalizedDraft = normalizeSiteConfig(
            draftSnap.data() as Record<string, unknown>
          );
          setDraftContent(normalizedDraft);
          if (publishedExists) {
            const publicStr = JSON.stringify(
              normalizeSiteConfig(publicSnap.data() as Record<string, unknown>)
            );
            setHasUnpublishedChanges(JSON.stringify(normalizedDraft) !== publicStr);
          } else {
            setHasUnpublishedChanges(true);
          }
        } else if (publishedExists) {
          setDraftContent(
            normalizeSiteConfig(publicSnap.data() as Record<string, unknown>)
          );
          setHasUnpublishedChanges(false);
        } else {
          setDraftContent(DEFAULT_LIVE_CONTENT);
          setHasUnpublishedChanges(true);
        }

        if (!stagesSnap.empty) {
          setStages(
            stagesSnap.docs
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
              .sort((a, b) => a.order - b.order)
          );
        } else {
          setStages(SITE_CONFIG.journey.stages);
        }

        if (!principlesSnap.empty) {
          setPrinciples(
            principlesSnap.docs
              .map((d) => ({
                ...(d.data() as Omit<PrincipleItem, 'id'>),
                id: d.id,
              }))
              .sort((a, b) => a.order - b.order)
          );
        } else {
          setPrinciples(SITE_CONFIG.principles.items);
        }

        const loadedPosts: BlogPost[] = blogSnap.docs
          .map((d) => ({
            ...(d.data() as Omit<BlogPost, 'id'>),
            id: d.id,
          }))
          .sort((a, b) =>
            (b.publishedDate || '').localeCompare(a.publishedDate || '')
          );
        setBlogPosts(loadedPosts);

        const loadedMedia: MediaItemRecord[] = mediaSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MediaItemRecord, 'id'>),
        }));
        loadedMedia.sort((a, b) => b.id.localeCompare(a.id));
        setMediaItems(loadedMedia);

        const loadedVersions: SiteVersionRecord[] = versionsSnap.docs.map((d) => {
          const data = d.data() as {
            label?: string;
            snapshot?: Record<string, unknown>;
            createdByUid?: string;
            createdAt?: unknown;
          };
          return {
            id: d.id,
            label: data.label || 'Published Snapshot',
            snapshot: normalizeSiteConfig(data.snapshot),
            createdByUid: data.createdByUid || '',
            createdAt: data.createdAt,
          };
        });
        loadedVersions.sort((a, b) => b.id.localeCompare(a.id));
        setVersions(loadedVersions);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'siteConfig/draft');
      }
    }

    void loadAdminWorkspace();

    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const items: InquiryRecord[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<InquiryRecord, 'id'>),
        }));
        items.sort((a, b) => b.id.localeCompare(a.id));
        setInquiries(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'inquiries');
      }
    );

    return () => {
      mounted = false;
      unsubInquiries();
    };
  }, [authReady, isAuthorized, user]);

  function showNotice(msg: string) {
    setErrorMessage('');
    setStatusMessage(msg);
    window.setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? '' : prev));
    }, 4500);
  }

  function updateDraft(next: LiveSiteContent) {
    setDraftContent(next);
    setHasUnpublishedChanges(true);
  }

  async function handleEmailPasswordSignIn({
    email,
    password,
    rememberMe,
  }: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) {
    setAuthError('');
    setVerificationNotice('');
    setSigningIn(true);

    try {
      if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
        setAuthError(
          'Access denied. Only the designated administrator account may access this portal.'
        );
        return;
      }

      await configureAuthPersistence(rememberMe);
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (!isAuthorizedAdminEmail(credential.user)) {
        await signOut(auth);
        setAuthError(
          'Access denied. Only the designated administrator account may access this portal.'
        );
        return;
      }

      try {
        window.localStorage.setItem(SESSION_PREF_KEY, rememberMe ? '1' : '0');
        window.sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
      } catch {
        // Ignore storage errors
      }
      setRememberMeActive(rememberMe);
      lastActivityRef.current = Date.now();

      if (!credential.user.emailVerified) {
        setNeedsVerification(true);
        return;
      }

      onNavigate('/admin/dashboard');
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setAuthError('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/too-many-requests') {
        setAuthError(
          'Too many failed sign-in attempts. Please wait a few minutes or reset your password.'
        );
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError(
          'Email/Password sign-in is not yet enabled in Firebase Authentication Console.'
        );
      } else {
        setAuthError('Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSendPasswordReset(targetEmail: string): Promise<boolean> {
    setAuthError('');
    setSigningIn(true);
    try {
      if (targetEmail.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
        // Return generic success feedback without revealing account status
        return true;
      }
      await sendPasswordResetEmail(auth, targetEmail.trim());
      return true;
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      if (code === 'auth/too-many-requests') {
        setAuthError('Too many reset requests. Please try again later.');
      } else if (code === 'auth/user-not-found') {
        setAuthError(
          'No Firebase Authentication user exists for this email yet. Create the user in Firebase Console first.'
        );
      } else {
        setAuthError('Unable to send password reset email right now.');
      }
      return false;
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSendVerificationEmail() {
    if (!auth.currentUser) return;
    setAuthError('');
    setVerificationNotice('');
    setSigningIn(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationNotice(
        'Verification email sent! Open the link in your inbox, then click "I Verified — Continue to Dashboard".'
      );
    } catch {
      setAuthError(
        'Unable to send verification email right now. Please wait a moment and try again.'
      );
    } finally {
      setSigningIn(false);
    }
  }

  async function handleRefreshVerification() {
    if (!auth.currentUser) return;
    setAuthError('');
    setSigningIn(true);
    try {
      await auth.currentUser.reload();
      if (isAuthorizedAdminUser(auth.currentUser)) {
        setUser(auth.currentUser);
        setNeedsVerification(false);
        onNavigate('/admin/dashboard');
      } else {
        setAuthError(
          'Email is not verified yet. Please click the verification link in your inbox first.'
        );
      }
    } catch {
      setAuthError('Could not refresh verification status. Please try signing in again.');
    } finally {
      setSigningIn(false);
    }
  }

  async function handleChangePassword(
    currentPassword: string,
    newPassword: string
  ) {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No active authenticated session.');
    }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Current password is incorrect.');
      }
      if (code === 'auth/weak-password') {
        throw new Error('New password is too weak. Choose a stronger password.');
      }
      throw new Error('Could not update password. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleChangeIdleTimeout(minutes: number) {
    setIdleTimeoutMinutes(minutes);
    setSessionRemainingMinutes(minutes);
    lastActivityRef.current = Date.now();
    try {
      window.localStorage.setItem(IDLE_TIMEOUT_PREF_KEY, String(minutes));
    } catch {
      // Ignore storage errors
    }
    showNotice(`Session inactivity timeout updated to ${minutes} minutes.`);
  }

  function buildValidatedPlainSnapshot(source: LiveSiteContent): LiveSiteContent {
    const cleanedParagraphs = source.aboutParagraphs
      .map((p) => clampString(p, 1200))
      .filter((p) => p.length > 0)
      .slice(0, 10);

    const safeParagraphs =
      cleanedParagraphs.length > 0
        ? cleanedParagraphs
        : [DEFAULT_LIVE_CONTENT.aboutParagraphs[0]];

    const safeExperience = source.aboutExperience
      .filter((e) => e.role.trim() || e.organization.trim())
      .slice(0, 10)
      .map((exp) => ({
        role: clampString(exp.role || 'Role', 100),
        organization: clampString(exp.organization || '', 100),
        period: clampString(exp.period || '', 50),
        summary: clampString(exp.summary || '', 300),
      }));

    const safeServices = source.businessServices
      .filter((s) => s.title.trim() || s.description.trim())
      .slice(0, 12)
      .map((svc) => ({
        title: clampString(svc.title || 'Service', 100),
        description: clampString(svc.description || '', 300),
      }));

    const safeCustomSocials = source.customSocialLinks
      .filter((l) => l.label.trim() && l.url.trim())
      .slice(0, 8)
      .map((link) => ({
        label: clampString(link.label, 60),
        url: clampString(link.url, 300),
      }));

    const pageKeys: PublicPageKey[] = [
      'about',
      'journey',
      'business',
      'experience',
      'contact',
      'blog',
    ];
    const safePageSeo = {} as PageSeoMap;
    for (const key of pageKeys) {
      const entry = source.pageSeo?.[key] || DEFAULT_PAGE_SEO[key];
      safePageSeo[key] = {
        title: clampString(entry.title || DEFAULT_PAGE_SEO[key].title, 160),
        description: clampString(
          entry.description || DEFAULT_PAGE_SEO[key].description,
          320
        ),
        keywords: clampString(entry.keywords || '', 400),
        canonicalUrl: clampString(entry.canonicalUrl || '', 300),
        ogImageUrl: clampString(entry.ogImageUrl || '', 700000),
      };
    }

    return {
      brandName: clampString(source.brandName, 100),
      heroHeading: clampString(source.heroHeading, 140),
      tagline: clampString(source.tagline, 140),
      profession: clampString(source.profession, 160),
      location: clampString(source.location, 80),
      heroDescription: clampString(source.heroDescription, 500),
      heroPortraitUrl:
        clampString(source.heroPortraitUrl, 700000) ||
        DEFAULT_LIVE_CONTENT.heroPortraitUrl,
      heroPortraitAlt: clampString(
        source.heroPortraitAlt || DEFAULT_LIVE_CONTENT.heroPortraitAlt,
        240
      ),
      heroPrimaryCtaLabel:
        clampString(source.heroPrimaryCtaLabel, 60) || 'Explore My Journey',
      heroPrimaryCtaUrl:
        clampString(source.heroPrimaryCtaUrl, 300) || '/journey',
      heroSecondaryCtaLabel:
        clampString(source.heroSecondaryCtaLabel, 60) || 'Connect With Me',
      heroSecondaryCtaUrl:
        clampString(source.heroSecondaryCtaUrl, 300) || '/contact',
      aboutHeading: clampString(source.aboutHeading, 140),
      aboutParagraphs: safeParagraphs,
      aboutExperience: safeExperience,
      aboutWorkspaceUrl:
        clampString(source.aboutWorkspaceUrl, 700000) ||
        DEFAULT_LIVE_CONTENT.aboutWorkspaceUrl,
      aboutWorkspaceAlt: clampString(
        source.aboutWorkspaceAlt || DEFAULT_LIVE_CONTENT.aboutWorkspaceAlt,
        240
      ),
      businessHeading: clampString(source.businessHeading, 140),
      businessName: clampString(source.businessName, 140),
      businessCountry:
        clampString(source.businessCountry, 120) || 'United States of America',
      businessState:
        clampString(source.businessState || source.businessRegistration, 120) ||
        'Wyoming, USA',
      businessRegistration:
        clampString(source.businessState || source.businessRegistration, 120) ||
        'Wyoming, USA',
      businessIndustry: clampString(source.businessIndustry, 120),
      businessDescription: clampString(source.businessDescription, 600),
      businessWebsiteUrl: clampString(source.businessWebsiteUrl, 300),
      businessLogoUrl: clampString(source.businessLogoUrl, 700000),
      businessShowcaseUrl:
        clampString(source.businessShowcaseUrl, 700000) ||
        DEFAULT_LIVE_CONTENT.businessShowcaseUrl,
      businessShowcaseAlt: clampString(
        source.businessShowcaseAlt || DEFAULT_LIVE_CONTENT.businessShowcaseAlt,
        240
      ),
      businessServices: safeServices,
      connectHeading: clampString(source.connectHeading, 140),
      connectDescription: clampString(source.connectDescription, 500),
      publicEmail: clampString(source.publicEmail, 160),
      tiktokUrl: clampString(source.tiktokUrl, 300),
      instagramUrl: clampString(source.instagramUrl, 300),
      linkedinUrl: clampString(source.linkedinUrl, 300),
      facebookUrl: clampString(source.facebookUrl, 300),
      customSocialLinks: safeCustomSocials,
      welcomeEnabled: Boolean(source.welcomeEnabled),
      welcomeName: clampString(source.welcomeName || 'MEHMOOD FAROOQ', 100),
      welcomeTagline: clampString(
        source.welcomeTagline || 'BUILDING BEYOND BORDERS.',
        140
      ),
      welcomeDurationMs: Math.min(
        6000,
        Math.max(2000, Number(source.welcomeDurationMs) || 3600)
      ),
      welcomeBgColor: HEX_COLOR_REGEX.test(source.welcomeBgColor.trim())
        ? source.welcomeBgColor.trim()
        : '#080808',
      welcomeStyle: (['cinematic', 'editorial', 'minimal'].includes(
        source.welcomeStyle
      )
        ? source.welcomeStyle
        : 'cinematic') as WelcomeAnimationStyle,
      seoTitle: clampString(source.seoTitle || DEFAULT_LIVE_CONTENT.seoTitle, 160),
      seoDescription: clampString(
        source.seoDescription || DEFAULT_LIVE_CONTENT.seoDescription,
        320
      ),
      seoKeywords: clampString(source.seoKeywords, 400),
      seoOgImageUrl: clampString(source.seoOgImageUrl, 700000),
      seoFaviconUrl: clampString(source.seoFaviconUrl, 700000),
      siteBaseUrl: clampString(source.siteBaseUrl || '', 300),
      canonicalUrl: clampString(source.canonicalUrl || '', 300),
      googleSiteVerification: clampString(
        source.googleSiteVerification || '',
        200
      ),
      pageSeo: safePageSeo,
      footerDescription: clampString(source.footerDescription, 300),
      footerCopyright: clampString(
        source.footerCopyright || DEFAULT_LIVE_CONTENT.footerCopyright,
        160
      ),
      sectionVisibility: {
        about: Boolean(source.sectionVisibility?.about ?? true),
        journey: Boolean(source.sectionVisibility?.journey ?? true),
        business: Boolean(source.sectionVisibility?.business ?? true),
        principles: Boolean(source.sectionVisibility?.principles ?? true),
        connect: Boolean(source.sectionVisibility?.connect ?? true),
      },
    };
  }

  function validateContentBeforeSave(snapshot: LiveSiteContent): string | null {
    if (snapshot.brandName.length < 2 || snapshot.heroHeading.length < 2) {
      return 'Brand name and Hero heading must each be at least 2 characters.';
    }
    if (snapshot.tagline.length < 2 || snapshot.profession.length < 2) {
      return 'Tagline and Profession title must each be at least 2 characters.';
    }
    if (snapshot.heroDescription.length < 10) {
      return 'Hero description must be at least 10 characters.';
    }
    if (snapshot.businessName.length < 2 || snapshot.businessCountry.length < 2 || snapshot.businessState.length < 2 || snapshot.businessIndustry.length < 2) {
      return 'Company name, country, state, and industry must each be at least 2 characters.';
    }
    if (snapshot.businessDescription.length < 10) {
      return 'Business description must be at least 10 characters.';
    }
    if (snapshot.connectDescription.length < 10) {
      return 'Contact section description must be at least 10 characters.';
    }
    if (!EMAIL_REGEX.test(snapshot.publicEmail)) {
      return 'Public contact email must be a valid email address.';
    }
    if (!HEX_COLOR_REGEX.test(snapshot.welcomeBgColor)) {
      return 'Welcome background color must be a valid 6-digit hex code (e.g. #080808).';
    }
    if (
      snapshot.businessWebsiteUrl.length < 8 ||
      snapshot.tiktokUrl.length < 8 ||
      snapshot.instagramUrl.length < 8 ||
      snapshot.linkedinUrl.length < 8 ||
      snapshot.facebookUrl.length < 8
    ) {
      return 'Business website and social URLs must be full links (at least 8 characters, e.g. https://...).';
    }
    if (snapshot.seoTitle.length < 2 || snapshot.seoDescription.length < 10) {
      return 'SEO title (2+ chars) and meta description (10+ chars) are required.';
    }
    return null;
  }

  async function handleSaveDraft() {
    if (!user || !isAuthorized) return;
    setErrorMessage('');

    const snapshot = buildValidatedPlainSnapshot(draftContent);
    const validationErr = validateContentBeforeSave(snapshot);
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'siteConfig', 'draft'), {
        ...snapshot,
        updatedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setDraftContent(snapshot);
      showNotice(
        'Draft changes saved privately. Preview or click "Publish Changes" when ready to update the live website.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'siteConfig/draft');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishConfirmed() {
    if (!user || !isAuthorized) return;
    setShowPublishConfirm(false);
    setErrorMessage('');

    const snapshot = buildValidatedPlainSnapshot(draftContent);
    const validationErr = validateContentBeforeSave(snapshot);
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    setSaving(true);
    const versionId = `ver_${Date.now()}`;
    try {
      const payload = {
        ...snapshot,
        updatedByUid: user.uid,
        updatedAt: serverTimestamp(),
      };
      const versionLabel = `Published ${new Date().toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      const batch = writeBatch(db);
      batch.set(doc(db, 'siteConfig', 'draft'), payload);
      batch.set(doc(db, 'siteConfig', 'public'), payload);
      batch.set(doc(db, 'siteVersions', versionId), {
        label: versionLabel,
        snapshot,
        createdByUid: user.uid,
        createdAt: serverTimestamp(),
      });
      await batch.commit();

      applyDynamicSeoMetadata(
        snapshot,
        route,
        blogPosts.length > 0 ? blogPosts : DEFAULT_BLOG_POSTS
      );
      setDraftContent(snapshot);
      setHasPublishedDoc(true);
      setHasUnpublishedChanges(false);
      setVersions((prev) => [
        {
          id: versionId,
          label: versionLabel,
          snapshot,
          createdByUid: user.uid,
          createdAt: { toDate: () => new Date() },
        },
        ...prev,
      ]);
      showNotice('Website changes published live and snapshot archived.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'siteConfig/public');
    } finally {
      setSaving(false);
    }
  }

  async function handleInitializeMissingAssets() {
    if (!user || !isAuthorized) return;
    setSaving(true);
    setErrorMessage('');
    try {
      const batch = writeBatch(db);
      let addedCount = 0;

      const bundledMedia: Array<{
        id: string;
        title: string;
        description: string;
        category: MediaCategory;
        url: string;
      }> = [
        {
          id: 'default_hero_portrait',
          title: 'Executive Portrait (Default)',
          description: 'Primary portrait for Hero & Profile sections.',
          category: 'profile',
          url: SITE_CONFIG.images.heroPortrait.src,
        },
        {
          id: 'default_about_workspace',
          title: 'Executive Workspace (Default)',
          description: 'Editorial workspace photo for About Me section.',
          category: 'about',
          url: SITE_CONFIG.images.aboutWorkspace.src,
        },
        {
          id: 'default_business_highway',
          title: 'US Freight Highway (Default)',
          description: 'TITAN ROUTE DISPATCH (TRD) LLC logistics showcase photograph.',
          category: 'business',
          url: SITE_CONFIG.images.businessShowcase.src,
        },
      ];

      const existingIds = new Set(mediaItems.map((m) => m.id));
      for (const item of bundledMedia) {
        if (!existingIds.has(item.id)) {
          addedCount++;
          batch.set(doc(db, 'mediaItems', item.id), {
            title: item.title,
            description: item.description,
            category: item.category,
            url: item.url,
            mimeType: 'image/jpeg',
            width: 1200,
            height: 900,
            sizeBytes: item.url.length,
            uploadedByUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      if (!hasPublishedDoc) {
        const snapshot = buildValidatedPlainSnapshot(draftContent);
        const payload = {
          ...snapshot,
          updatedByUid: user.uid,
          updatedAt: serverTimestamp(),
        };
        batch.set(doc(db, 'siteConfig', 'draft'), payload);
        batch.set(doc(db, 'siteConfig', 'public'), payload);
        addedCount++;
      }

      await batch.commit();

      if (addedCount > 0) {
        const mediaSnap = await getDocs(collection(db, 'mediaItems'));
        const nextMedia: MediaItemRecord[] = mediaSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MediaItemRecord, 'id'>),
        }));
        nextMedia.sort((a, b) => b.id.localeCompare(a.id));
        setMediaItems(nextMedia);
        setHasPublishedDoc(true);
        showNotice(
          'Synced missing default media and baseline records without overwriting your edits.'
        );
      } else {
        showNotice('Default media library items are already initialized.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'mediaItems');
    } finally {
      setSaving(false);
    }
  }

  // Media Library CRUD
  async function handleUploadMedia(input: {
    title: string;
    description: string;
    category: MediaCategory;
    url: string;
    mimeType: string;
    width: number;
    height: number;
    sizeBytes: number;
  }): Promise<void> {
    if (!user || !isAuthorized) return;
    const id = `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setSaving(true);
    try {
      await setDoc(doc(db, 'mediaItems', id), {
        title: clampString(input.title, 120) || 'Photograph',
        description: clampString(input.description, 400),
        category: input.category,
        url: input.url,
        mimeType: clampString(input.mimeType, 80) || 'image/webp',
        width: Math.max(0, Math.round(input.width)),
        height: Math.max(0, Math.round(input.height)),
        sizeBytes: Math.max(0, Math.round(input.sizeBytes)),
        uploadedByUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const createdRecord: MediaItemRecord = {
        id,
        title: clampString(input.title, 120) || 'Photograph',
        description: clampString(input.description, 400),
        category: input.category,
        url: input.url,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        sizeBytes: input.sizeBytes,
        uploadedByUid: user.uid,
      };
      setMediaItems((prev) => [createdRecord, ...prev]);
      showNotice(`Uploaded "${createdRecord.title}" to Media Library.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `mediaItems/${id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateMedia(
    item: MediaItemRecord,
    updates: Partial<MediaItemRecord>
  ) {
    if (!user || !isAuthorized) return;
    setSaving(true);
    try {
      const patch: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.title !== undefined) {
        patch.title = clampString(updates.title, 120) || item.title;
      }
      if (updates.description !== undefined) {
        patch.description = clampString(updates.description, 400);
      }
      if (updates.category !== undefined) {
        patch.category = updates.category;
      }
      if (updates.url !== undefined) {
        patch.url = updates.url;
      }
      if (updates.mimeType !== undefined) {
        patch.mimeType = clampString(updates.mimeType, 80);
      }
      if (updates.width !== undefined) {
        patch.width = Math.max(0, Math.round(updates.width));
      }
      if (updates.height !== undefined) {
        patch.height = Math.max(0, Math.round(updates.height));
      }
      if (updates.sizeBytes !== undefined) {
        patch.sizeBytes = Math.max(0, Math.round(updates.sizeBytes));
      }

      await updateDoc(doc(db, 'mediaItems', item.id), patch);
      setMediaItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, ...updates } : m))
      );
      showNotice(`Updated media asset "${updates.title ?? item.title}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `mediaItems/${item.id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMedia(id: string) {
    if (!user || !isAuthorized) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'mediaItems', id));
      setMediaItems((prev) => prev.filter((m) => m.id !== id));
      showNotice('Photograph removed from Media Library.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `mediaItems/${id}`);
    } finally {
      setSaving(false);
    }
  }

  function handleAssignImageToSection(target: ImageAssignTarget, url: string) {
    updateDraft({
      ...draftContent,
      [target]: url,
    });
    showNotice('Assigned photograph to draft configuration. Save or Publish to go live.');
  }

  // Journey CRUD + Reorder
  async function handleSaveStage(stage: JourneyStage) {
    if (!user || !isAuthorized) return;
    if (stage.title.trim().length < 2 || stage.description.trim().length < 5) {
      setErrorMessage(
        'Stage title (2+ chars) and description (5+ chars) are required.'
      );
      return;
    }

    const id = stage.id || `stage_${Date.now()}`;
    setSaving(true);
    try {
      await setDoc(doc(db, 'journeyStages', id), {
        step: clampString(stage.step, 10) || '01',
        order: Number(stage.order) || 1,
        dateLabel: clampString(stage.dateLabel || '', 60),
        title: clampString(stage.title, 100),
        description: clampString(stage.description, 500),
        imageUrl: clampString(stage.imageUrl || '', 700000),
        isPublished: Boolean(stage.isPublished ?? true),
        updatedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setStages((prev) =>
        prev
          .map((s) => (s.id === stage.id ? { ...stage, id } : s))
          .sort((a, b) => a.order - b.order)
      );
      showNotice(`Saved timeline entry "${stage.title}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `journeyStages/${id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleMoveStage(idx: number, dir: -1 | 1) {
    if (!user || !isAuthorized) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= stages.length) return;

    const reordered = [...stages];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    const normalized = reordered.map((stage, i) => ({
      ...stage,
      id: stage.id || `stage-${i + 1}`,
      order: i + 1,
      step: String(i + 1).padStart(2, '0'),
    }));

    setStages(normalized);
    setSaving(true);
    try {
      const batch = writeBatch(db);
      for (const s of normalized) {
        batch.set(doc(db, 'journeyStages', s.id!), {
          step: clampString(s.step, 10),
          order: s.order,
          dateLabel: clampString(s.dateLabel || '', 60),
          title: clampString(s.title, 100),
          description: clampString(s.description, 500),
          imageUrl: clampString(s.imageUrl || '', 700000),
          isPublished: Boolean(s.isPublished ?? true),
          updatedByUid: user.uid,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      showNotice('Timeline order updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'journeyStages');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddStage(e: FormEvent) {
    e.preventDefault();
    if (!user || !isAuthorized) return;
    if (newStage.title.trim().length < 2 || newStage.description.trim().length < 5) {
      setErrorMessage(
        'Enter a valid timeline title (2+ chars) and description (5+ chars).'
      );
      return;
    }

    const id = `stage_${Date.now()}`;
    const orderNum = Number(newStage.order) || stages.length + 1;
    setSaving(true);
    try {
      await setDoc(doc(db, 'journeyStages', id), {
        step: clampString(newStage.step || String(orderNum).padStart(2, '0'), 10),
        order: orderNum,
        dateLabel: clampString(newStage.dateLabel, 60),
        title: clampString(newStage.title, 100),
        description: clampString(newStage.description, 500),
        imageUrl: clampString(newStage.imageUrl, 700000),
        isPublished: newStage.isPublished,
        updatedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setStages((prev) =>
        [
          ...prev,
          {
            id,
            step: clampString(newStage.step || String(orderNum).padStart(2, '0'), 10),
            order: orderNum,
            dateLabel: clampString(newStage.dateLabel, 60),
            title: clampString(newStage.title, 100),
            description: clampString(newStage.description, 500),
            imageUrl: clampString(newStage.imageUrl, 700000),
            isPublished: newStage.isPublished,
          },
        ].sort((a, b) => a.order - b.order)
      );
      setNewStage({
        step: String(stages.length + 2).padStart(2, '0'),
        order: stages.length + 2,
        dateLabel: '',
        title: '',
        description: '',
        imageUrl: '',
        isPublished: true,
      });
      showNotice('Added new timeline entry.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `journeyStages/${id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStage(stageId: string) {
    if (!user || !isAuthorized) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'journeyStages', stageId));
      setStages((prev) => prev.filter((s) => s.id !== stageId));
      showNotice('Removed timeline entry.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `journeyStages/${stageId}`);
    } finally {
      setSaving(false);
    }
  }

  // Principles CRUD
  async function handleSavePrinciple(item: PrincipleItem) {
    if (!user || !isAuthorized) return;
    if (item.title.trim().length < 2 || item.summary.trim().length < 5) {
      setErrorMessage('Principle title and summary are required.');
      return;
    }

    const id = item.id || `principle_${Date.now()}`;
    setSaving(true);
    try {
      await setDoc(doc(db, 'principles', id), {
        number: clampString(item.number, 10) || '01',
        order: Number(item.order) || 1,
        title: clampString(item.title, 100),
        summary: clampString(item.summary, 400),
        isPublished: Boolean(item.isPublished ?? true),
        updatedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setPrinciples((prev) =>
        prev
          .map((p) => (p.id === item.id ? { ...item, id } : p))
          .sort((a, b) => a.order - b.order)
      );
      showNotice(`Saved principle "${item.title}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `principles/${id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPrinciple(e: FormEvent) {
    e.preventDefault();
    if (!user || !isAuthorized) return;
    if (
      newPrinciple.title.trim().length < 2 ||
      newPrinciple.summary.trim().length < 5
    ) {
      setErrorMessage('Enter a valid principle title and summary.');
      return;
    }

    const id = `principle_${Date.now()}`;
    const orderNum = Number(newPrinciple.order) || principles.length + 1;
    setSaving(true);
    try {
      await setDoc(doc(db, 'principles', id), {
        number:
          clampString(newPrinciple.number, 10) ||
          String(orderNum).padStart(2, '0'),
        order: orderNum,
        title: clampString(newPrinciple.title, 100),
        summary: clampString(newPrinciple.summary, 400),
        isPublished: newPrinciple.isPublished,
        updatedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setPrinciples((prev) =>
        [
          ...prev,
          {
            id,
            number: clampString(newPrinciple.number, 10),
            order: orderNum,
            title: clampString(newPrinciple.title, 100),
            summary: clampString(newPrinciple.summary, 400),
            isPublished: newPrinciple.isPublished,
          },
        ].sort((a, b) => a.order - b.order)
      );
      setNewPrinciple({
        number: String(principles.length + 2).padStart(2, '0'),
        order: principles.length + 2,
        title: '',
        summary: '',
        isPublished: true,
      });
      showNotice('Added new principle.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `principles/${id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePrinciple(principleId: string) {
    if (!user || !isAuthorized) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'principles', principleId));
      setPrinciples((prev) => prev.filter((p) => p.id !== principleId));
      showNotice('Removed principle.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `principles/${principleId}`);
    } finally {
      setSaving(false);
    }
  }

  // Blog Articles CRUD
  async function handleSaveBlogPost(post: BlogPost) {
    if (!user || !isAuthorized) return;
    const cleanSlug = slugifyTitle(post.slug || post.title);
    if (!SLUG_REGEX.test(cleanSlug)) {
      setErrorMessage('Invalid article URL slug.');
      return;
    }

    const isExisting = Boolean(post.id && blogPosts.some((p) => p.id === post.id));
    const id = post.id || `post_${Date.now()}`;
    setSaving(true);
    setErrorMessage('');

    const payload = {
      slug: clampString(cleanSlug, 140),
      title: clampString(post.title, 160),
      excerpt: clampString(post.excerpt, 400),
      content: clampString(post.content, 25000),
      category: clampString(post.category || 'Entrepreneurship', 60),
      coverImageUrl: clampString(post.coverImageUrl || '', 700000),
      coverImageAlt: clampString(post.coverImageAlt || '', 240),
      seoTitle: clampString(post.seoTitle || '', 160),
      seoDescription: clampString(post.seoDescription || '', 320),
      seoKeywords: clampString(post.seoKeywords || '', 400),
      canonicalUrl: clampString(post.canonicalUrl || '', 300),
      readTimeMinutes: Math.min(120, Math.max(1, Math.round(post.readTimeMinutes || 4))),
      publishedDate: clampString(
        post.publishedDate || new Date().toISOString().split('T')[0],
        40
      ),
      isPublished: Boolean(post.isPublished),
      updatedByUid: user.uid,
      updatedAt: serverTimestamp(),
    };

    try {
      if (isExisting) {
        await updateDoc(doc(db, 'blogPosts', id), payload);
      } else {
        await setDoc(doc(db, 'blogPosts', id), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      const savedRecord: BlogPost = {
        ...post,
        ...payload,
        id,
      };
      setBlogPosts((prev) => {
        const filtered = prev.filter((p) => p.id !== id);
        return [savedRecord, ...filtered].sort((a, b) =>
          (b.publishedDate || '').localeCompare(a.publishedDate || '')
        );
      });
      showNotice(`Saved article "${savedRecord.title}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `blogPosts/${id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBlogPost(postId: string) {
    if (!user || !isAuthorized) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'blogPosts', postId));
      setBlogPosts((prev) => prev.filter((p) => p.id !== postId));
      showNotice('Deleted article.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blogPosts/${postId}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedDefaultBlogs() {
    if (!user || !isAuthorized) return;
    setSaving(true);
    setErrorMessage('');
    try {
      const existingIds = new Set(blogPosts.map((p) => p.id));
      const missing = DEFAULT_BLOG_POSTS.filter((p) => !existingIds.has(p.id));
      if (missing.length === 0) {
        showNotice('Starter articles are already synced in your database.');
        return;
      }

      const batch = writeBatch(db);
      for (const post of missing) {
        batch.set(doc(db, 'blogPosts', post.id), {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          coverImageUrl: post.coverImageUrl,
          coverImageAlt: post.coverImageAlt,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          seoKeywords: post.seoKeywords,
          canonicalUrl: post.canonicalUrl,
          readTimeMinutes: post.readTimeMinutes,
          publishedDate: post.publishedDate,
          isPublished: post.isPublished,
          updatedByUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();

      const snap = await getDocs(collection(db, 'blogPosts'));
      const reloaded = snap.docs
        .map((d) => ({
          ...(d.data() as Omit<BlogPost, 'id'>),
          id: d.id,
        }))
        .sort((a, b) =>
          (b.publishedDate || '').localeCompare(a.publishedDate || '')
        );
      setBlogPosts(reloaded);
      showNotice(`Synced ${missing.length} starter article(s) to database.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'blogPosts');
    } finally {
      setSaving(false);
    }
  }

  // Inquiries Inbox
  async function handleUpdateInquiry(
    inquiry: InquiryRecord,
    nextStatus: InquiryRecord['status'],
    nextNotes: string
  ) {
    if (!user || !isAuthorized) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'inquiries', inquiry.id), {
        status: nextStatus,
        adminNotes: clampString(nextNotes, 1000),
        updatedAt: serverTimestamp(),
      });
      showNotice('Inquiry updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${inquiry.id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteInquiry(inquiryId: string) {
    if (!user || !isAuthorized) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
      showNotice('Inquiry deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inquiries/${inquiryId}`);
    } finally {
      setSaving(false);
    }
  }

  function handleRestoreVersion(version: SiteVersionRecord) {
    setDraftContent(
      normalizeSiteConfig(version.snapshot as unknown as Record<string, unknown>)
    );
    setHasUnpublishedChanges(true);
    setActiveSection('overview');
    showNotice(
      `Loaded "${version.label}" into draft editor. Preview or click "Publish Changes" to make it live.`
    );
  }

  async function handleDeleteVersion(versionId: string) {
    if (!user || !isAuthorized) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'siteVersions', versionId));
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
      showNotice('Deleted version snapshot.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `siteVersions/${versionId}`);
    } finally {
      setSaving(false);
    }
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-[#F5F5F4]">
        <div className="border border-[#D4AF37]/25 bg-[#151515] px-8 py-6 text-sm tracking-wide text-[#B8B8B3]">
          Verifying administrator session...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <AdminLogin
        authError={authError}
        signingIn={signingIn}
        needsVerification={needsVerification}
        verificationNotice={verificationNotice}
        onEmailPasswordSignIn={handleEmailPasswordSignIn}
        onSendPasswordReset={handleSendPasswordReset}
        onSendVerificationEmail={handleSendVerificationEmail}
        onRefreshVerification={handleRefreshVerification}
        onCancelVerification={() => performSignOut()}
        onBackToSite={() => onNavigate('/')}
      />
    );
  }

  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const filteredInquiries =
    inquiryFilter === 'all'
      ? inquiries
      : inquiries.filter((inq) => inq.status === inquiryFilter);

  const navItems: {
    id: AdminSection;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile Management', icon: UserIcon },
    { id: 'homepage', label: 'Homepage Management', icon: Home },
    { id: 'about', label: 'About Me Management', icon: FileText },
    {
      id: 'media',
      label: 'Photo & Media Library',
      icon: ImageIcon,
      badge: mediaItems.length,
    },
    { id: 'journey', label: 'Journey & Timeline', icon: Compass },
    { id: 'business', label: 'Business Management', icon: Briefcase },
    {
      id: 'blog',
      label: 'Blog & Articles',
      icon: BookOpen,
      badge: blogPosts.length || DEFAULT_BLOG_POSTS.length,
    },
    { id: 'social', label: 'Social Media', icon: Share2 },
    {
      id: 'contact',
      label: 'Contact Management',
      icon: Mail,
      badge: newInquiriesCount,
    },
    { id: 'welcome', label: 'Welcome Animation', icon: Sparkles },
    { id: 'seo', label: 'SEO & Search Console', icon: Globe },
    { id: 'footer', label: 'Footer Management', icon: LayoutDashboard },
    { id: 'preview', label: 'Website Preview', icon: Eye },
    { id: 'account', label: 'Account Settings', icon: Settings },
  ];

  const openImagePicker = (
    title: string,
    category: MediaCategory,
    currentUrl: string,
    onSelect: (url: string) => void
  ) => {
    setPickerState({ title, category, currentUrl, onSelect });
  };

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#F5F5F4]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-68 shrink-0 flex-col border-r border-[#D4AF37]/20 bg-[#0E0E0E] lg:flex">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="font-display text-xl font-semibold tracking-wide text-[#F5F5F4]">
            {draftContent.brandName || 'Mehmood Farooq'}
          </p>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
            Private Admin Portal
          </p>
        </div>

        <nav
          aria-label="Private admin portal navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold tracking-wider uppercase transition-colors ${
                  active
                    ? 'bg-[#D4AF37] text-[#080808]'
                    : 'text-[#B8B8B3] hover:bg-[#151515] hover:text-[#F2D675]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] tabular-nums ${
                      active
                        ? 'bg-[#080808] text-[#F2D675]'
                        : 'bg-[#1F1F1F] text-[#D4AF37]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 space-y-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex w-full items-center justify-center gap-2 border border-white/15 bg-[#151515] px-4 py-2 text-xs font-medium text-[#F5F5F4] transition-colors hover:border-[#D4AF37]/60 hover:text-[#F2D675]"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Open Public Website</span>
          </button>
          <button
            type="button"
            onClick={() => performSignOut()}
            className="flex w-full items-center justify-center gap-2 border border-[#D4AF37]/40 px-4 py-2 text-xs font-semibold text-[#F2D675] transition-colors hover:bg-[#D4AF37] hover:text-[#080808]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-[#D4AF37]/30 bg-[#0E0E0E]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-display text-lg font-semibold text-[#F5F5F4]">
                Admin Portal
              </span>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#B8B8B3]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold tracking-wider uppercase ${
                      active
                        ? 'bg-[#D4AF37] text-[#080808]'
                        : 'text-[#B8B8B3] hover:bg-[#151515]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-[#1F1F1F] px-1.5 py-0.5 text-[10px] text-[#D4AF37]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-white/10 p-4 space-y-2">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="flex w-full items-center justify-center gap-2 border border-white/15 bg-[#151515] px-4 py-2 text-xs font-medium text-[#F5F5F4]"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Public Website</span>
              </button>
              <button
                type="button"
                onClick={() => performSignOut()}
                className="flex w-full items-center justify-center gap-2 border border-[#D4AF37]/40 px-4 py-2 text-xs font-semibold text-[#F2D675]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky Top Action Bar */}
        <header className="sticky top-0 z-30 border-b border-[#D4AF37]/25 bg-[#080808]/95 px-4 py-3 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open admin menu"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center border border-white/15 bg-[#151515] text-[#F5F5F4] lg:hidden"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </button>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
                  {hasUnpublishedChanges ? 'Draft Modified' : 'Live & Synced'}
                </p>
                <p className="text-xs text-[#9E9E98]">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowSitePreview(true)}
                className="inline-flex min-h-[40px] items-center gap-2 border border-white/20 bg-[#151515] px-4 py-2 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase transition-colors hover:border-[#D4AF37] hover:text-[#F2D675]"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Preview Website</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveDraft}
                className="inline-flex min-h-[40px] items-center gap-2 border border-[#D4AF37]/60 bg-[#080808] px-4 py-2 text-xs font-semibold tracking-wider text-[#F2D675] uppercase transition-colors hover:bg-[#1E1E1E] disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => setShowPublishConfirm(true)}
                className="inline-flex min-h-[40px] items-center gap-2 bg-[#D4AF37] px-5 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors hover:bg-[#F2D675] disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Publish Changes</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
          {/* Header Greeting */}
          <div className="border-b border-white/10 pb-6">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] sm:text-4xl">
              Welcome Back, Mehmood
            </h1>
            <p className="mt-1.5 text-sm text-[#B8B8B3]">
              Manage Your Personal Brand Website
            </p>
          </div>

          {statusMessage && (
            <div
              role="status"
              className="mt-6 flex items-center gap-3 border border-[#D4AF37]/45 bg-[#151515] px-5 py-3.5 text-sm text-[#F2D675]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-center gap-3 border border-rose-500/40 bg-rose-950/30 px-5 py-3.5 text-sm text-rose-200"
            >
              <ShieldAlert
                className="h-4 w-4 shrink-0 text-rose-400"
                aria-hidden="true"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="mt-8">
            {/* 1. DASHBOARD OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="border border-white/10 bg-[#151515] p-6">
                    <p className="text-xs font-semibold tracking-wider text-[#9E9E98] uppercase">
                      Publishing Status
                    </p>
                    <p className="mt-3 font-display text-2xl font-semibold text-[#F2D675]">
                      {hasUnpublishedChanges ? 'Draft Pending' : 'Live & Synced'}
                    </p>
                    <p className="mt-1 text-xs text-[#8C8C86]">
                      {hasPublishedDoc
                        ? 'Public site serving published copy'
                        : 'Ready for first publish'}
                    </p>
                  </div>

                  <div className="border border-white/10 bg-[#151515] p-6">
                    <p className="text-xs font-semibold tracking-wider text-[#9E9E98] uppercase">
                      Media Library
                    </p>
                    <p className="mt-3 font-display text-2xl font-semibold text-[#F5F5F4] tabular-nums">
                      {mediaItems.length} Photos
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSection('media')}
                      className="mt-2 text-xs font-semibold text-[#D4AF37] hover:text-[#F2D675]"
                    >
                      Manage Photographs →
                    </button>
                  </div>

                  <div className="border border-white/10 bg-[#151515] p-6">
                    <p className="text-xs font-semibold tracking-wider text-[#9E9E98] uppercase">
                      Timeline Milestones
                    </p>
                    <p className="mt-3 font-display text-2xl font-semibold text-[#F5F5F4] tabular-nums">
                      {stages.length} Stages
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSection('journey')}
                      className="mt-2 text-xs font-semibold text-[#D4AF37] hover:text-[#F2D675]"
                    >
                      Edit Journey →
                    </button>
                  </div>

                  <div className="border border-white/10 bg-[#151515] p-6">
                    <p className="text-xs font-semibold tracking-wider text-[#9E9E98] uppercase">
                      Visitor Inquiries
                    </p>
                    <p className="mt-3 font-display text-2xl font-semibold text-[#F5F5F4] tabular-nums">
                      {newInquiriesCount} New ({inquiries.length} Total)
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSection('contact')}
                      className="mt-2 text-xs font-semibold text-[#D4AF37] hover:text-[#F2D675]"
                    >
                      Open Inbox →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <section className="border border-white/10 bg-[#151515] p-6 lg:col-span-8">
                    <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                      Quick Website Management
                    </h2>
                    <p className="mt-1 text-xs text-[#9E9E98]">
                      Select any section below to update content, media, or account settings.
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {(
                        [
                          { id: 'profile', label: 'Profile Management' },
                          { id: 'homepage', label: 'Homepage & Principles' },
                          { id: 'about', label: 'About Me & Roles' },
                          { id: 'media', label: 'Photo & Media Library' },
                          { id: 'journey', label: 'Journey Timeline' },
                          { id: 'business', label: 'Business Management' },
                          { id: 'blog', label: 'Blog & Articles' },
                          { id: 'social', label: 'Social Media' },
                          { id: 'welcome', label: 'Welcome Animation' },
                          { id: 'seo', label: 'SEO & Search Console' },
                        ] as { id: AdminSection; label: string }[]
                      ).map((quick) => (
                        <button
                          key={quick.id}
                          type="button"
                          onClick={() => setActiveSection(quick.id)}
                          className="border border-white/10 bg-[#080808] px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-[#D4D4D0] uppercase transition-colors hover:border-[#D4AF37]/60 hover:text-[#F2D675]"
                        >
                          {quick.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="flex flex-col justify-between border border-[#D4AF37]/25 bg-[#151515] p-6 lg:col-span-4">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                        Media & Baseline Sync
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-[#9E9E98]">
                        Register bundled executive images in your Media Library without overwriting saved edits or custom uploads.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleInitializeMissingAssets}
                      className="mt-6 inline-flex min-h-[42px] w-full items-center justify-center gap-2 border border-[#D4AF37]/50 bg-[#080808] px-4 py-2.5 text-xs font-semibold tracking-wider text-[#F2D675] uppercase transition-colors hover:bg-[#D4AF37] hover:text-[#080808] disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Sync Missing Default Media</span>
                    </button>
                  </section>
                </div>
              </div>
            )}

            {/* 2. PROFILE MANAGEMENT */}
            {activeSection === 'profile' && (
              <ProfileEditor
                draft={draftContent}
                onChange={updateDraft}
                onPickImage={(title, category, onSelect) =>
                  openImagePicker(
                    title,
                    category,
                    draftContent.heroPortraitUrl,
                    onSelect
                  )
                }
              />
            )}

            {/* 3. HOMEPAGE MANAGEMENT (+ CORE PRINCIPLES) */}
            {activeSection === 'homepage' && (
              <div className="space-y-10">
                <HomepageEditor
                  draft={draftContent}
                  onChange={updateDraft}
                  onPickImage={(title, category, onSelect) =>
                    openImagePicker(
                      title,
                      category,
                      draftContent.heroPortraitUrl,
                      onSelect
                    )
                  }
                />

                <div className="space-y-6 border-t border-white/10 pt-8">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                      Core Principles Section
                    </h2>
                    <p className="mt-1 text-xs text-[#9E9E98]">
                      Edit or add executive principles shown on the homepage.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {principles.map((item, idx) => (
                      <PrincipleCardEditor
                        key={item.id || idx}
                        item={item}
                        onUpdateLocal={(next) =>
                          setPrinciples((prev) =>
                            prev.map((p, i) => (i === idx ? next : p))
                          )
                        }
                        onSave={() => handleSavePrinciple(item)}
                        onDelete={
                          item.id
                            ? () => handleDeletePrinciple(item.id!)
                            : undefined
                        }
                      />
                    ))}
                  </div>

                  <form
                    onSubmit={handleAddPrinciple}
                    className="border border-[#D4AF37]/30 bg-[#151515] p-6"
                  >
                    <h3 className="font-display text-xl font-semibold text-[#F5F5F4]">
                      Add Principle
                    </h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <AdminInput
                        label="Number"
                        value={newPrinciple.number}
                        maxLength={10}
                        onChange={(v) =>
                          setNewPrinciple({ ...newPrinciple, number: v })
                        }
                      />
                      <AdminInput
                        label="Order"
                        value={String(newPrinciple.order)}
                        maxLength={4}
                        onChange={(v) =>
                          setNewPrinciple({
                            ...newPrinciple,
                            order: Number(v) || 1,
                          })
                        }
                      />
                      <div className="sm:col-span-2">
                        <AdminInput
                          label="Title"
                          value={newPrinciple.title}
                          maxLength={100}
                          onChange={(v) =>
                            setNewPrinciple({ ...newPrinciple, title: v })
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <AdminTextarea
                        label="Summary"
                        value={newPrinciple.summary}
                        maxLength={400}
                        rows={2}
                        onChange={(v) =>
                          setNewPrinciple({ ...newPrinciple, summary: v })
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="mt-4 inline-flex min-h-[42px] items-center gap-2 bg-[#D4AF37] px-5 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Add Principle</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 4. ABOUT ME MANAGEMENT */}
            {activeSection === 'about' && (
              <AboutEditor
                draft={draftContent}
                onChange={updateDraft}
                onPickImage={(title, category, onSelect) =>
                  openImagePicker(
                    title,
                    category,
                    draftContent.aboutWorkspaceUrl,
                    onSelect
                  )
                }
              />
            )}

            {/* 5. PHOTO AND MEDIA LIBRARY */}
            {activeSection === 'media' && (
              <MediaLibraryTab
                mediaItems={mediaItems}
                saving={saving}
                onUploadMedia={handleUploadMedia}
                onUpdateMedia={handleUpdateMedia}
                onDeleteMedia={handleDeleteMedia}
                onAssignToSection={handleAssignImageToSection}
              />
            )}

            {/* 6. JOURNEY AND TIMELINE */}
            {activeSection === 'journey' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {stages.map((stage, idx) => (
                    <JourneyStageControls
                      key={stage.id || idx}
                      stage={stage}
                      idx={idx}
                      total={stages.length}
                      onMove={handleMoveStage}
                      onUpdateLocal={(next) =>
                        setStages((prev) =>
                          prev.map((s, i) => (i === idx ? next : s))
                        )
                      }
                      onSave={() => handleSaveStage(stage)}
                      onDelete={
                        stage.id ? () => handleDeleteStage(stage.id!) : undefined
                      }
                      onPickImage={() =>
                        openImagePicker(
                          `Timeline Image — ${stage.title || 'Stage'}`,
                          'journey',
                          stage.imageUrl,
                          (url) =>
                            setStages((prev) =>
                              prev.map((s, i) =>
                                i === idx ? { ...s, imageUrl: url } : s
                              )
                            )
                        )
                      }
                    />
                  ))}
                </div>

                <form
                  onSubmit={handleAddStage}
                  className="border border-[#D4AF37]/30 bg-[#151515] p-6 sm:p-8"
                >
                  <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                    Add Timeline Entry
                  </h2>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <AdminInput
                      label="Step Number"
                      value={newStage.step}
                      maxLength={10}
                      onChange={(v) => setNewStage({ ...newStage, step: v })}
                    />
                    <AdminInput
                      label="Order"
                      value={String(newStage.order)}
                      maxLength={4}
                      onChange={(v) =>
                        setNewStage({ ...newStage, order: Number(v) || 1 })
                      }
                    />
                    <AdminInput
                      label="Date / Milestone"
                      value={newStage.dateLabel}
                      maxLength={60}
                      placeholder="e.g. 2026"
                      onChange={(v) => setNewStage({ ...newStage, dateLabel: v })}
                    />
                    <AdminInput
                      label="Title"
                      value={newStage.title}
                      maxLength={100}
                      onChange={(v) => setNewStage({ ...newStage, title: v })}
                    />
                  </div>
                  <div className="mt-4 space-y-4">
                    <AdminTextarea
                      label="Description"
                      value={newStage.description}
                      maxLength={500}
                      rows={3}
                      onChange={(v) =>
                        setNewStage({ ...newStage, description: v })
                      }
                    />
                    <ImageSlotEditor
                      label="Optional Entry Image"
                      url={newStage.imageUrl}
                      onChangeUrl={(url) =>
                        setNewStage({ ...newStage, imageUrl: url })
                      }
                      onClear={() => setNewStage({ ...newStage, imageUrl: '' })}
                      onOpenPicker={() =>
                        openImagePicker(
                          'Select Timeline Entry Image',
                          'journey',
                          newStage.imageUrl,
                          (url) => setNewStage({ ...newStage, imageUrl: url })
                        )
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-5 inline-flex min-h-[44px] items-center gap-2 bg-[#D4AF37] px-6 py-2.5 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Add Timeline Entry</span>
                  </button>
                </form>
              </div>
            )}

            {/* 7. BUSINESS MANAGEMENT */}
            {activeSection === 'business' && (
              <BusinessEditor
                draft={draftContent}
                onChange={updateDraft}
                onPickImage={(title, category, onSelect) =>
                  openImagePicker(
                    title,
                    category,
                    title.toLowerCase().includes('logo')
                      ? draftContent.businessLogoUrl
                      : draftContent.businessShowcaseUrl,
                    onSelect
                  )
                }
              />
            )}

            {/* 7B. BLOG & CONTENT SEO */}
            {activeSection === 'blog' && (
              <BlogManagerTab
                posts={blogPosts}
                saving={saving}
                onSavePost={handleSaveBlogPost}
                onDeletePost={handleDeleteBlogPost}
                onSeedDefaults={handleSeedDefaultBlogs}
                onPickImage={openImagePicker}
              />
            )}

            {/* 8. SOCIAL MEDIA MANAGEMENT */}
            {activeSection === 'social' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <section className="border border-white/10 bg-[#151515] p-6 space-y-4 lg:col-span-6">
                  <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                    Primary Social Links
                  </h2>
                  <p className="text-xs text-[#9E9E98]">
                    Update official social profiles displayed in the Contact and Footer sections.
                  </p>
                  <AdminInput
                    label="TikTok URL"
                    value={draftContent.tiktokUrl}
                    maxLength={300}
                    onChange={(v) => updateDraft({ ...draftContent, tiktokUrl: v })}
                  />
                  <AdminInput
                    label="Instagram URL"
                    value={draftContent.instagramUrl}
                    maxLength={300}
                    onChange={(v) =>
                      updateDraft({ ...draftContent, instagramUrl: v })
                    }
                  />
                  <AdminInput
                    label="LinkedIn URL"
                    value={draftContent.linkedinUrl}
                    maxLength={300}
                    onChange={(v) =>
                      updateDraft({ ...draftContent, linkedinUrl: v })
                    }
                  />
                  <AdminInput
                    label="Facebook URL"
                    value={draftContent.facebookUrl}
                    maxLength={300}
                    onChange={(v) =>
                      updateDraft({ ...draftContent, facebookUrl: v })
                    }
                  />
                </section>

                <section className="border border-white/10 bg-[#151515] p-6 space-y-4 lg:col-span-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                        Additional Social Links
                      </h2>
                      <p className="mt-1 text-xs text-[#9E9E98]">
                        Add custom platforms (e.g. X, YouTube, WhatsApp Business).
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={draftContent.customSocialLinks.length >= 8}
                      onClick={() =>
                        updateDraft({
                          ...draftContent,
                          customSocialLinks: [
                            ...draftContent.customSocialLinks,
                            { label: '', url: 'https://' },
                          ],
                        })
                      }
                      className="inline-flex min-h-[34px] items-center gap-1 border border-[#D4AF37]/50 bg-[#080808] px-3 py-1 text-xs font-semibold text-[#F2D675] uppercase hover:bg-[#D4AF37] hover:text-[#080808]"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Add Link</span>
                    </button>
                  </div>

                  {draftContent.customSocialLinks.length === 0 ? (
                    <p className="border border-white/10 bg-[#080808] p-6 text-center text-xs text-[#8C8C86]">
                      No custom social links added yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {draftContent.customSocialLinks.map((link, idx) => (
                        <div
                          key={idx}
                          className="space-y-3 border border-white/10 bg-[#0C0C0C] p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#D4AF37] uppercase">
                              Custom Link {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft({
                                  ...draftContent,
                                  customSocialLinks:
                                    draftContent.customSocialLinks.filter(
                                      (_, i) => i !== idx
                                    ),
                                })
                              }
                              className="text-xs text-[#8C8C86] hover:text-rose-300"
                            >
                              Remove
                            </button>
                          </div>
                          <AdminInput
                            label="Platform Label"
                            value={link.label}
                            maxLength={60}
                            placeholder="e.g. YouTube"
                            onChange={(v) => {
                              const next = [...draftContent.customSocialLinks];
                              next[idx] = { ...link, label: v };
                              updateDraft({ ...draftContent, customSocialLinks: next });
                            }}
                          />
                          <AdminInput
                            label="Profile URL"
                            value={link.url}
                            maxLength={300}
                            placeholder="https://..."
                            onChange={(v) => {
                              const next = [...draftContent.customSocialLinks];
                              next[idx] = { ...link, url: v };
                              updateDraft({ ...draftContent, customSocialLinks: next });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* 9. CONTACT MANAGEMENT */}
            {activeSection === 'contact' && (
              <div className="space-y-8">
                <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
                  <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                    Public Contact Section Settings
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <AdminInput
                      label="Public Business Email (Displayed on Website)"
                      value={draftContent.publicEmail}
                      maxLength={160}
                      onChange={(v) =>
                        updateDraft({ ...draftContent, publicEmail: v })
                      }
                    />
                    <AdminInput
                      label="Contact Section Heading"
                      value={draftContent.connectHeading}
                      maxLength={140}
                      onChange={(v) =>
                        updateDraft({ ...draftContent, connectHeading: v })
                      }
                    />
                  </div>
                  <AdminTextarea
                    label="Contact Description"
                    value={draftContent.connectDescription}
                    maxLength={500}
                    rows={3}
                    onChange={(v) =>
                      updateDraft({ ...draftContent, connectDescription: v })
                    }
                  />
                </section>

                <section className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                        Business Inquiries Inbox
                      </h2>
                      <p className="mt-1 text-xs text-[#9E9E98]">
                        {filteredInquiries.length} inquiry
                        {filteredInquiries.length === 1 ? '' : ' entries'} matching filter
                      </p>
                    </div>

                    <div className="flex items-center gap-1 border border-white/10 bg-[#151515] p-1">
                      {(['all', 'new', 'reviewed', 'archived'] as const).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setInquiryFilter(status)}
                            className={`px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                              inquiryFilter === status
                                ? 'bg-[#D4AF37] text-[#080808]'
                                : 'text-[#B8B8B3] hover:text-[#F2D675]'
                            }`}
                          >
                            {status}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {filteredInquiries.length === 0 ? (
                    <div className="border border-white/10 bg-[#151515] p-10 text-center text-sm text-[#8C8C86]">
                      No inquiries match the selected status.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInquiries.map((inq) => (
                        <InquiryCard
                          key={inq.id}
                          inquiry={inq}
                          saving={saving}
                          onUpdate={handleUpdateInquiry}
                          onDelete={handleDeleteInquiry}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* 10. WELCOME ANIMATION SETTINGS */}
            {activeSection === 'welcome' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <section className="border border-white/10 bg-[#151515] p-6 space-y-5 lg:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                        Welcome Animation Sequence
                      </h2>
                      <p className="mt-1 text-xs text-[#9E9E98]">
                        Plays once per browsing session when visitors open the website.
                      </p>
                    </div>

                    <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-3 border border-[#D4AF37]/35 bg-[#080808] px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                      <input
                        type="checkbox"
                        checked={draftContent.welcomeEnabled}
                        onChange={(e) =>
                          updateDraft({
                            ...draftContent,
                            welcomeEnabled: e.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-[#D4AF37]"
                      />
                      <span
                        className={
                          draftContent.welcomeEnabled
                            ? 'text-[#F2D675]'
                            : 'text-[#8C8C86]'
                        }
                      >
                        {draftContent.welcomeEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <AdminInput
                    label="Displayed Name"
                    value={draftContent.welcomeName}
                    maxLength={100}
                    onChange={(v) =>
                      updateDraft({ ...draftContent, welcomeName: v })
                    }
                  />
                  <AdminInput
                    label="Tagline"
                    value={draftContent.welcomeTagline}
                    maxLength={140}
                    onChange={(v) =>
                      updateDraft({ ...draftContent, welcomeTagline: v })
                    }
                  />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="welcome-duration-range"
                        className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
                      >
                        Animation Duration
                      </label>
                      <span className="text-xs font-semibold text-[#F2D675] tabular-nums">
                        {(draftContent.welcomeDurationMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <input
                      id="welcome-duration-range"
                      type="range"
                      min={2500}
                      max={5000}
                      step={100}
                      value={draftContent.welcomeDurationMs}
                      onChange={(e) =>
                        updateDraft({
                          ...draftContent,
                          welcomeDurationMs: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#D4AF37]"
                    />
                  </div>
                </section>

                <section className="flex flex-col justify-between border border-white/10 bg-[#151515] p-6 lg:col-span-5">
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                        Appearance & Effects
                      </h2>
                      <p className="mt-1 text-xs text-[#9E9E98]">
                        Backdrop tone and gold reveal choreography.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="welcome-bg-hex"
                        className="mb-2 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
                      >
                        Background Color
                      </label>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {[
                          { hex: '#080808', label: 'Deep Black' },
                          { hex: '#000000', label: 'Pure Black' },
                          { hex: '#101010', label: 'Obsidian' },
                          { hex: '#151515', label: 'Charcoal' },
                          { hex: '#0B0D12', label: 'Midnight' },
                        ].map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            title={swatch.label}
                            aria-label={`Set background to ${swatch.label}`}
                            onClick={() =>
                              updateDraft({
                                ...draftContent,
                                welcomeBgColor: swatch.hex,
                              })
                            }
                            style={{ backgroundColor: swatch.hex }}
                            className={`h-9 w-9 border transition-transform ${
                              draftContent.welcomeBgColor.toUpperCase() ===
                              swatch.hex
                                ? 'scale-105 border-[#F2D675] ring-2 ring-[#D4AF37]/40'
                                : 'border-white/25 hover:border-[#D4AF37]'
                            }`}
                          />
                        ))}
                        <input
                          aria-label="Custom background color"
                          type="color"
                          value={
                            HEX_COLOR_REGEX.test(draftContent.welcomeBgColor)
                              ? draftContent.welcomeBgColor
                              : '#080808'
                          }
                          onChange={(e) =>
                            updateDraft({
                              ...draftContent,
                              welcomeBgColor: e.target.value.toUpperCase(),
                            })
                          }
                          className="h-9 w-11 cursor-pointer border border-white/20 bg-[#080808] p-0.5"
                        />
                      </div>
                      <input
                        id="welcome-bg-hex"
                        type="text"
                        maxLength={7}
                        value={draftContent.welcomeBgColor}
                        onChange={(e) =>
                          updateDraft({
                            ...draftContent,
                            welcomeBgColor: e.target.value,
                          })
                        }
                        className="mt-3 w-full border border-white/15 bg-[#080808] px-3.5 py-2 font-mono text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2.5">
                      {(
                        [
                          {
                            id: 'cinematic',
                            title: 'Cinematic Gold Reveal',
                            desc: 'Center golden radial glow, subtle floating gold particles, and shimmer reveal.',
                          },
                          {
                            id: 'editorial',
                            title: 'Executive Monolith',
                            desc: 'Architectural gold hairline frame with stately serif fade and line sweep.',
                          },
                          {
                            id: 'minimal',
                            title: 'Pure Minimal Gold',
                            desc: 'Restrained central light with crisp typography and underline motion.',
                          },
                        ] as {
                          id: WelcomeAnimationStyle;
                          title: string;
                          desc: string;
                        }[]
                      ).map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            updateDraft({
                              ...draftContent,
                              welcomeStyle: option.id,
                            })
                          }
                          className={`w-full border p-3.5 text-left transition-colors ${
                            draftContent.welcomeStyle === option.id
                              ? 'border-[#D4AF37] bg-[#080808]'
                              : 'border-white/10 bg-[#0C0C0C] hover:border-white/25'
                          }`}
                        >
                          <p className="text-sm font-semibold text-[#F5F5F4]">
                            {option.title}
                          </p>
                          <p className="mt-1 text-xs text-[#9E9E98]">
                            {option.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewWelcome(true)}
                    className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#D4AF37]/50 bg-[#080808] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#F2D675] uppercase hover:bg-[#D4AF37] hover:text-[#080808]"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Preview Welcome Animation</span>
                  </button>
                </section>
              </div>
            )}

            {/* 11. SEO & SEARCH CONSOLE SETTINGS */}
            {activeSection === 'seo' && (
              <SeoManagerTab
                draft={draftContent}
                onChange={updateDraft}
                onPickImage={openImagePicker}
              />
            )}

            {/* 12. FOOTER MANAGEMENT */}
            {activeSection === 'footer' && (
              <section className="max-w-3xl border border-white/10 bg-[#151515] p-6 space-y-5">
                <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                  Footer Content & Legal Line
                </h2>
                <AdminTextarea
                  label="Footer Description / Tagline"
                  value={draftContent.footerDescription}
                  maxLength={300}
                  rows={2}
                  onChange={(v) =>
                    updateDraft({ ...draftContent, footerDescription: v })
                  }
                />
                <AdminInput
                  label="Copyright Text"
                  value={draftContent.footerCopyright}
                  maxLength={160}
                  onChange={(v) =>
                    updateDraft({ ...draftContent, footerCopyright: v })
                  }
                />
                <AdminInput
                  label="Business Website Link"
                  value={draftContent.businessWebsiteUrl}
                  maxLength={300}
                  onChange={(v) =>
                    updateDraft({ ...draftContent, businessWebsiteUrl: v })
                  }
                />
                <p className="text-xs text-[#9E9E98]">
                  Social icons displayed in the footer automatically sync with Social Media settings, and public footer navigation contains no administrative links.
                </p>
              </section>
            )}

            {/* 13. WEBSITE PREVIEW & VERSION HISTORY */}
            {activeSection === 'preview' && (
              <div className="space-y-8">
                <section className="flex flex-col justify-between gap-6 border border-[#D4AF37]/30 bg-[#151515] p-6 sm:flex-row sm:items-center sm:p-8">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
                      Draft Verification
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-[#F5F5F4] sm:text-3xl">
                      Preview Unpublished Website Changes
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-[#B8B8B3]">
                      Review your layout, typography, photographs, and timeline entries in full-screen preview before publishing to the live public website.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowSitePreview(true)}
                      className="inline-flex min-h-[46px] items-center gap-2 bg-[#D4AF37] px-6 py-3 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span>Open Full-Screen Preview</span>
                    </button>
                  </div>
                </section>

                {/* Version History */}
                <div className="space-y-4">
                  <div className="border border-white/10 bg-[#151515] p-6">
                    <h3 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                      Published Version History
                    </h3>
                    <p className="mt-1 text-xs text-[#9E9E98]">
                      Restore any previously published snapshot into your draft editor.
                    </p>
                  </div>

                  {versions.length === 0 ? (
                    <div className="border border-white/10 bg-[#151515] p-10 text-center text-sm text-[#8C8C86]">
                      No published snapshots yet. Click &ldquo;Publish Changes&rdquo; in the top bar to archive your first version.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {versions.map((ver) => (
                        <div
                          key={ver.id}
                          className="flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-[#151515] p-5"
                        >
                          <div>
                            <p className="font-display text-xl font-semibold text-[#F5F5F4]">
                              {ver.label}
                            </p>
                            <p className="mt-1 text-xs text-[#9E9E98]">
                              {ver.snapshot.brandName} · {ver.snapshot.businessName} ·{' '}
                              {ver.snapshot.publicEmail}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleRestoreVersion(ver)}
                              className="inline-flex min-h-[38px] items-center gap-1.5 border border-[#D4AF37]/50 bg-[#080808] px-4 py-2 text-xs font-semibold text-[#F2D675] uppercase hover:bg-[#D4AF37] hover:text-[#080808]"
                            >
                              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Restore Version</span>
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => handleDeleteVersion(ver.id)}
                              aria-label="Delete snapshot"
                              className="inline-flex min-h-[38px] items-center border border-white/15 px-3 py-2 text-xs text-[#B8B8B3] hover:border-rose-500/50 hover:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 14. ACCOUNT SETTINGS */}
            {activeSection === 'account' && (
              <AccountSettingsTab
                userEmail={user?.email || AUTHORIZED_ADMIN_EMAIL}
                emailVerified={Boolean(user?.emailVerified)}
                idleTimeoutMinutes={idleTimeoutMinutes}
                sessionRemainingMinutes={sessionRemainingMinutes}
                rememberMeActive={rememberMeActive}
                saving={saving}
                onChangeIdleTimeout={handleChangeIdleTimeout}
                onChangePassword={handleChangePassword}
                onSendPasswordReset={async () => {
                  const ok = await handleSendPasswordReset(
                    user?.email || AUTHORIZED_ADMIN_EMAIL
                  );
                  if (ok) {
                    showNotice(
                      'Password reset email sent to your administrator inbox.'
                    );
                  }
                }}
                onSignOut={() => performSignOut()}
              />
            )}
          </div>
        </main>
      </div>

      {/* Welcome Intro Live Preview */}
      {previewWelcome && (
        <WelcomeIntro
          name={draftContent.welcomeName}
          tagline={draftContent.welcomeTagline}
          durationMs={draftContent.welcomeDurationMs}
          bgColor={draftContent.welcomeBgColor}
          styleVariant={draftContent.welcomeStyle}
          isPreview
          onComplete={() => setPreviewWelcome(false)}
        />
      )}

      {/* Full Website Draft Preview Modal */}
      {showSitePreview && (
        <SitePreviewModal
          content={draftContent}
          stages={stages}
          principles={principles}
          blogPosts={blogPosts}
          onPublish={() => {
            setShowSitePreview(false);
            setShowPublishConfirm(true);
          }}
          onClose={() => setShowSitePreview(false)}
        />
      )}

      {/* Media Picker Modal */}
      {pickerState && (
        <MediaPickerModal
          title={pickerState.title}
          currentUrl={pickerState.currentUrl}
          defaultCategory={pickerState.category}
          mediaItems={mediaItems}
          onSelect={pickerState.onSelect}
          onUploadMedia={handleUploadMedia}
          onClose={() => setPickerState(null)}
        />
      )}

      {/* Publish Confirmation Dialog */}
      {showPublishConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm publishing changes"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md border border-[#D4AF37]/40 bg-[#151515] p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
              Publish Confirmation
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#F5F5F4]">
              Publish Changes to Live Website?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#B8B8B3]">
              Your current draft will immediately replace the public website content, and a backup snapshot will be saved to Version History.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPublishConfirm(false)}
                className="min-h-[42px] border border-white/15 bg-[#080808] px-4 py-2 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase hover:border-white/35"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handlePublishConfirmed}
                className="min-h-[42px] bg-[#D4AF37] px-5 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
              >
                {saving ? 'Publishing...' : 'Confirm Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InquiryCard({
  inquiry,
  saving,
  onUpdate,
  onDelete,
}: {
  inquiry: InquiryRecord;
  saving: boolean;
  onUpdate: (
    inquiry: InquiryRecord,
    status: InquiryRecord['status'],
    notes: string
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(inquiry.adminNotes || '');
  const [status, setStatus] = useState<InquiryRecord['status']>(inquiry.status);

  return (
    <article className="border border-white/10 bg-[#151515] p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            {inquiry.subject}
          </h3>
          <p className="mt-1 text-xs text-[#B8B8B3]">
            {inquiry.senderName} · {inquiry.senderEmail}
            {inquiry.company ? ` · ${inquiry.company}` : ''}
          </p>
        </div>

        <select
          aria-label="Inquiry status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as InquiryRecord['status'])
          }
          className="border border-[#D4AF37]/40 bg-[#080808] px-3 py-2 text-xs font-semibold tracking-wider text-[#F2D675] uppercase focus:border-[#D4AF37] focus:outline-none"
        >
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#D4D4D0]">
        {inquiry.message}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-12 sm:items-end">
        <div className="sm:col-span-8">
          <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
            Internal Admin Notes
          </label>
          <input
            type="text"
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add private follow-up notes..."
            className="w-full border border-white/15 bg-[#080808] px-3.5 py-2 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-end gap-2 sm:col-span-4">
          <button
            type="button"
            disabled={saving}
            onClick={() => onUpdate(inquiry, status, notes)}
            className="inline-flex min-h-[40px] items-center gap-1.5 bg-[#D4AF37] px-4 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Save</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onDelete(inquiry.id)}
            className="inline-flex min-h-[40px] items-center gap-1.5 border border-white/15 px-3 py-2 text-xs text-[#B8B8B3] hover:border-rose-500/50 hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}
