
vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

import { 
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

describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskProgress,
  assignTask,
  getTaskStatistics,
  getTaskTrends,
  getTaskAnalytics,
  getTaskTemplates,
  createTaskFromTemplate,
  batchUpdateTasks,
  batchDeleteTasks,
  exportTasks,
  exportTaskReport,
  getTaskComments,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  getTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
  getRelatedTasks,
  linkTasks,
  unlinkTasks,
  type Task,
  type TaskStatistics,
  type TaskQuery,
  type CreateTaskData,
  type UpdateTaskData
} from '@/api/task-center';

// Mock request utility
vi.mock('../utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn()
  }
}));

// Mock request已在全局设置中配置

describe('Task Center API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Management APIs', () => {
    describe('getTasks', () => {
      it('should call get with correct endpoint and transformed params', async () => {
        const mockQuery: TaskQuery = {
          page: 1,
          pageSize: 10,
          status: 'pending',
          priority: 'high',
          keyword: 'test',
          assignedToMe: true,
          assigneeId: 5,
          creatorId: 3
        };
        const mockResponse = {
          data: [
            { id: 1, title: 'Test Task', status: 'pending', priority: 'high' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);
        
        const result = await getTasks(mockQuery);
        
        const expectedParams = {
          page: 1,
          limit: 10,
          status: 'pending',
          priority: 'high',
          keyword: 'test',
          assignee_id: 5,
          creator_id: 3
        };
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks', expectedParams);
        expect(result).toEqual(mockResponse);
      });

      it('should handle assignedToMe parameter correctly', async () => {
        const mockQuery: TaskQuery = {
          assignedToMe: true
        };
        
        mockRequest.get.mockResolvedValue({ data: [], total: 0 });
        
        await getTasks(mockQuery);
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks', {
          assignee_id: 121 // Hardcoded current user ID
        });
      });

      it('should handle empty query parameters', async () => {
        const mockResponse = { data: [], total: 0 };
        
        mockRequest.get.mockResolvedValue(mockResponse);
        
        const result = await getTasks();
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks', {});
        expect(result).toEqual(mockResponse);
      });

      it('should handle tasks API errors', async () => {
        const mockQuery: TaskQuery = { page: 1 };
        const mockError = new Error('Failed to fetch tasks');
        
        mockRequest.get.mockRejectedValue(mockError);
        
        await expect(getTasks(mockQuery)).rejects.toThrow('Failed to fetch tasks');
      });
    });

    describe('getTask', () => {
      it('should call get with correct endpoint', async () => {
        const taskId = 1;
        const mockResponse = {
          data: {
            id: taskId,
            title: 'Test Task',
            description: 'Task description',
            status: 'pending',
            priority: 'medium'
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);
        
        const result = await getTask(taskId);
        
        expect(mockRequest.get).toHaveBeenCalledWith(`tasks/${taskId}`);
        expect(result).toEqual(mockResponse);
      });

      it('should handle task not found', async () => {
        const taskId = 999;
        const mockError = new Error('Task not found');
        
        mockRequest.get.mockRejectedValue(mockError);
        
        await expect(getTask(taskId)).rejects.toThrow('Task not found');
      });
    });

    describe('createTask', () => {
      it('should call post with correct endpoint and data', async () => {
        const mockTaskData: CreateTaskData = {
          title: 'New Task',
          description: 'Task description',
          priority: 'high',
          status: 'pending',
          assignedTo: 5,
          dueDate: '2024-12-31',
          tags: ['urgent', 'backend']
        };
        const mockResponse = {
          data: { id: 2, ...mockTaskData }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);
        
        const result = await createTask(mockTaskData);
        
        expect(mockRequest.post).toHaveBeenCalledWith('tasks', mockTaskData);
        expect(result).toEqual(mockResponse);
      });

      it('should handle task creation with minimal data', async () => {
        const minimalData: CreateTaskData = {
          title: 'Simple Task',
          priority: 'medium'
        };
        
        mockRequest.post.mockResolvedValue({ data: { id: 3, ...minimalData } });
        
        await createTask(minimalData);
        
        expect(mockRequest.post).toHaveBeenCalledWith('tasks', minimalData);
      });

      it('should handle task creation validation errors', async () => {
        const invalidData: CreateTaskData = {
          title: '', // Invalid empty title
          priority: 'invalid_priority'
        };
        const mockError = new Error('Validation failed');
        
        mockRequest.post.mockRejectedValue(mockError);
        
        await expect(createTask(invalidData)).rejects.toThrow('Validation failed');
      });
    });

    describe('updateTask', () => {
      it('should call put with correct endpoint and data', async () => {
        const taskId = 1;
        const mockUpdateData: UpdateTaskData = {
          title: 'Updated Task',
          status: 'in_progress',
          progress: 50
        };
        const mockResponse = {
          data: { id: taskId, ...mockUpdateData }
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);
        
        const result = await updateTask(taskId, mockUpdateData);
        
        expect(mockRequest.put).toHaveBeenCalledWith(`tasks/${taskId}`, mockUpdateData);
        expect(result).toEqual(mockResponse);
      });

      it('should handle partial task updates', async () => {
        const taskId = 1;
        const partialUpdate: Partial<UpdateTaskData> = {
          progress: 75
        };
        
        mockRequest.put.mockResolvedValue({ data: { id: taskId, progress: 75 } });
        
        await updateTask(taskId, partialUpdate);
        
        expect(mockRequest.put).toHaveBeenCalledWith(`tasks/${taskId}`, partialUpdate);
      });

      it('should handle task update errors', async () => {
        const taskId = 1;
        const mockUpdateData: UpdateTaskData = { status: 'completed' };
        const mockError = new Error('Failed to update task');
        
        mockRequest.put.mockRejectedValue(mockError);
        
        await expect(updateTask(taskId, mockUpdateData)).rejects.toThrow('Failed to update task');
      });
    });

    describe('deleteTask', () => {
      it('should call delete with correct endpoint', async () => {
        const taskId = 1;
        const mockResponse = { success: true };
        
        mockRequest.del.mockResolvedValue(mockResponse);
        
        const result = await deleteTask(taskId);
        
        expect(mockRequest.del).toHaveBeenCalledWith(`tasks/${taskId}`);
        expect(result).toEqual(mockResponse);
      });

      it('should handle task deletion errors', async () => {
        const taskId = 1;
        const mockError = new Error('Cannot delete task');
        
        mockRequest.del.mockRejectedValue(mockError);
        
        await expect(deleteTask(taskId)).rejects.toThrow('Cannot delete task');
      });
    });

    describe('updateTaskStatus', () => {
      it('should call put with correct endpoint and status', async () => {
        const taskId = 1;
        const status = 'completed';
        const mockResponse = {
          data: { id: taskId, status }
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);
        
        const result = await updateTaskStatus(taskId, status);
        
        expect(mockRequest.put).toHaveBeenCalledWith(`tasks/${taskId}/status`, { status });
        expect(result).toEqual(mockResponse);
      });

      it('should handle all valid status values', async () => {
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
        
        for (const status of validStatuses) {
          mockRequest.put.mockResolvedValue({ data: { status } });
          
          await updateTaskStatus(1, status);
          
          expect(mockRequest.put).toHaveBeenCalledWith(`tasks/1/status`, { status });
        }
      });
    });

    describe('updateTaskProgress', () => {
      it('should call put with correct endpoint and progress', async () => {
        const taskId = 1;
        const progress = 75;
        const mockResponse = {
          data: { id: taskId, progress }
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);
        
        const result = await updateTaskProgress(taskId, progress);
        
        expect(mockRequest.put).toHaveBeenCalledWith(`tasks/${taskId}/progress`, { progress });
        expect(result).toEqual(mockResponse);
      });

      it('should handle boundary progress values', async () => {
        const boundaryValues = [0, 50, 100];
        
        for (const progress of boundaryValues) {
          mockRequest.put.mockResolvedValue({ data: { progress } });
          
          await updateTaskProgress(1, progress);
          
          expect(mockRequest.put).toHaveBeenCalledWith(`tasks/1/progress`, { progress });
        }
      });
    });

    describe('assignTask', () => {
      it('should call put with correct endpoint and assignee', async () => {
        const taskId = 1;
        const assignedTo = 5;
        const mockResponse = {
          data: { id: taskId, assignedTo }
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);
        
        const result = await assignTask(taskId, assignedTo);
        
        expect(mockRequest.put).toHaveBeenCalledWith(`tasks/${taskId}/assign`, { assignedTo });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Task Statistics APIs', () => {
    describe('getTaskStatistics', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams = {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          assignedTo: 5
        };
        const mockStatistics: TaskStatistics = {
          totalTasks: 100,
          completedTasks: 75,
          pendingTasks: 15,
          inProgressTasks: 10,
          completionRate: 75,
          overdueRate: 5,
          avgCompletionTime: 3.5
        };
        
        mockRequest.get.mockResolvedValue({ data: mockStatistics });
        
        const result = await getTaskStatistics(mockParams);
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks/statistics', { params: mockParams });
        expect(result).toEqual(mockStatistics);
      });

      it('should handle statistics with default parameters', async () => {
        const mockStatistics: TaskStatistics = {
          totalTasks: 50,
          completedTasks: 30,
          pendingTasks: 10,
          inProgressTasks: 10,
          completionRate: 60,
          overdueRate: 10,
          avgCompletionTime: 2.5
        };
        
        mockRequest.get.mockResolvedValue({ data: mockStatistics });
        
        const result = await getTaskStatistics();
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks/statistics', { params: {} });
        expect(result).toEqual(mockStatistics);
      });
    });

    describe('getTaskTrends', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams = {
          period: 'month' as const,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        };
        const mockTrends = {
          labels: ['Jan', 'Feb', 'Mar'],
          completed: [10, 15, 20],
          created: [15, 18, 22]
        };
        
        mockRequest.get.mockResolvedValue({ data: mockTrends });
        
        const result = await getTaskTrends(mockParams);
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks/trends', { params: mockParams });
        expect(result).toEqual(mockTrends);
      });

      it('should handle different period values', async () => {
        const periods = ['week', 'month', 'quarter'] as const;
        
        for (const period of periods) {
          mockRequest.get.mockResolvedValue({ data: { labels: [], completed: [], created: [] } });
          
          await getTaskTrends({ period });
          
          expect(mockRequest.get).toHaveBeenCalledWith('tasks/trends', { params: { period } });
        }
      });
    });

    describe('getTaskAnalytics', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams = {
          type: 'completion' as const,
          period: 'month' as const,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        };
        const mockAnalytics = {
          data: [25, 30, 35, 40],
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        };
        
        mockRequest.get.mockResolvedValue({ data: mockAnalytics });
        
        const result = await getTaskAnalytics(mockParams);
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks/analytics', { params: mockParams });
        expect(result).toEqual(mockAnalytics);
      });

      it('should handle different analytics types', async () => {
        const types = ['completion', 'priority', 'assignee', 'workload'] as const;
        
        for (const type of types) {
          mockRequest.get.mockResolvedValue({ data: { data: [], labels: [] } });
          
          await getTaskAnalytics({ type });
          
          expect(mockRequest.get).toHaveBeenCalledWith('tasks/analytics', { params: { type } });
        }
      });
    });
  });

  describe('Task Template APIs', () => {
    describe('getTaskTemplates', () => {
      it('should call get with correct endpoint', async () => {
        const mockTemplates = [
          { id: 1, name: 'Bug Report', description: 'Template for bug reports' },
          { id: 2, name: 'Feature Request', description: 'Template for feature requests' }
        ];
        
        mockRequest.get.mockResolvedValue({ data: mockTemplates });
        
        const result = await getTaskTemplates();
        
        expect(mockRequest.get).toHaveBeenCalledWith('task-templates');
        expect(result).toEqual(mockTemplates);
      });

      it('should handle empty templates list', async () => {
        mockRequest.get.mockResolvedValue({ data: [] });
        
        const result = await getTaskTemplates();
        
        expect(result).toEqual([]);
      });
    });

    describe('createTaskFromTemplate', () => {
      it('should call post with correct endpoint and data', async () => {
        const templateId = 1;
        const mockData = {
          title: 'Custom Bug Report',
          assignedTo: 5,
          dueDate: '2024-12-31'
        };
        const mockResponse = {
          data: { id: 3, ...mockData }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);
        
        const result = await createTaskFromTemplate(templateId, mockData);
        
        expect(mockRequest.post).toHaveBeenCalledWith(`task-templates/${templateId}/create`, mockData);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Batch Operations APIs', () => {
    describe('batchUpdateTasks', () => {
      it('should call put with correct endpoint and data', async () => {
        const taskIds = [1, 2, 3];
        const mockUpdateData: UpdateTaskData = {
          status: 'completed',
          priority: 'low'
        };
        const mockResponse = { success: true, updated: 3 };
        
        mockRequest.put.mockResolvedValue(mockResponse);
        
        const result = await batchUpdateTasks(taskIds, mockUpdateData);
        
        expect(mockRequest.put).toHaveBeenCalledWith('tasks/batch', {
          taskIds,
          ...mockUpdateData
        });
        expect(result).toEqual(mockResponse);
      });

      it('should handle empty task IDs array', async () => {
        const taskIds: number[] = [];
        const mockUpdateData: UpdateTaskData = { status: 'pending' };
        
        mockRequest.put.mockResolvedValue({ success: true, updated: 0 });
        
        await batchUpdateTasks(taskIds, mockUpdateData);
        
        expect(mockRequest.put).toHaveBeenCalledWith('tasks/batch', {
          taskIds: [],
          status: 'pending'
        });
      });
    });

    describe('batchDeleteTasks', () => {
      it('should call delete with correct endpoint and data', async () => {
        const taskIds = [1, 2, 3];
        const mockResponse = { success: true, deleted: 3 };
        
        mockRequest.del.mockResolvedValue(mockResponse);
        
        const result = await batchDeleteTasks(taskIds);
        
        expect(mockRequest.del).toHaveBeenCalledWith('tasks/batch', { data: { taskIds } });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Export APIs', () => {
    describe('exportTasks', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams: TaskQuery & { format?: 'excel' | 'csv' | 'pdf' } = {
          page: 1,
          pageSize: 100,
          status: 'completed',
          format: 'excel'
        };
        const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });
        
        mockRequest.get.mockResolvedValue(mockBlob);
        
        const result = await exportTasks(mockParams);
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks/export', mockParams, {
          responseType: 'blob'
        });
        expect(result).toEqual(mockBlob);
      });

      it('should handle export with default format', async () => {
        const mockParams: TaskQuery = { page: 1 };
        const mockBlob = new Blob(['test data']);
        
        mockRequest.get.mockResolvedValue(mockBlob);
        
        await exportTasks(mockParams);
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks/export', mockParams, {
          responseType: 'blob'
        });
      });
    });

    describe('exportTaskReport', () => {
      it('should call get with correct endpoint and params', async () => {
        const mockParams = {
          type: 'summary' as const,
          format: 'pdf' as const,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        };
        const mockBlob = new Blob(['report data'], { type: 'application/pdf' });
        
        mockRequest.get.mockResolvedValue(mockBlob);
        
        const result = await exportTaskReport(mockParams);
        
        expect(mockRequest.get).toHaveBeenCalledWith('tasks/report', mockParams, {
          responseType: 'blob'
        });
        expect(result).toEqual(mockBlob);
      });
    });
  });

  describe('Task Comments APIs', () => {
    describe('getTaskComments', () => {
      it('should call get with correct endpoint', async () => {
        const taskId = 1;
        const mockComments = [
          { id: 1, content: 'First comment', author: 'User1', createdAt: '2024-01-15T10:00:00Z' },
          { id: 2, content: 'Second comment', author: 'User2', createdAt: '2024-01-15T11:00:00Z' }
        ];
        
        mockRequest.get.mockResolvedValue({ data: mockComments });
        
        const result = await getTaskComments(taskId);
        
        expect(mockRequest.get).toHaveBeenCalledWith(`tasks/${taskId}/comments`);
        expect(result).toEqual(mockComments);
      });

      it('should handle empty comments list', async () => {
        const taskId = 1;
        
        mockRequest.get.mockResolvedValue({ data: [] });
        
        const result = await getTaskComments(taskId);
        
        expect(result).toEqual([]);
      });
    });

    describe('addTaskComment', () => {
      it('should call post with correct endpoint and data', async () => {
        const taskId = 1;
        const content = 'New comment';
        const mockResponse = {
          data: { id: 3, content, author: 'CurrentUser', createdAt: '2024-01-15T12:00:00Z' }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);
        
        const result = await addTaskComment(taskId, content);
        
        expect(mockRequest.post).toHaveBeenCalledWith(`tasks/${taskId}/comments`, { content });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateTaskComment', () => {
      it('should call put with correct endpoint and data', async () => {
        const taskId = 1;
        const commentId = 2;
        const content = 'Updated comment';
        const mockResponse = {
          data: { id: commentId, content, updatedAt: '2024-01-15T13:00:00Z' }
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);
        
        const result = await updateTaskComment(taskId, commentId, content);
        
        expect(mockRequest.put).toHaveBeenCalledWith(`tasks/${taskId}/comments/${commentId}`, { content });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteTaskComment', () => {
      it('should call delete with correct endpoint', async () => {
        const taskId = 1;
        const commentId = 2;
        const mockResponse = { success: true };
        
        mockRequest.del.mockResolvedValue(mockResponse);
        
        const result = await deleteTaskComment(taskId, commentId);
        
        expect(mockRequest.del).toHaveBeenCalledWith(`tasks/${taskId}/comments/${commentId}`);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Task Attachments APIs', () => {
    describe('getTaskAttachments', () => {
      it('should call get with correct endpoint', async () => {
        const taskId = 1;
        const mockAttachments = [
          { id: 1, filename: 'document.pdf', size: 1024, uploadedAt: '2024-01-15T10:00:00Z' },
          { id: 2, filename: 'image.jpg', size: 2048, uploadedAt: '2024-01-15T11:00:00Z' }
        ];
        
        mockRequest.get.mockResolvedValue({ data: mockAttachments });
        
        const result = await getTaskAttachments(taskId);
        
        expect(mockRequest.get).toHaveBeenCalledWith(`tasks/${taskId}/attachments`);
        expect(result).toEqual(mockAttachments);
      });
    });

    describe('uploadTaskAttachment', () => {
      it('should call post with correct endpoint and form data', async () => {
        const taskId = 1;
        const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const mockResponse = {
          data: { id: 3, filename: 'test.txt', size: 12 }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);
        
        const result = await uploadTaskAttachment(taskId, mockFile);
        
        // Check that FormData was created correctly
        expect(mockRequest.post).toHaveBeenCalledWith(
          `tasks/${taskId}/attachments`,
          expect.any(FormData)
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteTaskAttachment', () => {
      it('should call delete with correct endpoint', async () => {
        const taskId = 1;
        const attachmentId = 2;
        const mockResponse = { success: true };
        
        mockRequest.del.mockResolvedValue(mockResponse);
        
        const result = await deleteTaskAttachment(taskId, attachmentId);
        
        expect(mockRequest.del).toHaveBeenCalledWith(`tasks/${taskId}/attachments/${attachmentId}`);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Task Relations APIs', () => {
    describe('getRelatedTasks', () => {
      it('should call get with correct endpoint', async () => {
        const taskId = 1;
        const mockRelatedTasks = [
          { id: 2, title: 'Related Task 1', relationType: 'blocks' },
          { id: 3, title: 'Related Task 2', relationType: 'depends_on' }
        ];
        
        mockRequest.get.mockResolvedValue({ data: mockRelatedTasks });
        
        const result = await getRelatedTasks(taskId);
        
        expect(mockRequest.get).toHaveBeenCalledWith(`tasks/${taskId}/related`);
        expect(result).toEqual(mockRelatedTasks);
      });
    });

    describe('linkTasks', () => {
      it('should call post with correct endpoint and data', async () => {
        const taskId = 1;
        const relatedTaskId = 2;
        const relationType = 'blocks';
        const mockResponse = {
          data: { success: true, relation: { from: taskId, to: relatedTaskId, type: relationType } }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);
        
        const result = await linkTasks(taskId, relatedTaskId, relationType);
        
        expect(mockRequest.post).toHaveBeenCalledWith(`tasks/${taskId}/link`, {
          relatedTaskId,
          relationType
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('unlinkTasks', () => {
      it('should call delete with correct endpoint and params', async () => {
        const taskId = 1;
        const relatedTaskId = 2;
        const mockResponse = { success: true };
        
        mockRequest.del.mockResolvedValue(mockResponse);
        
        const result = await unlinkTasks(taskId, relatedTaskId);
        
        expect(mockRequest.del).toHaveBeenCalledWith(`tasks/${taskId}/unlink?relatedTaskId=${relatedTaskId}`);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Type Safety', () => {
    it('should handle all valid task priorities', async () => {
      const priorities = ['low', 'medium', 'high', 'highest'] as const;
      
      for (const priority of priorities) {
        const mockTask: Task = {
          id: 1,
          title: 'Test Task',
          priority,
          status: 'pending',
          userId: 1,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        };
        
        mockRequest.get.mockResolvedValue({ data: [mockTask] });
        
        const result = await getTasks({ priority });
        expect(result.data[0].priority).toBe(priority);
      }
    });

    it('should handle all valid task statuses', async () => {
      const statuses = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
      
      for (const status of statuses) {
        const mockTask: Task = {
          id: 1,
          title: 'Test Task',
          priority: 'medium',
          status,
          userId: 1,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        };
        
        mockRequest.get.mockResolvedValue({ data: [mockTask] });
        
        const result = await getTasks({ status });
        expect(result.data[0].status).toBe(status);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors consistently across all methods', async () => {
      const mockError = new Error('Network error');
      
      // Test GET methods
      mockRequest.get.mockRejectedValue(mockError);
      await expect(getTasks()).rejects.toThrow('Network error');
      await expect(getTask(1)).rejects.toThrow('Network error');
      await expect(getTaskStatistics()).rejects.toThrow('Network error');
      
      // Test POST methods
      mockRequest.post.mockRejectedValue(mockError);
      await expect(createTask({ title: 'Test', priority: 'medium' })).rejects.toThrow('Network error');
      await expect(addTaskComment(1, 'Comment')).rejects.toThrow('Network error');
      
      // Test PUT methods
      mockRequest.put.mockRejectedValue(mockError);
      await expect(updateTask(1, { status: 'completed' })).rejects.toThrow('Network error');
      await expect(updateTaskStatus(1, 'completed')).rejects.toThrow('Network error');
      
      // Test DELETE methods
      mockRequest.del.mockRejectedValue(mockError);
      await expect(deleteTask(1)).rejects.toThrow('Network error');
      await expect(deleteTaskComment(1, 1)).rejects.toThrow('Network error');
    });
  });
});