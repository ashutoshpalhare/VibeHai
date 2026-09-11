import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import MusicPlayer from '../player/MusicPlayer'
function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--vh-black)] text-[var(--vh-text)]">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <TopBar />

          <main className="min-h-[calc(100vh-72px)] pb-[92px] md:pb-[92px]">
            {children}
          </main>
        </div>
      </div>

      <MusicPlayer />

      <MobileNav />
    </div>
  )
}

export default AppShell