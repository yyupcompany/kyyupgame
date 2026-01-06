// Mock models before importing service
jest.mock('../../models/sop-stage.model', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('../../models/sop-task.model', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  }
}));

jest.mock('../../models/customer-sop-progress.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('../../models/conversation-record.model', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn()
  }
}));

jest.mock('../../models/conversation-screenshot.model', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('../../models/ai-suggestion-history.model', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

import { TeacherSOPService } from '../../services/teacher-sop.service';
import SOPStage from '../../models/sop-stage.model';
import SOPTask from '../../models/sop-task.model';
import CustomerSOPProgress from '../../models/customer-sop-progress.model';
import ConversationRecord from '../../models/conversation-record.model';
import ConversationScreenshot from '../../models/conversation-screenshot.model';
import AISuggestionHistory from '../../models/ai-suggestion-history.model';

describe('TeacherSOPService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStages', () => {
    it('should return all active stages ordered by orderNum', async () => {
      const mockStages = [
        { id: 1, name: '初次接触', orderNum: 1, isActive: true },
        { id: 2, name: '需求挖掘', orderNum: 2, isActive: true }
      ];

      (SOPStage.findAll as jest.Mock).mockResolvedValue(mockStages);

      const result = await TeacherSOPService.getAllStages();

      expect(SOPStage.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        order: [['orderNum', 'ASC']]
      });
      expect(result).toEqual(mockStages);
    });
  });

  describe('getStageById', () => {
    it('should return stage by id', async () => {
      const mockStage = { id: 1, name: '初次接触', orderNum: 1 };

      (SOPStage.findByPk as jest.Mock).mockResolvedValue(mockStage);

      const result = await TeacherSOPService.getStageById(1);

      expect(SOPStage.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStage);
    });
  });

  describe('getTasksByStage', () => {
    it('should return all active tasks for a stage', async () => {
      const mockTasks = [
        { id: 1, stageId: 1, title: '自我介绍', orderNum: 1, isActive: true },
        { id: 2, stageId: 1, title: '了解基本信息', orderNum: 2, isActive: true }
      ];

      (SOPTask.findAll as jest.Mock).mockResolvedValue(mockTasks);

      const result = await TeacherSOPService.getTasksByStage(1);

      expect(SOPTask.findAll).toHaveBeenCalledWith({
        where: { stageId: 1, isActive: true },
        order: [['orderNum', 'ASC']]
      });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getCustomerProgress', () => {
    it('should return existing progress', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 1,
        stageProgress: 50,
        completedTasks: [1, 2]
      };

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(mockProgress);

      const result = await TeacherSOPService.getCustomerProgress(123, 456);

      expect(CustomerSOPProgress.findOne).toHaveBeenCalledWith({
        where: { customerId: 123, teacherId: 456 }
      });
      expect(result).toEqual(mockProgress);
    });

    it('should create new progress if not exists', async () => {
      const mockFirstStage = { id: 1, name: '初次接触', orderNum: 1 };
      const mockNewProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 1,
        stageProgress: 0,
        completedTasks: [],
        successProbability: 50
      };

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(null);
      (SOPStage.findOne as jest.Mock).mockResolvedValue(mockFirstStage);
      (CustomerSOPProgress.create as jest.Mock).mockResolvedValue(mockNewProgress);

      const result = await TeacherSOPService.getCustomerProgress(123, 456);

      expect(CustomerSOPProgress.create).toHaveBeenCalledWith({
        customerId: 123,
        teacherId: 456,
        currentStageId: 1,
        stageProgress: 0,
        completedTasks: [],
        successProbability: 50
      });
      expect(result).toEqual(mockNewProgress);
    });

    it('should throw error if no active stage exists', async () => {
      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(null);
      (SOPStage.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        TeacherSOPService.getCustomerProgress(123, 456)
      ).rejects.toThrow('没有可用的SOP阶段');
    });
  });

  describe('updateCustomerProgress', () => {
    it('should update progress', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        update: jest.fn().mockResolvedValue(true)
      };

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(mockProgress);

      const updateData = {
        stageProgress: 75,
        completedTasks: [1, 2, 3]
      };

      await TeacherSOPService.updateCustomerProgress(123, 456, updateData);

      expect(mockProgress.update).toHaveBeenCalledWith(updateData);
    });
  });

  describe('completeTask', () => {
    it('should add task to completed tasks and update progress', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 1,
        completedTasks: [1],
        update: jest.fn().mockResolvedValue(true)
      };

      const mockTasks = [
        { id: 1, stageId: 1 },
        { id: 2, stageId: 1 },
        { id: 3, stageId: 1 }
      ];

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(mockProgress);
      (SOPTask.findAll as jest.Mock).mockResolvedValue(mockTasks);

      await TeacherSOPService.completeTask(123, 456, 2);

      expect(mockProgress.update).toHaveBeenCalledWith({
        completedTasks: [1, 2],
        stageProgress: expect.any(Number)
      });
    });

    it('should not add duplicate task', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 1,
        completedTasks: [1, 2],
        update: jest.fn()
      };

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(mockProgress);

      await TeacherSOPService.completeTask(123, 456, 2);

      expect(mockProgress.update).not.toHaveBeenCalled();
    });
  });

  describe('advanceToNextStage', () => {
    it('should advance to next stage', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      const mockCurrentStage = { id: 1, orderNum: 1 };
      const mockNextStage = { id: 2, orderNum: 2 };

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(mockProgress);
      (SOPStage.findByPk as jest.Mock).mockResolvedValue(mockCurrentStage);
      (SOPStage.findOne as jest.Mock).mockResolvedValue(mockNextStage);

      await TeacherSOPService.advanceToNextStage(123, 456);

      expect(mockProgress.update).toHaveBeenCalledWith({
        currentStageId: 2,
        stageProgress: 0,
        completedTasks: []
      });
    });

    it('should throw error if no next stage', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 7
      };

      const mockCurrentStage = { id: 7, orderNum: 7 };

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(mockProgress);
      (SOPStage.findByPk as jest.Mock).mockResolvedValue(mockCurrentStage);
      (SOPStage.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        TeacherSOPService.advanceToNextStage(123, 456)
      ).rejects.toThrow('已经是最后一个阶段');
    });
  });

  describe('getConversations', () => {
    it('should return conversations ordered by createdAt', async () => {
      const mockConversations = [
        { id: 1, content: 'Hello', createdAt: new Date('2025-10-06T10:00:00') },
        { id: 2, content: 'Hi', createdAt: new Date('2025-10-06T10:01:00') }
      ];

      (ConversationRecord.findAll as jest.Mock).mockResolvedValue(mockConversations);

      const result = await TeacherSOPService.getConversations(123, 456);

      expect(ConversationRecord.findAll).toHaveBeenCalledWith({
        where: { customerId: 123, teacherId: 456 },
        order: [['createdAt', 'ASC']]
      });
      expect(result).toEqual(mockConversations);
    });
  });

  describe('addConversation', () => {
    it('should create conversation record', async () => {
      const conversationData = {
        customerId: 123,
        teacherId: 456,
        speakerType: 'teacher' as const,
        content: 'Hello',
        messageType: 'text' as const
      };

      const mockConversation = { id: 1, ...conversationData };

      (ConversationRecord.create as jest.Mock).mockResolvedValue(mockConversation);

      const result = await TeacherSOPService.addConversation(conversationData);

      expect(ConversationRecord.create).toHaveBeenCalledWith(conversationData);
      expect(result).toEqual(mockConversation);
    });
  });

  describe('uploadScreenshot', () => {
    it('should create screenshot record', async () => {
      const screenshotData = {
        customerId: 123,
        imageUrl: 'http://example.com/image.jpg',
        uploadedBy: 456
      };

      const mockScreenshot = { id: 1, ...screenshotData };

      (ConversationScreenshot.create as jest.Mock).mockResolvedValue(mockScreenshot);

      const result = await TeacherSOPService.uploadScreenshot(screenshotData);

      expect(ConversationScreenshot.create).toHaveBeenCalledWith(screenshotData);
      expect(result).toEqual(mockScreenshot);
    });
  });

  describe('calculateSuccessProbability', () => {
    it('should calculate success probability based on multiple factors', async () => {
      const mockProgress = {
        currentStageId: 3,
        stageProgress: 50,
        completedTasks: [1, 2, 3]
      };

      const mockStage = { id: 3, orderNum: 3 };

      const mockConversations = [
        { id: 1, sentiment: 'positive' },
        { id: 2, sentiment: 'positive' },
        { id: 3, sentiment: 'neutral' },
        { id: 4, sentiment: 'positive' },
        { id: 5, sentiment: 'positive' },
        { id: 6, sentiment: 'positive' }
      ];

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(mockProgress);
      (SOPStage.findByPk as jest.Mock).mockResolvedValue(mockStage);
      (ConversationRecord.findAll as jest.Mock).mockResolvedValue(mockConversations);

      const result = await TeacherSOPService.calculateSuccessProbability(123, 456);

      expect(result).toBeGreaterThan(50);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
});

