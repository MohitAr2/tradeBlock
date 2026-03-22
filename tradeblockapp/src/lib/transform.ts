import { BDLGame, BDLTeam, OHLCCandle, TeamGameLog, MomentumPoint } from '@/types';

export function transformGamesToCandles(
  games: BDLGame[],
  team: BDLTeam
): OHLCCandle[] {
  return games.map(game => {
    const isHome = game.home_team.id === team.id;
    const myScore = isHome ? game.home_team_score : game.visitor_team_score;
    const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
    const opponent = isHome ? game.visitor_team : game.home_team;
    const win = myScore > oppScore;
    const margin = myScore - oppScore;

    // OHLC mapping:
    // open  = opponent score (the "price" you opened against)
    // close = your final score (where you "closed")
    // high  = the higher of the two scores (top of range)
    // low   = the lower of the two scores (bottom of range)
    // Green candle (close > open) = win, Red = loss
    return {
      time: game.date.slice(0, 10),
      open: oppScore,
      close: myScore,
      high: Math.max(myScore, oppScore),
      low: Math.min(myScore, oppScore),
      win,
      opponent: opponent.abbreviation,
      margin,
      homeGame: isHome,
    };
  });
}

export function computeRecord(candles: OHLCCandle[]) {
  const wins = candles.filter(c => c.win).length;
  return { wins, losses: candles.length - wins };
}

export function computeStreak(candles: OHLCCandle[]): string {
  if (candles.length === 0) return '-';
  const last = candles[candles.length - 1];
  let count = 1;
  const type = last.win ? 'W' : 'L';
  for (let i = candles.length - 2; i >= 0; i--) {
    if (candles[i].win === last.win) count++;
    else break;
  }
  return `${type}${count}`;
}

// Rolling momentum: weighted win-rate over last N games + margin factor
// Returns 0–100
export function computeMomentum(candles: OHLCCandle[], window: number = 10): number {
  if (candles.length === 0) return 50;
  const slice = candles.slice(-window);
  const wins = slice.filter(c => c.win).length;
  const winRate = wins / slice.length; // 0–1
  const avgMargin = slice.reduce((a, c) => a + c.margin, 0) / slice.length;
  // normalize margin: assume ±30 is the range
  const normMargin = Math.max(-1, Math.min(1, avgMargin / 30));
  // 70% weight on win rate, 30% on margin
  const raw = 0.7 * winRate + 0.3 * ((normMargin + 1) / 2);
  return Math.round(raw * 100);
}

// Rolling momentum series for chart overlay
export function computeMomentumSeries(
  candles: OHLCCandle[],
  window: number = 5
): MomentumPoint[] {
  return candles.map((c, i) => {
    const slice = candles.slice(Math.max(0, i - window + 1), i + 1);
    const wins = slice.filter(x => x.win).length;
    const winRate = wins / slice.length;
    const avgMargin = slice.reduce((a, x) => a + x.margin, 0) / slice.length;
    const normMargin = Math.max(-1, Math.min(1, avgMargin / 30));
    const raw = 0.7 * winRate + 0.3 * ((normMargin + 1) / 2);
    // scale to score range so it overlays nicely on candlestick
    return { date: c.time, value: Math.round(raw * 100) };
  });
}

export function buildTeamGameLog(
  team: BDLTeam,
  games: BDLGame[]
): TeamGameLog {
  const candles = transformGamesToCandles(games, team);
  return {
    team,
    candles,
    record: computeRecord(candles),
    streak: computeStreak(candles),
    momentum: computeMomentum(candles),
  };
}