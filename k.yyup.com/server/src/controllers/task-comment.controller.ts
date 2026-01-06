import { Request, Response } from 'express';
import { TaskComment } from '../models/task-comment.model';
import { User } from '../models/user.model';
import InspectionTask from '../models/inspection-task.model';

/**
 * 任务评论控制器
 */
export class TaskCommentController {
  /**
   * 获取任务的所有评论
   */
  static async getTaskComments(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;

      const comments = await TaskComment.findAll({
        where: { taskId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'realName', 'avatar']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: comments
      });
    } catch (error: any) {
      console.error('获取任务评论失败:', error);
      res.status(500).json({
        success: false,
        message: '获取任务评论失败',
        error: error.message
      });
    }
  }

  /**
   * 创建任务评论
   */
  static async createComment(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { content } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权'
        });
        return;
      }

      if (!content || content.trim() === '') {
        res.status(400).json({
          success: false,
          message: '评论内容不能为空'
        });
        return;
      }

      // 验证任务是否存在
      const task = await InspectionTask.findByPk(taskId);
      if (!task) {
        res.status(404).json({
          success: false,
          message: '任务不存在'
        });
        return;
      }

      const comment = await TaskComment.create({
        taskId: parseInt(taskId),
        userId,
        content: content.trim()
      });

      // 获取完整的评论信息（包含用户信息）
      const fullComment = await TaskComment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'realName', 'avatar']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: fullComment,
        message: '评论创建成功'
      });
    } catch (error: any) {
      console.error('创建任务评论失败:', error);
      res.status(500).json({
        success: false,
        message: '创建任务评论失败',
        error: error.message
      });
    }
  }

  /**
   * 删除任务评论
   */
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权'
        });
        return;
      }

      const comment = await TaskComment.findByPk(commentId);
      if (!comment) {
        res.status(404).json({
          success: false,
          message: '评论不存在'
        });
        return;
      }

      // 只有评论作者可以删除
      if (comment.userId !== userId) {
        res.status(403).json({
          success: false,
          message: '无权删除此评论'
        });
        return;
      }

      await comment.destroy();

      res.json({
        success: true,
        message: '评论删除成功'
      });
    } catch (error: any) {
      console.error('删除任务评论失败:', error);
      res.status(500).json({
        success: false,
        message: '删除任务评论失败',
        error: error.message
      });
    }
  }
}

export default TaskCommentController;

