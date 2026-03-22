'use client';

import { BDLTeam, TeamGameLog } from '@/types';

interface TeamSidebarProps {
  teams: BDLTeam[];
  activeTeamId: number | null;
  gameLogs: Record<number, TeamGameLog>;
  onSelect: (team: BDLTeam) => void;
  loading: boolean;
}

// Conference grouping for display
const CONFERENCES: Record<string, string[]> = {
  East: ['ATL','BOS','BKN','CHA','CHI','CLE','DET','IND','MIA','MIL','NYK','ORL','PHI','TOR','WAS'],
  West: ['DAL','DEN','GSW','HOU','LAC','LAL','MEM','MIN','NOP','OKC','PHX','POR','SAC','SAS','UTA'],
};

export default function TeamSidebar({
  teams,
  activeTeamId,
  gameLogs,
  onSelect,
  loading,
}: TeamSidebarProps) {
  const east = teams.filter(t => CONFERENCES.East.includes(t.abbreviation));
  const west = teams.filter(t => CONFERENCES.West.includes(t.abbreviation));

  const renderTeam = (team: BDLTeam) => {
    const log = gameLogs[team.id];
    const isActive = team.id === activeTeamId;
    const streak = log?.streak ?? '–';
    const isWin = streak.startsWith('W');
    const record = log ? `${log.record.wins}–${log.record.losses}` : '–';

    return (
      <button
        key={team.id}
        className={`team-btn ${isActive ? 'active' : ''}`}
        onClick={() => onSelect(team)}
      >
        <div className="team-row">
          <span className="team-abbr">{team.abbreviation}</span>
          {log && (
            <span className={`streak-badge ${isWin ? 'win' : 'loss'}`}>
              {streak}
            </span>
          )}
        </div>
        <div className="team-meta">
          <span className="team-name">{team.name}</span>
          <span className="team-record">{record}</span>
        </div>
      </button>
    );
  };

  return (
    <aside className="sidebar">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-dot" />
        </div>
      )}

      <div className="conf-group">
        <div className="conf-label">EASTERN</div>
        {east.map(renderTeam)}
      </div>

      <div className="conf-group">
        <div className="conf-label">WESTERN</div>
        {west.map(renderTeam)}
      </div>

      <style jsx>{`
        .sidebar {
          background: #111413;
          border-right: 1px solid #1e2320;
          overflow-y: auto;
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: #1e2320 transparent;
        }
        .loading-overlay {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
        }
        .loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .conf-group {
          padding: 12px 0 4px;
        }
        .conf-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px;
          letter-spacing: 1.5px;
          color: #2d3330;
          padding: 0 12px 6px;
        }
        .team-btn {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          border-left: 2px solid transparent;
          cursor: pointer;
          padding: 6px 12px;
          text-align: left;
          transition: background 0.1s, border-color 0.1s;
        }
        .team-btn:hover {
          background: #161a18;
        }
        .team-btn.active {
          background: #161a18;
          border-left-color: #4ade80;
        }
        .team-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }
        .team-abbr {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: #e8e4d9;
        }
        .streak-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px;
          font-weight: 500;
          padding: 1px 5px;
          border-radius: 2px;
        }
        .streak-badge.win {
          background: #1a2c1a;
          color: #4ade80;
        }
        .streak-badge.loss {
          background: #2c1a1a;
          color: #f87171;
        }
        .team-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .team-name {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          color: #3a4240;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100px;
        }
        .team-record {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          color: #3a4240;
        }
      `}</style>
    </aside>
  );
}