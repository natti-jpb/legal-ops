import { readFile } from 'fs/promises';
import path from 'path';

// Interface para documentos processados
export interface ProcessedDocument {
  documentId: string;
  caseId: string;
  metadata: {
    title: string;
    originalName: string;
    type: string;
    uploadedAt: string;
  };
  chunks: DocumentChunk[];
}

// Interface para fragmentos de documentos
export interface DocumentChunk {
  chunkId: string;
  documentId: string;
  content: string;
  metadata: {
    pageNumber?: number;
    paragraph?: number;
    section?: string;
  };
  embedding?: number[]; // Vetor de embedding, se disponível
}

/**
 * Classe base para processar documentos
 * Esta classe será estendida para diferentes tipos de documentos
 */
export abstract class DocumentProcessor {
  protected filepath: string;
  protected metadata: any;

  constructor(filepath: string, metadata: any) {
    this.filepath = filepath;
    this.metadata = metadata;
  }

  /**
   * Método abstrato para processar um documento e dividi-lo em chunks
   */
  abstract process(): Promise<DocumentChunk[]>;

  /**
   * Método para dividir texto em chunks para embedding
   */
  protected splitIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    // Se o texto for menor que o tamanho do chunk, retorne o texto inteiro
    if (text.length <= chunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      // Determine o fim do chunk
      let endIndex = startIndex + chunkSize;
      
      // Se não estivermos no final do texto, tente encontrar um ponto final próximo
      if (endIndex < text.length) {
        // Procure por um ponto final ou quebra de linha para terminar o chunk
        const nextPeriod = text.indexOf('.', endIndex - 100);
        const nextNewline = text.indexOf('\n', endIndex - 100);
        
        // Use o mais próximo se estiver dentro de um intervalo razoável
        if (nextPeriod > 0 && nextPeriod < endIndex + 100) {
          endIndex = nextPeriod + 1; // Incluir o ponto final
        } else if (nextNewline > 0 && nextNewline < endIndex + 100) {
          endIndex = nextNewline + 1; // Incluir a quebra de linha
        }
      } else {
        endIndex = text.length; // Final do texto
      }

      // Adicione o chunk
      chunks.push(text.substring(startIndex, endIndex).trim());
      
      // Avance o índice inicial, considerando a sobreposição
      startIndex = endIndex - overlap;
    }

    return chunks;
  }
}

/**
 * Processador para arquivos de texto simples
 */
export class TextDocumentProcessor extends DocumentProcessor {
  async process(): Promise<DocumentChunk[]> {
    // Ler o arquivo de texto
    const buffer = await readFile(this.filepath);
    const text = buffer.toString('utf-8');
    
    // Dividir o texto em chunks
    const textChunks = this.splitIntoChunks(text);
    
    // Criar chunks de documento
    const documentChunks: DocumentChunk[] = textChunks.map((chunkText, index) => {
      return {
        chunkId: `${this.metadata.id}_chunk_${index}`,
        documentId: this.metadata.id,
        content: chunkText,
        metadata: {
          paragraph: index + 1
        }
      };
    });
    
    return documentChunks;
  }
}

/**
 * Factory para criar o processador adequado com base no tipo de arquivo
 */
export function createDocumentProcessor(filepath: string, metadata: any): DocumentProcessor {
  const fileExtension = path.extname(filepath).toLowerCase();
  
  // Por enquanto, só suportamos texto plano
  // Em uma implementação real, você adicionaria suporte para PDF, DOC, etc.
  return new TextDocumentProcessor(filepath, metadata);
}

/**
 * Função principal para processar um documento para RAG
 */
export async function processDocumentForRAG(filepath: string, metadata: any): Promise<ProcessedDocument> {
  // Criar o processador apropriado
  const processor = createDocumentProcessor(filepath, metadata);
  
  // Processar o documento
  const chunks = await processor.process();
  
  // Retornar o documento processado
  return {
    documentId: metadata.id,
    caseId: metadata.caseId,
    metadata: {
      title: metadata.originalName,
      originalName: metadata.originalName,
      type: metadata.type,
      uploadedAt: metadata.uploadedAt
    },
    chunks
  };
} 