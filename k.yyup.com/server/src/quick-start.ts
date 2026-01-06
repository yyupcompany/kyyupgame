/**
 * 快速启动脚本 - 用于API测试和调试
 * 跳过复杂的模型初始化，使用简化的启动流程
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from './config/database-unified';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 获取数据库配置
const dbConfig = getDatabaseConfig();

// 创建简化的 Sequelize 实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging
  }
);

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000;

// 基础中间件
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`📝 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, body);
  };
  
  next();
});

// 健康检查端点
app.get('/health', async (req: Request, res: Response) => {
  try {
    let dbStatus = 'unknown';
    try {
      await sequelize.authenticate();
      dbStatus = 'connected';
    } catch (dbError) {
      dbStatus = 'disconnected';
      console.error('数据库连接检查失败:', dbError);
    }
    
    res.json({ 
      status: 'ok',
      message: '服务运行正常',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      server: 'quick-start'
    });
  } catch (error) {
    console.error('健康检查错误:', error);
    res.status(500).json({ 
      status: 'error',
      message: '健康检查失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 根路由
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: '幼儿园管理系统API - 快速启动模式',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-quick'
  });
});

// 模拟API端点 - 用于测试
app.get('/api/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      items: [
        { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
        { id: 2, username: 'teacher', email: 'teacher@example.com', role: 'teacher' }
      ],
      total: 2
    }
  });
});

app.get('/api/teachers', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      items: [
        { id: 1, name: '张老师', subject: '数学', experience: 5 },
        { id: 2, name: '李老师', subject: '语文', experience: 3 }
      ],
      total: 2
    }
  });
});

app.get('/api/students', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      items: [
        { id: 1, name: '小明', age: 5, class: '大班A' },
        { id: 2, name: '小红', age: 4, class: '中班B' }
      ],
      total: 2
    }
  });
});

// 园长功能API
app.get('/api/principal/dashboard', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalStudents: 120,
      totalTeachers: 15,
      totalClasses: 8,
      enrollmentRate: 0.85,
      pendingApplications: 12
    }
  });
});

// 简化的AI统一智能接口
app.post('/api/ai/unified/unified-intelligence', (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    // 模拟智能处理逻辑
    const complexity = message.length > 100 ? 'complex' : 
                      message.length > 50 ? 'moderate' : 'simple';
    
    const intent = message.includes('创建') || message.includes('制定') ? 'creation' :
                  message.includes('分析') || message.includes('查看') ? 'analysis' :
                  'general_assistance';

    // 返回模拟响应
    res.json({
      success: true,
      data: {
        message: `基于您的请求"${message}"，我为您提供以下专业建议：\n\n• 首先，需要明确具体的目标和要求\n• 制定详细的实施计划和时间安排\n• 确保资源配置和人员分工合理\n• 建立监控机制和效果评估标准\n\n如需更详细的方案，请提供更多具体信息。`,
        analysis: {
          intent: intent,
          complexity: complexity,
          complexityScore: complexity === 'complex' ? 0.9 : 
                          complexity === 'moderate' ? 0.6 : 0.3
        }
      },
      metadata: {
        executionTime: Math.floor(Math.random() * 1000) + 500,
        toolsUsed: ['simplified_ai'],
        confidenceScore: 0.8,
        nextSuggestedActions: [],
        complexity: complexity,
        approach: 'simplified_processing'
      }
    });

  } catch (error) {
    console.error('AI处理错误:', error);
    res.status(500).json({
      success: false,
      error: '智能处理失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 404处理
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.method} ${req.originalUrl} 不存在 (快速启动模式)`,
      timestamp: new Date().toISOString()
    }
  });
});

// 错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ 错误:', err.message);
  
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器内部错误',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// 启动服务器
const startQuickServer = async () => {
  try {
    console.log('🚀 正在启动快速服务器...');
    
    // 测试数据库连接
    console.log('📊 正在测试数据库连接...');
    try {
      await sequelize.authenticate();
      console.log('✅ 数据库连接成功');
    } catch (dbError) {
      console.warn('⚠️ 数据库连接失败，但服务器将继续运行:', dbError);
    }
    
    // 启动服务器
    const server = app.listen(port, () => {
      console.log('🎉 快速服务器启动成功!');
      console.log(`📍 服务器地址: http://localhost:${port}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
      console.log('📋 可用端点:');
      console.log('   - GET  /health              - 健康检查');
      console.log('   - GET  /api/users           - 用户列表');
      console.log('   - GET  /api/teachers        - 教师列表');
      console.log('   - GET  /api/students        - 学生列表');
      console.log('   - GET  /api/principal/dashboard - 园长仪表板');
    });
    
    // 设置服务器超时
    server.timeout = 30000; // 30秒超时
    
    // 处理服务器错误
    server.on('error', (error: any) => {
      console.error('❌ 服务器错误:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${port} 已被占用`);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ 快速服务器启动失败:', error);
    process.exit(1);
  }
};

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('📡 收到SIGTERM信号，正在关闭服务器...');
  sequelize.close().then(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('📡 收到SIGINT信号，正在关闭服务器...');
  sequelize.close().then(() => process.exit(0));
});

// 启动服务器
startQuickServer();