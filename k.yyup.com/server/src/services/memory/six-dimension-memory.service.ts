/**
 * 六维记忆系统服务
 * 基于MIRIX架构实现的高级记忆管理系统
 * 
 * 六个记忆维度：
 * 1. Core Memory - 核心持久记忆
 * 2. Episodic Memory - 事件情节记忆
 * 3. Semantic Memory - 语义概念记忆
 * 4. Procedural Memory - 过程操作记忆
 * 5. Resource Memory - 资源引用记忆
 * 6. Knowledge Vault - 知识库记忆
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { generateEmbedding, cosineSimilarity } from '../../config/embeddings';
import { logger } from '../../utils/logger';
import { MemoryModels } from '../../models/memory/six-dimension-memory.model';

// ============= 接口定义 =============

interface MemoryConfig {
  maxEmbeddingDim: number;
  memoryWarningThreshold: number;
  contextWindow: number;
  enableVectorSearch: boolean;
  enableFullTextSearch: boolean;
}

interface MemoryBlock {
  id: string;
  label: string;
  value: string;
  limit: number;
  created_at: Date;
  updated_at: Date;
}

// 1. Core Memory - 核心记忆
interface CoreMemory {
  id: string;
  persona: MemoryBlock;  // AI角色设定
  human: MemoryBlock;    // 用户信息
  metadata: Record<string, any>;
}

// 2. Episodic Memory - 情节记忆
interface EpisodicEvent {
  id: string;
  event_type: string;
  summary: string;
  details: string;
  actor: 'user' | 'assistant' | 'system';
  tree_path: string[];  // 层级分类路径
  occurred_at: Date;
  created_at: Date;
  updated_at: Date;
  summary_embedding?: number[];
  details_embedding?: number[];
  metadata: Record<string, any>;
}

// 3. Semantic Memory - 语义记忆
interface SemanticConcept {
  id: string;
  name: string;
  description: string;
  category: string;
  relationships: {
    type: string;
    target_id: string;
    strength: number;
  }[];
  embedding?: number[];
  metadata: Record<string, any>;
}

// 4. Procedural Memory - 过程记忆
interface ProcedureStep {
  id: string;
  procedure_name: string;
  step_number: number;
  description: string;
  conditions: string[];
  actions: string[];
  expected_results: string[];
  metadata: Record<string, any>;
}

// 5. Resource Memory - 资源记忆
interface ResourceReference {
  id: string;
  resource_type: 'file' | 'url' | 'image' | 'document';
  name: string;
  location: string;
  summary: string;
  tags: string[];
  created_at: Date;
  accessed_at: Date;
  metadata: Record<string, any>;
}

// 6. Knowledge Vault - 知识库
interface KnowledgeEntry {
  id: string;
  domain: string;
  topic: string;
  content: string;
  source: string;
  confidence: number;
  embedding?: number[];
  created_at: Date;
  validated_at: Date;
  metadata: Record<string, any>;
}

// 记忆检索结果
interface MemorySearchResult {
  dimension: string;
  items: any[];
  relevance_scores: number[];
  total_count: number;
}

// ============= 记忆管理器基类 =============

abstract class MemoryManager<T> extends EventEmitter {
  protected memories: Map<string, T> = new Map();
  protected embeddings: Map<string, number[]> = new Map();
  
  constructor(protected dimension: string) {
    super();
  }

  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
  abstract search(query: string, limit?: number): Promise<T[]>;
  
  async get(id: string): Promise<T | null> {
    return this.memories.get(id) || null;
  }
  
  async getAll(): Promise<T[]> {
    return Array.from(this.memories.values());
  }
  
  protected generateId(): string {
    return `${this.dimension}_${uuidv4()}`;
  }
}

// ============= 具体记忆管理器实现 =============

// 1. 核心记忆管理器
class CoreMemoryManager extends MemoryManager<CoreMemory> {
  constructor() {
    super('core');
  }

  async create(data: Partial<CoreMemory>): Promise<CoreMemory> {
    try {
      // 使用数据库模型创建记录
      const dbRecord = await MemoryModels.CoreMemory.create({
        user_id: data.metadata?.userId || 'default',
        persona_value: data.persona?.value || '我是YY-AI智能助手，专业的幼儿园管理顾问。',
        persona_limit: data.persona?.limit || 2000,
        human_value: data.human?.value || '',
        human_limit: data.human?.limit || 2000,
        metadata: data.metadata || {}
      });

      // 转换为内部格式
      const memory: CoreMemory = {
        id: dbRecord.id,
        persona: {
          id: uuidv4(),
          label: 'persona',
          value: dbRecord.persona_value,
          limit: dbRecord.persona_limit,
          created_at: dbRecord.created_at,
          updated_at: dbRecord.updated_at
        },
        human: {
          id: uuidv4(),
          label: 'human',
          value: dbRecord.human_value,
          limit: dbRecord.human_limit,
          created_at: dbRecord.created_at,
          updated_at: dbRecord.updated_at
        },
        metadata: dbRecord.metadata
      };

      this.memories.set(memory.id, memory);
      this.emit('created', memory);
      return memory;
    } catch (error) {
      logger.error('创建核心记忆失败:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<CoreMemory>): Promise<CoreMemory> {
    try {
      // 更新数据库记录
      const [affectedCount] = await MemoryModels.CoreMemory.update({
        persona_value: data.persona?.value,
        persona_limit: data.persona?.limit,
        human_value: data.human?.value,
        human_limit: data.human?.limit,
        metadata: data.metadata
      }, {
        where: { id }
      });

      if (affectedCount === 0) {
        throw new Error(`Core memory ${id} not found`);
      }

      // 获取更新后的记录
      const dbRecord = await MemoryModels.CoreMemory.findByPk(id);
      if (!dbRecord) throw new Error(`Core memory ${id} not found after update`);

      // 转换为内部格式
      const updated: CoreMemory = {
        id: dbRecord.id,
        persona: {
          id: uuidv4(),
          label: 'persona',
          value: dbRecord.persona_value,
          limit: dbRecord.persona_limit,
          created_at: dbRecord.created_at,
          updated_at: dbRecord.updated_at
        },
        human: {
          id: uuidv4(),
          label: 'human',
          value: dbRecord.human_value,
          limit: dbRecord.human_limit,
          created_at: dbRecord.created_at,
          updated_at: dbRecord.updated_at
        },
        metadata: dbRecord.metadata
      };

      this.memories.set(id, updated);
      this.emit('updated', updated);
      return updated;
    } catch (error) {
      logger.error('更新核心记忆失败:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const affectedCount = await MemoryModels.CoreMemory.destroy({
        where: { id }
      });

      const result = affectedCount > 0;
      if (result) {
        this.memories.delete(id);
        this.emit('deleted', id);
      }
      return result;
    } catch (error) {
      logger.error('删除核心记忆失败:', error);
      throw error;
    }
  }

  async search(query: string, limit = 10): Promise<CoreMemory[]> {
    try {
      // 从数据库搜索
      const dbRecords = await MemoryModels.CoreMemory.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { persona_value: { [require('sequelize').Op.like]: `%${query}%` } },
            { human_value: { [require('sequelize').Op.like]: `%${query}%` } }
          ]
        },
        limit
      });

      // 转换为内部格式
      const results: CoreMemory[] = dbRecords.map(dbRecord => ({
        id: dbRecord.id,
        persona: {
          id: uuidv4(),
          label: 'persona',
          value: dbRecord.persona_value,
          limit: dbRecord.persona_limit,
          created_at: dbRecord.created_at,
          updated_at: dbRecord.updated_at
        },
        human: {
          id: uuidv4(),
          label: 'human',
          value: dbRecord.human_value,
          limit: dbRecord.human_limit,
          created_at: dbRecord.created_at,
          updated_at: dbRecord.updated_at
        },
        metadata: dbRecord.metadata
      }));

      // 更新内存缓存
      results.forEach(memory => {
        this.memories.set(memory.id, memory);
      });

      return results;
    } catch (error) {
      logger.error('搜索核心记忆失败:', error);
      return [];
    }
  }

  // 根据用户ID获取核心记忆
  async getByUserId(userId: string): Promise<CoreMemory[]> {
    try {
      const dbRecords = await MemoryModels.CoreMemory.findAll({
        where: { user_id: userId }
      });

      const results: CoreMemory[] = dbRecords.map(dbRecord => ({
        id: dbRecord.id,
        persona: {
          id: uuidv4(),
          label: 'persona',
          value: dbRecord.persona_value,
          limit: dbRecord.persona_limit,
          created_at: dbRecord.created_at,
          updated_at: dbRecord.updated_at
        },
        human: {
          id: uuidv4(),
          label: 'human',
          value: dbRecord.human_value,
          limit: dbRecord.human_limit,
          created_at: dbRecord.created_at,
          updated_at: dbRecord.updated_at
        },
        metadata: dbRecord.metadata
      }));

      // 更新内存缓存
      results.forEach(memory => {
        this.memories.set(memory.id, memory);
      });

      return results;
    } catch (error) {
      logger.error('获取用户核心记忆失败:', error);
      return [];
    }
  }

  async appendToBlock(memoryId: string, blockLabel: 'persona' | 'human', content: string): Promise<void> {
    const memory = this.memories.get(memoryId);
    if (!memory) throw new Error(`Core memory ${memoryId} not found`);
    
    const block = memory[blockLabel];
    const newValue = block.value + '\n' + content;
    if (newValue.length > block.limit) {
      throw new Error(`Content exceeds block limit of ${block.limit} characters`);
    }
    
    block.value = newValue;
    block.updated_at = new Date();
    this.emit('block_updated', { memoryId, blockLabel, block });
  }
}

// 2. 情节记忆管理器
class EpisodicMemoryManager extends MemoryManager<EpisodicEvent> {
  constructor() {
    super('episodic');
  }

  async create(data: Partial<EpisodicEvent>): Promise<EpisodicEvent> {
    try {
      // 生成嵌入向量
      let summary_embedding = null;
      let details_embedding = null;

      if (data.summary) {
        summary_embedding = await this.generateEmbedding(data.summary);
      }
      if (data.details) {
        details_embedding = await this.generateEmbedding(data.details);
      }

      // 使用数据库模型创建记录
      const dbRecord = await MemoryModels.EpisodicMemory.create({
        user_id: data.metadata?.userId || 'default',
        event_type: data.event_type || 'general',
        summary: data.summary || '',
        details: data.details || '',
        actor: data.actor || 'system',
        tree_path: data.tree_path || [],
        occurred_at: data.occurred_at || new Date(),
        summary_embedding,
        details_embedding,
        metadata: data.metadata || {}
      });

      // 转换为内部格式
      const event: EpisodicEvent = {
        id: dbRecord.id,
        event_type: dbRecord.event_type,
        summary: dbRecord.summary,
        details: dbRecord.details,
        actor: dbRecord.actor,
        tree_path: dbRecord.tree_path,
        occurred_at: dbRecord.occurred_at,
        created_at: dbRecord.created_at,
        updated_at: dbRecord.updated_at,
        summary_embedding: dbRecord.summary_embedding,
        details_embedding: dbRecord.details_embedding,
        metadata: dbRecord.metadata
      };

      this.memories.set(event.id, event);
      this.emit('created', event);
      return event;
    } catch (error) {
      logger.error('创建情节记忆失败:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<EpisodicEvent>): Promise<EpisodicEvent> {
    const existing = this.memories.get(id);
    if (!existing) throw new Error(`Episodic event ${id} not found`);
    
    const updated = { ...existing, ...data, updated_at: new Date() };
    
    // 更新嵌入向量
    if (data.summary && data.summary !== existing.summary) {
      updated.summary_embedding = await this.generateEmbedding(data.summary);
    }
    if (data.details && data.details !== existing.details) {
      updated.details_embedding = await this.generateEmbedding(data.details);
    }
    
    this.memories.set(id, updated);
    this.emit('updated', updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.memories.delete(id);
    if (result) this.emit('deleted', id);
    return result;
  }

  async search(query: string, limit = 10): Promise<EpisodicEvent[]> {
    try {
      // 从数据库搜索
      const dbRecords = await MemoryModels.EpisodicMemory.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { summary: { [require('sequelize').Op.like]: `%${query}%` } },
            { details: { [require('sequelize').Op.like]: `%${query}%` } }
          ]
        },
        limit,
        order: [['occurred_at', 'DESC']]
      });

      // 转换为内部格式
      const results: EpisodicEvent[] = dbRecords.map(dbRecord => ({
        id: dbRecord.id,
        event_type: dbRecord.event_type,
        summary: dbRecord.summary,
        details: dbRecord.details,
        actor: dbRecord.actor,
        tree_path: dbRecord.tree_path,
        occurred_at: dbRecord.occurred_at,
        created_at: dbRecord.created_at,
        updated_at: dbRecord.updated_at,
        summary_embedding: dbRecord.summary_embedding,
        details_embedding: dbRecord.details_embedding,
        metadata: dbRecord.metadata
      }));

      // 更新内存缓存
      results.forEach(event => {
        this.memories.set(event.id, event);
      });

      return results;
    } catch (error) {
      logger.error('搜索情节记忆失败:', error);
      return [];
    }
  }

  // 根据用户ID获取情节记忆
  async getByUserId(userId: string, limit = 50): Promise<EpisodicEvent[]> {
    try {
      const dbRecords = await MemoryModels.EpisodicMemory.findAll({
        where: { user_id: userId },
        limit,
        order: [['occurred_at', 'DESC']]
      });

      const results: EpisodicEvent[] = dbRecords.map(dbRecord => ({
        id: dbRecord.id,
        event_type: dbRecord.event_type,
        summary: dbRecord.summary,
        details: dbRecord.details,
        actor: dbRecord.actor,
        tree_path: dbRecord.tree_path,
        occurred_at: dbRecord.occurred_at,
        created_at: dbRecord.created_at,
        updated_at: dbRecord.updated_at,
        summary_embedding: dbRecord.summary_embedding,
        details_embedding: dbRecord.details_embedding,
        metadata: dbRecord.metadata
      }));

      // 更新内存缓存
      results.forEach(event => {
        this.memories.set(event.id, event);
      });

      return results;
    } catch (error) {
      logger.error('获取用户情节记忆失败:', error);
      return [];
    }
  }

  /**
   * 根据metadata字段删除情节记忆
   * @param metadataFilter - metadata过滤条件，如 { conversationId: 'xxx' }
   * @returns 删除的记录数
   */
  async deleteByMetadata(metadataFilter: Record<string, any>): Promise<number> {
    try {
      const { Op } = require('sequelize');
      
      // 构建WHERE条件：检查metadata JSON字段中的匹配
      const whereConditions: any = {};
      
      // 对于每个过滤条件，构建JSON查询
      for (const [key, value] of Object.entries(metadataFilter)) {
        // 使用Sequelize的JSON查询语法
        whereConditions[`metadata.${key}`] = value;
      }
      
      // 从数据库删除匹配的记录
      const deletedCount = await MemoryModels.EpisodicMemory.destroy({
        where: whereConditions
      });
      
      // 从内存缓存中删除
      if (deletedCount > 0) {
        for (const [id, event] of this.memories.entries()) {
          let shouldDelete = true;
          for (const [key, value] of Object.entries(metadataFilter)) {
            if (event.metadata[key] !== value) {
              shouldDelete = false;
              break;
            }
          }
          if (shouldDelete) {
            this.memories.delete(id);
          }
        }
      }
      
      return deletedCount;
    } catch (error) {
      logger.error('根据metadata删除情节记忆失败:', error);
      return 0;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // TODO: 实际调用嵌入模型
    // 这里返回模拟的嵌入向量
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array(384).fill(0).map((_, i) => Math.sin(hash + i) * 0.1);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// 3. 语义记忆管理器
class SemanticMemoryManager extends MemoryManager<SemanticConcept> {
  private conceptGraph: Map<string, Set<string>> = new Map();
  
  constructor() {
    super('semantic');
  }

  async create(data: Partial<SemanticConcept>): Promise<SemanticConcept> {
    try {
      // 生成嵌入向量
      let embedding = null;
      if (data.description) {
        embedding = await this.generateEmbedding(data.description);
      }

      // 使用数据库模型创建记录
      const dbRecord = await MemoryModels.SemanticMemory.create({
        user_id: data.metadata?.userId || 'default',
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'general',
        embedding,
        metadata: data.metadata || {}
      });

      // 转换为内部格式
      const concept: SemanticConcept = {
        id: dbRecord.id,
        name: dbRecord.name,
        description: dbRecord.description,
        category: dbRecord.category,
        relationships: data.relationships || [],
        metadata: dbRecord.metadata,
        embedding: dbRecord.embedding
      };

      this.memories.set(concept.id, concept);
      this.updateGraph(concept);
      this.emit('created', concept);
      return concept;
    } catch (error) {
      logger.error('创建语义记忆失败:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<SemanticConcept>): Promise<SemanticConcept> {
    try {
      const existing = this.memories.get(id);
      if (!existing) throw new Error(`Semantic concept ${id} not found`);

      // 生成新的嵌入向量（如果描述改变）
      let embedding = existing.embedding;
      if (data.description && data.description !== existing.description) {
        embedding = await this.generateEmbedding(data.description);
      }

      // 更新数据库记录
      await MemoryModels.SemanticMemory.update({
        name: data.name || existing.name,
        description: data.description || existing.description,
        category: data.category || existing.category,
        embedding,
        metadata: data.metadata || existing.metadata
      }, {
        where: { id }
      });

      // 更新内存缓存
      const updated = { ...existing, ...data, embedding };

      this.memories.set(id, updated);
      this.updateGraph(updated);
      this.emit('updated', updated);
      return updated;
    } catch (error) {
      logger.error('更新语义记忆失败:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const concept = this.memories.get(id);
      if (concept) {
        this.removeFromGraph(concept);
      }

      // 从数据库删除
      await MemoryModels.SemanticMemory.destroy({
        where: { id }
      });

      const result = this.memories.delete(id);
      if (result) this.emit('deleted', id);
      return result;
    } catch (error) {
      logger.error('删除语义记忆失败:', error);
      return false;
    }
  }

  async search(query: string, limit = 10): Promise<SemanticConcept[]> {
    try {
      // 从数据库搜索
      const dbRecords = await MemoryModels.SemanticMemory.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { name: { [require('sequelize').Op.like]: `%${query}%` } },
            { description: { [require('sequelize').Op.like]: `%${query}%` } }
          ]
        },
        limit
      });

      // 转换为内部格式并更新缓存
      const results: SemanticConcept[] = dbRecords.map(dbRecord => ({
        id: dbRecord.id,
        name: dbRecord.name,
        description: dbRecord.description,
        category: dbRecord.category,
        relationships: [],
        metadata: dbRecord.metadata,
        embedding: dbRecord.embedding
      }));

      results.forEach(concept => {
        this.memories.set(concept.id, concept);
      });

      return results;
    } catch (error) {
      logger.error('搜索语义记忆失败:', error);
      return [];
    }
  }

  async getByUserId(userId: string): Promise<SemanticConcept[]> {
    try {
      const dbRecords = await MemoryModels.SemanticMemory.findAll({
        where: { user_id: userId }
      });

      const results: SemanticConcept[] = dbRecords.map(dbRecord => ({
        id: dbRecord.id,
        name: dbRecord.name,
        description: dbRecord.description,
        category: dbRecord.category,
        relationships: [],
        metadata: dbRecord.metadata,
        embedding: dbRecord.embedding
      }));

      results.forEach(concept => {
        this.memories.set(concept.id, concept);
      });

      return results;
    } catch (error) {
      logger.error('获取用户语义记忆失败:', error);
      return [];
    }
  }

  async findRelated(conceptId: string, depth = 2): Promise<SemanticConcept[]> {
    const visited = new Set<string>();
    const queue = [{ id: conceptId, level: 0 }];
    const results: SemanticConcept[] = [];
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id) || level > depth) continue;
      
      visited.add(id);
      const concept = this.memories.get(id);
      if (concept && id !== conceptId) {
        results.push(concept);
      }
      
      if (concept && level < depth) {
        for (const rel of concept.relationships) {
          queue.push({ id: rel.target_id, level: level + 1 });
        }
      }
    }
    
    return results;
  }

  private updateGraph(concept: SemanticConcept): void {
    if (!this.conceptGraph.has(concept.id)) {
      this.conceptGraph.set(concept.id, new Set());
    }
    
    const connections = this.conceptGraph.get(concept.id)!;
    connections.clear();
    
    for (const rel of concept.relationships) {
      connections.add(rel.target_id);
      
      if (!this.conceptGraph.has(rel.target_id)) {
        this.conceptGraph.set(rel.target_id, new Set());
      }
      this.conceptGraph.get(rel.target_id)!.add(concept.id);
    }
  }

  private removeFromGraph(concept: SemanticConcept): void {
    this.conceptGraph.delete(concept.id);
    
    for (const [id, connections] of this.conceptGraph.entries()) {
      connections.delete(concept.id);
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array(384).fill(0).map((_, i) => Math.sin(hash + i) * 0.1);
  }
}

// 4. 过程记忆管理器
class ProceduralMemoryManager extends MemoryManager<ProcedureStep> {
  private procedures: Map<string, ProcedureStep[]> = new Map();
  
  constructor() {
    super('procedural');
  }

  async create(data: Partial<ProcedureStep>): Promise<ProcedureStep> {
    try {
      // 使用数据库模型创建记录
      const dbRecord = await MemoryModels.ProceduralMemory.create({
        user_id: data.metadata?.userId || 'default',
        procedure_name: data.procedure_name || '',
        step_number: data.step_number || 1,
        description: data.description || '',
        conditions: data.conditions || [],
        actions: data.actions || [],
        metadata: data.metadata || {}
      });

      // 转换为内部格式
      const step: ProcedureStep = {
        id: dbRecord.id,
        procedure_name: dbRecord.procedure_name,
        step_number: dbRecord.step_number,
        description: dbRecord.description,
        conditions: dbRecord.conditions,
        actions: dbRecord.actions,
        expected_results: data.expected_results || [],
        metadata: dbRecord.metadata
      };

      this.memories.set(step.id, step);

      // 组织过程步骤
      if (!this.procedures.has(step.procedure_name)) {
        this.procedures.set(step.procedure_name, []);
      }
      this.procedures.get(step.procedure_name)!.push(step);
      this.procedures.get(step.procedure_name)!.sort((a, b) => a.step_number - b.step_number);

      this.emit('created', step);
      return step;
    } catch (error) {
      logger.error('创建程序记忆失败:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<ProcedureStep>): Promise<ProcedureStep> {
    const existing = this.memories.get(id);
    if (!existing) throw new Error(`Procedure step ${id} not found`);
    
    const updated = { ...existing, ...data };
    this.memories.set(id, updated);
    
    // 重新组织过程步骤
    if (data.procedure_name || data.step_number) {
      this.reorganizeProcedures();
    }
    
    this.emit('updated', updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const step = this.memories.get(id);
    if (step) {
      const procedure = this.procedures.get(step.procedure_name);
      if (procedure) {
        const index = procedure.findIndex(s => s.id === id);
        if (index !== -1) {
          procedure.splice(index, 1);
        }
      }
    }
    
    const result = this.memories.delete(id);
    if (result) this.emit('deleted', id);
    return result;
  }

  async search(query: string, limit = 10): Promise<ProcedureStep[]> {
    const results: ProcedureStep[] = [];
    
    for (const step of this.memories.values()) {
      if (step.procedure_name.includes(query) ||
          step.description.includes(query) ||
          step.actions.some(a => a.includes(query))) {
        results.push(step);
        if (results.length >= limit) break;
      }
    }
    
    return results;
  }

  async getProcedure(procedureName: string): Promise<ProcedureStep[]> {
    return this.procedures.get(procedureName) || [];
  }

  async getAllProcedures(): Promise<Map<string, ProcedureStep[]>> {
    return new Map(this.procedures);
  }

  private reorganizeProcedures(): void {
    this.procedures.clear();
    
    for (const step of this.memories.values()) {
      if (!this.procedures.has(step.procedure_name)) {
        this.procedures.set(step.procedure_name, []);
      }
      this.procedures.get(step.procedure_name)!.push(step);
    }
    
    for (const steps of this.procedures.values()) {
      steps.sort((a, b) => a.step_number - b.step_number);
    }
  }
}

// 5. 资源记忆管理器
class ResourceMemoryManager extends MemoryManager<ResourceReference> {
  private tagIndex: Map<string, Set<string>> = new Map();
  
  constructor() {
    super('resource');
  }

  async create(data: Partial<ResourceReference>): Promise<ResourceReference> {
    try {
      // 使用数据库模型创建记录
      const dbRecord = await MemoryModels.ResourceMemory.create({
        user_id: data.metadata?.userId || 'default',
        resource_type: data.resource_type || 'document',
        name: data.name || '',
        location: data.location || '',
        summary: data.summary || '',
        tags: data.tags || [],
        metadata: data.metadata || {}
      });

      // 转换为内部格式
      const resource: ResourceReference = {
        id: dbRecord.id,
        resource_type: dbRecord.resource_type,
        name: dbRecord.name,
        location: dbRecord.location,
        summary: dbRecord.summary,
        tags: dbRecord.tags,
        created_at: dbRecord.created_at,
        accessed_at: dbRecord.created_at,
        metadata: dbRecord.metadata
      };

      this.memories.set(resource.id, resource);
      this.updateTagIndex(resource);
      this.emit('created', resource);
      return resource;
    } catch (error) {
      logger.error('创建资源记忆失败:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<ResourceReference>): Promise<ResourceReference> {
    const existing = this.memories.get(id);
    if (!existing) throw new Error(`Resource ${id} not found`);
    
    const updated = { ...existing, ...data };
    
    if (data.tags) {
      this.removeFromTagIndex(existing);
      this.updateTagIndex(updated);
    }
    
    this.memories.set(id, updated);
    this.emit('updated', updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const resource = this.memories.get(id);
    if (resource) {
      this.removeFromTagIndex(resource);
    }
    
    const result = this.memories.delete(id);
    if (result) this.emit('deleted', id);
    return result;
  }

  async search(query: string, limit = 10): Promise<ResourceReference[]> {
    const results: ResourceReference[] = [];
    
    for (const resource of this.memories.values()) {
      if (resource.name.includes(query) ||
          resource.summary.includes(query) ||
          resource.tags.some(t => t.includes(query))) {
        results.push(resource);
        if (results.length >= limit) break;
      }
    }
    
    return results;
  }

  async findByTag(tag: string): Promise<ResourceReference[]> {
    const resourceIds = this.tagIndex.get(tag);
    if (!resourceIds) return [];
    
    const resources: ResourceReference[] = [];
    for (const id of resourceIds) {
      const resource = this.memories.get(id);
      if (resource) resources.push(resource);
    }
    
    return resources;
  }

  async markAccessed(id: string): Promise<void> {
    const resource = this.memories.get(id);
    if (resource) {
      resource.accessed_at = new Date();
      this.emit('accessed', resource);
    }
  }

  private updateTagIndex(resource: ResourceReference): void {
    for (const tag of resource.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(resource.id);
    }
  }

  private removeFromTagIndex(resource: ResourceReference): void {
    for (const tag of resource.tags) {
      const ids = this.tagIndex.get(tag);
      if (ids) {
        ids.delete(resource.id);
        if (ids.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }
}

// 6. 知识库管理器
class KnowledgeVaultManager extends MemoryManager<KnowledgeEntry> {
  private domainIndex: Map<string, Set<string>> = new Map();
  
  constructor() {
    super('knowledge');
  }

  async create(data: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> {
    try {
      // 生成嵌入向量
      let embedding = null;
      if (data.content) {
        embedding = await this.generateEmbedding(data.content);
      }

      // 使用数据库模型创建记录
      const dbRecord = await MemoryModels.KnowledgeVault.create({
        user_id: data.metadata?.userId || 'default',
        domain: data.domain || 'general',
        topic: data.topic || '',
        content: data.content || '',
        source: data.source || 'system',
        confidence: data.confidence || 0.5,
        embedding,
        metadata: data.metadata || {}
      });

      // 转换为内部格式
      const entry: KnowledgeEntry = {
        id: dbRecord.id,
        domain: dbRecord.domain,
        topic: dbRecord.topic,
        content: dbRecord.content,
        source: dbRecord.source,
        confidence: dbRecord.confidence,
        created_at: dbRecord.created_at,
        validated_at: dbRecord.created_at,
        embedding: dbRecord.embedding,
        metadata: dbRecord.metadata
      };

      this.memories.set(entry.id, entry);
      this.updateDomainIndex(entry);
      this.emit('created', entry);
      return entry;
    } catch (error) {
      logger.error('创建知识库记忆失败:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> {
    const existing = this.memories.get(id);
    if (!existing) throw new Error(`Knowledge entry ${id} not found`);
    
    const updated = { ...existing, ...data };
    
    if (data.content && data.content !== existing.content) {
      updated.embedding = await this.generateEmbedding(data.content);
    }
    
    if (data.domain && data.domain !== existing.domain) {
      this.removeFromDomainIndex(existing);
      this.updateDomainIndex(updated);
    }
    
    this.memories.set(id, updated);
    this.emit('updated', updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const entry = this.memories.get(id);
    if (entry) {
      this.removeFromDomainIndex(entry);
    }
    
    const result = this.memories.delete(id);
    if (result) this.emit('deleted', id);
    return result;
  }

  async search(query: string, limit = 10): Promise<KnowledgeEntry[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const results: Array<{ entry: KnowledgeEntry; score: number }> = [];
    
    for (const entry of this.memories.values()) {
      let score = 0;
      
      // 文本匹配
      if (entry.topic.includes(query) || entry.content.includes(query)) {
        score += 0.5;
      }
      
      // 向量相似度
      if (queryEmbedding && entry.embedding) {
        score += this.cosineSimilarity(queryEmbedding, entry.embedding) * entry.confidence;
      }
      
      results.push({ entry, score });
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.entry);
  }

  async findByDomain(domain: string): Promise<KnowledgeEntry[]> {
    const entryIds = this.domainIndex.get(domain);
    if (!entryIds) return [];
    
    const entries: KnowledgeEntry[] = [];
    for (const id of entryIds) {
      const entry = this.memories.get(id);
      if (entry) entries.push(entry);
    }
    
    return entries.sort((a, b) => b.confidence - a.confidence);
  }

  async validate(id: string, confidence: number): Promise<void> {
    const entry = this.memories.get(id);
    if (entry) {
      entry.confidence = Math.max(0, Math.min(1, confidence));
      entry.validated_at = new Date();
      this.emit('validated', entry);
    }
  }

  private updateDomainIndex(entry: KnowledgeEntry): void {
    if (!this.domainIndex.has(entry.domain)) {
      this.domainIndex.set(entry.domain, new Set());
    }
    this.domainIndex.get(entry.domain)!.add(entry.id);
  }

  private removeFromDomainIndex(entry: KnowledgeEntry): void {
    const ids = this.domainIndex.get(entry.domain);
    if (ids) {
      ids.delete(entry.id);
      if (ids.size === 0) {
        this.domainIndex.delete(entry.domain);
      }
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array(384).fill(0).map((_, i) => Math.sin(hash + i) * 0.1);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// ============= 元记忆管理器（路由中心）=============

export class MetaMemoryManager extends EventEmitter {
  private coreMemory: CoreMemoryManager;
  private episodicMemory: EpisodicMemoryManager;
  private semanticMemory: SemanticMemoryManager;
  private proceduralMemory: ProceduralMemoryManager;
  private resourceMemory: ResourceMemoryManager;
  private knowledgeVault: KnowledgeVaultManager;
  
  private config: MemoryConfig = {
    maxEmbeddingDim: 384,
    memoryWarningThreshold: 0.8,
    contextWindow: 8192,
    enableVectorSearch: true,
    enableFullTextSearch: true
  };

  constructor(config?: Partial<MemoryConfig>) {
    super();
    
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // 初始化六个记忆管理器
    this.coreMemory = new CoreMemoryManager();
    this.episodicMemory = new EpisodicMemoryManager();
    this.semanticMemory = new SemanticMemoryManager();
    this.proceduralMemory = new ProceduralMemoryManager();
    this.resourceMemory = new ResourceMemoryManager();
    this.knowledgeVault = new KnowledgeVaultManager();
    
    this.setupEventForwarding();
    logger.info('六维记忆系统初始化完成');
  }

  // ============= 核心API =============

  /**
   * 主动检索：根据查询自动推断话题并从六个维度检索相关记忆
   */
  async activeRetrieval(query: string, context?: any): Promise<Record<string, MemorySearchResult>> {
    const topic = await this.inferTopic(query, context);
    const results: Record<string, MemorySearchResult> = {};
    
    // 并行检索六个维度
    const [core, episodic, semantic, procedural, resource, knowledge] = await Promise.all([
      this.coreMemory.search(topic, 5),
      this.episodicMemory.search(topic, 10),
      this.semanticMemory.search(topic, 10),
      this.proceduralMemory.search(topic, 10),
      this.resourceMemory.search(topic, 10),
      this.knowledgeVault.search(topic, 10)
    ]);
    
    results.core = {
      dimension: 'core',
      items: core,
      relevance_scores: core.map(() => 1.0),
      total_count: core.length
    };
    
    results.episodic = {
      dimension: 'episodic',
      items: episodic,
      relevance_scores: episodic.map(() => 0.9),
      total_count: episodic.length
    };
    
    results.semantic = {
      dimension: 'semantic',
      items: semantic,
      relevance_scores: semantic.map(() => 0.85),
      total_count: semantic.length
    };
    
    results.procedural = {
      dimension: 'procedural',
      items: procedural,
      relevance_scores: procedural.map(() => 0.8),
      total_count: procedural.length
    };
    
    results.resource = {
      dimension: 'resource',
      items: resource,
      relevance_scores: resource.map(() => 0.75),
      total_count: resource.length
    };
    
    results.knowledge = {
      dimension: 'knowledge',
      items: knowledge,
      relevance_scores: knowledge.map(() => 0.9),
      total_count: knowledge.length
    };
    
    this.emit('retrieval_completed', { query, topic, results });
    return results;
  }

  /**
   * 记录对话事件到情节记忆
   */
  async recordConversation(
    actor: 'user' | 'assistant',
    message: string,
    context?: any
  ): Promise<EpisodicEvent> {
    const event = await this.episodicMemory.create({
      event_type: 'conversation',
      summary: message.substring(0, 100),
      details: message,
      actor,
      tree_path: this.generateTreePath(context),
      occurred_at: new Date(),
      metadata: context
    });
    
    // 自动提取概念到语义记忆
    await this.extractConcepts(message);
    
    return event;
  }

  /**
   * 学习新知识
   */
  async learnKnowledge(
    domain: string,
    topic: string,
    content: string,
    source: string,
    confidence = 0.7
  ): Promise<KnowledgeEntry> {
    return await this.knowledgeVault.create({
      domain,
      topic,
      content,
      source,
      confidence
    });
  }

  /**
   * 记录操作流程
   */
  async recordProcedure(
    procedureName: string,
    steps: Array<{
      description: string;
      conditions?: string[];
      actions?: string[];
      expected_results?: string[];
    }>
  ): Promise<ProcedureStep[]> {
    const createdSteps: ProcedureStep[] = [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = await this.proceduralMemory.create({
        procedure_name: procedureName,
        step_number: i + 1,
        ...steps[i]
      });
      createdSteps.push(step);
    }
    
    return createdSteps;
  }

  /**
   * 保存资源引用
   */
  async saveResource(
    resourceType: 'file' | 'url' | 'image' | 'document',
    name: string,
    location: string,
    summary: string,
    tags: string[]
  ): Promise<ResourceReference> {
    return await this.resourceMemory.create({
      resource_type: resourceType,
      name,
      location,
      summary,
      tags
    });
  }

  /**
   * 获取结构化的记忆上下文（用于AI对话）
   * @param userId 用户ID
   * @param query 查询内容（用于相关性过滤）
   * @param options 选项
   */
  async getStructuredMemoryContext(
    userId: string,
    query?: string,
    options?: {
      timeWindow?: number;        // 时间窗口（小时）
      maxConversations?: number;  // 最大对话数
      conceptLimit?: number;      // 概念数限制
      relevanceThreshold?: number;// 相关性阈值
    }
  ): Promise<{
    userId: string;
    recentConversations: EpisodicEvent[];
    relevantConcepts: SemanticConcept[];
    keyEntities: CoreMemory[];
    proceduralContext: ProcedureStep[];
    resourceLinks: ResourceReference[];
    summary: string;
    relevanceScore: number;
    totalMemories: number;
  }> {
    const {
      timeWindow = 24,
      maxConversations = 10,
      conceptLimit = 20,
      relevanceThreshold = 0.5
    } = options || {};

    // 1. 获取最近的对话记忆（情节记忆）
    const recentConversations = await this.episodicMemory.getByUserId(userId, maxConversations);
    
    // ✨ 去重：基于内容和时间戳
    const uniqueConversations = this.deduplicateConversations(recentConversations);

    // 2. 获取相关概念（语义记忆）
    let relevantConcepts: SemanticConcept[] = [];
    if (query) {
      relevantConcepts = await this.semanticMemory.search(query, conceptLimit);
    } else {
      relevantConcepts = await this.semanticMemory.getByUserId(userId);
      relevantConcepts = relevantConcepts.slice(0, conceptLimit);
    }
    
    // ✨ 去重：基于名称和描述
    const uniqueConcepts = this.deduplicateConcepts(relevantConcepts);

    // 3. 获取核心记忆
    const keyEntities = await this.coreMemory.getAll();

    // 4. 获取程序性记忆
    const proceduralContext = await this.proceduralMemory.getAll();

    // 5. 获取资源引用
    const resourceLinks = await this.resourceMemory.getAll();

    // 6. 生成摘要
    const summary = this.generateContextSummary({
      conversations: uniqueConversations.length,
      concepts: uniqueConcepts.length,
      entities: keyEntities.length,
      procedures: proceduralContext.length,
      resources: resourceLinks.length
    });

    // 7. 计算相关性评分
    const relevanceScore = query ? this.calculateRelevanceScore(uniqueConversations, uniqueConcepts, query) : 0.5;

    const totalMemories = uniqueConversations.length + uniqueConcepts.length + keyEntities.length + proceduralContext.length + resourceLinks.length;

    return {
      userId,
      recentConversations: uniqueConversations,
      relevantConcepts: uniqueConcepts,
      keyEntities,
      proceduralContext: proceduralContext.slice(0, 5), // 最多5个程序
      resourceLinks: resourceLinks.slice(0, 5),         // 最多5个资源
      summary,
      relevanceScore,
      totalMemories
    };
  }

  /**
   * 去重：对话记忆
   */
  private deduplicateConversations(conversations: EpisodicEvent[]): EpisodicEvent[] {
    const seen = new Map<string, EpisodicEvent>();
    
    for (const conv of conversations) {
      // 基于摘要和发生时间创建唯一键
      const timeKey = conv.occurred_at ? new Date(conv.occurred_at).getTime() : Date.now();
      const key = `${conv.summary.substring(0, 50)}-${Math.floor(timeKey / 60000)}`; // 每分钟为单位
      
      if (!seen.has(key)) {
        seen.set(key, conv);
      }
    }
    
    return Array.from(seen.values());
  }

  /**
   * 去重：概念记忆
   */
  private deduplicateConcepts(concepts: SemanticConcept[]): SemanticConcept[] {
    const seen = new Map<string, SemanticConcept>();
    
    for (const concept of concepts) {
      // 基于名称和描述创建唯一键
      const key = `${concept.name}-${concept.description.substring(0, 30)}`;
      
      if (!seen.has(key)) {
        seen.set(key, concept);
      } else {
        // 如果已存在，合并关系
        const existing = seen.get(key)!;
        if (concept.relationships && concept.relationships.length > 0) {
          existing.relationships = existing.relationships || [];
          existing.relationships.push(...concept.relationships);
        }
      }
    }
    
    return Array.from(seen.values());
  }

  /**
   * 生成上下文摘要
   */
  private generateContextSummary(stats: {
    conversations: number;
    concepts: number;
    entities: number;
    procedures: number;
    resources: number;
  }): string {
    const parts: string[] = [];
    
    if (stats.conversations > 0) parts.push(`${stats.conversations}条对话`);
    if (stats.concepts > 0) parts.push(`${stats.concepts}个概念`);
    if (stats.entities > 0) parts.push(`${stats.entities}个实体`);
    if (stats.procedures > 0) parts.push(`${stats.procedures}个流程`);
    if (stats.resources > 0) parts.push(`${stats.resources}个资源`);
    
    return parts.length > 0 ? `包含: ${parts.join(', ')}` : '无相关记忆';
  }

  /**
   * 计算相关性评分
   */
  private calculateRelevanceScore(
    conversations: EpisodicEvent[],
    concepts: SemanticConcept[],
    query: string
  ): number {
    let score = 0;
    let count = 0;
    
    // 简单的关键词匹配
    const queryLower = query.toLowerCase();
    
    conversations.forEach(conv => {
      if (conv.details.toLowerCase().includes(queryLower) || 
          conv.summary.toLowerCase().includes(queryLower)) {
        score += 1;
      }
      count++;
    });
    
    concepts.forEach(concept => {
      if (concept.name.toLowerCase().includes(queryLower) || 
          concept.description.toLowerCase().includes(queryLower)) {
        score += 1;
      }
      count++;
    });
    
    return count > 0 ? Math.min(score / count, 1.0) : 0.5;
  }

  /**
   * 获取记忆上下文摘要
   */
  async getMemoryContext(limit = 1000): Promise<string> {
    const coreMemories = await this.coreMemory.getAll();
    const recentEvents = await this.episodicMemory.getAll();
    const concepts = await this.semanticMemory.getAll();
    
    let context = '=== 记忆上下文 ===\n\n';
    
    // 核心记忆
    if (coreMemories.length > 0) {
      const core = coreMemories[0];
      context += `[核心记忆]\n`;
      context += `角色: ${core.persona.value.substring(0, 200)}\n`;
      context += `用户: ${core.human.value.substring(0, 200)}\n\n`;
    }
    
    // 最近事件
    context += `[最近事件]\n`;
    const sortedEvents = recentEvents
      .sort((a, b) => b.occurred_at.getTime() - a.occurred_at.getTime())
      .slice(0, 5);
    
    for (const event of sortedEvents) {
      context += `- ${event.occurred_at.toISOString()}: ${event.summary}\n`;
    }
    
    // 关键概念
    context += `\n[关键概念]\n`;
    const topConcepts = concepts.slice(0, 10);
    for (const concept of topConcepts) {
      context += `- ${concept.name}: ${concept.description.substring(0, 100)}\n`;
    }
    
    // 限制总长度
    if (context.length > limit) {
      context = context.substring(0, limit) + '...';
    }
    
    return context;
  }

  /**
   * 记忆压缩与归档
   */
  async compressMemories(beforeDate: Date): Promise<void> {
    // 获取需要压缩的事件
    const events = await this.episodicMemory.getAll();
    const oldEvents = events.filter(e => e.occurred_at < beforeDate);
    
    if (oldEvents.length === 0) return;
    
    // 生成摘要
    const summary = await this.summarizeEvents(oldEvents);
    
    // 保存到知识库
    await this.knowledgeVault.create({
      domain: 'archive',
      topic: `历史记忆摘要 ${beforeDate.toISOString()}`,
      content: summary,
      source: 'system_compression',
      confidence: 0.9
    });
    
    // 删除旧事件
    for (const event of oldEvents) {
      await this.episodicMemory.delete(event.id);
    }
    
    logger.info(`压缩了 ${oldEvents.length} 条历史记忆`);
  }

  // ============= 私有方法 =============

  private async inferTopic(query: string, context?: any): Promise<string> {
    // TODO: 使用LLM推断话题
    // 这里简单返回查询本身
    return query;
  }

  private generateTreePath(context?: any): string[] {
    if (!context) return ['general'];
    
    const path: string[] = [];
    
    if (context.module) path.push(context.module);
    if (context.category) path.push(context.category);
    if (context.action) path.push(context.action);
    
    return path.length > 0 ? path : ['general'];
  }

  private async extractConcepts(text: string): Promise<void> {
    try {
      // 🚀 使用基于豆包1.6 Flash的智能概念提取
      const { intelligentConceptExtraction } = await import('./intelligent-concept-extraction.service');

      logger.info('[六维记忆系统] 开始智能概念提取', {
        textLength: text.length
      });

      const extractionResult = await intelligentConceptExtraction.extractConceptsIntelligently(
        text,
        {
          domain: 'general',
          previousConcepts: await this.getExistingConcepts()
        }
      );

      logger.info('[六维记忆系统] 智能概念提取完成', {
        conceptsCount: extractionResult.concepts.length,
        domain: extractionResult.domain
      });

      // 将提取的概念保存到语义记忆
      for (const concept of extractionResult.concepts) {
        // 检查是否已存在
        const existing = await this.semanticMemory.search(concept.name, 1);
        if (existing.length === 0) {
          await this.semanticMemory.create({
            name: concept.name,
            description: concept.description,
            category: concept.category,
            relationships: concept.relationships.map(rel => ({
              type: 'related',
              target_id: rel,
              strength: 0.8
            })),
            metadata: {
              confidence: concept.confidence,
              importance: concept.importance,
              examples: concept.examples,
              extractionMethod: 'ai_intelligent',
              extractedAt: new Date().toISOString(),
              domain: extractionResult.domain
            }
          });

          logger.debug('[六维记忆系统] 新概念已保存', {
            concept: concept.name,
            category: concept.category,
            confidence: concept.confidence
          });
        } else {
          logger.debug('[六维记忆系统] 概念已存在，跳过', {
            concept: concept.name
          });
        }
      }

      // 保存文本摘要和分析结果到情节记忆的metadata中
      if (extractionResult.summary || extractionResult.keyTopics.length > 0) {
        logger.debug('[六维记忆系统] 概念提取摘要已生成', {
          summaryLength: extractionResult.summary.length,
          keyTopicsCount: extractionResult.keyTopics.length
        });
      }

    } catch (error) {
      logger.error('[六维记忆系统] 智能概念提取失败，使用回退方法:', error);

      // 回退到原有的简化实现
      await this.fallbackConceptExtraction(text);
    }
  }

  /**
   * 回退的概念提取方法（原有实现）
   */
  private async fallbackConceptExtraction(text: string): Promise<void> {
    logger.info('[六维记忆系统] 使用回退概念提取方法');

    const keywords = text.match(/[A-Za-z\u4e00-\u9fa5]{2,}/g) || [];
    const uniqueKeywords = [...new Set(keywords)].slice(0, 5);

    for (const keyword of uniqueKeywords) {
      const existing = await this.semanticMemory.search(keyword, 1);
      if (existing.length === 0) {
        await this.semanticMemory.create({
          name: keyword,
          description: `自动提取的概念: ${keyword}`,
          category: 'auto_extracted',
          metadata: {
            extractionMethod: 'regex_fallback',
            extractedAt: new Date().toISOString()
          }
        });
      }
    }
  }

  /**
   * 获取已存在的概念列表
   */
  private async getExistingConcepts(): Promise<string[]> {
    try {
      const existingConcepts = await this.semanticMemory.search('', 20);
      return existingConcepts.map(concept => concept.name);
    } catch (error) {
      logger.warn('[六维记忆系统] 获取现有概念失败:', error);
      return [];
    }
  }

  private async summarizeEvents(events: EpisodicEvent[]): Promise<string> {
    // TODO: 使用LLM生成摘要
    // 这里是简化实现
    const summaries = events.map(e => `${e.occurred_at.toISOString()}: ${e.summary}`);
    return summaries.join('\n');
  }

  private setupEventForwarding(): void {
    // 转发各个记忆管理器的事件
    const managers = [
      this.coreMemory,
      this.episodicMemory,
      this.semanticMemory,
      this.proceduralMemory,
      this.resourceMemory,
      this.knowledgeVault
    ];
    
    for (const manager of managers) {
      manager.on('created', (data) => {
        this.emit('memory_created', { dimension: manager['dimension'], data });
      });
      
      manager.on('updated', (data) => {
        this.emit('memory_updated', { dimension: manager['dimension'], data });
      });
      
      manager.on('deleted', (id) => {
        this.emit('memory_deleted', { dimension: manager['dimension'], id });
      });
    }
  }

  // ============= 获取各个管理器的引用 =============

  getCore(): CoreMemoryManager {
    return this.coreMemory;
  }

  getEpisodic(): EpisodicMemoryManager {
    return this.episodicMemory;
  }

  getSemantic(): SemanticMemoryManager {
    return this.semanticMemory;
  }

  getProcedural(): ProceduralMemoryManager {
    return this.proceduralMemory;
  }

  getResource(): ResourceMemoryManager {
    return this.resourceMemory;
  }

  getKnowledge(): KnowledgeVaultManager {
    return this.knowledgeVault;
  }

  /**
   * 从对话中学习并存储到各个记忆维度
   */
  async learnFromConversation(
    userId: string,
    userMessage: string,
    aiMessage: string,
    context?: any
  ): Promise<{ userEvent: EpisodicEvent; aiEvent: EpisodicEvent }> {
    try {
      // 记录用户消息到情节记忆
      const userEvent = await this.recordConversation('user', userMessage, {
        ...context,
        userId
      });

      // 记录AI回复到情节记忆
      const aiEvent = await this.recordConversation('assistant', aiMessage, {
        ...context,
        userId
      });

      return { userEvent, aiEvent };
    } catch (error) {
      console.error('从对话中学习失败:', error);
      throw error;
    }
  }
}

// 导出单例
let memoryInstance: MetaMemoryManager | null = null;

export function getMemorySystem(config?: Partial<MemoryConfig>): MetaMemoryManager {
  if (!memoryInstance) {
    memoryInstance = new MetaMemoryManager(config);
  }
  return memoryInstance;
}

export default MetaMemoryManager;