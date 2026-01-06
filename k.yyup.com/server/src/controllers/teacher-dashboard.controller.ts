import { Request, Response } from 'express';
import { TeacherDashboardService } from '../services/teacher-dashboard.service';
import { Task, User, Teacher } from '../models';
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../init';

/**
 * 教师工作台控制器
 */
export class TeacherDashboardController {

  /**
   * 获取教师工作台数据
   * GET /api/teacher/dashboard
   */
  public static async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 教师工作台请求 - req.user:', req.user);

      const userId = req.user?.id;

      if (!userId) {
        console.error('❌ 用户未认证 - req.user:', req.user);
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      console.log('🔍 查找教师记录 - userId:', userId);

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      console.log('🔍 教师记录查询结果:', teacher ? `找到教师ID: ${teacher.id}` : '未找到教师记录');

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      console.log('🔍 调用教师工作台服务 - teacherId:', teacher.id);
      const dashboardData = await TeacherDashboardService.getDashboardData(teacher.id);

      console.log('✅ 教师工作台数据获取成功');
      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('❌ 获取教师工作台数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取工作台数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取教师统计数据
   * GET /api/teacher/statistics
   */
  public static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      const statistics = await TeacherDashboardService.getTeacherStatistics(teacher.id);

      res.json({
        success: true,
        data: statistics
      });

    } catch (error) {
      console.error('获取教师统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取教师活动统计数据
   * GET /api/teacher/activity-statistics
   */
  public static async getActivityStatistics(req: Request, res: Response): Promise<void> {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 获取教师活动统计
      // 使用文件顶部静态导入的 sequelize 和 QueryTypes

      // 获取教师创建的活动统计
      const activityStatsRows = await sequelize.query(`
        SELECT
          COUNT(*) as totalActivities,
          SUM(CASE WHEN a.status = 'published' THEN 1 ELSE 0 END) as publishedActivities,
          SUM(CASE WHEN a.status = 'draft' THEN 1 ELSE 0 END) as draftActivities,
          SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledActivities,
          SUM(a.registered_count) as totalRegistrations,
          SUM(a.checked_in_count) as totalCheckins,
          ROUND(AVG(CASE WHEN a.registered_count > 0 THEN a.checked_in_count * 100.0 / a.registered_count ELSE 0 END), 2) as avgCheckinRate
        FROM ${tenantDb}.activities a
        WHERE a.creator_id = :userId AND a.deleted_at IS NULL
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];

      // 获取最近30天的活动趋势
      const activityTrendsRows = await sequelize.query(`
        SELECT
          DATE(a.created_at) as date,
          COUNT(*) as count
        FROM ${tenantDb}.activities a
        WHERE a.creator_id = :userId
          AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND a.deleted_at IS NULL
        GROUP BY DATE(a.created_at)
        ORDER BY date DESC
        LIMIT 30
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];

      const stats = (activityStatsRows && activityStatsRows[0]) ? activityStatsRows[0] : {};
      const trends = Array.isArray(activityTrendsRows)
        ? activityTrendsRows.map((trend: any) => ({ date: trend.date, count: parseInt(trend.count) }))
        : [];

      res.json({
        success: true,
        data: {
          overview: {
            totalActivities: parseInt(stats.totalActivities) || 0,
            publishedActivities: parseInt(stats.publishedActivities) || 0,
            draftActivities: parseInt(stats.draftActivities) || 0,
            cancelledActivities: parseInt(stats.cancelledActivities) || 0,
            totalRegistrations: parseInt(stats.totalRegistrations) || 0,
            totalCheckins: parseInt(stats.totalCheckins) || 0,
            avgCheckinRate: parseFloat(stats.avgCheckinRate) || 0
          },
          trends
        }
      });

    } catch (error) {
      console.error('获取教师活动统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取活动统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取今日任务
   * GET /api/teacher/today-tasks
   */
  public static async getTodayTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      const todayTasks = await TeacherDashboardService.getTodayTasks(teacher.id);

      res.json({
        success: true,
        data: todayTasks
      });

    } catch (error) {
      console.error('获取今日任务失败:', error);
      res.status(500).json({
        success: false,
        message: '获取今日任务失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取今日课程
   * GET /api/teacher/today-courses
   */
  public static async getTodayCourses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      const todayCourses = await TeacherDashboardService.getTodayCourses(teacher.id);

      res.json({
        success: true,
        data: todayCourses
      });

    } catch (error) {
      console.error('获取今日课程失败:', error);
      res.status(500).json({
        success: false,
        message: '获取今日课程失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取最新通知
   * GET /api/teacher/recent-notifications
   */
  public static async getRecentNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 5;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      const notifications = await TeacherDashboardService.getRecentNotifications(teacher.id, limit);

      res.json({
        success: true,
        data: notifications
      });

    } catch (error) {
      console.error('获取最新通知失败:', error);
      res.status(500).json({
        success: false,
        message: '获取最新通知失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新任务状态
   * PUT /api/teacher/tasks/:taskId/status
   */
  public static async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const taskId = req.params.taskId;
      const { completed } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 直接使用userId查询任务（任务的assignee_id是userId，不是teacher.id）
      const updatedTask = await TeacherDashboardService.updateTaskStatus(
        parseInt(taskId),
        userId,
        completed
      );

      res.json({
        success: true,
        data: updatedTask,
        message: completed ? '任务已完成' : '任务已重新打开'
      });

    } catch (error) {
      console.error('更新任务状态失败:', error);
      res.status(500).json({
        success: false,
        message: '更新任务状态失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 快速打卡
   * POST /api/teacher/clock-in
   */
  public static async clockIn(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { type } = req.body; // 'in' 或 'out'

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      const clockRecord = await TeacherDashboardService.clockIn(teacher.id, type);

      res.json({
        success: true,
        data: clockRecord,
        message: type === 'in' ? '上班打卡成功' : '下班打卡成功'
      });

    } catch (error) {
      console.error('打卡失败:', error);
      res.status(500).json({
        success: false,
        message: '打卡失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取教师活动签到概览
   * GET /api/teacher/activity-checkin-overview
   */
  public static async getActivityCheckinOverview(req: Request, res: Response): Promise<void> {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 使用文件顶部静态导入的 sequelize 和 QueryTypes

      // 获取教师活动签到概览统计
      const [overviewStats] = await sequelize.query(`
        SELECT
          COUNT(DISTINCT a.id) as totalActivities,
          SUM(a.registered_count) as totalRegistrations,
          SUM(a.checked_in_count) as totalCheckins,
          ROUND(AVG(CASE WHEN a.registered_count > 0 THEN a.checked_in_count * 100.0 / a.registered_count ELSE 0 END), 2) as avgCheckinRate
        FROM ${tenantDb}.activities a
        LEFT JOIN ${tenantDb}.teachers t ON a.creator_id = t.user_id
        WHERE t.user_id = :userId AND a.deleted_at IS NULL
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];

      // 获取最近的活动签到情况
      const [recentActivities] = await sequelize.query(`
        SELECT
          a.id,
          a.title,
          a.registered_count as registeredCount,
          a.checked_in_count as checkedInCount,
          ROUND(CASE WHEN a.registered_count > 0 THEN a.checked_in_count * 100.0 / a.registered_count ELSE 0 END, 2) as checkInRate,
          a.start_time as startTime
        FROM ${tenantDb}.activities a
        LEFT JOIN ${tenantDb}.teachers t ON a.creator_id = t.user_id
        WHERE t.user_id = :userId
          AND a.deleted_at IS NULL
          AND a.start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY a.start_time DESC
        LIMIT 10
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];

      const stats = overviewStats[0] || {};

      res.json({
        success: true,
        data: {
          totalActivities: parseInt(stats.totalActivities) || 0,
          totalRegistrations: parseInt(stats.totalRegistrations) || 0,
          totalCheckins: parseInt(stats.totalCheckins) || 0,
          avgCheckinRate: parseFloat(stats.avgCheckinRate) || 0,
          recentActivities: recentActivities.map(activity => ({
            id: activity.id,
            title: activity.title,
            registeredCount: parseInt(activity.registeredCount) || 0,
            checkedInCount: parseInt(activity.checkedInCount) || 0,
            checkInRate: parseFloat(activity.checkInRate) || 0,
            startTime: activity.startTime
          }))
        }
      });

    } catch (error) {
      console.error('获取教师活动签到概览失败:', error);
      res.status(500).json({
        success: false,
        message: '获取活动签到概览失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 教师任务管理方法 ====================

  /**
   * 获取教师任务统计
   * GET /api/teacher/tasks/stats
   */
  public static async getTaskStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 从数据库查询任务统计

      // 获取当前时间
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 查询总任务数
      const total = await Task.count({
        where: { assignee_id: userId }
      });

      // 查询已完成任务数
      const completed = await Task.count({
        where: {
          assignee_id: userId,
          status: 'completed'
        }
      });

      // 查询待处理任务数
      const pending = await Task.count({
        where: {
          assignee_id: userId,
          status: 'pending'
        }
      });

      // 查询进行中任务数
      const inProgress = await Task.count({
        where: {
          assignee_id: userId,
          status: 'in_progress'
        }
      });

      // 查询逾期任务数（截止日期小于当前时间且状态不是completed）
      const overdue = await Task.count({
        where: {
          assignee_id: userId,
          due_date: { [Op.lt]: now },
          status: { [Op.ne]: 'completed' }
        }
      });

      // 查询本周完成任务数
      const weeklyCompleted = await Task.count({
        where: {
          assignee_id: userId,
          status: 'completed',
          updated_at: { [Op.gte]: weekAgo }
        }
      });

      // 查询本月完成任务数
      const monthlyCompleted = await Task.count({
        where: {
          assignee_id: userId,
          status: 'completed',
          updated_at: { [Op.gte]: monthAgo }
        }
      });

      // 计算完成率
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const taskStats = {
        total,
        completed,
        pending,
        overdue,
        inProgress,
        completionRate,
        weeklyCompleted,
        monthlyCompleted
      };

      res.json({
        success: true,
        data: taskStats
      });
    } catch (error) {
      console.error('获取教师任务统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取任务统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取教师任务列表
   * GET /api/teacher/tasks
   */
  public static async getTaskList(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { status, priority, search, page = 1, pageSize = 20 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 从数据库查询分配给当前用户的任务
      // 构建查询条件
      const whereClause: any = {
        assignee_id: userId
      };

      if (status) {
        whereClause.status = status;
      }
      if (priority) {
        whereClause.priority = priority;
      }
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      // 分页参数
      const pageNum = parseInt(page as string);
      const size = parseInt(pageSize as string);
      const offset = (pageNum - 1) * size;

      // 查询任务列表
      const { count, rows: tasks } = await Task.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'realName']
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'realName']
          }
        ],
        limit: size,
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      // 格式化任务数据
      const formattedTasks = tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.due_date,
        progress: task.progress || 0,
        assignedBy: task.creator?.realName || task.creator?.username || '未知',
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        type: task.type,
        creatorId: task.creator_id,
        assigneeId: task.assignee_id
      }));

      res.json({
        success: true,
        data: {
          list: formattedTasks,
          total: count,
          page: pageNum,
          pageSize: size
        }
      });
    } catch (error) {
      console.error('获取教师任务列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取任务列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 创建教师任务
   * POST /api/teacher/tasks
   */
  public static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, description, priority, dueDate } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟创建任务
      const newTask = {
        id: Date.now(),
        title,
        description,
        priority,
        status: 'pending',
        dueDate,
        progress: 0,
        assignedBy: teacher.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: '任务创建成功',
        data: newTask
      });
    } catch (error) {
      console.error('创建教师任务失败:', error);
      res.status(500).json({
        success: false,
        message: '创建任务失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新教师任务
   * PUT /api/teacher/tasks/:id
   */
  public static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const taskId = req.params.id;
      const { title, description, priority, status, progress, dueDate } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟更新任务
      const updatedTask = {
        id: parseInt(taskId),
        title: title || '更新的任务标题',
        description: description || '更新的任务描述',
        priority: priority || 'medium',
        status: status || 'in_progress',
        dueDate: dueDate || '2025-01-15',
        progress: progress || 50,
        assignedBy: teacher.name,
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: '任务更新成功',
        data: updatedTask
      });
    } catch (error) {
      console.error('更新教师任务失败:', error);
      res.status(500).json({
        success: false,
        message: '更新任务失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 批量完成任务
   * POST /api/teacher/tasks/batch-complete
   */
  public static async batchCompleteTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { taskIds } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      if (!taskIds || !Array.isArray(taskIds)) {
        res.status(400).json({
          success: false,
          message: '请提供有效的任务ID列表'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟批量完成任务
      const completedCount = taskIds.length;

      res.json({
        success: true,
        message: `成功完成 ${completedCount} 个任务`,
        data: {
          completedCount,
          taskIds
        }
      });
    } catch (error) {
      console.error('批量完成任务失败:', error);
      res.status(500).json({
        success: false,
        message: '批量完成任务失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 批量删除任务
   * DELETE /api/teacher/tasks/batch-delete
   */
  public static async batchDeleteTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { taskIds } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      if (!taskIds || !Array.isArray(taskIds)) {
        res.status(400).json({
          success: false,
          message: '请提供有效的任务ID列表'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟批量删除任务
      const deletedCount = taskIds.length;

      res.json({
        success: true,
        message: `成功删除 ${deletedCount} 个任务`,
        data: {
          deletedCount,
          taskIds
        }
      });
    } catch (error) {
      console.error('批量删除任务失败:', error);
      res.status(500).json({
        success: false,
        message: '批量删除任务失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 教师教学中心方法 ====================

  /**
   * 获取教学统计
   * GET /api/teacher/teaching/stats
   */
  public static async getTeachingStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟教学统计数据
      const teachingStats = {
        totalClasses: 3,
        totalStudents: 45,
        activeClasses: 3,
        completedLessons: 128,
        avgAttendance: 92.5,
        avgScore: 88.3,
        monthlyLessons: 24,
        weeklyLessons: 6
      };

      res.json({
        success: true,
        data: teachingStats
      });
    } catch (error) {
      console.error('获取教学统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取教学统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取班级列表
   * GET /api/teacher/teaching/classes
   */
  public static async getClassList(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟班级列表数据
      const classes = [
        {
          id: 1,
          name: '小班A',
          studentCount: 15,
          ageGroup: '3-4岁',
          schedule: '周一至周五 8:30-16:30',
          room: '101教室',
          status: 'active'
        },
        {
          id: 2,
          name: '小班B',
          studentCount: 16,
          ageGroup: '3-4岁',
          schedule: '周一至周五 8:30-16:30',
          room: '102教室',
          status: 'active'
        },
        {
          id: 3,
          name: '中班A',
          studentCount: 14,
          ageGroup: '4-5岁',
          schedule: '周一至周五 8:30-16:30',
          room: '201教室',
          status: 'active'
        }
      ];

      res.json({
        success: true,
        data: classes
      });
    } catch (error) {
      console.error('获取班级列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取班级列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取班级详情
   * GET /api/teacher-dashboard/teaching/classes/:id
   */
  public static async getClassDetail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const classId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      if (!classId) {
        res.status(400).json({
          success: false,
          message: '班级ID不能为空'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟班级详情数据
      const classDetail = {
        id: parseInt(classId),
        name: '小班A',
        studentCount: 15,
        ageGroup: '3-4岁',
        schedule: '周一至周五 8:30-16:30',
        room: '101教室',
        status: 'active',
        students: [
          { id: 1, name: '张三', age: 3, gender: '男', status: 'active' },
          { id: 2, name: '李四', age: 3, gender: '女', status: 'active' },
          { id: 3, name: '王五', age: 4, gender: '男', status: 'active' }
        ],
        recentRecords: [
          { id: 1, date: '2025-01-15', content: '今天学习了数字1-10', duration: 30 },
          { id: 2, date: '2025-01-14', content: '进行了户外活动', duration: 45 }
        ]
      };

      res.json({
        success: true,
        data: classDetail
      });
    } catch (error) {
      console.error('获取班级详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取班级详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取进度数据
   * GET /api/teacher/teaching/progress
   */
  public static async getProgressData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟进度数据
      const progressData = [
        {
          id: 1,
          subject: '语言发展',
          progress: 85,
          target: 90,
          status: 'on_track',
          lastUpdated: '2025-01-01'
        },
        {
          id: 2,
          subject: '数学认知',
          progress: 78,
          target: 80,
          status: 'on_track',
          lastUpdated: '2025-01-01'
        },
        {
          id: 3,
          subject: '艺术创作',
          progress: 92,
          target: 85,
          status: 'ahead',
          lastUpdated: '2025-01-01'
        },
        {
          id: 4,
          subject: '体能发展',
          progress: 65,
          target: 75,
          status: 'behind',
          lastUpdated: '2025-01-01'
        }
      ];

      res.json({
        success: true,
        data: progressData
      });
    } catch (error) {
      console.error('获取进度数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取进度数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取教学记录列表
   * GET /api/teacher-dashboard/teaching/records
   */
  public static async getTeachingRecords(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { classId, startDate, endDate, page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟教学记录数据
      const mockRecords = [
        {
          id: 1,
          classId: 1,
          className: '小班A',
          courseName: '语言发展',
          teachingDate: '2025-01-08',
          duration: 45,
          content: '学习儿歌《小星星》，练习发音和节奏',
          homework: '回家和家长一起唱儿歌',
          notes: '学生参与度高，表现良好',
          attachments: [],
          createdAt: '2025-01-08T10:00:00Z',
          updatedAt: '2025-01-08T10:00:00Z'
        },
        {
          id: 2,
          classId: 1,
          className: '小班A',
          courseName: '数学认知',
          teachingDate: '2025-01-07',
          duration: 40,
          content: '认识数字1-5，学习点数',
          homework: '在家练习数数',
          notes: '部分学生需要加强练习',
          attachments: [],
          createdAt: '2025-01-07T14:00:00Z',
          updatedAt: '2025-01-07T14:00:00Z'
        },
        {
          id: 3,
          classId: 2,
          className: '小班B',
          courseName: '艺术创作',
          teachingDate: '2025-01-06',
          duration: 50,
          content: '手工制作：彩色纸花',
          homework: '完成作品装饰',
          notes: '学生创意丰富',
          attachments: ['flower1.jpg', 'flower2.jpg'],
          createdAt: '2025-01-06T15:00:00Z',
          updatedAt: '2025-01-06T15:00:00Z'
        }
      ];

      // 简单筛选（实际应该从数据库查询）
      let filteredRecords = mockRecords;
      if (classId) {
        filteredRecords = filteredRecords.filter(r => r.classId === parseInt(classId as string));
      }

      // 分页
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const total = filteredRecords.length;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          records: paginatedRecords,
          total,
          page: pageNum,
          limit: limitNum
        }
      });
    } catch (error) {
      console.error('获取教学记录失败:', error);
      res.status(500).json({
        success: false,
        message: '获取教学记录失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 创建教学记录
   * POST /api/teacher-dashboard/teaching/records
   */
  public static async createTeachingRecord(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { classId, subject, content, date, duration, notes } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟创建教学记录
      const newRecord = {
        id: Date.now(),
        classId,
        subject,
        content,
        date,
        duration,
        notes,
        teacherId: teacher.id,
        teacherName: teacher.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: '教学记录创建成功',
        data: newRecord
      });
    } catch (error) {
      console.error('创建教学记录失败:', error);
      res.status(500).json({
        success: false,
        message: '创建教学记录失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取学生详情
   * GET /api/teacher-dashboard/teaching/students/:id
   */
  public static async getStudentDetail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const studentId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      if (!studentId) {
        res.status(400).json({
          success: false,
          message: '学生ID不能为空'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟学生详情数据
      const studentDetail = {
        id: parseInt(studentId),
        name: '张三',
        age: 3,
        gender: '男',
        status: 'active',
        classId: 1,
        className: '小班A',
        enrollmentDate: '2024-09-01',
        parentName: '张父',
        parentPhone: '13800138000',
        records: [
          { id: 1, date: '2025-01-15', content: '学习了数字1-10', score: 85 },
          { id: 2, date: '2025-01-14', content: '进行了户外活动', score: 90 }
        ],
        progress: [
          { id: 1, subject: '语言发展', progress: 85, target: 90 },
          { id: 2, subject: '数学认知', progress: 78, target: 80 }
        ]
      };

      res.json({
        success: true,
        data: studentDetail
      });
    } catch (error) {
      console.error('获取学生详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取学生详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取学生列表
   * GET /api/teacher-dashboard/teaching/students
   */
  public static async getStudentsList(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { classId, gender, keyword, page = 1, limit = 12 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟学生数据
      const mockStudents = [
        {
          id: 1,
          name: '张小明',
          gender: 'male',
          age: 4,
          classId: 1,
          className: '小班A',
          avatar: '/avatars/student1.jpg',
          parentName: '张先生',
          parentPhone: '13800138001',
          enrollmentDate: '2024-09-01',
          status: 'active'
        },
        {
          id: 2,
          name: '李小红',
          gender: 'female',
          age: 4,
          classId: 1,
          className: '小班A',
          avatar: '/avatars/student2.jpg',
          parentName: '李女士',
          parentPhone: '13800138002',
          enrollmentDate: '2024-09-01',
          status: 'active'
        },
        {
          id: 3,
          name: '王小刚',
          gender: 'male',
          age: 4,
          classId: 1,
          className: '小班A',
          avatar: '/avatars/student3.jpg',
          parentName: '王先生',
          parentPhone: '13800138003',
          enrollmentDate: '2024-09-01',
          status: 'active'
        },
        {
          id: 4,
          name: '赵小丽',
          gender: 'female',
          age: 4,
          classId: 2,
          className: '小班B',
          avatar: '/avatars/student4.jpg',
          parentName: '赵女士',
          parentPhone: '13800138004',
          enrollmentDate: '2024-09-01',
          status: 'active'
        },
        {
          id: 5,
          name: '陈小强',
          gender: 'male',
          age: 5,
          classId: 3,
          className: '中班A',
          avatar: '/avatars/student5.jpg',
          parentName: '陈先生',
          parentPhone: '13800138005',
          enrollmentDate: '2024-09-01',
          status: 'active'
        }
      ];

      // 筛选
      let filteredStudents = mockStudents;
      if (classId) {
        filteredStudents = filteredStudents.filter(s => s.classId === parseInt(classId as string));
      }
      if (gender) {
        filteredStudents = filteredStudents.filter(s => s.gender === gender);
      }
      if (keyword) {
        const kw = (keyword as string).toLowerCase();
        filteredStudents = filteredStudents.filter(s =>
          s.name.toLowerCase().includes(kw) ||
          s.parentName.toLowerCase().includes(kw)
        );
      }

      // 分页
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const total = filteredStudents.length;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          students: paginatedStudents,
          total,
          page: pageNum,
          limit: limitNum
        }
      });
    } catch (error) {
      console.error('获取学生列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取学生列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新进度
   * PUT /api/teacher/teaching/progress/:id
   */
  public static async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const progressId = req.params.id;
      const { progress, notes } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 通过用户ID查找教师记录
      // 使用文件顶部静态导入的 Teacher 模型
      const teacher = await Teacher.findOne({
        where: { userId: userId }
      });

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '教师信息不存在'
        });
        return;
      }

      // 模拟更新进度
      const updatedProgress = {
        id: parseInt(progressId),
        subject: '语言发展',
        progress: progress || 85,
        target: 90,
        status: progress >= 90 ? 'ahead' : progress >= 80 ? 'on_track' : 'behind',
        notes: notes || '进度更新',
        lastUpdated: new Date().toISOString()
      };

      res.json({
        success: true,
        message: '进度更新成功',
        data: updatedProgress
      });
    } catch (error) {
      console.error('更新进度失败:', error);
      res.status(500).json({
        success: false,
        message: '更新进度失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}
