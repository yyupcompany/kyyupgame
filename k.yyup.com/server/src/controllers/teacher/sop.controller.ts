import { Request, Response } from 'express';
import SOPTemplate from '../../models/sop-template.model';
import SOPTemplateNode from '../../models/sop-template-node.model';
import SOPInstance from '../../models/sop-instance.model';
import SOPNodeProgress from '../../models/sop-node-progress.model';
import { Op } from 'sequelize';

/**
 * Teacher端 SOP管理控制器
 * 负责模板查询和实例管理
 */
export class TeacherSOPController {
  /**
   * 获取可用SOP模板列表（仅销售类）
   * GET /api/teacher/sop-templates
   */
  async getTemplates(req: Request, res: Response) {
    try {
      const { type = 'sales', keyword } = req.query;
      const tenantId = (req as any).tenantId || 1;

      // 构建查询条件
      const where: any = {
        tenantId,
        isActive: true,
        type: type || 'sales' // 教师端默认只看销售类模板
      };

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      // 查询模板
      const templates = await SOPTemplate.findAll({
        where,
        include: [
          {
            model: SOPTemplateNode,
            as: 'nodes',
            attributes: ['id', 'nodeOrder', 'nodeName', 'nodeDescription', 'durationDays', 'isRequired'],
            order: [['nodeOrder', 'ASC']]
          }
        ],
        order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      console.error('获取SOP模板列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取SOP模板列表失败',
        error: error.message
      });
    }
  }

  /**
   * 获取SOP模板详情
   * GET /api/teacher/sop-templates/:id
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || 1;

      const template = await SOPTemplate.findOne({
        where: { id, tenantId, isActive: true },
        include: [
          {
            model: SOPTemplateNode,
            as: 'nodes',
            order: [['nodeOrder', 'ASC']]
          }
        ]
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'SOP模板不存在'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error: any) {
      console.error('获取SOP模板详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取SOP模板详情失败',
        error: error.message
      });
    }
  }

  /**
   * 创建SOP实例
   * POST /api/teacher/sop-instances
   */
  async createInstance(req: Request, res: Response) {
    try {
      const { templateId, customerId, instanceName, notes } = req.body;
      const teacherId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      // 验证必填字段
      if (!templateId) {
        return res.status(400).json({
          success: false,
          message: '模板ID为必填项'
        });
      }

      // 验证模板是否存在
      const template = await SOPTemplate.findOne({
        where: { id: templateId, tenantId, isActive: true },
        include: [
          {
            model: SOPTemplateNode,
            as: 'nodes',
            order: [['nodeOrder', 'ASC']]
          }
        ]
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'SOP模板不存在或已禁用'
        });
      }

      // 创建实例
      const instance = await SOPInstance.create({
        templateId,
        teacherId,
        customerId,
        instanceName: instanceName || template.name,
        currentNodeOrder: 1,
        status: 'in_progress',
        startDate: new Date(),
        notes,
        tenantId
      });

      // 初始化节点进度
      const nodes = template.get('nodes') as any[];
      if (nodes && nodes.length > 0) {
        const progressData = nodes.map((node, index) => ({
          instanceId: instance.id,
          nodeOrder: node.nodeOrder,
          status: (index === 0 ? 'in_progress' : 'pending') as 'in_progress' | 'pending' // 第一个节点自动开始
        }));

        await SOPNodeProgress.bulkCreate(progressData);
      }

      // 重新查询实例（包含关联数据）
      const instanceWithData = await SOPInstance.findOne({
        where: { id: instance.id },
        include: [
          {
            model: SOPTemplate,
            as: 'template',
            include: [
              {
                model: SOPTemplateNode,
                as: 'nodes',
                order: [['nodeOrder', 'ASC']]
              }
            ]
          },
          {
            model: SOPNodeProgress,
            as: 'nodeProgress',
            order: [['nodeOrder', 'ASC']]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'SOP实例创建成功',
        data: instanceWithData
      });
    } catch (error: any) {
      console.error('创建SOP实例失败:', error);
      res.status(500).json({
        success: false,
        message: '创建SOP实例失败',
        error: error.message
      });
    }
  }

  /**
   * 获取我的SOP实例列表
   * GET /api/teacher/sop-instances
   */
  async getInstances(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 10,
        status,
        customerId
      } = req.query;

      const teacherId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      // 构建查询条件
      const where: any = { teacherId, tenantId };

      if (status) {
        where.status = status;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      // 查询实例
      const { rows: instances, count: total } = await SOPInstance.findAndCountAll({
        where,
        include: [
          {
            model: SOPTemplate,
            as: 'template',
            attributes: ['id', 'name', 'type', 'icon', 'color']
          },
          {
            model: SOPNodeProgress,
            as: 'nodeProgress',
            order: [['nodeOrder', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize)
      });

      res.json({
        success: true,
        data: {
          instances,
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            total,
            totalPages: Math.ceil(total / Number(pageSize))
          }
        }
      });
    } catch (error: any) {
      console.error('获取SOP实例列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取SOP实例列表失败',
        error: error.message
      });
    }
  }

  /**
   * 获取SOP实例详情
   * GET /api/teacher/sop-instances/:id
   */
  async getInstanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const teacherId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      const instance = await SOPInstance.findOne({
        where: { id, teacherId, tenantId },
        include: [
          {
            model: SOPTemplate,
            as: 'template',
            include: [
              {
                model: SOPTemplateNode,
                as: 'nodes',
                order: [['nodeOrder', 'ASC']]
              }
            ]
          },
          {
            model: SOPNodeProgress,
            as: 'nodeProgress',
            order: [['nodeOrder', 'ASC']]
          }
        ]
      });

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'SOP实例不存在'
        });
      }

      res.json({
        success: true,
        data: instance
      });
    } catch (error: any) {
      console.error('获取SOP实例详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取SOP实例详情失败',
        error: error.message
      });
    }
  }

  /**
   * 更新SOP实例（自定义）
   * PUT /api/teacher/sop-instances/:id
   */
  async updateInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { instanceName, customNodes, notes } = req.body;
      const teacherId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      const instance = await SOPInstance.findOne({
        where: { id, teacherId, tenantId }
      });

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'SOP实例不存在'
        });
      }

      // 更新实例
      await instance.update({
        instanceName,
        customNodes,
        notes
      });

      res.json({
        success: true,
        message: 'SOP实例更新成功',
        data: instance
      });
    } catch (error: any) {
      console.error('更新SOP实例失败:', error);
      res.status(500).json({
        success: false,
        message: '更新SOP实例失败',
        error: error.message
      });
    }
  }

  /**
   * 删除SOP实例
   * DELETE /api/teacher/sop-instances/:id
   */
  async deleteInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const teacherId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      const instance = await SOPInstance.findOne({
        where: { id, teacherId, tenantId }
      });

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'SOP实例不存在'
        });
      }

      await instance.destroy();

      res.json({
        success: true,
        message: 'SOP实例删除成功'
      });
    } catch (error: any) {
      console.error('删除SOP实例失败:', error);
      res.status(500).json({
        success: false,
        message: '删除SOP实例失败',
        error: error.message
      });
    }
  }

  /**
   * 更新节点进度
   * PUT /api/teacher/sop-instances/:id/nodes/:order/progress
   */
  async updateNodeProgress(req: Request, res: Response) {
    try {
      const { id, order } = req.params;
      const { status, feedbackData, notes, attachments } = req.body;
      const teacherId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      // 验证实例
      const instance = await SOPInstance.findOne({
        where: { id, teacherId, tenantId }
      });

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'SOP实例不存在'
        });
      }

      // 查找节点进度
      const progress = await SOPNodeProgress.findOne({
        where: { instanceId: id, nodeOrder: order }
      });

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: '节点进度不存在'
        });
      }

      // 更新进度
      const updateData: any = { notes, attachments };

      if (status) {
        updateData.status = status;

        if (status === 'in_progress' && !progress.startedAt) {
          updateData.startedAt = new Date();
        }

        if (status === 'completed' || status === 'skipped') {
          updateData.completedAt = new Date();
        }
      }

      if (feedbackData) {
        updateData.feedbackData = feedbackData;
      }

      await progress.update(updateData);

      // 如果节点完成，更新实例的当前节点
      if (status === 'completed') {
        await instance.update({
          currentNodeOrder: Number(order) + 1
        });

        // 启动下一个节点（如果存在）
        const nextProgress = await SOPNodeProgress.findOne({
          where: {
            instanceId: id,
            nodeOrder: Number(order) + 1
          }
        });

        if (nextProgress && nextProgress.status === 'pending') {
          await nextProgress.update({
            status: 'in_progress',
            startedAt: new Date()
          });
        }
      }

      res.json({
        success: true,
        message: '节点进度更新成功',
        data: progress
      });
    } catch (error: any) {
      console.error('更新节点进度失败:', error);
      res.status(500).json({
        success: false,
        message: '更新节点进度失败',
        error: error.message
      });
    }
  }

  /**
   * 完成SOP实例
   * POST /api/teacher/sop-instances/:id/complete
   */
  async completeInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const teacherId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      const instance = await SOPInstance.findOne({
        where: { id, teacherId, tenantId }
      });

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'SOP实例不存在'
        });
      }

      // 更新实例状态
      await instance.update({
        status: 'completed',
        endDate: new Date()
      });

      res.json({
        success: true,
        message: 'SOP实例已完成',
        data: instance
      });
    } catch (error: any) {
      console.error('完成SOP实例失败:', error);
      res.status(500).json({
        success: false,
        message: '完成SOP实例失败',
        error: error.message
      });
    }
  }
}

export default new TeacherSOPController();
