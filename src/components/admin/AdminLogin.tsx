import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteConfig';

interface AdminLoginProps {
  authError: string;
  signingIn: boolean;
  needsVerification: boolean;
  verificationNotice: string;
  onEmailPasswordSignIn: (input: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<void>;
  onSendPasswordReset: (email: string) => Promise<boolean>;
  onSendVerificationEmail: () => Promise<void>;
  onRefreshVerification: () => Promise<void>;
  onCancelVerification: () => Promise<void>;
  onBackToSite: () => void;
}

export function AdminLogin({
  authError,
  signingIn,
  needsVerification,
  verificationNotice,
  onEmailPasswordSignIn,
  onSendPasswordReset,
  onSendVerificationEmail,
  onRefreshVerification,
  onCancelVerification,
  onBackToSite,
}: AdminLoginProps) {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState('');

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Enter a valid administrator email address.');
      return;
    }
    if (!password) {
      setLocalError('Enter your password.');
      return;
    }

    await onEmailPasswordSignIn({
      email: cleanEmail,
      password,
      rememberMe,
    });
  }

  async function handleForgotSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError('');
    setResetSent(false);

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Enter a valid email address to receive a reset link.');
      return;
    }

    const ok = await onSendPasswordReset(cleanEmail);
    if (ok) {
      setResetSent(true);
    }
  }

  const displayedError = localError || authError;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#080808] px-6 py-10 text-[#F5F5F4]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#B8B8B3] transition-colors hover:text-[#F2D675]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Return to Website</span>
        </button>

        <span className="border border-[#D4AF37]/30 bg-[#151515] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
          Private Admin Portal
        </span>
      </div>

      <div className="mx-auto my-auto w-full max-w-md border border-[#D4AF37]/30 bg-[#151515] p-8 sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center border border-[#D4AF37]/40 bg-[#080808] text-[#D4AF37]">
          {needsVerification ? (
            <Mail className="h-5 w-5" aria-hidden="true" />
          ) : mode === 'forgot' ? (
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          )}
        </div>

        <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
          Private Administration
        </p>

        {needsVerification ? (
          <>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4]">
              Verify Administrator Email
            </h1>
            <div className="my-5 h-px w-14 bg-[#D4AF37]/60" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-[#B8B8B3]">
              Your email/password credentials matched, but your Firebase account email must be verified once before database rules grant dashboard access.
            </p>

            {verificationNotice && (
              <div
                role="status"
                className="mt-5 flex items-start gap-3 border border-[#D4AF37]/40 bg-[#080808] p-4 text-xs leading-relaxed text-[#F2D675]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{verificationNotice}</span>
              </div>
            )}

            {displayedError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 border border-rose-500/40 bg-rose-950/30 p-4 text-xs leading-relaxed text-rose-200"
              >
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
                  aria-hidden="true"
                />
                <span>{displayedError}</span>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={signingIn}
                onClick={onSendVerificationEmail}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 bg-[#D4AF37] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors hover:bg-[#F2D675] disabled:opacity-60"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Send Verification Email</span>
              </button>
              <button
                type="button"
                disabled={signingIn}
                onClick={onRefreshVerification}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 border border-[#D4AF37]/50 bg-[#080808] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#F2D675] uppercase transition-colors hover:bg-[#1E1E1E] disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>I Verified — Continue to Dashboard</span>
              </button>
              <button
                type="button"
                onClick={onCancelVerification}
                className="w-full py-2 text-xs font-medium text-[#9E9E98] hover:text-[#F5F5F4]"
              >
                Sign out and return to login
              </button>
            </div>
          </>
        ) : mode === 'forgot' ? (
          <>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4]">
              Reset Password
            </h1>
            <div className="my-5 h-px w-14 bg-[#D4AF37]/60" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-[#B8B8B3]">
              Enter your administrator email address. If an authorized account exists, Firebase will send a password reset link.
            </p>

            {resetSent && (
              <div
                role="status"
                className="mt-5 flex items-start gap-3 border border-[#D4AF37]/45 bg-[#080808] p-4 text-xs leading-relaxed text-[#F2D675]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Password reset instructions have been sent. Check your inbox and spam folder, then sign in with your new password.
                </span>
              </div>
            )}

            {displayedError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 border border-rose-500/40 bg-rose-950/30 p-4 text-xs leading-relaxed text-rose-200"
              >
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
                  aria-hidden="true"
                />
                <span>{displayedError}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="mt-6 space-y-5" noValidate>
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
                >
                  Administrator Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter administrator email"
                  className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] placeholder-[#5F5F59] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={signingIn}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#D4AF37] px-6 py-3 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors hover:bg-[#F2D675] disabled:opacity-60"
              >
                <span>{signingIn ? 'Sending...' : 'Send Reset Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocalError('');
                  setResetSent(false);
                  setMode('login');
                }}
                className="w-full py-1 text-xs font-medium text-[#B8B8B3] hover:text-[#F2D675]"
              >
                Back to Sign-In
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4]">
              Administrator Sign-In
            </h1>
            <div className="my-5 h-px w-14 bg-[#D4AF37]/60" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-[#B8B8B3]">
              Sign in with your authorized administrator email and password. Public registration is disabled.
            </p>

            {displayedError && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 border border-rose-500/40 bg-rose-950/30 p-4 text-xs leading-relaxed text-rose-200"
              >
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
                  aria-hidden="true"
                />
                <span>{displayedError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5" noValidate>
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 pr-10 text-sm text-[#F5F5F4] placeholder-[#5F5F59] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <Mail
                    className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#6F6F69]"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalError('');
                      setResetEmail(email);
                      setMode('forgot');
                    }}
                    className="text-xs font-medium text-[#D4AF37] hover:text-[#F2D675]"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 pr-11 text-sm text-[#F5F5F4] placeholder-[#5F5F59] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#9E9E98] hover:text-[#F2D675]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between border border-white/10 bg-[#080808] px-3.5 py-2.5 text-xs text-[#B8B8B3]">
                <span>Remember me on this device</span>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#D4AF37]"
                />
              </label>

              <button
                type="submit"
                disabled={signingIn}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 bg-[#D4AF37] px-6 py-3 text-sm font-semibold tracking-wide text-[#080808] transition-colors duration-200 hover:bg-[#F2D675] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                <span>{signingIn ? 'Signing In...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mx-auto text-xs text-[#8C8C86]">
        {SITE_CONFIG.brand.copyright}
      </p>
    </div>
  );
}
