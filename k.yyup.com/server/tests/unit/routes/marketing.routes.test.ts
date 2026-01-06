import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = {
    id: 1,
    email: 'admin@example.com',
    role: 'admin'
  };
  next();
});

const mockPermissionMiddleware = jest.fn((permission) => (req, res, next) => {
  // Mock permission check
  const userPermissions = ['marketing:read', 'marketing:write', 'marketing:delete'];
  if (userPermissions.includes(permission)) {
    next();
  } else {
    res.status(403).json({ error: '权限不足' });
  }
});

const mockValidationMiddleware = jest.fn((schema) => (req, res, next) => {
  // Mock validation - always pass
  next();
});

const mockUploadMiddleware = {
  single: jest.fn((fieldName) => (req, res, next) => {
    req.file = {
      fieldname: fieldName,
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 100,
      buffer: Buffer.from('fake image data'),
      filename: 'test-image-123.jpg',
      path: '/uploads/test-image-123.jpg'
    };
    next();
  }),
  array: jest.fn((fieldName) => (req, res, next) => {
    req.files = [
      {
        fieldname: fieldName,
        originalname: 'image1.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 50
      },
      {
        fieldname: fieldName,
        originalname: 'image2.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 60
      }
    ];
    next();
  })
};

// Mock controller
const mockMarketingController = {
  getCampaigns: jest.fn(async (req, res) => {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          name: '春季招生活动',
          type: 'enrollment',
          status: 'active',
          budget: { total: 50000, spent: 25000 },
          metrics: { impressions: 10000, clicks: 250, conversions: 25 }
        },
        {
          id: 2,
          name: '品牌宣传活动',
          type: 'brand_awareness',
          status: 'paused',
          budget: { total: 30000, spent: 15000 },
          metrics: { impressions: 8000, clicks: 160, conversions: 12 }
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }
    });
  }),

  getCampaign: jest.fn(async (req, res) => {
    const { id } = req.params;
    if (id === '999') {
      return res.status(404).json({
        success: false,
        error: '活动不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        name: '春季招生活动',
        description: '2024年春季招生宣传活动',
        type: 'enrollment',
        status: 'active',
        targetAudience: {
          ageRange: { min: 3, max: 6 },
          location: ['北京市', '上海市']
        },
        budget: { total: 50000, spent: 25000 },
        metrics: { impressions: 10000, clicks: 250, conversions: 25 },
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-04-01T15:30:00Z'
      }
    });
  }),

  createCampaign: jest.fn(async (req, res) => {
    const campaignData = req.body;
    
    res.status(201).json({
      success: true,
      data: {
        id: 3,
        ...campaignData,
        status: 'draft',
        metrics: { impressions: 0, clicks: 0, conversions: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: '营销活动创建成功'
    });
  }),

  updateCampaign: jest.fn(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (id === '999') {
      return res.status(404).json({
        success: false,
        error: '活动不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        name: '春季招生活动',
        ...updateData,
        updatedAt: new Date().toISOString()
      },
      message: '营销活动更新成功'
    });
  }),

  deleteCampaign: jest.fn(async (req, res) => {
    const { id } = req.params;
    
    if (id === '999') {
      return res.status(404).json({
        success: false,
        error: '活动不存在'
      });
    }
    
    if (id === '1') {
      return res.status(400).json({
        success: false,
        error: '不能删除活跃的活动'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '营销活动删除成功'
    });
  }),

  launchCampaign: jest.fn(async (req, res) => {
    const { id } = req.params;
    
    if (id === '999') {
      return res.status(404).json({
        success: false,
        error: '活动不存在'
      });
    }
    
    if (id === '2') {
      return res.status(400).json({
        success: false,
        error: '活动状态不允许启动'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        status: 'active',
        launchedAt: new Date().toISOString()
      },
      message: '营销活动启动成功'
    });
  }),

  pauseCampaign: jest.fn(async (req, res) => {
    const { id } = req.params;
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        status: 'paused',
        pausedAt: new Date().toISOString()
      },
      message: '营销活动暂停成功'
    });
  }),

  resumeCampaign: jest.fn(async (req, res) => {
    const { id } = req.params;
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        status: 'active',
        pausedAt: null
      },
      message: '营销活动恢复成功'
    });
  }),

  completeCampaign: jest.fn(async (req, res) => {
    const { id } = req.params;
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        status: 'completed',
        completedAt: new Date().toISOString()
      },
      message: '营销活动完成'
    });
  }),

  getCampaignAnalytics: jest.fn(async (req, res) => {
    const { id } = req.params;
    
    res.status(200).json({
      success: true,
      data: {
        campaignId: parseInt(id),
        overview: {
          impressions: 10000,
          clicks: 250,
          conversions: 25,
          cost: 25000,
          ctr: 0.025,
          cpc: 100,
          cpa: 1000,
          roi: 1.5
        },
        timeline: [
          { date: '2024-04-01', impressions: 1000, clicks: 25, conversions: 2 },
          { date: '2024-04-02', impressions: 1200, clicks: 30, conversions: 3 }
        ],
        channels: {
          email: { impressions: 4000, clicks: 120, conversions: 12 },
          sms: { impressions: 3000, clicks: 75, conversions: 8 },
          social_media: { impressions: 3000, clicks: 55, conversions: 5 }
        },
        demographics: {
          age: { '25-34': 40, '35-44': 35, '45-54': 25 },
          gender: { male: 45, female: 55 },
          location: { '北京': 60, '上海': 40 }
        }
      }
    });
  }),

  getCampaignReport: jest.fn(async (req, res) => {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="campaign-${id}-report.pdf"`);
      res.status(200).send(Buffer.from('PDF content'));
    } else {
      res.status(200).json({
        success: true,
        data: {
          campaignId: parseInt(id),
          reportType: 'performance',
          generatedAt: new Date().toISOString(),
          summary: {
            totalImpressions: 10000,
            totalClicks: 250,
            totalConversions: 25,
            totalCost: 25000
          },
          recommendations: [
            '建议增加社交媒体预算分配',
            '优化邮件营销的标题和内容'
          ]
        }
      });
    }
  }),

  cloneCampaign: jest.fn(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    res.status(201).json({
      success: true,
      data: {
        id: 4,
        name: name || '春季招生活动 - 副本',
        status: 'draft',
        clonedFrom: parseInt(id),
        createdAt: new Date().toISOString()
      },
      message: '营销活动克隆成功'
    });
  }),

  uploadCampaignAssets: jest.fn(async (req, res) => {
    const { id } = req.params;
    const files = req.files || [req.file];
    
    res.status(200).json({
      success: true,
      data: {
        campaignId: parseInt(id),
        uploadedFiles: files.map((file, index) => ({
          id: `asset_${index + 1}`,
          originalName: file.originalname,
          filename: file.filename,
          url: file.path,
          type: file.mimetype.startsWith('image/') ? 'image' : 'document',
          size: file.size
        }))
      },
      message: '营销素材上传成功'
    });
  }),

  getCampaignLeads: jest.fn(async (req, res) => {
    const { id } = req.params;
    
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138000',
          source: 'email',
          status: 'new',
          createdAt: '2024-04-01T10:00:00Z'
        },
        {
          id: 2,
          name: '李四',
          email: 'lisi@example.com',
          phone: '13900139000',
          source: 'social_media',
          status: 'contacted',
          createdAt: '2024-04-02T14:30:00Z'
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        pageSize: 20
      }
    });
  }),

  getPerformanceStats: jest.fn(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        totalCampaigns: 25,
        activeCampaigns: 8,
        totalBudget: 500000,
        totalSpent: 350000,
        totalImpressions: 1000000,
        totalClicks: 25000,
        totalConversions: 1250,
        averageCTR: 0.025,
        averageCPC: 14,
        averageCPA: 280,
        averageROI: 1.8,
        topPerformers: [
          { id: 1, name: '春季招生活动', roi: 3.2 },
          { id: 3, name: '夏令营推广', roi: 2.8 }
        ]
      }
    });
  }),

  getBudgetSummary: jest.fn(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        totalBudget: 100000,
        allocatedBudget: 85000,
        spentBudget: 45000,
        remainingBudget: 40000,
        utilizationRate: 0.53,
        byChannel: {
          email: { allocated: 20000, spent: 12000 },
          sms: { allocated: 25000, spent: 15000 },
          social_media: { allocated: 30000, spent: 18000 },
          website: { allocated: 10000, spent: 0 }
        }
      }
    });
  })
};

// Mock imports
jest.mock('../../../../../src/middlewares/auth.middleware', () => ({
  authenticateToken: mockAuthMiddleware,
  requirePermission: mockPermissionMiddleware
}));

jest.mock('../../../../../src/middlewares/validate.middleware', () => ({
  validate: mockValidationMiddleware
}));

jest.mock('../../../../../src/middlewares/upload.middleware', () => ({
  upload: mockUploadMiddleware
}));

jest.mock('../../../../../src/controllers/marketing.controller', () => mockMarketingController);


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

describe('Marketing Routes', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Import and use routes
    const { default: marketingRoutes } = await import('../../../../../src/routes/marketing.routes');
    app.use('/api/marketing', marketingRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/marketing/campaigns', () => {
    it('应该获取营销活动列表', async () => {
      const response = await request(app)
        .get('/api/marketing/campaigns')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('status');
      expect(response.body.pagination).toHaveProperty('total');
      expect(mockMarketingController.getCampaigns).toHaveBeenCalled();
    });

    it('应该支持查询参数', async () => {
      await request(app)
        .get('/api/marketing/campaigns')
        .query({
          status: 'active',
          type: 'enrollment',
          page: 1,
          pageSize: 10
        })
        .expect(200);

      expect(mockMarketingController.getCampaigns).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求读取权限', async () => {
      expect(mockPermissionMiddleware).toHaveBeenCalledWith('marketing:read');
    });
  });

  describe('GET /api/marketing/campaigns/:id', () => {
    it('应该获取单个营销活动', async () => {
      const response = await request(app)
        .get('/api/marketing/campaigns/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('targetAudience');
      expect(response.body.data).toHaveProperty('budget');
      expect(response.body.data).toHaveProperty('metrics');
      expect(mockMarketingController.getCampaign).toHaveBeenCalled();
    });

    it('应该处理活动不存在', async () => {
      const response = await request(app)
        .get('/api/marketing/campaigns/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('活动不存在');
    });
  });

  describe('POST /api/marketing/campaigns', () => {
    it('应该创建营销活动', async () => {
      const campaignData = {
        name: '夏季招生活动',
        description: '2024年夏季招生宣传活动',
        type: 'enrollment',
        targetAudience: {
          ageRange: { min: 3, max: 6 },
          location: ['北京市']
        },
        budget: {
          total: 30000,
          allocated: {
            email: 10000,
            sms: 10000,
            social_media: 10000
          }
        },
        schedule: {
          startDate: '2024-06-01',
          endDate: '2024-06-30'
        }
      };

      const response = await request(app)
        .post('/api/marketing/campaigns')
        .send(campaignData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(campaignData.name);
      expect(response.body.data.status).toBe('draft');
      expect(response.body.message).toBe('营销活动创建成功');
      expect(mockMarketingController.createCampaign).toHaveBeenCalled();
    });

    it('应该要求写入权限', async () => {
      await request(app)
        .post('/api/marketing/campaigns')
        .send({ name: '测试活动' });

      expect(mockPermissionMiddleware).toHaveBeenCalledWith('marketing:write');
    });

    it('应该验证请求数据', async () => {
      await request(app)
        .post('/api/marketing/campaigns')
        .send({ name: '测试活动' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /api/marketing/campaigns/:id', () => {
    it('应该更新营销活动', async () => {
      const updateData = {
        name: '春季招生活动 - 更新版',
        description: '更新后的活动描述',
        budget: {
          total: 60000
        }
      };

      const response = await request(app)
        .put('/api/marketing/campaigns/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.message).toBe('营销活动更新成功');
      expect(mockMarketingController.updateCampaign).toHaveBeenCalled();
    });

    it('应该处理活动不存在', async () => {
      const response = await request(app)
        .put('/api/marketing/campaigns/999')
        .send({ name: '测试' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('活动不存在');
    });
  });

  describe('DELETE /api/marketing/campaigns/:id', () => {
    it('应该删除营销活动', async () => {
      const response = await request(app)
        .delete('/api/marketing/campaigns/2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('营销活动删除成功');
      expect(mockMarketingController.deleteCampaign).toHaveBeenCalled();
    });

    it('应该拒绝删除活跃的活动', async () => {
      const response = await request(app)
        .delete('/api/marketing/campaigns/1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('不能删除活跃的活动');
    });

    it('应该要求删除权限', async () => {
      await request(app)
        .delete('/api/marketing/campaigns/2');

      expect(mockPermissionMiddleware).toHaveBeenCalledWith('marketing:delete');
    });
  });

  describe('POST /api/marketing/campaigns/:id/launch', () => {
    it('应该启动营销活动', async () => {
      const response = await request(app)
        .post('/api/marketing/campaigns/1/launch')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data).toHaveProperty('launchedAt');
      expect(response.body.message).toBe('营销活动启动成功');
      expect(mockMarketingController.launchCampaign).toHaveBeenCalled();
    });

    it('应该处理启动失败', async () => {
      const response = await request(app)
        .post('/api/marketing/campaigns/2/launch')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('活动状态不允许启动');
    });
  });

  describe('POST /api/marketing/campaigns/:id/pause', () => {
    it('应该暂停营销活动', async () => {
      const response = await request(app)
        .post('/api/marketing/campaigns/1/pause')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('paused');
      expect(response.body.data).toHaveProperty('pausedAt');
      expect(response.body.message).toBe('营销活动暂停成功');
      expect(mockMarketingController.pauseCampaign).toHaveBeenCalled();
    });
  });

  describe('POST /api/marketing/campaigns/:id/resume', () => {
    it('应该恢复营销活动', async () => {
      const response = await request(app)
        .post('/api/marketing/campaigns/1/resume')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.pausedAt).toBeNull();
      expect(response.body.message).toBe('营销活动恢复成功');
      expect(mockMarketingController.resumeCampaign).toHaveBeenCalled();
    });
  });

  describe('POST /api/marketing/campaigns/:id/complete', () => {
    it('应该完成营销活动', async () => {
      const response = await request(app)
        .post('/api/marketing/campaigns/1/complete')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data).toHaveProperty('completedAt');
      expect(response.body.message).toBe('营销活动完成');
      expect(mockMarketingController.completeCampaign).toHaveBeenCalled();
    });
  });

  describe('GET /api/marketing/campaigns/:id/analytics', () => {
    it('应该获取活动分析数据', async () => {
      const response = await request(app)
        .get('/api/marketing/campaigns/1/analytics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('campaignId', 1);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('timeline');
      expect(response.body.data).toHaveProperty('channels');
      expect(response.body.data).toHaveProperty('demographics');
      expect(mockMarketingController.getCampaignAnalytics).toHaveBeenCalled();
    });

    it('应该支持日期范围查询', async () => {
      await request(app)
        .get('/api/marketing/campaigns/1/analytics')
        .query({
          startDate: '2024-04-01',
          endDate: '2024-04-30'
        })
        .expect(200);

      expect(mockMarketingController.getCampaignAnalytics).toHaveBeenCalled();
    });
  });

  describe('GET /api/marketing/campaigns/:id/report', () => {
    it('应该获取JSON格式报告', async () => {
      const response = await request(app)
        .get('/api/marketing/campaigns/1/report')
        .query({ format: 'json' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('campaignId', 1);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('recommendations');
      expect(mockMarketingController.getCampaignReport).toHaveBeenCalled();
    });

    it('应该获取PDF格式报告', async () => {
      const response = await request(app)
        .get('/api/marketing/campaigns/1/report')
        .query({ format: 'pdf' })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('campaign-1-report.pdf');
    });
  });

  describe('POST /api/marketing/campaigns/:id/clone', () => {
    it('应该克隆营销活动', async () => {
      const cloneData = {
        name: '春季招生活动 - 副本',
        schedule: {
          startDate: '2024-05-01',
          endDate: '2024-05-31'
        }
      };

      const response = await request(app)
        .post('/api/marketing/campaigns/1/clone')
        .send(cloneData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(cloneData.name);
      expect(response.body.data.status).toBe('draft');
      expect(response.body.data.clonedFrom).toBe(1);
      expect(response.body.message).toBe('营销活动克隆成功');
      expect(mockMarketingController.cloneCampaign).toHaveBeenCalled();
    });
  });

  describe('POST /api/marketing/campaigns/:id/assets', () => {
    it('应该上传单个营销素材', async () => {
      const response = await request(app)
        .post('/api/marketing/campaigns/1/assets')
        .attach('asset', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('campaignId', 1);
      expect(response.body.data.uploadedFiles).toHaveLength(1);
      expect(response.body.data.uploadedFiles[0]).toHaveProperty('originalName');
      expect(response.body.data.uploadedFiles[0]).toHaveProperty('url');
      expect(response.body.message).toBe('营销素材上传成功');
      expect(mockMarketingController.uploadCampaignAssets).toHaveBeenCalled();
    });

    it('应该上传多个营销素材', async () => {
      const response = await request(app)
        .post('/api/marketing/campaigns/1/assets')
        .attach('assets', Buffer.from('image1 data'), 'image1.jpg')
        .attach('assets', Buffer.from('image2 data'), 'image2.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.uploadedFiles).toHaveLength(2);
    });

    it('应该要求上传权限', async () => {
      await request(app)
        .post('/api/marketing/campaigns/1/assets')
        .attach('asset', Buffer.from('fake data'), 'test.jpg');

      expect(mockPermissionMiddleware).toHaveBeenCalledWith('marketing:write');
    });
  });

  describe('GET /api/marketing/campaigns/:id/leads', () => {
    it('应该获取活动线索', async () => {
      const response = await request(app)
        .get('/api/marketing/campaigns/1/leads')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('email');
      expect(response.body.data[0]).toHaveProperty('source');
      expect(response.body.data[0]).toHaveProperty('status');
      expect(response.body.pagination).toHaveProperty('total');
      expect(mockMarketingController.getCampaignLeads).toHaveBeenCalled();
    });

    it('应该支持筛选参数', async () => {
      await request(app)
        .get('/api/marketing/campaigns/1/leads')
        .query({
          status: 'new',
          source: 'email',
          page: 1,
          pageSize: 10
        })
        .expect(200);

      expect(mockMarketingController.getCampaignLeads).toHaveBeenCalled();
    });
  });

  describe('GET /api/marketing/stats', () => {
    it('应该获取营销统计数据', async () => {
      const response = await request(app)
        .get('/api/marketing/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCampaigns');
      expect(response.body.data).toHaveProperty('activeCampaigns');
      expect(response.body.data).toHaveProperty('totalBudget');
      expect(response.body.data).toHaveProperty('totalSpent');
      expect(response.body.data).toHaveProperty('averageROI');
      expect(response.body.data).toHaveProperty('topPerformers');
      expect(mockMarketingController.getPerformanceStats).toHaveBeenCalled();
    });

    it('应该支持时间范围筛选', async () => {
      await request(app)
        .get('/api/marketing/stats')
        .query({
          startDate: '2024-04-01',
          endDate: '2024-04-30'
        })
        .expect(200);

      expect(mockMarketingController.getPerformanceStats).toHaveBeenCalled();
    });
  });

  describe('GET /api/marketing/budget', () => {
    it('应该获取预算摘要', async () => {
      const response = await request(app)
        .get('/api/marketing/budget')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalBudget');
      expect(response.body.data).toHaveProperty('allocatedBudget');
      expect(response.body.data).toHaveProperty('spentBudget');
      expect(response.body.data).toHaveProperty('remainingBudget');
      expect(response.body.data).toHaveProperty('utilizationRate');
      expect(response.body.data).toHaveProperty('byChannel');
      expect(mockMarketingController.getBudgetSummary).toHaveBeenCalled();
    });
  });

  describe('中间件验证', () => {
    it('应该在所有路由上应用认证中间件', async () => {
      await request(app).get('/api/marketing/campaigns');
      await request(app).post('/api/marketing/campaigns').send({});
      await request(app).put('/api/marketing/campaigns/1').send({});
      await request(app).delete('/api/marketing/campaigns/1');

      expect(mockAuthMiddleware).toHaveBeenCalledTimes(4);
    });

    it('应该在写操作上应用权限中间件', async () => {
      await request(app).post('/api/marketing/campaigns').send({});
      await request(app).put('/api/marketing/campaigns/1').send({});
      await request(app).delete('/api/marketing/campaigns/1');

      expect(mockPermissionMiddleware).toHaveBeenCalledWith('marketing:write');
      expect(mockPermissionMiddleware).toHaveBeenCalledWith('marketing:delete');
    });

    it('应该在创建和更新操作上应用验证中间件', async () => {
      await request(app).post('/api/marketing/campaigns').send({});
      await request(app).put('/api/marketing/campaigns/1').send({});

      expect(mockValidationMiddleware).toHaveBeenCalledTimes(2);
    });

    it('应该在文件上传操作上应用上传中间件', async () => {
      await request(app)
        .post('/api/marketing/campaigns/1/assets')
        .attach('asset', Buffer.from('fake data'), 'test.jpg');

      expect(mockUploadMiddleware.single).toHaveBeenCalledWith('asset');
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器错误', async () => {
      mockMarketingController.getCampaigns.mockRejectedValueOnce(new Error('数据库连接失败'));

      const response = await request(app)
        .get('/api/marketing/campaigns')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('应该处理无效的路由参数', async () => {
      const response = await request(app)
        .get('/api/marketing/campaigns/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('应该处理权限不足', async () => {
      mockPermissionMiddleware.mockImplementationOnce(() => (req, res, next) => {
        res.status(403).json({ error: '权限不足' });
      });

      const response = await request(app)
        .post('/api/marketing/campaigns')
        .send({})
        .expect(403);

      expect(response.body.error).toBe('权限不足');
    });
  });
});
