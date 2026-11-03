import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target } from 'lucide-react';

interface GameDisplayProps {
  gameState: 'waiting' | 'countdown' | 'launched' | 'crashed';
  multiplier: number;
  poolAmount: number;
  countdown: number;
}

export default function GameDisplay({ gameState, multiplier, poolAmount, countdown }: GameDisplayProps) {
  const fillRate = Math.min(100, (poolAmount / 1000) * 100);

  return (
    <div className="lg:col-span-8 flex flex-col gap-6">
      {/* Prize Pool Display */}
      <div className="bg-surface/60 backdrop-blur-md rounded-lg p-6 border-l-4 border-primary relative overflow-hidden border border-outline/10">
        <div className="flex justify-between items-end mb-4 relative z-10">
          <div>
            <h3 className="text-slate-500 font-headline text-xs tracking-widest mb-1 uppercase">Total_Reward_Reserve</h3>
            <div className="text-4xl font-headline font-bold text-primary tracking-tighter">
              ${poolAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-headline text-primary tracking-widest uppercase block mb-1">Fill Rate</span>
            <span className="text-xl font-headline text-primary">{Math.floor(fillRate)}%</span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-outline/20 rounded-full overflow-hidden relative z-10">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-primary-container shadow-[0_0_12px_rgba(0,242,255,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${fillRate}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>
      </div>

      {/* Main Rocket Display Area */}
      <div className="flex-1 bg-black/40 rounded-lg relative flex flex-col items-center justify-center min-h-[500px] border border-outline/5 overflow-hidden">
        {/* HUD Elements */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
          <div className="bg-surface/80 px-3 py-1 rounded-lg border-l-2 border-primary backdrop-blur-sm">
            <span className="text-[10px] font-headline text-primary tracking-[0.2em] uppercase">Telemetry_Lock: {gameState !== 'waiting' ? 'TRUE' : 'SEARCHING'}</span>
          </div>
          <div className="bg-surface/80 px-3 py-1 rounded-lg border-l-2 border-secondary backdrop-blur-sm">
            <span className="text-[10px] font-headline text-secondary tracking-[0.2em] uppercase">Pressure_Sensors: {gameState === 'crashed' ? 'FAIL' : 'OK'}</span>
          </div>
        </div>

        {/* Multiplier / Countdown HUD */}
        <div className="text-center z-10 relative">
          <AnimatePresence mode="wait">
            {gameState === 'waiting' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-slate-400 font-headline text-xs tracking-[0.3em] uppercase mb-4">Waiting for Pool</h2>
                <div className="text-4xl font-headline font-bold text-primary tracking-tighter">
                  ${(1000 - poolAmount).toFixed(2)} REMAINING
                </div>
              </motion.div>
            )}

            {gameState === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
              >
                <h2 className="text-slate-400 font-headline text-xs tracking-[0.3em] uppercase mb-4">Countdown to Launch</h2>
                <div className="text-8xl md:text-9xl font-headline font-bold text-secondary tracking-tighter drop-shadow-[0_0_30px_rgba(255,138,0,0.3)] animate-pulse">
                  {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                </div>
              </motion.div>
            )}

            {gameState === 'launched' && (
              <motion.div
                key="launched"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h2 className="text-primary font-headline text-xs tracking-[0.3em] uppercase mb-4 animate-pulse">Flight in Progress</h2>
                <div className="text-8xl md:text-9xl font-headline font-bold text-primary tracking-tighter drop-shadow-[0_0_30px_rgba(0,241,254,0.3)]">
                  {multiplier.toFixed(2)}x
                </div>
              </motion.div>
            )}

            {gameState === 'crashed' && (
              <motion.div
                key="crashed"
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-500"
              >
                <h2 className="font-headline text-xs tracking-[0.3em] uppercase mb-4">CRITICAL FAILURE</h2>
                <div className="text-8xl md:text-9xl font-headline font-bold tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  {multiplier.toFixed(2)}x
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rocket Visualization */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 mix-blend-screen">
          <motion.img 
            className="w-[80%] h-[80%] object-contain grayscale brightness-50 contrast-125" 
            src="https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1000" 
            alt="Rocket"
            referrerPolicy="no-referrer"
            animate={gameState === 'launched' ? { 
              y: [0, -10, 0],
              x: [0, 2, -2, 0],
              scale: [1, 1.02, 1]
            } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          {gameState === 'launched' && (
            <motion.div 
              className="absolute bottom-1/4 w-32 h-64 bg-primary/20 blur-3xl rounded-full"
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
          )}
        </div>

        {/* Lower Data Overlay */}
        <div className="absolute bottom-6 w-full px-8 flex justify-between items-end z-20">
          <div className="flex gap-4">
            <div className="bg-surface/60 backdrop-blur p-4 rounded-lg border border-outline/10">
              <span className="block text-[8px] font-headline text-slate-500 tracking-widest uppercase mb-1">Atmosphere</span>
              <span className="block text-sm font-headline text-on-surface">1.013 BAR</span>
            </div>
            <div className="bg-surface/60 backdrop-blur p-4 rounded-lg border border-outline/10">
              <span className="block text-[8px] font-headline text-slate-500 tracking-widest uppercase mb-1">Fuel Mass</span>
              <span className="block text-sm font-headline text-on-surface">82,400 KG</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[8px] font-headline text-slate-500 tracking-widest uppercase">Target Orbit</span>
              <span className="block text-sm font-headline text-on-surface">LEO_091</span>
            </div>
            <Target className="text-primary animate-spin-slow" size={32} />
          </div>
        </div>
      </div>
    </div>
  );
}
