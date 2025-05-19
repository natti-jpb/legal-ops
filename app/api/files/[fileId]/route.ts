import { NextResponse } from 'next/server';
import { readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// In-memory file metadata storage (in production, use a database)
// This should match the structure in route.ts
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
  type: string;
  description?: string;
}

// This is a placeholder, in a real app, this would be shared with the route.ts file
// through a database or a shared module
const fileMetadata: FileMetadata[] = [];

// Find file metadata by ID
function findFileById(fileId: string) {
  return fileMetadata.find(file => file.id === fileId);
}

// GET file by ID (download)
export async function GET(
  request: Request, 
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;
  
  try {
    const file = findFileById(fileId);
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Check if file exists on disk
    if (!existsSync(file.path)) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }
    
    // Read file and return as response
    const fileContent = await readFile(file.path);
    
    // Create response with file content
    const response = new NextResponse(fileContent);
    
    // Set headers for file download
    response.headers.set('Content-Type', file.mimeType);
    response.headers.set('Content-Disposition', `attachment; filename="${file.originalName}"`);
    response.headers.set('Content-Length', file.size.toString());
    
    return response;
  } catch (error) {
    console.error(`Error retrieving file ${fileId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE file by ID
export async function DELETE(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;
  
  try {
    const fileIndex = fileMetadata.findIndex(file => file.id === fileId);
    
    if (fileIndex === -1) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    const file = fileMetadata[fileIndex];
    
    // Delete file from disk if it exists
    if (existsSync(file.path)) {
      await unlink(file.path);
    }
    
    // Remove from metadata
    fileMetadata.splice(fileIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - update file metadata
export async function PATCH(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;
  
  try {
    const body = await request.json();
    const fileIndex = fileMetadata.findIndex(file => file.id === fileId);
    
    if (fileIndex === -1) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Only allow updating certain fields
    const allowedFields = ['type', 'description', 'originalName'];
    
    // Update only allowed fields
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        fileMetadata[fileIndex][key as keyof Pick<FileMetadata, 'type' | 'description' | 'originalName'>] = 
          body[key];
      }
    });
    
    // Return the updated metadata without sensitive path information
    const updatedFile = fileMetadata[fileIndex];
    const safeMetadata = {
      id: updatedFile.id,
      originalName: updatedFile.originalName,
      mimeType: updatedFile.mimeType,
      size: updatedFile.size,
      caseId: updatedFile.caseId,
      uploadedAt: updatedFile.uploadedAt,
      type: updatedFile.type,
      description: updatedFile.description,
      url: `/api/files/${updatedFile.id}`,
    };
    
    return NextResponse.json(safeMetadata);
  } catch (error) {
    console.error(`Error updating file ${fileId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 