import {
  Home,
  Compass,
  Search,
  Library,
  Heart,
  ListMusic,
  Headphones,
  Plus,
} from 'lucide-react'

const primaryNavigation = [
  {
    label: 'Home',
    icon: Home,
    active: true,
  },
  {
    label: 'Discover',
    icon: Compass,
  },
  {
    label: 'Search',
    icon: Search,
  },
  {
    label: 'Library',
    icon: Library,
  },
]

const musicNavigation = [
  {
    label: 'Liked Songs',
    icon: Heart,
  },
  {
    label: 'Playlists',
    icon: ListMusic,
  },
]

function NavItem({ icon: Icon, label, active = false }) {
  return (
    <button
      type="button"
      className={`
        group
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-left
        text-sm
        font-medium
        transition-all
        duration-200
        ${
          active
            ? 'bg-white/[0.08] text-white'
            : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
        }
      `}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        size={19}
        strokeWidth={active ? 2.2 : 1.8}
        className={`
          shrink-0
          transition-colors
          duration-200
          ${
            active
              ? 'text-violet-400'
              : 'text-zinc-500 group-hover:text-zinc-300'
          }
        `}
      />

      <span>{label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
      )}
    </button>
  )
}

function Sidebar() {
  return (
    <aside className="hidden h-screen w-[250px] shrink-0 flex-col border-r border-white/[0.06] bg-[var(--vh-near-black)] lg:flex">
      {/* Brand */}
      <div className="flex h-[76px] items-center px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl vh-gradient shadow-lg shadow-violet-500/10">
            <Headphones size={19} strokeWidth={2.2} />
          </div>

          <div>
            <div className="font-display text-xl font-bold tracking-tight">
              Vibe<span className="vh-gradient-text">Hai</span>
            </div>

            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
              Music for every mood
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Discover
          </p>

          <nav className="space-y-1">
            {primaryNavigation.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={item.active}
              />
            ))}
          </nav>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Your Music
            </p>

            <button
              type="button"
              className="text-zinc-600 transition-colors hover:text-white"
              aria-label="Create playlist"
            >
              <Plus size={15} />
            </button>
          </div>

          <nav className="space-y-1">
            {musicNavigation.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
        </div>

        {/* Playlist placeholder */}
        <div className="mt-8 border-t border-white/[0.05] pt-5">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Playlists
          </p>

          <div className="space-y-1 px-3">
            {['Late Night Drive', 'Focus Flow', 'Weekend Energy'].map(
              (playlist) => (
                <button
                  key={playlist}
                  type="button"
                  className="block w-full truncate rounded-lg px-2 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
                >
                  {playlist}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Sidebar footer */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-xs font-medium text-zinc-300">
            Your vibe. Your music.
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
            Discover something worth listening to.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar