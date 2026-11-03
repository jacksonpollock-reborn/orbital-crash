import React from 'react';
import { Wallet, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-[#101417] to-[#0B0E11] shadow-[0_0_20px_rgba(0,242,255,0.05)] flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50 border-b border-outline/10">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-[0.2em] text-primary-container font-headline uppercase">
          ORBITAL_CRASH
        </span>
        <nav className="hidden md:flex gap-6 items-center h-full">
          <button className="text-primary border-b-2 border-primary pb-1 font-headline tracking-tight uppercase text-xs">
            Terminals
          </button>
          <button className="text-slate-500 uppercase text-xs tracking-widest font-headline hover:text-primary transition-all">
            Telemetry
          </button>
          <button className="text-slate-500 uppercase text-xs tracking-widest font-headline hover:text-primary transition-all">
            Leaderboards
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#22262B]/40 text-primary font-headline text-xs tracking-widest border border-outline/20 rounded">
          <Wallet size={14} />
          $0.00
        </div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-background font-headline font-bold text-xs uppercase px-6 py-2 rounded-lg active:scale-95 transition-all shadow-[0_0_15px_rgba(0,241,254,0.3)]">
          Connect Wallet
        </button>
        <div className="flex items-center gap-2 border-l border-outline/20 pl-4 ml-2">
          <Bell size={18} className="text-slate-400 cursor-pointer hover:text-primary transition-colors" />
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface border border-outline/20">
            <img 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/cyber/100/100" 
              alt="Avatar"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
