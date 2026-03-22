import { NextResponse } from 'next/server';
import { getTeamById, getTeamGames } from '@/lib/api';
import { buildTeamGameLog } from '@/lib/transform';

export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // Next.js 15: params is a Promise and must be awaited
  const { teamId: teamIdStr } = await params;
  const teamId = parseInt(teamIdStr, 10);

  if (isNaN(teamId)) {
    return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
  }

  try {
    const [team, games] = await Promise.all([
      getTeamById(teamId),
      getTeamGames(teamId, 2024),
    ]);

    const gameLog = buildTeamGameLog(team, games);
    return NextResponse.json(gameLog);
  } catch (err) {
    console.error(`[/api/games/${teamId}]`, err);
    return NextResponse.json({ error: 'Failed to fetch game log' }, { status: 500 });
  }
}