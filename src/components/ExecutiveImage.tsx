import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';

interface ExecutiveImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  fallbackTitle?: string;
}

export function ExecutiveImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
  width,
  height,
  fallbackTitle,
}: ExecutiveImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#151515] via-[#0F0F0F] to-[#080808] p-8 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center border border-[#D4AF37]/30 bg-[#080808] text-[#D4AF37]">
          <Briefcase className="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
        </div>
        <p className="font-display text-xl font-semibold tracking-wide text-[#F5F5F4]">
          {fallbackTitle || alt}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#151515] ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
