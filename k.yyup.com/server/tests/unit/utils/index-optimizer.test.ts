import { Sequelize, QueryTypes } from 'sequelize';
import { vi } from 'vitest'

// Mock dependencies
jest.mock('sequelize');
jest.mock('fs');

const mockSequelize = Sequelize as jest.MockedClass<typeof Sequelize>;
const mockFs = require('fs');


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

describe('Index Optimizer', () => {
  let mockSequelizeInstance: jest.Mocked<Sequelize>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSequelizeInstance = {
      query: jest.fn(),
      getDialect: jest.fn().mockReturnValue('mysql')
    } as any;

    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.readFileSync.mockReturnValue('[]');
  });

  describe('Index Analysis', () => {
    it('应该分析现有索引', async () => {
      const mockIndexes = [
        {
          table: 'users',
          index_name: 'PRIMARY',
          column_name: 'id',
          cardinality: 10000,
          index_type: 'BTREE'
        },
        {
          table: 'users',
          index_name: 'idx_email',
          column_name: 'email',
          cardinality: 9800,
          index_type: 'BTREE'
        }
      ];

      mockSequelizeInstance.query.mockResolvedValue(mockIndexes);

      // Mock index analysis function
      const analyzeExistingIndexes = async (tableName: string) => {
        const query = `
          SELECT 
            table_name as 'table',
            index_name,
            column_name,
            cardinality,
            index_type
          FROM information_schema.statistics 
          WHERE table_name = ?
        `;
        return await mockSequelizeInstance.query(query, {
          replacements: [tableName],
          type: QueryTypes.SELECT
        });
      };

      const result = await analyzeExistingIndexes('users');

      expect(mockSequelizeInstance.query).toHaveBeenCalled();
      expect(result).toEqual(mockIndexes);
    });

    it('应该计算索引选择性', () => {
      const calculateSelectivity = (cardinality: number, totalRows: number) => {
        return cardinality / totalRows;
      };

      const testCases = [
        { cardinality: 10000, totalRows: 10000, expected: 1.0 }, // 唯一索引
        { cardinality: 5000, totalRows: 10000, expected: 0.5 },  // 中等选择性
        { cardinality: 10, totalRows: 10000, expected: 0.001 }   // 低选择性
      ];

      testCases.forEach(({ cardinality, totalRows, expected }) => {
        const selectivity = calculateSelectivity(cardinality, totalRows);
        expect(selectivity).toBeCloseTo(expected, 3);
      });
    });

    it('应该识别重复索引', () => {
      const findDuplicateIndexes = (indexes: any[]) => {
        const indexGroups = new Map();
        
        indexes.forEach(index => {
          const key = `${index.table}_${index.columns.join('_')}`;
          if (!indexGroups.has(key)) {
            indexGroups.set(key, []);
          }
          indexGroups.get(key).push(index);
        });

        return Array.from(indexGroups.values()).filter(group => group.length > 1);
      };

      const indexes = [
        { table: 'users', name: 'idx_email_1', columns: ['email'] },
        { table: 'users', name: 'idx_email_2', columns: ['email'] },
        { table: 'users', name: 'idx_name', columns: ['name'] }
      ];

      const duplicates = findDuplicateIndexes(indexes);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0]).toHaveLength(2);
    });

    it('应该识别未使用的索引', () => {
      const findUnusedIndexes = (indexes: any[], queryStats: any[]) => {
        const usedIndexes = new Set(queryStats.map(stat => stat.index_name));
        return indexes.filter(index => !usedIndexes.has(index.name));
      };

      const indexes = [
        { name: 'idx_email', table: 'users' },
        { name: 'idx_name', table: 'users' },
        { name: 'idx_phone', table: 'users' }
      ];

      const queryStats = [
        { index_name: 'idx_email', usage_count: 1000 },
        { index_name: 'idx_name', usage_count: 500 }
      ];

      const unusedIndexes = findUnusedIndexes(indexes, queryStats);

      expect(unusedIndexes).toHaveLength(1);
      expect(unusedIndexes[0].name).toBe('idx_phone');
    });
  });

  describe('Index Recommendations', () => {
    it('应该推荐缺失的索引', () => {
      const recommendMissingIndexes = (slowQueries: any[]) => {
        const recommendations = [];

        slowQueries.forEach(query => {
          if (query.type === 'SELECT' && query.where_columns) {
            query.where_columns.forEach((column: string) => {
              if (!query.existing_indexes.includes(column)) {
                recommendations.push({
                  table: query.table,
                  column,
                  reason: 'WHERE子句中使用但缺少索引',
                  priority: 'high'
                });
              }
            });
          }
        });

        return recommendations;
      };

      const slowQueries = [
        {
          table: 'users',
          type: 'SELECT',
          where_columns: ['email', 'status'],
          existing_indexes: ['email']
        }
      ];

      const recommendations = recommendMissingIndexes(slowQueries);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].column).toBe('status');
      expect(recommendations[0].priority).toBe('high');
    });

    it('应该推荐复合索引', () => {
      const recommendCompositeIndexes = (queryPatterns: any[]) => {
        const recommendations = [];

        queryPatterns.forEach(pattern => {
          if (pattern.where_columns.length > 1) {
            recommendations.push({
              table: pattern.table,
              columns: pattern.where_columns,
              reason: '多列WHERE条件可以使用复合索引',
              estimatedImprovement: '50-80%'
            });
          }
        });

        return recommendations;
      };

      const queryPatterns = [
        {
          table: 'orders',
          where_columns: ['user_id', 'status', 'created_at'],
          frequency: 1000
        }
      ];

      const recommendations = recommendCompositeIndexes(queryPatterns);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].columns).toEqual(['user_id', 'status', 'created_at']);
    });

    it('应该推荐覆盖索引', () => {
      const recommendCoveringIndexes = (queries: any[]) => {
        const recommendations = [];

        queries.forEach(query => {
          if (query.select_columns && query.where_columns) {
            const allColumns = [...query.where_columns, ...query.select_columns];
            recommendations.push({
              table: query.table,
              columns: allColumns,
              type: 'covering',
              benefit: '避免回表查询'
            });
          }
        });

        return recommendations;
      };

      const queries = [
        {
          table: 'products',
          where_columns: ['category_id'],
          select_columns: ['name', 'price']
        }
      ];

      const recommendations = recommendCoveringIndexes(queries);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('covering');
      expect(recommendations[0].columns).toEqual(['category_id', 'name', 'price']);
    });
  });

  describe('Index Performance Impact', () => {
    it('应该估算索引性能影响', () => {
      const estimatePerformanceImpact = (indexRecommendation: any, tableStats: any) => {
        const { columns, table } = indexRecommendation;
        const { totalRows, queryFrequency } = tableStats;

        // 简化的性能影响估算
        const selectivityScore = columns.length > 1 ? 0.8 : 0.6;
        const frequencyScore = Math.min(queryFrequency / 1000, 1.0);
        const sizeScore = Math.max(1 - (totalRows / 1000000), 0.1);

        const overallScore = (selectivityScore + frequencyScore + sizeScore) / 3;

        return {
          score: overallScore,
          estimatedSpeedUp: `${Math.round(overallScore * 100)}%`,
          recommendation: overallScore > 0.7 ? 'strongly_recommended' : 
                        overallScore > 0.4 ? 'recommended' : 'consider'
        };
      };

      const indexRecommendation = {
        table: 'users',
        columns: ['email', 'status']
      };

      const tableStats = {
        totalRows: 100000,
        queryFrequency: 500
      };

      const impact = estimatePerformanceImpact(indexRecommendation, tableStats);

      expect(impact.score).toBeGreaterThan(0);
      expect(impact.score).toBeLessThanOrEqual(1);
      expect(impact.estimatedSpeedUp).toMatch(/\d+%/);
    });

    it('应该计算索引维护成本', () => {
      const calculateMaintenanceCost = (indexSpec: any, tableStats: any) => {
        const { columns, table } = indexSpec;
        const { insertRate, updateRate, deleteRate } = tableStats;

        // 索引维护成本估算
        const columnCount = columns.length;
        const writeOperations = insertRate + updateRate + deleteRate;
        
        const maintenanceCost = columnCount * writeOperations * 0.1; // 简化计算

        return {
          dailyCost: maintenanceCost,
          impact: maintenanceCost > 1000 ? 'high' : 
                 maintenanceCost > 100 ? 'medium' : 'low'
        };
      };

      const indexSpec = {
        table: 'logs',
        columns: ['timestamp', 'level', 'message']
      };

      const tableStats = {
        insertRate: 10000, // 每天插入10000条
        updateRate: 100,
        deleteRate: 500
      };

      const cost = calculateMaintenanceCost(indexSpec, tableStats);

      expect(cost.dailyCost).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(cost.impact);
    });
  });

  describe('Index Optimization Strategies', () => {
    it('应该生成索引优化策略', () => {
      const generateOptimizationStrategy = (analysis: any) => {
        const strategy = {
          immediate: [],
          shortTerm: [],
          longTerm: []
        };

        // 立即执行的优化
        analysis.duplicateIndexes.forEach((duplicate: any) => {
          strategy.immediate.push({
            action: 'drop_duplicate_index',
            target: duplicate.redundantIndex,
            reason: '删除重复索引'
          });
        });

        // 短期优化
        analysis.highImpactRecommendations.forEach((rec: any) => {
          strategy.shortTerm.push({
            action: 'create_index',
            target: rec,
            reason: '高影响索引推荐'
          });
        });

        // 长期优化
        analysis.unusedIndexes.forEach((unused: any) => {
          strategy.longTerm.push({
            action: 'consider_dropping',
            target: unused,
            reason: '长期未使用的索引'
          });
        });

        return strategy;
      };

      const analysis = {
        duplicateIndexes: [
          { redundantIndex: 'idx_email_duplicate' }
        ],
        highImpactRecommendations: [
          { table: 'users', columns: ['status'] }
        ],
        unusedIndexes: [
          { name: 'idx_old_column' }
        ]
      };

      const strategy = generateOptimizationStrategy(analysis);

      expect(strategy.immediate).toHaveLength(1);
      expect(strategy.shortTerm).toHaveLength(1);
      expect(strategy.longTerm).toHaveLength(1);
    });

    it('应该生成索引创建SQL', () => {
      const generateCreateIndexSQL = (recommendation: any) => {
        const { table, columns, name, type = 'BTREE' } = recommendation;
        const indexName = name || `idx_${table}_${columns.join('_')}`;
        const columnList = columns.join(', ');

        return `CREATE INDEX ${indexName} ON ${table} (${columnList}) USING ${type};`;
      };

      const recommendation = {
        table: 'users',
        columns: ['email', 'status'],
        type: 'BTREE'
      };

      const sql = generateCreateIndexSQL(recommendation);

      expect(sql).toBe('CREATE INDEX idx_users_email_status ON users (email, status) USING BTREE;');
    });

    it('应该生成索引删除SQL', () => {
      const generateDropIndexSQL = (indexName: string, tableName: string) => {
        return `DROP INDEX ${indexName} ON ${tableName};`;
      };

      const sql = generateDropIndexSQL('idx_duplicate', 'users');

      expect(sql).toBe('DROP INDEX idx_duplicate ON users;');
    });
  });

  describe('Monitoring and Reporting', () => {
    it('应该生成索引使用报告', () => {
      const generateUsageReport = (indexStats: any[]) => {
        const totalIndexes = indexStats.length;
        const usedIndexes = indexStats.filter(stat => stat.usage_count > 0);
        const unusedIndexes = indexStats.filter(stat => stat.usage_count === 0);

        return {
          summary: {
            total: totalIndexes,
            used: usedIndexes.length,
            unused: unusedIndexes.length,
            usageRate: (usedIndexes.length / totalIndexes) * 100
          },
          topUsedIndexes: indexStats
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, 10),
          unusedIndexes: unusedIndexes.map(idx => ({
            name: idx.name,
            table: idx.table,
            size: idx.size
          }))
        };
      };

      const indexStats = [
        { name: 'idx_email', table: 'users', usage_count: 1000, size: '1MB' },
        { name: 'idx_name', table: 'users', usage_count: 500, size: '800KB' },
        { name: 'idx_unused', table: 'users', usage_count: 0, size: '500KB' }
      ];

      const report = generateUsageReport(indexStats);

      expect(report.summary.total).toBe(3);
      expect(report.summary.used).toBe(2);
      expect(report.summary.unused).toBe(1);
      expect(report.summary.usageRate).toBeCloseTo(66.67, 2);
    });

    it('应该保存优化报告', () => {
      const saveOptimizationReport = (report: any, filename: string) => {
        const reportContent = JSON.stringify(report, null, 2);
        mockFs.writeFileSync(filename, reportContent);
        return true;
      };

      const report = {
        timestamp: new Date().toISOString(),
        recommendations: [],
        summary: {}
      };

      const result = saveOptimizationReport(report, 'index-optimization-report.json');

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('应该处理数据库查询错误', async () => {
      mockSequelizeInstance.query.mockRejectedValue(new Error('Database error'));

      const analyzeIndexes = async () => {
        try {
          return await mockSequelizeInstance.query('SHOW INDEXES');
        } catch (error) {
          console.error('Index analysis failed:', error);
          return [];
        }
      };

      const result = await analyzeIndexes();

      expect(result).toEqual([]);
    });

    it('应该处理无效的索引推荐', () => {
      const validateRecommendation = (recommendation: any) => {
        if (!recommendation.table || !recommendation.columns || recommendation.columns.length === 0) {
          return false;
        }
        return true;
      };

      const validRecommendation = { table: 'users', columns: ['email'] };
      const invalidRecommendation = { table: '', columns: [] };

      expect(validateRecommendation(validRecommendation)).toBe(true);
      expect(validateRecommendation(invalidRecommendation)).toBe(false);
    });
  });
});
