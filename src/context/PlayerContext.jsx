import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)

  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState(null)

  const playTrack = useCallback(async (track) => {
    if (!track?.audioUrl) {
      setError("Couldn't play this track. Try another one.")
      return
    }

    setError(null)

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    if (currentTrack?.id !== track.id) {
      audio.src = track.audioUrl
      audio.load()
      setCurrentTrack(track)
      setCurrentTime(0)
    }

    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setError("Couldn't play this track. Try another one.")
      setIsPlaying(false)
    }
  }, [currentTrack])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current

    if (!audio || !currentTrack) return

    try {
      if (audio.paused) {
        await audio.play()
        setIsPlaying(true)
      } else {
        audio.pause()
        setIsPlaying(false)
      }
    } catch {
      setError("Couldn't play this track. Try another one.")
    }
  }, [currentTrack])

  const seek = useCallback((time) => {
    if (!audioRef.current) return

    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  const changeVolume = useCallback((value) => {
    const nextVolume = Math.max(0, Math.min(1, value))

    setVolume(nextVolume)

    if (audioRef.current) {
      audioRef.current.volume = nextVolume
    }

    if (nextVolume > 0) {
      setIsMuted(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return

    const nextMuted = !isMuted

    audioRef.current.muted = nextMuted
    setIsMuted(nextMuted)
  }, [isMuted])

  useEffect(() => {
    const audio = audioRef.current || new Audio()

    audioRef.current = audio
    audio.volume = volume

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleError = () => {
      setIsPlaying(false)
      setError("Couldn't play this track. Try another one.")
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)

    return () => {
      audio.pause()

      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    error,
    playTrack,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayerContext() {
  const context = useContext(PlayerContext)

  if (!context) {
    throw new Error(
      'usePlayerContext must be used inside PlayerProvider'
    )
  }

  return context
}