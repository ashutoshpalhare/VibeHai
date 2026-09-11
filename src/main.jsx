import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PlayerProvider } from './context/PlayerContext'
import { PlaylistProvider } from './context/PlaylistContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlayerProvider>
  <PlaylistProvider>
    <App />
  </PlaylistProvider>
</PlayerProvider>
  </StrictMode>,
)