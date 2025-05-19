import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'app/data/cases.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV and get all case IDs
    const rows = csvContent.split('\n').slice(1); // Skip header row
    const caseIds = rows.map(row => row.split(',')[0]); // Get first column (ID)
    
    // Create base directory if it doesn't exist
    const baseDir = path.join(process.cwd(), 'public/data/case-files');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Create folder for each case
    const createdFolders = [];
    for (const caseId of caseIds) {
      if (caseId) { // Skip empty IDs
        const caseFolderPath = path.join(baseDir, caseId);
        if (!fs.existsSync(caseFolderPath)) {
          fs.mkdirSync(caseFolderPath, { recursive: true });
          createdFolders.push(caseId);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Created ${createdFolders.length} folders`,
      createdFolders 
    });
  } catch (error) {
    console.error('Error creating case folders:', error);
    return NextResponse.json(
      { error: 'Failed to create case folders' },
      { status: 500 }
    );
  }
} 