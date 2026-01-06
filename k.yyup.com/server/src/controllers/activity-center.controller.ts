import { Request, Response } from 'express';
import { ActivityCenterService } from '../services/activity-center.service';

export class ActivityCenterController {
  private activityCenterService: ActivityCenterService;

  constructor() {
    this.activityCenterService = new ActivityCenterService();
  }

  // ==================== 活动概览 API ====================

  /**
   * 获取活动概览数据
   */
  async getOverview(req: Request, res: Response) {
    try {
      const overview = await this.activityCenterService.getOverview();
      res.json({
        success: true,
        data: overview,
        message: '获取活动概览成功'
      });
    } catch (error) {
      console.error('Failed to get activity overview:', error);
      res.status(500).json({
        success: false,
        message: '获取活动概览失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取活动分布统计
   */
  async getDistribution(req: Request, res: Response) {
    try {
      const distribution = await this.activityCenterService.getDistribution();
      res.json({
        success: true,
        data: distribution,
        message: '获取活动分布统计成功'
      });
    } catch (error) {
      console.error('Failed to get activity distribution:', error);
      res.status(500).json({
        success: false,
        message: '获取活动分布统计失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取活动趋势数据
   */
  async getTrend(req: Request, res: Response) {
    try {
      const trend = await this.activityCenterService.getTrend();
      res.json({
        success: true,
        data: trend,
        message: '获取活动趋势成功'
      });
    } catch (error) {
      console.error('Failed to get activity trend:', error);
      res.status(500).json({
        success: false,
        message: '获取活动趋势失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==================== 活动管理 API ====================

  /**
   * 获取活动列表
   */
  async getActivities(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 10,
        title,
        type,
        status,
        startDate,
        endDate
      } = req.query;

      const params = {
        page: Number(page),
        pageSize: Number(pageSize),
        title: title as string,
        type: type as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string
      };

      const result = await this.activityCenterService.getActivities(params);
      res.json({
        success: true,
        data: result,
        message: '获取活动列表成功'
      });
    } catch (error) {
      console.error('Failed to get activities:', error);
      res.status(500).json({
        success: false,
        message: '获取活动列表失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取活动详情
   */
  async getActivityDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const activity = await this.activityCenterService.getActivityDetail(id);
      
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '活动不存在'
        });
      }

      res.json({
        success: true,
        data: activity,
        message: '获取活动详情成功'
      });
    } catch (error) {
      console.error('Failed to get activity detail:', error);
      res.status(500).json({
        success: false,
        message: '获取活动详情失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 创建活动
   */
  async createActivity(req: Request, res: Response) {
    try {
      const activityData = req.body;
      const activity = await this.activityCenterService.createActivity(activityData);
      
      res.status(201).json({
        success: true,
        data: activity,
        message: '创建活动成功'
      });
    } catch (error) {
      console.error('Failed to create activity:', error);
      res.status(500).json({
        success: false,
        message: '创建活动失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 更新活动
   */
  async updateActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const activity = await this.activityCenterService.updateActivity(id, updateData);
      
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '活动不存在'
        });
      }

      res.json({
        success: true,
        data: activity,
        message: '更新活动成功'
      });
    } catch (error) {
      console.error('Failed to update activity:', error);
      res.status(500).json({
        success: false,
        message: '更新活动失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 删除活动
   */
  async deleteActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.activityCenterService.deleteActivity(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: '活动不存在'
        });
      }

      res.json({
        success: true,
        message: '删除活动成功'
      });
    } catch (error) {
      console.error('Failed to delete activity:', error);
      res.status(500).json({
        success: false,
        message: '删除活动失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 发布活动
   */
  async publishActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const activity = await this.activityCenterService.publishActivity(id);
      
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '活动不存在'
        });
      }

      res.json({
        success: true,
        data: activity,
        message: '发布活动成功'
      });
    } catch (error) {
      console.error('Failed to publish activity:', error);
      res.status(500).json({
        success: false,
        message: '发布活动失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 取消活动
   */
  async cancelActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const activity = await this.activityCenterService.cancelActivity(id);
      
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '活动不存在'
        });
      }

      res.json({
        success: true,
        data: activity,
        message: '取消活动成功'
      });
    } catch (error) {
      console.error('Failed to cancel activity:', error);
      res.status(500).json({
        success: false,
        message: '取消活动失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==================== 报名管理 API ====================

  /**
   * 获取报名列表
   */
  async getRegistrations(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 10,
        activityId,
        studentName,
        parentName,
        status
      } = req.query;

      const params = {
        page: Number(page),
        pageSize: Number(pageSize),
        activityId: activityId as string,
        studentName: studentName as string,
        parentName: parentName as string,
        status: status as string
      };

      const result = await this.activityCenterService.getRegistrations(params);
      res.json({
        success: true,
        data: result,
        message: '获取报名列表成功'
      });
    } catch (error) {
      console.error('Failed to get registrations:', error);
      res.status(500).json({
        success: false,
        message: '获取报名列表失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取报名详情
   */
  async getRegistrationDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const registration = await this.activityCenterService.getRegistrationDetail(id);
      
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: '报名记录不存在'
        });
      }

      res.json({
        success: true,
        data: registration,
        message: '获取报名详情成功'
      });
    } catch (error) {
      console.error('Failed to get registration detail:', error);
      res.status(500).json({
        success: false,
        message: '获取报名详情失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 审核报名
   */
  async approveRegistration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, remark } = req.body;
      
      const registration = await this.activityCenterService.approveRegistration(id, status, remark);
      
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: '报名记录不存在'
        });
      }

      res.json({
        success: true,
        data: registration,
        message: '审核报名成功'
      });
    } catch (error) {
      console.error('Failed to approve registration:', error);
      res.status(500).json({
        success: false,
        message: '审核报名失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 批量审核报名
   */
  async batchApproveRegistrations(req: Request, res: Response) {
    try {
      const { ids, status, remark } = req.body;

      const result = await this.activityCenterService.batchApproveRegistrations(ids, status, remark);

      res.json({
        success: true,
        data: result,
        message: '批量审核报名成功'
      });
    } catch (error) {
      console.error('Failed to batch approve registrations:', error);
      res.status(500).json({
        success: false,
        message: '批量审核报名失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==================== 活动分析 API ====================

  /**
   * 获取活动分析数据
   */
  async getAnalytics(req: Request, res: Response) {
    try {
      const { activityId, startDate, endDate, type } = req.query;

      const params = {
        activityId: activityId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        type: type as string
      };

      const analytics = await this.activityCenterService.getAnalytics(params);
      res.json({
        success: true,
        data: analytics,
        message: '获取活动分析数据成功'
      });
    } catch (error) {
      console.error('Failed to get activity analytics:', error);
      res.status(500).json({
        success: false,
        message: '获取活动分析数据失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取活动效果报告
   */
  async getActivityReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await this.activityCenterService.getActivityReport(id);

      res.json({
        success: true,
        data: report,
        message: '获取活动效果报告成功'
      });
    } catch (error) {
      console.error('Failed to get activity report:', error);
      res.status(500).json({
        success: false,
        message: '获取活动效果报告失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取参与度分析
   */
  async getParticipationAnalysis(req: Request, res: Response) {
    try {
      const { startDate, endDate, type } = req.query;

      const params = {
        startDate: startDate as string,
        endDate: endDate as string,
        type: type as string
      };

      const analysis = await this.activityCenterService.getParticipationAnalysis(params);
      res.json({
        success: true,
        data: analysis,
        message: '获取参与度分析成功'
      });
    } catch (error) {
      console.error('Failed to get participation analysis:', error);
      res.status(500).json({
        success: false,
        message: '获取参与度分析失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==================== 通知管理 API ====================

  /**
   * 获取通知列表
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const { page = 1, pageSize = 10, type, status } = req.query;

      const params = {
        page: Number(page),
        pageSize: Number(pageSize),
        type: type as string,
        status: status as string
      };

      const result = await this.activityCenterService.getNotifications(params);
      res.json({
        success: true,
        data: result,
        message: '获取通知列表成功'
      });
    } catch (error) {
      console.error('Failed to get notifications:', error);
      res.status(500).json({
        success: false,
        message: '获取通知列表失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 发送活动通知
   */
  async sendNotification(req: Request, res: Response) {
    try {
      const notificationData = req.body;
      const notification = await this.activityCenterService.sendNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification,
        message: '发送通知成功'
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      res.status(500).json({
        success: false,
        message: '发送通知失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取通知模板
   */
  async getNotificationTemplates(req: Request, res: Response) {
    try {
      const templates = await this.activityCenterService.getNotificationTemplates();
      res.json({
        success: true,
        data: templates,
        message: '获取通知模板成功'
      });
    } catch (error) {
      console.error('Failed to get notification templates:', error);
      res.status(500).json({
        success: false,
        message: '获取通知模板失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
