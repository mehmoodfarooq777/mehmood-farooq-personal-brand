/**
 * Client-side image validation & optimization utility.
 * Compresses uploaded photographs into WebP/JPEG within Firestore's safe document budget
 * without requiring paid cloud storage upgrades.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  suggestedTitle: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB upload limit
const MAX_OUTPUT_CHARS = 650_000; // Safe headroom under Firestore 1 MB document limit

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return `Unsupported file type "${file.type || 'unknown'}". Please upload JPEG, PNG, WebP, or SVG images.`;
  }
  if (file.size > MAX_INPUT_BYTES) {
    return `File "${file.name}" exceeds the 10 MB upload limit.`;
  }
  return null;
}

function readFileAsDataUrl(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const pct = Math.round((event.loaded / event.total) * 35);
        onProgress(pct);
      }
    };
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid or corrupted image file.'));
    img.src = src;
  });
}

export async function optimizeImageForMediaLibrary(
  file: File,
  options?: {
    maxDimension?: number;
    onProgress?: (pct: number) => void;
  }
): Promise<OptimizedImageResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const onProgress = options?.onProgress;
  onProgress?.(5);

  const rawDataUrl = await readFileAsDataUrl(file, onProgress);
  onProgress?.(45);

  const suggestedTitle = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .slice(0, 100) || 'Uploaded Photograph';

  // Keep small SVG assets directly if within limit
  if (file.type === 'image/svg+xml') {
    if (rawDataUrl.length > MAX_OUTPUT_CHARS) {
      throw new Error('SVG file is too large after encoding.');
    }
    onProgress?.(90);
    return {
      dataUrl: rawDataUrl,
      mimeType: 'image/svg+xml',
      width: 512,
      height: 512,
      sizeBytes: rawDataUrl.length,
      suggestedTitle,
    };
  }

  const img = await loadImageElement(rawDataUrl);
  onProgress?.(60);

  let maxDim = options?.maxDimension ?? 1440;
  let quality = 0.84;
  let outputDataUrl = '';
  let targetWidth = img.naturalWidth || 1200;
  let targetHeight = img.naturalHeight || 900;

  // Iteratively optimize to guarantee payload fits cleanly inside Firestore limits
  for (let attempt = 0; attempt < 5; attempt++) {
    const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    targetWidth = Math.max(1, Math.round(img.naturalWidth * ratio));
    targetHeight = Math.max(1, Math.round(img.naturalHeight * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser canvas is unavailable for image optimization.');
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const webpUrl = canvas.toDataURL('image/webp', quality);
    outputDataUrl = webpUrl.startsWith('data:image/webp')
      ? webpUrl
      : canvas.toDataURL('image/jpeg', quality);

    if (outputDataUrl.length <= MAX_OUTPUT_CHARS) {
      break;
    }

    maxDim = Math.round(maxDim * 0.78);
    quality = Math.max(0.55, quality - 0.1);
  }

  if (outputDataUrl.length > MAX_OUTPUT_CHARS) {
    throw new Error(
      'Unable to compress photograph under the free-tier storage limit. Try a smaller image.'
    );
  }

  onProgress?.(90);

  const detectedMime = outputDataUrl.startsWith('data:image/webp')
    ? 'image/webp'
    : 'image/jpeg';

  return {
    dataUrl: outputDataUrl,
    mimeType: detectedMime,
    width: targetWidth,
    height: targetHeight,
    sizeBytes: outputDataUrl.length,
    suggestedTitle,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
