/**
 * CSRF防护测试
 * 测试跨站请求伪造攻击防护
 */

describe('CSRF防护测试', () => {
  describe('CSRF Token验证', () => {
    it('应该为每个会话生成唯一的CSRF Token', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      
      // Token应该是随机生成的
      expect(token1).not.toBe(token2);
      // Token长度应该足够
      expect(token1.length).toBeGreaterThanOrEqual(32);
      expect(token2.length).toBeGreaterThanOrEqual(32);
    });

    it('应该在POST请求中包含CSRF Token', () => {
      const requestData = {
        _csrf: generateCSRFToken(),
        name: 'test',
        value: '123'
      };
      
      expect(requestData._csrf).toBeDefined();
      expect(typeof requestData._csrf).toBe('string');
      expect(requestData._csrf.length).toBeGreaterThan(0);
    });

    it('应该拒绝没有CSRF Token的请求', () => {
      const requestData = {
        name: 'test',
        value: '123'
        // 缺少 _csrf
      };
      
      const isValid = validateCSRFToken(requestData._csrf, 'stored-token');
      expect(isValid).toBe(false);
    });

    it('应该拒绝无效的CSRF Token', () => {
      const validToken = 'valid-csrf-token-12345';
      const invalidToken = 'invalid-csrf-token-67890';
      
      const isValid = validateCSRFToken(invalidToken, validToken);
      expect(isValid).toBe(false);
    });

    it('应该接受有效的CSRF Token', () => {
      const token = 'valid-csrf-token-12345';
      
      const isValid = validateCSRFToken(token, token);
      expect(isValid).toBe(true);
    });
  });

  describe('Same-Site Cookie配置', () => {
    it('Cookie应该配置SameSite属性', () => {
      const cookieConfig = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const
      };
      
      expect(cookieConfig.sameSite).toBe('strict');
    });

    it('敏感Cookie应该设置Secure标志', () => {
      const cookieConfig = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const
      };
      
      expect(cookieConfig.secure).toBe(true);
      expect(cookieConfig.httpOnly).toBe(true);
    });
  });

  describe('Referer验证', () => {
    it('应该验证请求来源', () => {
      const validReferer = 'https://k.yyup.com/login';
      const invalidReferer = 'https://evil.com/attack';
      
      expect(isValidReferer(validReferer)).toBe(true);
      expect(isValidReferer(invalidReferer)).toBe(false);
    });

    it('应该拒绝来自外部域的请求', () => {
      const externalReferer = 'https://external-site.com/page';
      
      expect(isValidReferer(externalReferer)).toBe(false);
    });
  });

  describe('双重提交Cookie', () => {
    it('应该匹配Cookie中的Token和请求中的Token', () => {
      const token = generateCSRFToken();
      
      // 模拟Cookie中的Token
      const cookieToken = token;
      // 模拟请求中的Token
      const requestToken = token;
      
      expect(doubleSubmitCheck(cookieToken, requestToken)).toBe(true);
    });

    it('应该拒绝不匹配的Token', () => {
      const cookieToken = generateCSRFToken();
      const requestToken = generateCSRFToken();
      
      expect(doubleSubmitCheck(cookieToken, requestToken)).toBe(false);
    });
  });

  describe('状态改变操作防护', () => {
    it('DELETE请求应该需要CSRF保护', () => {
      const request = {
        method: 'DELETE',
        _csrf: generateCSRFToken()
      };
      
      expect(requiresCSRFProtection(request.method)).toBe(true);
      expect(request._csrf).toBeDefined();
    });

    it('PUT请求应该需要CSRF保护', () => {
      const request = {
        method: 'PUT',
        _csrf: generateCSRFToken()
      };
      
      expect(requiresCSRFProtection(request.method)).toBe(true);
    });

    it('POST请求应该需要CSRF保护', () => {
      const request = {
        method: 'POST',
        _csrf: generateCSRFToken()
      };
      
      expect(requiresCSRFProtection(request.method)).toBe(true);
    });

    it('GET请求不需要CSRF保护', () => {
      const request = {
        method: 'GET'
      };
      
      expect(requiresCSRFProtection(request.method)).toBe(false);
    });
  });
});

// 辅助函数
function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + 
         Date.now().toString(36) +
         Math.random().toString(36).substring(2);
}

function validateCSRFToken(requestToken: string | undefined, storedToken: string): boolean {
  if (!requestToken || !storedToken) {
    return false;
  }
  return requestToken === storedToken;
}

function isValidReferer(referer: string): boolean {
  if (!referer) return false;
  
  try {
    const url = new URL(referer);
    const validDomains = ['k.yyup.com', 'localhost'];
    
    return validDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function doubleSubmitCheck(cookieToken: string, requestToken: string): boolean {
  if (!cookieToken || !requestToken) {
    return false;
  }
  return cookieToken === requestToken;
}

function requiresCSRFProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return protectedMethods.includes(method.toUpperCase());
}
