import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { FIREBASE_STORAGE_BUCKET, storage } from './firebase';
import { validateImageFile } from './imageOptimizer';

export interface StorageMediaUploadResult {
  url: string;
  storagePath: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  suggestedTitle: string;
}

export class StorageUploadError extends Error {
  code: string;
  isBucketUnprovisioned: boolean;
  isPermissionDenied: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      isBucketUnprovisioned?: boolean;
      isPermissionDenied?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'StorageUploadError';
    this.code = options.code || 'storage/unknown';
    this.isBucketUnprovisioned = Boolean(options.isBucketUnprovisioned);
    this.isPermissionDenied = Boolean(options.isPermissionDenied);
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
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

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

async function prepareUploadBlob(
  file: File,
  maxDimension = 1800
): Promise<{
  blob: Blob;
  mimeType: string;
  ext: string;
  width: number;
  height: number;
  suggestedTitle: string;
}> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const suggestedTitle =
    file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim()
      .slice(0, 100) || 'Uploaded Photograph';

  if (file.type === 'image/svg+xml') {
    return {
      blob: file,
      mimeType: 'image/svg+xml',
      ext: 'svg',
      width: 512,
      height: 512,
      suggestedTitle,
    };
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const img = await loadImageElement(rawDataUrl);

  const ratio = Math.min(
    1,
    maxDimension / Math.max(img.naturalWidth || 1, img.naturalHeight || 1)
  );
  const targetWidth = Math.max(1, Math.round((img.naturalWidth || 1200) * ratio));
  const targetHeight = Math.max(1, Math.round((img.naturalHeight || 900) * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser canvas is unavailable for image preparation.');
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const webpBlob = await canvasToBlob(canvas, 'image/webp', 0.86);
  if (webpBlob && webpBlob.type === 'image/webp') {
    return {
      blob: webpBlob,
      mimeType: 'image/webp',
      ext: 'webp',
      width: targetWidth,
      height: targetHeight,
      suggestedTitle,
    };
  }

  const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.88);
  if (jpegBlob) {
    return {
      blob: jpegBlob,
      mimeType: 'image/jpeg',
      ext: 'jpg',
      width: targetWidth,
      height: targetHeight,
      suggestedTitle,
    };
  }

  return {
    blob: file,
    mimeType: file.type || 'image/jpeg',
    ext: file.name.split('.').pop()?.toLowerCase() || 'jpg',
    width: targetWidth,
    height: targetHeight,
    suggestedTitle,
  };
}

function sanitizeFileSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'photo'
  );
}

/**
 * Checks quickly whether Firebase Storage bucket is provisioned before waiting on SDK retries.
 */
export async function probeStorageBucketReachable(): Promise<boolean> {
  if (!FIREBASE_STORAGE_BUCKET) return false;
  try {
    const res = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
        FIREBASE_STORAGE_BUCKET
      )}/o/healthcheck_probe.txt`,
      { method: 'GET' }
    );
    // An active bucket returns 403 (denied) or 200 or 404 with "No such object".
    // An unprovisioned bucket returns 404 with generic message "Not Found."
    if (res.status === 404) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      if (body.error?.message === 'Not Found.') {
        return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

export async function uploadImageToStorage(
  file: File,
  options?: {
    maxDimension?: number;
    mediaId?: string;
    onProgress?: (pct: number) => void;
  }
): Promise<StorageMediaUploadResult> {
  const onProgress = options?.onProgress;
  onProgress?.(5);

  const prepared = await prepareUploadBlob(file, options?.maxDimension ?? 1800);
  onProgress?.(20);

  const bucketActive = await probeStorageBucketReachable();
  if (!bucketActive) {
    throw new StorageUploadError(
      `Firebase Storage is not activated yet for bucket "${FIREBASE_STORAGE_BUCKET}" (HTTP 404 Not Found). Enable Storage in Firebase Console -> Build -> Storage and deploy storage.rules.`,
      {
        code: 'storage/bucket-not-found',
        isBucketUnprovisioned: true,
      }
    );
  }

  const assetId =
    options?.mediaId ||
    `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const cleanName = sanitizeFileSlug(prepared.suggestedTitle);
  const storagePath = `uploads/media/${assetId}_${cleanName}.${prepared.ext}`;
  const storageRef = ref(storage, storagePath);

  const task = uploadBytesResumable(storageRef, prepared.blob, {
    contentType: prepared.mimeType,
    cacheControl: 'public, max-age=31536000',
  });

  return new Promise<StorageMediaUploadResult>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const uploadPct = Math.round(
            20 + (snapshot.bytesTransferred / snapshot.totalBytes) * 75
          );
          onProgress?.(Math.min(95, uploadPct));
        }
      },
      (err) => {
        const code = err?.code || 'storage/unknown';
        const message = err?.message || 'Firebase Storage upload failed.';
        const isPermissionDenied = code === 'storage/unauthorized';
        const isBucketUnprovisioned =
          code === 'storage/bucket-not-found' ||
          code === 'storage/project-not-found' ||
          code === 'storage/retry-limit-exceeded' ||
          message.includes('404');

        let friendly = message;
        if (isPermissionDenied) {
          friendly =
            'Firebase Storage blocked this upload (storage/unauthorized). Deploy storage.rules in Firebase Console -> Storage -> Rules.';
        } else if (isBucketUnprovisioned) {
          friendly = `Firebase Storage bucket "${FIREBASE_STORAGE_BUCKET}" is not enabled yet. Activate Storage in Firebase Console -> Build -> Storage.`;
        }

        reject(
          new StorageUploadError(friendly, {
            code,
            isBucketUnprovisioned,
            isPermissionDenied,
          })
        );
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(task.snapshot.ref);
          onProgress?.(100);
          resolve({
            url: downloadUrl,
            storagePath,
            mimeType: prepared.mimeType,
            width: prepared.width,
            height: prepared.height,
            sizeBytes: prepared.blob.size,
            suggestedTitle: prepared.suggestedTitle,
          });
        } catch (err) {
          reject(
            new StorageUploadError(
              err instanceof Error
                ? err.message
                : 'Uploaded file but failed to obtain public download URL.'
            )
          );
        }
      }
    );
  });
}

export async function deleteStorageAsset(
  storagePath: string | undefined
): Promise<void> {
  const clean = (storagePath || '').trim();
  if (!clean) return;
  try {
    await deleteObject(ref(storage, clean));
  } catch (err) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code: unknown }).code)
        : '';
    // Safe to ignore if object was already deleted
    if (code !== 'storage/object-not-found') {
      console.warn('Could not remove Storage object:', clean, err);
    }
  }
}
