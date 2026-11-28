import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Globe, Mail, Send } from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  clampString,
  EMAIL_REGEX,
  sanitizeHref,
  SITE_CONFIG,
  type LiveSiteContent,
  type SocialProfile,
} from '../data/siteConfig';
import {
  db,
  extractReadableFirebaseError,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { SocialIcon } from './SocialIcons';

interface ConnectSectionProps {
  content: LiveSiteContent;
  isPreview?: boolean;
}

export function ConnectSection({
  content,
  isPreview = false,
}: ConnectSectionProps) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const socialProfiles: SocialProfile[] = [
    {
      id: 'tiktok',
      name: 'TikTok',
      label: 'Connect on TikTok',
      url: content.tiktokUrl,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      label: 'Connect on Instagram',
      url: content.instagramUrl,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      label: 'Connect on LinkedIn',
      url: content.linkedinUrl,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      label: 'Connect on Facebook',
      url: content.facebookUrl,
    },
  ];

  const customSocials = (content.customSocialLinks || []).filter(
    (s) => s.label.trim() && s.url.trim()
  );

  async function handleInquirySubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (isPreview) {
      setSubmitted(true);
      return;
    }

    const cleanName = clampString(senderName, 120);
    const cleanEmail = clampString(senderEmail, 160);
    const cleanCompany = clampString(company, 140);
    const cleanSubject = clampString(subject, 160);
    const cleanMessage = clampString(message, 2000);

    if (cleanName.length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (cleanSubject.length < 2) {
      setFormError('Please enter a brief subject.');
      return;
    }
    if (cleanMessage.length < 10) {
      setFormError('Please provide a message of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const path = `inquiries/${inquiryId}`;

    try {
      await setDoc(doc(db, 'inquiries', inquiryId), {
        senderName: cleanName,
        senderEmail: cleanEmail,
        company: cleanCompany,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'new',
        adminNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSubmitted(true);
      setSenderName('');
      setSenderEmail('');
      setCompany('');
      setSubject('');
      setMessage('');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (wrapped) {
        setFormError(extractReadableFirebaseError(wrapped));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="connect"
      className="border-b border-white/10 bg-[#0C0C0C] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Heading, Public Business Email & Social Profiles */}
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
              {SITE_CONFIG.connect.kicker}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] text-balance sm:text-4xl lg:text-5xl">
              {content.connectHeading}
            </h2>
            <div className="my-6 h-px w-16 bg-[#D4AF37]/60" aria-hidden="true" />
            <p className="max-w-lg text-base leading-relaxed text-[#B8B8B3] sm:text-lg">
              {content.connectDescription}
            </p>

            {/* Public Business Email Card */}
            <div className="mt-8 border border-[#D4AF37]/30 bg-[#151515] p-6">
              <p className="text-xs font-medium tracking-[0.16em] text-[#9E9E98] uppercase">
                Public Business Contact · {content.businessName}
              </p>
              <a
                href={`mailto:${content.publicEmail}`}
                className="group mt-3 inline-flex items-center gap-3 text-lg font-semibold tracking-wide text-[#F2D675] transition-colors duration-200 hover:text-[#F5F5F4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] sm:text-xl"
              >
                <span className="flex h-10 w-10 items-center justify-center border border-[#D4AF37]/35 bg-[#080808] text-[#D4AF37] transition-colors group-hover:border-[#F2D675] group-hover:text-[#F2D675]">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>{content.publicEmail}</span>
              </a>
              <p className="mt-2.5 text-xs text-[#8C8C86]">
                United States-Based Business · Registered in{' '}
                {content.businessState || content.businessRegistration},{' '}
                {content.businessCountry}
              </p>
            </div>

            {/* Social Media Links Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {socialProfiles.map((social) => (
                <a
                  key={social.id}
                  href={sanitizeHref(social.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group flex min-h-[72px] items-center justify-between border border-white/10 bg-[#151515] px-5 py-4 transition-colors duration-200 hover:border-[#D4AF37]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center border border-[#D4AF37]/25 bg-[#080808] text-[#D4AF37] transition-colors duration-200 group-hover:border-[#F2D675] group-hover:text-[#F2D675]">
                      <SocialIcon id={social.id} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-wide text-[#F5F5F4] transition-colors duration-200 group-hover:text-[#F2D675]">
                        {social.name}
                      </p>
                      <p className="text-xs text-[#8C8C86]">Official Profile</p>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-[#8C8C86] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#F2D675]"
                    aria-hidden="true"
                  />
                </a>
              ))}

              {customSocials.map((custom, idx) => (
                <a
                  key={idx}
                  href={sanitizeHref(custom.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[72px] items-center justify-between border border-white/10 bg-[#151515] px-5 py-4 transition-colors duration-200 hover:border-[#D4AF37]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center border border-[#D4AF37]/25 bg-[#080808] text-[#D4AF37] transition-colors duration-200 group-hover:border-[#F2D675] group-hover:text-[#F2D675]">
                      <Globe className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-wide text-[#F5F5F4] transition-colors duration-200 group-hover:text-[#F2D675]">
                        {custom.label}
                      </p>
                      <p className="text-xs text-[#8C8C86]">Social Profile</p>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-[#8C8C86] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#F2D675]"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Business Inquiry Form */}
          <div className="border border-white/10 bg-[#151515] p-7 sm:p-9 lg:col-span-6">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-[#F5F5F4] sm:text-3xl">
              Direct Business Inquiry
            </h3>
            <p className="mt-2 text-sm text-[#B8B8B3]">
              Send a message regarding dispatch partnerships, operations, or collaborations.
            </p>

            {submitted ? (
              <div className="mt-8 border border-[#D4AF37]/35 bg-[#080808] p-6">
                <div className="flex items-center gap-3 text-[#F2D675]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <p className="text-sm font-semibold tracking-wide uppercase">
                    Inquiry Received
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#C2C2BC]">
                  Thank you for reaching out. Your inquiry has been recorded, or you may follow up directly at{' '}
                  <a
                    href={`mailto:${content.publicEmail}`}
                    className="text-[#F2D675] underline underline-offset-4"
                  >
                    {content.publicEmail}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 inline-flex min-h-[40px] items-center border border-[#D4AF37]/40 px-4 py-2 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase transition-colors hover:border-[#F2D675] hover:text-[#F2D675]"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="mt-7 space-y-5" noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="mb-2 block text-xs font-medium tracking-wider text-[#B8B8B3] uppercase"
                    >
                      Full Name
                    </label>
                    <input
                      id="inquiry-name"
                      type="text"
                      required
                      maxLength={120}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border border-white/15 bg-[#080808] px-4 py-3 text-sm text-[#F5F5F4] placeholder-[#6F6F69] transition-colors focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="inquiry-email"
                      className="mb-2 block text-xs font-medium tracking-wider text-[#B8B8B3] uppercase"
                    >
                      Email Address
                    </label>
                    <input
                      id="inquiry-email"
                      type="email"
                      required
                      maxLength={160}
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full border border-white/15 bg-[#080808] px-4 py-3 text-sm text-[#F5F5F4] placeholder-[#6F6F69] transition-colors focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="inquiry-company"
                      className="mb-2 block text-xs font-medium tracking-wider text-[#B8B8B3] uppercase"
                    >
                      Company (Optional)
                    </label>
                    <input
                      id="inquiry-company"
                      type="text"
                      maxLength={140}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Organization or carrier"
                      className="w-full border border-white/15 bg-[#080808] px-4 py-3 text-sm text-[#F5F5F4] placeholder-[#6F6F69] transition-colors focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="inquiry-subject"
                      className="mb-2 block text-xs font-medium tracking-wider text-[#B8B8B3] uppercase"
                    >
                      Subject
                    </label>
                    <input
                      id="inquiry-subject"
                      type="text"
                      required
                      maxLength={160}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Partnership or dispatch inquiry"
                      className="w-full border border-white/15 bg-[#080808] px-4 py-3 text-sm text-[#F5F5F4] placeholder-[#6F6F69] transition-colors focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-message"
                    className="mb-2 block text-xs font-medium tracking-wider text-[#B8B8B3] uppercase"
                  >
                    Message
                  </label>
                  <textarea
                    id="inquiry-message"
                    rows={4}
                    required
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share details about your inquiry..."
                    className="w-full resize-y border border-white/15 bg-[#080808] px-4 py-3 text-sm text-[#F5F5F4] placeholder-[#6F6F69] transition-colors focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                {formError && (
                  <p role="alert" className="text-xs font-medium text-rose-400">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 bg-[#D4AF37] px-6 py-3 text-sm font-semibold tracking-wide text-[#080808] transition-colors duration-200 hover:bg-[#F2D675] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
