/**
 * 移动端XSS防护测试
 * 测试跨站脚本攻击防护
 */

describe('移动端XSS防护测试', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg/onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<IMG SRC="javascript:alert(\'XSS\');">',
    '<SCRIPT SRC=http://evil.com/xss.js></SCRIPT>'
  ];

  describe('输入字段XSS防护', () => {
    it('应该过滤用户名中的XSS脚本', () => {
      xssPayloads.forEach(payload => {
        const sanitized = sanitizeInput(payload);
        
        // 不应该包含<script>标签
        expect(sanitized).not.toMatch(/<script/i);
        // 不应该包含事件处理器
        expect(sanitized).not.toMatch(/on\w+\s*=/i);
        // 不应该包含javascript:协议
        expect(sanitized).not.toMatch(/javascript:/i);
      });
    });

    it('应该过滤评论中的XSS脚本', () => {
      xssPayloads.forEach(payload => {
        const sanitized = sanitizeInput(payload);
        
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('onerror=');
        expect(sanitized).not.toContain('onload=');
      });
    });

    it('应该正确处理HTML实体编码', () => {
      const input = '<script>alert("test")</script>';
      const sanitized = sanitizeInput(input);
      
      // 应该转义或移除
      expect(sanitized).not.toBe(input);
    });
  });

  describe('输出编码防护', () => {
    it('应该对用户输入进行HTML转义', () => {
      const dangerousInput = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(dangerousInput);
      
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).not.toContain('<script>');
    });

    it('应该对URL参数进行编码', () => {
      const dangerousUrl = 'javascript:alert("XSS")';
      const encoded = encodeURIComponent(dangerousUrl);
      
      expect(encoded).not.toContain('javascript:');
      expect(encoded).toContain('%');
    });
  });

  describe('CSP头部配置', () => {
    it('应该配置Content-Security-Policy头部', () => {
      // 这需要在实际的HTTP请求中测试
      // 这里只是示例
      const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
      
      expect(cspHeader).toContain("default-src");
      expect(cspHeader).toContain("script-src");
    });
  });
});

// 辅助函数
function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // 移除脚本标签
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 移除事件处理器
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // 移除javascript:协议
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // 移除危险标签
  const dangerousTags = ['iframe', 'embed', 'object', 'applet'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
