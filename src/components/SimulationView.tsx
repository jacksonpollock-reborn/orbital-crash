import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, BarChart2, Rocket, ArrowRightLeft } from 'lucide-react';

interface SimPlayer {
  id: string;
  name: string;
  bet: number;
  entryMultiplier: number;
  cashedOutAt: number | null; // null = crashed (lost)
}

interface SimConfig {
  crashPoint: number;
  players: SimPlayer[];
  tradeCount: number;
  avgTradeSize: number;
  feeRate: number; // e.g. 0.01 = 1%
}

const PRESETS: { label: string; config: SimConfig }[] = [
  {
    label: 'Perfect Crash',
    config: {
      crashPoint: 1.05,
      players: Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        name: `Player ${i + 1}`,
        bet: 100,
        entryMultiplier: 1.0,
        cashedOutAt: null,
      })),
      tradeCount: 0,
      avgTradeSize: 0,
      feeRate: 0.01,
    },
  },
  {
    label: 'Early Escape',
    config: {
      crashPoint: 2.0,
      players: [
        ...Array.from({ length: 5 }, (_, i) => ({
          id: String(i),
          name: `Player ${i + 1}`,
          bet: 100,
          entryMultiplier: 1.0,
          cashedOutAt: 1.5,
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          id: String(i + 5),
          name: `Player ${i + 6}`,
          bet: 100,
          entryMultiplier: 1.0,
          cashedOutAt: null,
        })),
      ],
      tradeCount: 5,
      avgTradeSize: 100,
      feeRate: 0.01,
    },
  },
  {
    label: 'Moonshot Bleed',
    config: {
      crashPoint: 5.0,
      players: [
        ...Array.from({ length: 8 }, (_, i) => ({
          id: String(i),
          name: `Player ${i + 1}`,
          bet: 100,
          entryMultiplier: 1.0,
          cashedOutAt: 3.0,
        })),
        ...Array.from({ length: 2 }, (_, i) => ({
          id: String(i + 8),
          name: `Player ${i + 9}`,
          bet: 100,
          entryMultiplier: 1.0,
          cashedOutAt: null,
        })),
      ],
      tradeCount: 10,
      avgTradeSize: 100,
      feeRate: 0.01,
    },
  },
  {
    label: 'Trading Frenzy',
    config: {
      crashPoint: 1.2,
      players: [
        ...Array.from({ length: 3 }, (_, i) => ({
          id: String(i),
          name: `Player ${i + 1}`,
          bet: 100,
          entryMultiplier: 1.0,
          cashedOutAt: 1.1,
        })),
        ...Array.from({ length: 7 }, (_, i) => ({
          id: String(i + 3),
          name: `Player ${i + 4}`,
          bet: 100,
          entryMultiplier: 1.0,
          cashedOutAt: null,
        })),
      ],
      tradeCount: 30,
      avgTradeSize: 50,
      feeRate: 0.01,
    },
  },
];

const CRASH_IMPACT_POINTS = [1.0, 1.25, 1.5, 2.0, 3.0, 5.0, 10.0];

function computeResults(config: SimConfig) {
  const poolCollected = config.players.reduce((sum, p) => sum + p.bet, 0);
  const totalPayouts = config.players.reduce((sum, p) => {
    if (p.cashedOutAt === null) return sum;
    return sum + p.bet * (p.cashedOutAt / p.entryMultiplier);
  }, 0);
  const p2pFees = config.tradeCount * config.avgTradeSize * config.feeRate;
  const houseNet = poolCollected - totalPayouts + p2pFees;

  const cashedPlayers = config.players.filter(p => p.cashedOutAt !== null);
  const cashoutFraction = config.players.length > 0 ? cashedPlayers.length / config.players.length : 0;
  const avgCashoutRatio =
    cashedPlayers.length > 0
      ? cashedPlayers.reduce((sum, p) => sum + (p.cashedOutAt! / p.entryMultiplier), 0) / cashedPlayers.length
      : 0;
  const exposureRatio = cashoutFraction * avgCashoutRatio;

  return { poolCollected, totalPayouts, p2pFees, houseNet, cashoutFraction, avgCashoutRatio, exposureRatio };
}

function computeHouseNetAtCrash(crashPoint: number, config: SimConfig): number {
  const poolCollected = config.players.reduce((sum, p) => sum + p.bet, 0);
  // Only players who cashed out BEFORE the crash receive payouts
  const totalPayouts = config.players.reduce((sum, p) => {
    if (p.cashedOutAt === null) return sum;
    if (p.cashedOutAt > crashPoint) return sum; // didn't make it
    return sum + p.bet * (p.cashedOutAt / p.entryMultiplier);
  }, 0);
  const p2pFees = config.tradeCount * config.avgTradeSize * config.feeRate;
  return poolCollected - totalPayouts + p2pFees;
}

export default function SimulationView() {
  const [config, setConfig] = useState<SimConfig>(PRESETS[0].config);
  const [activePreset, setActivePreset] = useState(0);

  const results = useMemo(() => computeResults(config), [config]);

  const crashImpactData = useMemo(
    () =>
      CRASH_IMPACT_POINTS.map(cp => ({
        point: cp,
        houseNet: computeHouseNetAtCrash(cp, config),
      })),
    [config]
  );

  const maxAbsImpact = Math.max(...crashImpactData.map(d => Math.abs(d.houseNet)), 1);

  function applyPreset(idx: number) {
    setActivePreset(idx);
    setConfig(PRESETS[idx].config);
  }

  function updatePlayer(id: string, field: keyof SimPlayer, value: number | null) {
    setConfig(prev => ({
      ...prev,
      players: prev.players.map(p => (p.id === id ? { ...p, [field]: value } : p)),
    }));
    setActivePreset(-1);
  }

  const isHousePositive = results.houseNet >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-headline font-bold text-primary tracking-tight uppercase">P&L Simulator</h2>
        <div className="bg-surface/60 backdrop-blur px-4 py-2 rounded-lg border border-outline/10 flex items-center gap-2">
          <BarChart2 size={16} className="text-primary" />
          <span className="text-xs font-headline text-slate-400 uppercase tracking-widest">House Economics</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Left: Inputs ─── */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Presets */}
          <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 p-5">
            <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500 mb-3">Preset Scenarios</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(i)}
                  className={`py-2 px-3 rounded-lg text-[11px] font-headline tracking-widest uppercase transition-all border ${
                    activePreset === i
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-black/20 border-outline/20 text-slate-400 hover:border-primary/40 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Crash Config */}
          <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 p-5 flex flex-col gap-4">
            <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500">Crash Configuration</p>
            <div>
              <label className="block text-[10px] font-headline text-slate-400 tracking-widest uppercase mb-2">
                Crash Point: <span className="text-primary">{config.crashPoint.toFixed(2)}x</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="15"
                step="0.05"
                value={config.crashPoint}
                onChange={e => {
                  setConfig(prev => ({ ...prev, crashPoint: parseFloat(e.target.value) }));
                  setActivePreset(-1);
                }}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                <span>1.0x (instant)</span>
                <span>15x (moon)</span>
              </div>
            </div>
          </div>

          {/* P2P Trade Config */}
          <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 p-5 flex flex-col gap-4">
            <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500 flex items-center gap-2">
              <ArrowRightLeft size={12} /> P2P Trade Fees
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-headline text-slate-500 tracking-widest uppercase mb-1">
                  Trade Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.tradeCount}
                  onChange={e => {
                    setConfig(prev => ({ ...prev, tradeCount: Math.max(0, parseInt(e.target.value) || 0) }));
                    setActivePreset(-1);
                  }}
                  className="w-full bg-black/40 border-b border-outline focus:border-primary focus:ring-0 text-white font-headline p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-headline text-slate-500 tracking-widest uppercase mb-1">
                  Avg Size ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.avgTradeSize}
                  onChange={e => {
                    setConfig(prev => ({ ...prev, avgTradeSize: Math.max(0, parseFloat(e.target.value) || 0) }));
                    setActivePreset(-1);
                  }}
                  className="w-full bg-black/40 border-b border-outline focus:border-primary focus:ring-0 text-white font-headline p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-headline text-slate-500 tracking-widest uppercase mb-1">
                  Fee Rate %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={(config.feeRate * 100).toFixed(1)}
                  onChange={e => {
                    setConfig(prev => ({ ...prev, feeRate: Math.max(0, parseFloat(e.target.value) || 0) / 100 }));
                    setActivePreset(-1);
                  }}
                  className="w-full bg-black/40 border-b border-outline focus:border-primary focus:ring-0 text-white font-headline p-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Player Editor */}
          <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-outline/10">
              <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500">Player Positions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-headline">
                <thead>
                  <tr className="border-b border-outline/10 text-slate-500 tracking-widest uppercase">
                    <th className="text-left px-4 py-2">Player</th>
                    <th className="text-right px-2 py-2">Bet $</th>
                    <th className="text-right px-2 py-2">Entry x</th>
                    <th className="text-right px-4 py-2">Exit x</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {config.players.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-2 text-slate-300">{p.name}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="1"
                          value={p.bet}
                          onChange={e => updatePlayer(p.id, 'bet', parseFloat(e.target.value) || 1)}
                          className="w-16 bg-black/30 border-b border-outline/40 focus:border-primary focus:ring-0 text-white text-right p-1"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={p.entryMultiplier}
                          onChange={e => updatePlayer(p.id, 'entryMultiplier', parseFloat(e.target.value) || 1)}
                          className="w-14 bg-black/30 border-b border-outline/40 focus:border-primary focus:ring-0 text-white text-right p-1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={p.cashedOutAt === null ? 'crashed' : String(p.cashedOutAt)}
                          onChange={e =>
                            updatePlayer(
                              p.id,
                              'cashedOutAt',
                              e.target.value === 'crashed' ? null : parseFloat(e.target.value)
                            )
                          }
                          className="bg-black/30 border-b border-outline/40 focus:border-primary text-white p-1 text-[11px]"
                        >
                          <option value="crashed">💥 crashed</option>
                          {[1.1, 1.2, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10.0].map(v => (
                            <option key={v} value={String(v)}>
                              {v.toFixed(1)}x
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── Right: Results ─── */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* House P&L Card */}
          <div
            className={`rounded-xl border p-6 flex flex-col gap-2 ${
              isHousePositive
                ? 'bg-green-950/30 border-green-500/20'
                : 'bg-red-950/30 border-red-500/20'
            }`}
          >
            <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500">House Net P&L</p>
            <div className="flex items-end gap-3">
              <span
                className={`text-5xl font-headline font-bold ${
                  isHousePositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isHousePositive ? '+' : ''}${results.houseNet.toFixed(2)}
              </span>
              {isHousePositive ? (
                <TrendingUp className="text-green-400 mb-2" size={28} />
              ) : (
                <TrendingDown className="text-red-400 mb-2" size={28} />
              )}
            </div>
            <p className="text-xs text-slate-500">
              {isHousePositive
                ? `House keeps ${((results.houseNet / results.poolCollected) * 100).toFixed(1)}% of the pool`
                : `House pays out ${(Math.abs(results.houseNet / results.poolCollected) * 100).toFixed(1)}% more than pool collected`}
            </p>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-outline/10">
              <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500">Revenue Breakdown</p>
            </div>
            <div className="divide-y divide-outline/5">
              <div className="flex justify-between items-center px-5 py-3">
                <span className="text-xs font-headline text-slate-400 uppercase tracking-widest">Pool Collected</span>
                <span className="text-sm font-headline text-green-400">+${results.poolCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-5 py-3">
                <span className="text-xs font-headline text-slate-400 uppercase tracking-widest">P2P Fees Earned</span>
                <span className="text-sm font-headline text-green-400">+${results.p2pFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-5 py-3">
                <span className="text-xs font-headline text-slate-400 uppercase tracking-widest">Total Payouts</span>
                <span className="text-sm font-headline text-red-400">−${results.totalPayouts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-5 py-3 bg-black/20">
                <span className="text-xs font-headline text-slate-300 uppercase tracking-widest font-bold">Net</span>
                <span className={`text-sm font-headline font-bold ${isHousePositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isHousePositive ? '+' : ''}${results.houseNet.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Breakeven Insight */}
          <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 p-5 flex flex-col gap-3">
            <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500">Breakeven Analysis</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[9px] font-headline text-slate-600 uppercase tracking-widest mb-1">Cashout %</p>
                <p className="text-lg font-headline text-white">{(results.cashoutFraction * 100).toFixed(0)}%</p>
                <p className="text-[9px] text-slate-500">of players escaped</p>
              </div>
              <div>
                <p className="text-[9px] font-headline text-slate-600 uppercase tracking-widest mb-1">Avg Exit Ratio</p>
                <p className="text-lg font-headline text-white">{results.avgCashoutRatio.toFixed(2)}x</p>
                <p className="text-[9px] text-slate-500">avg return per cashout</p>
              </div>
              <div>
                <p className="text-[9px] font-headline text-slate-600 uppercase tracking-widest mb-1">Exposure Ratio</p>
                <p className={`text-lg font-headline ${results.exposureRatio > 1 ? 'text-red-400' : 'text-green-400'}`}>
                  {(results.exposureRatio * 100).toFixed(0)}%
                </p>
                <p className="text-[9px] text-slate-500">of pool at risk ({"<"}100% = profit)</p>
              </div>
            </div>
            <div className={`text-xs font-headline px-3 py-2 rounded-lg ${results.exposureRatio > 1 ? 'bg-red-950/40 text-red-300' : 'bg-green-950/40 text-green-300'}`}>
              {results.exposureRatio > 1
                ? `House overpaid by ${((results.exposureRatio - 1) * 100).toFixed(1)}% of pool — ${(results.cashoutFraction * 100).toFixed(0)}% of players cashing out at avg ${results.avgCashoutRatio.toFixed(2)}x is above the breakeven threshold.`
                : results.cashoutFraction === 0
                ? `Rocket crashed before any cashouts. House keeps 100% of the $${results.poolCollected.toFixed(0)} pool.`
                : `House is profitable. Payout exposure is ${(results.exposureRatio * 100).toFixed(1)}% of pool — below the 100% breakeven threshold.`}
            </div>
          </div>

          {/* Crash Rate Impact */}
          <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 p-5 flex flex-col gap-3">
            <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500 flex items-center gap-2">
              <Rocket size={12} /> Crash Timing Impact (same player behavior)
            </p>
            <div className="flex flex-col gap-1.5">
              {crashImpactData.map(({ point, houseNet }) => {
                const barPct = Math.abs(houseNet) / maxAbsImpact;
                const isPos = houseNet >= 0;
                return (
                  <div key={point} className="flex items-center gap-3">
                    <span className="text-[10px] font-headline text-slate-400 w-12 text-right">{point.toFixed(2)}x</span>
                    <div className="flex-1 h-5 bg-black/30 rounded overflow-hidden relative">
                      <div
                        className={`h-full rounded transition-all ${isPos ? 'bg-green-500/60' : 'bg-red-500/60'}`}
                        style={{ width: `${barPct * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-headline w-20 text-right ${isPos ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {isPos ? '+' : ''}${houseNet.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-600 font-headline uppercase tracking-widest">
              Players who set cashout above crash point are treated as crashed.
            </p>
          </div>

          {/* Player Results */}
          <div className="bg-surface/40 backdrop-blur-md rounded-xl border border-outline/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-outline/10">
              <p className="text-[10px] font-headline tracking-widest uppercase text-slate-500">Player Outcomes</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-headline">
                <thead>
                  <tr className="text-slate-500 tracking-widest uppercase border-b border-outline/10">
                    <th className="text-left px-4 py-2">Player</th>
                    <th className="text-right px-3 py-2">Bet</th>
                    <th className="text-right px-3 py-2">Payout</th>
                    <th className="text-right px-4 py-2">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {config.players.map(p => {
                    const payout =
                      p.cashedOutAt !== null ? p.bet * (p.cashedOutAt / p.entryMultiplier) : 0;
                    const pnl = payout - p.bet;
                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2 text-slate-300">{p.name}</td>
                        <td className="px-3 py-2 text-right text-slate-400">${p.bet.toFixed(0)}</td>
                        <td className="px-3 py-2 text-right text-slate-300">${payout.toFixed(2)}</td>
                        <td className={`px-4 py-2 text-right font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
