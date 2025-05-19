import { NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/embeddings-service';

// POST endpoint for semantic search
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, caseId, limit = 5 } = body;
    
    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      );
    }
    
    const vectorStore = getVectorStore();
    let results;
    
    // If caseId is provided, search only within that case
    if (caseId) {
      results = await vectorStore.searchByCaseId(caseId, query, limit);
    } else {
      // Otherwise, search across all documents
      results = await vectorStore.searchSimilar(query, limit);
    }
    
    // Format the results to remove any sensitive information
    const formattedResults = results.map(result => ({
      content: result.chunk.content,
      metadata: {
        documentId: result.documentId,
        caseId: result.caseId,
        similarity: result.similarity,
        pageNumber: result.chunk.metadata.pageNumber,
        paragraph: result.chunk.metadata.paragraph,
        section: result.chunk.metadata.section,
      }
    }));
    
    return NextResponse.json({
      results: formattedResults,
      query,
      caseId: caseId || null,
      count: formattedResults.length
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for semantic search (alternative to POST)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const caseId = searchParams.get('caseId');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : 5;
  
  try {
    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      );
    }
    
    const vectorStore = getVectorStore();
    let results;
    
    // If caseId is provided, search only within that case
    if (caseId) {
      results = await vectorStore.searchByCaseId(caseId, query, limit);
    } else {
      // Otherwise, search across all documents
      results = await vectorStore.searchSimilar(query, limit);
    }
    
    // Format the results to remove any sensitive information
    const formattedResults = results.map(result => ({
      content: result.chunk.content,
      metadata: {
        documentId: result.documentId,
        caseId: result.caseId,
        similarity: result.similarity,
        pageNumber: result.chunk.metadata.pageNumber,
        paragraph: result.chunk.metadata.paragraph,
        section: result.chunk.metadata.section,
      }
    }));
    
    return NextResponse.json({
      results: formattedResults,
      query,
      caseId: caseId || null,
      count: formattedResults.length
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 