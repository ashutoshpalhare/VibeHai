import {
  ChevronLeft,
  ChevronRight,
  Bell,
  UserRound,
} from 'lucide-react'

function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/[0.05] bg-[rgba(5,5,5,0.82)] px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="vh-icon-button"
          aria-label="Go back"
        >
          <ChevronLeft size={19} />
        </button>

        <button
          type="button"
          className="vh-icon-button"
          aria-label="Go forward"
        >
          <ChevronRight size={19} />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="vh-icon-button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="ml-1 flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] py-1.5 pl-1.5 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/80 to-cyan-400/70">
            <UserRound size={14} />
          </div>

          <span className="hidden text-xs font-medium text-zinc-300 sm:block">
            Guest
          </span>
        </div>
      </div>
    </header>
  )
}

export default TopBar