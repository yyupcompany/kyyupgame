/**
 * AI分析控制器测试
 */

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { AIAnalysisController } from '../../../src/controllers/ai-analysis.controller';
import { AIAnalysisService } from '../../../src/services/ai-analysis.service';
import { EnrollmentApplication } from '../../../src/models/enrollment-application.model';
import { Activity } from '../../../src/models/activity.model';
import { Teacher } from '../../../src/models/teacher.model';
import { Student } from '../../../src/models/student.model';
import { Op } from 'sequelize';

// 模拟依赖
jest.mock('../../../src/services/ai-analysis.service');
jest.mock('../../../src/models/enrollment-application.model');
jest.mock('../../../src/models/activity.model');
jest.mock('../../../src/models/teacher.model');
jest.mock('../../../src/models/student.model');


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

describe('AIAnalysisController', () => {
  let controller: AIAnalysisController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    controller = new AIAnalysisController();
    
    mockRequest = {};
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnThis();
    
    mockResponse = {
      json: jsonSpy,
      status: statusSpy
    };

    // 重置所有模拟
    jest.clearAllMocks();
  });

  describe('analyzeEnrollmentTrends', () => {
    it('应该成功分析招生趋势', async () => {
      // 准备测试数据
      const mockEnrollmentData = [
        {
          id: 1,
          status: 'approved',
          createdAt: '2024-01-01',
          birthDate: '2021-01-01',
          applicationSource: 'online'
        }
      ];

      const mockAIAnalysis = {
        summary: '招生趋势分析完成',
        insights: [
          {
            title: '趋势分析',
            description: '招生呈现上升趋势',
            importance: 'high',
            category: 'trend'
          }
        ],
        trends: {
          direction: '上升',
          confidence: '高',
          factors: ['市场需求增加']
        },
        recommendations: [
          {
            action: '扩大招生规模',
            priority: 'high',
            timeline: '短期',
            expectedImpact: '提高学生数量'
          }
        ]
      };

      // 设置模拟返回值
      (EnrollmentApplication.findAll as jest.Mock).mockResolvedValue(mockEnrollmentData);
      (controller as any).aiAnalysisService.analyzeWithDoubao.mockResolvedValue(mockAIAnalysis);

      // 执行测试
      mockRequest.body = {
        timeRange: '6months',
        includeSeasonality: true,
        includePrediction: true
      };

      await controller.analyzeEnrollmentTrends(
        mockRequest as Request,
        mockResponse as Response
      );

      // 验证结果
      expect(EnrollmentApplication.findAll).toHaveBeenCalledWith({
        where: {
          createdAt: {
            [Op.between]: expect.any(Array)
          }
        },
        attributes: ['id', 'status', 'createdAt', 'birthDate', 'applicationSource'],
        order: [['createdAt', 'ASC']]
      });

      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'AI招生趋势分析完成',
        data: expect.objectContaining({
          title: '招生趋势分析报告',
          type: 'enrollment'
        })
      }));
    });

    it('应该处理AI服务不可用的情况', async () => {
      const mockEnrollmentData = [
        {
          id: 1,
          status: 'approved',
          createdAt: '2024-01-01',
          birthDate: '2021-01-01',
          applicationSource: 'online'
        }
      ];

      (EnrollmentApplication.findAll as jest.Mock).mockResolvedValue(mockEnrollmentData);
      (controller as any).aiAnalysisService.analyzeWithDoubao.mockRejectedValue(new Error('AI服务不可用'));

      mockRequest.body = { timeRange: '6months' };

      await controller.analyzeEnrollmentTrends(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          aiAnalysis: expect.objectContaining({
            fallback: true,
            summary: expect.stringContaining('由于AI服务暂时不可用')
          })
        })
      }));
    });

    it('应该处理数据库查询错误', async () => {
      (EnrollmentApplication.findAll as jest.Mock).mockRejectedValue(new Error('数据库连接失败'));

      mockRequest.body = { timeRange: '6months' };

      await controller.analyzeEnrollmentTrends(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('招生趋势分析失败')
      }));
    });
  });

  describe('analyzeActivityEffectiveness', () => {
    it('应该成功分析活动效果', async () => {
      const mockActivities = [
        {
          id: 1,
          title: '户外活动',
          activityType: 'outdoor',
          status: 'completed',
          capacity: 30,
          registeredCount: 25,
          createdAt: '2024-01-01'
        }
      ];

      const mockAIAnalysis = {
        summary: '活动效果分析完成',
        insights: [
          {
            title: '参与度分析',
            description: '活动参与度较高',
            importance: 'medium',
            category: 'insight'
          }
        ]
      };

      (Activity.findAll as jest.Mock).mockResolvedValue(mockActivities);
      (controller as any).aiAnalysisService.analyzeWithDoubao.mockResolvedValue(mockAIAnalysis);

      mockRequest.body = {
        timeRange: '3months',
        includeParticipation: true,
        includeSatisfaction: true
      };

      await controller.analyzeActivityEffectiveness(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Activity.findAll).toHaveBeenCalledWith({
        where: {
          createdAt: {
            [Op.between]: expect.any(Array)
          }
        },
        attributes: ['id', 'title', 'activityType', 'status', 'capacity', 'registeredCount', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'AI活动效果分析完成',
        data: expect.objectContaining({
          title: '活动效果分析报告',
          type: 'activity'
        })
      }));
    });
  });

  describe('analyzePerformancePrediction', () => {
    it('应该成功分析绩效预测', async () => {
      const mockTeachers = [
        {
          id: 1,
          position: 'teacher',
          teachingAge: 5,
          createdAt: '2020-01-01'
        }
      ];

      const mockStudents = [
        {
          id: 1,
          name: '测试学生',
          birthDate: '2020-01-01',
          classId: 1,
          enrollmentDate: '2024-01-01'
        }
      ];

      const mockAIAnalysis = {
        summary: '绩效预测分析完成',
        insights: [
          {
            title: '绩效评估',
            description: '教师绩效表现良好',
            importance: 'high',
            category: 'recommendation'
          }
        ]
      };

      (Teacher.findAll as jest.Mock).mockResolvedValue(mockTeachers);
      (Student.findAll as jest.Mock).mockResolvedValue(mockStudents);
      (controller as any).aiAnalysisService.analyzeWithDoubao.mockResolvedValue(mockAIAnalysis);

      mockRequest.body = {
        timeRange: '1year',
        includeTeachers: true,
        includeStudents: true
      };

      await controller.analyzePerformancePrediction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Teacher.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'position', 'teachingAge', 'createdAt'],
        limit: 50
      });

      expect(Student.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'birthDate', 'classId', 'enrollmentDate'],
        limit: 100
      });

      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'AI绩效预测分析完成',
        data: expect.objectContaining({
          title: '绩效预测分析报告',
          type: 'performance'
        })
      }));
    });
  });

  describe('analyzeRiskAssessment', () => {
    it('应该成功分析风险评估', async () => {
      const mockRiskData = {
        enrollment: { recentApplications: 10 },
        financial: { placeholder: '财务数据待完善' },
        operational: { teacherCount: 5, studentCount: 50, ratio: 10 }
      };

      const mockAIAnalysis = {
        summary: '风险评估分析完成',
        insights: [
          {
            title: '风险识别',
            description: '运营风险较低',
            importance: 'medium',
            category: 'insight'
          }
        ]
      };

      // 模拟 collectRiskData 方法
      (controller as any).collectRiskData = jest.fn().mockResolvedValue(mockRiskData);
      (controller as any).aiAnalysisService.analyzeWithDoubao.mockResolvedValue(mockAIAnalysis);

      mockRequest.body = {
        riskTypes: ['enrollment', 'financial', 'operational'],
        severity: 'all'
      };

      await controller.analyzeRiskAssessment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect((controller as any).collectRiskData).toHaveBeenCalledWith(['enrollment', 'financial', 'operational']);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'AI风险评估分析完成',
        data: expect.objectContaining({
          title: '风险评估分析报告',
          type: 'risk'
        })
      }));
    });
  });

  describe('数据处理方法', () => {
    it('应该正确处理月度统计数据', () => {
      const mockData = [
        { createdAt: '2024-01-15' },
        { createdAt: '2024-01-20' },
        { createdAt: '2024-02-10' }
      ];

      const result = (controller as any).processEnrollmentDataByMonth(mockData);

      expect(result).toEqual({
        '2024-01': 2,
        '2024-02': 1
      });
    });

    it('应该正确处理来源统计数据', () => {
      const mockData = [
        { source: 'online' },
        { source: 'offline' },
        { source: 'online' }
      ];

      const result = (controller as any).processEnrollmentDataBySource(mockData);

      expect(result).toEqual({
        'online': 2,
        'offline': 1
      });
    });

    it('应该正确获取年龄组', () => {
      expect((controller as any).getAgeGroup(2)).toBe('3岁以下');
      expect((controller as any).getAgeGroup(3)).toBe('3-4岁');
      expect((controller as any).getAgeGroup(4)).toBe('4-5岁');
      expect((controller as any).getAgeGroup(6)).toBe('5岁以上');
    });
  });
});