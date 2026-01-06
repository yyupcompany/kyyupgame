import { Request, Response } from 'express';
import InspectionType from '../models/inspection-type.model';
import { Op } from 'sequelize';

/**
 * 检查类型控制器
 */
export class InspectionTypeController {
  /**
   * 获取检查类型列表
   */
  async getList(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 10,
        category,
        cityLevel,
        isActive,
        keyword,
      } = req.query;

      const where: any = {};

      // 筛选条件
      if (category) {
        where.category = category;
      }
      if (cityLevel) {
        where.cityLevel = cityLevel;
      }
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } },
          { department: { [Op.like]: `%${keyword}%` } },
        ];
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const { count, rows } = await InspectionType.findAndCountAll({
        where,
        offset,
        limit,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: {
          items: rows,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
        },
      });
    } catch (error: any) {
      console.error('获取检查类型列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取检查类型列表失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取检查类型详情
   */
  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const inspectionType = await InspectionType.findByPk(id);

      if (!inspectionType) {
        return res.status(404).json({
          success: false,
          message: '检查类型不存在',
        });
      }

      res.json({
        success: true,
        data: inspectionType,
      });
    } catch (error: any) {
      console.error('获取检查类型详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取检查类型详情失败',
        error: error.message,
      });
    }
  }

  /**
   * 创建检查类型
   */
  async create(req: Request, res: Response) {
    try {
      const inspectionType = await InspectionType.create(req.body);

      res.json({
        success: true,
        message: '创建成功',
        data: inspectionType,
      });
    } catch (error: any) {
      console.error('创建检查类型失败:', error);
      res.status(500).json({
        success: false,
        message: '创建检查类型失败',
        error: error.message,
      });
    }
  }

  /**
   * 更新检查类型
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const inspectionType = await InspectionType.findByPk(id);

      if (!inspectionType) {
        return res.status(404).json({
          success: false,
          message: '检查类型不存在',
        });
      }

      await inspectionType.update(req.body);

      res.json({
        success: true,
        message: '更新成功',
        data: inspectionType,
      });
    } catch (error: any) {
      console.error('更新检查类型失败:', error);
      res.status(500).json({
        success: false,
        message: '更新检查类型失败',
        error: error.message,
      });
    }
  }

  /**
   * 删除检查类型
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const inspectionType = await InspectionType.findByPk(id);

      if (!inspectionType) {
        return res.status(404).json({
          success: false,
          message: '检查类型不存在',
        });
      }

      await inspectionType.destroy();

      res.json({
        success: true,
        message: '删除成功',
      });
    } catch (error: any) {
      console.error('删除检查类型失败:', error);
      res.status(500).json({
        success: false,
        message: '删除检查类型失败',
        error: error.message,
      });
    }
  }

  /**
   * 批量删除检查类型
   */
  async batchDelete(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'ids必须是非空数组',
        });
      }

      await InspectionType.destroy({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      });

      res.json({
        success: true,
        message: '批量删除成功',
      });
    } catch (error: any) {
      console.error('批量删除检查类型失败:', error);
      res.status(500).json({
        success: false,
        message: '批量删除检查类型失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取所有启用的检查类型(用于下拉选择)
   */
  async getActiveList(req: Request, res: Response) {
    try {
      const { category, cityLevel } = req.query;

      const where: any = {
        isActive: true,
      };

      if (category) {
        where.category = category;
      }
      if (cityLevel) {
        where.cityLevel = cityLevel;
      }

      const inspectionTypes = await InspectionType.findAll({
        where,
        attributes: ['id', 'name', 'category', 'frequency', 'duration'],
        order: [['name', 'ASC']],
      });

      res.json({
        success: true,
        data: inspectionTypes,
      });
    } catch (error: any) {
      console.error('获取启用的检查类型失败:', error);
      res.status(500).json({
        success: false,
        message: '获取启用的检查类型失败',
        error: error.message,
      });
    }
  }
}

export default new InspectionTypeController();

