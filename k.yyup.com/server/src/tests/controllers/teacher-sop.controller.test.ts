// Mock all models first
jest.mock('../../models/sop-stage.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../models/sop-task.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../models/customer-sop-progress.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../models/conversation-record.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../models/conversation-screenshot.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../models/ai-suggestion-history.model', () => ({ __esModule: true, default: {} }));

// Mock services
jest.mock('../../services/teacher-sop.service');
jest.mock('../../services/ai-sop-suggestion.service');

import { Request, Response } from 'express';
import { TeacherSOPController } from '../../controllers/teacher-sop.controller';
import { TeacherSOPService } from '../../services/teacher-sop.service';
import { AISOPSuggestionService } from '../../services/ai-sop-suggestion.service';

describe('TeacherSOPController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      params: {},
      body: {},
      user: { id: 456 }
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock
    };

    jest.clearAllMocks();
  });

  describe('getAllStages', () => {
    it('should return all stages', async () => {
      const mockStages = [
        { id: 1, name: '初次接触' },
        { id: 2, name: '需求挖掘' }
      ];

      (TeacherSOPService.getAllStages as jest.Mock).mockResolvedValue(mockStages);

      await TeacherSOPController.getAllStages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStages
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (TeacherSOPService.getAllStages as jest.Mock).mockRejectedValue(error);

      await TeacherSOPController.getAllStages(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: '获取SOP阶段失败',
        error: 'Database error'
      });
    });
  });

  describe('getStageById', () => {
    it('should return stage by id', async () => {
      const mockStage = { id: 1, name: '初次接触' };
      mockRequest.params = { id: '1' };

      (TeacherSOPService.getStageById as jest.Mock).mockResolvedValue(mockStage);

      await TeacherSOPController.getStageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(TeacherSOPService.getStageById).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStage
      });
    });

    it('should return 404 if stage not found', async () => {
      mockRequest.params = { id: '999' };

      (TeacherSOPService.getStageById as jest.Mock).mockResolvedValue(null);

      await TeacherSOPController.getStageById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: '阶段不存在'
      });
    });
  });

  describe('getCustomerProgress', () => {
    it('should return customer progress', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 1,
        stageProgress: 50
      };

      mockRequest.params = { customerId: '123' };

      (TeacherSOPService.getCustomerProgress as jest.Mock).mockResolvedValue(mockProgress);

      await TeacherSOPController.getCustomerProgress(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(TeacherSOPService.getCustomerProgress).toHaveBeenCalledWith(123, 456);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockProgress
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { customerId: '123' };

      await TeacherSOPController.getCustomerProgress(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: '未授权'
      });
    });
  });

  describe('completeTask', () => {
    it('should complete task and return updated progress', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        completedTasks: [1, 2]
      };

      mockRequest.params = { customerId: '123', taskId: '2' };

      (TeacherSOPService.completeTask as jest.Mock).mockResolvedValue(mockProgress);

      await TeacherSOPController.completeTask(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(TeacherSOPService.completeTask).toHaveBeenCalledWith(123, 456, 2);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockProgress,
        message: '任务已完成'
      });
    });
  });

  describe('advanceToNextStage', () => {
    it('should advance to next stage', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 2
      };

      mockRequest.params = { customerId: '123' };

      (TeacherSOPService.advanceToNextStage as jest.Mock).mockResolvedValue(mockProgress);

      await TeacherSOPController.advanceToNextStage(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(TeacherSOPService.advanceToNextStage).toHaveBeenCalledWith(123, 456);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockProgress,
        message: '已进入下一阶段'
      });
    });
  });

  describe('addConversation', () => {
    it('should add conversation record', async () => {
      const conversationData = {
        speakerType: 'teacher',
        content: 'Hello',
        messageType: 'text'
      };

      const mockConversation = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        ...conversationData
      };

      mockRequest.params = { customerId: '123' };
      mockRequest.body = conversationData;

      (TeacherSOPService.addConversation as jest.Mock).mockResolvedValue(mockConversation);

      await TeacherSOPController.addConversation(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(TeacherSOPService.addConversation).toHaveBeenCalledWith({
        customerId: 123,
        teacherId: 456,
        ...conversationData
      });

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockConversation,
        message: '对话记录已添加'
      });
    });
  });

  describe('addConversationsBatch', () => {
    it('should add multiple conversations', async () => {
      const conversations = [
        { speakerType: 'teacher', content: 'Hello' },
        { speakerType: 'customer', content: 'Hi' }
      ];

      const mockResult = [
        { id: 1, customerId: 123, teacherId: 456, ...conversations[0] },
        { id: 2, customerId: 123, teacherId: 456, ...conversations[1] }
      ];

      mockRequest.params = { customerId: '123' };
      mockRequest.body = { conversations };

      (TeacherSOPService.addConversationsBatch as jest.Mock).mockResolvedValue(mockResult);

      await TeacherSOPController.addConversationsBatch(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: '已添加2条对话记录'
      });
    });
  });

  describe('uploadScreenshot', () => {
    it('should upload screenshot', async () => {
      const screenshotData = {
        imageUrl: 'http://example.com/image.jpg',
        conversationId: 1
      };

      const mockScreenshot = {
        id: 1,
        customerId: 123,
        uploadedBy: 456,
        ...screenshotData
      };

      mockRequest.params = { customerId: '123' };
      mockRequest.body = screenshotData;

      (TeacherSOPService.uploadScreenshot as jest.Mock).mockResolvedValue(mockScreenshot);

      await TeacherSOPController.uploadScreenshot(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockScreenshot,
        message: '截图已上传'
      });
    });
  });

  describe('analyzeScreenshot', () => {
    it('should analyze screenshot', async () => {
      const mockAnalysis = {
        recognizedText: 'Hello world',
        focusPoints: ['greeting'],
        sentiment: 'positive',
        suggestedResponse: 'Hi there!'
      };

      mockRequest.params = { customerId: '123', screenshotId: '1' };

      (AISOPSuggestionService.analyzeScreenshot as jest.Mock).mockResolvedValue(mockAnalysis);

      await TeacherSOPController.analyzeScreenshot(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(AISOPSuggestionService.analyzeScreenshot).toHaveBeenCalledWith({
        screenshotId: 1,
        customerId: 123,
        teacherId: 456
      });

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockAnalysis,
        message: '截图分析完成'
      });
    });
  });

  describe('getTaskAISuggestion', () => {
    it('should get AI suggestion for task', async () => {
      const mockSuggestion = {
        strategy: {
          title: '建立信任',
          description: '通过真诚沟通建立信任',
          keyPoints: ['专业', '真诚', '倾听']
        },
        scripts: {
          opening: 'Hello',
          core: ['话术1', '话术2'],
          objections: []
        }
      };

      mockRequest.params = { customerId: '123' };
      mockRequest.body = { taskId: 1 };

      (AISOPSuggestionService.getTaskSuggestion as jest.Mock).mockResolvedValue(mockSuggestion);

      await TeacherSOPController.getTaskAISuggestion(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(AISOPSuggestionService.getTaskSuggestion).toHaveBeenCalledWith({
        customerId: 123,
        teacherId: 456,
        taskId: 1
      });

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockSuggestion
      });
    });
  });

  describe('getGlobalAIAnalysis', () => {
    it('should get global AI analysis', async () => {
      const mockAnalysis = {
        successProbability: 75,
        currentProgress: {
          stage: 3,
          progress: 50
        }
      };

      mockRequest.params = { customerId: '123' };

      (AISOPSuggestionService.getGlobalAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);

      await TeacherSOPController.getGlobalAIAnalysis(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(AISOPSuggestionService.getGlobalAnalysis).toHaveBeenCalledWith({
        customerId: 123,
        teacherId: 456
      });

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockAnalysis
      });
    });
  });
});

