import { DatabaseService } from './database.service';

export interface TaskComment {
  id?: number;
  task_id: number;
  user_id: number;
  content: string;
  type: 'comment' | 'feedback' | 'correction' | 'completion' | 'question';
  parent_id?: number;
  attachments?: any;
  is_internal: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class TaskCommentService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * 获取任务评论列表
   */
  async getTaskComments(taskId: number, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        tc.*,
        u.name as user_name,
        u.avatar as user_avatar,
        u.role as user_role
      FROM task_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
      LIMIT ? OFFSET ?
    `;

    const comments = await this.db.query(query, [taskId, limit, offset]);

    // 查询总数
    const countQuery = 'SELECT COUNT(*) as total FROM task_comments WHERE task_id = ?';
    const [countResult] = await this.db.query(countQuery, [taskId]);
    const total = countResult.total;

    // 构建评论树结构
    const commentTree = this.buildCommentTree(comments);

    return {
      data: commentTree,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 添加评论
   */
  async addComment(commentData: Partial<TaskComment>): Promise<TaskComment> {
    const {
      task_id,
      user_id,
      content,
      type = 'comment',
      parent_id,
      attachments,
      is_internal = false
    } = commentData;

    const query = `
      INSERT INTO task_comments (
        task_id, user_id, content, type, parent_id, attachments, is_internal
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      task_id,
      user_id,
      content,
      type,
      parent_id,
      attachments ? JSON.stringify(attachments) : null,
      is_internal
    ];

    const result = await this.db.query(query, params);
    const commentId = result.insertId;

    // 获取完整的评论信息
    const getCommentQuery = `
      SELECT 
        tc.*,
        u.name as user_name,
        u.avatar as user_avatar,
        u.role as user_role
      FROM task_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.id = ?
    `;

    const [comment] = await this.db.query(getCommentQuery, [commentId]);
    return comment;
  }

  /**
   * 更新评论
   */
  async updateComment(id: number, updateData: Partial<TaskComment>, userId: number): Promise<TaskComment> {
    // 检查权限
    const checkQuery = 'SELECT user_id FROM task_comments WHERE id = ?';
    const [existingComment] = await this.db.query(checkQuery, [id]);

    if (!existingComment) {
      throw new Error('评论不存在');
    }

    if (existingComment.user_id !== userId) {
      throw new Error('无权限修改此评论');
    }

    // 构建更新字段
    const updateFields: string[] = [];
    const params: any[] = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key as keyof TaskComment] !== undefined) {
        updateFields.push(`${key} = ?`);
        
        if (key === 'attachments') {
          params.push(JSON.stringify(updateData[key as keyof TaskComment]));
        } else {
          params.push(updateData[key as keyof TaskComment]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('没有需要更新的字段');
    }

    const query = `
      UPDATE task_comments 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await this.db.query(query, [...params, id]);

    // 返回更新后的评论
    const getCommentQuery = `
      SELECT 
        tc.*,
        u.name as user_name,
        u.avatar as user_avatar,
        u.role as user_role
      FROM task_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.id = ?
    `;

    const [comment] = await this.db.query(getCommentQuery, [id]);
    return comment;
  }

  /**
   * 删除评论
   */
  async deleteComment(id: number, userId: number): Promise<void> {
    // 检查权限
    const checkQuery = 'SELECT user_id FROM task_comments WHERE id = ?';
    const [existingComment] = await this.db.query(checkQuery, [id]);

    if (!existingComment) {
      throw new Error('评论不存在');
    }

    if (existingComment.user_id !== userId) {
      throw new Error('无权限删除此评论');
    }

    // 删除评论及其回复
    const deleteQuery = 'DELETE FROM task_comments WHERE id = ? OR parent_id = ?';
    await this.db.query(deleteQuery, [id, id]);
  }

  /**
   * 获取评论统计
   */
  async getCommentStats(taskId: number) {
    const query = `
      SELECT 
        COUNT(*) as total_comments,
        SUM(CASE WHEN type = 'comment' THEN 1 ELSE 0 END) as general_comments,
        SUM(CASE WHEN type = 'feedback' THEN 1 ELSE 0 END) as feedback_comments,
        SUM(CASE WHEN type = 'question' THEN 1 ELSE 0 END) as question_comments,
        SUM(CASE WHEN type = 'correction' THEN 1 ELSE 0 END) as correction_comments,
        SUM(CASE WHEN type = 'completion' THEN 1 ELSE 0 END) as completion_comments
      FROM task_comments
      WHERE task_id = ?
    `;

    const [stats] = await this.db.query(query, [taskId]);
    return stats;
  }

  /**
   * 构建评论树结构
   */
  private buildCommentTree(comments: any[]): any[] {
    const commentMap = new Map();
    const rootComments: any[] = [];

    // 首先创建所有评论的映射
    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // 然后构建树结构
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  /**
   * 获取最近的评论
   */
  async getRecentComments(taskId: number, limit: number = 5) {
    const query = `
      SELECT 
        tc.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM task_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at DESC
      LIMIT ?
    `;

    return await this.db.query(query, [taskId, limit]);
  }

  /**
   * 标记评论为已读
   */
  async markCommentAsRead(commentId: number, userId: number): Promise<void> {
    // 这里可以实现评论已读状态的逻辑
    // 可以创建一个 comment_reads 表来跟踪用户的阅读状态
    
    // 暂时先记录日志
    console.log(`用户 ${userId} 已读评论 ${commentId}`);
  }

  /**
   * 获取用户未读评论数量
   */
  async getUnreadCommentCount(userId: number): Promise<number> {
    // 获取用户相关任务的未读评论数量
    const query = `
      SELECT COUNT(*) as unread_count
      FROM task_comments tc
      INNER JOIN tasks t ON tc.task_id = t.id
      WHERE (t.assignee_id = ? OR t.creator_id = ?)
        AND tc.user_id != ?
        AND tc.created_at > COALESCE(
          (SELECT last_read_at FROM user_comment_reads WHERE user_id = ? AND task_id = tc.task_id),
          '1970-01-01'
        )
    `;

    const [result] = await this.db.query(query, [userId, userId, userId, userId]);
    return result.unread_count || 0;
  }
}
