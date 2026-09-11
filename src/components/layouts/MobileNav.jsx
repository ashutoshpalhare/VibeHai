import {
  Home,
  Compass,
  Search,
  Library,
  Heart,
} from 'lucide-react'

const navigation = [
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
  {
    label: 'Liked',
    icon: Heart,
  },
]

function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.07] bg-[rgba(8,8,9,0.94)] px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        {navigation.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={`
              relative
              flex
              min-h-[56px]
              flex-col
              items-center
              justify-center
              gap-1
              rounded-xl
              text-[10px]
              font-medium
              transition-colors
              ${
                active
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }
            `}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.2 : 1.8}
            />

            <span>{label}</span>

            {active && (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-violet-400" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav