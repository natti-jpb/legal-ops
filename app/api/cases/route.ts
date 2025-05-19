import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const newCase = await request.json();
    
    // Read the current CSV file
    const csvPath = path.join(process.cwd(), 'public/data/cases.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Add the new case to the CSV
    const newRow = [
      newCase.id,
      newCase.title,
      newCase.type,
      newCase.status,
      newCase.court,
      newCase.judge,
      newCase.lastUpdated,
      newCase.transcriptCount,
      newCase.description
    ].join(',');
    
    // Append the new row to the CSV
    fs.appendFileSync(csvPath, '\n' + newRow);

    // Create case folder
    const caseFolderPath = path.join(process.cwd(), 'public/data/case-files', newCase.id);
    if (!fs.existsSync(caseFolderPath)) {
      fs.mkdirSync(caseFolderPath, { recursive: true });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding case:', error);
    return NextResponse.json(
      { error: 'Failed to add case' },
      { status: 500 }
    );
  }
} 