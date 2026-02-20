import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/** Extract the image URL from various RCS media/contentInfo shapes */
export function getMediaUrl(media: any): string | null {
  if (!media) return null;
  // media.contentInfo can be a string (URL) or object with fileUrl
  if (typeof media === 'string') return media;
  if (typeof media.contentInfo === 'string') return media.contentInfo;
  if (media.contentInfo?.fileUrl) return media.contentInfo.fileUrl;
  if (media.fileUrl) return media.fileUrl;
  if (media.thumbnailUrl) return media.thumbnailUrl;
  if (media.contentInfo?.thumbnailUrl) return media.contentInfo.thumbnailUrl;
  return null;
}

interface MediaImageProps {
  media: any;
  className?: string;
}

export default function MediaImage({ media, className = '' }: MediaImageProps) {
  const [error, setError] = useState(false);
  const url = getMediaUrl(media);

  if (!url || error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center text-gray-400 ${className}`}>
        <div className="flex flex-col items-center gap-1">
          <ImageOff size={20} />
          <span className="text-[10px]">{url ? 'Failed to load' : 'No URL'}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className={className}
      onError={() => setError(true)}
    />
  );
}
