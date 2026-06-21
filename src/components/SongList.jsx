import React, { useState } from 'react';
import { Play, Plus, Trash2 } from 'lucide-react';

const SongList = ({ songs, onPlay, isLoading, user, onAddToPlaylist, onRemoveFromPlaylist, isCustomPlaylist }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="text-center text-slate-400 mt-12">
        <p>No songs found. Try searching for something else.</p>
      </div>
    );
  }

  const toggleDropdown = (e, songId) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === songId ? null : songId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
      {songs.map((song) => {
        if (!song || !song.id) return null;

        return (
          <div 
            key={song.id} 
            className="group relative bg-panel-bg/50 rounded-2xl p-4 border border-primary-blue/10 hover:border-primary-blue/50 hover:bg-panel-bg transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,119,255,0.15)]"
            onClick={() => onPlay(song)}
          >
            <div className="relative overflow-hidden rounded-xl aspect-video mb-4">
              <img 
                src={song.thumbnail} 
                alt={song.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,119,255,0.6)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            </div>
            
            <div className="pr-8">
              <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-primary-blue transition-colors">
                {song.title}
              </h3>
              <p className="text-slate-400 text-xs">
                {song.artist}
              </p>
            </div>

            {/* Actions (Add / Remove) */}
            <div className="absolute right-4 bottom-4 z-20">
              {isCustomPlaylist ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromPlaylist(song.id);
                  }}
                  className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Remove from Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                user && user.playlists && user.playlists.length > 0 && (
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown(e, song.id)}
                      className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Add to Playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    
                    {activeDropdown === song.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl border border-slate-800 bg-panel-bg p-2 shadow-2xl z-50">
                        <div className="px-3 py-1.5 text-xs text-slate-500 border-b border-slate-800/60 font-semibold mb-1">
                          Add to:
                        </div>
                        <ul className="max-h-32 overflow-y-auto">
                          {user.playlists.map((playlist) => (
                            <li key={playlist._id}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToPlaylist(playlist._id, song);
                                  setActiveDropdown(null);
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
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SongList;
