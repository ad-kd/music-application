import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat } from 'lucide-react';

// Load YouTube IFrame API script once
let ytApiLoaded = false;
function loadYouTubeApi(callback) {
  if (ytApiLoaded && window.YT && window.YT.Player) {
    callback();
    return;
  }
  if (!ytApiLoaded) {
    ytApiLoaded = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }
  // Poll until ready
  const interval = setInterval(() => {
    if (window.YT && window.YT.Player) {
      clearInterval(interval);
      callback();
    }
  }, 100);
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const Player = ({ currentSong, songList, onSongChange, favorites, toggleFavorite }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const playerRef = useRef(null);      // YT.Player instance
  const containerRef = useRef(null);   // div for the iframe
  const intervalRef = useRef(null);    // progress timer

  const isLiked = currentSong && favorites && favorites.some(s => s.id === currentSong.id);

  const stopTimer = () => clearInterval(intervalRef.current);

  const startTimer = useCallback(() => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
  }, []);

  // Create / recreate YT player when song changes
  useEffect(() => {
    if (!currentSong) return;

    const initPlayer = () => {
      // Destroy old player if exists
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: currentSong.id,
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
            event.target.playVideo();
            setIsPlaying(true);
            setDuration(event.target.getDuration());
            setCurrentTime(0);
            startTimer();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTimer();
              setDuration(event.target.getDuration());
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.BUFFERING
            ) {
              setIsPlaying(false);
              stopTimer();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              stopTimer();
              if (isRepeating) {
                event.target.seekTo(0);
                event.target.playVideo();
              } else {
                handleNext();
              }
            }
          },
        },
      });
    };

    loadYouTubeApi(initPlayer);

    return () => {
      stopTimer();
    };
  }, [currentSong]);

  // Sync volume changes to player
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(val, true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      if (!prev) {
        playerRef.current?.mute();
      } else {
        playerRef.current?.unMute();
      }
      return !prev;
    });
  };

  const handleNext = () => {
    if (!songList || songList.length === 0 || !onSongChange) return;
    const idx = songList.findIndex(
      (s) => (s.id.videoId || s.id) === currentSong?.id
    );
    let nextIdx;
    if (isShuffling) {
      nextIdx = Math.floor(Math.random() * songList.length);
    } else {
      nextIdx = (idx + 1) % songList.length;
    }
    const next = songList[nextIdx];
    const vid = next.id.videoId || next.id;
    onSongChange({
      id: vid,
      title: next.snippet.title,
      thumbnail: next.snippet.thumbnails.high.url,
      artist: next.snippet.channelTitle,
    });
  };

  const handlePrev = () => {
    if (!songList || songList.length === 0 || !onSongChange) return;
    if (currentTime > 3) {
      playerRef.current?.seekTo(0, true);
      setCurrentTime(0);
      return;
    }
    const idx = songList.findIndex(
      (s) => (s.id.videoId || s.id) === currentSong?.id
    );
    const prevIdx = (idx - 1 + songList.length) % songList.length;
    const prev = songList[prevIdx];
    const vid = prev.id.videoId || prev.id;
    onSongChange({
      id: vid,
      title: prev.snippet.title,
      thumbnail: prev.snippet.thumbnails.high.url,
      artist: prev.snippet.channelTitle,
    });
  };

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Hidden YT iframe container */}
      <div
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none', top: 0 }}
      >
        <div ref={containerRef} id="yt-player-container" />
      </div>

      {/* Progress Bar (thin, sits above the player bar) */}
      <div className="relative h-1 bg-slate-800 cursor-pointer group">
        <div
          className="absolute top-0 left-0 h-full bg-primary-blue transition-all"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.5}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="bg-[#08090d]/95 backdrop-blur-2xl border-t border-white/5 px-6 py-3 flex items-center gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-[260px] flex-shrink-0">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm truncate">{currentSong.title}</h4>
            <p className="text-slate-400 text-xs truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => toggleFavorite && toggleFavorite(currentSong)}
            className={`ml-2 flex-shrink-0 transition-colors ${isLiked ? 'text-pink-500' : 'text-slate-500 hover:text-white'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center flex-1 gap-1">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsShuffling((s) => !s)}
              className={`transition-colors ${isShuffling ? 'text-primary-blue' : 'text-slate-400 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button onClick={handlePrev} className="text-slate-300 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-current" />
              ) : (
                <Play className="w-5 h-5 text-black fill-current ml-0.5" />
              )}
            </button>

            <button onClick={handleNext} className="text-slate-300 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => setIsRepeating((r) => !r)}
              className={`transition-colors ${isRepeating ? 'text-primary-blue' : 'text-slate-400 hover:text-white'}`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 w-full max-w-xs justify-center">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <span>/</span>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-[200px] justify-end flex-shrink-0">
          <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="relative w-24 h-1 bg-slate-700 rounded-full group cursor-pointer">
            <div
              className="absolute top-0 left-0 h-full bg-slate-300 group-hover:bg-primary-blue rounded-full transition-colors"
              style={{ width: `${isMuted ? 0 : volume}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-slate-500 text-xs w-7">{isMuted ? 0 : volume}</span>
        </div>
      </div>
    </div>
  );
};

export default Player;
