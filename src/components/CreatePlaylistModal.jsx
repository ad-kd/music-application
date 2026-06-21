import React, { useState } from 'react';
import { X, ListMusic } from 'lucide-react';

const CreatePlaylistModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() === '') return;
    onCreate(name);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-panel-bg/95 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-blue/10 border border-primary-blue/20 rounded-full flex items-center justify-center mx-auto mb-3 text-primary-blue">
            <ListMusic className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Create Playlist</h2>
          <p className="text-sm text-slate-400 mt-1">Curate your perfect collection of tracks</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">Playlist Name</label>
            <input 
              type="text"
              required
              autoFocus
              placeholder="e.g., My Chill Vibes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-black/30 py-3.5 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-800 hover:bg-white/5 text-slate-300 font-bold text-sm transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-primary-blue/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Create
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreatePlaylistModal;
