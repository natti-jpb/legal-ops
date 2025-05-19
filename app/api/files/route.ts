import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Storage paths
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
// Ensure upload directory exists
async function ensureUploadDir(caseId: string) {
  const casePath = path.join(UPLOAD_DIR, caseId);
  if (!existsSync(casePath)) {
    await mkdir(casePath, { recursive: true });
  }
  return casePath;
}

// In-memory file metadata storage (in production, use a database)
interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  caseId: string;
  uploadedBy: string;
  uploadedAt: string;
  type: string; // 'transcript', 'evidence', 'legal_document', etc.
  description?: string;
}

const fileMetadata: FileMetadata[] = [];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    
    // Validate required fields
    if (!file || !caseId || !userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type (can be expanded based on requirements)
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, TXT, DOC, and DOCX are allowed.' },
        { status: 400 }
      );
    }
    
    // Generate unique filename to prevent overwriting
    const fileExt = path.extname(file.name);
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}${fileExt}`;

    // Ensure the upload directory exists
    const uploadPath = await ensureUploadDir(caseId);
    const filePath = path.join(uploadPath, fileName);
    
    // Write the file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Create metadata for the file
    const metadata: FileMetadata = {
      id: uniqueId,
      originalName: file.name,
      fileName: fileName,
      mimeType: file.type,
      size: file.size,
      path: filePath,
      caseId: caseId,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      type: type,
      description: description,
    };
    
    // Store metadata (in a real app, save to database)
    fileMetadata.push(metadata);

    // Return metadata without sensitive path information
    const safeMetadata = {
      id: metadata.id,
      originalName: metadata.originalName,
      mimeType: metadata.mimeType,
      size: metadata.size,
      caseId: metadata.caseId,
      uploadedAt: metadata.uploadedAt,
      type: metadata.type,
      description: metadata.description,
      url: `/api/files/${metadata.id}`,
    };
    
    return NextResponse.json(safeMetadata, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET all files for a case
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get('caseId');
  
  try {
    if (!caseId) {
      return NextResponse.json(
        { error: 'Missing caseId parameter' },
        { status: 400 }
      );
    }
    
    // Filter files by caseId
    const files = fileMetadata.filter(file => file.caseId === caseId);
    
    // Return without sensitive path information
    const safeFiles = files.map(file => ({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      caseId: file.caseId,
      uploadedAt: file.uploadedAt,
      type: file.type,
      description: file.description,
      url: `/api/files/${file.id}`,
    }));
    
    return NextResponse.json(safeFiles);
  } catch (error) {
    console.error('Error retrieving files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 