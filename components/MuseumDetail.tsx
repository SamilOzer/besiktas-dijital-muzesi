"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Share2, X, ImageOff } from "lucide-react";

export function ArchiveImage({ src, title, fallback }: { src?: string; title: string; fallback: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="archive-picture"><span className="archive-year" aria-hidden="true">{fallback}</span>{src && !failed && (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={title} loading="lazy" onError={() => setFailed(true)} />
  )}</div>;
}

export default function MuseumDetail({ title, meta, location, body, images, tags = [], sharePath, action, onClose }: {
  title: string; meta: string[]; location?: string; body: string; images: string[]; tags?: string[];
  sharePath: string; action?: React.ReactNode; onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const opener = useRef(typeof document !== "undefined" ? document.activeElement as HTMLElement : null);
  const share = async () => {
    const url = window.location.origin + sharePath;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setStatus("Bağlantı kopyalandı."); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setStatus("Bağlantı kopyalanamadı. Tarayıcınızın paylaşım seçeneğini kullanabilirsiniz.");
    }
  };
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal>
    <Dialog.Overlay className="museum-dialog-overlay" />
    <Dialog.Content className="museum-dialog" aria-describedby={undefined} onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }}>
      <Dialog.Close className="dialog-close" aria-label="Kapat"><X size={21} /></Dialog.Close>
      <div className="dialog-layout">
        <div className="dialog-copy"><div className="dialog-meta">{meta.filter(Boolean).map(item => <span key={item}>{item}</span>)}</div>
          <Dialog.Title className="dialog-title">{title}</Dialog.Title>
          {location && <p className="dialog-location"><MapPin size={15} aria-hidden="true" />{location}</p>}
          <div className="dialog-body">{body}</div>
          {tags.length > 0 && <div className="dialog-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
          <div className="dialog-actions">{action}<button onClick={share}><Share2 size={15} aria-hidden="true" />Paylaş</button></div>
          <p role="status" className="share-status">{status}</p>
        </div>
        <div className="dialog-gallery">{images[index] && failedImage !== images[index] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[index]} alt={title + ", fotoğraf " + (index + 1)} onError={() => setFailedImage(images[index])} />
        ) : <div className="text-center text-[var(--muted)]"><ImageOff size={35} className="mx-auto mb-3" aria-hidden="true" /><p className="text-xs">Görsel bulunmuyor</p></div>}
          {images.length > 1 && <div className="gallery-controls"><button aria-label="Önceki fotoğraf" onClick={() => setIndex((index + images.length - 1) % images.length)}><ChevronLeft size={20} /></button><span aria-live="polite">{index + 1} / {images.length}</span><button aria-label="Sonraki fotoğraf" onClick={() => setIndex((index + 1) % images.length)}><ChevronRight size={20} /></button></div>}
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}
