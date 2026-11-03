import React, { useState } from 'react';
import { TrendingUp, Rocket } from 'lucide-react';

interface BettingPanelProps {
  gameState: 'waiting' | 'countdown' | 'launched' | 'crashed';
  onPlaceBet: (amount: number, autoCashOut: number) => void;
  onCashOut: () => void;
  userBet: { amount: number; multiplier: number; entryMultiplier?: number } | null;
  currentMultiplier: number;
}

export default function BettingPanel({ 
  gameState, 
  onPlaceBet, 
  onCashOut, 
  userBet, 
  currentMultiplier 
}: BettingPanelProps) {
  const [betAmount, setBetAmount] = useState('0.1');
  const [autoCashOut, setAutoCashOut] = useState('2.00');

  const handleBet = () => {
    const amount = parseFloat(betAmount);
    const auto = parseFloat(autoCashOut);
    if (!isNaN(amount) && !isNaN(auto)) {
      onPlaceBet(amount, auto);
    }
  };

  const isWaiting = gameState === 'waiting' || gameState === 'countdown';
  const isLaunched = gameState === 'launched';
  const hasBet = !!userBet;

  return (
    <div className="bg-surface rounded-lg p-6 flex flex-col gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-outline/10">
      <h3 className="font-headline font-bold text-sm tracking-[0.2em] uppercase text-primary">
        {isLaunched && hasBet ? 'Current Position' : 'Place Initial Bet'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-headline text-slate-400 tracking-widest uppercase mb-2">
            Bet Amount (ETH)
          </label>
          <div className="relative group">
            <input 
              className="w-full bg-black/40 border-0 border-b border-outline focus:border-primary focus:ring-0 text-white font-headline p-3 transition-all disabled:opacity-50"
              type="number" 
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={isLaunched || hasBet}
              step="0.01"
            />
            <div className="absolute right-3 top-3 flex gap-1">
              <button 
                onClick={() => setBetAmount((prev) => (parseFloat(prev) / 2).toFixed(2))}
                className="text-[10px] bg-outline/20 px-2 py-0.5 rounded text-slate-400 hover:text-primary transition-colors"
                disabled={isLaunched || hasBet}
              >
                1/2
              </button>
              <button 
                onClick={() => setBetAmount((prev) => (parseFloat(prev) * 2).toFixed(2))}
                className="text-[10px] bg-outline/20 px-2 py-0.5 rounded text-slate-400 hover:text-primary transition-colors"
                disabled={isLaunched || hasBet}
              >
                x2
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-headline text-slate-400 tracking-widest uppercase mb-2">
            Auto-Cash Out Multiplier
          </label>
          <div className="relative">
            <input 
              className="w-full bg-black/40 border-0 border-b border-outline focus:border-primary focus:ring-0 text-white font-headline p-3 transition-all disabled:opacity-50"
              type="number" 
              value={autoCashOut}
              onChange={(e) => setAutoCashOut(e.target.value)}
              disabled={isLaunched || hasBet}
              step="0.1"
            />
            <TrendingUp className="absolute right-3 top-3 text-slate-500" size={16} />
          </div>
        </div>
      </div>

      {isLaunched ? (
        hasBet ? (
          <button 
            onClick={onCashOut}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-background font-headline font-bold text-sm tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(0,241,254,0.3)] active:scale-[0.98] transition-all"
          >
            Sell Position ({(userBet.amount * (currentMultiplier / (userBet.entryMultiplier || 1))).toFixed(3)} ETH)
          </button>
        ) : (
          <button 
            onClick={handleBet}
            className="w-full py-4 bg-gradient-to-r from-primary/80 to-primary-container/80 text-background font-headline font-bold text-sm tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(0,241,254,0.2)] active:scale-[0.98] transition-all"
          >
            Buy Position @ {currentMultiplier.toFixed(2)}x
          </button>
        )
      ) : (
        <button 
          onClick={handleBet}
          disabled={!isWaiting || hasBet}
          className="w-full py-4 bg-gradient-to-r from-secondary to-[#ef8100] text-background font-headline font-bold text-sm tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(255,138,0,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
        >
          {hasBet ? 'Waiting for Launch...' : 'Initiate Launch Sequence'}
        </button>
      )}

      <div className="flex justify-between items-center text-[10px] font-headline tracking-widest uppercase text-slate-500">
        <span>Network Fee: ~0.002</span>
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span> 
          Live
        </span>
      </div>
    </div>
  );
}
