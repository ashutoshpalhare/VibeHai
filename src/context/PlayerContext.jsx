import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  // =========================================================
  // AUDIO ENGINE
  // =========================================================

  // Native HTML5 Audio object
  const audioRef = useRef(new Audio())

  // =========================================================
  // PLAYER STATE
  // =========================================================

  // Currently playing track
  const [currentTrack, setCurrentTrack] = useState(null)

  // Play / Pause state
  const [isPlaying, setIsPlaying] = useState(false)

  // Current playback position
  const [currentTime, setCurrentTime] = useState(0)

  // Current track duration
  const [duration, setDuration] = useState(0)

  // Volume 0 → 1
  const [volume, setVolume] = useState(1)

  // Mute state
  const [isMuted, setIsMuted] = useState(false)

  // Playback error
  const [error, setError] = useState('')

  // =========================================================
  // QUEUE STATE
  // =========================================================

  // Current playback queue
  const [queue, setQueue] = useState([])

  // Index of current track inside queue
  const [currentIndex, setCurrentIndex] = useState(-1)

  // =========================================================
  // PLAY TRACK
  // =========================================================

  const playTrack = async (track, newQueue = null) => {
    if (!track?.audioUrl) {
      setError("Couldn't play this track. Try another one.")
      return
    }

    const audio = audioRef.current

    try {
      setError('')

      // -------------------------------------------------------
      // IMPORTANT:
      //
      // If a queue is explicitly supplied,
      // keep that queue.
      //
      // Otherwise this is a standalone track,
      // so create a fresh queue containing only this track.
      // -------------------------------------------------------

      if (Array.isArray(newQueue)) {
        const index = newQueue.findIndex(
          (item) => item.id === track.id
        )

        setQueue(newQueue)
        setCurrentIndex(index >= 0 ? index : 0)
      } else {
        setQueue([track])
        setCurrentIndex(0)
      }

      // Stop previous audio
      audio.pause()

      // Reset playback
      audio.currentTime = 0

      // Set new audio source
      audio.src = track.audioUrl

      // Update current track
      setCurrentTrack(track)

      // Reset progress
      setCurrentTime(0)

      // Use track duration initially
      setDuration(Number(track.duration) || 0)

      // Load audio
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
  // PLAY QUEUE
  // =========================================================

  const playQueue = async (tracks, startIndex = 0) => {
    if (!Array.isArray(tracks) || tracks.length === 0) {
      return
    }

    // Keep index inside valid range
    const safeIndex = Math.max(
      0,
      Math.min(startIndex, tracks.length - 1)
    )

    const track = tracks[safeIndex]

    if (!track) return

    // Store entire queue
    setQueue(tracks)

    // Store current index
    setCurrentIndex(safeIndex)

    // Play selected track with complete queue
    await playTrack(track, tracks)
  }

  // =========================================================
  // NEXT TRACK
  // =========================================================

  const nextTrack = async () => {
    if (!queue.length) return

    const nextIndex = currentIndex + 1

    // No next track
    if (nextIndex >= queue.length) {
      setIsPlaying(false)
      return
    }

    const next = queue[nextIndex]

    if (!next) return

    setCurrentIndex(nextIndex)

    await playTrack(next, queue)
  }

  // =========================================================
  // PREVIOUS TRACK
  // =========================================================

  const previousTrack = async () => {
    if (!queue.length) return

    const audio = audioRef.current

    // If current song has played more than 3 seconds,
    // restart the same song.
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    const previousIndex = currentIndex - 1

    // Already at first track
    if (previousIndex < 0) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    const previous = queue[previousIndex]

    if (!previous) return

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

    const maxTime = duration || audio.duration || 0

    const nextTime = Math.max(
      0,
      Math.min(time, maxTime)
    )

    audio.currentTime = nextTime
    setCurrentTime(nextTime)
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
      audioRef.current.muted = false
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

    // Playback progress
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    // Metadata loaded
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    // Audio started
    const handlePlay = () => {
      setIsPlaying(true)
    }

    // Audio paused
    const handlePause = () => {
      setIsPlaying(false)
    }

    // -------------------------------------------------------
    // AUDIO ENDED
    // -------------------------------------------------------

    const handleEnded = () => {
      setCurrentIndex((previousIndex) => {
        const nextIndex = previousIndex + 1

        if (nextIndex < queue.length) {
          const nextTrackItem = queue[nextIndex]

          // Start next track after state update
          setTimeout(() => {
            playTrack(nextTrackItem, queue)
          }, 0)

          return nextIndex
        }

        // Queue finished
        setIsPlaying(false)

        return previousIndex
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
  // CLEANUP
  // =========================================================

  useEffect(() => {
    const audio = audioRef.current

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

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

        // Individual track
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