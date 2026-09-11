import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search as SearchIcon,
  Loader2,
  Music2,
  X,
} from 'lucide-react'

import SongCard from '../components/music/SongCard'
import { searchSongs } from '../services/jiosaavn'
import { normalizeSong } from '../utils/normalizeSong'

function Search() {
  const [query, setQuery] = useState('')
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setSongs([])
      setSearched(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setSearched(true)

        const results = await searchSongs(query)

        setSongs(
          results
            .map(normalizeSong)
            .filter((song) => song.id && song.title)
        )
      } catch (error) {
        console.error('Search:', error)
        setSongs([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const clearSearch = () => {
    setQuery('')
    setSongs([])
    setSearched(false)
  }

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="mb-2 text-sm font-medium text-[var(--vh-violet)]">
            DISCOVER MUSIC
          </p>

          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Search your vibe.
          </h1>

          <p className="mt-2 text-[var(--vh-muted)]">
            Find songs, artists and albums from JioSaavn.
          </p>
        </motion.div>

        {/* Search Box */}
        <div className="relative mt-8 max-w-3xl">
          <SearchIcon
            size={21}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search songs, artists, albums..."
            className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-14 pr-14 text-white outline-none transition-all placeholder:text-zinc-500 focus:border-violet-500/50 focus:bg-white/[0.07]"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results */}
        <section className="mt-10">
          {loading && (
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Loader2 size={18} className="animate-spin" />
              Searching JioSaavn...
            </div>
          )}

          {!loading && !searched && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-16 text-center">
              <Music2
                size={42}
                className="mx-auto text-zinc-600"
              />

              <h2 className="mt-5 text-lg font-semibold text-white">
                What do you want to listen to?
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Search for your favorite song or artist.
              </p>
            </div>
          )}

          {!loading && searched && songs.length === 0 && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-16 text-center">
              <Music2
                size={42}
                className="mx-auto text-zinc-600"
              />

              <h2 className="mt-5 text-lg font-semibold text-white">
                Nothing matched that vibe.
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Try another song, artist or keyword.
              </p>
            </div>
          )}

          {!loading && songs.length > 0 && (
            <>
              <div className="mb-5">
                <h2 className="font-display text-xl font-semibold text-white">
                  Search Results
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {songs.length} tracks found
                </p>
              </div>

              <div className="flex flex-wrap gap-5">
                {songs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default Search