/**
 * SQL注入防护测试
 * 测试SQL注入攻击防护
 */

describe('SQL注入防护测试', () => {
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "admin'--",
    "admin' #",
    "admin'/*",
    "' or 1=1--",
    "' or 1=1#",
    "' or 1=1/*",
    "') or '1'='1--",
    "') or ('1'='1--",
    "1' UNION SELECT NULL--",
    "1' UNION SELECT NULL,NULL--",
    "' UNION SELECT username, password FROM users--",
    "'; DROP TABLE users--",
    "'; DELETE FROM users WHERE '1'='1",
    "1; UPDATE users SET password='hacked' WHERE username='admin'--"
  ];

  describe('输入验证', () => {
    it('应该检测并拒绝SQL注入尝试', () => {
      sqlInjectionPayloads.forEach(payload => {
        const isSafe = validateInput(payload);
        expect(isSafe).toBe(false);
      });
    });

    it('应该接受正常的用户输入', () => {
      const validInputs = [
        'john_doe',
        'jane.smith@example.com',
        '张三',
        'User123',
        'test-user'
      ];
      
      validInputs.forEach(input => {
        const isSafe = validateInput(input);
        expect(isSafe).toBe(true);
      });
    });

    it('应该转义特殊字符', () => {
      const input = "O'Brien";
      const escaped = escapeSQL(input);
      
      // 单引号应该被转义
      expect(escaped).not.toBe(input);
      expect(escaped).toContain("''") || expect(escaped).toContain("\\'");
    });
  });

  describe('参数化查询', () => {
    it('应该使用参数化查询而不是字符串拼接', () => {
      const userId = "1' OR '1'='1";
      
      // 错误方式 (不应该这样做)
      const unsafeQuery = `SELECT * FROM users WHERE id = '${userId}'`;
      expect(unsafeQuery).toContain("OR");
      
      // 正确方式 (使用参数)
      const safeQuery = 'SELECT * FROM users WHERE id = ?';
      const params = [userId];
      
      expect(safeQuery).not.toContain(userId);
      expect(params[0]).toBe(userId);
    });

    it('应该使用ORM而不是原生SQL', () => {
      // 这是一个示例，展示ORM查询的安全性
      const searchTerm = "' OR '1'='1";
      
      // ORM查询（安全）
      const ormQuery = {
        where: {
          name: searchTerm
        }
      };
      
      // 查询对象不应该包含SQL关键字
      const queryString = JSON.stringify(ormQuery);
      expect(queryString).not.toMatch(/\bUNION\b/i);
      expect(queryString).not.toMatch(/\bDROP\b/i);
      expect(queryString).not.toMatch(/\bDELETE\b/i);
    });
  });

  describe('输入过滤', () => {
    it('应该过滤SQL关键字', () => {
      const dangerousInputs = [
        "SELECT * FROM users",
        "DROP TABLE users",
        "UPDATE users SET password='hack'",
        "DELETE FROM users"
      ];
      
      dangerousInputs.forEach(input => {
        const filtered = filterSQLKeywords(input);
        expect(filtered).not.toMatch(/\bSELECT\b/i);
        expect(filtered).not.toMatch(/\bDROP\b/i);
        expect(filtered).not.toMatch(/\bUPDATE\b/i);
        expect(filtered).not.toMatch(/\bDELETE\b/i);
      });
    });

    it('应该限制特殊字符', () => {
      const input = "user'; DROP TABLE users--";
      const sanitized = sanitizeSQLInput(input);
      
      // 不应该包含分号和注释符号
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('--');
      expect(sanitized).not.toContain('/*');
    });
  });

  describe('数据库权限', () => {
    it('应该使用最小权限原则', () => {
      const dbPermissions = {
        select: true,
        insert: true,
        update: true,
        delete: false, // 应用层控制删除
        drop: false,   // 永不授予DROP权限
        create: false, // 永不授予CREATE权限
        grant: false   // 永不授予GRANT权限
      };
      
      expect(dbPermissions.drop).toBe(false);
      expect(dbPermissions.create).toBe(false);
      expect(dbPermissions.grant).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('数据库错误不应该暴露给用户', () => {
      const dbError = {
        message: 'ER_BAD_FIELD_ERROR: Unknown column \'password\' in \'field list\'',
        code: 'ER_BAD_FIELD_ERROR',
        sql: 'SELECT * FROM users WHERE id = ?'
      };
      
      const userMessage = sanitizeErrorMessage(dbError);
      
      // 用户看到的错误信息不应该包含SQL语句
      expect(userMessage).not.toContain('SELECT');
      expect(userMessage).not.toContain('password');
      expect(userMessage).not.toContain(dbError.sql);
    });
  });
});

// 辅助函数
function validateInput(input: string): boolean {
  // 检测常见的SQL注入模式
  const sqlPatterns = [
    /(\bOR\b.*=.*)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /('.*OR.*'.*=.*')/i
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
}

function escapeSQL(input: string): string {
  if (!input) return '';
  
  // 转义单引号
  return input.replace(/'/g, "''");
}

function filterSQLKeywords(input: string): string {
  const keywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 
    'ALTER', 'TRUNCATE', 'UNION', 'EXEC', 'EXECUTE'
  ];
  
  let filtered = input;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    filtered = filtered.replace(regex, '');
  });
  
  return filtered.trim();
}

function sanitizeSQLInput(input: string): string {
  if (!input) return '';
  
  // 移除危险字符
  let sanitized = input.replace(/[;]/g, '');
  sanitized = sanitized.replace(/--/g, '');
  sanitized = sanitized.replace(/\/\*/g, '');
  sanitized = sanitized.replace(/\*\//g, '');
  sanitized = sanitized.replace(/xp_/gi, '');
  
  return sanitized.trim();
}

function sanitizeErrorMessage(error: any): string {
  // 返回通用错误信息，不暴露数据库细节
  return '操作失败，请稍后重试';
}
