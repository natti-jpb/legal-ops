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

    // Create documents folder
    const documentsFolderPath = path.join(caseFolderPath, 'documents');
    if (!fs.existsSync(documentsFolderPath)) {
      fs.mkdirSync(documentsFolderPath, { recursive: true });
    }

    // Write empty documents.json file with required fields structure
    const documentsJsonPath = path.join(documentsFolderPath, 'documents.json');
    // Array of document objects, each with id, name, type, date (easy to add more fields later)
    fs.writeFileSync(documentsJsonPath, JSON.stringify([], null, 2), 'utf-8');

    // Write context.json file with all case information
    const contextFilePath = path.join(caseFolderPath, 'context.json');
    const contextData = {
      ...newCase,
      "filingDate": new Date().toISOString(),
    };
    fs.writeFileSync(contextFilePath, JSON.stringify(contextData, null, 2), 'utf-8');
    
    // Write empty participants.json file
    const participantsJsonPath = path.join(caseFolderPath, 'participants.json');
    fs.writeFileSync(participantsJsonPath, JSON.stringify([], null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding case:', error);
    return NextResponse.json(
      { error: 'Failed to add case' },
      { status: 500 }
    );
  }
} 