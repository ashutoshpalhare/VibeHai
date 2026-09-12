import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PlayerProvider } from './context/PlayerContext'
import { PlaylistProvider } from './context/PlaylistContext'
import { LibraryProvider } from './context/LibraryContext'

createRoot(document.getElementById('root')).render(
  <PlayerProvider>
  <PlaylistProvider>
    <LibraryProvider>
      <App />
    </LibraryProvider>
  </PlaylistProvider>
</PlayerProvider>,
)