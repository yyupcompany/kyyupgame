/**
 * 六维记忆系统控制器
 * 提供RESTful API接口
 */

import { Request, Response, NextFunction } from 'express';
import { getMemorySystem, MetaMemoryManager } from '../../services/memory/six-dimension-memory.service';
import { logger } from '../../utils/logger';
import { ApiResponse } from '../../utils/apiResponse';

class SixDimensionMemoryController {
  private memorySystem: MetaMemoryManager;

  constructor() {
    this.memorySystem = getMemorySystem();
  }

  /**
   * 主动检索记忆
   * POST /api/ai/memory/retrieve
   */
  async activeRetrieval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, context, limit } = req.body;
      const userId = req.user?.id || 'default';

      const results = await this.memorySystem.activeRetrieval(query, {
        ...context,
        userId
      });

      ApiResponse.success(res, results, '记忆检索成功');
    } catch (error) {
      logger.error('记忆检索失败:', error);
      next(error);
    }
  }

  /**
   * 记录对话
   * POST /api/ai/memory/conversation
   */
  async recordConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { actor, message, context } = req.body;
      const userId = req.user?.id || 'default';

      const event = await this.memorySystem.recordConversation(
        actor,
        message,
        { ...context, userId }
      );

      ApiResponse.success(res, event, '对话记录成功');
    } catch (error) {
      logger.error('记录对话失败:', error);
      next(error);
    }
  }

  /**
   * 获取核心记忆
   * GET /api/ai/memory/core/:userId
   */
  async getCoreMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.id || 'default';
      const coreMemory = await this.memorySystem.getCore().search(userId.toString(), 1);

      if (coreMemory.length === 0) {
        // 创建默认核心记忆
        const newCore = await this.memorySystem.getCore().create({
          persona: {
            id: '',
            label: 'persona',
            value: '我是YY-AI智能助手，专业的幼儿园管理顾问。我具备丰富的教育管理知识和AI技术能力。',
            limit: 2000,
            created_at: new Date(),
            updated_at: new Date()
          },
          human: {
            id: '',
            label: 'human',
            value: `用户ID: ${userId}`,
            limit: 2000,
            created_at: new Date(),
            updated_at: new Date()
          },
          metadata: { userId }
        });
        
        ApiResponse.success(res, newCore, '核心记忆初始化成功');
      } else {
        ApiResponse.success(res, coreMemory[0], '获取核心记忆成功');
      }
    } catch (error) {
      logger.error('获取核心记忆失败:', error);
      next(error);
    }
  }

  /**
   * 更新核心记忆
   * PUT /api/ai/memory/core/:userId
   */
  async updateCoreMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.id || 'default';
      const { blockLabel, content, append } = req.body;

      const coreMemory = await this.memorySystem.getCore().search(userId.toString(), 1);
      
      if (coreMemory.length === 0) {
        return next(new Error('核心记忆不存在'));
      }

      if (append) {
        await this.memorySystem.getCore().appendToBlock(
          coreMemory[0].id,
          blockLabel,
          content
        );
      } else {
        const updated = await this.memorySystem.getCore().update(coreMemory[0].id, {
          [blockLabel]: {
            ...coreMemory[0][blockLabel],
            value: content,
            updated_at: new Date()
          }
        });
        
        ApiResponse.success(res, updated, '核心记忆更新成功');
      }
    } catch (error) {
      logger.error('更新核心记忆失败:', error);
      next(error);
    }
  }

  /**
   * 获取情节记忆
   * GET /api/ai/memory/episodic
   */
  async getEpisodicMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, startDate, endDate, eventType, limit = 20 } = req.query;
      const userIdStr = userId || req.user?.id || 'default';

      let events = await this.memorySystem.getEpisodic().getAll();
      
      // 过滤
      if (eventType) {
        events = events.filter(e => e.event_type === eventType);
      }
      
      if (startDate) {
        const start = new Date(startDate as string);
        events = events.filter(e => e.occurred_at >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate as string);
        events = events.filter(e => e.occurred_at <= end);
      }

      // 排序并限制数量
      events = events
        .sort((a, b) => b.occurred_at.getTime() - a.occurred_at.getTime())
        .slice(0, parseInt(limit as string));

      ApiResponse.success(res, events, '获取情节记忆成功');
    } catch (error) {
      logger.error('获取情节记忆失败:', error);
      next(error);
    }
  }

  /**
   * 创建情节记忆
   * POST /api/ai/memory/episodic
   */
  async createEpisodicMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'default';
      const eventData = {
        ...req.body,
        metadata: { ...req.body.metadata, userId }
      };

      const event = await this.memorySystem.getEpisodic().create(eventData);
      ApiResponse.success(res, event, '创建情节记忆成功');
    } catch (error) {
      logger.error('创建情节记忆失败:', error);
      next(error);
    }
  }

  /**
   * 搜索语义记忆
   * GET /api/ai/memory/semantic/search
   */
  async searchSemanticMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, limit = 10 } = req.query;
      
      if (!query) {
        return next(new Error('查询参数不能为空'));
      }

      const concepts = await this.memorySystem.getSemantic().search(
        query as string,
        parseInt(limit as string)
      );

      ApiResponse.success(res, concepts, '搜索语义记忆成功');
    } catch (error) {
      logger.error('搜索语义记忆失败:', error);
      next(error);
    }
  }

  /**
   * 创建语义概念
   * POST /api/ai/memory/semantic
   */
  async createSemanticConcept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'default';
      const conceptData = {
        ...req.body,
        metadata: { ...req.body.metadata, userId }
      };

      const concept = await this.memorySystem.getSemantic().create(conceptData);
      ApiResponse.success(res, concept, '创建语义概念成功');
    } catch (error) {
      logger.error('创建语义概念失败:', error);
      next(error);
    }
  }

  /**
   * 获取相关概念
   * GET /api/ai/memory/semantic/:conceptId/related
   */
  async getRelatedConcepts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { conceptId } = req.params;
      const { depth = 2 } = req.query;

      const related = await this.memorySystem.getSemantic().findRelated(
        conceptId,
        parseInt(depth as string)
      );

      ApiResponse.success(res, related, '获取相关概念成功');
    } catch (error) {
      logger.error('获取相关概念失败:', error);
      next(error);
    }
  }

  /**
   * 获取过程步骤
   * GET /api/ai/memory/procedural/:procedureName
   */
  async getProcedureSteps(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { procedureName } = req.params;
      const steps = await this.memorySystem.getProcedural().getProcedure(procedureName);

      ApiResponse.success(res, steps, '获取过程步骤成功');
    } catch (error) {
      logger.error('获取过程步骤失败:', error);
      next(error);
    }
  }

  /**
   * 记录过程
   * POST /api/ai/memory/procedural
   */
  async recordProcedure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { procedureName, steps } = req.body;
      const userId = req.user?.id || 'default';

      const createdSteps = await this.memorySystem.recordProcedure(
        procedureName,
        steps.map((s: any) => ({ ...s, metadata: { ...s.metadata, userId } }))
      );

      ApiResponse.success(res, createdSteps, '记录过程成功');
    } catch (error) {
      logger.error('记录过程失败:', error);
      next(error);
    }
  }

  /**
   * 搜索资源
   * GET /api/ai/memory/resource/search
   */
  async searchResources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, tag, limit = 10 } = req.query;

      let resources;
      if (tag) {
        resources = await this.memorySystem.getResource().findByTag(tag as string);
      } else if (query) {
        resources = await this.memorySystem.getResource().search(
          query as string,
          parseInt(limit as string)
        );
      } else {
        resources = await this.memorySystem.getResource().getAll();
      }

      ApiResponse.success(res, resources, '搜索资源成功');
    } catch (error) {
      logger.error('搜索资源失败:', error);
      next(error);
    }
  }

  /**
   * 保存资源
   * POST /api/ai/memory/resource
   */
  async saveResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resourceType, name, location, summary, tags } = req.body;
      const userId = req.user?.id || 'default';

      const resource = await this.memorySystem.saveResource(
        resourceType,
        name,
        location,
        summary,
        tags
      );

      ApiResponse.success(res, resource, '保存资源成功');
    } catch (error) {
      logger.error('保存资源失败:', error);
      next(error);
    }
  }

  /**
   * 标记资源已访问
   * PUT /api/ai/memory/resource/:resourceId/access
   */
  async markResourceAccessed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resourceId } = req.params;
      await this.memorySystem.getResource().markAccessed(resourceId);

      ApiResponse.success(res, null, '标记访问成功');
    } catch (error) {
      logger.error('标记资源访问失败:', error);
      next(error);
    }
  }

  /**
   * 搜索知识库
   * GET /api/ai/memory/knowledge/search
   */
  async searchKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, domain, limit = 10 } = req.query;

      let entries;
      if (domain) {
        entries = await this.memorySystem.getKnowledge().findByDomain(domain as string);
      } else if (query) {
        entries = await this.memorySystem.getKnowledge().search(
          query as string,
          parseInt(limit as string)
        );
      } else {
        entries = await this.memorySystem.getKnowledge().getAll();
      }

      ApiResponse.success(res, entries, '搜索知识库成功');
    } catch (error) {
      logger.error('搜索知识库失败:', error);
      next(error);
    }
  }

  /**
   * 学习新知识
   * POST /api/ai/memory/knowledge
   */
  async learnKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { domain, topic, content, source, confidence } = req.body;
      const userId = req.user?.id || 'default';

      const entry = await this.memorySystem.learnKnowledge(
        domain,
        topic,
        content,
        source || userId,
        confidence
      );

      ApiResponse.success(res, entry, '学习知识成功');
    } catch (error) {
      logger.error('学习知识失败:', error);
      next(error);
    }
  }

  /**
   * 验证知识
   * PUT /api/ai/memory/knowledge/:entryId/validate
   */
  async validateKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entryId } = req.params;
      const { confidence } = req.body;

      await this.memorySystem.getKnowledge().validate(entryId, confidence);

      ApiResponse.success(res, null, '验证知识成功');
    } catch (error) {
      logger.error('验证知识失败:', error);
      next(error);
    }
  }

  /**
   * 获取记忆上下文
   * GET /api/ai/memory/context
   */
  async getMemoryContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 1000 } = req.query;
      const context = await this.memorySystem.getMemoryContext(parseInt(limit as string));

      ApiResponse.success(res, context, '获取记忆上下文成功');
    } catch (error) {
      logger.error('获取记忆上下文失败:', error);
      next(error);
    }
  }

  /**
   * 压缩历史记忆
   * POST /api/ai/memory/compress
   */
  async compressMemories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { beforeDate } = req.body;
      
      if (!beforeDate) {
        return next(new Error('请提供压缩日期'));
      }

      await this.memorySystem.compressMemories(new Date(beforeDate));

      ApiResponse.success(res, null, '记忆压缩成功');
    } catch (error) {
      logger.error('压缩记忆失败:', error);
      next(error);
    }
  }

  /**
   * 获取记忆统计
   * GET /api/ai/memory/stats
   */
  async getMemoryStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = {
        core: (await this.memorySystem.getCore().getAll()).length,
        episodic: (await this.memorySystem.getEpisodic().getAll()).length,
        semantic: (await this.memorySystem.getSemantic().getAll()).length,
        procedural: (await this.memorySystem.getProcedural().getAll()).length,
        resource: (await this.memorySystem.getResource().getAll()).length,
        knowledge: (await this.memorySystem.getKnowledge().getAll()).length,
      };

      ApiResponse.success(res, stats, '获取记忆统计成功');
    } catch (error) {
      logger.error('获取记忆统计失败:', error);
      next(error);
    }
  }
}

export default new SixDimensionMemoryController();