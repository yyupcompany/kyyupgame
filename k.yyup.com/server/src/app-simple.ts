import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { sequelize } from './init';
import { errorHandler } from './middlewares/error.middleware';
import { responseFormatter } from './middlewares/response-formatter.middleware';
import { QueryTypes } from 'sequelize';
import { logger } from './utils/logger';
import { setupSwagger } from './config/swagger.config';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// 基础中间件
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://k.yyup.cc'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 响应格式化中间件
app.use(responseFormatter);

// 健康检查端点
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    const dbHost = process.env.DB_HOST;
    const dbName = process.env.DB_NAME;

    res.json({
      success: true,
      message: '服务器运行正常',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        host: dbHost,
        database: dbName
      },
      tenant: process.env.TENANT_CODE || 'k_tenant'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 简化的认证路由
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { phone, password, tenantCode } = req.body;

    // 临时：固定管理员账号
    if (phone === 'admin' && password === 'admin123') {
      res.json({
        success: true,
        message: '登录成功',
        data: {
          token: 'mock-admin-token',
          user: {
            id: 1,
            phone: 'admin',
            name: '系统管理员',
            role: 'admin',
            tenantCode: tenantCode || 'k_tenant'
          }
        }
      });
      return;
    }

    // 临时：固定园长账号
    if (phone === 'principal' && password === 'principal123') {
      res.json({
        success: true,
        message: '登录成功',
        data: {
          token: 'mock-principal-token',
          user: {
            id: 2,
            phone: 'principal',
            name: '测试园长',
            role: 'principal',
            tenantCode: tenantCode || 'k001'
          }
        }
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 租户管理路由
app.get('/api/tenants', async (req: Request, res: Response) => {
  try {
    // 模拟租户数据
    const tenants = [
      {
        id: 1,
        code: 'k001',
        name: '阳光幼儿园',
        domain: 'k001.yyup.cc',
        status: 'active',
        databaseName: 'tenant_k001',
        adminName: '王园长',
        adminPhone: '13800138001'
      },
      {
        id: 2,
        code: 'k002',
        name: '快乐幼儿园',
        domain: 'k002.yyup.cc',
        status: 'active',
        databaseName: 'tenant_k002',
        adminName: '李园长',
        adminPhone: '13800138002'
      }
    ];

    res.json({
      success: true,
      data: tenants,
      message: '租户列表获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取租户列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 租户创建路由
app.post('/api/tenants/create', async (req: Request, res: Response) => {
  try {
    const tenantData = req.body;

    // 模拟租户创建
    const newTenant = {
      id: Date.now(),
      ...tenantData,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    console.log('🏢 创建新租户:', newTenant);

    res.json({
      success: true,
      data: newTenant,
      message: '租户创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '租户创建失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 租户令牌生成路由
app.post('/api/tenant-token/generate', async (req: Request, res: Response) => {
  try {
    const { userPhone, tenantCode } = req.body;

    // 模拟令牌生成
    const token = `tenant-token-${tenantCode}-${Date.now()}`;

    res.json({
      success: true,
      data: {
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        tenantCode,
        userPhone
      },
      message: '租户令牌生成成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '令牌生成失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 数据库统计路由
app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
  try {
    // 模拟统计数据
    const stats = {
      students: 150,
      teachers: 20,
      classes: 8,
      activities: 25,
      revenue: 125000,
      growth: 12.5
    };

    res.json({
      success: true,
      data: stats,
      message: '统计数据获取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// Swagger文档
setupSwagger(app);

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API端点不存在',
    path: req.originalUrl
  });
});

// 启动服务器
async function startServer() {
  try {
    console.log('🚀 正在启动简化版后端服务器...');
    console.log('📊 数据库配置:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      useRemoteDB: process.env.USE_REMOTE_DB,
      disableSQLite: process.env.DISABLE_SQLITE
    });

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      console.log(`🎉 简化版后端服务器启动成功!`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`🏢 租户管理: http://localhost:${PORT}/api/tenants`);
    });

    // 优雅关闭处理
    process.on('SIGTERM', () => {
      console.log('🔚 收到SIGTERM信号，正在关闭服务器...');
      server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();