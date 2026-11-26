import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  JourneyStage,
  LiveSiteContent,
  MediaCategory,
  PrincipleItem,
} from '../../data/siteConfig';

export function AdminInput({
  label,
  value,
  maxLength,
  placeholder,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] placeholder-[#5F5F59] transition-colors focus:border-[#D4AF37] focus:outline-none"
      />
    </div>
  );
}

export function AdminTextarea({
  label,
  value,
  maxLength,
  rows = 3,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  rows?: number;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
        {label}
      </label>
      <textarea
        value={value}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] placeholder-[#5F5F59] transition-colors focus:border-[#D4AF37] focus:outline-none"
      />
    </div>
  );
}

export function ImageSlotEditor({
  label,
  url,
  onChangeUrl,
  onOpenPicker,
  onClear,
}: {
  label: string;
  url: string;
  onChangeUrl: (nextUrl: string) => void;
  onOpenPicker: () => void;
  onClear?: () => void;
}) {
  return (
    <div className="border border-white/10 bg-[#0C0C0C] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPicker}
            className="inline-flex min-h-[34px] items-center gap-1.5 border border-[#D4AF37]/50 bg-[#151515] px-3 py-1 text-xs font-semibold text-[#F2D675] uppercase hover:bg-[#D4AF37] hover:text-[#080808]"
          >
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Choose / Upload</span>
          </button>
          {onClear && url && (
            <button
              type="button"
              onClick={onClear}
              aria-label={`Remove ${label}`}
              className="inline-flex min-h-[34px] items-center border border-white/15 px-2.5 py-1 text-xs text-[#B8B8B3] hover:border-rose-500/50 hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-20 w-28 shrink-0 overflow-hidden border border-white/10 bg-[#080808]">
          {url ? (
            <img
              src={url}
              alt={label}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#6F6F69]">
              None
            </div>
          )}
        </div>
        <input
          type="text"
          value={url}
          maxLength={700000}
          placeholder="Select from Media Library or paste image URL"
          onChange={(e) => onChangeUrl(e.target.value)}
          className="min-w-0 flex-1 border border-white/15 bg-[#080808] px-3 py-2 text-xs text-[#D4D4D0] focus:border-[#D4AF37] focus:outline-none"
        />
      </div>
    </div>
  );
}

export function ProfileEditor({
  draft,
  onChange,
  onPickImage,
}: {
  draft: LiveSiteContent;
  onChange: (next: LiveSiteContent) => void;
  onPickImage: (
    title: string,
    category: MediaCategory,
    onSelect: (url: string) => void
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            Personal Identity & Title
          </h2>
          <AdminInput
            label="Full Name"
            value={draft.brandName}
            maxLength={100}
            onChange={(v) => onChange({ ...draft, brandName: v })}
          />
          <AdminInput
            label="Professional Title"
            value={draft.profession}
            maxLength={160}
            onChange={(v) => onChange({ ...draft, profession: v })}
          />
          <AdminInput
            label="Location"
            value={draft.location}
            maxLength={80}
            onChange={(v) => onChange({ ...draft, location: v })}
          />
          <AdminTextarea
            label="Short Introduction"
            value={draft.heroDescription}
            maxLength={500}
            rows={3}
            onChange={(v) => onChange({ ...draft, heroDescription: v })}
          />
        </section>

        <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            Profile & Hero Photographs
          </h2>
          <ImageSlotEditor
            label="Profile / Hero Portrait"
            url={draft.heroPortraitUrl}
            onChangeUrl={(url) => onChange({ ...draft, heroPortraitUrl: url })}
            onOpenPicker={() =>
              onPickImage('Select Profile / Hero Portrait', 'profile', (url) =>
                onChange({ ...draft, heroPortraitUrl: url })
              )
            }
          />
          <AdminTextarea
            label="Primary Biography Summary"
            value={draft.aboutParagraphs[0] || ''}
            maxLength={1200}
            rows={4}
            onChange={(v) => {
              const next = [...draft.aboutParagraphs];
              next[0] = v;
              onChange({ ...draft, aboutParagraphs: next });
            }}
          />
        </section>
      </div>
    </div>
  );
}

export function HomepageEditor({
  draft,
  onChange,
  onPickImage,
}: {
  draft: LiveSiteContent;
  onChange: (next: LiveSiteContent) => void;
  onPickImage: (
    title: string,
    category: MediaCategory,
    onSelect: (url: string) => void
  ) => void;
}) {
  const vis = draft.sectionVisibility;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
        <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
          Hero Headline & Copy
        </h2>
        <AdminInput
          label="Main Hero Heading"
          value={draft.heroHeading}
          maxLength={100}
          onChange={(v) => onChange({ ...draft, heroHeading: v })}
        />
        <AdminInput
          label="Personal Tagline"
          value={draft.tagline}
          maxLength={140}
          onChange={(v) => onChange({ ...draft, tagline: v })}
        />
        <AdminTextarea
          label="Hero Description"
          value={draft.heroDescription}
          maxLength={500}
          rows={3}
          onChange={(v) => onChange({ ...draft, heroDescription: v })}
        />
        <ImageSlotEditor
          label="Hero Feature Image"
          url={draft.heroPortraitUrl}
          onChangeUrl={(url) => onChange({ ...draft, heroPortraitUrl: url })}
          onOpenPicker={() =>
            onPickImage('Select Hero Image', 'hero', (url) =>
              onChange({ ...draft, heroPortraitUrl: url })
            )
          }
        />
      </section>

      <div className="space-y-6">
        <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            Homepage Buttons & URLs
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput
              label="Primary Button Text"
              value={draft.heroPrimaryCtaLabel}
              maxLength={60}
              onChange={(v) => onChange({ ...draft, heroPrimaryCtaLabel: v })}
            />
            <AdminInput
              label="Primary Button URL"
              value={draft.heroPrimaryCtaUrl}
              maxLength={300}
              onChange={(v) => onChange({ ...draft, heroPrimaryCtaUrl: v })}
            />
            <AdminInput
              label="Secondary Button Text"
              value={draft.heroSecondaryCtaLabel}
              maxLength={60}
              onChange={(v) => onChange({ ...draft, heroSecondaryCtaLabel: v })}
            />
            <AdminInput
              label="Secondary Button URL"
              value={draft.heroSecondaryCtaUrl}
              maxLength={300}
              onChange={(v) => onChange({ ...draft, heroSecondaryCtaUrl: v })}
            />
          </div>
        </section>

        <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            Homepage Section Visibility
          </h2>
          <p className="text-xs text-[#9E9E98]">
            Enable or disable sections on the public website.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                { key: 'about', label: 'About Me Section' },
                { key: 'journey', label: 'My Journey Timeline' },
                { key: 'business', label: 'Business Showcase' },
                { key: 'principles', label: 'My Principles' },
                { key: 'connect', label: 'Contact & Socials' },
              ] as { key: keyof typeof vis; label: string }[]
            ).map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between border border-white/10 bg-[#080808] px-4 py-3 text-sm"
              >
                <span className="text-[#D4D4D0]">{item.label}</span>
                <input
                  type="checkbox"
                  checked={vis[item.key]}
                  onChange={(e) =>
                    onChange({
                      ...draft,
                      sectionVisibility: {
                        ...vis,
                        [item.key]: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 accent-[#D4AF37]"
                />
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function AboutEditor({
  draft,
  onChange,
  onPickImage,
}: {
  draft: LiveSiteContent;
  onChange: (next: LiveSiteContent) => void;
  onPickImage: (
    title: string,
    category: MediaCategory,
    onSelect: (url: string) => void
  ) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="border border-white/10 bg-[#151515] p-6 space-y-5 lg:col-span-7">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            About Me Narrative
          </h2>
          <button
            type="button"
            disabled={draft.aboutParagraphs.length >= 10}
            onClick={() =>
              onChange({
                ...draft,
                aboutParagraphs: [...draft.aboutParagraphs, ''],
              })
            }
            className="inline-flex min-h-[36px] items-center gap-1.5 border border-[#D4AF37]/50 bg-[#080808] px-3 py-1.5 text-xs font-semibold text-[#F2D675] uppercase hover:bg-[#D4AF37] hover:text-[#080808] disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Paragraph</span>
          </button>
        </div>

        <AdminInput
          label="Section Heading"
          value={draft.aboutHeading}
          maxLength={140}
          onChange={(v) => onChange({ ...draft, aboutHeading: v })}
        />

        <div className="space-y-4">
          {draft.aboutParagraphs.map((para, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Paragraph {idx + 1}
                </span>
                {draft.aboutParagraphs.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...draft,
                        aboutParagraphs: draft.aboutParagraphs.filter(
                          (_, i) => i !== idx
                        ),
                      })
                    }
                    className="text-xs text-[#8C8C86] hover:text-rose-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                maxLength={1200}
                value={para}
                onChange={(e) => {
                  const next = [...draft.aboutParagraphs];
                  next[idx] = e.target.value;
                  onChange({ ...draft, aboutParagraphs: next });
                }}
                className="w-full resize-y border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-6 lg:col-span-5">
        <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            About Section Image
          </h2>
          <ImageSlotEditor
            label="Executive Workspace Photo"
            url={draft.aboutWorkspaceUrl}
            onChangeUrl={(url) => onChange({ ...draft, aboutWorkspaceUrl: url })}
            onOpenPicker={() =>
              onPickImage('Select About Section Image', 'about', (url) =>
                onChange({ ...draft, aboutWorkspaceUrl: url })
              )
            }
          />
        </section>

        <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
              Professional Experience
            </h2>
            <button
              type="button"
              disabled={draft.aboutExperience.length >= 10}
              onClick={() =>
                onChange({
                  ...draft,
                  aboutExperience: [
                    ...draft.aboutExperience,
                    { role: '', organization: '', period: '', summary: '' },
                  ],
                })
              }
              className="inline-flex min-h-[34px] items-center gap-1 border border-[#D4AF37]/50 bg-[#080808] px-3 py-1 text-xs font-semibold text-[#F2D675] uppercase hover:bg-[#D4AF37] hover:text-[#080808]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-4">
            {draft.aboutExperience.map((exp, idx) => (
              <div
                key={idx}
                className="space-y-3 border border-white/10 bg-[#0C0C0C] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#D4AF37] uppercase">
                    Role {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...draft,
                        aboutExperience: draft.aboutExperience.filter(
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
                  label="Role Title"
                  value={exp.role}
                  maxLength={100}
                  onChange={(v) => {
                    const next = [...draft.aboutExperience];
                    next[idx] = { ...exp, role: v };
                    onChange({ ...draft, aboutExperience: next });
                  }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <AdminInput
                    label="Organization"
                    value={exp.organization}
                    maxLength={100}
                    onChange={(v) => {
                      const next = [...draft.aboutExperience];
                      next[idx] = { ...exp, organization: v };
                      onChange({ ...draft, aboutExperience: next });
                    }}
                  />
                  <AdminInput
                    label="Period"
                    value={exp.period}
                    maxLength={50}
                    onChange={(v) => {
                      const next = [...draft.aboutExperience];
                      next[idx] = { ...exp, period: v };
                      onChange({ ...draft, aboutExperience: next });
                    }}
                  />
                </div>
                <AdminTextarea
                  label="Summary"
                  value={exp.summary}
                  maxLength={300}
                  rows={2}
                  onChange={(v) => {
                    const next = [...draft.aboutExperience];
                    next[idx] = { ...exp, summary: v };
                    onChange({ ...draft, aboutExperience: next });
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function BusinessEditor({
  draft,
  onChange,
  onPickImage,
}: {
  draft: LiveSiteContent;
  onChange: (next: LiveSiteContent) => void;
  onPickImage: (
    title: string,
    category: MediaCategory,
    onSelect: (url: string) => void
  ) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="border border-white/10 bg-[#151515] p-6 space-y-4 lg:col-span-6">
        <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
          Company Information
        </h2>
        <AdminInput
          label="Section Heading"
          value={draft.businessHeading}
          maxLength={140}
          onChange={(v) => onChange({ ...draft, businessHeading: v })}
        />
        <AdminInput
          label="Company Name"
          value={draft.businessName}
          maxLength={140}
          onChange={(v) => onChange({ ...draft, businessName: v })}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput
            label="Country"
            value={draft.businessCountry}
            maxLength={120}
            onChange={(v) => onChange({ ...draft, businessCountry: v })}
          />
          <AdminInput
            label="State / Registration"
            value={draft.businessState}
            maxLength={120}
            onChange={(v) =>
              onChange({
                ...draft,
                businessState: v,
                businessRegistration: v,
              })
            }
          />
        </div>
        <AdminInput
          label="Industry"
          value={draft.businessIndustry}
          maxLength={120}
          onChange={(v) => onChange({ ...draft, businessIndustry: v })}
        />
        <AdminTextarea
          label="Company Description"
          value={draft.businessDescription}
          maxLength={600}
          rows={3}
          onChange={(v) => onChange({ ...draft, businessDescription: v })}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput
            label="Company Website URL"
            value={draft.businessWebsiteUrl}
            maxLength={300}
            onChange={(v) => onChange({ ...draft, businessWebsiteUrl: v })}
          />
          <AdminInput
            label="Business Contact Email"
            value={draft.publicEmail}
            maxLength={160}
            onChange={(v) => onChange({ ...draft, publicEmail: v })}
          />
        </div>
      </section>

      <div className="space-y-6 lg:col-span-6">
        <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            Business Visuals & Logo
          </h2>
          <ImageSlotEditor
            label="Business Showcase Photograph"
            url={draft.businessShowcaseUrl}
            onChangeUrl={(url) => onChange({ ...draft, businessShowcaseUrl: url })}
            onOpenPicker={() =>
              onPickImage('Select Business Showcase Photo', 'business', (url) =>
                onChange({ ...draft, businessShowcaseUrl: url })
              )
            }
          />
          <ImageSlotEditor
            label="Company Logo (Optional)"
            url={draft.businessLogoUrl}
            onChangeUrl={(url) => onChange({ ...draft, businessLogoUrl: url })}
            onClear={() => onChange({ ...draft, businessLogoUrl: '' })}
            onOpenPicker={() =>
              onPickImage('Select Business Logo', 'business', (url) =>
                onChange({ ...draft, businessLogoUrl: url })
              )
            }
          />
        </section>

        <section className="border border-white/10 bg-[#151515] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
              Business Services
            </h2>
            <button
              type="button"
              disabled={draft.businessServices.length >= 12}
              onClick={() =>
                onChange({
                  ...draft,
                  businessServices: [
                    ...draft.businessServices,
                    { title: '', description: '' },
                  ],
                })
              }
              className="inline-flex min-h-[34px] items-center gap-1 border border-[#D4AF37]/50 bg-[#080808] px-3 py-1 text-xs font-semibold text-[#F2D675] uppercase hover:bg-[#D4AF37] hover:text-[#080808]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="space-y-3">
            {draft.businessServices.map((svc, idx) => (
              <div
                key={idx}
                className="space-y-2.5 border border-white/10 bg-[#0C0C0C] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#D4AF37] uppercase">
                    Service {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...draft,
                        businessServices: draft.businessServices.filter(
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
                  label="Service Title"
                  value={svc.title}
                  maxLength={100}
                  onChange={(v) => {
                    const next = [...draft.businessServices];
                    next[idx] = { ...svc, title: v };
                    onChange({ ...draft, businessServices: next });
                  }}
                />
                <AdminTextarea
                  label="Service Description"
                  value={svc.description}
                  maxLength={300}
                  rows={2}
                  onChange={(v) => {
                    const next = [...draft.businessServices];
                    next[idx] = { ...svc, description: v };
                    onChange({ ...draft, businessServices: next });
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function JourneyStageControls({
  stage,
  idx,
  total,
  onMove,
  onUpdateLocal,
  onSave,
  onDelete,
  onPickImage,
}: {
  stage: JourneyStage;
  idx: number;
  total: number;
  onMove: (idx: number, dir: -1 | 1) => void;
  onUpdateLocal: (next: JourneyStage) => void;
  onSave: () => void;
  onDelete?: () => void;
  onPickImage: () => void;
}) {
  return (
    <div className="border border-white/10 bg-[#151515] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold text-[#D4AF37] tabular-nums">
            {stage.step}
          </span>
          <span className="text-xs text-[#8C8C86] uppercase">
            Order #{stage.order}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onMove(idx, -1)}
            aria-label="Move stage up"
            className="flex h-8 w-8 items-center justify-center border border-white/15 bg-[#080808] text-[#B8B8B3] hover:border-[#D4AF37] disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={idx === total - 1}
            onClick={() => onMove(idx, 1)}
            aria-label="Move stage down"
            className="flex h-8 w-8 items-center justify-center border border-white/15 bg-[#080808] text-[#B8B8B3] hover:border-[#D4AF37] disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <label className="ml-2 flex items-center gap-2 text-xs text-[#B8B8B3]">
            <input
              type="checkbox"
              checked={stage.isPublished ?? true}
              onChange={(e) =>
                onUpdateLocal({ ...stage, isPublished: e.target.checked })
              }
              className="accent-[#D4AF37]"
            />
            <span>Published</span>
          </label>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AdminInput
            label="Step Number"
            value={stage.step}
            maxLength={10}
            onChange={(v) => onUpdateLocal({ ...stage, step: v })}
          />
          <AdminInput
            label="Date / Milestone Label"
            value={stage.dateLabel}
            maxLength={60}
            placeholder="e.g. 2024 or Foundation"
            onChange={(v) => onUpdateLocal({ ...stage, dateLabel: v })}
          />
        </div>
        <AdminInput
          label="Title"
          value={stage.title}
          maxLength={100}
          onChange={(v) => onUpdateLocal({ ...stage, title: v })}
        />
        <AdminTextarea
          label="Description"
          value={stage.description}
          maxLength={500}
          rows={3}
          onChange={(v) => onUpdateLocal({ ...stage, description: v })}
        />
        <ImageSlotEditor
          label="Timeline Entry Image (Optional)"
          url={stage.imageUrl}
          onChangeUrl={(url) => onUpdateLocal({ ...stage, imageUrl: url })}
          onClear={() => onUpdateLocal({ ...stage, imageUrl: '' })}
          onOpenPicker={onPickImage}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex min-h-[40px] items-center gap-2 bg-[#D4AF37] px-5 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
        >
          Save Stage
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-[40px] items-center gap-1.5 border border-white/15 px-3.5 py-2 text-xs text-[#B8B8B3] hover:border-rose-500/50 hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function PrincipleCardEditor({
  item,
  onUpdateLocal,
  onSave,
  onDelete,
}: {
  item: PrincipleItem;
  onUpdateLocal: (next: PrincipleItem) => void;
  onSave: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="border border-white/10 bg-[#151515] p-6">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <span className="font-display text-xl font-semibold text-[#D4AF37] tabular-nums">
          {item.number}
        </span>
        <label className="flex items-center gap-2 text-xs text-[#B8B8B3]">
          <input
            type="checkbox"
            checked={item.isPublished ?? true}
            onChange={(e) =>
              onUpdateLocal({ ...item, isPublished: e.target.checked })
            }
            className="accent-[#D4AF37]"
          />
          <span>Published</span>
        </label>
      </div>
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AdminInput
            label="Number"
            value={item.number}
            maxLength={10}
            onChange={(v) => onUpdateLocal({ ...item, number: v })}
          />
          <AdminInput
            label="Order"
            value={String(item.order)}
            maxLength={4}
            onChange={(v) => onUpdateLocal({ ...item, order: Number(v) || 1 })}
          />
        </div>
        <AdminInput
          label="Title"
          value={item.title}
          maxLength={100}
          onChange={(v) => onUpdateLocal({ ...item, title: v })}
        />
        <AdminTextarea
          label="Summary"
          value={item.summary}
          maxLength={400}
          rows={3}
          onChange={(v) => onUpdateLocal({ ...item, summary: v })}
        />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex min-h-[40px] items-center gap-2 bg-[#D4AF37] px-5 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
        >
          Save Principle
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-[40px] items-center gap-1.5 border border-white/15 px-3.5 py-2 text-xs text-[#B8B8B3] hover:border-rose-500/50 hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
