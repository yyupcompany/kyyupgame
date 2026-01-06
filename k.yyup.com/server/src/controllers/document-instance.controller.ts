import { Request, Response } from 'express';
import { Op } from 'sequelize';
import DocumentInstance from '../models/document-instance.model';
import DocumentTemplate from '../models/document-template.model';

/**
 * 文档实例控制器
 */
export class DocumentInstanceController {
  
  /**
   * 获取文档实例列表
   * GET /api/document-instances
   */
  static async getInstances(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        templateId,
        createdBy,  // 改为 createdBy
        assignedTo,
        keyword,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const userId = (req as any).user?.id;

      // 构建查询条件（移除 kindergartenId）
      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (templateId) {
        where.templateId = templateId;
      }

      if (createdBy) {
        where.createdBy = createdBy;
      }

      if (assignedTo) {
        where.assignedTo = assignedTo;
      }

      // 关键词搜索
      if (keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 分页
      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      // 查询
      // 暂时移除 include 关联，避免关联问题导致查询失败
      // 如果关联未正确设置，会导致查询失败
      const { count, rows } = await DocumentInstance.findAndCountAll({
        where,
        offset,
        limit,
        order: [[sortBy as string, sortOrder as string]]
        // 暂时注释掉 include，等关联问题解决后再启用
        // include: [
        //   {
        //     model: DocumentTemplate,
        //     as: 'template',
        //     attributes: ['id', 'code', 'name', 'category'],
        //     required: false
        //   }
        // ]
      });

      console.log('📋 文档实例查询结果:', {
        count,
        rowsCount: rows.length,
        where,
        offset,
        limit,
        page: Number(page),
        pageSize: Number(pageSize)
      });

      return res.json({
        success: true,
        data: {
          items: rows,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(count / Number(pageSize))
        }
      });
    } catch (error: any) {
      console.error('获取文档实例列表失败:', error);
      console.error('错误堆栈:', error.stack);
      console.error('错误详情:', {
        message: error.message,
        name: error.name,
        original: error.original
      });
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取文档实例列表失败',
          details: error.message || error.original?.message || String(error),
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
    }
  }

  /**
   * 获取文档实例详情
   * GET /api/document-instances/:id
   */
  static async getInstanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const instance = await DocumentInstance.findByPk(id, {
        include: [
          {
            model: DocumentTemplate,
            as: 'template',
            attributes: ['id', 'code', 'name', 'category', 'variables']
          }
        ]
      });

      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      return res.json({
        success: true,
        data: instance
      });
    } catch (error: any) {
      console.error('获取文档实例详情失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取文档实例详情失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 创建文档实例
   * POST /api/document-instances
   */
  static async createInstance(req: Request, res: Response) {
    try {
      const { templateId, title, content, filledData } = req.body;
      const userId = (req as any).user?.id;

      // 验证模板是否存在
      const template = await DocumentTemplate.findByPk(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '模板不存在'
          }
        });
      }

      // 创建文档实例
      const instance = await DocumentInstance.create({
        templateId,
        title: title || template.name,
        content: content || template.templateContent,
        filledData: filledData || {},
        status: 'draft',
        completionRate: 0,  // 使用 completionRate 而不是 progress
        assignedTo: userId,
        version: 1,
        createdBy: userId
      });

      return res.status(201).json({
        success: true,
        data: instance
      });
    } catch (error: any) {
      console.error('创建文档实例失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '创建文档实例失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 更新文档实例
   * PUT /api/document-instances/:id
   */
  static async updateInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, content, filledData, status, completionRate, deadline } = req.body;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // 更新字段
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (filledData !== undefined) updateData.filledData = filledData;
      if (status !== undefined) updateData.status = status;
      if (completionRate !== undefined) updateData.completionRate = completionRate;
      if (deadline !== undefined) updateData.deadline = deadline;

      // 根据状态更新时间戳
      if (status === 'filling' && !instance.startedAt) {
        updateData.startedAt = new Date();
      } else if (status === 'review' && !instance.submittedAt) {
        updateData.submittedAt = new Date();
      } else if (status === 'completed' && !instance.completedAt) {
        updateData.completedAt = new Date();
      }

      await instance.update(updateData);

      return res.json({
        success: true,
        data: instance
      });
    } catch (error: any) {
      console.error('更新文档实例失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '更新文档实例失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 删除文档实例
   * DELETE /api/document-instances/:id
   */
  static async deleteInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      await instance.destroy();

      return res.json({
        success: true,
        data: {
          message: '删除成功'
        }
      });
    } catch (error: any) {
      console.error('删除文档实例失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '删除文档实例失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 批量删除文档实例
   * POST /api/document-instances/batch-delete
   */
  static async batchDelete(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '请提供要删除的文档ID列表'
          }
        });
      }

      const count = await DocumentInstance.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });

      return res.json({
        success: true,
        data: {
          deletedCount: count,
          message: `成功删除 ${count} 个文档`
        }
      });
    } catch (error: any) {
      console.error('批量删除文档实例失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '批量删除文档实例失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 导出文档实例
   * GET /api/document-instances/:id/export
   */
  static async exportInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { format = 'pdf' } = req.query;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // TODO: 实现PDF/Word导出功能
      return res.json({
        success: true,
        data: {
          message: '导出功能开发中...',
          format,
          instanceId: id
        }
      });
    } catch (error: any) {
      console.error('导出文档实例失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '导出文档实例失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 分配文档
   * POST /api/document-instances/:id/assign
   */
  static async assignDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { assignedTo, deadline, message } = req.body;
      const userId = (req as any).user?.id;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // 更新分配信息
      await instance.update({
        assignedTo,
        deadline: deadline ? new Date(deadline) : null,
        status: 'filling'
      });

      // TODO: 发送通知给被分配人

      return res.json({
        success: true,
        data: {
          instance,
          message: '分配成功'
        }
      });
    } catch (error: any) {
      console.error('分配文档失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '分配文档失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 提交审核
   * POST /api/document-instances/:id/submit
   */
  static async submitForReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reviewers, message } = req.body;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // 检查进度是否完成（使用 completionRate）
      if (instance.completionRate < 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '文档未完成，无法提交审核'
          }
        });
      }

      // 更新状态
      await instance.update({
        status: 'pending_review',  // 使用正确的状态值
        submittedAt: new Date()
      });

      // TODO: 发送通知给审核人

      return res.json({
        success: true,
        data: {
          instance,
          message: '提交审核成功'
        }
      });
    } catch (error: any) {
      console.error('提交审核失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '提交审核失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 审核文档
   * POST /api/document-instances/:id/review
   */
  static async reviewDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { approved, comment } = req.body;
      const userId = (req as any).user?.id;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // 检查是否为审核人
      if (!instance.reviewers || !instance.reviewers.includes(userId)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 403,
            message: '您不是该文档的审核人'
          }
        });
      }

      // 更新状态
      const newStatus = approved ? 'approved' : 'rejected';
      await instance.update({
        status: newStatus,
        reviewedAt: new Date()
      });

      // TODO: 保存审核意见到评论
      // TODO: 发送通知给文档所有者

      return res.json({
        success: true,
        data: {
          instance,
          message: approved ? '审核通过' : '审核拒绝'
        }
      });
    } catch (error: any) {
      console.error('审核文档失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '审核文档失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 添加评论
   * POST /api/document-instances/:id/comments
   */
  static async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = (req as any).user?.id;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // TODO: 创建评论记录（需要评论表）
      const comment = {
        id: Date.now(),
        instanceId: id,
        userId,
        content,
        createdAt: new Date()
      };

      return res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error: any) {
      console.error('添加评论失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '添加评论失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取评论列表
   * GET /api/document-instances/:id/comments
   */
  static async getComments(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // TODO: 从评论表查询
      const comments: any[] = [];

      return res.json({
        success: true,
        data: {
          comments,
          total: comments.length
        }
      });
    } catch (error: any) {
      console.error('获取评论列表失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取评论列表失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取版本历史
   * GET /api/document-instances/:id/versions
   */
  static async getVersionHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // 查询所有版本
      const versions = await DocumentInstance.findAll({
        where: {
          [Op.or]: [
            { id: id },
            { parentVersionId: id }
          ]
        },
        order: [['version', 'DESC']]
      });

      return res.json({
        success: true,
        data: {
          versions,
          total: versions.length
        }
      });
    } catch (error: any) {
      console.error('获取版本历史失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取版本历史失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 创建新版本
   * POST /api/document-instances/:id/versions
   */
  static async createVersion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const instance = await DocumentInstance.findByPk(id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '文档实例不存在'
          }
        });
      }

      // 创建新版本
      const newVersion = await DocumentInstance.create({
        templateId: instance.templateId,
        title: instance.title,
        content: instance.content,
        filledData: instance.filledData,
        status: 'draft',
        completionRate: instance.completionRate,
        assignedTo: instance.assignedTo,
        version: instance.version + 1,
        parentVersionId: instance.id,
        createdBy: userId
      });

      return res.status(201).json({
        success: true,
        data: newVersion
      });
    } catch (error: any) {
      console.error('创建新版本失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '创建新版本失败',
          details: error.message
        }
      });
    }
  }
}

