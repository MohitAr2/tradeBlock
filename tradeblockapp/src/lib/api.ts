import { BDLGame, BDLTeam } from '@/types';

const BASE = 'https://api.balldontlie.io/nba/v1';

function getHeaders() {
  const key = process.env.BDL_API_KEY;
  if (!key) throw new Error('BDL_API_KEY is not set in environment variables');
  return {
    'Authorization': key,
    'Accept': 'application/json',
  };
}

async function bdlFetch<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`BDL API ${res.status} — ${path} — ${body}`);
  }

  return res.json();
}

export async function getAllTeams(): Promise<BDLTeam[]> {
  const data = await bdlFetch<{ data: BDLTeam[] }>('/teams?per_page=100');
  // ids 1–30 are current NBA franchises; 37+ are historical/defunct teams
  return data.data.filter(
    (t) => t.id <= 30 && t.full_name && t.abbreviation && t.conference?.trim()
  );
}

export async function getTeamById(id: number): Promise<BDLTeam> {
  const data = await bdlFetch<{ data: BDLTeam }>(`/teams/${id}`);
  return data.data;
}

export async function getTeamGames(
  teamId: number,
  season: number = 2024,
  perPage: number = 100
): Promise<BDLGame[]> {
  const data = await bdlFetch<{
    data: BDLGame[];
    meta: { next_cursor?: number; per_page: number };
  }>(`/games?team_ids[]=${teamId}&seasons[]=${season}&per_page=${perPage}`);

  return data.data
    .filter((g) => g.status === 'Final')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}