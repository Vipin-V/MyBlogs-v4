import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { PixelCat } from "@/components/site-chrome";

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground data-[status=active]:text-foreground";

export function SiteNav() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable — theme just won't persist
    }
    setIsDark(next);
  };

  return (
    <header className="mx-auto w-full max-w-3xl border-b border-border border-x px-4">
      <div className="flex h-14 items-center justify-between">
        <Link to="/" className="font-pixel text-xl font-bold tracking-tight text-foreground">
          VJ
        </Link>
        <nav className="flex items-center gap-5">
          <Link to="/" activeOptions={{ exact: true }} className={navLinkClass}>
            Blog
          </Link>
          <Link to="/about" className={navLinkClass}>
            About
          </Link>
          <span aria-hidden className="h-4 w-px bg-border" />
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-auto w-full max-w-3xl border-t border-border border-x">
      <div className="relative flex items-center justify-between px-4 py-8">
        <div className="font-mono text-sm">
          <p>&copy; 2026 Vipin V</p>
          <p className="text-muted-foreground">Built with love, LLMs and Coffee</p>
        </div>
        <PixelCat />
      </div>
      <div aria-hidden className="dot-grid h-20 border-t border-border" />
    </footer>
  );
}
