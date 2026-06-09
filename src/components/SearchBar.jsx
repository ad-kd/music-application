import React, { useState, useEffect, useRef } from 'react';
import { Search, Play } from 'lucide-react';
import { searchMusic } from '../utils/api';

const SearchBar = ({ onSearch, onPlay }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        const data = await searchMusic(query);
        setResults(data.slice(0, 5)); // Show top 5 in dropdown
        setIsDropdownVisible(true);
        setIsLoading(false);
      } else {
        setResults([]);
        setIsDropdownVisible(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsDropdownVisible(false);
      onSearch(query);
    }
  };

  const handleResultClick = (song) => {
    if (!song.id) return;
    
    setIsDropdownVisible(false);
    onPlay(song);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isDropdownVisible && e.target.value.trim()) setIsDropdownVisible(true);
          }}
          onFocus={() => {
            if (query.trim() && results.length > 0) setIsDropdownVisible(true);
          }}
          className="w-full bg-panel-bg border border-primary-blue/30 text-white text-sm rounded-full focus:ring-2 focus:ring-primary-blue focus:border-transparent block pl-12 p-3.5 transition-all shadow-[0_0_15px_rgba(0,119,255,0.1)] focus:shadow-[0_0_20px_rgba(0,119,255,0.3)] placeholder-slate-500 relative z-10"
          placeholder="Search for songs, artists, or albums..."
          required
        />
        <button type="submit" className="absolute right-2 top-2 bottom-2 bg-primary-blue hover:bg-blue-600 text-white font-medium rounded-full text-sm px-5 transition-colors z-10">
          Search
        </button>
      </div>

      {/* Dropdown Menu */}
      {isDropdownVisible && (query.trim() !== '') && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-panel-bg border border-primary-blue/30 rounded-2xl shadow-2xl overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-slate-400 text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((song) => {
                if (!song.id) return null;
                
                return (
                  <div 
                    key={song.id} 
                    onClick={() => handleResultClick(song)}
                    className="flex items-center p-3 hover:bg-primary-blue/10 cursor-pointer transition-colors border-b border-slate-800 last:border-b-0 group"
                  >
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 mr-4">
                      <img 
                        src={song.thumbnail} 
                        alt={song.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate group-hover:text-primary-blue transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-slate-400 text-xs truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-400 text-sm">No results found</div>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
