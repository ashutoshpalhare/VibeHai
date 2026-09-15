import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  MoreHorizontal,
  Play,
  Plus,
} from 'lucide-react'

import { usePlayer } from '../../hooks/usePlayer'
import { useLibrary } from '../../hooks/useLibrary'

import AddToPlaylistModal from './AddToPlaylistModal'

function SongCard({ song, index = 0 }) {
  const { playTrack } = usePlayer()

  const { toggleLike, isLiked } = useLibrary()

  // Add to Playlist modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check current like status
  const liked = isLiked(song.id)

  // ---------------------------------------------------------
  // Like / Unlike song
  // ---------------------------------------------------------
  const handleLike = (event) => {
    // Prevent card / other button actions
    event.stopPropagation()

    toggleLike(song)
  }

  // ---------------------------------------------------------
  // Play song
  // ---------------------------------------------------------
  const handlePlay = () => {
    playTrack(song)
  }

  // ---------------------------------------------------------
  // Open Add to Playlist modal
  // ---------------------------------------------------------
  const handleAddToPlaylist = (event) => {
    event.stopPropagation()

    setIsModalOpen(true)
  }

  return (
    <>
      <motion.article
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          delay: index * 0.04,
        }}
        className="group min-w-[170px] max-w-[190px] shrink-0"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] p-2 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--vh-border-hover)] hover:bg-[var(--vh-dark-gray)] hover:shadow-[var(--vh-shadow-md)]">

          {/* =================================================
              COVER IMAGE
          ================================================= */}
          <div className="relative aspect-square overflow-hidden rounded-xl">

            <img
              src={song.cover}
              alt={`${song.title} cover`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* =================================================
                LIKE BUTTON
            ================================================= */}
            <button
              type="button"
              onClick={handleLike}
              aria-label={
                liked
                  ? `Unlike ${song.title}`
                  : `Like ${song.title}`
              }
              aria-pressed={liked}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/70 group-hover:opacity-100"
            >
              <Heart
                size={17}
                fill={
                  liked
                    ? 'currentColor'
                    : 'none'
                }
                className={
                  liked
                    ? 'text-[var(--vh-magenta)]'
                    : 'text-white'
                }
              />
            </button>

            {/* =================================================
                PLAY BUTTON
            ================================================= */}
            <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">

              <button
                type="button"
                onClick={handlePlay}
                aria-label={`Play ${song.title}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                <Play
                  size={18}
                  fill="currentColor"
                />
              </button>
            </div>
          </div>

          {/* =================================================
              SONG DETAILS
          ================================================= */}
          <div className="px-1 pt-3">

            <div className="flex items-start justify-between gap-2">

              {/* Song title + artist */}
              <div className="min-w-0 flex-1">

                <h3 className="truncate font-medium text-[var(--vh-text)]">
                  {song.title}
                </h3>

                <p className="mt-1 truncate text-sm text-[var(--vh-muted)]">
                  {song.artist}
                </p>

              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}
              <div className="flex shrink-0 items-center gap-1">

                {/* Like button - visible on smaller screens */}
                <button
                  type="button"
                  onClick={handleLike}
                  aria-label={
                    liked
                      ? `Unlike ${song.title}`
                      : `Like ${song.title}`
                  }
                  aria-pressed={liked}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--vh-muted)] transition-colors hover:text-white sm:hidden"
                >
                  <Heart
                    size={16}
                    fill={
                      liked
                        ? 'currentColor'
                        : 'none'
                    }
                    className={
                      liked
                        ? 'text-[var(--vh-magenta)]'
                        : ''
                    }
                  />
                </button>

                {/* Add to playlist */}
                <button
                  type="button"
                  onClick={handleAddToPlaylist}
                  aria-label={`Add ${song.title} to playlist`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--vh-muted)] transition-colors hover:text-white"
                >
                  <Plus size={18} />
                </button>

                {/* More options */}
                <button
                  type="button"
                  aria-label={`More options for ${song.title}`}
                  className="hidden h-8 w-8 items-center justify-center rounded-full text-[var(--vh-muted)] transition-colors hover:text-white sm:flex"
                >
                  <MoreHorizontal size={18} />
                </button>

              </div>
            </div>
          </div>
        </div>
      </motion.article>

      {/* =====================================================
          ADD TO PLAYLIST MODAL
      ===================================================== */}
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