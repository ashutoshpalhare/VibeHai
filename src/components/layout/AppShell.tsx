import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MobileHeader, MobileNav, Sidebar } from "@/components/layout/Nav";
import TopBar from "@/components/layout/TopBar";
import FooterCredit from "@/components/layout/FooterCredit";
import NowPlaying from "@/components/player/NowPlaying";
import PlayerBar from "@/components/player/PlayerBar";
import QueuePanel, { QueueToggleFab } from "@/components/player/QueuePanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePlayer } from "@/context/PlayerContext";
import { useLibrary } from "@/context/LibraryContext";
import { useToast } from "@/context/ToastContext";

export default function AppShell() {
  const location = useLocation();
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const player = usePlayer();
  const library = useLibrary();
  const { toast } = useToast();
  const [, setOnline] = useState(() => navigator.onLine);

  /* reset scroll on navigation */
  useEffect(() => {
    scrollEl?.scrollTo({ top: 0 });
  }, [location.pathname, scrollEl]);

  /* online / offline toasts */
  useEffect(() => {
    const on = () => {
      setOnline(true);
      toast("Back online", { tone: "success" });
    };
    const off = () => {
      setOnline(false);
      toast("You're offline — playback may not work");
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [toast]);

  /* keyboard shortcuts */
  useKeyboardShortcuts((e) => {
    const key = e.key;
    const k = key.toLowerCase();

    if (key === " ") {
      e.preventDefault();
      player.toggle();
      return;
    }
    if (key === "Escape") {
      if (player.nowPlayingOpen) player.setNowPlayingOpen(false);
      else if (player.queueOpen) player.setQueueOpen(false);
      return;
    }
    if (e.shiftKey && key === "ArrowRight") {
      e.preventDefault();
      player.next();
      return;
    }
    if (e.shiftKey && key === "ArrowLeft") {
      e.preventDefault();
      player.prev();
      return;
    }
    if (key === "ArrowRight") {
      e.preventDefault();
      player.seekBy(5);
      return;
    }
    if (key === "ArrowLeft") {
      e.preventDefault();
      player.seekBy(-5);
      return;
    }
    if (key === "ArrowUp") {
      e.preventDefault();
      player.setVolume(Math.min(1, player.volume + 0.05));
      return;
    }
    if (key === "ArrowDown") {
      e.preventDefault();
      player.setVolume(Math.max(0, player.volume - 0.05));
      return;
    }
    if (k === "m") player.toggleMute();
    else if (k === "s") {
      player.toggleShuffle();
      toast(player.shuffle ? "Shuffle off" : "Shuffle on");
    } else if (k === "r") {
      const order = { off: "all", all: "one", one: "off" } as const;
      const nextMode = order[player.repeat];
      if (nextMode !== player.repeat) player.cycleRepeat();
      toast(
        nextMode === "off" ? "Repeat off" : nextMode === "all" ? "Repeat queue" : "Repeat one",
      );
    } else if (k === "q") player.setQueueOpen(!player.queueOpen);
    else if (k === "f") player.setNowPlayingOpen(!player.nowPlayingOpen);
    else if (k === "l") {
      if (player.current) {
        const now = library.toggleLike(player.current);
        toast(now ? "Added to Liked Songs" : "Removed from Liked Songs", { tone: "success" });
      }
    } else if (k === "/" || (e.ctrlKey && k === "k")) {
      e.preventDefault();
      const input = document.querySelector("[data-vibehai-search]") as HTMLInputElement | null;
      if (input && input.offsetParent) input.focus();
      else window.location.hash = "#/search";
    }
  }, [player, library, toast]);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-ink-950 text-white">
      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="lg:hidden">
            <MobileHeader />
          </div>
          <main
            ref={(el) => setScrollEl(el as HTMLDivElement | null)}
            className="scroll-area relative min-h-0 flex-1 overflow-y-auto px-4 pb-28 sm:px-6 lg:px-8"
          >
            <TopBar scrollEl={scrollEl} />
            <AnimatePresence mode="wait">
              <div key={location.pathname} className="animate-[rise_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
                <Outlet />
              </div>
            </AnimatePresence>
            <FooterCredit className="mt-10 border-t border-white/[0.06] pt-5" />
          </main>
        </div>

        <QueueToggleFab />
        <AnimatePresence>{player.queueOpen && <QueuePanel />}</AnimatePresence>
      </div>

      <PlayerBar />
      <MobileNav />
      <AnimatePresence>{player.nowPlayingOpen && <NowPlaying />}</AnimatePresence>
    </div>
  );
}
