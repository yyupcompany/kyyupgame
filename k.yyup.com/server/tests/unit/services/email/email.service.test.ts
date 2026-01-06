import { jest } from '@jest/globals';
import { vi } from 'vitest'
import nodemailer from 'nodemailer';

// Mock nodemailer
const mockTransporter = {
  sendMail: jest.fn(),
  verify: jest.fn(),
  close: jest.fn()
};

const mockNodemailer = {
  createTransporter: jest.fn().mockReturnValue(mockTransporter),
  createTestAccount: jest.fn(),
  getTestMessageUrl: jest.fn()
};

// Mock template engine
const mockTemplateEngine = {
  render: jest.fn(),
  compile: jest.fn(),
  registerHelper: jest.fn(),
  registerPartial: jest.fn()
};

// Mock file system
const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn()
};

// Mock configuration service
const mockConfigService = {
  get: jest.fn(),
  set: jest.fn()
};

// Mock logger service
const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Mock queue service
const mockQueueService = {
  add: jest.fn(),
  process: jest.fn(),
  getJob: jest.fn(),
  removeJob: jest.fn()
};

// Mock storage service
const mockStorageService = {
  upload: jest.fn(),
  download: jest.fn(),
  delete: jest.fn(),
  getUrl: jest.fn()
};

// Mock imports
jest.unstable_mockModule('nodemailer', () => mockNodemailer);
jest.unstable_mockModule('handlebars', () => mockTemplateEngine);
jest.unstable_mockModule('fs/promises', () => mockFs);
jest.unstable_mockModule('../../../../../src/services/config.service', () => mockConfigService);
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/queue.service', () => mockQueueService);
jest.unstable_mockModule('../../../../../src/services/storage.service', () => mockStorageService);


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

describe('Email Service', () => {
  let emailService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/email/email.service');
    emailService = imported.EmailService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key) => {
      const config = {
        'email.enabled': true,
        'email.provider': 'smtp',
        'email.smtp.host': 'smtp.example.com',
        'email.smtp.port': 587,
        'email.smtp.secure': false,
        'email.smtp.auth.user': 'test@example.com',
        'email.smtp.auth.pass': 'password123',
        'email.from.name': '幼儿园管理系统',
        'email.from.address': 'noreply@kindergarten.com',
        'email.templates.path': '/templates/email',
        'email.queue.enabled': true,
        'email.queue.concurrency': 5,
        'email.retry.attempts': 3,
        'email.retry.delay': 5000,
        'email.attachments.maxSize': 10 * 1024 * 1024, // 10MB
        'email.attachments.allowedTypes': ['pdf', 'doc', 'docx', 'jpg', 'png'],
        'email.rateLimit.enabled': true,
        'email.rateLimit.maxPerHour': 100,
        'email.tracking.enabled': true,
        'email.unsubscribe.enabled': true
      };
      return config[key];
    });

    mockTransporter.verify.mockResolvedValue(undefined);
    mockTransporter.sendMail.mockResolvedValue({
      messageId: 'test-message-id',
      response: '250 OK',
      accepted: ['recipient@example.com'],
      rejected: [],
      pending: []
    });

    mockTemplateEngine.render.mockResolvedValue('<html><body>Test Email</body></html>');
    mockFs.readFile.mockResolvedValue('Template content');
  });

  describe('初始化', () => {
    it('应该正确初始化邮件服务', async () => {
      await emailService.initialize();

      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password123'
        }
      });

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith('邮件服务初始化成功');
    });

    it('应该处理SMTP连接失败', async () => {
      const error = new Error('SMTP连接失败');
      mockTransporter.verify.mockRejectedValue(error);

      await expect(emailService.initialize()).rejects.toThrow('SMTP连接失败');

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '邮件服务初始化失败',
        expect.objectContaining({
          error: error.message
        })
      );
    });

    it('应该支持不同的邮件提供商', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'email.provider') return 'gmail';
        if (key === 'email.gmail.clientId') return 'client-id';
        if (key === 'email.gmail.clientSecret') return 'client-secret';
        if (key === 'email.gmail.refreshToken') return 'refresh-token';
        return null;
      });

      await emailService.initialize();

      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'gmail',
          auth: expect.objectContaining({
            type: 'OAuth2'
          })
        })
      );
    });
  });

  describe('sendEmail', () => {
    it('应该发送简单邮件', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: '测试邮件',
        text: '这是一封测试邮件',
        html: '<p>这是一封测试邮件</p>'
      };

      const result = await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: {
          name: '幼儿园管理系统',
          address: 'noreply@kindergarten.com'
        },
        to: 'recipient@example.com',
        subject: '测试邮件',
        text: '这是一封测试邮件',
        html: '<p>这是一封测试邮件</p>'
      });

      expect(result).toEqual(expect.objectContaining({
        messageId: 'test-message-id',
        status: 'sent',
        accepted: ['recipient@example.com']
      }));
    });

    it('应该支持多个收件人', async () => {
      const emailData = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: '群发邮件',
        text: '这是一封群发邮件'
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user1@example.com', 'user2@example.com']
        })
      );
    });

    it('应该支持抄送和密送', async () => {
      const emailData = {
        to: 'recipient@example.com',
        cc: 'cc@example.com',
        bcc: ['bcc1@example.com', 'bcc2@example.com'],
        subject: '测试抄送',
        text: '测试邮件内容'
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          cc: 'cc@example.com',
          bcc: ['bcc1@example.com', 'bcc2@example.com']
        })
      );
    });

    it('应该支持附件', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: '带附件的邮件',
        text: '请查看附件',
        attachments: [
          {
            filename: 'document.pdf',
            path: '/uploads/document.pdf',
            contentType: 'application/pdf'
          },
          {
            filename: 'image.jpg',
            content: Buffer.from('image data'),
            contentType: 'image/jpeg'
          }
        ]
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: 'document.pdf',
              path: '/uploads/document.pdf'
            }),
            expect.objectContaining({
              filename: 'image.jpg',
              content: expect.any(Buffer)
            })
          ])
        })
      );
    });

    it('应该验证附件大小', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: '大附件邮件',
        text: '测试大附件',
        attachments: [
          {
            filename: 'large-file.pdf',
            content: Buffer.alloc(15 * 1024 * 1024), // 15MB，超过限制
            contentType: 'application/pdf'
          }
        ]
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('附件过大');

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '附件大小超出限制',
        expect.objectContaining({
          filename: 'large-file.pdf',
          size: 15 * 1024 * 1024
        })
      );
    });

    it('应该验证附件类型', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: '不支持的附件类型',
        text: '测试附件类型验证',
        attachments: [
          {
            filename: 'script.exe',
            content: Buffer.from('executable'),
            contentType: 'application/x-executable'
          }
        ]
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('不支持的附件类型');
    });

    it('应该处理发送失败', async () => {
      const emailData = {
        to: 'invalid@example.com',
        subject: '测试邮件',
        text: '测试内容'
      };

      const error = new Error('邮箱地址无效');
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('邮箱地址无效');

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '邮件发送失败',
        expect.objectContaining({
          to: 'invalid@example.com',
          error: error.message
        })
      );
    });

    it('应该支持优先级设置', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: '高优先级邮件',
        text: '紧急通知',
        priority: 'high'
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Priority': '1',
            'X-MSMail-Priority': 'High'
          })
        })
      );
    });
  });

  describe('sendTemplateEmail', () => {
    it('应该使用模板发送邮件', async () => {
      const templateData = {
        to: 'user@example.com',
        template: 'welcome',
        subject: '欢迎加入',
        data: {
          userName: '张三',
          kindergartenName: '示例幼儿园',
          loginUrl: 'https://example.com/login'
        }
      };

      mockFs.readFile.mockResolvedValue('欢迎 {{userName}} 加入 {{kindergartenName}}！');
      mockTemplateEngine.compile.mockReturnValue(jest.fn().mockReturnValue('欢迎 张三 加入 示例幼儿园！'));

      const result = await emailService.sendTemplateEmail(templateData);

      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('welcome.hbs'),
        'utf8'
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: '欢迎加入',
          html: '欢迎 张三 加入 示例幼儿园！'
        })
      );

      expect(result.status).toBe('sent');
    });

    it('应该处理模板不存在', async () => {
      const templateData = {
        to: 'user@example.com',
        template: 'nonexistent',
        subject: '测试',
        data: {}
      };

      const error = new Error('ENOENT: no such file or directory');
      mockFs.readFile.mockRejectedValue(error);

      await expect(emailService.sendTemplateEmail(templateData)).rejects.toThrow('邮件模板不存在');
    });

    it('应该支持模板缓存', async () => {
      const templateData = {
        to: 'user@example.com',
        template: 'cached-template',
        subject: '缓存测试',
        data: { name: '测试' }
      };

      // 第一次调用
      await emailService.sendTemplateEmail(templateData);
      
      // 第二次调用（应该使用缓存）
      await emailService.sendTemplateEmail(templateData);

      // 模板文件只应该读取一次
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    });

    it('应该支持模板继承', async () => {
      const templateData = {
        to: 'user@example.com',
        template: 'child-template',
        subject: '模板继承测试',
        data: { content: '子模板内容' }
      };

      mockFs.readFile.mockImplementation((path) => {
        if (path.includes('child-template')) {
          return Promise.resolve('{{#extend "base"}}{{#content "main"}}{{content}}{{/content}}{{/extend}}');
        }
        if (path.includes('base')) {
          return Promise.resolve('<html><body>{{#block "main"}}{{/block}}</body></html>');
        }
        return Promise.resolve('');
      });

      await emailService.sendTemplateEmail(templateData);

      expect(mockFs.readFile).toHaveBeenCalledTimes(2); // 读取子模板和基础模板
    });
  });

  describe('sendBulkEmail', () => {
    it('应该批量发送邮件', async () => {
      const bulkData = {
        template: 'newsletter',
        subject: '月度通讯',
        recipients: [
          { email: 'user1@example.com', data: { name: '用户1' } },
          { email: 'user2@example.com', data: { name: '用户2' } },
          { email: 'user3@example.com', data: { name: '用户3' } }
        ]
      };

      const result = await emailService.sendBulkEmail(bulkData);

      expect(mockQueueService.add).toHaveBeenCalledTimes(3);
      expect(result).toEqual(expect.objectContaining({
        total: 3,
        queued: 3,
        failed: 0
      }));
    });

    it('应该支持分批发送', async () => {
      const bulkData = {
        template: 'promotion',
        subject: '促销活动',
        recipients: Array.from({ length: 100 }, (_, i) => ({
          email: `user${i}@example.com`,
          data: { name: `用户${i}` }
        })),
        batchSize: 10
      };

      await emailService.sendBulkEmail(bulkData);

      // 应该分成10批，每批10个
      expect(mockQueueService.add).toHaveBeenCalledTimes(100);
    });

    it('应该处理无效邮箱地址', async () => {
      const bulkData = {
        template: 'test',
        subject: '测试',
        recipients: [
          { email: 'valid@example.com', data: { name: '有效用户' } },
          { email: 'invalid-email', data: { name: '无效用户' } },
          { email: 'another@example.com', data: { name: '另一个用户' } }
        ]
      };

      const result = await emailService.sendBulkEmail(bulkData);

      expect(result).toEqual(expect.objectContaining({
        total: 3,
        queued: 2,
        failed: 1,
        errors: expect.arrayContaining([
          expect.objectContaining({
            email: 'invalid-email',
            error: '邮箱格式无效'
          })
        ])
      }));
    });

    it('应该支持取消订阅', async () => {
      const bulkData = {
        template: 'newsletter',
        subject: '通讯',
        recipients: [
          { email: 'subscribed@example.com', data: { name: '订阅用户' } },
          { email: 'unsubscribed@example.com', data: { name: '取消订阅用户' } }
        ],
        respectUnsubscribe: true
      };

      // 模拟取消订阅检查
      emailService.isUnsubscribed = jest.fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const result = await emailService.sendBulkEmail(bulkData);

      expect(result.queued).toBe(1);
      expect(result.skipped).toBe(1);
    });
  });

  describe('队列处理', () => {
    it('应该处理邮件队列', async () => {
      const jobData = {
        to: 'user@example.com',
        subject: '队列邮件',
        template: 'test',
        data: { name: '测试用户' }
      };

      await emailService.processEmailQueue(jobData);

      expect(mockTemplateEngine.render).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('应该支持重试机制', async () => {
      const jobData = {
        to: 'user@example.com',
        subject: '重试邮件',
        text: '测试重试'
      };

      // 模拟前两次失败，第三次成功
      mockTransporter.sendMail
        .mockRejectedValueOnce(new Error('临时失败'))
        .mockRejectedValueOnce(new Error('临时失败'))
        .mockResolvedValueOnce({
          messageId: 'retry-success',
          response: '250 OK'
        });

      const result = await emailService.processEmailQueue(jobData);

      expect(result.status).toBe('sent');
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        '邮件重试发送成功',
        expect.objectContaining({
          attempts: 3
        })
      );
    });

    it('应该处理永久失败', async () => {
      const jobData = {
        to: 'invalid@example.com',
        subject: '永久失败邮件',
        text: '测试永久失败'
      };

      const permanentError = new Error('邮箱不存在');
      permanentError.responseCode = 550;
      mockTransporter.sendMail.mockRejectedValue(permanentError);

      await expect(emailService.processEmailQueue(jobData)).rejects.toThrow('邮箱不存在');

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '邮件发送永久失败',
        expect.objectContaining({
          error: '邮箱不存在',
          permanent: true
        })
      );
    });
  });

  describe('邮件跟踪', () => {
    it('应该添加跟踪像素', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: '跟踪邮件',
        html: '<p>邮件内容</p>',
        tracking: true
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('<img src="https://example.com/track/open/')
        })
      );
    });

    it('应该跟踪链接点击', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: '链接跟踪邮件',
        html: '<p>点击 <a href="https://example.com">这里</a></p>',
        tracking: true
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://example.com/track/click/')
        })
      );
    });

    it('应该记录邮件统计', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: '统计邮件',
        text: '测试统计'
      };

      await emailService.sendEmail(emailData);

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        '邮件发送统计',
        expect.objectContaining({
          messageId: 'test-message-id',
          recipient: 'user@example.com',
          status: 'sent'
        })
      );
    });
  });

  describe('取消订阅', () => {
    it('应该处理取消订阅请求', async () => {
      const unsubscribeData = {
        email: 'user@example.com',
        token: 'unsubscribe-token-123',
        reason: '不再需要'
      };

      const result = await emailService.unsubscribe(unsubscribeData);

      expect(result).toEqual(expect.objectContaining({
        email: 'user@example.com',
        unsubscribed: true,
        timestamp: expect.any(Date)
      }));

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        '用户取消订阅',
        expect.objectContaining({
          email: 'user@example.com'
        })
      );
    });

    it('应该验证取消订阅令牌', async () => {
      const invalidData = {
        email: 'user@example.com',
        token: 'invalid-token'
      };

      await expect(emailService.unsubscribe(invalidData)).rejects.toThrow('无效的取消订阅令牌');
    });

    it('应该支持重新订阅', async () => {
      const resubscribeData = {
        email: 'user@example.com',
        token: 'resubscribe-token-123'
      };

      const result = await emailService.resubscribe(resubscribeData);

      expect(result).toEqual(expect.objectContaining({
        email: 'user@example.com',
        subscribed: true
      }));
    });
  });

  describe('邮件统计', () => {
    it('应该获取发送统计', async () => {
      const stats = await emailService.getStatistics();

      expect(stats).toEqual(expect.objectContaining({
        totalSent: expect.any(Number),
        totalFailed: expect.any(Number),
        successRate: expect.any(Number),
        byTemplate: expect.any(Object),
        byRecipient: expect.any(Object),
        recentActivity: expect.any(Array)
      }));
    });

    it('应该支持时间范围统计', async () => {
      const dateRange = {
        startDate: '2024-04-01',
        endDate: '2024-04-30'
      };

      const stats = await emailService.getStatistics(dateRange);

      expect(stats.dateRange).toEqual(dateRange);
    });

    it('应该获取模板使用统计', async () => {
      const templateStats = await emailService.getTemplateStatistics();

      expect(templateStats).toEqual(expect.arrayContaining([
        expect.objectContaining({
          template: expect.any(String),
          count: expect.any(Number),
          successRate: expect.any(Number)
        })
      ]));
    });
  });

  describe('错误处理', () => {
    it('应该处理SMTP认证失败', async () => {
      const error = new Error('认证失败');
      error.code = 'EAUTH';
      mockTransporter.sendMail.mockRejectedValue(error);

      const emailData = {
        to: 'user@example.com',
        subject: '测试',
        text: '测试'
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('SMTP认证失败');
    });

    it('应该处理网络连接错误', async () => {
      const error = new Error('网络超时');
      error.code = 'ETIMEDOUT';
      mockTransporter.sendMail.mockRejectedValue(error);

      const emailData = {
        to: 'user@example.com',
        subject: '测试',
        text: '测试'
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('网络连接超时');
    });

    it('应该处理邮箱配额满', async () => {
      const error = new Error('邮箱已满');
      error.responseCode = 552;
      mockTransporter.sendMail.mockRejectedValue(error);

      const emailData = {
        to: 'user@example.com',
        subject: '测试',
        text: '测试'
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('收件人邮箱已满');
    });

    it('应该处理服务不可用', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'email.enabled') return false;
        return null;
      });

      const emailData = {
        to: 'user@example.com',
        subject: '测试',
        text: '测试'
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('邮件服务已禁用');
    });
  });

  describe('配置管理', () => {
    it('应该支持动态配置更新', async () => {
      const newConfig = {
        'email.smtp.host': 'new-smtp.example.com',
        'email.smtp.port': 465,
        'email.smtp.secure': true
      };

      await emailService.updateConfig(newConfig);

      expect(mockConfigService.set).toHaveBeenCalledWith('email.smtp.host', 'new-smtp.example.com');
      expect(mockLoggerService.info).toHaveBeenCalledWith('邮件配置已更新');
    });

    it('应该验证配置有效性', async () => {
      const invalidConfig = {
        'email.smtp.port': 'invalid-port'
      };

      await expect(emailService.updateConfig(invalidConfig)).rejects.toThrow('配置无效');
    });

    it('应该支持测试配置', async () => {
      const testResult = await emailService.testConfiguration();

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(testResult).toEqual(expect.objectContaining({
        success: true,
        message: 'SMTP连接测试成功'
      }));
    });
  });
});
