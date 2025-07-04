import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { caseId: string } }) {
  const { caseId } = params;
  const csvPath = path.join(process.cwd(), 'public/data/cases.csv');
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const header = lines[0].split(',');
    const caseLine = lines.find((line, idx) => idx > 0 && line.split(',')[0] === caseId);
    if (!caseLine) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    const cols = caseLine.split(',');
    const caseData: Record<string, string> = {};
    header.forEach((key, i) => {
      caseData[key] = cols[i];
    });
    return NextResponse.json(caseData);
  } catch (error) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
} 