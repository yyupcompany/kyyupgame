import { vi } from 'vitest'
/**
 * Task Comment Service Test
 * 任务评论服务测试
 * 
 * 测试覆盖范围：
 * - 任务评论列表获取
 * - 评论添加功能
 * - 评论更新功能
 * - 评论删除功能
 * - 评论统计获取
 * - 评论树结构构建
 * - 最近评论获取
 * - 评论已读标记
 * - 未读评论数量统计
 * - 权限检查机制
 * - 分页功能
 * - 数据验证
 * - 错误处理机制
 */

import { TaskCommentService } from '../../../src/services/task-comment.service'
import { DatabaseService } from '../../../src/services/database.service'

// Mock dependencies
jest.mock('../../../src/services/database.service')


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('TaskCommentService', () => {
  let taskCommentService: TaskCommentService
  let mockDatabaseService: jest.Mocked<DatabaseService>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockDatabaseService = DatabaseService as jest.Mocked<any>

    // Create service instance
    taskCommentService = new TaskCommentService()
  })

  describe('getTaskComments', () => {
    it('应该成功获取任务评论列表', async () => {
      const mockComments = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          content: 'Test comment',
          type: 'comment',
          parent_id: null,
          user_name: 'Test User',
          user_avatar: 'avatar.jpg',
          user_role: 'admin'
        },
        {
          id: 2,
          task_id: 1,
          user_id: 2,
          content: 'Reply comment',
          type: 'comment',
          parent_id: 1,
          user_name: 'Reply User',
          user_avatar: 'reply.jpg',
          user_role: 'user'
        }
      ]

      const mockCountResult = { total: 2 }

      mockDatabaseService.query.mockResolvedValueOnce(mockComments)
      mockDatabaseService.query.mockResolvedValueOnce([mockCountResult])

      const options = { page: 1, limit: 10 }
      const result = await taskCommentService.getTaskComments(1, options)

      expect(result).toEqual({
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      })

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tc.*, u.name as user_name'),
        [1, 10, 0]
      )
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) as total FROM task_comments WHERE task_id = ?',
        [1]
      )
    })

    it('应该正确处理分页', async () => {
      const mockComments = []
      const mockCountResult = { total: 25 }

      mockDatabaseService.query.mockResolvedValueOnce(mockComments)
      mockDatabaseService.query.mockResolvedValueOnce([mockCountResult])

      const options = { page: 2, limit: 10 }
      const result = await taskCommentService.getTaskComments(1, options)

      expect(result.pagination.totalPages).toBe(3)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ? OFFSET ?'),
        [1, 10, 10]
      )
    })

    it('应该构建评论树结构', async () => {
      const mockComments = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          content: 'Parent comment',
          type: 'comment',
          parent_id: null,
          user_name: 'Parent User'
        },
        {
          id: 2,
          task_id: 1,
          user_id: 2,
          content: 'Child comment',
          type: 'comment',
          parent_id: 1,
          user_name: 'Child User'
        },
        {
          id: 3,
          task_id: 1,
          user_id: 3,
          content: 'Another parent',
          type: 'comment',
          parent_id: null,
          user_name: 'Another User'
        }
      ]

      const mockCountResult = { total: 3 }

      mockDatabaseService.query.mockResolvedValueOnce(mockComments)
      mockDatabaseService.query.mockResolvedValueOnce([mockCountResult])

      const result = await taskCommentService.getTaskComments(1, { page: 1, limit: 10 })

      expect(result.data).toHaveLength(2) // Two root comments
      expect(result.data[0].replies).toHaveLength(1) // First root has one reply
      expect(result.data[0].replies[0].content).toBe('Child comment')
      expect(result.data[1].replies).toHaveLength(0) // Second root has no replies
    })
  })

  describe('addComment', () => {
    it('应该成功添加评论', async () => {
      const mockResult = { insertId: 1 }
      const mockComment = {
        id: 1,
        task_id: 1,
        user_id: 1,
        content: 'New comment',
        type: 'comment',
        parent_id: null,
        attachments: null,
        is_internal: false,
        user_name: 'Test User',
        user_avatar: 'avatar.jpg',
        user_role: 'user'
      }

      mockDatabaseService.query.mockResolvedValueOnce(mockResult)
      mockDatabaseService.query.mockResolvedValueOnce([mockComment])

      const commentData = {
        task_id: 1,
        user_id: 1,
        content: 'New comment',
        type: 'comment' as const
      }

      const result = await taskCommentService.addComment(commentData)

      expect(result).toEqual(mockComment)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_comments'),
        [1, 1, 'New comment', 'comment', null, null, false]
      )
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tc.*, u.name as user_name'),
        [1]
      )
    })

    it('应该使用默认值添加评论', async () => {
      const mockResult = { insertId: 1 }
      const mockComment = {
        id: 1,
        task_id: 1,
        user_id: 1,
        content: 'Default comment',
        type: 'comment',
        is_internal: false
      }

      mockDatabaseService.query.mockResolvedValueOnce(mockResult)
      mockDatabaseService.query.mockResolvedValueOnce([mockComment])

      const commentData = {
        task_id: 1,
        user_id: 1,
        content: 'Default comment'
      }

      await taskCommentService.addComment(commentData)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_comments'),
        [1, 1, 'Default comment', 'comment', null, null, false]
      )
    })

    it('应该正确处理附件', async () => {
      const mockResult = { insertId: 1 }
      const mockComment = {
        id: 1,
        task_id: 1,
        user_id: 1,
        content: 'Comment with attachments',
        type: 'comment',
        attachments: { files: ['file1.pdf', 'file2.jpg'] }
      }

      mockDatabaseService.query.mockResolvedValueOnce(mockResult)
      mockDatabaseService.query.mockResolvedValueOnce([mockComment])

      const commentData = {
        task_id: 1,
        user_id: 1,
        content: 'Comment with attachments',
        attachments: { files: ['file1.pdf', 'file2.jpg'] }
      }

      await taskCommentService.addComment(commentData)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_comments'),
        [1, 1, 'Comment with attachments', 'comment', null, JSON.stringify({ files: ['file1.pdf', 'file2.jpg'] }), false]
      )
    })

    it('应该正确处理回复评论', async () => {
      const mockResult = { insertId: 2 }
      const mockComment = {
        id: 2,
        task_id: 1,
        user_id: 2,
        content: 'Reply comment',
        type: 'comment',
        parent_id: 1
      }

      mockDatabaseService.query.mockResolvedValueOnce(mockResult)
      mockDatabaseService.query.mockResolvedValueOnce([mockComment])

      const commentData = {
        task_id: 1,
        user_id: 2,
        content: 'Reply comment',
        type: 'comment' as const,
        parent_id: 1
      }

      await taskCommentService.addComment(commentData)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_comments'),
        [1, 2, 'Reply comment', 'comment', 1, null, false]
      )
    })
  })

  describe('updateComment', () => {
    it('应该成功更新评论', async () => {
      const existingComment = { user_id: 1 }
      const updatedComment = {
        id: 1,
        task_id: 1,
        user_id: 1,
        content: 'Updated content',
        type: 'comment',
        user_name: 'Test User'
      }

      mockDatabaseService.query.mockResolvedValueOnce([existingComment])
      mockDatabaseService.query.mockResolvedValueOnce([updatedComment])

      const updateData = {
        content: 'Updated content',
        type: 'feedback' as const
      }

      const result = await taskCommentService.updateComment(1, updateData, 1)

      expect(result).toEqual(updatedComment)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT user_id FROM task_comments WHERE id = ?',
        [1]
      )
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE task_comments'),
        ['Updated content', 'feedback', 1]
      )
    })

    it('评论不存在时应该抛出错误', async () => {
      mockDatabaseService.query.mockResolvedValueOnce([])

      await expect(taskCommentService.updateComment(999, {}, 1))
        .rejects.toThrow('评论不存在')
    })

    it('无权限修改时应该抛出错误', async () => {
      const existingComment = { user_id: 2 } // Different user

      mockDatabaseService.query.mockResolvedValueOnce([existingComment])

      await expect(taskCommentService.updateComment(1, {}, 1))
        .rejects.toThrow('无权限修改此评论')
    })

    it('没有需要更新的字段时应该抛出错误', async () => {
      const existingComment = { user_id: 1 }

      mockDatabaseService.query.mockResolvedValueOnce([existingComment])

      await expect(taskCommentService.updateComment(1, {}, 1))
        .rejects.toThrow('没有需要更新的字段')
    })

    it('应该正确处理附件更新', async () => {
      const existingComment = { user_id: 1 }
      const updatedComment = {
        id: 1,
        content: 'Updated with attachments',
        attachments: { files: ['new.pdf'] }
      }

      mockDatabaseService.query.mockResolvedValueOnce([existingComment])
      mockDatabaseService.query.mockResolvedValueOnce([updatedComment])

      const updateData = {
        content: 'Updated with attachments',
        attachments: { files: ['new.pdf'] }
      }

      await taskCommentService.updateComment(1, updateData, 1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE task_comments'),
        ['Updated with attachments', JSON.stringify({ files: ['new.pdf'] }), 1]
      )
    })
  })

  describe('deleteComment', () => {
    it('应该成功删除评论', async () => {
      const existingComment = { user_id: 1 }

      mockDatabaseService.query.mockResolvedValueOnce([existingComment])

      await taskCommentService.deleteComment(1, 1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT user_id FROM task_comments WHERE id = ?',
        [1]
      )
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'DELETE FROM task_comments WHERE id = ? OR parent_id = ?',
        [1, 1]
      )
    })

    it('评论不存在时应该抛出错误', async () => {
      mockDatabaseService.query.mockResolvedValueOnce([])

      await expect(taskCommentService.deleteComment(999, 1))
        .rejects.toThrow('评论不存在')
    })

    it('无权限删除时应该抛出错误', async () => {
      const existingComment = { user_id: 2 } // Different user

      mockDatabaseService.query.mockResolvedValueOnce([existingComment])

      await expect(taskCommentService.deleteComment(1, 1))
        .rejects.toThrow('无权限删除此评论')
    })
  })

  describe('getCommentStats', () => {
    it('应该成功获取评论统计', async () => {
      const mockStats = {
        total_comments: 10,
        general_comments: 5,
        feedback_comments: 2,
        question_comments: 2,
        correction_comments: 1,
        completion_comments: 0
      }

      mockDatabaseService.query.mockResolvedValueOnce([mockStats])

      const result = await taskCommentService.getCommentStats(1)

      expect(result).toEqual(mockStats)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as total_comments'),
        [1]
      )
    })
  })

  describe('buildCommentTree', () => {
    it('应该正确构建评论树', () => {
      const service = taskCommentService as any
      const comments = [
        { id: 1, parent_id: null, content: 'Root 1' },
        { id: 2, parent_id: 1, content: 'Child 1' },
        { id: 3, parent_id: 1, content: 'Child 2' },
        { id: 4, parent_id: null, content: 'Root 2' },
        { id: 5, parent_id: 2, content: 'Grandchild 1' }
      ]

      const tree = service.buildCommentTree(comments)

      expect(tree).toHaveLength(2) // Two root comments
      expect(tree[0].content).toBe('Root 1')
      expect(tree[0].replies).toHaveLength(2) // Root 1 has 2 children
      expect(tree[0].replies[0].content).toBe('Child 1')
      expect(tree[0].replies[0].replies).toHaveLength(1) // Child 1 has 1 grandchild
      expect(tree[0].replies[0].replies[0].content).toBe('Grandchild 1')
      expect(tree[1].content).toBe('Root 2')
      expect(tree[1].replies).toHaveLength(0) // Root 2 has no children
    })

    it('应该处理孤立的回复评论', () => {
      const service = taskCommentService as any
      const comments = [
        { id: 1, parent_id: null, content: 'Root' },
        { id: 2, parent_id: 99, content: 'Orphan reply' } // Parent doesn't exist
      ]

      const tree = service.buildCommentTree(comments)

      expect(tree).toHaveLength(1) // Only one root comment
      expect(tree[0].content).toBe('Root')
      expect(tree[0].replies).toHaveLength(0) // No replies since parent 99 doesn't exist
    })
  })

  describe('getRecentComments', () => {
    it('应该成功获取最近评论', async () => {
      const mockComments = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          content: 'Recent comment 1',
          user_name: 'User 1'
        },
        {
          id: 2,
          task_id: 1,
          user_id: 2,
          content: 'Recent comment 2',
          user_name: 'User 2'
        }
      ]

      mockDatabaseService.query.mockResolvedValue(mockComments)

      const result = await taskCommentService.getRecentComments(1, 5)

      expect(result).toEqual(mockComments)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY tc.created_at DESC'),
        [1, 5]
      )
    })

    it('应该使用默认限制数量', async () => {
      mockDatabaseService.query.mockResolvedValue([])

      await taskCommentService.getRecentComments(1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [1, 5]
      )
    })
  })

  describe('markCommentAsRead', () => {
    it('应该标记评论为已读', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await taskCommentService.markCommentAsRead(1, 1)

      expect(consoleSpy).toHaveBeenCalledWith('用户 1 已读评论 1')

      consoleSpy.mockRestore()
    })
  })

  describe('getUnreadCommentCount', () => {
    it('应该成功获取未读评论数量', async () => {
      const mockResult = { unread_count: 5 }

      mockDatabaseService.query.mockResolvedValueOnce([mockResult])

      const result = await taskCommentService.getUnreadCommentCount(1)

      expect(result).toBe(5)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as unread_count'),
        [1, 1, 1, 1]
      )
    })

    it('没有未读评论时应该返回0', async () => {
      const mockResult = { unread_count: null }

      mockDatabaseService.query.mockResolvedValueOnce([mockResult])

      const result = await taskCommentService.getUnreadCommentCount(1)

      expect(result).toBe(0)
    })
  })
})