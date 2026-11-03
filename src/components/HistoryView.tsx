import React from 'react';
import { motion } from 'motion/react';
import { Clock, TrendingUp, TrendingDown, Rocket } from 'lucide-react';

export interface BetHistory {
  id: string;
  amount: number;
  multiplier: number;
  outcome: 'win' | 'loss';
  timestamp: number;
  crashPoint: number;
}

interface HistoryViewProps {
  history: BetHistory[];
}

export default function HistoryView({ history }: HistoryViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-headline font-bold text-primary tracking-tight uppercase">Mission Logs</h2>
        <div className="bg-surface/60 backdrop-blur px-4 py-2 rounded-lg border border-outline/10 flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          <span className="text-xs font-headline text-slate-400 uppercase tracking-widest">Historical Data</span>
        </div>
      </div>

      <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 overflow-hidden">
        <div className="grid grid-cols-5 px-6 py-4 border-b border-outline/10 bg-black/20 text-[10px] font-headline tracking-widest uppercase text-slate-500">
          <span>Timestamp</span>
          <span>Bet Amount</span>
          <span>Exit Multiplier</span>
          <span>Crash Point</span>
          <span className="text-right">Profit/Loss</span>
        </div>

        <div className="divide-y divide-outline/5 max-h-[600px] overflow-y-auto scrollbar-hide">
          {history.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Rocket size={48} className="mx-auto text-outline/20 mb-4" />
              <p className="text-slate-500 font-headline text-sm tracking-widest uppercase">No mission data recorded yet</p>
            </div>
          ) : (
            history.map((entry) => {
              const profit = entry.outcome === 'win' 
                ? (entry.amount * entry.multiplier) - entry.amount 
                : -entry.amount;
              
              return (
                <div key={entry.id} className="grid grid-cols-5 px-6 py-4 items-center hover:bg-white/5 transition-colors">
                  <div className="text-xs text-slate-400 font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="text-sm font-headline text-white">
                    {entry.amount.toFixed(2)} ETH
                  </div>
                  <div className={`text-sm font-headline ${entry.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                    {entry.multiplier.toFixed(2)}x
                  </div>
                  <div className="text-sm font-headline text-slate-500">
                    {entry.crashPoint.toFixed(2)}x
                  </div>
                  <div className={`text-sm font-headline text-right ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {profit >= 0 ? '+' : ''}{profit.toFixed(4)} ETH
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface/60 backdrop-blur p-4 rounded-lg border border-outline/10">
          <span className="block text-[8px] font-headline text-slate-500 tracking-widest uppercase mb-1">Total Missions</span>
          <span className="block text-xl font-headline text-white">{history.length}</span>
        </div>
        <div className="bg-surface/60 backdrop-blur p-4 rounded-lg border border-outline/10">
          <span className="block text-[8px] font-headline text-slate-500 tracking-widest uppercase mb-1">Win Rate</span>
          <span className="block text-xl font-headline text-green-400">
            {history.length > 0 
              ? Math.round((history.filter(h => h.outcome === 'win').length / history.length) * 100) 
              : 0}%
          </span>
        </div>
        <div className="bg-surface/60 backdrop-blur p-4 rounded-lg border border-outline/10">
          <span className="block text-[8px] font-headline text-slate-500 tracking-widest uppercase mb-1">Net Profit</span>
          <span className={`block text-xl font-headline ${
            history.reduce((acc, h) => acc + (h.outcome === 'win' ? (h.amount * h.multiplier) - h.amount : -h.amount), 0) >= 0 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {history.reduce((acc, h) => acc + (h.outcome === 'win' ? (h.amount * h.multiplier) - h.amount : -h.amount), 0).toFixed(4)} ETH
          </span>
        </div>
      </div>
    </motion.div>
  );
}
