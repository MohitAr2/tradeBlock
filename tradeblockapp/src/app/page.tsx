'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BDLTeam, TeamGameLog } from '@/types';
import { computeMomentumSeries } from '@/lib/transform';
import TeamSidebar from '@/components/TeamSidebar';
import StatsPanel from '@/components/StatsPanel';
import TickerBar from '@/components/TickerBar';

// Avoid SSR for the chart (uses browser APIs)
const CandlestickChart = dynamic(() => import('@/components/CandlestickChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

function ChartSkeleton() {
  return (
    <div className="chart-skeleton">
      <div className="skeleton-lines">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-line" style={{ opacity: 1 - i * 0.1 }} />
        ))}
      </div>
      <div className="skeleton-candles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-candle"
            style={{ height: `${20 + Math.random() * 40}%` }}
          />
        ))}
      </div>
      <style jsx>{`
        .chart-skeleton {
          width: 100%; height: 100%;
          position: relative; overflow: hidden;
        }
        .skeleton-lines {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; justify-content: space-around;
          padding: 16px;
        }
        .skeleton-line {
          height: 1px; background: #1e2320;
        }
        .skeleton-candles {
          position: absolute; inset: 0;
          display: flex; align-items: flex-end;
          gap: 4px; padding: 16px 32px;
        }
        .skeleton-candle {
          flex: 1; border-radius: 1px;
          background: #1a2320;
          animation: shimmer 1.5s ease-in-out infinite alternate;
        }
        @keyframes shimmer {
          from { opacity: 0.3; }
          to { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  const [teams, setTeams] = useState<BDLTeam[]>([]);
  const [activeTeam, setActiveTeam] = useState<BDLTeam | null>(null);
  const [gameLogs, setGameLogs] = useState<Record<number, TeamGameLog>>({});
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  // Fetch all teams on mount
  useEffect(() => {
    fetch('/api/teams')
      .then(r => r.json())
      .then(data => {
        setTeams(data.teams ?? []);
        setTeamsLoading(false);
        // default select Celtics (id=1) or first team
        const celtics = data.teams?.find((t: BDLTeam) => t.abbreviation === 'BOS');
        if (celtics) selectTeam(celtics);
        else if (data.teams?.[0]) selectTeam(data.teams[0]);
      })
      .catch(err => {
        console.error('Failed to load teams', err);
        setTeamsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTeam = useCallback(async (team: BDLTeam) => {
    setActiveTeam(team);

    // already cached
    if (gameLogs[team.id]) return;

    setChartLoading(true);
    try {
      const res = await fetch(`/api/games/${team.id}`);
      const log: TeamGameLog = await res.json();
      setGameLogs(prev => ({ ...prev, [team.id]: log }));
    } catch (err) {
      console.error('Failed to load game log', err);
    } finally {
      setChartLoading(false);
    }
  }, [gameLogs]);

  const activeLog = activeTeam ? gameLogs[activeTeam.id] ?? null : null;
  const momentumSeries = activeLog ? computeMomentumSeries(activeLog.candles) : [];

  const tickerItems = teams.map(t => {
    const log = gameLogs[t.id];
    return {
      team: t,
      wins: log?.record.wins ?? 0,
      losses: log?.record.losses ?? 0,
      streak: log?.streak ?? '–',
      lastResult: (log?.streak.startsWith('W') ? 'W' : 'L') as 'W' | 'L',
    };
  });

  const winPct = activeLog
    ? Math.round((activeLog.record.wins / (activeLog.record.wins + activeLog.record.losses)) * 100)
    : null;

  return (
    <div className="root">
      {/* Header */}
      <header className="header">
        <div className="logo">
          trade<span className="logo-accent">Block</span>
        </div>
        <nav className="nav">
          <span className="nav-item active">Dashboard</span>
          <span className="nav-item">Teams</span>
          <span className="nav-item">Players</span>
          <span className="nav-item">H2H</span>
        </nav>
        <div className="header-right">
          <span className="season-badge">NBA 2024–25</span>
        </div>
      </header>

      {/* Ticker */}
      {tickerItems.length > 0 && (
        <TickerBar items={tickerItems} onSelectTeam={selectTeam} />
      )}

      {/* Body */}
      <div className="body">
        {/* Left sidebar */}
        <TeamSidebar
          teams={teams}
          activeTeamId={activeTeam?.id ?? null}
          gameLogs={gameLogs}
          onSelect={selectTeam}
          loading={teamsLoading}
        />

        {/* Main chart area */}
        <main className="main">
          {/* Chart header */}
          <div className="chart-header">
            <div className="chart-title-block">
              {activeTeam ? (
                <>
                  <h1 className="chart-title">{activeTeam.full_name}</h1>
                  <p className="chart-subtitle">
                    Performance Candlestick · 2024–25 ·{' '}
                    <span style={{ color: '#4ade80' }}>Green = Win</span>
                    {' '}·{' '}
                    <span style={{ color: '#f87171' }}>Red = Loss</span>
                    {' '}·{' '}
                    <span style={{ color: 'rgba(96,165,250,0.8)' }}>- - Momentum</span>
                  </p>
                </>
              ) : (
                <h1 className="chart-title">Select a team</h1>
              )}
            </div>

            {activeLog && (
              <div className="stat-pills">
                <div className="pill">
                  <span className="pill-label">RECORD</span>
                  <span className="pill-val">
                    {activeLog.record.wins}–{activeLog.record.losses}
                  </span>
                </div>
                <div className="pill">
                  <span className="pill-label">WIN %</span>
                  <span className="pill-val up">{winPct}%</span>
                </div>
                <div className="pill">
                  <span className="pill-label">STREAK</span>
                  <span
                    className="pill-val"
                    style={{ color: activeLog.streak.startsWith('W') ? '#4ade80' : '#f87171' }}
                  >
                    {activeLog.streak}
                  </span>
                </div>
                <div className="pill">
                  <span className="pill-label">MOMENTUM</span>
                  <span
                    className="pill-val"
                    style={{
                      color:
                        activeLog.momentum >= 65
                          ? '#4ade80'
                          : activeLog.momentum >= 40
                          ? '#fbbf24'
                          : '#f87171',
                    }}
                  >
                    {activeLog.momentum}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="chart-area">
            {chartLoading ? (
              <ChartSkeleton />
            ) : activeLog && activeLog.candles.length > 0 ? (
              <CandlestickChart
                candles={activeLog.candles}
                momentum={momentumSeries}
              />
            ) : activeTeam ? (
              <div className="no-data">No game data available yet for this season.</div>
            ) : (
              <div className="no-data">← Select a team to view their chart</div>
            )}
          </div>
        </main>

        {/* Right panel */}
        <StatsPanel log={activeLog} />
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@400;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #0d0f0e; color: #e8e4d9; }
        #__next, main { height: 100%; }
      `}</style>

      <style jsx>{`
        .root {
          display: flex; flex-direction: column;
          height: 100vh; background: #0d0f0e;
          font-family: 'IBM Plex Mono', monospace;
          overflow: hidden;
        }
        .header {
          background: #111413;
          border-bottom: 1px solid #1e2320;
          padding: 0 20px;
          height: 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 18px;
          letter-spacing: -0.5px; color: #e8e4d9;
        }
        .logo-accent { color: #4ade80; }
        .nav { display: flex; gap: 24px; }
        .nav-item {
          font-size: 11px; color: #3a4240;
          cursor: pointer; transition: color 0.15s;
          padding: 4px 0;
        }
        .nav-item:hover { color: #e8e4d9; }
        .nav-item.active { color: #4ade80; border-bottom: 1px solid #4ade80; }
        .season-badge {
          font-size: 10px; color: #2d3330;
          border: 1px solid #1e2320;
          padding: 3px 8px; border-radius: 3px;
        }
        .header-right { display: flex; align-items: center; gap: 12px; }
        .body {
          flex: 1; display: grid;
          grid-template-columns: 180px 1fr 220px;
          overflow: hidden;
        }
        .main {
          display: flex; flex-direction: column;
          overflow: hidden; padding: 16px 20px; gap: 12px;
        }
        .chart-header {
          display: flex; justify-content: space-between;
          align-items: flex-start; flex-shrink: 0;
        }
        .chart-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 22px; color: #e8e4d9;
          line-height: 1; letter-spacing: -0.5px;
        }
        .chart-subtitle {
          font-size: 9px; color: #3a4240; margin-top: 5px; letter-spacing: 0.5px;
        }
        .stat-pills { display: flex; gap: 6px; }
        .pill {
          background: #111413; border: 1px solid #1e2320;
          border-radius: 3px; padding: 6px 10px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .pill-label { font-size: 8px; color: #2d3330; letter-spacing: 0.5px; }
        .pill-val { font-size: 14px; font-weight: 600; color: #e8e4d9; }
        .pill-val.up { color: #4ade80; }
        .chart-area {
          flex: 1; min-height: 0;
          border: 1px solid #1e2320; border-radius: 4px;
          overflow: hidden; background: #0a0c0b;
        }
        .no-data {
          display: flex; align-items: center; justify-content: center;
          height: 100%; font-size: 11px; color: #2d3330;
        }
      `}</style>
    </div>
  );
}