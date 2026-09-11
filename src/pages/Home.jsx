import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Headphones,
  Play,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import SongCard from '../components/music/SongCard'
import PlaylistCard from '../components/music/PlaylistCard'
import { searchSongs } from '../services/jiosaavn'
import { normalizeSong } from '../utils/normalizeSong'

const madeForYou = [
  {
    id: 7,
    title: 'Deep Focus',
    artist: 'Ambient Theory',
    cover:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 8,
    title: 'Night Energy',
    artist: 'Pulse District',
    cover:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 9,
    title: 'Slow Sunday',
    artist: 'Cloud Nine',
    cover:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 10,
    title: 'Main Character',
    artist: 'Maya Bloom',
    cover:
      'https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=700&q=80',
  },
]

const trending = [
  {
    id: 11,
    title: 'Neon Hearts',
    artist: 'Aria Wave',
    cover:
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 12,
    title: 'Higher Ground',
    artist: 'Northbound',
    cover:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 13,
    title: 'Gravity',
    artist: 'Kairo',
    cover:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 14,
    title: 'Parallel',
    artist: 'Echo Room',
    cover:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
  },
]

const freshVibes = [
  {
    id: 15,
    title: 'Blue Horizon',
    artist: 'Coastline',
    cover:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 16,
    title: 'Digital Rain',
    artist: 'Static Bloom',
    cover:
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 17,
    title: 'Soft Static',
    artist: 'Velour',
    cover:
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 18,
    title: 'Sunset FM',
    artist: 'Golden Youth',
    cover:
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80',
  },
]

const recentlyPlayed = [
  {
    id: 19,
    title: 'Midnight Drive',
    artist: 'Neon Avenue',
    cover:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 20,
    title: 'Afterglow',
    artist: 'Luna Echo',
    cover:
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 21,
    title: 'City Lights',
    artist: 'The Frequency',
    cover:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80',
  },
]

const playlists = [
  {
    id: 1,
    title: 'Late Night Drive',
    description: 'Neon lights, empty roads and midnight energy.',
    cover:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 2,
    title: 'Focus Flow',
    description: 'A calm soundtrack for getting things done.',
    cover:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 3,
    title: 'Weekend Energy',
    description: 'Good mood guaranteed. Turn it up.',
    cover:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=700&q=80',
  },
]

function SectionHeader({
  title,
  subtitle,
  icon: Icon = Sparkles,
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vh-violet)]">
          <Icon size={14} />
          <span>VibeHai</span>
        </div>

        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-[var(--vh-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      <button
        type="button"
        className="hidden shrink-0 items-center gap-1 text-sm font-medium text-[var(--vh-muted)] transition-colors hover:text-white sm:flex"
      >
        See all
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

function HorizontalSection({ children }) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-3">
      {children}
    </div>
  )
}

function Home() {
  const [apiSongs, setApiSongs] = useState([])
  const [loadingSongs, setLoadingSongs] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadSongs() {
      try {
        setLoadingSongs(true)

        const results = await searchSongs('Arijit Singh')

        if (mounted) {
          setApiSongs(
            results
              .map(normalizeSong)
              .filter((song) => song.id && song.title)
              .slice(0, 10)
          )
        }
      } catch (error) {
        console.error('JioSaavn:', error)

        if (mounted) {
          setApiSongs([])
        }
      } finally {
        if (mounted) {
          setLoadingSongs(false)
        }
      }
    }

    loadSongs()

    return () => {
      mounted = false
    }
  }, [])

  const quickPicks = apiSongs.length
    ? apiSongs
    : [
        {
          id: 1,
          title: 'Midnight Drive',
          artist: 'Neon Avenue',
          cover:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80',
        },
        {
          id: 2,
          title: 'Electric Dreams',
          artist: 'Nova Pulse',
          cover:
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80',
        },
        {
          id: 3,
          title: 'Afterglow',
          artist: 'Luna Echo',
          cover:
            'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80',
        },
        {
          id: 4,
          title: 'City Lights',
          artist: 'The Frequency',
          cover:
            'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80',
        },
      ]

  return (
    <div className="vh-ambient overflow-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-16 xl:px-12">
        <div className="absolute -right-32 -top-24 h-80 w-80 rounded-full bg-[rgba(139,92,246,0.12)] blur-3xl" />

        <div className="absolute right-1/4 top-20 h-64 w-64 rounded-full bg-[rgba(6,182,212,0.08)] blur-3xl" />

        <div className="relative mx-auto grid max-w-[1500px] items-center gap-10 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--vh-muted)]">
              <Sparkles
                size={14}
                className="text-[var(--vh-cyan)]"
              />
              Curated for your vibe
            </div>

            <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Good afternoon.
              <span className="mt-2 block bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Find your next favorite vibe.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--vh-muted)] sm:text-lg">
              Dive into handpicked music, discover fresh artists and let
              VibeHai find the soundtrack for whatever you feel like today.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="vh-button-primary">
                <Play size={17} fill="currentColor" />
                Start Listening
              </button>

              <button type="button" className="vh-button-secondary">
                Explore Vibes
                <ArrowRight size={17} />
              </button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mx-auto hidden w-full max-w-[440px] xl:block"
          >
            <div className="absolute inset-10 rounded-full bg-gradient-to-r from-violet-500/20 via-cyan-400/20 to-pink-500/20 blur-3xl" />

            <div className="relative aspect-square">
              <div className="absolute inset-[10%] rounded-full border border-white/10 bg-white/[0.02]" />

              <div className="absolute inset-[18%] rounded-full border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-400/10" />

              <div className="absolute inset-[27%] flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-cyan-400 to-pink-500 shadow-[0_0_100px_rgba(139,92,246,0.3)]">
                <div className="flex h-[92%] w-[92%] items-center justify-center rounded-full bg-[#08080a]">
                  <Headphones
                    size={58}
                    className="text-white"
                    strokeWidth={1.4}
                  />
                </div>
              </div>

              <div className="absolute left-0 top-[28%] rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-xl">
                <p className="text-xs text-zinc-500">
                  NOW PLAYING
                </p>

                <p className="mt-1 font-medium text-white">
                  Your vibe.
                </p>
              </div>

              <div className="absolute bottom-[18%] right-0 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-xl">
                <p className="text-xs text-zinc-500">
                  MOOD
                </p>

                <p className="mt-1 font-medium text-white">
                  Good vibes ✨
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-[1500px] space-y-12 px-5 pb-16 sm:px-8 lg:px-10 xl:px-12">
        {/* Quick Picks */}
        <section>
          <SectionHeader
            title="Quick Picks"
            subtitle={
              loadingSongs
                ? 'Finding your music...'
                : 'Arijit Singh — picked for you.'
            }
            icon={Headphones}
          />

          <HorizontalSection>
            {quickPicks.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
              />
            ))}
          </HorizontalSection>
        </section>

        {/* Made For You */}
        <section>
          <SectionHeader
            title="Made For You"
            subtitle="Fresh selections based on your listening mood."
            icon={Sparkles}
          />

          <HorizontalSection>
            {madeForYou.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
              />
            ))}
          </HorizontalSection>
        </section>

        {/* Trending */}
        <section>
          <SectionHeader
            title="Trending Now"
            subtitle="The tracks everyone is vibing with."
            icon={TrendingUp}
          />

          <HorizontalSection>
            {trending.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
              />
            ))}
          </HorizontalSection>
        </section>

        {/* Fresh Vibes */}
        <section>
          <SectionHeader
            title="Fresh Vibes"
            subtitle="New sounds worth discovering."
            icon={Sparkles}
          />

          <HorizontalSection>
            {freshVibes.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
              />
            ))}
          </HorizontalSection>
        </section>

        {/* Playlists */}
        <section>
          <SectionHeader
            title="Pick Your Mood"
            subtitle="Curated playlists for every kind of day."
            icon={Headphones}
          />

          <HorizontalSection>
            {playlists.map((playlist, index) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                index={index}
              />
            ))}
          </HorizontalSection>
        </section>

        {/* Recently Played */}
        <section>
          <SectionHeader
            title="Recently Played"
            subtitle="Continue where you left off."
            icon={Play}
          />

          <HorizontalSection>
            {recentlyPlayed.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
              />
            ))}
          </HorizontalSection>
        </section>
      </div>
    </div>
  )
}

export default Home