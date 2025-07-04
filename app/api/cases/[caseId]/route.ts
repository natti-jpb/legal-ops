import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function PUT(request: NextRequest, { params }: { params: { caseId: string } }) {
  const { caseId } = params;
  const body = await request.json();
  const csvPath = path.join(process.cwd(), 'public/data/cases.csv');
  const now = new Date().toISOString().split('T')[0];

  try {
    //Read the current CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const header = lines[0];
    //Update the relevant row in the CSV file
    const updatedLines = lines.map((line, idx) => {
      if (idx === 0) return line;
      const cols = line.split(',');
      if (cols[0] === caseId) {
        // Update the row with new data
        return [
          caseId,
          body.title,
          body.type,
          cols[3], // status (unchanged)
          body.court,
          body.judge,
          now,
          cols[7], // transcriptCount (unchanged)
          cols[8]  // description (unchanged)
        ].join(',');
      }
      return line;
    });
    fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf-8');

    // Find the updated columns for this caseId
    const updatedCsvContent = fs.readFileSync(csvPath, 'utf-8');
    const updatedLinesArr = updatedCsvContent.split('\n');
    const updatedCols = updatedLinesArr.find((line, idx) => idx > 0 && line.split(',')[0] === caseId)?.split(',') || [];

    // Update the context.json file for this case
    // Build the folder path for the case
    const caseFolderPath = path.join(process.cwd(), 'public/data/case-files', caseId);
    // Ensure the folder exists
    if (!fs.existsSync(caseFolderPath)) {
      fs.mkdirSync(caseFolderPath, { recursive: true });
    }
    // Build the context.json file path
    const contextFilePath = path.join(caseFolderPath, 'context.json');
    // Prepare the context data (use updated info, set lastUpdated to now)
    // Optionally, preserve filingDate if it exists
    let filingDate = new Date().toISOString();
    if (fs.existsSync(contextFilePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(contextFilePath, 'utf-8'));
        if (existing.filingDate) filingDate = existing.filingDate;
      } catch {}
    }
    const contextData = {
      id: caseId,
      title: body.title,
      type: body.type,
      status: updatedCols[3] || 'Active',
      court: body.court,
      judge: body.judge,
      lastUpdated: now,
      transcriptCount: updatedCols[7] || 0,
      description: updatedCols[8] || '',
      filingDate,
    };
    //    e. Write the updated context.json file
    fs.writeFileSync(contextFilePath, JSON.stringify(contextData, null, 2), 'utf-8');

    // 4. Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
  }
} 