import { useEffect, type RefObject } from "react";
import EmblaCarousel from "embla-carousel";

/** Enhance the server-rendered galleries without changing article HTML. */
export function usePostGalleries(ref: RefObject<HTMLDivElement | null>, content: string) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cleanups = Array.from(root.querySelectorAll<HTMLElement>(".post-gallery")).map((gallery) => {
      const track = gallery.querySelector<HTMLElement>(".post-gallery-track");
      if (!track) return () => {};
      const api = EmblaCarousel(gallery, { container: track, loop: false, watchDrag: true });
      const images = Array.from(track.querySelectorAll<HTMLImageElement>("img"));
      const previous = gallery.querySelector<HTMLButtonElement>('[data-dir="-1"]');
      const next = gallery.querySelector<HTMLButtonElement>('[data-dir="1"]');
      const counter = gallery.querySelector<HTMLElement>(".post-gallery-count");
      gallery.setAttribute("role", "region");
      gallery.setAttribute("aria-roledescription", "carousel");
      gallery.setAttribute("aria-label", "Article photos");
      counter?.setAttribute("aria-live", "polite");
      const parallax = () => {
        const progress = api.scrollProgress();
        const snaps = api.scrollSnapList();
        images.forEach((image, index) => {
          const distance = ((snaps[index] ?? 0) - progress) * Math.max(1, images.length - 1);
          image.style.transform = motion.matches ? "" : `translateX(${Math.max(-1, Math.min(1, distance)) * -18}%)`;
        });
      };
      const select = () => {
        if (previous) previous.disabled = !api.canScrollPrev();
        if (next) next.disabled = !api.canScrollNext();
        if (counter) counter.textContent = `${api.selectedScrollSnap() + 1} / ${images.length}`;
      };
      const goPrevious = () => api.scrollPrev(motion.matches);
      const goNext = () => api.scrollNext(motion.matches);
      previous?.addEventListener("click", goPrevious);
      next?.addEventListener("click", goNext);
      api.on("scroll", parallax).on("select", select).on("reInit", parallax).on("reInit", select);
      motion.addEventListener("change", parallax);
      select();
      parallax();
      return () => {
        previous?.removeEventListener("click", goPrevious);
        next?.removeEventListener("click", goNext);
        motion.removeEventListener("change", parallax);
        api.destroy();
        images.forEach((image) => { image.style.transform = ""; });
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [ref, content]);
}