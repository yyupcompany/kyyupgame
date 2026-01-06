import { Request, Response } from 'express';
import { ReminderLog, ReminderLogStatus } from '../models/reminder-log.model';
import { User } from '../models/user.model';
import InspectionPlan from '../models/inspection-plan.model';
import { Op } from 'sequelize';

/**
 * 提醒日志控制器
 */
export class ReminderLogController {
  /**
   * 获取提醒日志列表
   */
  static async getReminderLogs(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        inspectionPlanId,
        sentTo,
        channel
      } = req.query;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (inspectionPlanId) {
        where.inspectionPlanId = inspectionPlanId;
      }

      if (sentTo) {
        where.sentTo = sentTo;
      }

      if (channel) {
        where.channel = channel;
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const { count, rows } = await ReminderLog.findAndCountAll({
        where,
        include: [
          {
            model: InspectionPlan,
            as: 'inspectionPlan',
            attributes: ['id', 'planYear', 'planDate', 'status']
          },
          {
            model: User,
            as: 'recipient',
            attributes: ['id', 'username', 'realName', 'email', 'phone']
          }
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit
      });

      res.json({
        success: true,
        data: {
          items: rows,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      });
    } catch (error: any) {
      console.error('获取提醒日志失败:', error);
      res.status(500).json({
        success: false,
        message: '获取提醒日志失败',
        error: error.message
      });
    }
  }

  /**
   * 获取提醒日志详情
   */
  static async getReminderLogDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const log = await ReminderLog.findByPk(id, {
        include: [
          {
            model: InspectionPlan,
            as: 'inspectionPlan'
          },
          {
            model: User,
            as: 'recipient',
            attributes: ['id', 'username', 'realName', 'email', 'phone']
          }
        ]
      });

      if (!log) {
        res.status(404).json({
          success: false,
          message: '提醒日志不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: log
      });
    } catch (error: any) {
      console.error('获取提醒日志详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取提醒日志详情失败',
        error: error.message
      });
    }
  }

  /**
   * 创建提醒日志
   */
  static async createReminderLog(req: Request, res: Response): Promise<void> {
    try {
      const {
        inspectionPlanId,
        reminderId,
        sentTo,
        channel,
        message
      } = req.body;

      const log = await ReminderLog.create({
        inspectionPlanId,
        reminderId,
        sentTo,
        channel,
        message,
        status: ReminderLogStatus.PENDING
      });

      res.status(201).json({
        success: true,
        data: log,
        message: '提醒日志创建成功'
      });
    } catch (error: any) {
      console.error('创建提醒日志失败:', error);
      res.status(500).json({
        success: false,
        message: '创建提醒日志失败',
        error: error.message
      });
    }
  }

  /**
   * 更新提醒日志状态
   */
  static async updateReminderLogStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, errorMessage } = req.body;

      const log = await ReminderLog.findByPk(id);
      if (!log) {
        res.status(404).json({
          success: false,
          message: '提醒日志不存在'
        });
        return;
      }

      const updateData: any = { status };

      if (status === ReminderLogStatus.SENT) {
        updateData.sentAt = new Date();
      }

      if (status === ReminderLogStatus.FAILED && errorMessage) {
        updateData.errorMessage = errorMessage;
      }

      await log.update(updateData);

      res.json({
        success: true,
        data: log,
        message: '提醒日志状态更新成功'
      });
    } catch (error: any) {
      console.error('更新提醒日志状态失败:', error);
      res.status(500).json({
        success: false,
        message: '更新提醒日志状态失败',
        error: error.message
      });
    }
  }

  /**
   * 获取提醒统计
   */
  static async getReminderStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};

      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
        };
      }

      const [total, sent, failed, pending] = await Promise.all([
        ReminderLog.count({ where }),
        ReminderLog.count({ where: { ...where, status: ReminderLogStatus.SENT } }),
        ReminderLog.count({ where: { ...where, status: ReminderLogStatus.FAILED } }),
        ReminderLog.count({ where: { ...where, status: ReminderLogStatus.PENDING } })
      ]);

      res.json({
        success: true,
        data: {
          total,
          sent,
          failed,
          pending,
          successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00'
        }
      });
    } catch (error: any) {
      console.error('获取提醒统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取提醒统计失败',
        error: error.message
      });
    }
  }
}

export default ReminderLogController;

