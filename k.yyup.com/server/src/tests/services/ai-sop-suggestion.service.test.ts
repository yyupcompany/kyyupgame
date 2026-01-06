// Mock all models first
jest.mock('../../models/sop-task.model', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn()
  }
}));

jest.mock('../../models/sop-stage.model', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findAll: jest.fn()
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
    create: jest.fn()
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
    create: jest.fn()
  }
}));

// Mock service
jest.mock('../../services/teacher-sop.service');

import { AISOPSuggestionService } from '../../services/ai-sop-suggestion.service';
import { TeacherSOPService } from '../../services/teacher-sop.service';
import SOPTask from '../../models/sop-task.model';
import SOPStage from '../../models/sop-stage.model';

describe('AISOPSuggestionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTaskSuggestion', () => {
    it('should generate AI suggestion for a task', async () => {
      const mockTask = {
        id: 1,
        stageId: 1,
        title: '自我介绍',
        description: '专业、亲切地介绍自己和幼儿园',
        guidance: {
          steps: ['步骤1', '步骤2'],
          tips: ['技巧1', '技巧2'],
          examples: ['示例1']
        }
      };

      const mockStage = {
        id: 1,
        name: '初次接触',
        description: '与客户建立第一次联系'
      };

      const mockProgress = {
        currentStageId: 1,
        stageProgress: 33.33,
        completedTasks: [1]
      };

      const mockConversations = [
        { speakerType: 'teacher', content: '您好', createdAt: new Date() }
      ];

      const mockScreenshots: any[] = [];

      (SOPTask.findByPk as jest.Mock).mockResolvedValue(mockTask);
      (SOPStage.findByPk as jest.Mock).mockResolvedValue(mockStage);
      (TeacherSOPService.getCustomerProgress as jest.Mock).mockResolvedValue(mockProgress);
      (TeacherSOPService.getConversations as jest.Mock).mockResolvedValue(mockConversations);
      (TeacherSOPService.getScreenshots as jest.Mock).mockResolvedValue(mockScreenshots);
      (TeacherSOPService.saveAISuggestion as jest.Mock).mockResolvedValue({});

      const result = await AISOPSuggestionService.getTaskSuggestion({
        customerId: 123,
        teacherId: 456,
        taskId: 1
      });

      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('scripts');
      expect(result).toHaveProperty('nextActions');
      expect(result).toHaveProperty('successProbability');
      expect(result).toHaveProperty('factors');

      expect(result.strategy).toHaveProperty('title');
      expect(result.strategy).toHaveProperty('description');
      expect(result.strategy).toHaveProperty('keyPoints');

      expect(result.scripts).toHaveProperty('opening');
      expect(result.scripts).toHaveProperty('core');
      expect(result.scripts).toHaveProperty('objections');

      expect(TeacherSOPService.saveAISuggestion).toHaveBeenCalled();
    });

    it('should throw error if task not found', async () => {
      (SOPTask.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        AISOPSuggestionService.getTaskSuggestion({
          customerId: 123,
          teacherId: 456,
          taskId: 999
        })
      ).rejects.toThrow('任务不存在');
    });

    it('should throw error if stage not found', async () => {
      const mockTask = { id: 1, stageId: 1 };

      (SOPTask.findByPk as jest.Mock).mockResolvedValue(mockTask);
      (SOPStage.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        AISOPSuggestionService.getTaskSuggestion({
          customerId: 123,
          teacherId: 456,
          taskId: 1
        })
      ).rejects.toThrow('阶段不存在');
    });
  });

  describe('getGlobalAnalysis', () => {
    it('should generate global AI analysis', async () => {
      const mockProgress = {
        currentStageId: 3,
        stageProgress: 50,
        completedTasks: [1, 2, 3]
      };

      const mockConversations = [
        { speakerType: 'teacher', content: 'Hello', sentiment: 'positive', createdAt: new Date() },
        { speakerType: 'customer', content: 'Hi', sentiment: 'positive', createdAt: new Date() }
      ];

      const mockScreenshots: any[] = [];

      const mockStages = [
        { id: 1, name: '初次接触' },
        { id: 2, name: '需求挖掘' },
        { id: 3, name: '方案呈现' }
      ];

      (TeacherSOPService.getCustomerProgress as jest.Mock).mockResolvedValue(mockProgress);
      (TeacherSOPService.getConversations as jest.Mock).mockResolvedValue(mockConversations);
      (TeacherSOPService.getScreenshots as jest.Mock).mockResolvedValue(mockScreenshots);
      (TeacherSOPService.getAllStages as jest.Mock).mockResolvedValue(mockStages);
      (TeacherSOPService.calculateSuccessProbability as jest.Mock).mockResolvedValue(75);
      (TeacherSOPService.saveAISuggestion as jest.Mock).mockResolvedValue({});

      const result = await AISOPSuggestionService.getGlobalAnalysis({
        customerId: 123,
        teacherId: 456
      });

      expect(result).toHaveProperty('successProbability');
      expect(result).toHaveProperty('currentProgress');
      expect(result.successProbability).toBe(75);
      expect(result.currentProgress).toEqual({
        stage: 3,
        progress: 50
      });

      expect(TeacherSOPService.saveAISuggestion).toHaveBeenCalled();
    });
  });

  describe('analyzeScreenshot', () => {
    it('should analyze screenshot with AI', async () => {
      const mockScreenshot = {
        id: 1,
        imageUrl: 'http://example.com/screenshot.jpg',
        customerId: 123
      };

      const mockConversations = [
        { speakerType: 'teacher', content: 'Hello' },
        { speakerType: 'customer', content: 'Hi' }
      ];

      (TeacherSOPService.getScreenshots as jest.Mock).mockResolvedValue([mockScreenshot]);
      (TeacherSOPService.getConversations as jest.Mock).mockResolvedValue(mockConversations);
      (TeacherSOPService.updateScreenshotAnalysis as jest.Mock).mockResolvedValue(mockScreenshot);

      const result = await AISOPSuggestionService.analyzeScreenshot({
        screenshotId: 1,
        customerId: 123,
        teacherId: 456
      });

      expect(result).toHaveProperty('recognizedText');
      expect(result).toHaveProperty('focusPoints');
      expect(result).toHaveProperty('sentiment');
      expect(result).toHaveProperty('suggestedResponse');

      expect(TeacherSOPService.updateScreenshotAnalysis).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          recognizedText: expect.any(String),
          aiAnalysis: expect.any(Object)
        })
      );
    });

    it('should throw error if screenshot not found', async () => {
      (TeacherSOPService.getScreenshots as jest.Mock).mockResolvedValue([]);

      await expect(
        AISOPSuggestionService.analyzeScreenshot({
          screenshotId: 999,
          customerId: 123,
          teacherId: 456
        })
      ).rejects.toThrow('截图不存在');
    });
  });
});

