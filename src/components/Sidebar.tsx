import React from 'react';
import {
  Rocket,
  Database,
  History,
  Settings,
  HelpCircle,
  Radio,
  LayoutDashboard,
  BarChart2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'flight', label: 'Live Flight', icon: Rocket },
    { id: 'pool', label: 'Prize Pool', icon: Database },
    { id: 'history', label: 'History', icon: History },
    { id: 'simulation', label: 'Simulation', icon: BarChart2 },
    { id: 'control', label: 'Mission Control', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full w-64 bg-[#101417]/80 backdrop-blur-xl border-r border-outline/10 py-8">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <span className="text-primary font-headline text-xs tracking-[0.2em]">FLIGHT STATUS</span>
        </div>
        <p className="text-slate-500 font-headline text-[10px] tracking-widest uppercase">Active_Telemetry</p>
      </div>

      <nav className="flex-1 flex flex-col">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-6 py-3 flex items-center gap-4 font-headline text-xs tracking-widest transition-all text-left ${
              activeTab === item.id 
                ? 'bg-[#22262B] text-primary border-l-4 border-primary' 
                : 'text-slate-400 opacity-70 hover:bg-[#1C2024] hover:opacity-100'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-6 mt-auto flex flex-col gap-4">
        <button className="bg-[#1C2024] border border-primary/20 text-primary py-3 rounded-lg font-headline text-[10px] tracking-widest hover:bg-primary/10 transition-all active:scale-95">
          DEPLOY ASSETS
        </button>
        <div className="pt-4 border-t border-outline/10 flex flex-col gap-2">
          <button className="text-slate-500 flex items-center gap-2 text-[10px] tracking-widest uppercase hover:text-white transition-colors">
            <HelpCircle size={14} /> Support
          </button>
          <button className="text-slate-500 flex items-center gap-2 text-[10px] tracking-widest uppercase hover:text-white transition-colors">
            <Radio size={14} /> System Status
          </button>
        </div>
      </div>
    </aside>
  );
}
