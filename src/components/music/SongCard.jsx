import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Plus, Heart, MoreHorizontal } from 'lucide-react'
import { usePlayer } from '../../hooks/usePlayer'
import AddToPlaylistModal from './AddToPlaylistModal'

function SongCard({ song, index = 0 }) {
  const { playTrack } = usePlayer()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: index * 0.04,
        }}
        className="group min-w-[170px] max-w-[190px] shrink-0"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] p-2 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--vh-border-hover)] hover:bg-[var(--vh-dark-gray)] hover:shadow-[var(--vh-shadow-md)]">
          {/* Cover Image Container */}
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <img
              src={song.cover}
              alt={`${song.title} cover`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Play Button Overlay */}
            <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => playTrack(song)}
                aria-label={`Play ${song.title}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                <Play size={18} fill="currentColor" />
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-1 pt-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-[var(--vh-text)]">
                  {song.title}
                </h3>

                <p className="mt-1 truncate text-sm text-[var(--vh-muted)]">
                  {song.artist}
                </p>
              </div>

              {/* Add to Playlist Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                aria-label={`Add ${song.title} to playlist`}
                className="text-[var(--vh-muted)] transition-colors hover:text-white"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Playlist Modal */}
      {isModalOpen && (
        <AddToPlaylistModal
          song={song}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

export default SongCard