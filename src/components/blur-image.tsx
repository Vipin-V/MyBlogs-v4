import { useEffect, useRef, useState } from "react";
import { imagePreview } from "@/lib/loading-utils";

export function BlurImage({ src }: { src: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const preview = imagePreview(src);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px", threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={frame} className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
    {visible && preview && !previewFailed && !loaded && <img
      src={preview} alt="" aria-hidden decoding="async" onError={() => setPreviewFailed(true)}
      className="absolute inset-0 h-full w-full scale-110 object-cover object-center blur-md"
    />}
    {visible && !failed && <img
      src={src} alt="" width={750} height={422} decoding="async"
      ref={el => { if (el?.complete && el.naturalWidth) setLoaded(true); }}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      className={`relative h-full w-full object-cover object-center transition-opacity duration-500 motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`}
    />}
    {failed && (!preview || previewFailed) && <span aria-hidden className="absolute inset-0 flex items-center justify-center font-pixel text-2xl text-muted-foreground">V</span>}
  </div>;
}