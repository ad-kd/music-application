import axios from 'axios';

// Get the API key (which is a constant string in api.txt)
// For security and simplicity in this example, we import it directly or we hardcode it. 
// Since we have api.txt, I'll provide the logic to fetch it or we can just embed it if we read it earlier.
// Wait, the API key in api.txt is AIzaSyB7mykn8EhN_z4x0ANMl2wGFStEOk-Jin0
const API_KEY = 'AIzaSyDfb2iekMKpyVzHDcynzm3fzMpSna21scU';

const api = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
});

export const searchMusic = async (query) => {
  try {
    const response = await api.get('/search', {
      params: {
        part: 'snippet',
        maxResults: 15,
        q: query,
        type: 'video',
        videoCategoryId: '10',
        videoEmbeddable: 'true',
        key: API_KEY,
      },
    });
    return response.data.items.map(song => ({
      id: song.id.videoId || song.id,
      title: song.snippet.title,
      thumbnail: song.snippet.thumbnails.high.url,
      artist: song.snippet.channelTitle
    })).filter(song => song.id);
  } catch (error) {
    console.error('Error fetching music:', error);
    return [];
  }
};

export const getTrendingMusic = async () => {
    try {
      const response = await api.get('/search', {
        params: {
          part: 'snippet',
          maxResults: 15,
          q: 'Top Hit Songs Global',
          type: 'video',
          videoCategoryId: '10',
          videoEmbeddable: 'true',
          key: API_KEY,
        },
      });
      return response.data.items.map(song => ({
        id: song.id.videoId || song.id,
        title: song.snippet.title,
        thumbnail: song.snippet.thumbnails.high.url,
        artist: song.snippet.channelTitle
      })).filter(song => song.id);
    } catch (error) {
      console.error('Error fetching trending music:', error);
      return [];
    }
  };
