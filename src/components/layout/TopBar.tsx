import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconKeyboard,
  IconLibrary,
  IconSearch,
  IconSettings,
  IconSparkle,
  IconTrash,
} from "@/components/ui/Icons";
import { Menu, useMenu, type MenuItem } from "@/components/ui/Menu";
import { IconButton } from "@/components/ui";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/utils/cn";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M5.4 19.5c1.5-3.4 3.9-5 6.6-5s5.1 1.6 6.6 5" />
    </svg>
  );
}

function ProfileMenu() {
  const menu = useMenu();
  const theme = useTheme();
  const library = useLibrary();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items: MenuItem[] = [
    { label: "Your profile", icon: <UserIcon />, onSelect: () => (window.location.hash = "#/profile") },
    { label: "Settings", icon: <IconSettings className="h-4 w-4" />, onSelect: () => (window.location.hash = "#/settings"), dividerAfter: true },
    {
      label: theme.theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      icon: <IconSparkle className="h-4 w-4" />,
      onSelect: () => {
        theme.toggleTheme();
        toast(`Switched to ${theme.theme === "dark" ? "light" : "dark"} theme`);
      },
      dividerAfter: true,
    },
    { label: "About & credits", icon: <IconLibrary className="h-4 w-4" />, onSelect: () => (window.location.hash = "#/about") },
    { label: "Clear all data", icon: <IconTrash className="h-4 w-4" />, danger: true, onSelect: () => setConfirmOpen(true) },
  ];

  return (
    <>
      <button
        onClick={(e) => menu.openFromEvent(e, items, "Account")}
        aria-label="Profile menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full brand-gradient text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110 active:scale-95"
      >
        <UserIcon />
      </button>
      <Menu state={menu.state} onClose={menu.close} />
      {confirmOpen && (
        <div className="fixed inset-0 z-[85] grid place-items-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-ink-850 p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
              <IconTrash className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-white">Clear all VibeHai data?</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
              Playlists, liked songs, saved albums, followed artists and history will be permanently
              removed from this browser.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10">
                Cancel
              </button>
              <button
                onClick={() => {
                  library.resetAll();
                  setConfirmOpen(false);
                  toast("All data cleared", { tone: "success" });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500/90 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-500"
              >
                <IconHeart filled className="h-3.5 w-3.5" /> Clear everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function TopBar({ scrollEl }: { scrollEl?: HTMLDivElement | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const player = usePlayer();
  const isSearch = location.pathname.startsWith("/search");
  const value = isSearch ? params.get("q") ?? "" : "";
  const scrolled = useRef(false);

  // expose the search input for the "/" shortcut
  useEffect(() => {
    (window as any).__vibehaiSearchInput = inputRef.current;
    return () => {
      delete (window as any).__vibehaiSearchInput;
    };
  }, []);

  useEffect(() => {
    const el = scrollEl;
    if (!el) return;
    const onScroll = () => {
      scrolled.current = el.scrollTop > 12;
      el.dataset.scrolled = scrolled.current ? "true" : "false";
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollEl]);

  const setSearch = (q: string) => {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q);
    else next.delete("q");
    setParams(next, { replace: true });
  };

  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-2 bg-gradient-to-b from-ink-950 via-ink-950/95 to-transparent px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="hidden items-center gap-1 lg:flex">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <IconChevronLeft className="h-5 w-5" />
        </IconButton>
        <IconButton label="Forward" onClick={() => navigate(1)}>
          <IconChevronRight className="h-5 w-5" />
        </IconButton>
      </div>

      <div
        className={cn(
          "relative flex-1 items-center lg:max-w-[420px]",
          isSearch ? "flex" : "hidden lg:flex",
        )}
      >
        <IconSearch className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/40" />
        <input
          ref={inputRef}
          data-vibehai-search
          type="search"
          value={value}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => !isSearch && navigate("/search")}
          placeholder="Songs, artists, albums, playlists…"
          className="w-full rounded-full border border-white/10 bg-white/[0.055] py-2.5 pl-10 pr-4 text-[13.5px] text-white outline-none transition placeholder:text-white/35 focus:border-brand-400/50 focus:bg-white/[0.09]"
        />
      </div>

      {!isSearch && (
        <button
          onClick={() => navigate("/search")}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.055] text-white/60 transition hover:text-white lg:hidden"
          aria-label="Search"
        >
          <IconSearch className="h-[18px] w-[18px]" />
        </button>
      )}

      <div className="ml-auto flex items-center gap-1">
        <IconButton
          label="Queue"
          active={player.queueOpen}
          onClick={() => player.setQueueOpen(!player.queueOpen)}
          className="lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
            <path d="M4 7h11M4 12h11M4 17h7" />
            <circle cx="17.5" cy="17" r="3" />
          </svg>
        </IconButton>
        <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/45 xl:inline-flex">
          <IconKeyboard className="h-3.5 w-3.5" />
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-sans">Space</kbd>
          to play
        </span>
        <ProfileMenu />
      </div>
    </div>
  );
}
