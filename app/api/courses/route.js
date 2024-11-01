// app/api/programs/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    const jsonPath = path.join(process.cwd(), 'data', 'courses.json');
    const fileContents = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading program data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program data' },
      { status: 500 }
    );
  }
}
