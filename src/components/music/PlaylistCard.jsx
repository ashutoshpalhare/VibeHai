import { motion } from 'framer-motion'
import { ListMusic, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { usePlayer } from '../../hooks/usePlayer'

function PlaylistCard({ playlist, index = 0 }) {
  const navigate = useNavigate()
  const { playTrack } = usePlayer()

  const songs = playlist.songs || []
  const hasSongs = songs.length > 0

  const handleOpenPlaylist = () => {
    navigate(`/playlist/${playlist.id}`)
  }

  const handlePlayPlaylist = (event) => {
    event.stopPropagation()

    if (!hasSongs) {
      navigate(`/playlist/${playlist.id}`)
      return
    }

    playTrack(songs[0])
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      className="group min-w-[190px] max-w-[220px] shrink-0 cursor-pointer"
      onClick={handleOpenPlaylist}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] p-2 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--vh-border-hover)] hover:bg-[var(--vh-dark-gray)] hover:shadow-[var(--vh-shadow-md)]">

        {/* Cover */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--vh-dark-gray)]">
          {playlist.cover ? (
            <img
              src={playlist.cover}
              alt={`${playlist.name} playlist`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ListMusic
                size={52}
                className="text-[var(--vh-subtle)]"
              />
            </div>
          )}

          {/* Gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

          {/* Play Button */}
          <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handlePlayPlaylist}
              aria-label={
                hasSongs
                  ? `Play ${playlist.name}`
                  : `Open ${playlist.name}`
              }
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105 disabled:cursor-not-allowed"
            >
              <Play size={18} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="px-1 pt-3">
          <h3 className="truncate font-medium text-[var(--vh-text)]">
            {playlist.name || 'Untitled Playlist'}
          </h3>

          <p className="mt-1 truncate text-sm text-[var(--vh-muted)]">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>
    </motion.article>
  )
}

export default PlaylistCard