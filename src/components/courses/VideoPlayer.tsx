"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export interface VideoPlayerProps {
  src: string;
  onReady?: (player: Player) => void;
  onEnded?: () => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  onTakeNote?: (currentTime: number) => void;
  autoplayNext?: boolean;
  onToggleAutoplay?: (enabled: boolean) => void;
  hasPrevLesson?: boolean;
  hasNextLesson?: boolean;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&enablejsapi=1`
    : null;
}

export function VideoPlayer({
  src,
  onReady,
  onEnded,
  onPrevLesson,
  onNextLesson,
  onTakeNote,
  autoplayNext = true,
  onToggleAutoplay,
  hasPrevLesson = true,
  hasNextLesson = true,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  const youtubeUrl = getYouTubeEmbedUrl(src);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (youtubeUrl) return; // YouTube handles its own playback via iframe
    if (!videoWrapperRef.current) return;

    // Create video element for Video.js
    const videoEl = document.createElement("video-js");
    videoEl.classList.add("vjs-16-9");
    videoWrapperRef.current.innerHTML = "";
    videoWrapperRef.current.appendChild(videoEl);

    const player = videojs(videoEl, {
      controls: false, // We render custom Lucide overlay controls
      responsive: true,
      fluid: true,
      autoplay: false,
      preload: "auto",
      sources: [{ src, type: src.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4" }],
    });

    playerRef.current = player;
    onReady?.(player);

    player.on("play", () => setIsPlaying(true));
    player.on("pause", () => setIsPlaying(false));
    player.on("timeupdate", () => {
      setCurrentTime(player.currentTime() ?? 0);
      setDuration(player.duration() ?? 0);
    });
    player.on("loadedmetadata", () => {
      setDuration(player.duration() ?? 0);
    });
    player.on("volumechange", () => {
      setVolume(player.volume() ?? 1);
      setIsMuted(player.muted() ?? false);
    });
    player.on("ended", () => {
      setIsPlaying(false);
      onEnded?.();
    });

    return () => {
      player.dispose();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Handle user activity / mouse move to show/hide controls overlay
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
        setSpeedMenuOpen(false);
      }, 3500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setIsControlsVisible(false);
      setSpeedMenuOpen(false);
    }
  };

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.paused()) {
      p.play();
    } else {
      p.pause();
    }
  };

  const seek = (secondsDelta: number) => {
    const p = playerRef.current;
    if (!p) return;
    const cur = p.currentTime() ?? 0;
    const dur = p.duration() ?? 0;
    p.currentTime(Math.max(0, Math.min(dur, cur + secondsDelta)));
  };

  const handleSeekScrubber = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = playerRef.current;
    if (!p || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    p.currentTime(pct * duration);
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    p.muted(!p.muted());
  };

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const p = playerRef.current;
    if (!p) return;
    p.volume(val);
    if (val > 0 && p.muted()) {
      p.muted(false);
    }
  };

  const handleSetSpeed = (speed: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.playbackRate(speed);
    setPlaybackSpeed(speed);
    setSpeedMenuOpen(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full bg-black overflow-hidden group select-none flex items-center justify-center"
    >
      {youtubeUrl ? (
        <iframe
          src={youtubeUrl}
          title="Video lecture"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full aspect-video border-0"
        />
      ) : (
        <>
          {/* Video.js Mount Point */}
          <div ref={videoWrapperRef} className="w-full h-full aspect-video" onClick={togglePlay} />

          {/* Center Big Play Button (when paused) */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-18 h-18 rounded-full bg-slate-900/80 hover:bg-primary border-2 border-primary text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-transform hover:scale-110 cursor-pointer z-10"
            >
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </button>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              OVERLAY CONTROL BAR (Over the video section)
              - Scrubber Progress bar at the top
              - Next, Prev, Skip, Play/Pause, Volume, Time, Speed, Fullscreen directly below it
             ════════════════════════════════════════════════════════════════════════ */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-8 pb-3 px-4 transition-opacity duration-300 z-20 ${
              isControlsVisible || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
        {/* 1. PROGRESS BAR SCRUBBER (Top of Control Bar) */}
        <div
          onClick={handleSeekScrubber}
          className="relative w-full h-4 flex items-center cursor-pointer group/progress py-1"
        >
          {/* Background Track */}
          <div className="w-full h-1 group-hover/progress:h-2 bg-white/20 rounded-full overflow-hidden transition-all duration-150">
            {/* Played Progress */}
            <div
              className="h-full bg-primary rounded-full relative transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Thumb */}
          <div
            className="absolute w-3.5 h-3.5 bg-primary border-2 border-white rounded-full -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-md pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* 2. CONTROLS ROW (Directly below progress bar, over video section) */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Left Controls: Prev, Skip Back 5s, Play/Pause, Skip Forward 5s, Next, Volume, Time */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Previous Lesson Button */}
            <button
              type="button"
              disabled={!hasPrevLesson}
              onClick={onPrevLesson}
              title="Previous Lesson"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Skip Back 5s Button */}
            <button
              type="button"
              onClick={() => seek(-5)}
              title="Rewind 5 seconds (J)"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer flex items-center gap-0.5 text-xs font-medium"
            >
              <RotateCcw className="w-4 h-4 text-primary" />
              <span className="text-[10px] hidden sm:inline">5s</span>
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-primary/20"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Skip Forward 5s Button */}
            <button
              type="button"
              onClick={() => seek(5)}
              title="Forward 5 seconds (L)"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer flex items-center gap-0.5 text-xs font-medium"
            >
              <RotateCw className="w-4 h-4 text-primary" />
              <span className="text-[10px] hidden sm:inline">5s</span>
            </button>

            {/* Next Lesson Button */}
            <button
              type="button"
              disabled={!hasNextLesson}
              onClick={onNextLesson}
              title="Next Lesson"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeSlider}
                className="w-14 sm:w-18 h-1 accent-primary bg-white/20 rounded-lg cursor-pointer hidden group-hover/vol:inline-block transition-all"
              />
            </div>

            {/* Time Indicator */}
            <div className="text-[11px] font-mono text-white/80 ml-1">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/50">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Take Note, Speed, Autoplay, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Take Note Hotkey Button */}
            {onTakeNote && (
              <button
                type="button"
                onClick={() => onTakeNote(currentTime)}
                title="Take timestamped note (Press B)"
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-primary/20 hover:text-primary text-white text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Note</span>
                <kbd className="px-1 py-0.2 bg-black/40 rounded text-[9px] font-mono text-white/60">B</kbd>
              </button>
            )}

            {/* Speed Selector Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 text-xs font-semibold font-mono transition-colors flex items-center gap-0.5"
                title="Playback Speed"
              >
                <Gauge className="w-3.5 h-3.5 text-primary" />
                <span>{playbackSpeed}x</span>
              </button>

              {speedMenuOpen && (
                <div className="absolute bottom-9 right-0 bg-[#1c1d1f] border border-[#3e4143] rounded-xl py-1 shadow-2xl z-30 w-24">
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSetSpeed(s)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-white/10 transition-colors ${
                        playbackSpeed === s ? "text-primary font-bold bg-primary/10" : "text-white/80"
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Autoplay Toggle */}
            {onToggleAutoplay && (
              <label className="hidden lg:flex items-center gap-1.5 cursor-pointer text-[11px] text-white/70 hover:text-white px-2 py-1 rounded-md hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={autoplayNext}
                  onChange={(e) => onToggleAutoplay(e.target.checked)}
                  className="rounded accent-primary w-3 h-3"
                />
                <span>Autoplay</span>
              </label>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
