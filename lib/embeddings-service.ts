import { ProcessedDocument, DocumentChunk } from './document-processor';
import path from 'path';
import fs from 'fs';

/**
 * Interface para o serviço de embeddings
 */
export interface EmbeddingService {
  // Gerar embeddings para um texto
  generateEmbedding(text: string): Promise<number[]>;
  
  // Gerar embeddings para um array de textos
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  
  // Calcular similaridade entre dois embeddings
  calculateSimilarity(embedding1: number[], embedding2: number[]): number;
}

/**
 * Serviço de embedding mock para desenvolvimento local
 * Em produção, você usaria uma API como OpenAI ou HuggingFace
 */
export class MockEmbeddingService implements EmbeddingService {
  // Tamanho simulado do vetor de embedding
  private dimension = 384;
  
  async generateEmbedding(text: string): Promise<number[]> {
    // Gerar um embedding mock
    // Em produção, você usaria um modelo de linguagem real
    return Array(this.dimension).fill(0).map(() => Math.random() * 2 - 1);
  }
  
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Gerar embeddings para todos os textos
    return Promise.all(texts.map(text => this.generateEmbedding(text)));
  }
  
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    // Calcular similaridade de cosseno entre dois vetores
    if (embedding1.length !== embedding2.length) {
      throw new Error('Os embeddings devem ter a mesma dimensão');
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] ** 2;
      norm2 += embedding2[i] ** 2;
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

/**
 * Interface para o repositório de documentos vetorizados
 */
export interface VectorStore {
  // Adicionar um documento ao repositório
  addDocument(document: ProcessedDocument): Promise<void>;
  
  // Adicionar múltiplos documentos ao repositório
  addDocuments(documents: ProcessedDocument[]): Promise<void>;
  
  // Buscar documentos similares a uma consulta
  searchSimilar(query: string, limit?: number): Promise<DocumentSearchResult[]>;
  
  // Buscar documentos relacionados a um caso
  searchByCaseId(caseId: string, query?: string, limit?: number): Promise<DocumentSearchResult[]>;
}

export interface DocumentSearchResult {
  chunk: DocumentChunk;
  similarity: number;
  documentId: string;
  caseId: string;
}

/**
 * Implementação básica de um repositório de vetores em memória com persistência em arquivo
 */
export class FileBasedVectorStore implements VectorStore {
  private documents: ProcessedDocument[] = [];
  private embeddingService: EmbeddingService;
  private dataDir: string;
  private dataFile: string;

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
    this.dataDir = path.join(process.cwd(), 'data', 'vector-store');
    this.dataFile = path.join(this.dataDir, 'documents.json');
    
    // Criar diretório se não existir
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Carregar documentos existentes se o arquivo existir
    if (fs.existsSync(this.dataFile)) {
      try {
        this.documents = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
      } catch (error) {
        console.error('Erro ao carregar documentos do arquivo:', error);
      }
    }
  }
  
  private saveToFile() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.documents, null, 2));
    } catch (error) {
      console.error('Erro ao salvar documentos no arquivo:', error);
    }
  }
  
  async addDocument(document: ProcessedDocument): Promise<void> {
    // Gerar embeddings para todos os chunks do documento
    for (const chunk of document.chunks) {
      if (!chunk.embedding) {
        chunk.embedding = await this.embeddingService.generateEmbedding(chunk.content);
      }
    }
    
    // Verificar se o documento já existe e substituir se for o caso
    const existingIndex = this.documents.findIndex(doc => doc.documentId === document.documentId);
    
    if (existingIndex >= 0) {
      this.documents[existingIndex] = document;
    } else {
      this.documents.push(document);
    }
    
    // Salvar no arquivo
    this.saveToFile();
  }
  
  async addDocuments(documents: ProcessedDocument[]): Promise<void> {
    for (const document of documents) {
      await this.addDocument(document);
    }
  }
  
  async searchSimilar(query: string, limit: number = 5): Promise<DocumentSearchResult[]> {
    // Gerar embedding para a consulta
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    
    // Calcular similaridade com todos os chunks de todos os documentos
    const results: DocumentSearchResult[] = [];
    
    for (const document of this.documents) {
      for (const chunk of document.chunks) {
        if (chunk.embedding) {
          const similarity = this.embeddingService.calculateSimilarity(queryEmbedding, chunk.embedding);
          
          results.push({
            chunk,
            similarity,
            documentId: document.documentId,
            caseId: document.caseId
          });
        }
      }
    }
    
    // Ordenar por similaridade (do maior para o menor)
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Retornar os top N resultados
    return results.slice(0, limit);
  }
  
  async searchByCaseId(caseId: string, query?: string, limit: number = 10): Promise<DocumentSearchResult[]> {
    if (query) {
      // Se houver consulta, buscar por similaridade e depois filtrar por caseId
      const allResults = await this.searchSimilar(query, 100); // Buscar mais resultados para filtrar depois
      return allResults
        .filter(result => result.caseId === caseId)
        .slice(0, limit);
    } else {
      // Se não houver consulta, retornar todos os chunks do caso
      const results: DocumentSearchResult[] = [];
      
      for (const document of this.documents.filter(doc => doc.caseId === caseId)) {
        for (const chunk of document.chunks) {
          results.push({
            chunk,
            similarity: 1.0, // Sem consulta, consideramos similaridade máxima
            documentId: document.documentId,
            caseId: document.caseId
          });
        }
      }
      
      return results.slice(0, limit);
    }
  }
}

// Instância singleton do serviço de embedding
let embeddingServiceInstance: EmbeddingService | null = null;

// Instância singleton do repositório de vetores
let vectorStoreInstance: VectorStore | null = null;

// Obter (ou criar) o serviço de embedding
export function getEmbeddingService(): EmbeddingService {
  if (!embeddingServiceInstance) {
    embeddingServiceInstance = new MockEmbeddingService();
  }
  return embeddingServiceInstance;
}

// Obter (ou criar) o repositório de vetores
export function getVectorStore(): VectorStore {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new FileBasedVectorStore(getEmbeddingService());
  }
  return vectorStoreInstance;
} 