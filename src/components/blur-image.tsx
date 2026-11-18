import { useEffect, useRef, useState } from "react";
import { imagePreview } from "@/lib/loading-utils";

// priority: the likely LCP image renders in server HTML at full opacity, with no observer or blur preview.
export function BlurImage({ src, priority = false }: { src: string; priority?: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(priority);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const preview = imagePreview(src);

  useEffect(() => {
    const element = frame.current;
    if (!element || priority) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px", threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [priority]);

  return <div ref={frame} className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
    {!priority && visible && preview && !previewFailed && !loaded && <img
      src={preview} alt="" aria-hidden decoding="async" onError={() => setPreviewFailed(true)}
      className="absolute inset-0 h-full w-full scale-110 object-cover object-center blur-md"
    />}
    {visible && !failed && <img
      src={src} alt="" width={750} height={422}
      decoding={priority ? "sync" : "async"} loading={priority ? "eager" : undefined} fetchPriority={priority ? "high" : undefined}
      ref={el => { if (el?.complete && el.naturalWidth) setLoaded(true); }}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      className={`relative h-full w-full object-cover object-center transition-opacity duration-500 motion-reduce:transition-none ${priority || loaded ? "opacity-100" : "opacity-0"}`}
    />}
    {failed && (!preview || previewFailed) && <span aria-hidden className="absolute inset-0 flex items-center justify-center font-pixel text-2xl text-muted-foreground">V</span>}
  </div>;
}