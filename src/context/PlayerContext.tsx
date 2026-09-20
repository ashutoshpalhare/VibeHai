import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { shuffleArray } from "@/lib/format";
import { load, save, STORAGE_KEYS } from "@/lib/storage";
import type { RepeatMode, Song } from "@/lib/types";
import { useLibrary } from "./LibraryContext";

/* ------------------------------------------------------------------ *
 *  Singleton audio element — survives StrictMode double-mounts.
 * ------------------------------------------------------------------ */
let _audio: HTMLAudioElement | null = null;
function getAudio(): HTMLAudioElement {
  if (!_audio) {
    _audio = new Audio();
    _audio.preload = "auto";
  }
  return _audio;
}

interface QueueSource {
  id: string;
  title: string;
  href?: string;
}

interface PlayerApi {
  queue: Song[];
  index: number;
  current: Song | undefined;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | undefined;
  queueSource: QueueSource | undefined;
  queueOpen: boolean;
  nowPlayingOpen: boolean;
  sleepEndsAt: number | null;
  sleepTrackEnd: boolean;
  sleepRemaining: number | null;
  setSleepTimer: (minutes: number) => void;
  setSleepAtTrackEnd: () => void;
  cancelSleepTimer: () => void;

  playQueue: (songs: Song[], startIndex?: number, source?: QueueSource) => void;
  shufflePlay: (songs: Song[], source?: QueueSource) => void;
  playSong: (song: Song, source?: QueueSource) => void;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  seekBy: (delta: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (songs: Song | Song[], label?: string) => void;
  playNext: (songs: Song | Song[], label?: string) => void;
  removeFromQueue: (queueIndex: number) => void;
  moveInQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  jumpTo: (queueIndex: number) => void;
  setQueueOpen: (open: boolean) => void;
  setNowPlayingOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerApi | null>(null);

const MAX_PERSISTED_QUEUE = 250;

interface PersistedState {
  queue: Song[];
  index: number;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  source?: QueueSource;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const library = useLibrary();
  const restored = useRef<PersistedState>(
    load<PersistedState>(STORAGE_KEYS.player, {
      queue: [],
      index: 0,
      shuffle: false,
      repeat: "off",
      volume: 0.85,
      muted: false,
    }),
  );

  const [queue, setQueue] = useState<Song[]>(() => restored.current.queue ?? []);
  const [index, setIndex] = useState<number>(() =>
    Math.min(restored.current.index ?? 0, Math.max(0, (restored.current.queue?.length ?? 1) - 1)),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolumeState] = useState(() => restored.current.volume ?? 0.85);
  const [muted, setMuted] = useState(() => restored.current.muted ?? false);
  const [shuffle, setShuffle] = useState(() => restored.current.shuffle ?? false);
  const [repeat, setRepeat] = useState<RepeatMode>(() => restored.current.repeat ?? "off");
  const [error, setError] = useState<string | undefined>(undefined);
  const [queueSource, setQueueSource] = useState<QueueSource | undefined>(
    () => restored.current.source,
  );
  const [queueOpen, setQueueOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  /* sleep timer */
  const [sleepEndsAt, setSleepEndsAt] = useState<number | null>(null);
  const [sleepTrackEnd, setSleepTrackEnd] = useState(false);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  const sleepTrackEndRef = useRef(false);
  useEffect(() => {
    sleepTrackEndRef.current = sleepTrackEnd;
  }, [sleepTrackEnd]);

  const audio = getAudio();
  const originalOrder = useRef<Song[]>([]);
  const sourceAttempt = useRef(0);
  const loadToken = useRef(0);
  const consecutiveFailures = useRef(0);
  const playIntent = useRef(false);

  const current = queue[index];

  /* ---------------------------------------------------------------- *
   *  Media element wiring
   * ---------------------------------------------------------------- */
  const hardPlay = useCallback(() => {
    playIntent.current = true;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch((err: DOMException) => {
        playIntent.current = false;
        setIsPlaying(false);
        if (err?.name === "NotAllowedError") {
          setError("Tap the play button to start audio");
        }
      });
    }
  }, [audio]);

  // Load the current track whenever it changes
  useEffect(() => {
    const token = ++loadToken.current;
    sourceAttempt.current = 0;
    setCurrentTime(0);
    setBuffered(0);
    setError(undefined);
    setDuration(current?.duration ?? 0);

    if (!current || !current.sources.length) {
      audio.pause();
      audio.removeAttribute("src");
      audio.dataset.songId = "";
      setIsPlaying(false);
      return;
    }
    if (audio.dataset.songId === current.id) return;

    audio.dataset.songId = current.id;
    audio.src = current.sources[0];
    audio.load();
    if (playIntent.current || isPlaying) hardPlay();
    void token;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, current?.sources]);

  // Keep element level with react state
  useEffect(() => {
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
  }, [audio, volume, muted]);

  useEffect(() => {
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : current?.duration ?? 0);
    };
    const onPlay = () => {
      setIsPlaying(true);
      setError(undefined);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    const onProgress = () => {
      try {
        if (audio.buffered.length && audio.duration) {
          setBuffered(audio.buffered.end(audio.buffered.length - 1));
        }
      } catch {
        /* noop */
      }
    };
    const onEnded = () => {
      if (sleepTrackEndRef.current) {
        sleepTrackEndRef.current = false;
        setSleepTrackEnd(false);
        playIntent.current = false;
        setIsPlaying(false);
        return;
      }
      if (repeat === "one") {
        audio.currentTime = 0;
        hardPlay();
        return;
      }
      advance(true);
    };
    const onError = () => {
      const song = queue[index];
      const fallback = song?.sources[sourceAttempt.current + 1];
      if (fallback) {
        sourceAttempt.current += 1;
        audio.src = fallback;
        audio.load();
        hardPlay();
        return;
      }
      setIsBuffering(false);
      setIsPlaying(false);
      consecutiveFailures.current += 1;
      if (consecutiveFailures.current < 3) {
  setError("This track couldn't be played — skipping");

  const timer = window.setTimeout(() => {
    advance(true);
  }, 900);

  return () => window.clearTimeout(timer);
} else {
        setError("Playback stopped. Try another track.");
        consecutiveFailures.current = 0;
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("progress", onProgress);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("progress", onProgress);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio, queue, index, repeat, hardPlay]);

  /* ---------------------------------------------------------------- *
   *  History + persistence
   * ---------------------------------------------------------------- */
  const recordedRef = useRef<string | null>(null);
  useEffect(() => {
    if (current && isPlaying && recordedRef.current !== current.id) {
      recordedRef.current = current.id;
      library.pushRecentlyPlayed(current);
    }
    if (!isPlaying) recordedRef.current = null;
  }, [current, isPlaying, library]);

  useEffect(() => {
    save(STORAGE_KEYS.player, {
      queue: queue.slice(0, MAX_PERSISTED_QUEUE),
      index,
      shuffle,
      repeat,
      volume,
      muted,
      source: queueSource,
    } satisfies PersistedState);
  }, [queue, index, shuffle, repeat, volume, muted, queueSource]);

  /* ---------------------------------------------------------------- *
   *  Transport
   * ---------------------------------------------------------------- */
  const advance = useCallback(
    (auto: boolean) => {
      setIndex((i) => {
        if (!queue.length) return i;
        if (repeat === "one" && !auto) return i;
        if (i < queue.length - 1) return i + 1;
        if (repeat === "all") return 0;
        if (auto) {
          setIsPlaying(false);
          playIntent.current = false;
          return i;
        }
        return 0;
      });
    },
    [queue.length, repeat],
  );

  const play = useCallback(() => {
    playIntent.current = true;
    consecutiveFailures.current = 0;
    if (!current) return;
    if (!audio.src) {
      audio.dataset.songId = current.id;
      audio.src = current.sources[0];
      audio.load();
    }
    hardPlay();
  }, [audio, current, hardPlay]);

  const pause = useCallback(() => {
    playIntent.current = false;
    audio.pause();
  }, [audio]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const next = useCallback(() => advance(false), [advance]);

  const prev = useCallback(() => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setIndex((i) => (i > 0 ? i - 1 : Math.max(0, queue.length - 1)));
  }, [audio, queue.length]);

  const seek = useCallback(
    (seconds: number) => {
      if (!Number.isFinite(seconds)) return;
      const max = duration || current?.duration || 0;
      const clamped = Math.max(0, Math.min(seconds, max ? max - 0.25 : seconds));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [audio, duration, current?.duration],
  );

  const seekBy = useCallback((delta: number) => seek(audio.currentTime + delta), [audio, seek]);

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v));
      setVolumeState(clamped);
      if (clamped > 0) setMuted(false);
    },
    [],
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), []);



const toggleShuffle = useCallback(() => {
  if (!shuffle) {
    // turning shuffle ON: keep the current song first
    originalOrder.current = queue.slice();

    const currentSong = queue[index];
    const rest = queue.filter((_, i) => i !== index);

    setQueue([currentSong, ...shuffleArray(rest)].filter(Boolean));
    setIndex(0);
    setShuffle(true);
  } else {
    // turning shuffle OFF: restore original order only when it is still valid
    const back = originalOrder.current;

    const currentSong = queue[index];
    const currentId = currentSong?.id;

    const queueIds = new Set(queue.map((s) => s.id));
    const validOriginal = back.filter((s) => queueIds.has(s.id));

    if (validOriginal.length === queue.length) {
      const newIndex = Math.max(
        0,
        validOriginal.findIndex((s) => s.id === currentId)
      );

      setQueue(validOriginal);
      setIndex(newIndex);
    }

    setShuffle(false);
  }
}, [queue, index, shuffle]);




  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  /* ---------------------------------------------------------------- *
   *  Queue operations
   * ---------------------------------------------------------------- */
  const playQueue = useCallback<PlayerApi["playQueue"]>(
    (songs, startIndex = 0, source) => {
      const list = songs.filter((s) => s.sources?.length);
      if (!list.length) return;
      consecutiveFailures.current = 0;
      playIntent.current = true;
      originalOrder.current = list.slice();
      let first: Song | undefined;
      if (shuffle) {
        first = list[startIndex] ?? list[0];
        const rest = list.filter((s) => s.id !== first?.id);
        setQueue([first, ...shuffleArray(rest)].filter(Boolean));
        setIndex(0);
      } else {
        const clamped = Math.max(0, Math.min(startIndex, list.length - 1));
        first = list[clamped];
        setQueue(list);
        setIndex(clamped);
      }
      setQueueSource(source);

      // Kick off playback inside the user gesture (required by iOS/Safari)
      if (first?.sources.length) {
        audio.dataset.songId = first.id;
        sourceAttempt.current = 0;
        audio.src = first.sources[0];
        audio.load();
        hardPlay();
      }
    },
    [shuffle],
  );

  const shufflePlay = useCallback<PlayerApi["shufflePlay"]>(
    (songs, source) => {
      const list = songs.filter((s) => s.sources?.length);
      if (!list.length) return;
      const mixed = shuffleArray(list);
      playQueue(mixed, 0, source);
      if (!shuffle) setShuffle(true);
    },
    [playQueue, shuffle],
  );

  const playSong = useCallback<PlayerApi["playSong"]>(
    (song, source) => playQueue([song], 0, source ?? { id: song.id, title: song.title }),
    [playQueue],
  );

  const addToQueue = useCallback<PlayerApi["addToQueue"]>(
    (input, label) => {
      const songs = (Array.isArray(input) ? input : [input]).filter((s) => s.sources?.length);
      if (!songs.length) return;
      if (!queue.length) {
        setQueue(songs);
        setIndex(0);
      } else {
        const existing = new Set(queue.map((s) => s.id));
        const fresh = songs.filter((s) => !existing.has(s.id));
        if (fresh.length) setQueue([...queue, ...fresh]);
      }
      if (!queueSource && label) setQueueSource({ id: "queue", title: label ?? "Queue" });
    },
    [queue, queueSource],
  );

  const playNext = useCallback<PlayerApi["playNext"]>(
    (input, label) => {
      const songs = (Array.isArray(input) ? input : [input]).filter((s) => s.sources?.length);
      if (!songs.length) return;
      if (!queue.length) {
        setQueue(songs);
        setIndex(0);
      } else {
        const existing = new Set(queue.map((s) => s.id));
        const fresh = songs.filter((s) => !existing.has(s.id));
        if (fresh.length) {
          const insertAt = index + 1;
          setQueue([...queue.slice(0, insertAt), ...fresh, ...queue.slice(insertAt)]);
        }
      }
      if (!queueSource && label) setQueueSource({ id: "queue", title: label ?? "Queue" });
    },
    [queue, index, queueSource],
  );

  const removeFromQueue = useCallback<PlayerApi["removeFromQueue"]>(
    (queueIndex) => {
      if (queueIndex < 0 || queueIndex >= queue.length) return;
      const nextQueue = queue.filter((_, i) => i !== queueIndex);
      if (queueIndex === index) {
        // removing the playing track: drop the element so the load effect re-fires
        audio.pause();
        audio.dataset.songId = "";
        playIntent.current = false;
        setIsPlaying(false);
      }
      setQueue(nextQueue);
      setIndex((i) => {
        if (queueIndex === index) return Math.max(0, Math.min(queueIndex, nextQueue.length - 1));
        return queueIndex < i ? Math.max(0, i - 1) : i;
      });
    },
    [audio, queue, index],
  );

  const moveInQueue = useCallback<PlayerApi["moveInQueue"]>(
    (from, to) => {
      if (from === to || from < 0 || to < 0 || from >= queue.length || to >= queue.length) return;
      const out = queue.slice();
      const [moved] = out.splice(from, 1);
      out.splice(to, 0, moved);
      const currentId = queue[index]?.id;
      const nextIndex = currentId ? out.findIndex((s) => s.id === currentId) : index;
      setQueue(out);
      if (nextIndex >= 0) setIndex(nextIndex);
    },
    [queue, index],
  );

  const clearQueue = useCallback(() => {
    setQueue(current ? [current] : []);
    setIndex(0);
    setQueueSource(undefined);
  }, [current]);

  const jumpTo = useCallback(
    (queueIndex: number) => {
      if (queueIndex < 0 || queueIndex >= queue.length) return;
      consecutiveFailures.current = 0;
      const song = queue[queueIndex];
      if (!song) return;
      if (audio.dataset.songId !== song.id) {
        audio.dataset.songId = song.id;
        sourceAttempt.current = 0;
        audio.src = song.sources[0];
        audio.load();
      }
      setIndex(queueIndex);
      playIntent.current = true;
      hardPlay();
    },
    [audio, hardPlay, queue],
  );

  /* ---------------------------------------------------------------- *
   *  Sleep timer
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (sleepEndsAt === null) {
      setSleepRemaining(null);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.round((sleepEndsAt - Date.now()) / 1000));
      setSleepRemaining(left);
      if (left <= 0) {
        setSleepEndsAt(null);
        setSleepTrackEnd(false);
        setSleepRemaining(null);
        playIntent.current = false;
        audio.pause();
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [sleepEndsAt, audio]);

  const setSleepTimer = useCallback(
    (minutes: number) => {
      const mins = Math.max(1, Math.min(240, Math.round(minutes)));
      setSleepEndsAt(Date.now() + mins * 60_000);
      setSleepTrackEnd(false);
    },
    [],
  );

  const setSleepAtTrackEnd = useCallback(() => {
    setSleepEndsAt(null);
    setSleepTrackEnd(true);
  }, []);

  const cancelSleepTimer = useCallback(() => {
    setSleepEndsAt(null);
    setSleepTrackEnd(false);
    setSleepRemaining(null);
  }, []);

  /* ---------------------------------------------------------------- *
   *  OS media session
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const ms = (navigator as any).mediaSession;
    if (!ms || !current) return;
    try {
      ms.metadata = new (window as any).MediaMetadata({
        title: current.title,
        artist: current.artist,
        album: current.album,
        artwork: current.image
          ? [{ src: current.image, sizes: "500x500", type: "image/jpeg" }]
          : [],
      });
      ms.playbackState = isPlaying ? "playing" : "paused";
    } catch {
      /* noop */
    }
  }, [current, isPlaying]);

  useEffect(() => {
    const ms = (navigator as any).mediaSession;
    if (!ms?.setActionHandler) return;
    const map: [string, () => void][] = [
      ["play", play],
      ["pause", pause],
      ["nexttrack", next],
      ["previoustrack", prev],
      ["seekbackward", () => seekBy(-10)],
      ["seekforward", () => seekBy(10)],
    ];
    map.forEach(([action, handler]) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        /* unsupported action */
      }
    });
  }, [play, pause, next, prev, seekBy]);

  const value = useMemo<PlayerApi>(
    () => ({
      queue,
      index,
      current,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      buffered,
      volume,
      muted,
      shuffle,
      repeat,
      error,
      queueSource,
      queueOpen,
      nowPlayingOpen,
      sleepEndsAt,
      sleepTrackEnd,
      sleepRemaining,
      setSleepTimer,
      setSleepAtTrackEnd,
      cancelSleepTimer,
      playQueue,
      shufflePlay,
      playSong,
      toggle,
      play,
      pause,
      next,
      prev,
      seek,
      seekBy,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playNext,
      removeFromQueue,
      moveInQueue,
      clearQueue,
      jumpTo,
      setQueueOpen,
      setNowPlayingOpen,
    }),
    [
      queue,
      index,
      current,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      buffered,
      volume,
      muted,
      shuffle,
      repeat,
      error,
      queueSource,
      queueOpen,
      nowPlayingOpen,
      sleepEndsAt,
      sleepTrackEnd,
      sleepRemaining,
      setSleepTimer,
      setSleepAtTrackEnd,
      cancelSleepTimer,
      playQueue,
      shufflePlay,
      playSong,
      toggle,
      play,
      pause,
      next,
      prev,
      seek,
      seekBy,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playNext,
      removeFromQueue,
      moveInQueue,
      clearQueue,
      jumpTo,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
