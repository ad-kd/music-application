import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'music_app_super_secret_key_123';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favorites,
        recent: user.recent
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favorites,
        recent: user.recent
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: req.user
  });
});

// Sync favorites
router.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const { favorites } = req.body;
    req.user.favorites = favorites;
    await req.user.save();
    res.json({ favorites: req.user.favorites });
  } catch (error) {
    console.error('Sync favorites error:', error);
    res.status(500).json({ message: 'Failed to sync favorites' });
  }
});

// Sync recent plays
router.post('/recent', authenticateToken, async (req, res) => {
  try {
    const { recent } = req.body;
    req.user.recent = recent;
    await req.user.save();
    res.json({ recent: req.user.recent });
  } catch (error) {
    console.error('Sync recent error:', error);
    res.status(500).json({ message: 'Failed to sync recent plays' });
  }
});

// Create a custom playlist
router.post('/playlists', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Playlist name is required' });
    }
    
    req.user.playlists.push({ name, songs: [] });
    await req.user.save();
    
    res.status(201).json({ playlists: req.user.playlists });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ message: 'Failed to create playlist' });
  }
});

// Delete a custom playlist
router.delete('/playlists/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    req.user.playlists = req.user.playlists.filter(p => p._id.toString() !== playlistId);
    await req.user.save();
    
    res.json({ playlists: req.user.playlists });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ message: 'Failed to delete playlist' });
  }
});

// Add a song to a custom playlist
router.post('/playlists/:playlistId/songs', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { song } = req.body;
    
    const playlist = req.user.playlists.id(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if song already exists in the playlist
    const songExists = playlist.songs.find(s => s.id === song.id);
    if (songExists) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }
    
    playlist.songs.push(song);
    await req.user.save();
    
    res.json({ playlists: req.user.playlists });
  } catch (error) {
    console.error('Add song to playlist error:', error);
    res.status(500).json({ message: 'Failed to add song to playlist' });
  }
});

// Remove a song from a custom playlist
router.delete('/playlists/:playlistId/songs/:songId', authenticateToken, async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    
    const playlist = req.user.playlists.id(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    playlist.songs = playlist.songs.filter(s => s.id !== songId);
    await req.user.save();
    
    res.json({ playlists: req.user.playlists });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    res.status(500).json({ message: 'Failed to remove song' });
  }
});

export default router;
