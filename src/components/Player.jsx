import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, ListMusic, ChevronDown, Plus } from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const Player = ({ currentSong, songList, onSongChange, favorites, toggleFavorite, user, onAddToPlaylist }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const audioRef = useRef(null);

  const isLiked = currentSong && favorites && favorites.some(s => s.id === currentSong.id);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Handle song change
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.downloadUrl || '';
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });
    }
  }, [currentSong]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
    setCurrentTime(val);
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleNext = useCallback(() => {
    if (!songList || songList.length === 0 || !onSongChange) return;
    const idx = songList.findIndex((s) => s.id === currentSong?.id);
    let nextIdx;
    if (isShuffling) {
      nextIdx = Math.floor(Math.random() * songList.length);
    } else {
      nextIdx = (idx + 1) % songList.length;
    }
    onSongChange(songList[nextIdx]);
  }, [songList, currentSong, isShuffling, onSongChange]);

  const handlePrev = () => {
    if (!songList || songList.length === 0 || !onSongChange) return;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    const idx = songList.findIndex((s) => s.id === currentSong?.id);
    const prevIdx = (idx - 1 + songList.length) % songList.length;
    onSongChange(songList[prevIdx]);
  };

  const handleEnded = () => {
    if (isRepeating) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        preload="auto"
      />

      {/* Slide-out Queue / Up Next Panel */}
      {showQueue && (
        <div className="absolute bottom-[72px] right-4 w-80 max-h-[400px] bg-[#0c0e14]/95 border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col shadow-[0_15px_50px_rgba(0,0,0,0.5)] transition-all duration-300">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary-blue" />
              Queue / Up Next
            </h3>
            <button 
              onClick={() => setShowQueue(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
            {songList && songList.length > 0 ? (
              songList.map((song, i) => {
                const isCurrent = song.id === currentSong.id;
                return (
                  <div
                    key={song.id + i}
                    onClick={() => onSongChange(song)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition ${
                      isCurrent 
                        ? 'bg-primary-blue/15 text-primary-blue border border-primary-blue/10' 
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <img 
                      src={song.thumbnail} 
                      alt={song.title} 
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold text-xs truncate ${isCurrent ? 'text-primary-blue' : 'text-white'}`}>{song.title}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-slate-500 py-6">No songs in queue</p>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
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

      <div className="bg-[#08090d]/95 backdrop-blur-2xl border-t border-white/5 px-4 md:px-6 py-2 md:py-3 flex items-center justify-between gap-2 md:gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 md:w-1/3 min-w-0 flex-1">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-10 h-10 md:w-12 md:h-12 rounded-md md:rounded-lg object-cover shadow-lg flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-semibold text-xs md:text-sm truncate">{currentSong.title}</h4>
            <p className="text-slate-400 text-[10px] md:text-xs truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => toggleFavorite && toggleFavorite(currentSong)}
            className={`flex-shrink-0 transition-colors mr-2 md:mr-0 ${isLiked ? 'text-pink-500' : 'text-slate-500 hover:text-white'}`}
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          {user && user.playlists && user.playlists.length > 0 && (
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistMenu(!showPlaylistMenu);
                }}
                className={`transition-colors mr-2 md:mr-0 ${showPlaylistMenu ? 'text-primary-blue' : 'text-slate-500 hover:text-white'}`}
                title="Add to Playlist"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              {showPlaylistMenu && (
                <div className="absolute left-0 bottom-full mb-3 w-48 rounded-2xl border border-slate-800 bg-[#08090d]/95 p-2 shadow-2xl backdrop-blur-xl z-50">
                  <div className="px-3 py-1.5 text-xs text-slate-500 border-b border-slate-800/60 font-semibold mb-1">
                    Add to Playlist:
                  </div>
                  <ul className="max-h-32 overflow-y-auto">
                    {user.playlists.map((playlist) => (
                      <li key={playlist._id}>
                        <button 
                          onClick={() => {
                            onAddToPlaylist(playlist._id, currentSong);
                            setShowPlaylistMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors truncate"
                        >
                          {playlist.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Controls */}
        <div className="flex items-center md:flex-col md:flex-1 md:max-w-lg md:gap-1">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => setIsShuffling((s) => !s)}
              className={`hidden md:block transition-colors ${isShuffling ? 'text-primary-blue' : 'text-slate-400 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button onClick={handlePrev} className="hidden md:block text-slate-300 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-9 h-9 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 md:w-5 md:h-5 text-black fill-current" />
              ) : (
                <Play className="w-4 h-4 md:w-5 md:h-5 text-black fill-current ml-0.5" />
              )}
            </button>

            <button onClick={handleNext} className="text-slate-300 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 md:w-5 md:h-5 fill-current" />
            </button>

            <button
              onClick={() => setIsRepeating((r) => !r)}
              className={`hidden md:block transition-colors ${isRepeating ? 'text-primary-blue' : 'text-slate-400 hover:text-white'}`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Time */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 w-full max-w-xs justify-center">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <span>/</span>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Queue */}
        <div className="hidden md:flex items-center gap-3 w-1/3 justify-end flex-shrink-0">
          <button 
            onClick={() => setShowQueue(!showQueue)} 
            className={`mr-2 transition-colors ${showQueue ? 'text-primary-blue' : 'text-slate-400 hover:text-white'}`}
            title="Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
          
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
