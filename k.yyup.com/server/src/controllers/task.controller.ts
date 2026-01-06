import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { TaskCommentService } from '../services/task-comment.service';
import { TaskTemplateService } from '../services/task-template.service';
import { handleApiResponse } from '../utils/api-response-handler';

export class TaskController {
  private taskService: TaskService;
  private commentService: TaskCommentService;
  private templateService: TaskTemplateService;

  constructor() {
    this.taskService = new TaskService();
    this.commentService = new TaskCommentService();
    this.templateService = new TaskTemplateService();
  }

  // ==================== 任务管理 ====================

  /**
   * 获取任务列表
   */
  async getTasks(req: Request, res: Response) {
    try {
      console.log('🔍 [TaskController] getTasks 被调用');
      console.log('🔍 [TaskController] this.taskService:', this.taskService);

      const {
        page = 1,
        limit = 20,
        status,
        priority,
        type,
        assignee_id,
        creator_id,
        related_type,
        related_id,
        keyword,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const filters = {
        status: status as string,
        priority: priority as string,
        type: type as string,
        assignee_id: assignee_id ? parseInt(assignee_id as string) : undefined,
        creator_id: creator_id ? parseInt(creator_id as string) : undefined,
        related_type: related_type as string,
        related_id: related_id ? parseInt(related_id as string) : undefined,
        keyword: keyword as string
      };

      // 如果是教师角色，只显示分配给自己的任务或自己创建的任务
      if (userRole === 'teacher' && userId) {
        console.log('[任务API] 检测到教师角色，用户ID:', userId);
        // 教师只能看到分配给自己的任务或自己创建的任务
        if (!filters.assignee_id && !filters.creator_id) {
          // 如果没有指定assignee_id或creator_id，默认显示分配给当前教师的任务
          filters.assignee_id = userId;
        } else if (filters.assignee_id && filters.assignee_id !== userId) {
          // 如果指定了其他人的assignee_id，教师无权查看，返回空结果
          filters.assignee_id = -1; // 设置一个不存在的ID
        } else if (filters.creator_id && filters.creator_id !== userId) {
          // 如果指定了其他人的creator_id，教师无权查看，返回空结果
          filters.creator_id = -1; // 设置一个不存在的ID
        }
      }

      const result = await this.taskService.getTasks({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        sortBy: sort_by as string,
        sortOrder: sort_order as 'ASC' | 'DESC'
      });

      // 转换数据格式以匹配前端期望的结构
      const responseData = {
        tasks: result.data || [],
        total: result.pagination?.total || 0,
        page: result.pagination?.page || parseInt(page as string),
        limit: result.pagination?.limit || parseInt(limit as string),
        totalPages: result.pagination?.totalPages || 0
      };

      handleApiResponse(res, responseData, '获取任务列表成功');
    } catch (error) {
      handleApiResponse(res, null, '获取任务列表失败', error);
    }
  }

  /**
   * 获取任务详情
   */
  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const taskId = parseInt(id);

      if (isNaN(taskId)) {
        return handleApiResponse(res, null, '无效的任务ID', null, 400);
      }

      const task = await this.taskService.getTaskById(taskId);
      
      if (!task) {
        return handleApiResponse(res, null, '任务不存在', null, 404);
      }

      handleApiResponse(res, task, '获取任务详情成功');
    } catch (error) {
      handleApiResponse(res, null, '获取任务详情失败', error);
    }
  }

  /**
   * 创建任务
   */
  async createTask(req: Request, res: Response) {
    try {
      console.log('🎯 TaskController.createTask 开始');
      const taskData = req.body;
      const userId = req.user?.id;
      
      console.log('📥 接收到的任务数据:', JSON.stringify(taskData, null, 2));
      console.log('👤 用户ID:', userId);

      // 暂时允许未登录用户创建任务（用于测试）
      // 如果没有登录用户，使用传入的creator_id或默认值1
      if (!taskData.creator_id) {
        taskData.creator_id = userId || 1;
      }
      
      console.log('📝 处理后的任务数据:', JSON.stringify(taskData, null, 2));
      console.log('🚀 调用 TaskService.createTask...');

      const task = await this.taskService.createTask(taskData);
      
      console.log('✅ TaskService.createTask 返回:', task);
      handleApiResponse(res, task, '创建任务成功', null, 201);
    } catch (error) {
      console.error('❌ TaskController.createTask 错误:', error);
      handleApiResponse(res, null, '创建任务失败', error);
    }
  }

  /**
   * 更新任务
   */
  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const taskId = parseInt(id);
      const updateData = req.body;
      const userId = req.user?.id;

      if (isNaN(taskId)) {
        return handleApiResponse(res, null, '无效的任务ID', null, 400);
      }

      const task = await this.taskService.updateTask(taskId, updateData, userId);
      handleApiResponse(res, task, '更新任务成功');
    } catch (error) {
      handleApiResponse(res, null, '更新任务失败', error);
    }
  }

  /**
   * 删除任务
   */
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const taskId = parseInt(id);
      const userId = req.user?.id;

      if (isNaN(taskId)) {
        return handleApiResponse(res, null, '无效的任务ID', null, 400);
      }

      await this.taskService.deleteTask(taskId, userId);
      handleApiResponse(res, null, '删除任务成功');
    } catch (error) {
      handleApiResponse(res, null, '删除任务失败', error);
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const taskId = parseInt(id);
      const userId = req.user?.id;

      if (isNaN(taskId)) {
        return handleApiResponse(res, null, '无效的任务ID', null, 400);
      }

      const task = await this.taskService.updateTaskStatus(taskId, status, userId);
      handleApiResponse(res, task, '更新任务状态成功');
    } catch (error) {
      handleApiResponse(res, null, '更新任务状态失败', error);
    }
  }

  /**
   * 更新任务进度
   */
  async updateTaskProgress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      const taskId = parseInt(id);
      const userId = req.user?.id;

      if (isNaN(taskId)) {
        return handleApiResponse(res, null, '无效的任务ID', null, 400);
      }

      if (progress < 0 || progress > 100) {
        return handleApiResponse(res, null, '进度值必须在0-100之间', null, 400);
      }

      const task = await this.taskService.updateTaskProgress(taskId, progress, userId);
      handleApiResponse(res, task, '更新任务进度成功');
    } catch (error) {
      handleApiResponse(res, null, '更新任务进度失败', error);
    }
  }

  // ==================== 任务评论 ====================

  /**
   * 获取任务评论
   */
  async getTaskComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const taskId = parseInt(id);
      const { page = 1, limit = 20 } = req.query;

      if (isNaN(taskId)) {
        return handleApiResponse(res, null, '无效的任务ID', null, 400);
      }

      const comments = await this.commentService.getTaskComments(taskId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      handleApiResponse(res, comments, '获取任务评论成功');
    } catch (error) {
      handleApiResponse(res, null, '获取任务评论失败', error);
    }
  }

  /**
   * 添加任务评论
   */
  async addTaskComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const taskId = parseInt(id);
      const commentData = req.body;
      const userId = req.user?.id;

      if (isNaN(taskId)) {
        return handleApiResponse(res, null, '无效的任务ID', null, 400);
      }

      if (!userId) {
        return handleApiResponse(res, null, '用户未登录', null, 401);
      }

      commentData.task_id = taskId;
      commentData.user_id = userId;

      const comment = await this.commentService.addComment(commentData);
      handleApiResponse(res, comment, '添加评论成功', null, 201);
    } catch (error) {
      handleApiResponse(res, null, '添加评论失败', error);
    }
  }

  // ==================== 任务模板 ====================

  /**
   * 获取任务模板列表
   */
  async getTaskTemplates(req: Request, res: Response) {
    try {
      const { type, category, is_active = '1' } = req.query;

      const filters = {
        type: type as string,
        category: category as string,
        is_active: is_active === '1'
      };

      const templates = await this.templateService.getTemplates(filters);
      handleApiResponse(res, templates, '获取任务模板成功');
    } catch (error) {
      handleApiResponse(res, null, '获取任务模板失败', error);
    }
  }

  /**
   * 根据模板创建任务
   */
  async createTaskFromTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { customData } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return handleApiResponse(res, null, '用户未登录', null, 401);
      }

      const task = await this.taskService.createTaskFromTemplate(
        parseInt(templateId),
        customData,
        userId
      );

      handleApiResponse(res, task, '从模板创建任务成功', null, 201);
    } catch (error) {
      handleApiResponse(res, null, '从模板创建任务失败', error);
    }
  }

  // ==================== 任务统计 ====================

  /**
   * 获取任务统计数据
   */
  async getTaskStats(req: Request, res: Response) {
    try {
      const {
        user_id,
        date_range = '30',
        group_by = 'status'
      } = req.query;

      // 管理员查看所有任务统计，其他用户只看分配给自己的任务
      const userRole = req.user?.role;
      let userId: number | undefined;

      if (user_id) {
        // 如果明确指定了 user_id，使用指定的用户ID
        userId = parseInt(user_id as string);
      } else if (userRole !== 'admin' && userRole !== 'principal') {
        // 非管理员角色，只能看到分配给自己的任务
        userId = req.user?.id;
      }
      // 管理员角色不设置 userId，查看所有任务

      const dateRange = parseInt(date_range as string);

      console.log('🔍 [TaskController] getTaskStats 调用参数:', {
        query: req.query,
        user: req.user,
        userRole,
        userId: userId || 'all', // undefined 表示查看所有任务
        dateRange,
        groupBy: group_by
      });

      const stats = await this.taskService.getTaskStats({
        userId,
        dateRange,
        groupBy: group_by as string
      });

      console.log('🔍 [TaskController] getTaskStats 返回结果:', stats);

      handleApiResponse(res, stats, '获取任务统计成功');
    } catch (error) {
      console.error('❌ [TaskController] getTaskStats 错误:', error);
      handleApiResponse(res, null, '获取任务统计失败', error);
    }
  }
}
