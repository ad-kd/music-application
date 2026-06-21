import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { User, Menu, X, LogOut } from 'lucide-react';

const Navbar = ({ activeView, setActiveView, onSearch, onPlay, user, onLogout, onOpenAuth }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuItems = [
    { name: 'Home', value: 'Home' },
    { name: 'Trending', value: 'Trending' },
    { name: 'Artists', value: 'Artists' },
    { name: 'Albums', value: 'Albums' },
    { name: 'Playlists', value: 'Playlists' },
    { name: 'Recent Plays', value: 'Recent' },
    { name: 'Favorites', value: 'Favorites' }
  ];

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
      <div className="hidden md:flex items-center justify-end w-1/4 md:w-auto relative">
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-full transition-colors border border-transparent hover:border-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center overflow-hidden border border-primary-blue/60 font-bold text-white uppercase">
                {user.username.charAt(0)}
              </div>
              <span className="font-medium text-slate-300 max-w-[100px] truncate">{user.username}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-800 bg-panel-bg p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-800/60 truncate mb-1">
                  {user.email}
                </div>
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 px-5 py-2 rounded-full font-semibold transition-all hover:shadow-[0_0_15px_rgba(0,119,255,0.4)]"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
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
            {menuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveView(item.value);
                  setMenuOpen(false);
                }}
                className={`text-lg font-medium text-left transition ${item.value === activeView ? 'text-primary-blue' : 'text-slate-300 hover:text-white'}`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <hr className="border-slate-800" />
          
          {user ? (
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center font-bold text-white uppercase">
                  {user.username.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white">{user.username}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth();
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-blue to-blue-600 py-3.5 rounded-2xl font-bold transition-all"
            >
              <User className="w-5 h-5" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;