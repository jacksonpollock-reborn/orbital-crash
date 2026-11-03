import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Player {
  id: string;
  name: string;
  bet: number;
  multiplier: number | null;
  status: 'active' | 'cashed' | 'crashed';
}

interface PlayerListProps {
  players: Player[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-surface/40 rounded-lg flex flex-1 flex-col overflow-hidden border border-outline/10">
      <div className="px-6 py-4 border-b border-outline/10 flex justify-between items-center">
        <span className="font-headline text-[10px] tracking-widest uppercase text-slate-400">Current Players</span>
        <span className="bg-outline/20 px-2 py-0.5 rounded text-[10px] text-primary">142 ONLINE</span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-none scrollbar-hide">
        <AnimatePresence initial={false}>
          {players.map((player) => (
            <motion.div 
              key={player.id} 
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: player.status === 'cashed' ? 0.5 : player.status === 'crashed' ? 0.3 : 1,
                x: 0 
              }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{
                    backgroundColor: player.status === 'active' ? '#99f7ff' : 
                                    player.status === 'cashed' ? '#22c55e' : '#ef4444',
                    boxShadow: player.status === 'active' ? '0 0 8px #99f7ff' : 'none'
                  }}
                  className="w-2 h-2 rounded-full"
                />
                <span className="text-xs font-medium text-slate-300">{player.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-headline font-semibold text-primary block">{player.bet} ETH</span>
                <AnimatePresence mode="wait">
                  {player.multiplier && (
                    <motion.span 
                      key={player.status}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-[10px] font-headline block ${player.status === 'cashed' ? 'text-green-400' : 'text-slate-500'}`}
                    >
                      {player.multiplier.toFixed(2)}x
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
