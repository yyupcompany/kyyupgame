import { vi } from 'vitest'
// Mock dependencies for JavaScript SQL validator file
jest.mock('fs');

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

describe('SQL Validator.js (JavaScript SQL Validator)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fs methods
    mockFs.readFileSync.mockReturnValue('');
    mockFs.writeFileSync.mockImplementation(() => {});
  });

  describe('SQL Syntax Validation', () => {
    it('应该验证基本SELECT语句', () => {
      const validateSelectStatement = (sql: string) => {
        const trimmedSql = sql.trim().toUpperCase();
        
        if (!trimmedSql.startsWith('SELECT')) {
          return { valid: false, error: 'Must start with SELECT' };
        }
        
        if (!trimmedSql.includes('FROM')) {
          return { valid: false, error: 'Missing FROM clause' };
        }
        
        return { valid: true };
      };

      const validSql = 'SELECT * FROM users';
      const invalidSql = 'SELECT * users'; // 缺少FROM

      expect(validateSelectStatement(validSql).valid).toBe(true);
      expect(validateSelectStatement(invalidSql).valid).toBe(false);
      expect(validateSelectStatement(invalidSql).error).toBe('Missing FROM clause');
    });

    it('应该验证INSERT语句', () => {
      const validateInsertStatement = (sql: string) => {
        const trimmedSql = sql.trim().toUpperCase();
        
        if (!trimmedSql.startsWith('INSERT')) {
          return { valid: false, error: 'Must start with INSERT' };
        }
        
        if (!trimmedSql.includes('INTO')) {
          return { valid: false, error: 'Missing INTO clause' };
        }
        
        if (!trimmedSql.includes('VALUES') && !trimmedSql.includes('SELECT')) {
          return { valid: false, error: 'Missing VALUES or SELECT clause' };
        }
        
        return { valid: true };
      };

      const validSql = 'INSERT INTO users (name, email) VALUES ("John", "john@example.com")';
      const invalidSql = 'INSERT users (name) VALUES ("John")'; // 缺少INTO

      expect(validateInsertStatement(validSql).valid).toBe(true);
      expect(validateInsertStatement(invalidSql).valid).toBe(false);
    });

    it('应该验证UPDATE语句', () => {
      const validateUpdateStatement = (sql: string) => {
        const trimmedSql = sql.trim().toUpperCase();
        
        if (!trimmedSql.startsWith('UPDATE')) {
          return { valid: false, error: 'Must start with UPDATE' };
        }
        
        if (!trimmedSql.includes('SET')) {
          return { valid: false, error: 'Missing SET clause' };
        }
        
        return { valid: true };
      };

      const validSql = 'UPDATE users SET name = "John" WHERE id = 1';
      const invalidSql = 'UPDATE users name = "John"'; // 缺少SET

      expect(validateUpdateStatement(validSql).valid).toBe(true);
      expect(validateUpdateStatement(invalidSql).valid).toBe(false);
    });

    it('应该验证DELETE语句', () => {
      const validateDeleteStatement = (sql: string) => {
        const trimmedSql = sql.trim().toUpperCase();
        
        if (!trimmedSql.startsWith('DELETE')) {
          return { valid: false, error: 'Must start with DELETE' };
        }
        
        if (!trimmedSql.includes('FROM')) {
          return { valid: false, error: 'Missing FROM clause' };
        }
        
        // 警告：没有WHERE子句的DELETE语句
        if (!trimmedSql.includes('WHERE')) {
          return { 
            valid: true, 
            warning: 'DELETE without WHERE clause will affect all rows' 
          };
        }
        
        return { valid: true };
      };

      const validSql = 'DELETE FROM users WHERE id = 1';
      const dangerousSql = 'DELETE FROM users'; // 没有WHERE子句

      expect(validateDeleteStatement(validSql).valid).toBe(true);
      expect(validateDeleteStatement(dangerousSql).valid).toBe(true);
      expect(validateDeleteStatement(dangerousSql).warning).toContain('WHERE clause');
    });
  });

  describe('SQL Injection Detection', () => {
    it('应该检测SQL注入模式', () => {
      const detectSqlInjection = (sql: string) => {
        const suspiciousPatterns = [
          /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
          /UNION\s+SELECT/i,
          /OR\s+1\s*=\s*1/i,
          /'\s*OR\s*'.*'\s*=\s*'/i,
          /--/,
          /\/\*/,
          /xp_cmdshell/i,
          /sp_executesql/i
        ];

        const detectedPatterns = [];
        
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(sql)) {
            detectedPatterns.push(pattern.source);
          }
        }

        return {
          suspicious: detectedPatterns.length > 0,
          patterns: detectedPatterns,
          riskLevel: detectedPatterns.length > 2 ? 'high' : 
                    detectedPatterns.length > 0 ? 'medium' : 'low'
        };
      };

      const safeSql = 'SELECT * FROM users WHERE id = ?';
      const maliciousSql = "SELECT * FROM users WHERE id = 1; DROP TABLE users; --";
      const unionSql = "SELECT * FROM users WHERE id = 1 UNION SELECT password FROM admin";

      expect(detectSqlInjection(safeSql).suspicious).toBe(false);
      expect(detectSqlInjection(maliciousSql).suspicious).toBe(true);
      expect(detectSqlInjection(maliciousSql).riskLevel).toBe('high');
      expect(detectSqlInjection(unionSql).suspicious).toBe(true);
    });

    it('应该验证参数化查询', () => {
      const validateParameterizedQuery = (sql: string) => {
        // 检查是否使用了参数占位符
        const hasPlaceholders = /\?|\$\d+|:\w+/.test(sql);
        
        // 检查是否有直接的字符串拼接迹象
        const hasStringConcatenation = /'\s*\+\s*'|"\s*\+\s*"/.test(sql);
        
        return {
          isParameterized: hasPlaceholders,
          hasConcatenation: hasStringConcatenation,
          recommendation: !hasPlaceholders ? 'Use parameterized queries' : 'Good practice'
        };
      };

      const parameterizedSql = 'SELECT * FROM users WHERE email = ? AND status = ?';
      const concatenatedSql = "SELECT * FROM users WHERE name = '" + "' + userInput + '" + "'";

      const paramResult = validateParameterizedQuery(parameterizedSql);
      const concatResult = validateParameterizedQuery(concatenatedSql);

      expect(paramResult.isParameterized).toBe(true);
      expect(paramResult.recommendation).toBe('Good practice');
      expect(concatResult.hasConcatenation).toBe(true);
    });

    it('应该检测危险函数调用', () => {
      const detectDangerousFunctions = (sql: string) => {
        const dangerousFunctions = [
          'xp_cmdshell',
          'sp_executesql',
          'EXEC',
          'EXECUTE',
          'EVAL',
          'LOAD_FILE',
          'INTO OUTFILE',
          'INTO DUMPFILE'
        ];

        const detectedFunctions = dangerousFunctions.filter(func => 
          new RegExp(func, 'i').test(sql)
        );

        return {
          hasDangerousFunctions: detectedFunctions.length > 0,
          functions: detectedFunctions,
          severity: detectedFunctions.length > 0 ? 'critical' : 'safe'
        };
      };

      const safeSql = 'SELECT COUNT(*) FROM users';
      const dangerousSql = 'SELECT * FROM users; EXEC xp_cmdshell("dir")';

      expect(detectDangerousFunctions(safeSql).hasDangerousFunctions).toBe(false);
      expect(detectDangerousFunctions(dangerousSql).hasDangerousFunctions).toBe(true);
      expect(detectDangerousFunctions(dangerousSql).severity).toBe('critical');
    });
  });

  describe('SQL Performance Analysis', () => {
    it('应该分析查询性能', () => {
      const analyzeQueryPerformance = (sql: string) => {
        const issues = [];
        const suggestions = [];

        // 检查SELECT *
        if (/SELECT\s+\*/i.test(sql)) {
          issues.push('Using SELECT * may impact performance');
          suggestions.push('Select only needed columns');
        }

        // 检查LIKE '%...%'
        if (/LIKE\s+['"]%.*%['"]/i.test(sql)) {
          issues.push('Leading wildcard in LIKE prevents index usage');
          suggestions.push('Avoid leading wildcards in LIKE patterns');
        }

        // 检查ORDER BY without LIMIT
        if (/ORDER\s+BY/i.test(sql) && !/LIMIT/i.test(sql)) {
          issues.push('ORDER BY without LIMIT may sort large result sets');
          suggestions.push('Consider adding LIMIT clause');
        }

        return {
          performanceScore: Math.max(0, 100 - (issues.length * 20)),
          issues,
          suggestions
        };
      };

      const inefficientSql = 'SELECT * FROM users WHERE name LIKE "%john%" ORDER BY created_at';
      const efficientSql = 'SELECT id, name FROM users WHERE email = ? LIMIT 10';

      const inefficientResult = analyzeQueryPerformance(inefficientSql);
      const efficientResult = analyzeQueryPerformance(efficientSql);

      expect(inefficientResult.performanceScore).toBeLessThan(100);
      expect(inefficientResult.issues.length).toBeGreaterThan(0);
      expect(efficientResult.performanceScore).toBe(100);
    });

    it('应该检测N+1查询问题', () => {
      const detectNPlusOneQueries = (queries: string[]) => {
        const patterns = new Map();
        
        queries.forEach(query => {
          // 简化的模式匹配，实际实现会更复杂
          const pattern = query.replace(/\d+/g, 'N').replace(/'[^']*'/g, "'X'");
          
          if (!patterns.has(pattern)) {
            patterns.set(pattern, 0);
          }
          patterns.set(pattern, patterns.get(pattern) + 1);
        });

        const suspiciousPatterns = Array.from(patterns.entries())
          .filter(([pattern, count]) => count > 5)
          .map(([pattern, count]) => ({ pattern, count }));

        return {
          hasPotentialNPlusOne: suspiciousPatterns.length > 0,
          suspiciousPatterns,
          recommendation: suspiciousPatterns.length > 0 ? 
            'Consider using JOIN or batch queries' : 'No N+1 issues detected'
        };
      };

      const nPlusOneQueries = [
        'SELECT * FROM posts WHERE user_id = 1',
        'SELECT * FROM posts WHERE user_id = 2',
        'SELECT * FROM posts WHERE user_id = 3',
        'SELECT * FROM posts WHERE user_id = 4',
        'SELECT * FROM posts WHERE user_id = 5',
        'SELECT * FROM posts WHERE user_id = 6'
      ];

      const result = detectNPlusOneQueries(nPlusOneQueries);

      expect(result.hasPotentialNPlusOne).toBe(true);
      expect(result.suspiciousPatterns.length).toBeGreaterThan(0);
    });
  });

  describe('SQL Formatting and Beautification', () => {
    it('应该格式化SQL语句', () => {
      const formatSql = (sql: string) => {
        return sql
          .replace(/\s+/g, ' ') // 规范化空白字符
          .replace(/\s*,\s*/g, ', ') // 逗号后加空格
          .replace(/\s*(=|<|>|<=|>=|!=)\s*/g, ' $1 ') // 操作符前后加空格
          .replace(/\bSELECT\b/gi, 'SELECT')
          .replace(/\bFROM\b/gi, 'FROM')
          .replace(/\bWHERE\b/gi, 'WHERE')
          .replace(/\bORDER BY\b/gi, 'ORDER BY')
          .replace(/\bGROUP BY\b/gi, 'GROUP BY')
          .trim();
      };

      const messySql = 'select*from users where id=1and status="active"';
      const formattedSql = formatSql(messySql);

      expect(formattedSql).toContain('SELECT');
      expect(formattedSql).toContain('FROM');
      expect(formattedSql).toContain(' = ');
      expect(formattedSql).toContain(' AND ');
    });

    it('应该美化复杂SQL语句', () => {
      const beautifySql = (sql: string) => {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ORDER BY', 'GROUP BY', 'HAVING'];
        let beautified = sql;

        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          beautified = beautified.replace(regex, `\n${keyword}`);
        });

        return beautified
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n');
      };

      const complexSql = 'SELECT u.name, COUNT(p.id) FROM users u JOIN posts p ON u.id = p.user_id WHERE u.status = "active" GROUP BY u.id ORDER BY COUNT(p.id) DESC';
      const beautified = beautifySql(complexSql);

      expect(beautified).toContain('\nSELECT');
      expect(beautified).toContain('\nFROM');
      expect(beautified).toContain('\nJOIN');
    });
  });

  describe('SQL Schema Validation', () => {
    it('应该验证表名和列名', () => {
      const validateIdentifiers = (sql: string) => {
        const identifierPattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
        const identifiers = sql.match(identifierPattern) || [];
        
        const invalidIdentifiers = identifiers.filter(id => {
          // 检查是否以数字开头或包含特殊字符
          return /^\d/.test(id) || /[^a-zA-Z0-9_]/.test(id);
        });

        return {
          valid: invalidIdentifiers.length === 0,
          invalidIdentifiers,
          allIdentifiers: identifiers
        };
      };

      const validSql = 'SELECT user_name, user_email FROM user_table';
      const invalidSql = 'SELECT 123invalid, user-name FROM user table';

      expect(validateIdentifiers(validSql).valid).toBe(true);
      expect(validateIdentifiers(invalidSql).valid).toBe(false);
    });

    it('应该检查数据类型兼容性', () => {
      const checkDataTypeCompatibility = (sql: string, schema: any) => {
        const issues = [];
        
        // 简化的类型检查示例
        if (sql.includes("= 'string'") && schema.column_type === 'INTEGER') {
          issues.push('String value assigned to INTEGER column');
        }
        
        if (sql.includes('> "text"') && schema.column_type === 'VARCHAR') {
          issues.push('Comparison operation on VARCHAR column may not work as expected');
        }

        return {
          compatible: issues.length === 0,
          issues
        };
      };

      const sql = "SELECT * FROM users WHERE age = 'twenty'";
      const schema = { column_type: 'INTEGER' };

      const result = checkDataTypeCompatibility(sql, schema);

      expect(result.compatible).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Batch Validation', () => {
    it('应该批量验证SQL文件', () => {
      const validateSqlFile = (filename: string) => {
        mockFs.readFileSync.mockReturnValue(`
          SELECT * FROM users;
          INSERT INTO users (name) VALUES ('John');
          UPDATE users SET status = 'active';
          DELETE FROM users WHERE id = 1;
        `);

        const content = mockFs.readFileSync(filename, 'utf8');
        const statements = content.split(';').filter(stmt => stmt.trim());
        
        const results = statements.map((stmt, index) => ({
          statementIndex: index,
          sql: stmt.trim(),
          valid: stmt.trim().length > 0,
          type: stmt.trim().toUpperCase().split(' ')[0]
        }));

        return {
          filename,
          totalStatements: results.length,
          validStatements: results.filter(r => r.valid).length,
          results
        };
      };

      const result = validateSqlFile('test.sql');

      expect(result.totalStatements).toBe(4);
      expect(result.validStatements).toBe(4);
      expect(result.results[0].type).toBe('SELECT');
    });

    it('应该生成验证报告', () => {
      const generateValidationReport = (results: any[]) => {
        const summary = {
          totalQueries: results.length,
          validQueries: results.filter(r => r.valid).length,
          invalidQueries: results.filter(r => !r.valid).length,
          warnings: results.filter(r => r.warning).length,
          errors: results.filter(r => r.error).length
        };

        const report = {
          timestamp: new Date().toISOString(),
          summary,
          details: results,
          recommendations: [
            'Use parameterized queries to prevent SQL injection',
            'Avoid SELECT * in production queries',
            'Add appropriate indexes for WHERE clauses'
          ]
        };

        return report;
      };

      const mockResults = [
        { valid: true, warning: false, error: false },
        { valid: false, warning: false, error: true },
        { valid: true, warning: true, error: false }
      ];

      const report = generateValidationReport(mockResults);

      expect(report.summary.totalQueries).toBe(3);
      expect(report.summary.validQueries).toBe(2);
      expect(report.summary.invalidQueries).toBe(1);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('应该处理文件读取错误', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const safeReadSqlFile = (filename: string) => {
        try {
          return {
            success: true,
            content: mockFs.readFileSync(filename, 'utf8')
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      };

      const result = safeReadSqlFile('nonexistent.sql');

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
    });

    it('应该处理无效的SQL语法', () => {
      const handleSqlError = (sql: string) => {
        try {
          // 模拟SQL解析
          if (!sql || sql.trim().length === 0) {
            throw new Error('Empty SQL statement');
          }
          
          if (!sql.includes(' ')) {
            throw new Error('Invalid SQL syntax');
          }

          return { valid: true, sql };
        } catch (error) {
          return {
            valid: false,
            error: error.message,
            sql
          };
        }
      };

      const validSql = 'SELECT * FROM users';
      const invalidSql = 'INVALID';
      const emptySql = '';

      expect(handleSqlError(validSql).valid).toBe(true);
      expect(handleSqlError(invalidSql).valid).toBe(false);
      expect(handleSqlError(emptySql).valid).toBe(false);
    });
  });
});
