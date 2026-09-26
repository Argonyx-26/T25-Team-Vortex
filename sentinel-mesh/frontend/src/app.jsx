import React, { useState } from 'react';
import LandingDashboard from './components/LandingDashboard';
import ScrollStory from './components/ScrollStory';
import { Sparkles, Activity } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('modular'); // 'modular' | 'storyline'

  return (
    <div className="relative">
      {/* Floating View Switcher (Allows switching between Modular Constellation & Horizontal Storyline) */}
      <div className="fixed top-3 right-56 z-[60] hidden md:flex items-center bg-[#070d1e] border border-cyan-800/80 p-0.5 font-mono text-xs shadow-[0_0_15px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={() => setViewMode('modular')}
          className={`flex items-center gap-1.5 px-2.5 py-1 transition-all cursor-pointer ${
            viewMode === 'modular'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Modular Constellation & Forensic Evidence View"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>MODULAR SKY</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('storyline')}
          className={`flex items-center gap-1.5 px-2.5 py-1 transition-all cursor-pointer ${
            viewMode === 'storyline'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Cinematic Horizontal Pinned Scroll View"
        >
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>STORYLINE SCROLL</span>
        </button>
      </div>

      {/* Active View */}
      {viewMode === 'modular' ? <LandingDashboard /> : <ScrollStory />}
    </div>
  );
}
