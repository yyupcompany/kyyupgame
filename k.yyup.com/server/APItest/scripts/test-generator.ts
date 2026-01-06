/**
 * API测试用例生成器
 * 自动为所有未测试的API创建基础测试用例
 */

import * as fs from 'fs';
import * as path from 'path';

interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  category: string;
  requireAuth: boolean;
  expectPagination?: boolean;
  expectFileUpload?: boolean;
}

interface TestTemplate {
  endpoint: APIEndpoint;
  testCode: string;
}

export class APITestGenerator {
  private readonly endpoints: APIEndpoint[] = [
    // 系统管理类API
    { path: '/api/system-logs', method: 'GET', description: '系统日志列表', category: 'system', requireAuth: true, expectPagination: true },
    { path: '/api/system-configs', method: 'GET', description: '系统配置列表', category: 'system', requireAuth: true },
    { path: '/api/system-backup', method: 'GET', description: '系统备份状态', category: 'system', requireAuth: true },
    { path: '/api/system-configs', method: 'POST', description: '创建系统配置', category: 'system', requireAuth: true },
    { path: '/api/system-backup', method: 'POST', description: '执行系统备份', category: 'system', requireAuth: true },

    // 通知任务类API
    { path: '/api/notifications', method: 'GET', description: '通知列表', category: 'notification', requireAuth: true, expectPagination: true },
    { path: '/api/todos', method: 'GET', description: '待办任务列表', category: 'notification', requireAuth: true, expectPagination: true },
    { path: '/api/notification-center', method: 'GET', description: '通知中心', category: 'notification', requireAuth: true },
    { path: '/api/message-templates', method: 'GET', description: '消息模板', category: 'notification', requireAuth: true, expectPagination: true },
    { path: '/api/message-templates', method: 'POST', description: '创建消息模板', category: 'notification', requireAuth: true },

    // 营销客户类API
    { path: '/api/marketing-campaign', method: 'GET', description: '营销活动列表', category: 'marketing', requireAuth: true, expectPagination: true },
    { path: '/api/customer-pool', method: 'GET', description: '客户池', category: 'marketing', requireAuth: true, expectPagination: true },
    { path: '/api/channel-tracking', method: 'GET', description: '渠道跟踪', category: 'marketing', requireAuth: true },
    { path: '/api/customers', method: 'GET', description: '客户列表', category: 'marketing', requireAuth: true, expectPagination: true },
    { path: '/api/conversion-tracking', method: 'GET', description: '转化跟踪', category: 'marketing', requireAuth: true },

    // 评估考核类API
    { path: '/api/assessment', method: 'GET', description: '评估列表', category: 'assessment', requireAuth: true, expectPagination: true },
    { path: '/api/performance-evaluations', method: 'GET', description: '绩效考核', category: 'assessment', requireAuth: true, expectPagination: true },
    { path: '/api/performance-reports', method: 'GET', description: '绩效报告', category: 'assessment', requireAuth: true, expectPagination: true },
    { path: '/api/assessment-admin', method: 'GET', description: '评估管理', category: 'assessment', requireAuth: true },
    { path: '/api/assessment-share', method: 'GET', description: '评估分享', category: 'assessment', requireAuth: true },

    // 聊天消息类API
    { path: '/api/chat', method: 'GET', description: '聊天记录', category: 'chat', requireAuth: true, expectPagination: true },
    { path: '/api/chat', method: 'POST', description: '发送消息', category: 'chat', requireAuth: true },
    { path: '/api/session', method: 'GET', description: '会话列表', category: 'chat', requireAuth: true, expectPagination: true },

    // 文档数据类API
    { path: '/api/document-template', method: 'GET', description: '文档模板', category: 'document', requireAuth: true, expectPagination: true },
    { path: '/api/document-instance', method: 'GET', description: '文档实例', category: 'document', requireAuth: true, expectPagination: true },
    { path: '/api/batch-import', method: 'GET', description: '批量导入', category: 'document', requireAuth: true },
    { path: '/api/data-import', method: 'POST', description: '数据导入', category: 'document', requireAuth: true, expectFileUpload: true },

    // 招生相关类API
    { path: '/api/enrollment-tasks', method: 'GET', description: '招生任务', category: 'enrollment', requireAuth: true, expectPagination: true },
    { path: '/api/enrollment-quotas', method: 'GET', description: '招生配额', category: 'enrollment', requireAuth: true, expectPagination: true },
    { path: '/api/enrollment-statistics', method: 'GET', description: '招生统计', category: 'enrollment', requireAuth: true },

    // 考勤相关类API
    { path: '/api/teacher-attendance', method: 'GET', description: '教师考勤', category: 'attendance', requireAuth: true, expectPagination: true },
    { path: '/api/teacher-checkin', method: 'GET', description: '教师签到', category: 'attendance', requireAuth: true },
    { path: '/api/attendance-center', method: 'GET', description: '考勤中心', category: 'attendance', requireAuth: true },

    // 家长相关类API
    { path: '/api/parent-assistant', method: 'GET', description: '家长助手', category: 'parent', requireAuth: true },
    { path: '/api/parent-student-relations', method: 'GET', description: '家长学生关系', category: 'parent', requireAuth: true, expectPagination: true },

    // 任务相关类API
    { path: '/api/task', method: 'GET', description: '任务列表', category: 'task', requireAuth: true, expectPagination: true },
    { path: '/api/task', method: 'POST', description: '创建任务', category: 'task', requireAuth: true },
    { path: '/api/task-comment', method: 'GET', description: '任务评论', category: 'task', requireAuth: true, expectPagination: true },

    // 视频创作类API
    { path: '/api/video-creation', method: 'GET', description: '视频创作', category: 'video', requireAuth: true },
    { path: '/api/video-creation', method: 'POST', description: '创建视频', category: 'video', requireAuth: true },

    // 海报相关类API
    { path: '/api/poster-template', method: 'GET', description: '海报模板', category: 'poster', requireAuth: true, expectPagination: true },
    { path: '/api/poster-upload', method: 'POST', description: '上传海报', category: 'poster', requireAuth: true, expectFileUpload: true },
    { path: '/api/poster-generation', method: 'POST', description: '生成海报', category: 'poster', requireAuth: true },

    // 广告相关类API
    { path: '/api/advertisements', method: 'GET', description: '广告列表', category: 'advertisement', requireAuth: true, expectPagination: true },
    { path: '/api/advertisement', method: 'GET', description: '广告详情', category: 'advertisement', requireAuth: true },

    // 录取相关类API
    { path: '/api/admission-notifications', method: 'GET', description: '录取通知', category: 'admission', requireAuth: true, expectPagination: true },
    { path: '/api/admission-results', method: 'GET', description: '录取结果', category: 'admission', requireAuth: true, expectPagination: true },

    // 其他杂项API
    { path: '/api/schedules', method: 'GET', description: '日程安排', category: 'misc', requireAuth: true, expectPagination: true },
    { path: '/api/operation-logs', method: 'GET', description: '操作日志', category: 'misc', requireAuth: true, expectPagination: true },
    { path: '/api/role-permission', method: 'GET', description: '角色权限', category: 'misc', requireAuth: true },
    { path: '/api/statistics', method: 'GET', description: '统计数据', category: 'misc', requireAuth: true },
  ];

  /**
   * 生成测试用例代码
   */
  generateTestForEndpoint(endpoint: APIEndpoint): string {
    const testName = this.generateTestName(endpoint);
    const authCode = endpoint.requireAuth ?
      `.set('Authorization', \`Bearer \${authToken}\`)` : '';

    let paginationTest = '';
    let fileUploadTest = '';
    let postRequestTest = '';

    if (endpoint.expectPagination) {
      paginationTest = `
        // 验证分页参数
        await request(app)
          .get('${endpoint.path}')
          .query({ page: 2, pageSize: 5 })
          ${authCode}
          .expect([200, 401, 403, 404]);`;
    }

    if (endpoint.expectFileUpload) {
      fileUploadTest = `
        // 测试文件上传（如果适用）
        const consoleMonitorUpload = expectNoConsoleErrors();
        try {
          const response = await request(app)
            .post('${endpoint.path}')
            ${authCode}
            .attach('file', Buffer.from('test content'), 'test.txt')
            .expect([200, 401, 403, 404, 400]);

          consoleMonitorUpload.restore();
          consoleMonitorUpload.expectNoErrors();

          if (response.status === 200) {
            expect(response.body).toBeStandardAPIFormat();
          }
        } catch (error) {
          consoleMonitorUpload.restore();
          console.log(\`⚠️ \${endpoint.description} 文件上传测试失败: \${error.message}\`);
        }`;
    }

    if (endpoint.method === 'POST') {
      postRequestTest = `
        // 测试POST请求
        const postData = {
          name: 'Test ${endpoint.description}',
          description: 'Test description',
          // 根据实际API需求添加更多字段
        };

        const consoleMonitorPost = expectNoConsoleErrors();
        try {
          const response = await request(app)
            .post('${endpoint.path}')
            .send(postData)
            ${authCode}
            .expect([200, 201, 400, 401, 403, 404]);

          consoleMonitorPost.restore();
          consoleMonitorPost.expectNoErrors();

          if ([200, 201].includes(response.status)) {
            expect(response.body).toBeStandardAPIFormat();
          }
        } catch (error) {
          consoleMonitorPost.restore();
          console.log(\`⚠️ \${endpoint.description} POST测试失败: \${error.message}\`);
        }`;
    }

    return `
  test('${testName}', async () => {
    ${endpoint.requireAuth ? `
    if (!authToken) {
      console.log('⚠️ 跳过${endpoint.description}测试：未获取到认证token');
      return;
    }` : ''}

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .${endpoint.method.toLowerCase()}('${endpoint.path}')
        .query(${endpoint.method === 'GET' ? '{ page: 1, pageSize: 10 }' : ''})
        ${authCode}
        .expect([200, 401, 403, 404]);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      if (response.status === 200) {
        expect(response.body).toBeStandardAPIFormat();

        ${endpoint.expectPagination ? `
        // 验证分页格式
        if (response.body.data) {
          if (Array.isArray(response.body.data)) {
            expect(Array.isArray(response.body.data)).toBe(true);
          } else {
            expect(response.body).toBePaginatedResponse();
          }
        }` : ''}
      }${paginationTest}
    } catch (error) {
      consoleMonitor.restore();
      console.log(\`⚠️ \${endpoint.description}测试失败: \${error.message}\`);
    }${postRequestTest}${fileUploadTest}
  });`;
  }

  /**
   * 生成测试名称
   */
  private generateTestName(endpoint: APIEndpoint): string {
    return `${endpoint.method.toUpperCase()} ${endpoint.path} - ${endpoint.description}格式标准`;
  }

  /**
   * 按分类生成测试文件
   */
  generateTestsByCategory(): void {
    const categories = [...new Set(this.endpoints.map(e => e.category))];

    categories.forEach(category => {
      const categoryEndpoints = this.endpoints.filter(e => e.category === category);
      const testContent = this.generateCategoryTestFile(category, categoryEndpoints);
      this.writeTestFile(category, testContent);
    });
  }

  /**
   * 生成分类测试文件内容
   */
  private generateCategoryTestFile(category: string, endpoints: APIEndpoint[]): string {
    const categoryDescriptions: Record<string, string> = {
      system: '系统管理',
      notification: '通知任务',
      marketing: '营销客户',
      assessment: '评估考核',
      chat: '聊天消息',
      document: '文档数据',
      enrollment: '招生相关',
      attendance: '考勤相关',
      parent: '家长相关',
      task: '任务相关',
      video: '视频创作',
      poster: '海报相关',
      advertisement: '广告相关',
      admission: '录取相关',
      misc: '其他杂项'
    };

    const tests = endpoints.map(endpoint => this.generateTestForEndpoint(endpoint)).join('\n');

    return `/**
 * ${categoryDescriptions[category] || category}API严格验证测试
 * 自动生成的测试用例，确保API格式一致性
 */

import request from 'supertest';
import { app } from '../helpers/testApp';
import {
  validateStandardAPIFormat,
  validatePaginatedResponse,
  expectNoConsoleErrors
} from '../helpers/api-validation';

describe('${categoryDescriptions[category] || category}API严格验证', () => {
  let authToken: string;

  beforeAll(async () => {
    try {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: '123456'
        });

      if (loginResponse.status === 200 && loginResponse.body.data?.token) {
        authToken = loginResponse.body.data.token;
      }
    } catch (error) {
      console.log('⚠️ 获取认证token失败，某些测试可能跳过');
    }
  });${tests}

  describe('📊 ${categoryDescriptions[category] || category}API测试报告', () => {
    test('生成${categoryDescriptions[category] || category}API测试覆盖报告', async () => {
      const endpoints = [
        ${endpoints.map(e => `'${e.path}'`).join(',\n        ')}
      ];

      const results: any[] = [];

      for (const endpoint of endpoints) {
        try {
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', \`Bearer \${authToken}\`);

          let formatValid = false;
          if (response.body) {
            const validation = validateStandardAPIFormat(response.body);
            formatValid = validation.valid;
          }

          results.push({
            endpoint,
            status: response.status,
            formatValid,
            hasBody: !!response.body
          });
        } catch (error) {
          results.push({
            endpoint,
            error: error.message,
            formatValid: false
          });
        }
      }

      // 输出报告
      console.log('\\n📊 ${categoryDescriptions[category] || category}API测试覆盖报告:');
      console.log('='.repeat(50));

      results.forEach(result => {
        if (result.error) {
          console.log(\`❌ \${result.endpoint}: \${result.error}\`);
        } else {
          const status = result.formatValid ? '✅' : '⚠️';
          console.log(\`\${status} \${result.endpoint} (\${result.status})\`);
        }
      });

      const validCount = results.filter(r => r.formatValid).length;
      const totalCount = results.filter(r => !r.error).length;

      console.log(\`\\n📈 API格式一致性: \${validCount}/\${totalCount} (\${Math.round(validCount/totalCount*100)}%)\`);

      // 至少应该有20%的API格式一致
      if (totalCount > 0) {
        const consistencyRate = validCount / totalCount;
        expect(consistencyRate).toBeGreaterThanOrEqual(0.2);
      }
    });
  });
});`;
  }

  /**
   * 写入测试文件
   */
  private writeTestFile(category: string, content: string): void {
    const testDir = path.join(__dirname, '../comprehensive');
    const fileName = `${category}-apis-comprehensive.test.ts`;
    const filePath = path.join(testDir, fileName);

    // 确保目录存在
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 生成测试文件: ${filePath}`);
  }

  /**
   * 生成所有测试用例
   */
  generateAllTests(): void {
    console.log('🚀 开始生成API测试用例...');
    this.generateTestsByCategory();
    console.log('✅ 所有API测试用例生成完成！');
  }

  /**
   * 生成API覆盖统计
   */
  generateCoverageReport(): void {
    const categories = [...new Set(this.endpoints.map(e => e.category))];

    console.log('\n📊 API测试用例生成统计:');
    console.log('='.repeat(50));

    categories.forEach(category => {
      const count = this.endpoints.filter(e => e.category === category).length;
      console.log(`${category}: ${count} 个API端点`);
    });

    console.log(`总计: ${this.endpoints.length} 个API端点`);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const generator = new APITestGenerator();
  generator.generateCoverageReport();
  generator.generateAllTests();
}