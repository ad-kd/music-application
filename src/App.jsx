import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import Player from './components/Player';
import { searchMusic, getTrendingMusic } from './utils/api';

const App = () => {
  const [homeData, setHomeData] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New state for Spotify-like functionality
  const [activeView, setActiveView] = useState('Home'); // 'Home', 'Favorites', 'Recent'
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('spotifyFavorites')) || [];
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    return JSON.parse(localStorage.getItem('spotifyRecent')) || [];
  });

  useEffect(() => {
    localStorage.setItem('spotifyFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('spotifyRecent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  const toggleFavorite = (song) => {
    setFavorites(prev => {
      const isFav = prev.find(s => s.id === song.id);
      if (isFav) return prev.filter(s => s.id !== song.id);
      return [song, ...prev];
    });
  };

  const addToRecent = (song) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 50); // Keep last 50
    });
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const [trending, pop, edm] = await Promise.all([
          getTrendingMusic(),
          searchMusic('Top Pop Music Hits'),
          searchMusic('Best EDM & Dance Music')
        ]);
        
        setHomeData([
          { title: 'Trending Hits', songs: trending },
          { title: 'Pop Anthems', songs: pop },
          { title: 'EDM & Dance', songs: edm }
        ]);
      } catch (error) {
        console.error('Failed to load home data', error);
      }
      setIsLoading(false);
    };
    fetchHomeData();
  }, []);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setSearchQuery(query);
    const data = await searchMusic(query);
    setSearchResults(data);
    setIsLoading(false);
  };

  const handlePlay = (songData) => {
    setCurrentSong(songData);
    addToRecent(songData);
  };

  // Create a flat list of songs for the player so skip/next works across the whole active view
  const currentSongList = activeView === 'Favorites' ? favorites :
                          activeView === 'Recent' ? recentlyPlayed :
                          searchResults ? searchResults : 
                          homeData.flatMap(category => category.songs);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col font-sans text-white selection:bg-primary-blue/30 selection:text-white pb-24">
      {/* Background gradients for aesthetics */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-blue/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        <Navbar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onSearch={(q) => { setActiveView('Home'); handleSearch(q); }} 
          onPlay={handlePlay} 
        />

        <div className="flex w-full mt-2">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          
          <main className="flex-1 px-4 py-8 md:px-8 w-full max-w-[1200px] mx-auto">
            
            {activeView === 'Favorites' ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-2 h-8 bg-pink-500 rounded-full mr-3 inline-block"></span>
                  Your Favorites
                </h2>
                <SongList songs={favorites} onPlay={handlePlay} isLoading={false} />
              </div>
            ) : activeView === 'Recent' ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-2 h-8 bg-purple-500 rounded-full mr-3 inline-block"></span>
                  Recently Played
                </h2>
                <SongList songs={recentlyPlayed} onPlay={handlePlay} isLoading={false} />
              </div>
            ) : searchResults ? (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <span className="w-2 h-8 bg-primary-blue rounded-full mr-3 inline-block"></span>
                    Search Results for "{searchQuery}"
                  </h2>
                  <button 
                    onClick={() => setSearchResults(null)}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 rounded-full px-4 py-1.5"
                  >
                    Clear Search
                  </button>
                </div>
                <SongList songs={searchResults} onPlay={handlePlay} isLoading={isLoading} />
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {isLoading && homeData.length === 0 ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                  </div>
                ) : (
                  homeData.map((category, index) => (
                    <div key={index} className="mb-4">
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <span className="w-2 h-8 bg-primary-blue rounded-full mr-3 inline-block"></span>
                        {category.title}
                      </h2>
                      <SongList songs={category.songs} onPlay={handlePlay} isLoading={false} />
                    </div>
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <Player 
        currentSong={currentSong} 
        songList={currentSongList} 
        onSongChange={handlePlay} 
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
    </div>
  );
}

export default App;