import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { User, Menu, X } from 'lucide-react';

const Navbar = ({ activeView, setActiveView, onSearch, onPlay }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative mx-4 mt-4 flex items-center justify-between rounded-full border border-primary-blue/30 bg-panel-bg/80 px-6 py-3 text-sm text-white backdrop-blur-md z-40">
      {/* Logo */}
      <a href="/" className="flex-shrink-0 flex items-center justify-center w-1/4 md:w-auto">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-blue to-blue-900 font-bold text-white shadow-[0_0_15px_rgba(0,119,255,0.5)]">
          AK
        </div>
        <span className="ml-3 text-lg font-bold tracking-wider hidden md:block">Music</span>
      </a>

      {/* Centered Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8 justify-center">
        <div className="w-full">
           <SearchBar onSearch={onSearch} onPlay={onPlay} />
        </div>
      </div>

      {/* Profile / Right side */}
      <div className="hidden md:flex items-center justify-end w-1/4 md:w-auto">
        <button className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-full transition-colors border border-transparent hover:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-600">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <span className="font-medium text-slate-300">Guest</span>
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-slate-300 hover:text-white"
        aria-label="Toggle Menu"
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 top-full z-50 mt-4 w-full overflow-hidden rounded-3xl border border-primary-blue/30 bg-panel-bg transition-all duration-300 md:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-6 p-6">
          <SearchBar 
            onSearch={(q) => { onSearch(q); setMenuOpen(false); }} 
            onPlay={(s) => { onPlay(s); setMenuOpen(false); }} 
          />
          
          <div className="flex flex-col gap-4">
            {["Home", "Favorites", "Recent"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveView(item);
                  setMenuOpen(false);
                }}
                className={`text-lg font-medium text-left transition ${item === activeView ? 'text-primary-blue' : 'text-slate-300 hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <hr className="border-slate-800" />
          
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
              <User className="w-6 h-6" />
            </div>
            <span className="font-medium">Guest User</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;