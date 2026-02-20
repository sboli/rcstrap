import { useState } from 'react';
import { ImageOff, FileText, Film } from 'lucide-react';
import { getMediaUrl } from './MediaImage';

interface Props {
  media: any;
}

export default function MediaPreview({ media }: Props) {
  const url = getMediaUrl(media);
  if (!url) {
    return (
      <div className="bg-gray-200 rounded-lg p-4 flex items-center justify-center text-gray-400">
        <ImageOff size={20} />
      </div>
    );
  }

  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';

  if (['mp4', 'webm', 'ogg'].includes(ext)) {
    return <VideoPreview url={url} />;
  }

  if (ext === 'pdf') {
    return <PdfPreview url={url} />;
  }

  return <ImagePreviewBlock url={url} />;
}

function ImagePreviewBlock({ url }: { url: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="bg-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 gap-1">
        <ImageOff size={20} />
        <span className="text-[10px]">Failed to load</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="rounded-lg max-h-48 w-full object-cover"
      onError={() => setError(true)}
    />
  );
}

function VideoPreview({ url }: { url: string }) {
  return (
    <div className="rounded-lg overflow-hidden bg-black">
      <video
        src={url}
        controls
        preload="metadata"
        className="max-h-48 w-full"
      >
        <a href={url} className="text-blue-400 text-xs">Download video</a>
      </video>
    </div>
  );
}

function PdfPreview({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition-colors"
    >
      <FileText size={24} className="text-red-500 shrink-0" />
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{url.split('/').pop()}</div>
        <div className="text-[10px] text-gray-400">PDF Document</div>
      </div>
    </a>
  );
}
