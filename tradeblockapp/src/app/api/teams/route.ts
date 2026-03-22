import { NextResponse } from 'next/server';
import { getAllTeams } from '@/lib/api';

export const revalidate = 86400; // cache 24hr — teams don't change

export async function GET() {
  try {
    const teams = await getAllTeams();
    // filter to only NBA teams (excludes G-League etc.)
    const nba = teams.filter(t => t.full_name && t.abbreviation);
    return NextResponse.json({ teams: nba });
  } catch (err) {
    console.error('[/api/teams]', err);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}