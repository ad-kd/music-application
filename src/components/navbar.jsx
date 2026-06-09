import React from 'react'
import { useState } from 'react';

const Navbar = ({ activeView, setActiveView }) => {
    const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative mx-4 mt-4 flex items-center justify-between rounded-full border border-primary-blue/30 bg-panel-bg/80 px-6 py-4 text-sm text-white backdrop-blur-md">
      {/* Logo */}
      <a href="/" className="flex-shrink-0 flex items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-blue to-blue-900 font-bold text-white shadow-[0_0_15px_rgba(0,119,255,0.5)]">
          AK
        </div>
        <span className="ml-3 text-lg font-bold tracking-wider">Music</span>
      </a>

      {/* Desktop Menu */}
      <div className="hidden items-center gap-8 md:flex mr-4">
        {["Home", "Favorites", "Recent"].map((item) => (
          <button
            key={item}
            onClick={() => setActiveView(item)}
            className={`group relative h-6 overflow-hidden font-medium ${item === activeView ? 'text-primary-blue' : 'text-slate-300 hover:text-white'}`}
          >
            <span className={`block transition-transform duration-300 ${item === activeView ? 'group-hover:-translate-y-full' : ''}`}>
              {item}
            </span>
            <span className="absolute left-0 top-full block text-primary-blue transition-transform duration-300 group-hover:-translate-y-full">
              {item}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-slate-300 hover:text-white"
        aria-label="Toggle Menu"
      >
        {menuOpen ? (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 top-full z-50 mt-4 w-full overflow-hidden rounded-3xl border border-primary-blue/30 bg-panel-bg transition-all duration-300 md:hidden ${
          menuOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-5 p-6">
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
      </div>
    </nav>
  );
};

export default Navbar;