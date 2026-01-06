/**
 * Mock Server
 * 在 4000 端口上运行，用于测试所有 API 端点
 * 基于 Swagger 文档自动生成 Mock 数据
 */

import express, { Express, Request, Response, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { faker } from '@faker-js/faker';

const app: Express = express();
const router = Router();

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
// Mock 数据生成器
// ═══════════════════════════════════════════════════════════════════════════

interface MockUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface MockResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class MockDataGenerator {
  static generateUser(id: number = 1): MockUser {
    return {
      id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number('+86 1########'),
      role: faker.helpers.arrayElement(['admin', 'teacher', 'parent', 'student']),
      status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
      createdAt: faker.date.past().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static generateUsers(count: number = 10): MockUser[] {
    return Array.from({ length: count }, (_, i) => this.generateUser(i + 1));
  }

  static generateActivity(id: number = 1) {
    return {
      id,
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      startDate: faker.date.future().toISOString(),
      endDate: faker.date.future().toISOString(),
      location: faker.location.city(),
      capacity: faker.number.int({ min: 10, max: 100 }),
      currentParticipants: faker.number.int({ min: 0, max: 100 }),
      status: faker.helpers.arrayElement(['upcoming', 'ongoing', 'completed', 'cancelled']),
      createdAt: faker.date.past().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static generateActivities(count: number = 5) {
    return Array.from({ length: count }, (_, i) => this.generateActivity(i + 1));
  }

  static generateEnrollment(id: number = 1) {
    return {
      id,
      studentName: faker.person.fullName(),
      studentAge: faker.number.int({ min: 3, max: 6 }),
      parentName: faker.person.fullName(),
      parentPhone: faker.phone.number('+86 1########'),
      status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
      appliedDate: faker.date.past().toISOString(),
      reviewedDate: faker.date.recent().toISOString(),
      classId: faker.number.int({ min: 1, max: 10 }),
      createdAt: faker.date.past().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static generateEnrollments(count: number = 5) {
    return Array.from({ length: count }, (_, i) => this.generateEnrollment(i + 1));
  }

  static generateClass(id: number = 1) {
    return {
      id,
      name: faker.helpers.arrayElement(['小一班', '小二班', '中班', '大班']),
      ageGroup: faker.helpers.arrayElement(['3-4岁', '4-5岁', '5-6岁']),
      capacity: faker.number.int({ min: 20, max: 35 }),
      currentEnrollment: faker.number.int({ min: 15, max: 35 }),
      teachers: Array.from({ length: 2 }, () => faker.person.fullName()),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      createdAt: faker.date.past().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static generateClasses(count: number = 4) {
    return Array.from({ length: count }, (_, i) => this.generateClass(i + 1));
  }

  static generateAIBilling(id: number = 1) {
    const types = ['token', 'character', 'count', 'second'];
    const type = faker.helpers.arrayElement(types);
    const quantity = faker.number.int({ min: 100, max: 100000 });
    const unitPrice = parseFloat(faker.finance.amount({ min: 0.0001, max: 0.01, dec: 6 }));
    const totalCost = parseFloat((quantity * unitPrice).toFixed(6));

    return {
      id,
      userId: faker.number.int({ min: 1, max: 100 }),
      modelId: faker.number.int({ min: 1, max: 10 }),
      billingType: type,
      quantity,
      unit: type,
      unitPrice,
      totalCost,
      status: faker.helpers.arrayElement(['pending', 'calculated', 'billed', 'paid']),
      createdAt: faker.date.past().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static generateAIBillings(count: number = 10) {
    return Array.from({ length: count }, (_, i) => this.generateAIBilling(i + 1));
  }

  static generatePagedResponse<T>(items: T[], page: number = 1, pageSize: number = 10) {
    return {
      items,
      total: items.length,
      page,
      pageSize,
      pages: Math.ceil(items.length / pageSize)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Mock 路由
// ═══════════════════════════════════════════════════════════════════════════

// 认证
router.post('/auth/login', (req, res) => {
  res.json({
    success: true,
    message: '登录成功',
    data: {
      token: 'Bearer mock_jwt_token_' + Math.random().toString(36).substr(2, 9),
      user: MockDataGenerator.generateUser(1),
      expiresIn: 3600
    }
  });
});

// 用户
router.get('/users', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  res.json({
    success: true,
    message: '获取用户列表成功',
    data: MockDataGenerator.generatePagedResponse(
      MockDataGenerator.generateUsers(20),
      page,
      pageSize
    )
  });
});

router.get('/users/:id', (req, res) => {
  res.json({
    success: true,
    message: '获取用户详情成功',
    data: MockDataGenerator.generateUser(parseInt(req.params.id))
  });
});

router.post('/users', (req, res) => {
  res.status(201).json({
    success: true,
    message: '创建用户成功',
    data: MockDataGenerator.generateUser()
  });
});

router.put('/users/:id', (req, res) => {
  res.json({
    success: true,
    message: '更新用户成功',
    data: MockDataGenerator.generateUser(parseInt(req.params.id))
  });
});

router.delete('/users/:id', (req, res) => {
  res.json({
    success: true,
    message: '删除用户成功',
    data: { id: parseInt(req.params.id), deleted: true }
  });
});

// 活动
router.get('/activities', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  res.json({
    success: true,
    message: '获取活动列表成功',
    data: MockDataGenerator.generatePagedResponse(
      MockDataGenerator.generateActivities(15),
      page,
      pageSize
    )
  });
});

router.get('/activities/:id', (req, res) => {
  res.json({
    success: true,
    message: '获取活动详情成功',
    data: MockDataGenerator.generateActivity(parseInt(req.params.id))
  });
});

router.post('/activities', (req, res) => {
  res.status(201).json({
    success: true,
    message: '创建活动成功',
    data: MockDataGenerator.generateActivity()
  });
});

// 招生
router.get('/enrollment', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  res.json({
    success: true,
    message: '获取招生申请列表成功',
    data: MockDataGenerator.generatePagedResponse(
      MockDataGenerator.generateEnrollments(20),
      page,
      pageSize
    )
  });
});

router.get('/enrollment/:id', (req, res) => {
  res.json({
    success: true,
    message: '获取招生申请详情成功',
    data: MockDataGenerator.generateEnrollment(parseInt(req.params.id))
  });
});

router.post('/enrollment', (req, res) => {
  res.status(201).json({
    success: true,
    message: '提交招生申请成功',
    data: MockDataGenerator.generateEnrollment()
  });
});

// 班级
router.get('/classes', (req, res) => {
  res.json({
    success: true,
    message: '获取班级列表成功',
    data: MockDataGenerator.generateClasses(4)
  });
});

router.get('/kindergartens', (req, res) => {
  res.json({
    success: true,
    message: '获取幼儿园列表成功',
    data: {
      items: [
        {
          id: 1,
          name: '示范幼儿园',
          address: faker.location.city(),
          phone: faker.phone.number('+86 ##########'),
          principal: faker.person.fullName(),
          totalStudents: faker.number.int({ min: 50, max: 200 }),
          totalClasses: 4,
          status: 'active'
        }
      ],
      total: 1
    }
  });
});

// AI 计费
router.get('/ai-billing/statistics', (req, res) => {
  res.json({
    success: true,
    message: '获取 AI 计费统计成功',
    data: {
      totalRecords: faker.number.int({ min: 100, max: 1000 }),
      totalCost: parseFloat(faker.finance.amount({ min: 100, max: 10000 })),
      byType: {
        token: { count: 50, cost: 100.50 },
        character: { count: 30, cost: 50.25 },
        count: { count: 15, cost: 75.00 },
        second: { count: 5, cost: 200.00 }
      },
      byStatus: {
        pending: { count: 20, cost: 100 },
        calculated: { count: 100, cost: 200 },
        billed: { count: 50, cost: 125.75 },
        paid: { count: 30, cost: 99.99 }
      }
    }
  });
});

router.get('/ai-billing/bills', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  res.json({
    success: true,
    message: '获取 AI 计费记录成功',
    data: MockDataGenerator.generatePagedResponse(
      MockDataGenerator.generateAIBillings(25),
      page,
      pageSize
    )
  });
});

// 权限和认证
router.get('/roles', (req, res) => {
  res.json({
    success: true,
    message: '获取角色列表成功',
    data: [
      { id: 1, name: 'admin', description: '管理员' },
      { id: 2, name: 'principal', description: '园长' },
      { id: 3, name: 'teacher', description: '教师' },
      { id: 4, name: 'parent', description: '家长' },
      { id: 5, name: 'student', description: '学生' }
    ]
  });
});

router.get('/permissions', (req, res) => {
  res.json({
    success: true,
    message: '获取权限列表成功',
    data: [
      { id: 1, name: 'user:read', description: '读取用户' },
      { id: 2, name: 'user:write', description: '编写用户' },
      { id: 3, name: 'activity:read', description: '读取活动' },
      { id: 4, name: 'activity:write', description: '编写活动' },
      { id: 5, name: 'enrollment:read', description: '读取招生' },
      { id: 6, name: 'enrollment:write', description: '编写招生' }
    ]
  });
});

// 通用错误处理
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '端点不存在',
    error: `无法找到 ${req.method} ${req.path}`
  });
});

app.use('/api', router);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              🎭 Mock Server 已启动                        ║
╚════════════════════════════════════════════════════════════╝

📍 基础 URL: http://localhost:${PORT}
📚 API 前缀: http://localhost:${PORT}/api

✅ 支持的端点:
  • POST   /api/auth/login           - 登录
  • GET    /api/users                - 用户列表
  • GET    /api/users/:id            - 用户详情
  • POST   /api/users                - 创建用户
  • PUT    /api/users/:id            - 更新用户
  • DELETE /api/users/:id            - 删除用户
  • GET    /api/activities           - 活动列表
  • GET    /api/activities/:id       - 活动详情
  • POST   /api/activities           - 创建活动
  • GET    /api/enrollment           - 招生申请
  • GET    /api/enrollment/:id       - 招生详情
  • POST   /api/enrollment           - 提交申请
  • GET    /api/classes              - 班级列表
  • GET    /api/kindergartens        - 幼儿园列表
  • GET    /api/ai-billing/statistics - AI 计费统计
  • GET    /api/ai-billing/bills     - AI 计费记录
  • GET    /api/roles                - 角色列表
  • GET    /api/permissions          - 权限列表

💡 特点:
  ✓ 自动生成逼真的 Mock 数据
  ✓ 支持分页 (page, pageSize)
  ✓ 标准 API 响应格式
  ✓ 完整的 CRUD 操作

🧪 测试:
  curl http://localhost:${PORT}/api/users
  curl http://localhost:${PORT}/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});

export default app;



