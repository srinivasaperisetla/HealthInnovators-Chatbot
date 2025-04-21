// app/api/nppes/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { postal_code, limit = 10 } = await req.json();

  const url = new URL('https://npiregistry.cms.hhs.gov/api/');
  url.searchParams.append('version', '2.1');
  url.searchParams.append('postal_code', postal_code);
  url.searchParams.append('limit', limit.toString());

  const res = await fetch(url.toString(), { cache: 'no-store' });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch NPI data' }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data.results || []);
}