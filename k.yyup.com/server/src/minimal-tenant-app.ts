/**
 * 最小化的多租户应用程序启动文件
 * 仅包含基础路由和静态数据初始化
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// 导入简化认证中间件
import verifyTokenSimplified from './middlewares/auth-simplified.middleware';
// 导入租户解析中间件
import { tenantResolverMiddleware } from './middlewares/tenant-resolver.middleware';
// 导入租户安全中间件
import { tenantSecurityMiddleware } from './middlewares/tenant-security.middleware';
// 导入租户令牌路由
import tenantTokenRoutes from './routes/tenant-token.routes';

// 导入静态初始化的数据库连接
import { sequelize } from './init';

// 基础路由
import authRoutes from './routes/auth.routes';
// import usersRoutes from './routes/users.routes'; // 文件不存在，已注释
// import permissionsRoutes from './routes/permissions.routes'; // 文件不存在，已注释

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 基础中间件
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 租户解析中间件 - 必须在认证中间件之前
app.use(tenantResolverMiddleware);

// 健康检查路由（不需要认证）
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'k.yyup.com 多租户后端服务运行正常',
    timestamp: new Date().toISOString(),
    tenant: req.tenant || 'unknown',
    env: process.env.NODE_ENV
  });
});

// 租户令牌管理路由
app.use('/api/tenant-token', tenantTokenRoutes);

// 基础仪表板路由
app.get('/api/dashboard/stats', verifyTokenSimplified, async (req: Request, res: Response) => {
  try {
    // 返回模拟的仪表板数据
    const mockStats = {
      users: { total: 150, active: 120, pending: 30 },
      classes: { total: 20, active: 18 },
      activities: { total: 50, completed: 40, ongoing: 10 }
    };

    res.json({
      success: true,
      message: '仪表板统计数据获取成功',
      data: mockStats
    });
  } catch (error) {
    console.error('仪表板数据获取失败:', error);
    res.status(500).json({
      success: false,
      message: '仪表板数据获取失败'
    });
  }
});

// 受保护的数据访问示例 - 需要MD5令牌验证
app.get('/api/protected-data', tenantSecurityMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '受保护的数据访问成功',
    data: {
      tenantInfo: (req as any).tenant,
      securityInfo: (req as any).tenantSecurity,
      protectedContent: '这是需要MD5令牌验证才能访问的敏感数据'
    }
  });
});

// 租户令牌验证演示路由
app.post('/api/demo/verify-token', (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: '缺少租户令牌',
        code: 'MISSING_TENANT_TOKEN'
      });
    }

    res.json({
      success: true,
      message: '租户令牌验证成功（演示）',
      data: {
        token: token.substring(0, 8) + '...',
        tenantInfo: (req as any).tenant
      }
    });
  } catch (error) {
    console.error('令牌验证异常:', error);
    res.status(500).json({
      success: false,
      message: '令牌验证异常',
      code: 'TOKEN_VALIDATION_ERROR'
    });
  }
});

// API路由
app.use('/api/auth', authRoutes);
// app.use('/api/users', verifyTokenSimplified, usersRoutes); // 文件不存在，已注释
// app.use('/api/permissions', verifyTokenSimplified, permissionsRoutes); // 文件不存在，已注释

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `路由 ${req.path} 未找到`
  });
});

// 全局错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[全局错误处理]:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 启动服务器
async function startServer() {
  try {
    console.log('🚀 启动k.yyup.com最小化多租户后端服务...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      console.log(`🌟 k.yyup.com最小化多租户后端服务启动成功！`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`📚 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`🔐 租户令牌: http://localhost:${PORT}/api/tenant-token`);
      console.log(`🛡️ 受保护数据: http://localhost:${PORT}/api/protected-data`);
      console.log(`🧪 令牌验证演示: http://localhost:${PORT}/api/demo/verify-token`);
      console.log(`🏢 多租户架构已启用`);
      console.log(`🔐 简化认证中间件已启用`);
      console.log(`🔒 MD5租户令牌安全系统已激活`);
      console.log(`📊 静态数据初始化已配置`);
    });

    // 优雅关闭
    process.on('SIGTERM', async () => {
      console.log('📡 收到SIGTERM信号，正在关闭服务...');
      server.close(async () => {
        console.log('🔌 HTTP服务器已关闭');
        await sequelize.close();
        console.log('🗄️ 数据库连接已关闭');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('📡 收到SIGINT信号，正在关闭服务...');
      server.close(async () => {
        console.log('🔌 HTTP服务器已关闭');
        await sequelize.close();
        console.log('🗄️ 数据库连接已关闭');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 启动服务
startServer();

export default app;