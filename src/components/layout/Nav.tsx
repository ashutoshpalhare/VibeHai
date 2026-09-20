import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import CreatePlaylistModal from "@/components/media/CreatePlaylistModal";
import FooterCredit from "@/components/layout/FooterCredit";
import { IconClose, IconHeart, IconHome, IconLibrary, IconNote, IconPlus, IconSearch, IconSettings, IconSparkle } from "@/components/ui/Icons";
import { IconButton } from "@/components/ui";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/utils/cn";

const NAV = [
  { to: "/", label: "Home", Icon: IconHome },
  { to: "/discover", label: "Discover", Icon: IconSparkle },
  { to: "/search", label: "Search", Icon: IconSearch },
  { to: "/library", label: "Your Library", Icon: IconLibrary },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { playlists, likedSongs, recentlyPlayed } = useLibrary();
  const player = usePlayer();
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col gap-2 p-2 lg:flex xl:w-[272px]">
      <div className="flex items-center gap-2.5 px-3 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl brand-gradient shadow-lg shadow-brand-600/30">
          <IconNote className="h-5 w-5 text-white" />
        </span>
        <span className="text-[19px] font-extrabold tracking-tight">
          Vibe<span className="brand-text">Hai</span>
        </span>
      </div>

      <nav className="space-y-0.5 rounded-2xl bg-ink-900/60 p-2">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition",
                isActive
                  ? "bg-white/[0.09] text-white"
                  : "text-white/55 hover:bg-white/[0.05] hover:text-white",
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="scroll-area flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-2xl bg-ink-900/60 p-2">
        <div className="flex items-center justify-between px-2 pb-1 pt-1.5">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/35">
            Your playlists
          </span>
          <IconButton label="Create playlist" onClick={() => setCreating(true)} className="h-7 w-7">
            <IconPlus className="h-4 w-4" />
          </IconButton>
        </div>

        <NavLink
          to="/liked"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl p-2 transition",
              isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
            )
          }
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-punch-500">
            <IconHeart filled className="h-[18px] w-[18px] text-white" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-white/90">
              Liked Songs
            </span>
            <span className="block text-[11px] text-white/40">
              {likedSongs.length} song{likedSongs.length === 1 ? "" : "s"}
            </span>
          </span>
        </NavLink>

        {recentlyPlayed.length > 0 && (
          <NavLink
            to="/recent"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl p-2 transition",
                isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
              )
            }
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.07] text-base">
              🕘
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-white/90">
                Recently played
              </span>
              <span className="block text-[11px] text-white/40">{recentlyPlayed.length} tracks</span>
            </span>
          </NavLink>
        )}

        {playlists.length === 0 ? (
          <button
            onClick={() => setCreating(true)}
            className="mx-1 mt-2 rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11.5px] leading-relaxed text-white/40 transition hover:border-white/25 hover:text-white/70"
          >
            No playlists yet.
            <br />
            <span className="font-semibold text-brand-300">Create your first one</span>
          </button>
        ) : (
          <div className="space-y-0.5">
            {playlists.map((p) => (
              <NavLink
                key={p.id}
                to={`/playlist/${p.id}`}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl p-2 transition",
                    isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
                  )
                }
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.06] text-white/40">
                  {p.songs[0]?.image || p.cover ? (
                    <img src={p.cover || p.songs[0].image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <IconNote className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[13px] font-medium",
                      player.queueSource?.id === p.id ? "text-brand-200" : "text-white/85",
                    )}
                  >
                    {p.name}
                  </span>
                  <span className="block truncate text-[11px] text-white/40">
                    {p.songs.length} song{p.songs.length === 1 ? "" : "s"}
                  </span>
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-ink-900/60 p-2">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition",
              isActive ? "bg-white/[0.09] text-white" : "text-white/50 hover:text-white",
            )
          }
        >
          <IconSettings className="h-[18px] w-[18px]" /> Settings
        </NavLink>
        <NavLink
          to="/shortcuts"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition",
              isActive ? "text-white" : "text-white/50 hover:text-white",
            )
          }
        >
          <IconSparkle className="h-[18px] w-[18px]" /> Keyboard shortcuts
        </NavLink>
        <NavLink
          to="/about"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition",
              isActive ? "bg-white/[0.09] text-white" : "text-white/50 hover:text-white",
            )
          }
        >
          <span className="grid h-[18px] w-[18px] place-items-center rounded-md brand-gradient text-[9px] font-extrabold text-white">
            AP
          </span>
          About & credits
        </NavLink>
        <FooterCredit compact className="px-3 pb-1.5 pt-2" />
      </div>

      <CreatePlaylistModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) => navigate(`/playlist/${id}`)}
      />
    </aside>
  );
}

const MOBILE_NAV = [
  { to: "/", label: "Home", Icon: IconHome },
  { to: "/discover", label: "Discover", Icon: IconSparkle },
  { to: "/search", label: "Search", Icon: IconSearch },
  { to: "/liked", label: "Liked", Icon: IconHeart },
  { to: "/library", label: "Library", Icon: IconLibrary },
];

export function MobileNav() {
  return (
    <nav className="glass z-40 flex shrink-0 items-stretch justify-around border-t border-white/[0.07] px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 lg:hidden">
      {MOBILE_NAV.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold transition",
              isActive ? "text-white" : "text-white/45",
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn("h-[19px] w-[19px]", isActive && "text-brand-300")} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileHeader() {
  const [searching, setSearching] = useState(false);
  return (
    <div className="flex items-center justify-between px-4 pb-1 pt-4 lg:hidden">
      <span className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg brand-gradient">
          <IconNote className="h-4 w-4 text-white" />
        </span>
        <span className="text-lg font-extrabold tracking-tight">
          Vibe<span className="brand-text">Hai</span>
        </span>
      </span>
      <button
        onClick={() => setSearching(true)}
        className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-white/70"
        aria-label="Search"
      >
        <IconSearch className="h-[18px] w-[18px]" />
      </button>
      {searching && (
        <div className="fixed inset-0 z-[75] bg-ink-950/95 p-4 backdrop-blur-xl" onClick={() => setSearching(false)}>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              placeholder="Songs, artists, albums…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearching(false);
                  window.location.hash = `#/search?q=${encodeURIComponent(e.currentTarget.value)}`;
                }
                if (e.key === "Escape") setSearching(false);
              }}
              className="flex-1 rounded-full border border-white/10 bg-ink-850 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-400/60"
            />
            <IconButton label="Close" onClick={() => setSearching(false)}>
              <IconClose className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
