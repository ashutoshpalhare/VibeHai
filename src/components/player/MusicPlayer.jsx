import {
  Heart,
  MoreHorizontal,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat2,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { usePlayer } from '../../hooks/usePlayer'

function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    volume,
    changeVolume,
    isMuted,
    toggleMute,
    queue,
    currentIndex,
    nextTrack,
    previousTrack,
  } = usePlayer()

  // ---------------------------------------------------------
  // Format seconds into mm:ss
  // Example: 125 -> 2:05
  // ---------------------------------------------------------
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00'
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
  }

  // ---------------------------------------------------------
  // Calculate progress percentage
  // ---------------------------------------------------------
  const progress =
    duration > 0
      ? Math.min((currentTime / duration) * 100, 100)
      : 0

  // ---------------------------------------------------------
  // Handle progress bar click
  // ---------------------------------------------------------
  const handleSeek = (event) => {
    if (!duration) return

    const rect = event.currentTarget.getBoundingClientRect()

    const clickPosition =
      (event.clientX - rect.left) / rect.width

    const newTime = clickPosition * duration

    seek(newTime)
  }

  // ---------------------------------------------------------
  // Handle keyboard interaction on progress bar
  // ---------------------------------------------------------
  const handleProgressKeyDown = (event) => {
    if (!duration) return

    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight'
    ) {
      return
    }

    event.preventDefault()

    const step = 5

    const newTime =
      event.key === 'ArrowRight'
        ? currentTime + step
        : currentTime - step

    seek(Math.max(0, Math.min(newTime, duration)))
  }

  // ---------------------------------------------------------
  // Handle volume slider
  // ---------------------------------------------------------
  const handleVolumeChange = (event) => {
    changeVolume(Number(event.target.value))
  }

  // ---------------------------------------------------------
  // Current track availability
  // ---------------------------------------------------------
  const hasTrack = Boolean(currentTrack)

  // ---------------------------------------------------------
  // Queue availability
  // ---------------------------------------------------------
  const hasPrevious = currentIndex > 0
  const hasNext =
    currentIndex >= 0 &&
    currentIndex < queue.length - 1

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-[rgba(10,10,11,0.96)] px-3 py-2 backdrop-blur-2xl lg:px-5">
      <div className="mx-auto flex h-[64px] max-w-[1800px] items-center gap-3">

        {/* ===================================================
            TRACK INFORMATION
        =================================================== */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:w-[30%] lg:flex-none">

          {/* Album / Song Cover */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-violet-600 via-cyan-500 to-pink-500">

            {currentTrack?.cover ? (
              <img
                src={currentTrack.cover}
                alt={currentTrack.title || 'Current song'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="text-sm font-bold">
                  VH
                </span>
              </div>
            )}
          </div>

          {/* Track Name + Artist */}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {currentTrack?.title || 'Nothing Playing'}
            </p>

            <p className="truncate text-xs text-zinc-500">
              {currentTrack?.artist ||
                'Choose a song to start listening'}
            </p>
          </div>

          {/* Like Button */}
          <button
            type="button"
            className="vh-icon-button hidden shrink-0 sm:inline-flex"
            aria-label="Like current song"
            disabled={!hasTrack}
          >
            <Heart size={17} />
          </button>

          {/* More Options */}
          <button
            type="button"
            className="vh-icon-button hidden shrink-0 md:inline-flex"
            aria-label="More options"
            disabled={!hasTrack}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* ===================================================
            MAIN PLAYER CONTROLS
        =================================================== */}
        <div className="hidden flex-1 flex-col items-center justify-center gap-1.5 md:flex">

          {/* Playback Buttons */}
          <div className="flex items-center gap-1">

            {/* Shuffle */}
            <button
              type="button"
              className="vh-icon-button"
              aria-label="Shuffle"
              disabled={!queue.length}
            >
              <Shuffle size={16} />
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={previousTrack}
              className="vh-icon-button disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous track"
              disabled={!hasTrack}
            >
              <SkipBack
                size={18}
                fill="currentColor"
              />
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={
                isPlaying ? 'Pause' : 'Play'
              }
              disabled={!hasTrack}
            >
              {isPlaying ? (
                <Pause
                  size={18}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={18}
                  fill="currentColor"
                  className="ml-0.5"
                />
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={nextTrack}
              className="vh-icon-button disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next track"
              disabled={!hasNext}
            >
              <SkipForward
                size={18}
                fill="currentColor"
              />
            </button>

            {/* Repeat */}
            <button
              type="button"
              className="vh-icon-button"
              aria-label="Repeat"
              disabled={!hasTrack}
            >
              <Repeat2 size={16} />
            </button>
          </div>

          {/* =================================================
              PROGRESS BAR
          ================================================= */}
          <div className="flex w-full max-w-[520px] items-center gap-2">

            {/* Current Time */}
            <span className="w-8 text-right text-[10px] text-zinc-500">
              {formatTime(currentTime)}
            </span>

            {/* Progress Track */}
            <div
              role="slider"
              tabIndex={hasTrack ? 0 : -1}
              aria-label="Song progress"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime}
              onClick={handleSeek}
              onKeyDown={handleProgressKeyDown}
              className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/[0.1]"
            >
              {/* Played Progress */}
              <div
                className="h-full rounded-full vh-gradient transition-[width] duration-100"
                style={{
                  width: `${progress}%`,
                }}
              />

              {/* Progress Thumb */}
              <div
                className="absolute top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-lg group-hover:block"
                style={{
                  left: `calc(${progress}% - 6px)`,
                }}
              />
            </div>

            {/* Total Duration */}
            <span className="w-8 text-[10px] text-zinc-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ===================================================
            VOLUME / DESKTOP
        =================================================== */}
        <div className="hidden items-center justify-end gap-1 lg:flex lg:w-[30%] lg:flex-none">

          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="vh-icon-button"
            aria-label={
              isMuted ? 'Unmute' : 'Mute'
            }
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} />
            ) : volume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          {/* Volume Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="h-1 w-24 cursor-pointer accent-violet-500"
          />
        </div>

        {/* ===================================================
            MOBILE PLAY BUTTON
        =================================================== */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black md:hidden disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={
            isPlaying ? 'Pause' : 'Play'
          }
          disabled={!hasTrack}
        >
          {isPlaying ? (
            <Pause
              size={17}
              fill="currentColor"
            />
          ) : (
            <Play
              size={17}
              fill="currentColor"
              className="ml-0.5"
            />
          )}
        </button>
      </div>
    </footer>
  )
}

export default MusicPlayer