import axios from 'axios';

const api = axios.create({
  baseURL: 'https://saavn.sumit.co/api',
});

const formatSong = (song) => {
  const thumbnail = song.image && song.image.length > 0 
    ? song.image[song.image.length - 1].url 
    : '';

  let artist = 'Unknown Artist';
  if (song.artists && song.artists.primary && song.artists.primary.length > 0) {
    artist = song.artists.primary.map(a => a.name).join(', ');
  } else if (song.artists && song.artists.all && song.artists.all.length > 0) {
    artist = song.artists.all.map(a => a.name).join(', ');
  }

  let downloadUrl = '';
  if (song.downloadUrl && song.downloadUrl.length > 0) {
    downloadUrl = song.downloadUrl[song.downloadUrl.length - 1].url;
  }

  return {
    id: song.id,
    title: song.name,
    thumbnail,
    artist,
    downloadUrl,
    duration: song.duration
  };
};

export const searchMusic = async (query) => {
  try {
    const response = await api.get('/search/songs', {
      params: {
        query: query,
        limit: 15,
      },
    });
    
    if (response.data && response.data.data && response.data.data.results) {
       return response.data.data.results.map(formatSong);
    }
    return [];
  } catch (error) {
    console.error('Error fetching music:', error);
    return [];
  }
};

export const getTrendingMusic = async () => {
  try {
    const response = await api.get('/search/songs', {
      params: {
        query: 'Tamil Trending Hits',
        limit: 20,
      },
    });
    
    if (response.data && response.data.data && response.data.data.results) {
       return response.data.data.results.map(formatSong);
    }
    return [];
  } catch (error) {
    console.error('Error fetching trending music:', error);
    return [];
  }
};

export const searchArtists = async (query) => {
  try {
    const response = await api.get('/search/artists', {
      params: {
        query: query,
        limit: 15,
      },
    });
    if (response.data && response.data.data && response.data.data.results) {
      return response.data.data.results.map(artist => ({
        id: artist.id,
        name: artist.name,
        thumbnail: artist.image && artist.image.length > 0 ? artist.image[artist.image.length - 1].url : '',
        role: artist.role,
        type: artist.type
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
};

export const searchPlaylists = async (query) => {
  try {
    const response = await api.get('/search/playlists', {
      params: {
        query: query,
        limit: 15,
      },
    });
    if (response.data && response.data.data && response.data.data.results) {
      return response.data.data.results.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        thumbnail: playlist.image && playlist.image.length > 0 ? playlist.image[playlist.image.length - 1].url : '',
        songCount: playlist.songCount,
        language: playlist.language,
        type: playlist.type
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching playlists:', error);
    return [];
  }
};

export const searchAlbums = async (query) => {
  try {
    const response = await api.get('/search/albums', {
      params: {
        query: query,
        limit: 15,
      },
    });
    if (response.data && response.data.data && response.data.data.results) {
      return response.data.data.results.map(album => ({
        id: album.id,
        name: album.name,
        thumbnail: album.image && album.image.length > 0 ? album.image[album.image.length - 1].url : '',
        year: album.year,
        type: album.type,
        artist: album.artists && album.artists.primary && album.artists.primary.length > 0 ? album.artists.primary[0].name : 'Various Artists'
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching albums:', error);
    return [];
  }
};

export const getArtistSongs = async (artistId) => {
  try {
    const response = await api.get(`/artists/${artistId}/songs`);
    if (response.data && response.data.data && response.data.data.songs) {
      return response.data.data.songs.map(formatSong);
    }
    return [];
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    return [];
  }
};

export const getPlaylistSongs = async (playlistId) => {
  try {
    const response = await api.get('/playlists', {
      params: {
        id: playlistId
      }
    });
    if (response.data && response.data.data && response.data.data.songs) {
      return response.data.data.songs.map(formatSong);
    }
    return [];
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    return [];
  }
};

export const getAlbumSongs = async (albumId) => {
  try {
    const response = await api.get('/albums', {
      params: {
        id: albumId
      }
    });
    if (response.data && response.data.data && response.data.data.songs) {
      return response.data.data.songs.map(formatSong);
    }
    return [];
  } catch (error) {
    console.error('Error fetching album songs:', error);
    return [];
  }
};
