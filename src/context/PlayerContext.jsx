import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  // Native HTML5 Audio object.
  // Actual music playback याच object मधून होतो.
  const audioRef = useRef(new Audio())

  // Current playing song
  const [currentTrack, setCurrentTrack] = useState(null)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)

  // Current playback position
  const [currentTime, setCurrentTime] = useState(0)

  // Total duration of current song
  const [duration, setDuration] = useState(0)

  // Volume: 0 to 1
  const [volume, setVolume] = useState(1)

  // Mute state
  const [isMuted, setIsMuted] = useState(false)

  // Player error
  const [error, setError] = useState('')

  // =========================================================
  // QUEUE SYSTEM
  // =========================================================

  // Songs waiting to be played
  const [queue, setQueue] = useState([])

  // Index of current song inside queue
  const [currentIndex, setCurrentIndex] = useState(-1)

  // =========================================================
  // PLAY A SINGLE TRACK
  // =========================================================

  const playTrack = async (track, newQueue = null) => {
    if (!track?.audioUrl) {
      setError("Couldn't play this track. Try another one.")
      return
    }

    const audio = audioRef.current

    try {
      setError('')

      // If a new queue is provided, use it.
      if (Array.isArray(newQueue)) {
        setQueue(newQueue)

        const index = newQueue.findIndex(
          (item) => item.id === track.id
        )

        setCurrentIndex(index >= 0 ? index : 0)
      } else {
        // If no queue exists, make current track the queue.
        setQueue((prev) => {
          if (!prev.length) {
            return [track]
          }

          return prev
        })

        // Find current track in existing queue.
        setCurrentIndex((prevIndex) => {
          const existingIndex = queue.findIndex(
            (item) => item.id === track.id
          )

          return existingIndex >= 0
            ? existingIndex
            : prevIndex
        })
      }

      // Stop previous track
      audio.pause()

      // Reset old playback position
      audio.currentTime = 0

      // Set new audio source
      audio.src = track.audioUrl

      // Tell React which song is playing
      setCurrentTrack(track)

      setCurrentTime(0)
      setDuration(Number(track.duration) || 0)

      // Load new audio
      audio.load()

      // Start playback
      await audio.play()

      setIsPlaying(true)
    } catch (playError) {
      console.error('Audio playback failed:', playError)

      setIsPlaying(false)
      setError("Couldn't play this track. Try another one.")
    }
  }

  // =========================================================
  // PLAY AN ENTIRE QUEUE / PLAYLIST
  // =========================================================

  const playQueue = async (tracks, startIndex = 0) => {
    if (!Array.isArray(tracks) || tracks.length === 0) {
      return
    }

    const safeIndex = Math.max(
      0,
      Math.min(startIndex, tracks.length - 1)
    )

    const track = tracks[safeIndex]

    if (!track) return

    // Store complete queue first
    setQueue(tracks)

    // Store current index
    setCurrentIndex(safeIndex)

    // Start selected song
    await playTrack(track, tracks)
  }

  // =========================================================
  // NEXT TRACK
  // =========================================================

  const nextTrack = async () => {
    if (!queue.length) return

    const nextIndex = currentIndex + 1

    // No next song
    if (nextIndex >= queue.length) {
      setIsPlaying(false)
      return
    }

    const next = queue[nextIndex]

    setCurrentIndex(nextIndex)

    await playTrack(next, queue)
  }

  // =========================================================
  // PREVIOUS TRACK
  // =========================================================

  const previousTrack = async () => {
    if (!queue.length) return

    // If current song has played more than 3 seconds,
    // restart the same song.
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }

    const previousIndex = currentIndex - 1

    // Already at first song
    if (previousIndex < 0) {
      audioRef.current.currentTime = 0
      return
    }

    const previous = queue[previousIndex]

    setCurrentIndex(previousIndex)

    await playTrack(previous, queue)
  }

  // =========================================================
  // PLAY / PAUSE
  // =========================================================

  const togglePlay = async () => {
    const audio = audioRef.current

    if (!currentTrack) return

    try {
      if (audio.paused) {
        await audio.play()
        setIsPlaying(true)
      } else {
        audio.pause()
        setIsPlaying(false)
      }
    } catch (playError) {
      console.error('Toggle playback failed:', playError)

      setIsPlaying(false)
      setError("Couldn't play this track. Try another one.")
    }
  }

  // =========================================================
  // SEEK
  // =========================================================

  const seek = (time) => {
    const audio = audioRef.current

    if (!Number.isFinite(time)) return

    audio.currentTime = Math.max(
      0,
      Math.min(time, duration || 0)
    )

    setCurrentTime(audio.currentTime)
  }

  // =========================================================
  // VOLUME
  // =========================================================

  const changeVolume = (value) => {
    const nextVolume = Math.max(
      0,
      Math.min(Number(value), 1)
    )

    audioRef.current.volume = nextVolume

    setVolume(nextVolume)

    if (nextVolume > 0) {
      setIsMuted(false)
    }
  }

  // =========================================================
  // MUTE / UNMUTE
  // =========================================================

  const toggleMute = () => {
    const audio = audioRef.current

    const nextMuted = !isMuted

    audio.muted = nextMuted

    setIsMuted(nextMuted)
  }

  // =========================================================
  // AUDIO EVENTS
  // =========================================================

  useEffect(() => {
    const audio = audioRef.current

    // Update current playback time
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    // Audio metadata loaded
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }

    // Audio started playing
    const handlePlay = () => {
      setIsPlaying(true)
    }

    // Audio paused
    const handlePause = () => {
      setIsPlaying(false)
    }

    // Audio finished
    const handleEnded = () => {
      // Automatically play next track
      setCurrentIndex((previousIndex) => {
        const nextIndex = previousIndex + 1

        if (nextIndex < queue.length) {
          const nextTrackItem = queue[nextIndex]

          // Start next track after state update
          setTimeout(() => {
            playTrack(nextTrackItem, queue)
          }, 0)
        } else {
          // Queue finished
          setIsPlaying(false)
        }

        return nextIndex < queue.length
          ? nextIndex
          : previousIndex
      })
    }

    // Audio error
    const handleError = () => {
      setIsPlaying(false)
      setError("Couldn't play this track. Try another one.")
    }

    audio.addEventListener(
      'timeupdate',
      handleTimeUpdate
    )

    audio.addEventListener(
      'loadedmetadata',
      handleLoadedMetadata
    )

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener(
        'timeupdate',
        handleTimeUpdate
      )

      audio.removeEventListener(
        'loadedmetadata',
        handleLoadedMetadata
      )

      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [queue])

  // =========================================================
  // APPLY VOLUME
  // =========================================================

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  // =========================================================
  // CLEANUP AUDIO WHEN PROVIDER UNMOUNTS
  // =========================================================

  useEffect(() => {
    const audio = audioRef.current

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        // Current track
        currentTrack,

        // Playback
        isPlaying,
        togglePlay,

        // Progress
        currentTime,
        duration,
        seek,

        // Volume
        volume,
        isMuted,
        changeVolume,
        toggleMute,

        // Queue
        queue,
        currentIndex,
        playQueue,
        nextTrack,
        previousTrack,

        // Play individual track
        playTrack,

        // Error
        error,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

// =========================================================
// CUSTOM HOOK
// =========================================================

export function usePlayerContext() {
  const context = useContext(PlayerContext)

  if (!context) {
    throw new Error(
      'usePlayerContext must be used inside PlayerProvider'
    )
  }

  return context
}