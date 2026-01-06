import { Request, Response } from 'express';
import { InspectionPlan, InspectionType, InspectionTask, User } from '../models';
import { Op } from 'sequelize';

/**
 * 检查计划控制器
 */
export class InspectionPlanController {
  /**
   * 获取检查计划列表
   */
  async getList(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 10,
        kindergartenId,
        inspectionTypeId,
        planYear,
        status,
        startDate,
        endDate,
      } = req.query;

      const where: any = {};

      // 筛选条件
      if (kindergartenId) {
        where.kindergartenId = kindergartenId;
      }
      if (inspectionTypeId) {
        where.inspectionTypeId = inspectionTypeId;
      }
      if (planYear) {
        where.planYear = planYear;
      }
      if (status) {
        where.status = status;
      }
      if (startDate && endDate) {
        where.planDate = {
          [Op.between]: [startDate, endDate],
        };
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const { count, rows } = await InspectionPlan.findAndCountAll({
        where,
        include: [
          {
            model: InspectionType,
            as: 'inspectionType',
            attributes: ['id', 'name', 'category', 'frequency'],
          },
        ],
        offset,
        limit,
        order: [['planDate', 'DESC']],
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
      console.error('获取检查计划列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取检查计划列表失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取检查计划详情
   */
  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const inspectionPlan = await InspectionPlan.findByPk(id, {
        include: [
          {
            model: InspectionType,
            as: 'inspectionType',
          },
        ],
      });

      if (!inspectionPlan) {
        return res.status(404).json({
          success: false,
          message: '检查计划不存在',
        });
      }

      res.json({
        success: true,
        data: inspectionPlan,
      });
    } catch (error: any) {
      console.error('获取检查计划详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取检查计划详情失败',
        error: error.message,
      });
    }
  }

  /**
   * 创建检查计划
   */
  async create(req: Request, res: Response) {
    try {
      const inspectionPlan = await InspectionPlan.create({
        ...req.body,
        createdBy: (req as any).user?.id,
      });

      res.json({
        success: true,
        message: '创建成功',
        data: inspectionPlan,
      });
    } catch (error: any) {
      console.error('创建检查计划失败:', error);
      res.status(500).json({
        success: false,
        message: '创建检查计划失败',
        error: error.message,
      });
    }
  }

  /**
   * 更新检查计划
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const inspectionPlan = await InspectionPlan.findByPk(id);

      if (!inspectionPlan) {
        return res.status(404).json({
          success: false,
          message: '检查计划不存在',
        });
      }

      await inspectionPlan.update(req.body);

      res.json({
        success: true,
        message: '更新成功',
        data: inspectionPlan,
      });
    } catch (error: any) {
      console.error('更新检查计划失败:', error);
      res.status(500).json({
        success: false,
        message: '更新检查计划失败',
        error: error.message,
      });
    }
  }

  /**
   * 删除检查计划
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const inspectionPlan = await InspectionPlan.findByPk(id);

      if (!inspectionPlan) {
        return res.status(404).json({
          success: false,
          message: '检查计划不存在',
        });
      }

      await inspectionPlan.destroy();

      res.json({
        success: true,
        message: '删除成功',
      });
    } catch (error: any) {
      console.error('删除检查计划失败:', error);
      res.status(500).json({
        success: false,
        message: '删除检查计划失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取Timeline数据(年度视图)
   */
  async getTimeline(req: Request, res: Response) {
    try {
      const { kindergartenId, year } = req.query;

      if (!kindergartenId || !year) {
        return res.status(400).json({
          success: false,
          message: 'kindergartenId和year参数必填',
        });
      }

      const plans = await InspectionPlan.findAll({
        where: {
          kindergartenId: Number(kindergartenId),
          planYear: Number(year),
        },
        include: [
          {
            model: InspectionType,
            as: 'inspectionType',
            attributes: ['id', 'name', 'category', 'frequency', 'duration'],
          },
        ],
        order: [['plan_date', 'ASC']],
      });

      res.json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      console.error('获取Timeline数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取Timeline数据失败',
        error: error.message,
      });
    }
  }

  /**
   * 自动生成年度检查计划
   */
  async generateYearlyPlan(req: Request, res: Response) {
    try {
      const { kindergartenId, year, cityLevel } = req.body;

      if (!kindergartenId || !year || !cityLevel) {
        return res.status(400).json({
          success: false,
          message: 'kindergartenId、year和cityLevel参数必填',
        });
      }

      // 获取适用的检查类型
      const inspectionTypes = await InspectionType.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { cityLevel },
            { cityLevel: null }, // 适用所有级别
          ],
        },
      });

      // 生成计划
      const plans = [];
      for (const type of inspectionTypes) {
        // 根据频次生成计划日期
        // 这里简化处理,实际应根据frequency字段智能生成
        const planDate = new Date(Number(year), 0, 1); // 默认年初

        plans.push({
          kindergartenId: Number(kindergartenId),
          inspectionTypeId: type.id,
          planYear: Number(year),
          planDate,
          status: 'pending' as any,
          createdBy: (req as any).user?.id,
        });
      }

      const createdPlans = await InspectionPlan.bulkCreate(plans);

      res.json({
        success: true,
        message: `成功生成${createdPlans.length}个检查计划`,
        data: createdPlans,
      });
    } catch (error: any) {
      console.error('生成年度检查计划失败:', error);
      res.status(500).json({
        success: false,
        message: '生成年度检查计划失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取检查计划的任务列表
   */
  async getTasks(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 10, status, priority, assignedTo } = req.query;

      const where: any = {
        inspectionPlanId: Number(id),
      };

      // 筛选条件
      if (status) {
        where.status = status;
      }
      if (priority) {
        where.priority = priority;
      }
      if (assignedTo) {
        where.assignedTo = Number(assignedTo);
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const { count, rows } = await InspectionTask.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'realName', 'email'],
            required: false,
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'realName', 'email'],
            required: false,
          },
        ],
        offset,
        limit,
        order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
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
      console.error('获取检查任务列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取检查任务列表失败',
        error: error.message,
      });
    }
  }

  /**
   * 创建检查任务
   */
  async createTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const taskData = {
        ...req.body,
        inspectionPlanId: Number(id),
        createdBy: (req as any).user?.id,
      };

      const task = await InspectionTask.create(taskData);

      // 获取完整的任务信息（包含关联数据）
      const fullTask = await InspectionTask.findByPk(task.id, {
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'realName', 'email'],
            required: false,
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'realName', 'email'],
            required: false,
          },
        ],
      });

      res.json({
        success: true,
        message: '创建任务成功',
        data: fullTask,
      });
    } catch (error: any) {
      console.error('创建检查任务失败:', error);
      res.status(500).json({
        success: false,
        message: '创建检查任务失败',
        error: error.message,
      });
    }
  }

  /**
   * 更新检查任务
   */
  async updateTask(req: Request, res: Response) {
    try {
      const { id, taskId } = req.params;

      const task = await InspectionTask.findOne({
        where: {
          id: Number(taskId),
          inspectionPlanId: Number(id),
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在',
        });
      }

      await task.update(req.body);

      // 获取更新后的完整任务信息
      const updatedTask = await InspectionTask.findByPk(task.id, {
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'realName', 'email'],
            required: false,
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'realName', 'email'],
            required: false,
          },
        ],
      });

      res.json({
        success: true,
        message: '更新任务成功',
        data: updatedTask,
      });
    } catch (error: any) {
      console.error('更新检查任务失败:', error);
      res.status(500).json({
        success: false,
        message: '更新检查任务失败',
        error: error.message,
      });
    }
  }

  /**
   * 删除检查任务
   */
  async deleteTask(req: Request, res: Response) {
    try {
      const { id, taskId } = req.params;

      const task = await InspectionTask.findOne({
        where: {
          id: Number(taskId),
          inspectionPlanId: Number(id),
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在',
        });
      }

      await task.destroy();

      res.json({
        success: true,
        message: '删除任务成功',
      });
    } catch (error: any) {
      console.error('删除检查任务失败:', error);
      res.status(500).json({
        success: false,
        message: '删除检查任务失败',
        error: error.message,
      });
    }
  }
}

export default new InspectionPlanController();

