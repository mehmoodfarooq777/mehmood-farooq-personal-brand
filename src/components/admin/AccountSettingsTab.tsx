import { useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

interface AccountSettingsTabProps {
  userEmail: string;
  emailVerified: boolean;
  idleTimeoutMinutes: number;
  sessionRemainingMinutes: number;
  rememberMeActive: boolean;
  saving: boolean;
  onChangeIdleTimeout: (minutes: number) => void;
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  onSendPasswordReset: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AccountSettingsTab({
  userEmail,
  emailVerified,
  idleTimeoutMinutes,
  sessionRemainingMinutes,
  rememberMeActive,
  saving,
  onChangeIdleTimeout,
  onChangePassword,
  onSendPasswordReset,
  onSignOut,
}: AccountSettingsTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!currentPassword) {
      setFormError('Enter your current password to verify your identity.');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation do not match.');
      return;
    }

    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormSuccess('Administrator password updated securely in Firebase Auth.');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to update password.'
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left: Security Profile & Session Status */}
      <div className="space-y-6 lg:col-span-5">
        <section className="border border-white/10 bg-[#151515] p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#D4AF37]/40 bg-[#080808] text-[#D4AF37]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                Administrator Account
              </h2>
              <p className="text-xs text-[#9E9E98]">
                Firebase Authentication & Security
              </p>
            </div>
          </div>

          <dl className="space-y-3 border-t border-white/10 pt-4 text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#8C8C86] uppercase">Authorized Email</dt>
              <dd className="font-medium text-[#F5F5F4]">{userEmail}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#8C8C86] uppercase">Email Verification</dt>
              <dd className="font-semibold text-[#F2D675]">
                {emailVerified ? 'Verified' : 'Unverified'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#8C8C86] uppercase">Auth Persistence</dt>
              <dd className="text-[#D4D4D0]">
                {rememberMeActive ? 'Remembered (Local)' : 'Session Only'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#8C8C86] uppercase">Inactivity Timeout</dt>
              <dd className="tabular-nums text-[#D4D4D0]">
                {sessionRemainingMinutes}m remaining
              </dd>
            </div>
          </dl>

          <div className="border-t border-white/10 pt-4">
            <label
              htmlFor="idle-timeout-select"
              className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
            >
              <Clock className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
              <span>Auto-Lock After Inactivity</span>
            </label>
            <select
              id="idle-timeout-select"
              value={idleTimeoutMinutes}
              onChange={(e) => onChangeIdleTimeout(Number(e.target.value))}
              className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes (Recommended)</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={onSendPasswordReset}
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 border border-[#D4AF37]/45 bg-[#080808] px-4 py-2 text-xs font-semibold tracking-wider text-[#F2D675] uppercase hover:bg-[#1E1E1E] disabled:opacity-50"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Send Password Reset Email</span>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 border border-rose-500/40 bg-rose-950/20 px-4 py-2 text-xs font-semibold tracking-wider text-rose-200 uppercase hover:bg-rose-950/40"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out Now</span>
            </button>
          </div>
        </section>
      </div>

      {/* Right: Change Password Form */}
      <div className="lg:col-span-7">
        <section className="border border-white/10 bg-[#151515] p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <KeyRound className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                Change Administrator Password
              </h2>
              <p className="mt-0.5 text-xs text-[#9E9E98]">
                Requires your current password for Firebase re-authentication.
              </p>
            </div>
          </div>

          {formSuccess && (
            <div
              role="status"
              className="mt-5 flex items-center gap-3 border border-[#D4AF37]/45 bg-[#080808] p-4 text-xs text-[#F2D675]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div
              role="alert"
              className="mt-5 flex items-center gap-3 border border-rose-500/40 bg-rose-950/30 p-4 text-xs text-rose-200"
            >
              <ShieldAlert
                className="h-4 w-4 shrink-0 text-rose-400"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="acct-current-pw"
                className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="acct-current-pw"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 pr-11 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  aria-label={
                    showCurrent ? 'Hide current password' : 'Show current password'
                  }
                  className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#9E9E98] hover:text-[#F2D675]"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="acct-new-pw"
                className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
              >
                New Password (Minimum 8 Characters)
              </label>
              <div className="relative">
                <input
                  id="acct-new-pw"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 pr-11 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#9E9E98] hover:text-[#F2D675]"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="acct-confirm-pw"
                className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase"
              >
                Confirm New Password
              </label>
              <input
                id="acct-confirm-pw"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#D4AF37] px-6 py-2.5 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors hover:bg-[#F2D675] disabled:opacity-50"
            >
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Update Password</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
