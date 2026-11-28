import { useRef, useState, type ChangeEvent } from 'react';
import { Check, Upload, X } from 'lucide-react';
import type { MediaCategory, MediaItemRecord } from '../../data/siteConfig';
import { optimizeImageForMediaLibrary } from '../../lib/imageOptimizer';
import {
  StorageUploadError,
  uploadImageToStorage,
} from '../../lib/storageMedia';

interface MediaPickerModalProps {
  title: string;
  currentUrl: string;
  defaultCategory: MediaCategory;
  mediaItems: MediaItemRecord[];
  onSelect: (url: string) => void;
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
  }) => Promise<string | void>;
  onClose: () => void;
}

export function MediaPickerModal({
  title,
  currentUrl,
  defaultCategory,
  mediaItems,
  onSelect,
  onUploadMedia,
  onClose,
}: MediaPickerModalProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [fallbackFile, setFallbackFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleQuickUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setError('');
    setFallbackFile(null);
    setUploading(true);
    setProgress(5);

    try {
      const uploaded = await uploadImageToStorage(file, {
        maxDimension: defaultCategory === 'seo' ? 1200 : 1800,
        onProgress: (pct) => setProgress(pct),
      });
      await onUploadMedia({
        title: uploaded.suggestedTitle,
        description: '',
        category: defaultCategory,
        url: uploaded.url,
        storagePath: uploaded.storagePath,
        mimeType: uploaded.mimeType,
        width: uploaded.width,
        height: uploaded.height,
        sizeBytes: uploaded.sizeBytes,
      });
      onSelect(uploaded.url);
      onClose();
    } catch (err) {
      if (err instanceof StorageUploadError) {
        setError(err.message);
        setFallbackFile(file);
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed.');
      }
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  async function handleCompactFallbackUpload() {
    if (!fallbackFile) return;
    const file = fallbackFile;
    setFallbackFile(null);
    setError('');
    setUploading(true);
    setProgress(10);

    try {
      const optimized = await optimizeImageForMediaLibrary(file, {
        maxDimension: defaultCategory === 'seo' ? 1024 : 1200,
        maxOutputChars: 220_000,
        onProgress: (pct) => setProgress(pct),
      });
      await onUploadMedia({
        title: optimized.suggestedTitle,
        description: '',
        category: defaultCategory,
        url: optimized.dataUrl,
        storagePath: '',
        mimeType: optimized.mimeType,
        width: optimized.width,
        height: optimized.height,
        sizeBytes: optimized.sizeBytes,
      });
      onSelect(optimized.dataUrl);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col border border-[#D4AF37]/35 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
              Media Library
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#F5F5F4]">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleQuickUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-[40px] items-center gap-2 bg-[#D4AF37] px-4 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675] disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {uploading
                  ? progress !== null
                    ? `Uploading ${progress}%`
                    : 'Uploading...'
                  : 'Upload New'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close media picker"
              className="flex h-10 w-10 items-center justify-center border border-white/15 bg-[#080808] text-[#B8B8B3] hover:text-[#F5F5F4]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="border-b border-rose-500/30 bg-rose-950/30 px-6 py-3 text-xs text-rose-200">
            <p>{error}</p>
            {fallbackFile && (
              <button
                type="button"
                disabled={uploading}
                onClick={() => void handleCompactFallbackUpload()}
                className="mt-2 inline-flex items-center bg-[#D4AF37] px-3 py-1.5 text-[11px] font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
              >
                Use Compact Database Fallback Instead
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {mediaItems.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#8C8C86]">
              No images in the Media Library yet. Click &ldquo;Upload New&rdquo; above to add a photograph.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {mediaItems.map((item) => {
                const selected = item.url === currentUrl;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.url);
                      onClose();
                    }}
                    className={`group overflow-hidden border text-left transition-colors ${
                      selected
                        ? 'border-[#F2D675] bg-[#080808]'
                        : 'border-white/10 bg-[#0C0C0C] hover:border-[#D4AF37]/60'
                    }`}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#080808]">
                      <img
                        src={item.url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      {selected && (
                        <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-[#D4AF37] text-[#080808]">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-xs font-semibold text-[#F5F5F4]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#8C8C86] uppercase">
                        {item.category}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
