import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SongSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  artist: { type: String, default: 'Unknown Artist' },
  downloadUrl: { type: String, default: '' },
  duration: { type: String, default: '' }
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  favorites: [SongSchema],
  recent: [SongSchema],
  playlists: [{
    name: { type: String, required: true },
    songs: [SongSchema]
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
