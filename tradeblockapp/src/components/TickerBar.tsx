'use client';

import { BDLTeam } from '@/types';

interface TickerItem {
  team: BDLTeam;
  wins: number;
  losses: number;
  streak: string;
  lastResult: 'W' | 'L';
}

interface TickerBarProps {
  items: TickerItem[];
  onSelectTeam: (team: BDLTeam) => void;
}

export default function TickerBar({ items, onSelectTeam }: TickerBarProps) {
  return (
    <div className="ticker-bar">
      <div className="ticker-inner">
        {[...items, ...items].map((item, i) => (
          <button
            key={`${item.team.id}-${i}`}
            className="ticker-item"
            onClick={() => onSelectTeam(item.team)}
          >
            <span className="ticker-abbr">{item.team.abbreviation}</span>
            <span className="ticker-record">
              {item.wins}–{item.losses}
            </span>
            <span className={`ticker-streak ${item.lastResult === 'W' ? 'up' : 'dn'}`}>
              {item.streak}
            </span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .ticker-bar {
          background: #0a0c0b;
          border-bottom: 1px solid #1a1d1b;
          overflow: hidden;
          padding: 6px 0;
          position: relative;
        }
        .ticker-bar::before,
        .ticker-bar::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 48px;
          z-index: 2;
          pointer-events: none;
        }
        .ticker-bar::before {
          left: 0;
          background: linear-gradient(to right, #0a0c0b, transparent);
        }
        .ticker-bar::after {
          right: 0;
          background: linear-gradient(to left, #0a0c0b, transparent);
        }
        .ticker-inner {
          display: flex;
          gap: 0;
          animation: ticker-scroll 40s linear infinite;
          width: max-content;
        }
        .ticker-inner:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-right: 1px solid #1e2320;
          white-space: nowrap;
        }
        .ticker-item:hover .ticker-abbr {
          color: #4ade80;
        }
        .ticker-abbr {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          color: #e8e4d9;
          transition: color 0.15s;
        }
        .ticker-record {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #5a6360;
        }
        .ticker-streak {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 500;
        }
        .up { color: #4ade80; }
        .dn { color: #f87171; }
      `}</style>
    </div>
  );
}