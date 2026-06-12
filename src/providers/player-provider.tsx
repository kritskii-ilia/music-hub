"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Track } from "@/types/app";

type PlayerContextValue = {
  queue: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  setQueue: (tracks: Track[], startAt?: number) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlayback: () => void;
  seek: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

function getStoredPlayerState() {
  if (typeof window === "undefined") {
    return {
      queue: [] as Track[],
      currentTrack: null as Track | null,
      progress: 0,
    };
  }

  try {
    const rawState = window.localStorage.getItem("music-hub-player");
    if (!rawState) {
      return {
        queue: [] as Track[],
        currentTrack: null as Track | null,
        progress: 0,
      };
    }

    return JSON.parse(rawState) as {
      queue: Track[];
      currentTrack: Track | null;
      progress: number;
    };
  } catch {
    return {
      queue: [] as Track[],
      currentTrack: null as Track | null,
      progress: 0,
    };
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const initialState = getStoredPlayerState();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueueState] = useState<Track[]>(initialState.queue);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(initialState.currentTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(initialState.progress);
  const [duration, setDuration] = useState(0);

  async function playTrackInternal(track: Track) {
    if (!audioRef.current) return;
    audioRef.current.src = track.fileUrl;
    await audioRef.current.play();
    setCurrentTrack(track);
    setIsPlaying(true);
  }

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      const index = queue.findIndex((track) => track.id === currentTrack?.id);
      const nextTrack = queue[index + 1];
      if (nextTrack) {
        void playTrackInternal(nextTrack);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, queue]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) {
      return;
    }
    audioRef.current.src = currentTrack.fileUrl;
    audioRef.current.currentTime = progress;
  }, [currentTrack, progress]);

  useEffect(() => {
    window.localStorage.setItem(
      "music-hub-player",
      JSON.stringify({
        queue,
        currentTrack,
        progress,
      }),
    );
  }, [queue, currentTrack, progress]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentTrack,
      isPlaying,
      progress,
      duration,
      setQueue(tracks, startAt = 0) {
        setQueueState(tracks);
        const track = tracks[startAt];
        if (track) {
          void playTrackInternal(track);
        }
      },
      playTrack(track, nextQueue) {
        if (nextQueue) {
          setQueueState(nextQueue);
        } else if (!queue.some((item) => item.id === track.id)) {
          setQueueState([track]);
        }
        void playTrackInternal(track);
      },
      togglePlayback() {
        if (!audioRef.current) return;
        if (audioRef.current.paused) {
          void audioRef.current.play();
          setIsPlaying(true);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      },
      seek(time) {
        if (!audioRef.current) return;
        audioRef.current.currentTime = time;
        setProgress(time);
      },
      playNext() {
        const index = queue.findIndex((track) => track.id === currentTrack?.id);
        const nextTrack = queue[index + 1];
        if (nextTrack) {
          void playTrackInternal(nextTrack);
        }
      },
      playPrevious() {
        const index = queue.findIndex((track) => track.id === currentTrack?.id);
        const previousTrack = queue[index - 1];
        if (previousTrack) {
          void playTrackInternal(previousTrack);
        }
      },
    }),
    [currentTrack, duration, isPlaying, progress, queue],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }

  return context;
}
