import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { caseId: string } }) {
  const { caseId } = params;
  const contextPath = path.join(process.cwd(), 'public/data/case-files', caseId, 'context.json');
  try {
    const fileContent = fs.readFileSync(contextPath, 'utf-8');
    const caseData = JSON.parse(fileContent);
    return NextResponse.json(caseData);
  } catch (error) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
} 