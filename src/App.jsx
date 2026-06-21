import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/navbar';
import Sidebar from './components/Sidebar';
import SongList from './components/SongList';
import Player from './components/Player';
import AuthModal from './components/AuthModal';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import { 
  searchMusic, 
  getTrendingMusic, 
  searchArtists, 
  searchPlaylists, 
  searchAlbums,
  getArtistSongs, 
  getPlaylistSongs,
  getAlbumSongs
} from './utils/api';
import { Play, Music, Users, ListMusic, Disc } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [homeData, setHomeData] = useState([]);
  const [homeAlbums, setHomeAlbums] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Views: 'Home', 'Favorites', 'Recent', 'Trending', 'Artists', 'Albums', 'Playlists'
  const [activeView, setActiveView] = useState('Home'); 
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('spotifyFavorites')) || [];
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    return JSON.parse(localStorage.getItem('spotifyRecent')) || [];
  });

  // Featured lists for Artists, Albums, & Playlists
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [featuredAlbums, setFeaturedAlbums] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  
  // Selected detail view lists
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [trendingSongs, setTrendingSongs] = useState([]);

  // Popular Tamil artists with real IDs
  const popularTamilArtists = [
    { id: '455663', name: 'Anirudh Ravichander', thumbnail: 'https://c.saavncdn.com/artists/Anirudh_Ravichander_003_20260121134149_150x150.jpg' },
    { id: '456269', name: 'A.R. Rahman', thumbnail: 'https://c.saavncdn.com/artists/A_R_Rahman_004_20260121133346_150x150.jpg' },
    { id: '455480', name: 'Yuvan Shankar Raja', thumbnail: 'https://c.saavncdn.com/artists/Yuvan_Shankar_Raja_005_20251121124403_150x150.jpg' },
    { id: '455481', name: 'Harris Jayaraj', thumbnail: 'https://c.saavncdn.com/artists/Harris_Jayaraj_150x150.jpg' },
    { id: '456076', name: 'Sid Sriram', thumbnail: 'https://c.saavncdn.com/artists/Sid_Sriram_004_20260121134444_150x150.jpg' },
    { id: '456860', name: 'Ilaiyaraaja', thumbnail: 'https://c.saavncdn.com/artists/Ilaiyaraaja_150x150.jpg' }
  ];

  // Popular English artists with real IDs
  const popularEnglishArtists = [
    { id: '565990', name: 'Taylor Swift', thumbnail: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_150x150.jpg' },
    { id: '578407', name: 'Ed Sheeran', thumbnail: 'https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_150x150.jpg' },
    { id: '1918741', name: 'Billie Eilish', thumbnail: 'https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_150x150.jpg' },
    { id: '610240', name: 'Eminem', thumbnail: 'https://c.saavncdn.com/artists/Eminem_003_20240403152835_150x150.jpg' },
    { id: '615155', name: 'The Weeknd', thumbnail: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_150x150.jpg' },
    { id: '568565', name: 'Justin Bieber', thumbnail: 'https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_150x150.jpg' }
  ];

  // Restores user session on initial load
  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('http://localhost:5000/api/auth/me')
        .then(res => {
          if (res.data && res.data.user) {
            setUser(res.data.user);
            setFavorites(res.data.user.favorites || []);
            setRecentlyPlayed(res.data.user.recent || []);
          }
        })
        .catch(err => {
          console.error('Session restore failed', err);
          localStorage.removeItem('spotifyToken');
          delete axios.defaults.headers.common['Authorization'];
        });
    }
  }, []);

  // Save guest lists to local storage only if not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('spotifyFavorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('spotifyRecent', JSON.stringify(recentlyPlayed));
    }
  }, [recentlyPlayed, user]);

  const handleAuthSuccess = async (userData, token) => {
    localStorage.setItem('spotifyToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);

    // Merge logic: merge local guest storage items into DB
    const localFavs = JSON.parse(localStorage.getItem('spotifyFavorites')) || [];
    const localRecent = JSON.parse(localStorage.getItem('spotifyRecent')) || [];

    const mergedFavs = [...userData.favorites];
    localFavs.forEach(song => {
      if (!mergedFavs.find(s => s.id === song.id)) {
        mergedFavs.push(song);
      }
    });

    const mergedRecent = [...userData.recent];
    localRecent.forEach(song => {
      if (!mergedRecent.find(s => s.id === song.id)) {
        mergedRecent.push(song);
      }
    });

    setFavorites(mergedFavs);
    setRecentlyPlayed(mergedRecent);

    // Save merged lists to the database
    try {
      await Promise.all([
        axios.post('http://localhost:5000/api/auth/favorites', { favorites: mergedFavs }),
        axios.post('http://localhost:5000/api/auth/recent', { recent: mergedRecent })
      ]);
    } catch (e) {
      console.error('Failed to sync merged lists to database', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spotifyToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    // Revert back to local guest storage
    setFavorites(JSON.parse(localStorage.getItem('spotifyFavorites')) || []);
    setRecentlyPlayed(JSON.parse(localStorage.getItem('spotifyRecent')) || []);
  };

  const handleCreatePlaylist = () => {
    setIsCreatePlaylistOpen(true);
  };

  const handleCreatePlaylistSubmit = async (name) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/playlists', { name });
      if (res.data && res.data.playlists) {
        setUser(prev => ({ ...prev, playlists: res.data.playlists }));
      }
    } catch (err) {
      console.error('Failed to create playlist', err);
      alert('Error creating playlist. Please try again.');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/auth/playlists/${playlistId}`);
      if (res.data && res.data.playlists) {
        setUser(prev => ({ ...prev, playlists: res.data.playlists }));
        if (activeView === `custom-${playlistId}`) {
          setActiveView('Home');
        }
      }
    } catch (err) {
      console.error('Failed to delete playlist', err);
      alert('Error deleting playlist.');
    }
  };

  const handleAddToPlaylist = async (playlistId, song) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/playlists/${playlistId}/songs`, { song });
      if (res.data && res.data.playlists) {
        setUser(prev => ({ ...prev, playlists: res.data.playlists }));
        alert('Song added to playlist!');
      }
    } catch (err) {
      console.error('Failed to add song to playlist', err);
      alert(err.response?.data?.message || 'Error adding song to playlist.');
    }
  };

  const handleRemoveFromPlaylist = async (playlistId, songId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/auth/playlists/${playlistId}/songs/${songId}`);
      if (res.data && res.data.playlists) {
        setUser(prev => ({ ...prev, playlists: res.data.playlists }));
      }
    } catch (err) {
      console.error('Failed to remove song from playlist', err);
      alert('Error removing song from playlist.');
    }
  };

  const toggleFavorite = async (song) => {
    const updatedFavs = (() => {
      const isFav = favorites.find(s => s.id === song.id);
      if (isFav) return favorites.filter(s => s.id !== song.id);
      return [song, ...favorites];
    })();
    
    setFavorites(updatedFavs);

    if (user) {
      try {
        await axios.post('http://localhost:5000/api/auth/favorites', { favorites: updatedFavs });
      } catch (err) {
        console.error('Failed to sync favorite song', err);
      }
    }
  };

  const addToRecent = async (song) => {
    const updatedRecent = (() => {
      const filtered = recentlyPlayed.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 50);
    })();

    setRecentlyPlayed(updatedRecent);

    if (user) {
      try {
        await axios.post('http://localhost:5000/api/auth/recent', { recent: updatedRecent });
      } catch (err) {
        console.error('Failed to sync recent play', err);
      }
    }
  };

  // Fetch initial home data & search categories (focused on Tamil Trending)
  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const [trending, pop, edm, albums] = await Promise.all([
          getTrendingMusic(),
          searchMusic('Latest Tamil Hits'),
          searchMusic('Tamil Melodies'),
          searchAlbums('Tamil')
        ]);
        
        setHomeData([
          { title: 'Tamil Trending Hits', songs: trending },
          { title: 'Latest Tamil Hits', songs: pop },
          { title: 'Tamil Melody Hits', songs: edm }
        ]);

        setTrendingSongs(trending);
        setHomeAlbums(albums.slice(0, 5));
      } catch (error) {
        console.error('Failed to load home data', error);
      }
      setIsLoading(false);
    };

    fetchHomeData();
    // Default featured lists
    setFeaturedArtists(popularTamilArtists);
    
    // Fetch default playlists & albums
    searchPlaylists('Tamil').then(res => {
      if (res && res.length > 0) {
        setFeaturedPlaylists(res);
      }
    });

    searchAlbums('Tamil').then(res => {
      if (res && res.length > 0) {
        setFeaturedAlbums(res);
      }
    });
  }, []);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setSearchQuery(query);
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedPlaylist(null);

    if (activeView === 'Artists') {
      const artists = await searchArtists(query);
      setFeaturedArtists(artists);
    } else if (activeView === 'Playlists') {
      const playlists = await searchPlaylists(query);
      setFeaturedPlaylists(playlists);
    } else if (activeView === 'Albums') {
      const albums = await searchAlbums(query);
      setFeaturedAlbums(albums);
    } else {
      const data = await searchMusic(query);
      setSearchResults(data);
    }
    setIsLoading(false);
  };

  const handlePlay = (songData) => {
    setCurrentSong(songData);
    addToRecent(songData);
  };

  const handleSelectArtist = async (artist) => {
    setIsLoading(true);
    setSelectedArtist(artist);
    const songs = await getArtistSongs(artist.id);
    setSelectedArtist(prev => ({ ...prev, songs }));
    setIsLoading(false);
  };

  const handleSelectPlaylist = async (playlist) => {
    setIsLoading(true);
    setSelectedPlaylist(playlist);
    const songs = await getPlaylistSongs(playlist.id);
    setSelectedPlaylist(prev => ({ ...prev, songs }));
    setIsLoading(false);
  };

  const handleSelectAlbum = async (album) => {
    setIsLoading(true);
    setSelectedAlbum(album);
    const songs = await getAlbumSongs(album.id);
    setSelectedAlbum(prev => ({ ...prev, songs }));
    setIsLoading(false);
  };

  const currentSongList = activeView === 'Favorites' ? favorites :
                          activeView === 'Recent' ? recentlyPlayed :
                          activeView === 'Trending' ? trendingSongs :
                          activeView.startsWith('custom-') ? (user?.playlists?.find(p => `custom-${p._id}` === activeView)?.songs || []) :
                          selectedArtist?.songs ? selectedArtist.songs :
                          selectedAlbum?.songs ? selectedAlbum.songs :
                          selectedPlaylist?.songs ? selectedPlaylist.songs :
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
          setActiveView={(view) => {
            setActiveView(view);
            setSearchResults(null);
            setSelectedArtist(null);
            setSelectedAlbum(null);
            setSelectedPlaylist(null);
            setSearchQuery('');
          }} 
          onSearch={handleSearch} 
          onPlay={handlePlay} 
          user={user}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        <div className="flex w-full mt-2">
          <Sidebar 
            activeView={activeView} 
            setActiveView={(view) => {
              setActiveView(view);
              setSearchResults(null);
              setSelectedArtist(null);
              setSelectedAlbum(null);
              setSelectedPlaylist(null);
              setSearchQuery('');
            }} 
            user={user}
            onPlaylistSelect={(playlist) => {
              setActiveView(`custom-${playlist._id}`);
              setSearchResults(null);
              setSelectedArtist(null);
              setSelectedAlbum(null);
              setSelectedPlaylist(null);
              setSearchQuery('');
            }}
            onCreatePlaylist={handleCreatePlaylist}
          />
          
          <main className="flex-1 px-4 py-8 md:px-8 w-full max-w-[1200px] mx-auto">
            
            {/* Search Results */}
            {searchResults && (
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
                <SongList 
                  songs={searchResults} 
                  onPlay={handlePlay} 
                  isLoading={isLoading} 
                  user={user}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              </div>
            )}

             {!searchResults && (
              <>
                {/* Custom User Playlist View */}
                {activeView.startsWith('custom-') && (
                  (() => {
                    const playlistId = activeView.replace('custom-', '');
                    const playlist = user?.playlists?.find(p => p._id === playlistId);
                    if (!playlist) return <div className="text-slate-400">Playlist not found.</div>;
                    
                    return (
                      <div className="mb-8 animate-fadeIn">
                        <div className="flex items-center justify-between mb-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-primary-blue font-bold">Custom Playlist</span>
                            <h2 className="text-3xl md:text-5xl font-black mt-1">{playlist.name}</h2>
                            <p className="text-slate-400 text-xs mt-2">{playlist.songs?.length || 0} Songs</p>
                          </div>
                          <button 
                            onClick={() => handleDeletePlaylist(playlist._id)}
                            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors border border-red-500/20 hover:border-red-500/50 rounded-full px-4 py-1.5 bg-red-500/5"
                          >
                            Delete Playlist
                          </button>
                        </div>
                        <SongList 
                          songs={playlist.songs || []} 
                          onPlay={handlePlay} 
                          isLoading={false} 
                          user={user}
                          isCustomPlaylist={true}
                          onRemoveFromPlaylist={(songId) => handleRemoveFromPlaylist(playlist._id, songId)}
                        />
                      </div>
                    );
                  })()
                )}

                {/* Favorites View */}
                {activeView === 'Favorites' && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="w-2 h-8 bg-pink-500 rounded-full mr-3 inline-block"></span>
                      Your Favorites
                    </h2>
                    <SongList 
                      songs={favorites} 
                      onPlay={handlePlay} 
                      isLoading={false} 
                      user={user}
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  </div>
                )}

                {/* Recent Plays View */}
                {activeView === 'Recent' && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="w-2 h-8 bg-purple-500 rounded-full mr-3 inline-block"></span>
                      Recently Played
                    </h2>
                    <SongList 
                      songs={recentlyPlayed} 
                      onPlay={handlePlay} 
                      isLoading={false} 
                      user={user}
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  </div>
                )}

                {/* Trending View */}
                {activeView === 'Trending' && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="w-2 h-8 bg-orange-500 rounded-full mr-3 inline-block"></span>
                      Tamil Trending Hits
                    </h2>
                    <SongList 
                      songs={trendingSongs} 
                      onPlay={handlePlay} 
                      isLoading={isLoading} 
                      user={user}
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  </div>
                )}

                {/* Artists View */}
                {activeView === 'Artists' && (
                  <div>
                    {selectedArtist ? (
                      <div>
                        <button 
                          onClick={() => setSelectedArtist(null)}
                          className="mb-6 text-sm text-slate-400 hover:text-white transition border border-slate-800 rounded-full px-4 py-1.5"
                        >
                          ← Back to Artists
                        </button>
                        <div className="flex items-center gap-6 mb-8 bg-white/5 p-6 rounded-3xl border border-white/5">
                          <img 
                            src={selectedArtist.thumbnail} 
                            alt={selectedArtist.name} 
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-2xl border-2 border-primary-blue"
                          />
                          <div>
                            <span className="text-xs uppercase tracking-widest text-primary-blue font-bold">Artist</span>
                            <h2 className="text-3xl md:text-5xl font-black mt-1">{selectedArtist.name}</h2>
                          </div>
                        </div>
                        <SongList 
                          songs={selectedArtist.songs || []} 
                          onPlay={handlePlay} 
                          isLoading={isLoading} 
                          user={user}
                          onAddToPlaylist={handleAddToPlaylist}
                        />
                      </div>
                    ) : (
                      <div>
                        {searchQuery ? (
                          <>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                              <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3 inline-block"></span>
                              Search Results for "{searchQuery}"
                            </h2>
                            {isLoading ? (
                              <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {featuredArtists.map((artist) => (
                                  <div 
                                    key={artist.id}
                                    onClick={() => handleSelectArtist(artist)}
                                    className="bg-panel-bg/40 border border-white/5 hover:border-primary-blue/30 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,119,255,0.1)] group"
                                  >
                                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 shadow-lg relative">
                                      <img 
                                        src={artist.thumbnail || 'https://via.placeholder.com/150'} 
                                        alt={artist.name}
                                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                      />
                                    </div>
                                    <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary-blue transition-colors">{artist.name}</h3>
                                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Artist</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                              <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3 inline-block"></span>
                              Popular Tamil Artists
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-10">
                              {popularTamilArtists.map((artist) => (
                                <div 
                                  key={artist.id}
                                  onClick={() => handleSelectArtist(artist)}
                                  className="bg-panel-bg/40 border border-white/5 hover:border-primary-blue/30 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,119,255,0.1)] group"
                                >
                                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 shadow-lg relative">
                                    <img 
                                      src={artist.thumbnail || 'https://via.placeholder.com/150'} 
                                      alt={artist.name}
                                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                  </div>
                                  <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary-blue transition-colors">{artist.name}</h3>
                                  <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Artist</span>
                                </div>
                              ))}
                            </div>

                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                              <span className="w-2 h-8 bg-purple-500 rounded-full mr-3 inline-block"></span>
                              Popular English Artists
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                              {popularEnglishArtists.map((artist) => (
                                <div 
                                  key={artist.id}
                                  onClick={() => handleSelectArtist(artist)}
                                  className="bg-panel-bg/40 border border-white/5 hover:border-primary-blue/30 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,119,255,0.1)] group"
                                >
                                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 shadow-lg relative">
                                    <img 
                                      src={artist.thumbnail || 'https://via.placeholder.com/150'} 
                                      alt={artist.name}
                                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                  </div>
                                  <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary-blue transition-colors">{artist.name}</h3>
                                  <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Artist</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Albums View */}
                {activeView === 'Albums' && (
                  <div>
                    {selectedAlbum ? (
                      <div>
                        <button 
                          onClick={() => setSelectedAlbum(null)}
                          className="mb-6 text-sm text-slate-400 hover:text-white transition border border-slate-800 rounded-full px-4 py-1.5"
                        >
                          ← Back to Albums
                        </button>
                        <div className="flex items-center gap-6 mb-8 bg-white/5 p-6 rounded-3xl border border-white/5">
                          <img 
                            src={selectedAlbum.thumbnail} 
                            alt={selectedAlbum.name} 
                            className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover shadow-2xl border border-primary-blue/20"
                          />
                          <div>
                            <span className="text-xs uppercase tracking-widest text-primary-blue font-bold">Album</span>
                            <h2 className="text-3xl md:text-5xl font-black mt-1">{selectedAlbum.name}</h2>
                            <p className="text-slate-400 text-sm mt-2">By {selectedAlbum.artist}</p>
                            <p className="text-slate-500 text-xs mt-1">{selectedAlbum.year}</p>
                          </div>
                        </div>
                        <SongList 
                          songs={selectedAlbum.songs || []} 
                          onPlay={handlePlay} 
                          isLoading={isLoading} 
                          user={user}
                          onAddToPlaylist={handleAddToPlaylist}
                        />
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                          <span className="w-2 h-8 bg-sky-500 rounded-full mr-3 inline-block"></span>
                          Popular Tamil Albums
                        </h2>
                        {isLoading ? (
                          <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {featuredAlbums.map((album) => (
                              <div 
                                key={album.id}
                                onClick={() => handleSelectAlbum(album)}
                                className="bg-panel-bg/40 border border-white/5 hover:border-primary-blue/30 rounded-3xl p-4 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,119,255,0.1)] group"
                              >
                                <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg relative">
                                  <img 
                                    src={album.thumbnail || 'https://via.placeholder.com/150'} 
                                    alt={album.name}
                                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                </div>
                                <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary-blue transition-colors">{album.name}</h3>
                                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{album.artist}</span>
                                <span className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Album • {album.year}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Playlists View */}
                {activeView === 'Playlists' && (
                  <div>
                    {selectedPlaylist ? (
                      <div>
                        <button 
                          onClick={() => setSelectedPlaylist(null)}
                          className="mb-6 text-sm text-slate-400 hover:text-white transition border border-slate-800 rounded-full px-4 py-1.5"
                        >
                          ← Back to Playlists
                        </button>
                        <div className="flex items-center gap-6 mb-8 bg-white/5 p-6 rounded-3xl border border-white/5">
                          <img 
                            src={selectedPlaylist.thumbnail} 
                            alt={selectedPlaylist.name} 
                            className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover shadow-2xl border border-primary-blue/20"
                          />
                          <div>
                            <span className="text-xs uppercase tracking-widest text-primary-blue font-bold">Playlist</span>
                            <h2 className="text-3xl md:text-5xl font-black mt-1">{selectedPlaylist.name}</h2>
                            <p className="text-slate-400 text-xs mt-2">{selectedPlaylist.songCount} Songs • {selectedPlaylist.language}</p>
                          </div>
                        </div>
                        <SongList 
                          songs={selectedPlaylist.songs || []} 
                          onPlay={handlePlay} 
                          isLoading={isLoading} 
                          user={user}
                          onAddToPlaylist={handleAddToPlaylist}
                        />
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                          <span className="w-2 h-8 bg-blue-500 rounded-full mr-3 inline-block"></span>
                          Popular Tamil Playlists
                        </h2>
                        {isLoading ? (
                          <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {featuredPlaylists.map((playlist) => (
                              <div 
                                key={playlist.id}
                                onClick={() => handleSelectPlaylist(playlist)}
                                className="bg-panel-bg/40 border border-white/5 hover:border-primary-blue/30 rounded-3xl p-4 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,119,255,0.1)] group"
                              >
                                <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg relative">
                                  <img 
                                    src={playlist.thumbnail || 'https://via.placeholder.com/150'} 
                                    alt={playlist.name}
                                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                </div>
                                <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary-blue transition-colors">{playlist.name}</h3>
                                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Playlist • {playlist.songCount} Songs</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Home View */}
                {activeView === 'Home' && (
                  <div className="flex flex-col gap-8">
                    {isLoading && homeData.length === 0 ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                      </div>
                    ) : (
                      <>
                        {homeData.map((category, index) => (
                          <div key={index} className="mb-4">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                              <span className="w-2 h-8 bg-primary-blue rounded-full mr-3 inline-block"></span>
                              {category.title}
                            </h2>
                            <SongList 
                              songs={category.songs} 
                              onPlay={handlePlay} 
                              isLoading={false} 
                              user={user}
                              onAddToPlaylist={handleAddToPlaylist}
                            />
                          </div>
                        ))}

                        {homeAlbums.length > 0 && (
                          <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                              <span className="w-2 h-8 bg-sky-500 rounded-full mr-3 inline-block"></span>
                              Trending Tamil Albums
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                              {homeAlbums.map((album) => (
                                <div 
                                  key={album.id}
                                  onClick={() => {
                                    setActiveView('Albums');
                                    handleSelectAlbum(album);
                                  }}
                                  className="bg-panel-bg/40 border border-white/5 hover:border-primary-blue/30 rounded-3xl p-4 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,119,255,0.1)] group"
                                >
                                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg relative">
                                    <img 
                                      src={album.thumbnail || 'https://via.placeholder.com/150'} 
                                      alt={album.name}
                                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                  </div>
                                  <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary-blue transition-colors">{album.name}</h3>
                                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{album.artist}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
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
        user={user}
        onAddToPlaylist={handleAddToPlaylist}
      />

      <CreatePlaylistModal 
        isOpen={isCreatePlaylistOpen} 
        onClose={() => setIsCreatePlaylistOpen(false)} 
        onCreate={handleCreatePlaylistSubmit} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </div>
  );
}

export default App;