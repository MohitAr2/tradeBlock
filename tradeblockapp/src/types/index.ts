export interface BDLTeam {
  id: number;
  abbreviation: string;
  city: string;
  conference: string;
  division: string;
  full_name: string;
  name: string;
}

export interface BDLGame {
  id: number;
  date: string;
  home_team: BDLTeam;
  home_team_score: number;
  visitor_team: BDLTeam;
  visitor_team_score: number;
  status: string;
  period: number;
}

export interface BDLStats {
  id: number;
  ast: number;
  blk: number;
  dreb: number;
  fg3_pct: number;
  fg3a: number;
  fg3m: number;
  fg_pct: number;
  fga: number;
  fgm: number;
  ft_pct: number;
  fta: number;
  ftm: number;
  game: { id: number };
  min: string;
  oreb: number;
  pf: number;
  player: { id: number; first_name: string; last_name: string };
  pts: number;
  reb: number;
  stl: number;
  team: BDLTeam;
  turnover: number;
}

export interface OHLCCandle {
  time: string;       // ISO date
  open: number;       // opponent score (what you faced)
  high: number;       // max of both scores
  low: number;        // min of both scores
  close: number;      // your final score
  win: boolean;
  opponent: string;
  margin: number;     // positive = won, negative = lost
  homeGame: boolean;
}

export interface TeamGameLog {
  team: BDLTeam;
  candles: OHLCCandle[];
  record: { wins: number; losses: number };
  streak: string;
  momentum: number;   // 0–100 rolling score
}

export interface MomentumPoint {
  date: string;
  value: number;
}