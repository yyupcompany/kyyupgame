import { Request, Response } from 'express';
import SOPTemplate from '../../models/sop-template.model';
import SOPTemplateNode from '../../models/sop-template-node.model';
import { Op } from 'sequelize';

/**
 * Admin端 SOP模板管理控制器
 * 负责模板的CRUD和节点管理
 */
export class AdminSOPTemplateController {
  /**
   * 创建SOP模板
   * POST /api/admin/sop-templates
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const { name, type, description, icon, color, sortOrder } = req.body;
      const userId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      // 数据验证
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: '模板名称和类型为必填项'
        });
      }

      if (!['course', 'sales', 'activity'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: '模板类型必须是 course、sales 或 activity'
        });
      }

      // 创建模板
      const template = await SOPTemplate.create({
        name,
        type,
        description,
        icon,
        color: color || '#409EFF',
        isSystem: false, // Admin创建的模板默认非系统模板
        isActive: true,
        sortOrder: sortOrder || 0,
        createdBy: userId,
        tenantId
      });

      res.status(201).json({
        success: true,
        message: 'SOP模板创建成功',
        data: template
      });
    } catch (error: any) {
      console.error('创建SOP模板失败:', error);
      res.status(500).json({
        success: false,
        message: '创建SOP模板失败',
        error: error.message
      });
    }
  }

  /**
   * 获取SOP模板列表
   * GET /api/admin/sop-templates
   * 支持分页、筛选
   */
  async getTemplates(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 10,
        type,
        keyword,
        isActive
      } = req.query;

      const tenantId = (req as any).tenantId || 1;

      // 构建查询条件
      const where: any = { tenantId };

      if (type) {
        where.type = type;
      }

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // 查询模板
      const { rows: templates, count: total } = await SOPTemplate.findAndCountAll({
        where,
        include: [
          {
            model: SOPTemplateNode,
            as: 'nodes',
            attributes: ['id', 'nodeOrder', 'nodeName', 'nodeDescription', 'durationDays'],
            order: [['nodeOrder', 'ASC']]
          }
        ],
        order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize)
      });

      res.json({
        success: true,
        data: {
          templates,
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            total,
            totalPages: Math.ceil(total / Number(pageSize))
          }
        }
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
   * GET /api/admin/sop-templates/:id
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || 1;

      const template = await SOPTemplate.findOne({
        where: { id, tenantId },
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
   * 更新SOP模板
   * PUT /api/admin/sop-templates/:id
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, type, description, icon, color, isActive, sortOrder } = req.body;
      const tenantId = (req as any).tenantId || 1;

      const template = await SOPTemplate.findOne({
        where: { id, tenantId }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'SOP模板不存在'
        });
      }

      // 系统模板不允许修改类型和删除
      if (template.isSystem && type && type !== template.type) {
        return res.status(403).json({
          success: false,
          message: '系统模板不允许修改类型'
        });
      }

      // 更新模板
      await template.update({
        name: name || template.name,
        type: type || template.type,
        description,
        icon,
        color,
        isActive: isActive !== undefined ? isActive : template.isActive,
        sortOrder: sortOrder !== undefined ? sortOrder : template.sortOrder
      });

      res.json({
        success: true,
        message: 'SOP模板更新成功',
        data: template
      });
    } catch (error: any) {
      console.error('更新SOP模板失败:', error);
      res.status(500).json({
        success: false,
        message: '更新SOP模板失败',
        error: error.message
      });
    }
  }

  /**
   * 删除SOP模板
   * DELETE /api/admin/sop-templates/:id
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || 1;

      const template = await SOPTemplate.findOne({
        where: { id, tenantId }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'SOP模板不存在'
        });
      }

      // 系统模板不允许删除
      if (template.isSystem) {
        return res.status(403).json({
          success: false,
          message: '系统模板不允许删除'
        });
      }

      await template.destroy();

      res.json({
        success: true,
        message: 'SOP模板删除成功'
      });
    } catch (error: any) {
      console.error('删除SOP模板失败:', error);
      res.status(500).json({
        success: false,
        message: '删除SOP模板失败',
        error: error.message
      });
    }
  }

  /**
   * 复制SOP模板
   * POST /api/admin/sop-templates/:id/duplicate
   */
  async duplicateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = (req as any).user?.id;
      const tenantId = (req as any).tenantId || 1;

      // 查找原模板及其节点
      const originalTemplate = await SOPTemplate.findOne({
        where: { id, tenantId },
        include: [
          {
            model: SOPTemplateNode,
            as: 'nodes',
            order: [['nodeOrder', 'ASC']]
          }
        ]
      });

      if (!originalTemplate) {
        return res.status(404).json({
          success: false,
          message: 'SOP模板不存在'
        });
      }

      // 创建新模板
      const newTemplate = await SOPTemplate.create({
        name: name || `${originalTemplate.name} (副本)`,
        type: originalTemplate.type,
        description: originalTemplate.description,
        icon: originalTemplate.icon,
        color: originalTemplate.color,
        isSystem: false,
        isActive: true,
        sortOrder: 0,
        createdBy: userId,
        tenantId
      });

      // 复制节点
      const nodes = originalTemplate.get('nodes') as any[];
      if (nodes && nodes.length > 0) {
        const nodeData = nodes.map(node => ({
          templateId: newTemplate.id,
          nodeOrder: node.nodeOrder,
          nodeName: node.nodeName,
          nodeDescription: node.nodeDescription,
          contentType: node.contentType,
          contentData: node.contentData,
          feedbackConfig: node.feedbackConfig,
          durationDays: node.durationDays,
          isRequired: node.isRequired,
          checklist: node.checklist
        }));

        await SOPTemplateNode.bulkCreate(nodeData);
      }

      // 重新查询新模板（包含节点）
      const templateWithNodes = await SOPTemplate.findOne({
        where: { id: newTemplate.id },
        include: [
          {
            model: SOPTemplateNode,
            as: 'nodes',
            order: [['nodeOrder', 'ASC']]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'SOP模板复制成功',
        data: templateWithNodes
      });
    } catch (error: any) {
      console.error('复制SOP模板失败:', error);
      res.status(500).json({
        success: false,
        message: '复制SOP模板失败',
        error: error.message
      });
    }
  }

  /**
   * 添加模板节点
   * POST /api/admin/sop-templates/:id/nodes
   */
  async addNode(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        nodeOrder,
        nodeName,
        nodeDescription,
        contentType = 'mixed',
        contentData,
        feedbackConfig,
        durationDays = 7,
        isRequired = true,
        checklist
      } = req.body;

      const tenantId = (req as any).tenantId || 1;

      // 验证模板是否存在
      const template = await SOPTemplate.findOne({
        where: { id, tenantId }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'SOP模板不存在'
        });
      }

      // 验证必填字段
      if (!nodeOrder || !nodeName) {
        return res.status(400).json({
          success: false,
          message: '节点顺序和节点名称为必填项'
        });
      }

      // 创建节点
      const node = await SOPTemplateNode.create({
        templateId: Number(id),
        nodeOrder,
        nodeName,
        nodeDescription,
        contentType,
        contentData,
        feedbackConfig,
        durationDays,
        isRequired,
        checklist
      });

      res.status(201).json({
        success: true,
        message: '节点添加成功',
        data: node
      });
    } catch (error: any) {
      console.error('添加节点失败:', error);
      res.status(500).json({
        success: false,
        message: '添加节点失败',
        error: error.message
      });
    }
  }

  /**
   * 更新模板节点
   * PUT /api/admin/sop-templates/:id/nodes/:nodeId
   */
  async updateNode(req: Request, res: Response) {
    try {
      const { id, nodeId } = req.params;
      const updateData = req.body;
      const tenantId = (req as any).tenantId || 1;

      // 验证模板是否存在
      const template = await SOPTemplate.findOne({
        where: { id, tenantId }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'SOP模板不存在'
        });
      }

      // 查找节点
      const node = await SOPTemplateNode.findOne({
        where: { id: nodeId, templateId: id }
      });

      if (!node) {
        return res.status(404).json({
          success: false,
          message: '节点不存在'
        });
      }

      // 更新节点
      await node.update(updateData);

      res.json({
        success: true,
        message: '节点更新成功',
        data: node
      });
    } catch (error: any) {
      console.error('更新节点失败:', error);
      res.status(500).json({
        success: false,
        message: '更新节点失败',
        error: error.message
      });
    }
  }

  /**
   * 删除模板节点
   * DELETE /api/admin/sop-templates/:id/nodes/:nodeId
   */
  async deleteNode(req: Request, res: Response) {
    try {
      const { id, nodeId } = req.params;
      const tenantId = (req as any).tenantId || 1;

      // 验证模板是否存在
      const template = await SOPTemplate.findOne({
        where: { id, tenantId }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'SOP模板不存在'
        });
      }

      // 查找节点
      const node = await SOPTemplateNode.findOne({
        where: { id: nodeId, templateId: id }
      });

      if (!node) {
        return res.status(404).json({
          success: false,
          message: '节点不存在'
        });
      }

      await node.destroy();

      res.json({
        success: true,
        message: '节点删除成功'
      });
    } catch (error: any) {
      console.error('删除节点失败:', error);
      res.status(500).json({
        success: false,
        message: '删除节点失败',
        error: error.message
      });
    }
  }
}

export default new AdminSOPTemplateController();
