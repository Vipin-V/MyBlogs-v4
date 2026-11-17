import { useEffect, type RefObject } from "react";

/** One delegated listener copies the code next to any clicked copy button. */
export function useCodeCopy(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const timers = new Set<number>();
    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".code-copy");
      const code = btn?.closest(".code-block")?.querySelector("code")?.textContent;
      if (!btn || code == null) return;
      try { await navigator.clipboard.writeText(code); } catch { return; }
      const label = btn.querySelector("span");
      btn.setAttribute("data-copied", "true");
      if (label) label.textContent = "Copied";
      const t = window.setTimeout(() => { btn.removeAttribute("data-copied"); if (label) label.textContent = "Copy"; timers.delete(t); }, 1500);
      timers.add(t);
    };
    root.addEventListener("click", onClick);
    return () => { root.removeEventListener("click", onClick); timers.forEach(clearTimeout); };
  }, [ref]);
}
