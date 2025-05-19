import { NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';
import { processDocumentForRAG } from '@/lib/document-processor';
import { getVectorStore } from '@/lib/embeddings-service';

// In-memory file metadata storage (in production, use a database)
// This should match the structure in the files API
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
  processed?: boolean;
}

// This is a placeholder, in a real app, this would be shared with the route.ts file
const fileMetadata: FileMetadata[] = [];

// POST endpoint to process a file and generate embeddings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileId } = body;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId parameter' },
        { status: 400 }
      );
    }
    
    // Find the file metadata
    const file = fileMetadata.find(f => f.id === fileId);
    
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
    
    // Process the document for RAG
    const processedDocument = await processDocumentForRAG(file.path, {
      id: file.id,
      caseId: file.caseId,
      originalName: file.originalName,
      type: file.type,
      uploadedAt: file.uploadedAt
    });
    
    // Store the processed document in the vector store
    const vectorStore = getVectorStore();
    await vectorStore.addDocument(processedDocument);
    
    // Mark the file as processed
    const fileIndex = fileMetadata.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
      fileMetadata[fileIndex].processed = true;
    }
    
    return NextResponse.json({
      success: true,
      message: 'File processed successfully',
      documentId: processedDocument.documentId,
      chunksCount: processedDocument.chunks.length
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a file has been processed
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  
  try {
    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId parameter' },
        { status: 400 }
      );
    }
    
    // Find the file metadata
    const file = fileMetadata.find(f => f.id === fileId);
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      fileId: file.id,
      processed: file.processed || false
    });
  } catch (error) {
    console.error('Error checking file processing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 