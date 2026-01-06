import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiMainRoutes from './routes/index';

import { errorHandler } from './middlewares/errorHandler';
import { sequelize } from './init'; // 直接导入已初始化的sequelize实例
import fs from 'fs';
import path from 'path';
import { ensurePortAvailable } from './utils/port-utils';
import { setupHMR } from './hmr';
import http from 'http';

// 加载环境变量
// 先加载 .env 文件，再加载 .env.local 文件（.env.local 会覆盖 .env）
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 手动加载 .env.local 文件并覆盖环境变量
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf-8');
  const envLocalVars = dotenv.parse(envLocalContent);
  // 覆盖环境变量
  Object.assign(process.env, envLocalVars);
  console.log('✅ .env.local 文件已加载并覆盖环境变量');
}

console.log('加载环境变量，当前目录:', __dirname);
console.log('环境变量文件路径:', path.resolve(__dirname, '../.env'));
console.log('环境变量文件路径:', envLocalPath);
console.log('环境变量JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
console.log('环境变量SYSTEM_OSS_ACCESS_KEY_ID:', process.env.SYSTEM_OSS_ACCESS_KEY_ID ? '已设置' : '未设置');
console.log('环境变量SYSTEM_OSS_ACCESS_KEY_ID 值:', process.env.SYSTEM_OSS_ACCESS_KEY_ID ? process.env.SYSTEM_OSS_ACCESS_KEY_ID.substring(0, 10) + '...' : '未设置');

// ===== 全局错误处理和防崩溃机制 =====

// 处理未捕获的异常
process.on('uncaughtException', (error: any) => {
  // 🔧 防止 EPIPE 死循环：如果是管道断开错误，直接返回不处理
  if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
    return; // 静默忽略管道断开错误，避免形成死循环
  }

  // 记录到日志文件（不使用 console.error 避免触发 EPIPE）
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (e) {
      // 忽略目录创建失败
    }
  }

  const logFile = path.join(logDir, 'uncaught-exceptions.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] 未捕获异常: ${error.message}\n堆栈: ${error.stack}\n\n`;

  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (logError) {
    // 无法写入日志文件，静默忽略
  }

  // 不要立即退出，给服务器一个机会继续运行
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  // 🔧 防止 EPIPE 死循环：如果是管道断开错误，直接返回不处理
  if (reason && typeof reason === 'object' && (reason.code === 'EPIPE' || reason.code === 'ECONNRESET')) {
    return; // 静默忽略管道断开错误，避免形成死循环
  }

  // 记录到日志文件（不使用 console.error 避免触发 EPIPE）
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (e) {
      // 忽略目录创建失败
    }
  }

  const logFile = path.join(logDir, 'unhandled-rejections.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] 未处理Promise拒绝: ${reason}\n\n`;

  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (logError) {
    // 无法写入日志文件，静默忽略
  }

  // 不要立即退出，给服务器一个机会继续运行
});

// 优雅关闭函数
const gracefulShutdown = (server?: http.Server) => {
  console.log('🔄 开始优雅关闭流程...');
  
  if (server) {
    server.close(() => {
      console.log('✅ HTTP服务器已关闭');
      
      // 关闭数据库连接
      sequelize.close().then(() => {
        console.log('✅ 数据库连接已关闭');
        process.exit(0);
      }).catch((error) => {
        console.error('❌ 关闭数据库连接时出错:', error);
        process.exit(1);
      });
    });
  } else {
    // 如果没有服务器实例，直接关闭数据库
    sequelize.close().then(() => {
      console.log('✅ 数据库连接已关闭');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ 关闭数据库连接时出错:', error);
      process.exit(1);
    });
  }
  
  // 设置超时，如果10秒内无法优雅关闭，强制退出
  setTimeout(() => {
    console.error('⏰ 优雅关闭超时，强制退出');
    process.exit(1);
  }, 10000);
};

// ===== Express应用配置 =====

// 创建Express应用
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// 添加一个打印所有路由的函数
const printRoutes = (app: express.Application) => {
  const routeInfo: string[] = [];

  // 添加API前缀路由
  routeInfo.push(`路由: [ALL] /api - API主入口`);
  console.log(`路由: [ALL] /api - API主入口`);
  
  // 测试API路由
  routeInfo.push(`路由: [ALL] /api/test - 测试API(无权限验证)`);
  console.log(`路由: [ALL] /api/test - 测试API(无权限验证)`);
  
  // 健康检查路由
  routeInfo.push(`路由: [GET] /health - 健康检查`);
  console.log(`路由: [GET] /health - 健康检查`);
  
  // 静态文件服务
  routeInfo.push(`路由: [GET] /uploads - 静态文件服务`);
  console.log(`路由: [GET] /uploads - 静态文件服务`);
  
  // 从routes/index.ts中获取路由信息
  routeInfo.push(`\n=== API路由 (前缀: /api) ===`);
  console.log(`\n=== API路由 (前缀: /api) ===`);
  
  [
    { path: '/', desc: 'API信息路由' },
    { path: '/list', desc: 'API列表路由' },
    { path: '/auth', desc: '认证相关路由' },
    { path: '/users', desc: '用户管理' },
    { path: '/roles', desc: '角色管理' },
    { path: '/permissions', desc: '权限管理' },
    { path: '/user-roles', desc: '用户角色关联' },
    { path: '/role-permissions', desc: '角色权限关联' },
    { path: '/admin', desc: '管理员路由' },
    { path: '/dashboard', desc: '仪表盘' },
    { path: '/principal/customer-pool', desc: '园长客户池' },
    { path: '/customer-pool', desc: '客户池' },
    { path: '/kindergartens', desc: '幼儿园管理' },
    { path: '/classes', desc: '班级管理' },
    { path: '/teachers', desc: '教师管理' },
    { path: '/students', desc: '学生管理' },
    { path: '/parents', desc: '家长管理' },
    { path: '/enrollment-plans', desc: '招生计划' },
    { path: '/enrollment-quotas', desc: '招生配额' },
    { path: '/enrollment-applications', desc: '招生申请' },
    { path: '/enrollment-consultations', desc: '招生咨询' },
    { path: '/enrollment-statistics', desc: '招生统计' },
    { path: '/activity-plans', desc: '活动计划' },
    { path: '/activity-registrations', desc: '活动注册' },
    { path: '/activity-checkins', desc: '活动签到' },
    { path: '/activity-evaluations', desc: '活动评价' },
    { path: '/advertisements', desc: '广告管理' },
    { path: '/marketing-campaigns', desc: '营销活动' },
    { path: '/channel-trackings', desc: '渠道追踪' },
    { path: '/conversion-trackings', desc: '转化追踪' },
    { path: '/admission-results', desc: '录取结果' },
    { path: '/admission-notifications', desc: '录取通知' },
    { path: '/poster-templates', desc: '海报模板' },
    { path: '/poster-generations', desc: '海报生成' },
    { path: '/performance/rules', desc: '绩效规则' },
    { path: '/ai', desc: 'AI相关功能' },
    // 测试路由
    { path: '/test/kindergartens', desc: '幼儿园测试数据' },
    { path: '/test/enrollment-plans', desc: '招生计划测试数据' }, 
    { path: '/test/activities', desc: '活动测试数据' },
    { path: '/test/users', desc: '用户测试数据' },
    { path: '/test/mock-auth', desc: '模拟认证数据' }
  ].forEach(route => {
    const msg = `路由: [ALL] /api${route.path} - ${route.desc}`;
    routeInfo.push(msg);
    console.log(msg);
  });

  // 将路由信息写入日志文件
  const timestamp = new Date().toISOString();
  const routesLog = path.join(logDir, 'routes.log');
  fs.writeFileSync(routesLog, `[${timestamp}] 已注册的API路由:\n${routeInfo.join('\n')}\n`);
  console.log(`\n路由信息已记录到 ${routesLog}`);
};

// 创建日志目录
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 创建日志写入流
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

// 中间件配置 - 添加错误处理
try {
  app.use(cors());
  app.use(helmet());
  
  // 添加请求体大小限制和JSON解析错误处理
  app.use(express.json({ 
    limit: '10mb'
  }));
  
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan('combined', { stream: accessLogStream })); // 记录请求日志到文件
  app.use(morgan('dev')); // 开发环境下在控制台显示简洁日志
  
  console.log('✅ 中间件配置成功');
} catch (error) {
  console.error('❌ 中间件配置失败:', error);
}

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  // 调试：打印请求体
  if (req.path.includes('/auth/login')) {
    console.log('🔍 登录请求调试:');
    console.log('  - Content-Type:', req.headers['content-type']);
    console.log('  - 请求体:', req.body);
    console.log('  - 原始请求体:', JSON.stringify(req.body));
  }
  
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`📝 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, body);
  };
  
  next();
});

// 静态文件服务 - 添加错误处理
try {
  const uploadsPath = path.join(__dirname, '../../uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log(`✅ 静态文件服务已配置: ${uploadsPath}`);
  console.log('✅ 静态文件服务配置成功');
} catch (error) {
  console.error('❌ 静态文件服务配置失败:', error);
}

// API路由 - 添加错误处理
try {
  app.use('/api', apiMainRoutes);
  console.log('✅ API主路由挂载成功');
} catch (error) {
  console.error('❌ API主路由挂载失败:', error);
}



// 简单测试登录端点 - 不依赖数据库
app.post('/api/test/simple-login', (req, res) => {
  try {
    console.log('简单测试登录请求:', req.body);
    const { username, password } = req.body;

    if (username === 'admin' && password === '123456') {
      console.log('简单测试登录成功');
      
      res.json({
        success: true,
        data: {
          token: 'test-token-123',
          refreshToken: 'test-refresh-token-123',
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@test.com',
            realName: '管理员',
            role: 'admin',
            roleName: '管理员',
            isAdmin: true,
            kindergartenId: 1,
            roles: [{ code: 'admin', name: '管理员' }]
          }
        },
        message: '登录成功'
      });
    } else {
      res.status(200).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('简单测试登录错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器内部错误',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// 健康检查路由 - 增强版
app.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    let dbStatus = 'unknown';
    try {
      await sequelize.authenticate();
      dbStatus = 'connected';
      
      // 预热AI模型缓存
      console.log('🔥 正在预热AI模型缓存...');
      try {
        const modelCacheService = require('./services/ai/model-cache.service').default;
        await modelCacheService.warmupCache();
        console.log('✅ AI模型缓存预热完成');
      } catch (cacheError) {
        console.warn('⚠️ AI模型缓存预热失败，但服务器将继续运行:', cacheError);
      }
      
    } catch (dbError) {
      dbStatus = 'disconnected';
      console.error('数据库连接检查失败:', dbError);
    }
    
    res.status(200).json({ 
      status: 'ok',
      message: '服务运行正常',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development'
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

// 404处理中间件
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.method} ${req.originalUrl} 不存在`,
      timestamp: new Date().toISOString()
    }
  });
});

// 全局错误处理 - 增强版
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ 全局错误处理器捕获错误:');
  console.error('错误信息:', err.message);
  console.error('错误堆栈:', err.stack);
  console.error('请求路径:', req.method, req.path);
  console.error('请求体:', req.body);
  
  // 记录到错误日志
  const logFile = path.join(logDir, 'error.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${req.method} ${req.path} - ${err.message}\n堆栈: ${err.stack}\n\n`;
  
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (logError) {
    console.error('无法写入错误日志:', logError);
  }
  
  // 确保响应没有被发送过
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

// 启动服务器 - 增强版
const startServer = async () => {
  let retryCount = 0;
  const maxRetries = 3;
  let server: http.Server;
  let useMockDatabase = false;
  
  const attemptStart = async (): Promise<void> => {
    try {
      console.log('🚀 正在启动服务器...');
      
      // 检查是否在Docker环境中
      const isDocker = fs.existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true';
      
      // 只在非Docker环境中检查端口可用性
      if (!isDocker) {
        console.log(`🔍 检查端口 ${PORT} 可用性...`);
        const portAvailable = ensurePortAvailable(PORT);
        if (!portAvailable) {
          throw new Error(`无法释放端口 ${PORT}，服务器启动失败`);
        }
      } else {
        console.log('🐳 检测到Docker环境，跳过端口检查');
      }
      
      // 初始化数据库连接
      console.log('📊 正在测试数据库连接...');
      try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接已验证成功');
        
        // 预热AI模型缓存
        console.log('🔥 正在预热AI模型缓存...');
        try {
          const modelCacheService = require('./services/ai/model-cache.service').default;
          await modelCacheService.warmupCache();
          console.log('✅ AI模型缓存预热完成');
        } catch (cacheError) {
          console.warn('⚠️ AI模型缓存预热失败，但服务器将继续运行:', cacheError);
        }
        
      } catch (dbError) {
        console.error('❌ 数据库连接失败:', dbError);
        if (retryCount >= maxRetries - 1) {
          console.log('⚠️ 数据库连接失败，切换到模拟数据模式');
          useMockDatabase = true;
          // 不抛出错误，继续启动服务器
        } else {
          throw dbError; // 在重试次数未达到最大值时，继续抛出错误以触发重试
        }
      }
      
      // 创建HTTP服务器
      server = http.createServer(app);
      
      // 设置服务器超时 - 修复Navigation timeout问题
      server.timeout = 120000; // 2分钟超时，避免页面加载超时
      
      // 处理服务器错误
      server.on('error', (error: any) => {
        console.error('❌ 服务器错误:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ 端口 ${PORT} 已被占用，请检查是否有其他服务在运行`);
          process.exit(1);
        }
      });
      
      // 启动服务器
      server.listen(PORT, '0.0.0.0', () => {
        console.log('🎉 服务器启动成功!');
        console.log(`📍 服务器地址: http://localhost:${PORT}`);
        console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
        console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
        if (useMockDatabase) {
          console.log('⚠️ 正在使用模拟数据库模式');
        }
        console.log('📋 可用端点:');
        console.log('   - GET  /health           - 健康检查');
        console.log('   - POST /api/auth/login   - 用户登录');
        console.log('   - GET  /api/users        - 用户列表');
        console.log('   - GET  /api/kindergartens - 幼儿园列表');
        console.log('   - GET  /api/test/mock-auth - 模拟认证测试');
        
        // 打印所有注册的路由
        printRoutes(app);
        
        // 记录启动日志
        const timestamp = new Date().toISOString();
        const serverLog = path.join(logDir, 'server.log');
        fs.appendFileSync(serverLog, `[${timestamp}] 服务器启动成功，端口: ${PORT}\n`);
        
        // 在开发环境下启用HMR
        if (process.env.NODE_ENV === 'development') {
          try {
            setupHMR(server, path.resolve(__dirname, '../'));
            console.log('[INFO] HMR监听器已启动，正在监听文件变更...');
            console.log('已启用热模块替换(HMR)功能，文件变更将自动重载');
          } catch (hmrError) {
            console.warn('⚠️  HMR启动失败，但服务器将继续运行:', hmrError);
          }
        }
      });
      
    } catch (error) {
      console.error(`❌ 服务器启动失败 (尝试 ${retryCount + 1}/${maxRetries}):`, error);
      
      if (retryCount < maxRetries - 1) {
        retryCount++;
        console.log(`🔄 ${3}秒后重试...`);
        setTimeout(attemptStart, 3000);
      } else {
        console.error('❌ 服务器启动失败，已达到最大重试次数');
        
        // 记录错误日志
        const timestamp = new Date().toISOString();
        const errorLog = path.join(logDir, 'error.log');
        fs.appendFileSync(errorLog, `[${timestamp}] 服务器启动失败: ${error}\n`);
        
        process.exit(1);
      }
    }
  };
  
  // 处理进程终止信号
  process.on('SIGTERM', () => {
    console.log('📡 收到SIGTERM信号，正在优雅关闭服务器...');
    gracefulShutdown(server);
  });
  
  process.on('SIGINT', () => {
    console.log('📡 收到SIGINT信号，正在优雅关闭服务器...');
    gracefulShutdown(server);
  });
  
  await attemptStart();
};

// 开始启动服务器
startServer().catch((error) => {
  console.error('❌ 启动服务器时发生未捕获错误:', error);
  process.exit(1);
}); // Force reload Thu Jun 12 06:32:56 UTC 2025
