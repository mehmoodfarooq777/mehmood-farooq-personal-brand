import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import {
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  clampString,
  type MediaCategory,
  type MediaItemRecord,
} from '../../data/siteConfig';
import {
  formatBytes,
  optimizeImageForMediaLibrary,
} from '../../lib/imageOptimizer';
import {
  StorageUploadError,
  uploadImageToStorage,
} from '../../lib/storageMedia';

export type ImageAssignTarget =
  | 'heroPortraitUrl'
  | 'aboutWorkspaceUrl'
  | 'businessLogoUrl'
  | 'businessShowcaseUrl'
  | 'seoOgImageUrl'
  | 'seoFaviconUrl';

interface MediaLibraryTabProps {
  mediaItems: MediaItemRecord[];
  saving: boolean;
  storageStatus?: 'checking' | 'ready' | 'unprovisioned';
  onUploadMedia: (input: {
    title: string;
    description: string;
    category: MediaCategory;
    url: string;
    storagePath?: string;
    mimeType: string;
    width: number;
    height: number;
    sizeBytes: number;
  }) => Promise<void>;
  onUpdateMedia: (
    item: MediaItemRecord,
    updates: Partial<MediaItemRecord>
  ) => Promise<void>;
  onDeleteMedia: (id: string) => Promise<void>;
  onAssignToSection: (target: ImageAssignTarget, url: string) => void;
}

const CATEGORIES: { id: 'all' | MediaCategory; label: string }[] = [
  { id: 'all', label: 'All Media' },
  { id: 'profile', label: 'Profile' },
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'journey', label: 'Journey' },
  { id: 'business', label: 'Business' },
  { id: 'blog', label: 'Blog' },
  { id: 'seo', label: 'SEO & Icons' },
  { id: 'general', label: 'General' },
];

export function MediaLibraryTab({
  mediaItems,
  saving,
  storageStatus = 'checking',
  onUploadMedia,
  onUpdateMedia,
  onDeleteMedia,
  onAssignToSection,
}: MediaLibraryTabProps) {
  const [filterCat, setFilterCat] = useState<'all' | MediaCategory>('all');
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('general');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [fallbackPendingFiles, setFallbackPendingFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [externalUrl, setExternalUrl] = useState('');
  const [externalTitle, setExternalTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFiles(files: FileList | File[]) {
    setUploadError('');
    setFallbackPendingFiles([]);
    const list = Array.from(files);
    if (list.length === 0) return;

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setUploadStatus(`Uploading ${file.name} (${i + 1} of ${list.length}) to Firebase Storage...`);
      setUploadProgress(5);

      try {
        const uploaded = await uploadImageToStorage(file, {
          maxDimension: uploadCategory === 'seo' ? 1200 : 1800,
          onProgress: (pct) => setUploadProgress(pct),
        });

        await onUploadMedia({
          title: uploaded.suggestedTitle,
          description: '',
          category: uploadCategory,
          url: uploaded.url,
          storagePath: uploaded.storagePath,
          mimeType: uploaded.mimeType,
          width: uploaded.width,
          height: uploaded.height,
          sizeBytes: uploaded.sizeBytes,
        });
        setUploadProgress(100);
      } catch (err) {
        if (err instanceof StorageUploadError) {
          setUploadError(err.message);
          setFallbackPendingFiles(list.slice(i));
          setUploadProgress(null);
          setUploadStatus('');
          return;
        }
        setUploadError(
          err instanceof Error ? err.message : `Failed uploading ${file.name}`
        );
      }
    }

    window.setTimeout(() => {
      setUploadProgress(null);
      setUploadStatus('');
    }, 900);
  }

  async function processCompactFallback() {
    if (fallbackPendingFiles.length === 0) return;
    const filesToProcess = [...fallbackPendingFiles];
    setUploadError('');
    setFallbackPendingFiles([]);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      setUploadStatus(`Compressing ${file.name} (${i + 1} of ${filesToProcess.length}) for compact storage...`);
      setUploadProgress(10);

      try {
        const result = await optimizeImageForMediaLibrary(file, {
          maxDimension: uploadCategory === 'seo' ? 1024 : 1200,
          maxOutputChars: 220_000,
          onProgress: (pct) => setUploadProgress(pct),
        });

        await onUploadMedia({
          title: result.suggestedTitle,
          description: '',
          category: uploadCategory,
          url: result.dataUrl,
          storagePath: '',
          mimeType: result.mimeType,
          width: result.width,
          height: result.height,
          sizeBytes: result.sizeBytes,
        });
        setUploadProgress(100);
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : `Failed uploading ${file.name}`
        );
      }
    }

    window.setTimeout(() => {
      setUploadProgress(null);
      setUploadStatus('');
    }, 900);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      void processFiles(e.target.files);
      e.target.value = '';
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      void processFiles(e.dataTransfer.files);
    }
  }

  async function handleExternalImport(e: FormEvent) {
    e.preventDefault();
    setUploadError('');
    const cleanUrl = externalUrl.trim();
    const cleanTitle = clampString(externalTitle || 'External Photograph', 120);
    if (!cleanUrl || (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/'))) {
      setUploadError('Please enter a valid https:// or site asset URL.');
      return;
    }

    try {
      await onUploadMedia({
        title: cleanTitle,
        description: '',
        category: uploadCategory,
        url: cleanUrl,
        storagePath: '',
        mimeType: 'image/jpeg',
        width: 0,
        height: 0,
        sizeBytes: cleanUrl.length,
      });

      setExternalUrl('');
      setExternalTitle('');
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Unable to add external image URL.'
      );
    }
  }

  const visibleItems =
    filterCat === 'all'
      ? mediaItems
      : mediaItems.filter((item) => item.category === filterCat);

  return (
    <div className="space-y-8">
      {storageStatus === 'unprovisioned' && (
        <div className="border border-amber-500/40 bg-amber-950/25 px-5 py-4 text-xs leading-relaxed text-amber-200">
          <p className="font-semibold tracking-wider text-[#F2D675] uppercase">
            Firebase Storage Setup Notice
          </p>
          <p className="mt-1">
            Your Firebase Storage bucket is not activated yet in Firebase Console (Build → Storage → Get Started). Full-resolution CDN uploads require activating Storage and applying <code className="text-[#F2D675]">storage.rules</code>; otherwise, you can choose the explicit compact database fallback (&le; 220 KB) when prompted.
          </p>
        </div>
      )}

      {/* Upload Dropzone & External URL Import */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col justify-between border p-6 transition-colors lg:col-span-7 ${
            isDragging
              ? 'border-[#F2D675] bg-[#1E1E1E]'
              : 'border-[#D4AF37]/30 bg-[#151515]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
                Upload Photographs
              </h2>
              <p className="mt-1 text-xs text-[#9E9E98]">
                JPEG, PNG, WebP, or SVG up to 10 MB. Uploaded to Firebase Storage for fast live delivery across all devices.
              </p>
            </div>

            <select
              aria-label="Target category for uploads"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
              className="border border-white/15 bg-[#080808] px-3 py-2 text-xs font-semibold tracking-wider text-[#F2D675] uppercase focus:border-[#D4AF37] focus:outline-none"
            >
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center border border-dashed border-[#D4AF37]/35 bg-[#080808] px-6 py-8 text-center">
            <Upload className="h-7 w-7 text-[#D4AF37]" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-[#F5F5F4]">
              Drag and drop photographs here, or select files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={saving || uploadProgress !== null}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex min-h-[42px] items-center gap-2 bg-[#D4AF37] px-6 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase transition-colors hover:bg-[#F2D675] disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Select Photographs</span>
            </button>
          </div>

          {uploadProgress !== null && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-[#F2D675]">
                <span>{uploadStatus}</span>
                <span className="tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-[#080808]">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full bg-[#D4AF37] transition-all duration-150"
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div role="alert" className="mt-4 border border-rose-500/40 bg-rose-950/30 p-3.5 text-xs text-rose-200">
              <p className="font-medium">{uploadError}</p>
              {fallbackPendingFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void processCompactFallback()}
                    className="inline-flex min-h-[34px] items-center bg-[#D4AF37] px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
                  >
                    Use Compact Database Fallback Instead ({fallbackPendingFiles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFallbackPendingFiles([]);
                      setUploadError('');
                    }}
                    className="inline-flex min-h-[34px] items-center border border-white/20 px-3 py-1.5 text-[11px] text-[#D4D4D0] hover:text-[#F5F5F4]"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add by External URL */}
        <form
          onSubmit={handleExternalImport}
          className="flex flex-col justify-between border border-white/10 bg-[#151515] p-6 lg:col-span-5"
        >
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
              Add Image by URL
            </h2>
            <p className="mt-1 text-xs text-[#9E9E98]">
              Register a hosted image link in your media library for reuse across sections.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Title
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={externalTitle}
                  onChange={(e) => setExternalTitle(e.target.value)}
                  placeholder="Executive Portrait"
                  className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                  Image URL
                </label>
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://... or /src/assets/..."
                  className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 text-sm text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex min-h-[42px] w-full items-center justify-center gap-2 border border-[#D4AF37]/50 bg-[#080808] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#F2D675] uppercase transition-colors hover:border-[#F2D675] hover:bg-[#1E1E1E]"
          >
            <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add to Library</span>
          </button>
        </form>
      </div>

      {/* Category Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCat(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                filterCat === cat.id
                  ? 'bg-[#D4AF37] text-[#080808]'
                  : 'border border-white/10 bg-[#151515] text-[#B8B8B3] hover:text-[#F2D675]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[#8C8C86] tabular-nums">
          {visibleItems.length} item{visibleItems.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Media Grid */}
      {visibleItems.length === 0 ? (
        <div className="border border-white/10 bg-[#151515] p-12 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-[#8C8C86]" aria-hidden="true" />
          <p className="mt-3 text-sm text-[#B8B8B3]">
            No photographs in this category yet. Upload images above or click Sync Missing Default Media.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <MediaAssetCard
              key={item.id}
              item={item}
              saving={saving}
              onUpdate={onUpdateMedia}
              onDelete={onDeleteMedia}
              onAssign={onAssignToSection}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaAssetCard({
  item,
  saving,
  onUpdate,
  onDelete,
  onAssign,
}: {
  item: MediaItemRecord;
  saving: boolean;
  onUpdate: (
    item: MediaItemRecord,
    updates: Partial<MediaItemRecord>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAssign: (target: ImageAssignTarget, url: string) => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState<MediaCategory>(item.category);
  const [assignTarget, setAssignTarget] =
    useState<ImageAssignTarget>('heroPortraitUrl');
  const [assignedFeedback, setAssignedFeedback] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [pendingReplaceFile, setPendingReplaceFile] = useState<File | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  async function handleReplaceFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCardError('');
    setPendingReplaceFile(null);
    setReplacing(true);

    try {
      const uploaded = await uploadImageToStorage(file, {
        maxDimension: item.category === 'seo' ? 1200 : 1800,
      });
      await onUpdate(item, {
        url: uploaded.url,
        storagePath: uploaded.storagePath,
        mimeType: uploaded.mimeType,
        width: uploaded.width,
        height: uploaded.height,
        sizeBytes: uploaded.sizeBytes,
      });
    } catch (err) {
      if (err instanceof StorageUploadError) {
        setCardError(err.message);
        setPendingReplaceFile(file);
      } else {
        setCardError(
          err instanceof Error ? err.message : 'Unable to replace photograph.'
        );
      }
    } finally {
      setReplacing(false);
    }
  }

  async function handleReplaceCompactFallback() {
    if (!pendingReplaceFile) return;
    const file = pendingReplaceFile;
    setPendingReplaceFile(null);
    setCardError('');
    setReplacing(true);

    try {
      const optimized = await optimizeImageForMediaLibrary(file, {
        maxDimension: item.category === 'seo' ? 1024 : 1200,
        maxOutputChars: 220_000,
      });
      await onUpdate(item, {
        url: optimized.dataUrl,
        storagePath: '',
        mimeType: optimized.mimeType,
        width: optimized.width,
        height: optimized.height,
        sizeBytes: optimized.sizeBytes,
      });
    } catch (err) {
      setCardError(
        err instanceof Error ? err.message : 'Unable to replace photograph.'
      );
    } finally {
      setReplacing(false);
    }
  }

  return (
    <article className="flex flex-col justify-between border border-white/10 bg-[#151515]">
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-[#080808]">
        <img
          src={item.url}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
        {item.storagePath && (
          <span className="absolute top-2 left-2 border border-[#D4AF37]/40 bg-[#080808]/90 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#F2D675] uppercase">
            Cloud CDN
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[#8C8C86] tabular-nums">
            <span>
              {item.width > 0 ? `${item.width}×${item.height}` : 'External URL'}
            </span>
            <span>{formatBytes(item.sizeBytes)}</span>
          </div>

          <input
            type="text"
            maxLength={120}
            aria-label="Image title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-white/15 bg-[#080808] px-3 py-2 text-sm font-medium text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
          />

          <input
            type="text"
            maxLength={400}
            aria-label="Image description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description or caption"
            className="w-full border border-white/15 bg-[#080808] px-3 py-2 text-xs text-[#B8B8B3] focus:border-[#D4AF37] focus:outline-none"
          />

          <select
            aria-label="Image category"
            value={category}
            onChange={(e) => setCategory(e.target.value as MediaCategory)}
            className="w-full border border-white/15 bg-[#080808] px-3 py-2 text-xs font-medium text-[#D4D4D0] uppercase focus:border-[#D4AF37] focus:outline-none"
          >
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <option key={cat.id} value={cat.id}>
                Category: {cat.label}
              </option>
            ))}
          </select>

          {/* Assign to section */}
          <div className="border-t border-white/10 pt-3">
            <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-[#9E9E98] uppercase">
              Use In Website Section
            </label>
            <div className="flex gap-2">
              <select
                aria-label="Website section target"
                value={assignTarget}
                onChange={(e) =>
                  setAssignTarget(e.target.value as ImageAssignTarget)
                }
                className="min-w-0 flex-1 border border-white/15 bg-[#080808] px-2.5 py-2 text-xs text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="heroPortraitUrl">Profile / Hero Portrait</option>
                <option value="aboutWorkspaceUrl">About Section Image</option>
                <option value="businessShowcaseUrl">Business Showcase</option>
                <option value="businessLogoUrl">Business Logo</option>
                <option value="seoOgImageUrl">SEO Social Share Image</option>
                <option value="seoFaviconUrl">Browser Favicon</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  onAssign(assignTarget, item.url);
                  setAssignedFeedback(true);
                  window.setTimeout(() => setAssignedFeedback(false), 2200);
                }}
                className="inline-flex shrink-0 items-center gap-1 border border-[#D4AF37]/50 bg-[#080808] px-3 py-2 text-xs font-semibold text-[#F2D675] uppercase transition-colors hover:bg-[#D4AF37] hover:text-[#080808]"
              >
                {assignedFeedback ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>In Draft</span>
                  </>
                ) : (
                  <span>Apply</span>
                )}
              </button>
            </div>
          </div>

          {cardError && (
            <div role="alert" className="border border-rose-500/40 bg-rose-950/30 p-2.5 text-[11px] text-rose-200">
              <p>{cardError}</p>
              {pendingReplaceFile && (
                <button
                  type="button"
                  disabled={saving || replacing}
                  onClick={() => void handleReplaceCompactFallback()}
                  className="mt-2 inline-flex items-center bg-[#D4AF37] px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
                >
                  Use Compact Fallback Instead
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            disabled={saving || replacing}
            onClick={() => {
              setCardError('');
              void onUpdate(item, {
                title: clampString(title || item.title, 120),
                description: clampString(description, 400),
                category,
              }).catch((err) => {
                setCardError(
                  err instanceof Error ? err.message : 'Unable to save details.'
                );
              });
            }}
            className="inline-flex min-h-[36px] items-center gap-1.5 bg-[#D4AF37] px-3.5 py-1.5 text-xs font-semibold text-[#080808] uppercase hover:bg-[#F2D675] disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Save</span>
          </button>

          <div className="flex items-center gap-2">
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleReplaceFile}
              className="hidden"
            />
            <button
              type="button"
              disabled={saving || replacing}
              onClick={() => replaceInputRef.current?.click()}
              title="Replace photograph"
              className="inline-flex min-h-[36px] items-center gap-1 border border-white/15 px-3 py-1.5 text-xs text-[#D4D4D0] hover:border-[#D4AF37]/60 hover:text-[#F2D675] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${replacing ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{replacing ? 'Replacing...' : 'Replace'}</span>
            </button>
            <button
              type="button"
              disabled={saving || replacing}
              onClick={() => void onDelete(item.id)}
              title="Delete photograph"
              className="inline-flex min-h-[36px] items-center gap-1 border border-white/15 px-3 py-1.5 text-xs text-[#B8B8B3] hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
