/**
 * 最简化的k.yyup.com后端服务
 * 仅用于验证多租户架构和端到端测试
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

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

// 健康检查路由（不需要认证）
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'k.yyup.com 简化后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: 'simplified-v1.0.0',
    env: process.env.NODE_ENV
  });
});

// 基础仪表板路由（模拟数据）
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
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

// 简化的认证路由
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 模拟登录验证
    if (username && password) {
      res.json({
        success: true,
        message: '登录成功',
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 121,
            username: username,
            role: 'admin',
            email: username + '@example.com',
            realName: '管理员',
            phone: '13800138000',
            status: 'active',
            isAdmin: true,
            kindergartenId: 1
          }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

// 用户管理路由（简化版）
app.get('/api/users', (req: Request, res: Response) => {
  try {
    const mockUsers = [
      {
        id: 121,
        username: 'admin',
        email: 'admin@example.com',
        realName: '管理员',
        role: 'admin',
        status: 'active',
        phone: '13800138000',
        createdAt: new Date().toISOString()
      },
      {
        id: 122,
        username: 'teacher1',
        email: 'teacher1@example.com',
        realName: '张老师',
        role: 'teacher',
        status: 'active',
        phone: '13800138001',
        createdAt: new Date().toISOString()
      },
      {
        id: 123,
        username: 'parent1',
        email: 'parent1@example.com',
        realName: '家长1',
        role: 'parent',
        status: 'active',
        phone: '13800138002',
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      message: '用户列表获取成功',
      data: {
        items: mockUsers,
        total: mockUsers.length,
        page: 1,
        pageSize: 10
      }
    });
  } catch (error) {
    console.error('用户列表获取失败:', error);
    res.status(500).json({
      success: false,
      message: '用户列表获取失败'
    });
  }
});

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
    console.log('🚀 启动k.yyup.com简化后端服务...');

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      console.log(`🌟 k.yyup.com简化后端服务启动成功！`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`📚 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`🔧 简化模式: 仅提供基础API用于端到端测试`);
    });

    // 优雅关闭
    process.on('SIGTERM', () => {
      console.log('📡 收到SIGTERM信号，正在关闭服务...');
      server.close(() => {
        console.log('🔌 HTTP服务器已关闭');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('📡 收到SIGINT信号，正在关闭服务...');
      server.close(() => {
        console.log('🔌 HTTP服务器已关闭');
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