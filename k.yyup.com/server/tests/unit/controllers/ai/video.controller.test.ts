// Mock dependencies
jest.mock('../../../src/controllers/ai/video.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { analyzeVideo } from '../../../src/controllers/ai/video.controller';
import { generateVideoSummary } from '../../../src/controllers/ai/video.controller';
import { extractVideoInsights } from '../../../src/controllers/ai/video.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: null
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;


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

describe('AI Video Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeVideo', () => {
    it('应该成功分析视频', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          videoUrl: 'http://example.com/video.mp4',
          analysisType: 'content_analysis'
        };

      await analyzeVideo(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
          videoUrl: 'http://example.com/video.mp4',
          analysisType: 'content_analysis'
        };
      req.user = null;

      await analyzeVideo(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          videoUrl: 'http://example.com/video.mp4',
          analysisType: 'content_analysis'
        };

      // 模拟错误
      const originalAnalyzeVideo = analyzeVideo;
      (analyzeVideo as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await analyzeVideo(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (analyzeVideo as jest.Mock).mockImplementation(originalAnalyzeVideo);
    });
  });
  describe('generateVideoSummary', () => {
    it('应该成功生成视频摘要', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          videoId: 1,
          summaryLength: 'medium',
          includeHighlights: true
        };

      await generateVideoSummary(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
          videoId: 1,
          summaryLength: 'medium',
          includeHighlights: true
        };
      req.user = null;

      await generateVideoSummary(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          videoId: 1,
          summaryLength: 'medium',
          includeHighlights: true
        };

      // 模拟错误
      const originalGenerateVideoSummary = generateVideoSummary;
      (generateVideoSummary as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await generateVideoSummary(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (generateVideoSummary as jest.Mock).mockImplementation(originalGenerateVideoSummary);
    });
  });
  describe('extractVideoInsights', () => {
    it('应该成功提取视频洞察', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { videoId: '1' };

      await extractVideoInsights(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { videoId: '1' };
      req.user = null;

      await extractVideoInsights(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { videoId: '1' };

      // 模拟错误
      const originalExtractVideoInsights = extractVideoInsights;
      (extractVideoInsights as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await extractVideoInsights(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (extractVideoInsights as jest.Mock).mockImplementation(originalExtractVideoInsights);
    });
  });
});