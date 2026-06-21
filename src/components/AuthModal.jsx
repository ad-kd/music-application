import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      const payload = isLogin ? { email, password } : { username, email, password };

      const response = await axios.post(endpoint, payload);
      
      if (response.data && response.data.token) {
        onAuthSuccess(response.data.user, response.data.token);
        onClose();
      }
    } catch (err) {
      console.error('Auth error details:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTab = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-panel-bg/90 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Log in to your account to sync your music' : 'Join us to curate and save your music experience'}
          </p>
        </div>

        {/* Form Error */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username (Signup Only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  required
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-black/30 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email"
                required
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-black/30 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-black/30 py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-primary-blue/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed mt-6 flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Tab Toggle Link */}
        <div className="text-center mt-6 text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={toggleTab}
            className="font-bold text-primary-blue hover:underline bg-transparent border-none cursor-pointer"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
