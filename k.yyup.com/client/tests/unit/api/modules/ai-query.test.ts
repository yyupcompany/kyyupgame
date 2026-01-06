import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  },
  aiRequest: {
    post: vi.fn()
  }
}));

// Import after mocks
import * as aiQueryApi from '@/api/modules/ai-query';
import { request, aiRequest } from '@/utils/request';

const mockedRequest = request as any;
const mockedAiRequest = aiRequest as any;

// 控制台错误检测变量
let consoleSpy: any

describe('AI Query API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('executeQuery', () => {
    it('should execute AI query with all parameters', async () => {
      const mockParams = {
        query: 'Show me all students enrolled in 2024',
        context: {
          filters: { year: 2024 },
          userRole: 'admin',
          userId: 1,
          permissions: ['read_students'],
          timestamp: '2024-01-01T10:00:00Z'
        },
        sessionId: 'session-123'
      };
      const mockResponse = {
        success: true,
        data: {
          sessionId: 'session-123',
          data: [
            { id: 1, name: 'John Doe', enrollmentDate: '2024-01-15' },
            { id: 2, name: 'Jane Smith', enrollmentDate: '2024-01-20' }
          ],
          metadata: {
            columns: [
              { name: 'id', type: 'integer', label: 'ID' },
              { name: 'name', type: 'string', label: 'Name' },
              { name: 'enrollmentDate', type: 'date', label: 'Enrollment Date' }
            ],
            rowCount: 2,
            executionTime: 1.5,
            cacheHit: false
          },
          visualization: {
            type: 'table',
            title: '2024 Enrollments',
            config: { sortable: true }
          },
          queryLogId: 12345
        }
      };

      mockedAiRequest.post.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.executeQuery(mockParams);

      // 验证API调用
      expect(mockedAiRequest.post).toHaveBeenCalledWith('/ai-query/chat', {
        message: mockParams.query,
        context: mockParams.context,
        sessionId: mockParams.sessionId,
        userId: mockParams.context?.userId
      });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, ['sessionId', 'data', 'metadata']);
      expect(validation.valid).toBe(true);

      // 验证数据数组
      expect(Array.isArray(result.data.data)).toBe(true);

      // 验证元数据
      if (result.data.metadata) {
        const metadataValidation = validateRequiredFields(result.data.metadata, ['columns', 'rowCount']);
        expect(metadataValidation.valid).toBe(true);
      }
    });

    it('should execute AI query with minimal parameters', async () => {
      const mockParams = {
        query: 'Show me students'
      };
      const mockResponse = { success: true, data: {} };
      mockedAiRequest.post.mockResolvedValue(mockResponse);

      await aiQueryApi.aiQueryApi.executeQuery(mockParams);

      expect(mockedAiRequest.post).toHaveBeenCalledWith('/ai-query/chat', {
        message: mockParams.query,
        context: undefined,
        sessionId: undefined,
        userId: undefined
      });
    });
  });

  describe('getQueryHistory', () => {
    it('should get query history with all parameters', async () => {
      const mockParams = {
        page: 1,
        pageSize: 20,
        queryType: 'data_query',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
      const mockResponse = {
        success: true,
        data: {
          data: [
            {
              id: 1,
              naturalQuery: 'Show me all students',
              generatedSql: 'SELECT * FROM students',
              finalSql: 'SELECT * FROM students WHERE status = "active"',
              executionStatus: 'success',
              executionTime: 1.2,
              aiProcessingTime: 0.8,
              resultCount: 150,
              tokensUsed: 250,
              modelUsed: 'gpt-4',
              cacheHit: false,
              queryComplexity: 3,
              createdAt: '2024-01-01T10:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.getQueryHistory(mockParams);

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/history', mockParams);
      expect(result).toEqual(mockResponse);
    });

    it('should get query history without parameters', async () => {
      const mockResponse = { success: true, data: { data: [], total: 0 } };
      mockedRequest.get.mockResolvedValue(mockResponse);

      await aiQueryApi.aiQueryApi.getQueryHistory();

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/history', {});
    });
  });

  describe('getQueryDetail', () => {
    it('should get query detail by id', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          naturalQuery: 'Show me all students',
          generatedSql: 'SELECT * FROM students',
          finalSql: 'SELECT * FROM students WHERE status = "active"',
          executionStatus: 'success',
          executionTime: 1.2,
          aiProcessingTime: 0.8,
          resultCount: 150,
          tokensUsed: 250,
          modelUsed: 'gpt-4',
          cacheHit: false,
          queryComplexity: 3,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.getQueryDetail(1);

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('reExecuteQuery', () => {
    it('should re-execute query by id', async () => {
      const mockResponse = {
        success: true,
        data: {
          sessionId: 'session-456',
          data: [],
          metadata: {
            columns: [],
            rowCount: 0,
            executionTime: 2.1,
            cacheHit: false
          },
          queryLogId: 12346
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.reExecuteQuery(1);

      expect(mockedRequest.post).toHaveBeenCalledWith('/ai-query/1/re-execute');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('submitFeedback', () => {
    it('should submit query feedback', async () => {
      const mockFeedback = {
        queryLogId: 1,
        rating: 5,
        feedbackType: 'accuracy',
        comments: 'Very accurate results',
        correctedSql: 'SELECT * FROM students WHERE enrollment_date > "2024-01-01"',
        suggestedImprovement: 'Add date filtering by default'
      };
      const mockResponse = { success: true, data: { feedbackSubmitted: true } };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.submitFeedback(mockFeedback);

      expect(mockedRequest.post).toHaveBeenCalledWith('/ai-query/feedback', mockFeedback);
      expect(result).toEqual(mockResponse);
    });

    it('should submit minimal feedback', async () => {
      const mockFeedback = {
        queryLogId: 1,
        rating: 3,
        feedbackType: 'usefulness'
      };
      const mockResponse = { success: true, data: {} };
      mockedRequest.post.mockResolvedValue(mockResponse);

      await aiQueryApi.aiQueryApi.submitFeedback(mockFeedback);

      expect(mockedRequest.post).toHaveBeenCalledWith('/ai-query/feedback', mockFeedback);
    });
  });

  describe('getTemplates', () => {
    it('should get query templates with category filter', async () => {
      const mockParams = { category: 'students' };
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            name: 'student_enrollment',
            displayName: 'Student Enrollment',
            description: 'Get student enrollment data',
            category: 'students',
            exampleQueries: [
              'Show me all students enrolled this year',
              'How many students are in each class?'
            ],
            usageCount: 150,
            successRate: 95,
            avgExecutionTime: 1.2
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.getTemplates(mockParams);

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/templates', mockParams);
      expect(result).toEqual(mockResponse);
    });

    it('should get all query templates without category filter', async () => {
      const mockResponse = { success: true, data: [] };
      mockedRequest.get.mockResolvedValue(mockResponse);

      await aiQueryApi.aiQueryApi.getTemplates();

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/templates', {});
    });
  });

  describe('getSuggestions', () => {
    it('should get query suggestions', async () => {
      const mockParams = { query: 'stud' };
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            displayName: 'Student Enrollment',
            description: 'Get student enrollment statistics',
            score: 95
          },
          {
            id: 2,
            displayName: 'Student Performance',
            description: 'Analyze student performance metrics',
            score: 88
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.getSuggestions(mockParams);

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/suggestions', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStatistics', () => {
    it('should get query statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          overview: {
            totalQueries: 1500,
            successfulQueries: 1425,
            failedQueries: 75,
            successRate: 95
          },
          trends: [
            { date: '2024-01-01', count: 50 },
            { date: '2024-01-02', count: 45 }
          ],
          popularCategories: [
            { category: 'students', count: 800 },
            { category: 'teachers', count: 400 }
          ],
          lastQueryTime: '2024-01-02T15:30:00Z'
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.getStatistics();

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/statistics');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportResult', () => {
    it('should export query result as Excel', async () => {
      const mockResponse = {
        success: true,
        data: {
          downloadUrl: 'https://example.com/export/result-123.xlsx',
          data: [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' }
          ]
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.exportResult(1, 'excel');

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/1/export', { format: 'excel' });
      expect(result).toEqual(mockResponse);
    });

    it('should export query result as CSV', async () => {
      const mockResponse = { success: true, data: { downloadUrl: 'https://example.com/export/result-123.csv' } };
      mockedRequest.get.mockResolvedValue(mockResponse);

      await aiQueryApi.aiQueryApi.exportResult(1, 'csv');

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/1/export', { format: 'csv' });
    });

    it('should export query result as PDF', async () => {
      const mockResponse = { success: true, data: { downloadUrl: 'https://example.com/export/result-123.pdf' } };
      mockedRequest.get.mockResolvedValue(mockResponse);

      await aiQueryApi.aiQueryApi.exportResult(1, 'pdf');

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/1/export', { format: 'pdf' });
    });
  });

  describe('cleanupCache', () => {
    it('should cleanup cache', async () => {
      const mockResponse = {
        success: true,
        data: { deletedCount: 150 }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.cleanupCache();

      expect(mockedRequest.post).toHaveBeenCalledWith('/ai-query/cache/cleanup');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCapabilities', () => {
    it('should get AI query capabilities', async () => {
      const mockResponse = {
        success: true,
        data: {
          supportedQueries: [
            'SELECT queries',
            'JOIN operations',
            'Aggregation functions',
            'Date filtering',
            'Conditional logic'
          ],
          availableModels: [
            'gpt-4',
            'gpt-3.5-turbo',
            'claude-3'
          ],
          maxComplexity: 5,
          features: [
            'Natural language to SQL',
            'Query optimization',
            'Result visualization',
            'Query history tracking',
            'Performance analytics'
          ]
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.getCapabilities();

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/capabilities');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateSQL', () => {
    it('should validate SQL syntax', async () => {
      const mockSQL = 'SELECT * FROM students WHERE enrollment_date > "2024-01-01"';
      const mockResponse = {
        success: true,
        data: {
          isValid: true,
          errors: [],
          warnings: [
            'Consider adding index on enrollment_date for better performance'
          ],
          suggestions: [
            'Use LIMIT clause for large result sets',
            'Consider adding WHERE clause for filtering'
          ]
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.validateSQL(mockSQL);

      expect(mockedRequest.post).toHaveBeenCalledWith('/ai-query/validate-sql', { sql: mockSQL });
      expect(result).toEqual(mockResponse);
    });

    it('should validate invalid SQL', async () => {
      const mockSQL = 'SELECT * FROM students WHERE';
      const mockResponse = {
        success: true,
        data: {
          isValid: false,
          errors: [
            'Syntax error near WHERE clause',
            'Incomplete WHERE condition'
          ],
          warnings: [],
          suggestions: [
            'Complete the WHERE condition',
            'Check syntax for missing operators'
          ]
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.validateSQL(mockSQL);

      expect(mockedRequest.post).toHaveBeenCalledWith('/ai-query/validate-sql', { sql: mockSQL });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDatabaseSchema', () => {
    it('should get database schema', async () => {
      const mockResponse = {
        success: true,
        data: {
          tables: [
            {
              name: 'students',
              chineseName: '学生表',
              columns: [
                {
                  name: 'id',
                  chineseName: '学生ID',
                  type: 'integer',
                  description: '学生唯一标识符'
                },
                {
                  name: 'name',
                  chineseName: '姓名',
                  type: 'varchar',
                  description: '学生姓名'
                },
                {
                  name: 'enrollment_date',
                  chineseName: '入学日期',
                  type: 'date',
                  description: '学生入学日期'
                }
              ]
            },
            {
              name: 'teachers',
              chineseName: '教师表',
              columns: [
                {
                  name: 'id',
                  chineseName: '教师ID',
                  type: 'integer',
                  description: '教师唯一标识符'
                },
                {
                  name: 'name',
                  chineseName: '姓名',
                  type: 'varchar',
                  description: '教师姓名'
                }
              ]
            }
          ]
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.getDatabaseSchema();

      expect(mockedRequest.get).toHaveBeenCalledWith('/ai-query/schema');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedAiRequest.post.mockRejectedValue(mockError);

      await expect(aiQueryApi.aiQueryApi.executeQuery({ query: 'test' }))
        .rejects.toThrow('Network error');
    });

    it('should handle API response errors', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid query parameters',
        data: null
      };
      mockedAiRequest.post.mockResolvedValue(mockErrorResponse);

      const result = await aiQueryApi.aiQueryApi.executeQuery({ query: 'test' });
      expect(result).toEqual(mockErrorResponse);
    });

    it('should handle empty responses', async () => {
      const mockResponse = { success: true, data: null };
      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await aiQueryApi.aiQueryApi.getQueryHistory();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Default Export', () => {
    it('should export default API object', () => {
      expect(aiQueryApi.default).toBeDefined();
      expect(aiQueryApi.default).toBe(aiQueryApi.aiQueryApi);
    });
  });
});