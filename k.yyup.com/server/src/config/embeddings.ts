/**
 * 向量嵌入配置
 */

export interface EmbeddingConfig {
  provider: 'openai' | 'local' | 'none';
  model?: string;
  dimensions?: number;
  apiKey?: string;
}

export const embeddingConfig: EmbeddingConfig = {
  provider: 'none', // 暂时禁用向量嵌入，使用简单的文本搜索
  model: 'text-embedding-ada-002',
  dimensions: 384,
  apiKey: process.env.OPENAI_API_KEY
};

/**
 * 生成文本的向量嵌入（临时实现）
 * 在实际生产环境中，应该使用真实的嵌入模型
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // 临时实现：返回一个固定维度的随机向量
  const dimensions = embeddingConfig.dimensions || 384;
  const embedding: number[] = [];
  
  // 使用文本哈希生成伪随机向量（保证相同文本生成相同向量）
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // 生成向量
  for (let i = 0; i < dimensions; i++) {
    // 使用哈希和索引生成伪随机数
    const seed = hash + i;
    const x = Math.sin(seed) * 10000;
    embedding.push(x - Math.floor(x));
  }
  
  return embedding;
}

/**
 * 计算两个向量的余弦相似度
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('向量维度不匹配');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }
  
  return dotProduct / (norm1 * norm2);
}