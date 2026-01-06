/**
 * 404错误检测测试
 * 
 * 测试控制台监控系统是否能正确检测404和其他HTTP错误
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  setupConsoleMonitoring,
  getNetworkErrors,
  has404Errors,
  get404Errors,
  hasHttpErrors,
  clearNetworkErrors,
  expectNo404Errors,
  expectNoHttpErrors
} from '../../setup/console-monitoring';

// 设置控制台监控
setupConsoleMonitoring();

describe('404错误检测', () => {
  beforeEach(() => {
    clearNetworkErrors();
  });

  it('应该检测到404错误', () => {
    // 模拟404错误
    console.error('Failed to load resource: http://localhost:3000/api/not-found 404 Not Found');
    
    // 验证检测到404错误
    expect(has404Errors()).toBe(true);
    expect(get404Errors().length).toBeGreaterThan(0);
    
    const errors = get404Errors();
    expect(errors[0].status).toBe(404);
    expect(errors[0].statusText).toBe('Not Found');
  });

  it('应该检测到多个404错误', () => {
    // 模拟多个404错误
    console.error('404 Not Found: http://localhost:3000/api/endpoint1');
    console.error('404 Not Found: http://localhost:3000/api/endpoint2');
    console.error('404 Not Found: http://localhost:3000/api/endpoint3');
    
    // 验证检测到所有404错误
    const errors = get404Errors();
    expect(errors.length).toBe(3);
  });

  it('应该检测到其他HTTP错误（500）', () => {
    // 模拟500错误
    console.error('500 Internal Server Error: http://localhost:3000/api/error');
    
    // 验证检测到HTTP错误
    expect(hasHttpErrors()).toBe(true);
    
    const errors = getNetworkErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].status).toBe(500);
  });

  it('应该检测到其他HTTP错误（403）', () => {
    // 模拟403错误
    console.error('403 Forbidden: http://localhost:3000/api/forbidden');
    
    // 验证检测到HTTP错误
    expect(hasHttpErrors()).toBe(true);
    
    const errors = getNetworkErrors();
    expect(errors[0].status).toBe(403);
    expect(errors[0].statusText).toBe('Forbidden');
  });

  it('应该能清除网络错误记录', () => {
    // 模拟404错误
    console.error('404 Not Found: http://localhost:3000/api/test');
    
    // 验证有错误
    expect(has404Errors()).toBe(true);
    
    // 清除错误
    clearNetworkErrors();
    
    // 验证错误已清除
    expect(has404Errors()).toBe(false);
    expect(getNetworkErrors().length).toBe(0);
  });

  it('expectNo404Errors 应该在有404错误时抛出异常', () => {
    // 模拟404错误
    console.error('404 Not Found: http://localhost:3000/api/test');
    
    // 验证会抛出异常
    expect(() => expectNo404Errors()).toThrow('Found 1 404 errors');
  });

  it('expectNoHttpErrors 应该在有HTTP错误时抛出异常', () => {
    // 模拟HTTP错误
    console.error('500 Internal Server Error: http://localhost:3000/api/error');
    
    // 验证会抛出异常
    expect(() => expectNoHttpErrors()).toThrow('Found 1 HTTP errors');
  });

  it('应该不检测非HTTP错误', () => {
    // 模拟普通错误（不是HTTP错误）
    console.error('This is a regular error message');
    
    // 验证没有检测到HTTP错误
    expect(hasHttpErrors()).toBe(false);
    expect(getNetworkErrors().length).toBe(0);
  });

  it('应该检测URL中的404', () => {
    // 模拟包含URL的404错误
    console.error('Request failed: GET http://localhost:3000/api/users/999 returned 404');
    
    // 验证检测到404错误
    expect(has404Errors()).toBe(true);
    
    const errors = get404Errors();
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('实际API调用404检测', () => {
  beforeEach(() => {
    clearNetworkErrors();
  });

  it('应该检测到API调用的404错误', async () => {
    // 模拟API调用失败
    try {
      // 这会触发404错误
      await fetch('http://localhost:3000/api/non-existent-endpoint');
    } catch (error) {
      console.error('API call failed:', error);
    }
    
    // 注意：实际的fetch 404不会触发catch，需要检查response.ok
    // 这里只是演示如何检测控制台中的404错误
  });
});

describe('网络错误统计', () => {
  beforeEach(() => {
    clearNetworkErrors();
  });

  it('应该正确统计不同类型的HTTP错误', () => {
    // 模拟不同类型的错误
    console.error('400 Bad Request: http://localhost:3000/api/bad');
    console.error('401 Unauthorized: http://localhost:3000/api/auth');
    console.error('403 Forbidden: http://localhost:3000/api/forbidden');
    console.error('404 Not Found: http://localhost:3000/api/notfound');
    console.error('500 Internal Server Error: http://localhost:3000/api/error');
    console.error('503 Service Unavailable: http://localhost:3000/api/unavailable');
    
    // 验证所有错误都被检测到
    const allErrors = getNetworkErrors();
    expect(allErrors.length).toBe(6);
    
    // 验证404错误
    const errors404 = get404Errors();
    expect(errors404.length).toBe(1);
    
    // 验证4xx错误
    const errors4xx = allErrors.filter(err => err.status >= 400 && err.status < 500);
    expect(errors4xx.length).toBe(4);
    
    // 验证5xx错误
    const errors5xx = allErrors.filter(err => err.status >= 500);
    expect(errors5xx.length).toBe(2);
  });

  it('应该提供详细的错误信息', () => {
    // 模拟404错误
    console.error('404 Not Found: http://localhost:3000/api/users/123');
    
    const errors = get404Errors();
    expect(errors[0]).toMatchObject({
      status: 404,
      statusText: 'Not Found'
    });
    expect(errors[0].url).toContain('http://localhost:3000/api/users/123');
  });
});

describe('404错误检测使用示例', () => {
  beforeEach(() => {
    clearNetworkErrors();
  });

  it('示例：在测试中检查是否有404错误', () => {
    // 执行一些可能产生404的操作
    // ...
    
    // 在测试结束时检查是否有404错误
    if (has404Errors()) {
      const errors = get404Errors();
      console.log('发现404错误：', errors);
      
      // 可以选择让测试失败
      // expect(errors.length).toBe(0);
    }
  });

  it('示例：允许特定的404错误', () => {
    // 有时候404是预期的（比如测试删除功能）
    console.error('404 Not Found: http://localhost:3000/api/deleted-resource');
    
    // 清除这个预期的404错误
    clearNetworkErrors();
    
    // 验证没有其他404错误
    expectNo404Errors();
  });

  it('示例：在afterEach中检查404错误', () => {
    // 这个测试不应该产生404错误
    // 在afterEach中可以统一检查
    
    // 执行测试逻辑...
    
    // 验证没有404错误
    expectNo404Errors();
  });
});

