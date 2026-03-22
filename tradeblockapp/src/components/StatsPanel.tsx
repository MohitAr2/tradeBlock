'use client';

import { TeamGameLog, OHLCCandle } from '@/types';
import { computeMomentumSeries } from '@/lib/transform';

interface StatsPanelProps {
  log: TeamGameLog | null;
}

function MomentumGauge({ value }: { value: number }) {
  const color = value >= 65 ? '#4ade80' : value >= 40 ? '#fbbf24' : '#f87171';
  const label = value >= 65 ? 'BULLISH' : value >= 40 ? 'NEUTRAL' : 'BEARISH';
  return (
    <div className="gauge-wrap">
      <div className="gauge-header">
        <span className="gauge-label">MOMENTUM INDEX</span>
        <span className="gauge-val" style={{ color }}>{value}</span>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <div className="gauge-status" style={{ color }}>{label}</div>
      <style jsx>{`
        .gauge-wrap { margin-bottom: 12px; }
        .gauge-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .gauge-label { font-size: 9px; color: #3a4240; letter-spacing: 0.5px; }
        .gauge-val { font-size: 14px; font-weight: 600; font-family: 'IBM Plex Mono', monospace; }
        .gauge-track { height: 3px; background: #1e2320; border-radius: 2px; }
        .gauge-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
        .gauge-status { font-size: 8px; margin-top: 4px; letter-spacing: 1px; }
      `}</style>
    </div>
  );
}

function Last5Dots({ candles }: { candles: OHLCCandle[] }) {
  const last5 = candles.slice(-5);
  return (
    <div className="dots-wrap">
      {last5.map((c, i) => (
        <div
          key={i}
          className={`dot ${c.win ? 'win' : 'loss'}`}
          title={`vs ${c.opponent}: ${c.win ? 'W' : 'L'} ${Math.abs(c.margin)}`}
        >
          {c.win ? 'W' : 'L'}
        </div>
      ))}
      <style jsx>{`
        .dots-wrap { display: flex; gap: 4px; margin: 8px 0; }
        .dot {
          width: 24px; height: 24px; border-radius: 3px;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 600; font-family: 'IBM Plex Mono', monospace;
          border: 1px solid;
        }
        .dot.win { background: #1a2c1a; border-color: #4ade80; color: #4ade80; }
        .dot.loss { background: #2c1a1a; border-color: #f87171; color: #f87171; }
      `}</style>
    </div>
  );
}

function GameRow({ candle }: { candle: OHLCCandle }) {
  return (
    <div className="game-row">
      <span className="game-opp">{candle.homeGame ? 'vs' : '@'} {candle.opponent}</span>
      <span className={`game-badge ${candle.win ? 'win' : 'loss'}`}>{candle.win ? 'W' : 'L'}</span>
      <span className="game-score" style={{ color: candle.win ? '#4ade80' : '#f87171' }}>
        {candle.close}–{candle.open}
      </span>
      <span className="game-margin" style={{ color: candle.win ? '#2d5a2d' : '#5a2d2d' }}>
        {candle.win ? '+' : ''}{candle.margin}
      </span>
      <style jsx>{`
        .game-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 5px 0; border-bottom: 1px solid #131613; font-family: 'IBM Plex Mono', monospace;
        }
        .game-row:last-child { border: none; }
        .game-opp { font-size: 9px; color: #5a6360; min-width: 52px; }
        .game-badge {
          font-size: 8px; padding: 1px 5px; border-radius: 2px; font-weight: 600;
        }
        .game-badge.win { background: #1a2c1a; color: #4ade80; }
        .game-badge.loss { background: #2c1a1a; color: #f87171; }
        .game-score { font-size: 10px; font-weight: 500; }
        .game-margin { font-size: 9px; min-width: 28px; text-align: right; }
      `}</style>
    </div>
  );
}

export default function StatsPanel({ log }: StatsPanelProps) {
  if (!log) {
    return (
      <aside className="panel">
        <div className="empty">Select a team</div>
        <style jsx>{`
          .panel { background: #111413; border-left: 1px solid #1e2320; padding: 16px 14px; }
          .empty { font-size: 10px; color: #2d3330; font-family: 'IBM Plex Mono', monospace; margin-top: 24px; text-align: center; }
        `}</style>
      </aside>
    );
  }

  const recent = [...log.candles].reverse().slice(0, 8);
  const streak = log.streak;
  const isWinStreak = streak.startsWith('W');
  const winPct = Math.round((log.record.wins / (log.record.wins + log.record.losses)) * 100);
  const avgMargin = Math.round(
    log.candles.reduce((a, c) => a + c.margin, 0) / log.candles.length
  );
  const homeRecord = log.candles.filter(c => c.homeGame);
  const homeWins = homeRecord.filter(c => c.win).length;
  const awayRecord = log.candles.filter(c => !c.homeGame);
  const awayWins = awayRecord.filter(c => c.win).length;

  return (
    <aside className="panel">
      {/* Streak hero */}
      <div className="streak-hero">
        <span className="streak-num" style={{ color: isWinStreak ? '#4ade80' : '#f87171' }}>
          {streak}
        </span>
        <span className="streak-sub">{isWinStreak ? 'WIN' : 'LOSS'} STREAK</span>
      </div>

      <div className="divider" />

      {/* Momentum */}
      <MomentumGauge value={log.momentum} />
      <Last5Dots candles={log.candles} />

      <div className="divider" />

      {/* Quick stats */}
      <div className="section-label">SEASON STATS</div>
      <div className="stat-grid">
        <div className="stat-cell">
          <div className="stat-lbl">WIN %</div>
          <div className="stat-val up">{winPct}%</div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">AVG MGN</div>
          <div className="stat-val" style={{ color: avgMargin >= 0 ? '#4ade80' : '#f87171' }}>
            {avgMargin >= 0 ? '+' : ''}{avgMargin}
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">HOME</div>
          <div className="stat-val nu">{homeWins}–{homeRecord.length - homeWins}</div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">AWAY</div>
          <div className="stat-val nu">{awayWins}–{awayRecord.length - awayWins}</div>
        </div>
      </div>

      <div className="divider" />

      {/* Recent games */}
      <div className="section-label">RECENT GAMES</div>
      <div className="games-list">
        {recent.map((c, i) => (
          <GameRow key={i} candle={c} />
        ))}
      </div>

      <style jsx>{`
        .panel {
          background: #111413;
          border-left: 1px solid #1e2320;
          padding: 16px 14px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #1e2320 transparent;
        }
        .streak-hero {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 12px;
        }
        .streak-num {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
        }
        .streak-sub {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          color: #3a4240;
          letter-spacing: 1px;
        }
        .divider {
          height: 1px;
          background: #1a1d1b;
          margin: 12px 0;
        }
        .section-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px;
          letter-spacing: 1.5px;
          color: #2d3330;
          margin-bottom: 8px;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 4px;
        }
        .stat-cell {
          background: #0d0f0e;
          border: 1px solid #1e2320;
          border-radius: 3px;
          padding: 6px 8px;
        }
        .stat-lbl {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px;
          color: #2d3330;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }
        .stat-val {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          font-weight: 600;
        }
        .stat-val.up { color: #4ade80; }
        .stat-val.nu { color: #e8e4d9; }
        .games-list { }
      `}</style>
    </aside>
  );
}