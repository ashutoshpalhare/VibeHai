import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layouts/AppShell'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import LikedSongs from './pages/LikedSongs'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/liked" element={<LikedSongs />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App