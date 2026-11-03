/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, Database, History, Settings, BarChart2 } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GameDisplay from './components/GameDisplay';
import BettingPanel from './components/BettingPanel';
import PlayerList from './components/PlayerList';
import HistoryView, { BetHistory } from './components/HistoryView';
import SimulationView from './components/SimulationView';

type GameState = 'waiting' | 'countdown' | 'launched' | 'crashed';

interface Player {
  id: string;
  name: string;
  bet: number;
  multiplier: number | null;
  status: 'active' | 'cashed' | 'crashed';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('flight');
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [poolAmount, setPoolAmount] = useState(840); // Initial pool
  const [multiplier, setMultiplier] = useState(1.0);
  const [countdown, setCountdown] = useState(10); // 10 seconds countdown
  const [userBet, setUserBet] = useState<{ amount: number; autoCashOut: number; entryMultiplier: number } | null>(null);
  const [history, setHistory] = useState<BetHistory[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '0x71a...4bc2', bet: 0.45, multiplier: null, status: 'active' },
    { id: '2', name: 'crypto_king_99', bet: 1.20, multiplier: null, status: 'active' },
    { id: '3', name: 'void_walker', bet: 0.05, multiplier: null, status: 'active' },
    { id: '4', name: 'mars_settler', bet: 0.12, multiplier: null, status: 'active' },
    { id: '5', name: 'apollo_one', bet: 0.88, multiplier: null, status: 'active' },
  ]);

  // Simulate pool filling
  useEffect(() => {
    if (gameState === 'waiting') {
      const interval = setInterval(() => {
        setPoolAmount(prev => {
          const next = prev + Math.random() * 5;
          if (next >= 1000) {
            setGameState('countdown');
            return 1000;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Countdown logic
  useEffect(() => {
    if (gameState === 'countdown') {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('launched');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Flight logic: 0.01 every 10 seconds = 0.001 every 1 second
  useEffect(() => {
    if (gameState === 'launched') {
      const interval = setInterval(() => {
        setMultiplier(prev => {
          const next = prev + 0.001;
          
          // Check for crash (random chance increases over time)
          // Probability of crash: base 0.1% per second, increasing
          const crashChance = (next - 1) * 0.01; 
          if (Math.random() < crashChance) {
            setGameState('crashed');
            
            // Record user loss if they were in the flight
            if (userBet) {
              setHistory(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                amount: userBet.amount,
                multiplier: 0,
                outcome: 'loss',
                timestamp: Date.now(),
                crashPoint: next
              }, ...prev]);
            }

            // Update players status
            setPlayers(prevPlayers => prevPlayers.map(p => 
              p.status === 'active' ? { ...p, status: 'crashed', multiplier: next } : p
            ));
            return next;
          }

          // Check auto cash out for user
          if (userBet && next >= userBet.autoCashOut) {
            // We use 'next' here because it's the updated multiplier
            handleCashOutWithMultiplier(next);
          }

          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, userBet]);

  // Reset game after crash
  useEffect(() => {
    if (gameState === 'crashed') {
      const timeout = setTimeout(() => {
        setGameState('waiting');
        setPoolAmount(840);
        setMultiplier(1.0);
        setCountdown(10);
        setUserBet(null);
        setPlayers(p => p.map(player => ({ ...player, status: 'active', multiplier: null })));
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [gameState]);

  const handlePlaceBet = (amount: number, autoCashOut: number) => {
    setUserBet({ amount, autoCashOut, entryMultiplier: multiplier });
    setPlayers(prev => [
      { id: 'user', name: 'You', bet: amount, multiplier: multiplier, status: 'active' },
      ...prev
    ]);
  };

  const handleCashOutWithMultiplier = useCallback((currentMult: number) => {
    if (userBet && gameState === 'launched') {
      const relativeMultiplier = currentMult / userBet.entryMultiplier;
      
      // Record user win
      setHistory(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        amount: userBet.amount,
        multiplier: relativeMultiplier,
        outcome: 'win',
        timestamp: Date.now(),
        crashPoint: 0 
      }, ...prev]);

      setPlayers(prev => prev.map(p => 
        p.id === 'user' ? { ...p, status: 'cashed', multiplier: relativeMultiplier } : p
      ));
      setUserBet(null);
    }
  }, [userBet, gameState]);

  const handleCashOut = useCallback(() => {
    handleCashOutWithMultiplier(multiplier);
  }, [handleCashOutWithMultiplier, multiplier]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-200 selection:bg-primary selection:text-background overflow-x-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 relative overflow-y-auto grid-pattern scanline p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'flight' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <GameDisplay 
                  gameState={gameState} 
                  multiplier={multiplier} 
                  poolAmount={poolAmount} 
                  countdown={countdown}
                />

                <div className="lg:col-span-4 flex flex-col gap-6">
                  <BettingPanel 
                    gameState={gameState}
                    onPlaceBet={handlePlaceBet}
                    onCashOut={handleCashOut}
                    userBet={userBet ? { 
                      amount: userBet.amount, 
                      multiplier: multiplier / userBet.entryMultiplier,
                      entryMultiplier: userBet.entryMultiplier 
                    } : null}
                    currentMultiplier={multiplier}
                  />
                  
                  <PlayerList players={players} />
                </div>
              </div>
            ) : activeTab === 'history' ? (
              <HistoryView history={history} />
            ) : activeTab === 'simulation' ? (
              <SimulationView />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Rocket size={48} className="mb-4 opacity-20" />
                <p className="font-headline tracking-widest uppercase">Section Under Construction</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full flex justify-around items-center h-20 px-4 bg-[#0B0E11] border-t border-outline/20 z-50 backdrop-blur-lg">
        <button 
          onClick={() => setActiveTab('flight')}
          className={`flex flex-col items-center justify-center group transition-all ${activeTab === 'flight' ? 'text-primary' : 'text-slate-500'}`}
        >
          <Rocket size={20} className="group-active:scale-110 duration-200" />
          <span className="font-headline font-bold text-[10px] uppercase tracking-tighter">Terminal</span>
        </button>
        <button 
          onClick={() => setActiveTab('pool')}
          className={`flex flex-col items-center justify-center group transition-all ${activeTab === 'pool' ? 'text-primary' : 'text-slate-500'}`}
        >
          <Database size={20} className="group-active:scale-110 duration-200" />
          <span className="font-headline font-bold text-[10px] uppercase tracking-tighter">Pool</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center group transition-all ${activeTab === 'history' ? 'text-primary' : 'text-slate-500'}`}
        >
          <History size={20} className="group-active:scale-110 duration-200" />
          <span className="font-headline font-bold text-[10px] uppercase tracking-tighter">Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex flex-col items-center justify-center group transition-all ${activeTab === 'simulation' ? 'text-primary' : 'text-slate-500'}`}
        >
          <BarChart2 size={20} className="group-active:scale-110 duration-200" />
          <span className="font-headline font-bold text-[10px] uppercase tracking-tighter">Sim</span>
        </button>
        <button
          onClick={() => setActiveTab('control')}
          className={`flex flex-col items-center justify-center group transition-all ${activeTab === 'control' ? 'text-primary' : 'text-slate-500'}`}
        >
          <Settings size={20} className="group-active:scale-110 duration-200" />
          <span className="font-headline font-bold text-[10px] uppercase tracking-tighter">Control</span>
        </button>
      </nav>
    </div>
  );
}
