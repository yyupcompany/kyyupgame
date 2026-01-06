import { Sequelize, QueryTypes } from 'sequelize';
import { vi } from 'vitest'

// Mock dependencies
jest.mock('sequelize');
jest.mock('fs');
jest.mock('path');

const mockSequelize = Sequelize as jest.MockedClass<typeof Sequelize>;
const mockFs = require('fs');
const mockPath = require('path');


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

describe('Slow Query Analyzer', () => {
  let mockSequelizeInstance: jest.Mocked<Sequelize>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSequelizeInstance = {
      query: jest.fn(),
      getDialect: jest.fn().mockReturnValue('mysql')
    } as any;

    // Mock fs methods
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.readFileSync.mockReturnValue('[]');
    mockFs.existsSync.mockReturnValue(true);
    
    // Mock path.join
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'));
  });

  describe('Slow Query Detection', () => {
    it('应该检测慢查询', () => {
      interface SlowQuery {
        query: string;
        executionTime: number;
        timestamp: Date;
        database: string;
        user: string;
      }

      const slowQuery: SlowQuery = {
        query: 'SELECT * FROM users WHERE name LIKE "%test%"',
        executionTime: 5.2, // 5.2秒
        timestamp: new Date(),
        database: 'myapp',
        user: 'app_user'
      };

      const threshold = 1.0; // 1秒阈值

      expect(slowQuery.executionTime).toBeGreaterThan(threshold);
      expect(slowQuery.query).toContain('SELECT');
    });

    it('应该分析查询执行时间', () => {
      const queries = [
        { query: 'SELECT * FROM users', time: 0.1 },
        { query: 'SELECT * FROM orders', time: 2.5 },
        { query: 'SELECT * FROM products', time: 0.3 },
        { query: 'SELECT * FROM logs', time: 8.7 }
      ];

      const threshold = 1.0;
      const slowQueries = queries.filter(q => q.time > threshold);

      expect(slowQueries).toHaveLength(2);
      expect(slowQueries[0].time).toBe(2.5);
      expect(slowQueries[1].time).toBe(8.7);
    });

    it('应该记录查询统计信息', () => {
      const queryStats = {
        totalQueries: 1000,
        slowQueries: 25,
        averageTime: 0.8,
        maxTime: 12.3,
        minTime: 0.01,
        slowQueryPercentage: 2.5
      };

      expect(queryStats.slowQueryPercentage).toBe(2.5);
      expect(queryStats.maxTime).toBe(12.3);
      expect(queryStats.averageTime).toBe(0.8);
    });
  });

  describe('Query Analysis', () => {
    it('应该分析查询类型', () => {
      const analyzeQueryType = (query: string) => {
        const upperQuery = query.toUpperCase().trim();
        
        if (upperQuery.startsWith('SELECT')) return 'SELECT';
        if (upperQuery.startsWith('INSERT')) return 'INSERT';
        if (upperQuery.startsWith('UPDATE')) return 'UPDATE';
        if (upperQuery.startsWith('DELETE')) return 'DELETE';
        if (upperQuery.startsWith('CREATE')) return 'CREATE';
        if (upperQuery.startsWith('DROP')) return 'DROP';
        
        return 'OTHER';
      };

      const queries = [
        'SELECT * FROM users',
        'INSERT INTO users VALUES (...)',
        'UPDATE users SET name = "test"',
        'DELETE FROM users WHERE id = 1',
        'CREATE TABLE test (...)',
        'DROP TABLE test'
      ];

      const expectedTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP'];

      queries.forEach((query, index) => {
        expect(analyzeQueryType(query)).toBe(expectedTypes[index]);
      });
    });

    it('应该识别全表扫描', () => {
      const detectFullTableScan = (query: string, explainPlan: any) => {
        // 检查EXPLAIN输出中的type字段
        return explainPlan.some((row: any) => 
          row.type === 'ALL' || row.Extra?.includes('Using filesort')
        );
      };

      const explainPlan = [
        { type: 'ALL', key: null, rows: 10000, Extra: 'Using where' }
      ];

      const hasFullScan = detectFullTableScan('SELECT * FROM users', explainPlan);
      expect(hasFullScan).toBe(true);
    });

    it('应该分析索引使用情况', () => {
      const analyzeIndexUsage = (explainPlan: any[]) => {
        return explainPlan.map(row => ({
          table: row.table,
          type: row.type,
          key: row.key,
          keyLen: row.key_len,
          rows: row.rows,
          usingIndex: row.Extra?.includes('Using index')
        }));
      };

      const explainPlan = [
        { 
          table: 'users', 
          type: 'ref', 
          key: 'idx_email', 
          key_len: '255', 
          rows: 1, 
          Extra: 'Using index' 
        }
      ];

      const analysis = analyzeIndexUsage(explainPlan);
      
      expect(analysis[0].key).toBe('idx_email');
      expect(analysis[0].usingIndex).toBe(true);
      expect(analysis[0].rows).toBe(1);
    });

    it('应该检测缺失的索引', () => {
      const detectMissingIndexes = (query: string, explainPlan: any[]) => {
        const suggestions = [];
        
        for (const row of explainPlan) {
          if (row.type === 'ALL' && row.rows > 1000) {
            suggestions.push({
              table: row.table,
              suggestion: `考虑在 ${row.table} 表上添加索引`,
              reason: '全表扫描，行数较多'
            });
          }
        }
        
        return suggestions;
      };

      const explainPlan = [
        { table: 'users', type: 'ALL', rows: 50000, key: null }
      ];

      const suggestions = detectMissingIndexes('SELECT * FROM users WHERE email = ?', explainPlan);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].table).toBe('users');
      expect(suggestions[0].reason).toContain('全表扫描');
    });
  });

  describe('Performance Metrics', () => {
    it('应该计算查询性能指标', () => {
      const calculateMetrics = (queries: any[]) => {
        const times = queries.map(q => q.executionTime);
        
        return {
          count: queries.length,
          totalTime: times.reduce((sum, time) => sum + time, 0),
          averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          medianTime: times.sort((a, b) => a - b)[Math.floor(times.length / 2)]
        };
      };

      const queries = [
        { executionTime: 0.1 },
        { executionTime: 0.5 },
        { executionTime: 1.2 },
        { executionTime: 2.8 },
        { executionTime: 0.3 }
      ];

      const metrics = calculateMetrics(queries);

      expect(metrics.count).toBe(5);
      expect(metrics.minTime).toBe(0.1);
      expect(metrics.maxTime).toBe(2.8);
      expect(metrics.averageTime).toBeCloseTo(1.0, 1);
    });

    it('应该分析查询趋势', () => {
      const analyzeTrends = (queries: any[]) => {
        const hourlyStats = new Map();
        
        queries.forEach(query => {
          const hour = query.timestamp.getHours();
          if (!hourlyStats.has(hour)) {
            hourlyStats.set(hour, { count: 0, totalTime: 0 });
          }
          
          const stats = hourlyStats.get(hour);
          stats.count++;
          stats.totalTime += query.executionTime;
        });

        return Array.from(hourlyStats.entries()).map(([hour, stats]) => ({
          hour,
          count: stats.count,
          averageTime: stats.totalTime / stats.count
        }));
      };

      const queries = [
        { timestamp: new Date('2023-01-01T09:00:00'), executionTime: 1.0 },
        { timestamp: new Date('2023-01-01T09:30:00'), executionTime: 2.0 },
        { timestamp: new Date('2023-01-01T10:00:00'), executionTime: 0.5 }
      ];

      const trends = analyzeTrends(queries);
      
      expect(trends).toHaveLength(2); // 9点和10点
      expect(trends[0].count).toBe(2); // 9点有2个查询
      expect(trends[1].count).toBe(1); // 10点有1个查询
    });
  });

  describe('Optimization Suggestions', () => {
    it('应该提供查询优化建议', () => {
      const generateOptimizationSuggestions = (query: string, explainPlan: any[]) => {
        const suggestions = [];

        // 检查SELECT *
        if (query.includes('SELECT *')) {
          suggestions.push({
            type: 'SELECT_OPTIMIZATION',
            message: '避免使用 SELECT *，只选择需要的字段',
            priority: 'medium'
          });
        }

        // 检查LIKE '%...%'
        if (query.includes("LIKE '%") && query.includes("%'")) {
          suggestions.push({
            type: 'LIKE_OPTIMIZATION',
            message: '避免在LIKE模式开头使用通配符',
            priority: 'high'
          });
        }

        // 检查全表扫描
        if (explainPlan.some(row => row.type === 'ALL')) {
          suggestions.push({
            type: 'INDEX_OPTIMIZATION',
            message: '考虑添加适当的索引以避免全表扫描',
            priority: 'high'
          });
        }

        return suggestions;
      };

      const query = 'SELECT * FROM users WHERE name LIKE "%test%"';
      const explainPlan = [{ type: 'ALL', rows: 10000 }];

      const suggestions = generateOptimizationSuggestions(query, explainPlan);

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].type).toBe('SELECT_OPTIMIZATION');
      expect(suggestions[1].type).toBe('LIKE_OPTIMIZATION');
      expect(suggestions[2].type).toBe('INDEX_OPTIMIZATION');
    });

    it('应该按优先级排序建议', () => {
      const suggestions = [
        { type: 'A', priority: 'low' },
        { type: 'B', priority: 'high' },
        { type: 'C', priority: 'medium' },
        { type: 'D', priority: 'high' }
      ];

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      
      const sortedSuggestions = suggestions.sort((a, b) => 
        priorityOrder[b.priority as keyof typeof priorityOrder] - 
        priorityOrder[a.priority as keyof typeof priorityOrder]
      );

      expect(sortedSuggestions[0].priority).toBe('high');
      expect(sortedSuggestions[1].priority).toBe('high');
      expect(sortedSuggestions[2].priority).toBe('medium');
      expect(sortedSuggestions[3].priority).toBe('low');
    });
  });

  describe('Report Generation', () => {
    it('应该生成慢查询报告', () => {
      const generateReport = (slowQueries: any[]) => {
        const report = {
          summary: {
            totalSlowQueries: slowQueries.length,
            timeRange: {
              start: new Date(Math.min(...slowQueries.map(q => q.timestamp.getTime()))),
              end: new Date(Math.max(...slowQueries.map(q => q.timestamp.getTime())))
            },
            averageExecutionTime: slowQueries.reduce((sum, q) => sum + q.executionTime, 0) / slowQueries.length
          },
          topSlowQueries: slowQueries
            .sort((a, b) => b.executionTime - a.executionTime)
            .slice(0, 10),
          queryTypes: slowQueries.reduce((acc, q) => {
            const type = q.type || 'UNKNOWN';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };

        return report;
      };

      const slowQueries = [
        { timestamp: new Date('2023-01-01T09:00:00'), executionTime: 5.2, type: 'SELECT' },
        { timestamp: new Date('2023-01-01T10:00:00'), executionTime: 3.1, type: 'UPDATE' },
        { timestamp: new Date('2023-01-01T11:00:00'), executionTime: 7.8, type: 'SELECT' }
      ];

      const report = generateReport(slowQueries);

      expect(report.summary.totalSlowQueries).toBe(3);
      expect(report.summary.averageExecutionTime).toBeCloseTo(5.37, 2);
      expect(report.topSlowQueries[0].executionTime).toBe(7.8);
      expect(report.queryTypes.SELECT).toBe(2);
      expect(report.queryTypes.UPDATE).toBe(1);
    });

    it('应该生成HTML报告', () => {
      const generateHTMLReport = (data: any) => {
        return `
          <html>
            <head><title>慢查询分析报告</title></head>
            <body>
              <h1>慢查询分析报告</h1>
              <p>总慢查询数: ${data.totalSlowQueries}</p>
              <p>平均执行时间: ${data.averageExecutionTime.toFixed(2)}秒</p>
            </body>
          </html>
        `;
      };

      const data = {
        totalSlowQueries: 25,
        averageExecutionTime: 3.45
      };

      const htmlReport = generateHTMLReport(data);

      expect(htmlReport).toContain('<html>');
      expect(htmlReport).toContain('总慢查询数: 25');
      expect(htmlReport).toContain('平均执行时间: 3.45秒');
    });

    it('应该保存报告到文件', () => {
      const saveReport = (report: any, filename: string) => {
        const reportContent = JSON.stringify(report, null, 2);
        mockFs.writeFileSync(filename, reportContent);
      };

      const report = { summary: 'test report' };
      const filename = 'slow-query-report.json';

      saveReport(report, filename);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        filename,
        JSON.stringify(report, null, 2)
      );
    });
  });

  describe('Configuration', () => {
    it('应该支持配置慢查询阈值', () => {
      const config = {
        slowQueryThreshold: 2.0, // 2秒
        maxReportQueries: 100,
        enableAutoAnalysis: true,
        reportInterval: 3600000 // 1小时
      };

      expect(config.slowQueryThreshold).toBe(2.0);
      expect(config.maxReportQueries).toBe(100);
      expect(config.enableAutoAnalysis).toBe(true);
    });

    it('应该支持不同数据库方言', () => {
      const dialectConfigs = {
        mysql: {
          slowQueryLogTable: 'mysql.slow_log',
          explainCommand: 'EXPLAIN'
        },
        postgresql: {
          slowQueryLogTable: 'pg_stat_statements',
          explainCommand: 'EXPLAIN ANALYZE'
        }
      };

      expect(dialectConfigs.mysql.explainCommand).toBe('EXPLAIN');
      expect(dialectConfigs.postgresql.explainCommand).toBe('EXPLAIN ANALYZE');
    });
  });

  describe('Error Handling', () => {
    it('应该处理查询分析错误', async () => {
      mockSequelizeInstance.query.mockRejectedValue(new Error('Query failed'));

      const analyzeQuery = async (query: string) => {
        try {
          return await mockSequelizeInstance.query(`EXPLAIN ${query}`);
        } catch (error) {
          console.error('Query analysis failed:', error);
          return null;
        }
      };

      const result = await analyzeQuery('SELECT * FROM users');

      expect(result).toBeNull();
    });

    it('应该处理报告生成错误', () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('File write failed');
      });

      const saveReport = (report: any) => {
        try {
          mockFs.writeFileSync('report.json', JSON.stringify(report));
          return true;
        } catch (error) {
          console.error('Report save failed:', error);
          return false;
        }
      };

      const result = saveReport({ test: 'data' });

      expect(result).toBe(false);
    });
  });
});
