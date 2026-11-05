import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Moon, Search, Sun, UserRound, X } from "lucide-react";
import { PixelCat, PixelVJ } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground data-[status=active]:text-foreground";

export function SiteNav() {
  const [isDark, setIsDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.href]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        document.getElementById(searchOpen ? "search-toggle" : "menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [searchOpen]);

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
      <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <Link to="/" search={{ q: "", tag: "All", page: 1 }} className="w-fit font-pixel text-xl font-bold text-foreground" aria-label="Vipin V blog">
          <PixelVJ />
        </Link>
        <div className="flex shrink-0 items-center gap-1">
        <nav aria-label="Main navigation" className="mr-3 hidden items-center gap-5 sm:flex">
          <Link to="/" search={{ q: "", tag: "All", page: 1 }} activeOptions={{ exact: true, includeSearch: false }} className={navLinkClass}>
            Blog
          </Link>
          <Link to="/about" className={navLinkClass}>
            About
          </Link>
        </nav>
          <Button id="search-toggle" variant="ghost" size="icon" aria-label={searchOpen ? "Close search" : "Search posts"} title="Search posts" aria-expanded={searchOpen} aria-controls="nav-search" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} className="text-muted-foreground">
            {searchOpen ? <X /> : <Search />}
          </Button>
          <Button
            variant="ghost" size="icon"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
            className="text-muted-foreground"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button id="menu-toggle" variant="ghost" size="icon" className="text-muted-foreground sm:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}>
            <span aria-hidden className="relative size-5">
              <span className={`absolute left-0 top-1.5 h-px w-5 bg-current transition-transform duration-200 motion-reduce:transition-none ${menuOpen ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`absolute right-0 top-3.5 h-px bg-current transition-all duration-200 motion-reduce:transition-none ${menuOpen ? "w-5 -translate-y-1 -rotate-45" : "w-3.5"}`} />
            </span>
          </Button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-menu grid grid-cols-2 border-t border-border py-4 sm:hidden">
          <Button asChild variant="ghost" className="group h-24 min-w-0 flex-col items-start justify-between rounded-none px-3 py-3 data-[status=active]:bg-accent/50"><Link to="/" search={{ q: "", tag: "All", page: 1 }} activeOptions={{ exact: true, includeSearch: false }}><span className="flex w-full items-center justify-between text-muted-foreground"><BookOpen /><ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span><span className="font-pixel text-xl">Blog</span></Link></Button>
          <Button asChild variant="ghost" className="group h-24 min-w-0 flex-col items-start justify-between rounded-none border-l border-border px-4 py-3 data-[status=active]:bg-accent/50"><Link to="/about"><span className="flex w-full items-center justify-between text-muted-foreground"><UserRound /><ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span><span className="font-pixel text-xl">About</span></Link></Button>
        </nav>
      )}
      {searchOpen && (
        <form id="nav-search" role="search" className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-border py-3" onSubmit={(event) => {
          event.preventDefault();
          const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
          void navigate({ to: "/", search: { q, tag: "All", page: 1 } });
          setSearchOpen(false);
        }}>
          <input autoFocus type="search" name="q" aria-label="Search posts" placeholder="Search posts…" defaultValue={typeof location.search.q === "string" ? location.search.q : ""} className="h-10 min-w-0 rounded-md border border-input bg-background px-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring" />
          <Button type="submit" variant="outline" size="icon" aria-label="Submit search" title="Search"><Search /></Button>
        </form>
      )}
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
