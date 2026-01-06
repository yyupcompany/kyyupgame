/**
 * 简化的多租户应用程序启动文件
 * 使用静态数据初始化和简化认证中间件
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// 导入简化认证中间件
import verifyTokenSimplified from './middlewares/auth-simplified.middleware';
// 导入租户解析中间件
import { tenantResolverMiddleware } from './middlewares/tenant-resolver.middleware';

// 导入静态初始化的数据库连接
import { sequelize } from './init';

// 基础路由
import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/users.routes'; // 文件不存在，已注释
import dashboardRoutes from './routes/dashboard.routes';
// import dynamicPermissionsRoutes from './routes/dynamic-permissions.routes';

// 多租户相关路由
// import tenantRoutes from './routes/tenant.routes';
import aiModuleRoutes from './routes/ai/index'; // 空的AI路由

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
    tenant: req.tenant || 'unknown'
  });
});

// API路由
app.use('/api/auth', authRoutes);
// app.use('/api/users', verifyTokenSimplified, userRoutes); // 文件不存在，已注释
app.use('/api/dashboard', verifyTokenSimplified, dashboardRoutes);
// app.use('/api/dynamic-permissions', verifyTokenSimplified, dynamicPermissionsRoutes);
// app.use('/api/tenant', verifyTokenSimplified, tenantRoutes);
app.use('/api/ai', verifyTokenSimplified, aiModuleRoutes);

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
    console.log('🚀 启动k.yyup.com多租户后端服务...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      console.log(`🌟 k.yyup.com多租户后端服务启动成功！`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
      console.log(`🏢 多租户架构已启用`);
      console.log(`🔐 简化认证中间件已启用`);
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