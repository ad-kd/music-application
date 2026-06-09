import React from 'react';
import { Home, Heart, Clock } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  return (
    <div className="w-64 bg-panel-bg h-[calc(100vh-140px)] rounded-3xl p-6 hidden md:flex flex-col mx-4 mt-4 border border-primary-blue/20">
      <div className="space-y-8">
        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Features</h3>
          <ul className="space-y-3">
            <li>
              <button 
                onClick={() => setActiveView('Home')}
                className={`flex items-center w-full font-medium transition group ${activeView === 'Home' ? 'text-primary-blue' : 'text-slate-300 hover:text-white'}`}
              >
                <Home className={`w-5 h-5 mr-4 ${activeView === 'Home' ? '' : 'text-slate-400 group-hover:text-primary-blue transition'}`} />
                <span>Home</span>
              </button>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Library</h3>
          <ul className="space-y-3">
            <li>
              <button 
                onClick={() => setActiveView('Favorites')}
                className={`flex items-center w-full font-medium transition group ${activeView === 'Favorites' ? 'text-primary-blue' : 'text-slate-300 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 mr-4 ${activeView === 'Favorites' ? '' : 'text-slate-400 group-hover:text-primary-blue transition'}`} />
                <span>Favorites</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveView('Recent')}
                className={`flex items-center w-full font-medium transition group ${activeView === 'Recent' ? 'text-primary-blue' : 'text-slate-300 hover:text-white'}`}
              >
                <Clock className={`w-5 h-5 mr-4 ${activeView === 'Recent' ? '' : 'text-slate-400 group-hover:text-primary-blue transition'}`} />
                <span>Recent</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
