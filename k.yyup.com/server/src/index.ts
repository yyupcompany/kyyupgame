import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { QueryTypes } from 'sequelize';
import { createServer } from 'http';
import sequelize from './config/sequelize';
import { initModels } from './models';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import enrollmentStatisticsRoutes from './routes/enrollment-statistics.routes';
import { RouteCacheService } from './services/route-cache.service';
import { PermissionWatcherService } from './services/permission-watcher.service';
import { initializeSwagger } from './middlewares/swagger.middleware';
// 🔧 已移除 SocketProgressMiddleware - 不再使用WebSocket

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('加载环境变量，当前目录:', __dirname);
console.log('环境变量文件路径:', path.resolve(__dirname, '../.env'));

// ===== 全局错误处理和防崩溃机制 =====

// 处理未捕获的异常
process.on('uncaughtException', (error: any) => {
  // 🔧 防止 EPIPE 死循环：如果是管道断开错误，直接返回不处理
  if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
    return; // 静默忽略管道断开错误，避免形成死循环
  }

  // 记录到日志文件（不使用 console.error 避免触发 EPIPE）
  const fs = require('fs');
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
  const fs = require('fs');
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

// 处理进程信号
process.on('SIGTERM', () => {
  console.log('📡 收到SIGTERM信号，正在优雅关闭服务器...');
  gracefulShutdown();
});

process.on('SIGINT', () => {
  console.log('📡 收到SIGINT信号，正在优雅关闭服务器...');
  gracefulShutdown();
});

// 优雅关闭函数
const gracefulShutdown = () => {
  console.log('🔄 开始优雅关闭流程...');
  
  // 停止权限变更监听
  try {
    PermissionWatcherService.stopWatching();
    console.log('✅ 权限变更监听服务已停止');
  } catch (error) {
    console.warn('⚠️  停止权限监听服务时出错:', error);
  }
  
  // 关闭数据库连接
  sequelize.close().then(() => {
    console.log('✅ 数据库连接已关闭');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ 关闭数据库连接时出错:', error);
    process.exit(1);
  });
  
  // 设置超时，如果10秒内无法优雅关闭，强制退出
  setTimeout(() => {
    console.error('⏰ 优雅关闭超时，强制退出');
    process.exit(1);
  }, 10000);
};

// ===== Express应用配置 =====

// 初始化Express应用
const app = express();
const port = parseInt(process.env.PORT || '3000', 10); // 修改默认端口为3000，确保类型为 number

// 🔧 【请求体大小限制】增加到50mb，解决AI对话历史过长导致的请求失败问题
// 注意：app.ts 中也有相同的配置，确保两处保持一致
app.use(express.json({
  limit: '50mb',
  type: 'application/json',
  verify: (req, res, buf, encoding) => {
    try {
      // 强制使用UTF-8编码解析
      let content = buf.toString('utf8');

      // 检测并修复常见的编码问题
      if (content.includes('�') || content.includes('?')) {
        console.warn('🔧 检测到编码问题，尝试修复...');

        // 尝试不同的编码方式
        const encodings = ['utf8', 'latin1', 'ascii'];
        for (const enc of encodings) {
          try {
            const testContent = buf.toString(enc as BufferEncoding);
            JSON.parse(testContent);
            content = testContent;
            console.log(`✅ 使用 ${enc} 编码成功解析`);
            break;
          } catch (e) {
            // 继续尝试下一个编码
          }
        }
      }

      JSON.parse(content);
    } catch (e) {
      console.error('JSON解析错误:', e);
      throw new Error('无效的JSON格式');
    }
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
  type: 'application/x-www-form-urlencoded'
}));

// 添加UTF-8编码处理中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  // 设置响应编码
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 确保请求体正确解码
  if (req.body && typeof req.body === 'object') {
    try {
      // 递归处理对象中的字符串，确保正确编码
      const processObject = (obj: any): any => {
        if (typeof obj === 'string') {
          // 检查是否是乱码，如果是则尝试重新解码
          if (obj.includes('?') && obj.length > 10) {
            console.warn('检测到可能的编码问题:', obj.substring(0, 50));

            // 尝试修复编码问题
            try {
              // 如果字符串主要由问号组成，可能是编码问题
              const questionMarkRatio = (obj.match(/\?/g) || []).length / obj.length;
              if (questionMarkRatio > 0.3) {
                // 尝试从原始请求中重新获取正确的字符串
                // 这里我们返回一个提示，让用户知道编码有问题
                console.error('🚨 严重编码问题，字符串主要由问号组成:', obj);
                return '[编码错误：请使用UTF-8编码发送请求]';
              }
            } catch (error) {
              console.error('编码修复失败:', error);
            }
          }
          return obj;
        } else if (Array.isArray(obj)) {
          return obj.map(processObject);
        } else if (obj && typeof obj === 'object') {
          const processed: any = {};
          for (const [key, value] of Object.entries(obj)) {
            processed[key] = processObject(value);
          }
          return processed;
        }
        return obj;
      };

      req.body = processObject(req.body);
    } catch (error) {
      console.error('编码处理错误:', error);
    }
  }

  next();
});

// 中间件 - 添加错误处理
app.use((req: Request, res: Response, next: NextFunction) => {
  try {
    helmet({
      contentSecurityPolicy: false // 禁用CSP以便调试
    })(req, res, next);
  } catch (error) {
    console.error('Helmet中间件错误:', error);
    next();
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  try {
    cors()(req, res, next);
  } catch (error) {
    console.error('CORS中间件错误:', error);
    next();
  }
});

// 请求日志中间件
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

// 配置静态文件服务 - 添加错误处理
try {
  const uploadsPath = path.join(__dirname, '../../uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log(`✅ 静态文件服务已配置，指向目录: ${uploadsPath}`);

  // 添加对 /images 路径的支持（用于海报模板图片）
  app.use('/images', express.static(uploadsPath + '/images'));
  console.log(`✅ 图片静态文件服务已配置，指向目录: ${uploadsPath}/images`);

  // 配置前端静态文件服务 - 指向构建后的dist目录
  const clientDistPath = path.join(__dirname, '../../client/dist');

  // 为ES模块设置正确的MIME类型
  app.use(express.static(clientDistPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
    }
  }));
  console.log(`✅ 前端静态文件服务已配置，指向目录: ${clientDistPath}`);
} catch (error) {
  console.error('❌ 配置静态文件服务失败:', error);
}

// 初始化模型 - 添加错误处理
try {
  initModels(sequelize);
  console.log('✅ 数据库模型初始化成功');
} catch (error) {
  console.error('❌ 数据库模型初始化失败:', error);
}

// 根路由 - 添加错误处理
app.get('/', (req: Request, res: Response) => {
  try {
    res.json({ 
      message: '幼儿园招生管理系统API',
      status: 'running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('根路由错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 健康检查路由 - 增强版
app.get('/health', async (req: Request, res: Response) => {
  try {
    // 检查数据库连接
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
      memory: process.memoryUsage(),
      version: process.version
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

// 直接访问模拟待办事项API（无需认证）
app.get('/api/direct/mock-todos', (req: Request, res: Response) => {
  try {
    // 生成模拟待办事项列表
    const mockTodos = [
      {
        id: 1,
        title: '准备招生宣传材料',
        description: '为春季招生准备宣传手册和海报',
        priority: 2,
        status: 'pending',
        dueDate: new Date('2025-06-20'),
        completedDate: null,
        userId: 1,
        assignedTo: null,
        tags: ['招生', '宣传'],
        createdAt: new Date('2025-06-01'),
        updatedAt: new Date('2025-06-01')
      },
      {
        id: 2,
        title: '联系家长安排面谈',
        description: '与报名的家长联系，安排面谈时间',
        priority: 1,
        status: 'in_progress',
        dueDate: new Date('2025-06-15'),
        completedDate: null,
        userId: 1,
        assignedTo: null,
        tags: ['招生', '面谈'],
        createdAt: new Date('2025-06-02'),
        updatedAt: new Date('2025-06-05')
      },
      {
        id: 3,
        title: '准备园长会议材料',
        description: '整理本月招生数据，准备园长会议汇报材料',
        priority: 3,
        status: 'pending',
        dueDate: new Date('2025-06-25'),
        completedDate: null,
        userId: 1,
        assignedTo: null,
        tags: ['会议', '汇报'],
        createdAt: new Date('2025-06-03'),
        updatedAt: new Date('2025-06-03')
      }
    ];
    
    res.json({
      success: true,
      message: '获取待办事项列表成功',
      data: {
        items: mockTodos,
        total: mockTodos.length,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    });
  } catch (error: any) {
    console.error('模拟待办事项API错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取待办事项列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 直接访问招生统计数据
app.get('/api/direct/enrollment-statistics/plans', async (req: Request, res: Response) => {
  try {
    const [plans] = await sequelize.query(`
      SELECT 
        ep.id,
        ep.title as name,
        ep.year,
        CASE ep.semester WHEN 1 THEN '春季' WHEN 2 THEN '秋季' END as term,
        ep.start_date as startDate,
        ep.end_date as endDate,
        ep.target_count as targetCount,
        (SELECT COUNT(*) FROM enrollment_applications WHERE plan_id = ep.id) as applicationCount,
        (SELECT COUNT(*) FROM admission_results WHERE plan_id = ep.id AND status = 'accepted') as admittedCount
      FROM 
        enrollment_plans ep
      WHERE 
        ep.deleted_at IS NULL
      ORDER BY
        ep.year DESC, ep.semester ASC
    `, { type: QueryTypes.SELECT });
    
    const formattedPlans = (plans as any[]).map(plan => ({
      ...plan,
      startDate: plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : null,
      endDate: plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : null,
    }));
    
    res.json({
      success: true,
      data: formattedPlans
    });
  } catch (error) {
    console.error('获取招生计划统计数据失败:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '获取招生计划统计数据失败',
        detail: error instanceof Error ? error.message : '未知错误'
      }
    });
  }
});

// 路由挂载 - 添加错误处理
try {
  // 直接挂载招生统计路由，不需要前缀
  app.use('/enrollment-statistics', enrollmentStatisticsRoutes);
  console.log('✅ 招生统计路由已挂载');
} catch (error) {
  console.error('❌ 挂载招生统计路由失败:', error);
}

try {
  // 初始化 Swagger 文档
  initializeSwagger(app);
  console.log('✅ Swagger 文档已初始化');
} catch (error) {
  console.error('⚠️  Swagger 初始化失败:', error);
}

try {
  // 使用API路由
  app.use('/api', routes);
  console.log('✅ API路由已挂载');
} catch (error) {
  console.error('❌ 挂载API路由失败:', error);
}

// 使用错误处理中间件
app.use(errorHandler);

// 404处理中间件
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.method} ${req.originalUrl} 不存在`,
      timestamp: new Date().toISOString()
    }
  });
});

// 最后的错误处理中间件 - 增强版
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ 全局错误处理器捕获错误:');
  console.error('错误信息:', err.message);
  console.error('错误堆栈:', err.stack);
  console.error('请求路径:', req.method, req.path);
  console.error('请求体:', req.body);
  
  // 记录到错误日志
  const fs = require('fs');
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
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
  
  const attemptStart = async (): Promise<void> => {
    try {
      console.log('🚀 正在启动服务器...');
      
      // 测试数据库连接
      console.log('📊 正在测试数据库连接...');
      await sequelize.authenticate();
      console.log('✅ 数据库连接成功');
      
      // 🚀 关键步骤：初始化路由缓存系统
      console.log('🔄 正在初始化路由缓存系统...');
      try {
        await RouteCacheService.initializeRouteCache();
        console.log('✅ 路由缓存系统初始化完成');
        
        // 启动权限变更监听
        try {
          PermissionWatcherService.startWatching();
          console.log('✅ 权限变更监听服务已启动');
        } catch (watcherError) {
          console.warn('⚠️  权限变更监听启动失败:', watcherError);
          console.log('💡 将继续运行，可通过手动刷新缓存');
        }
        
      } catch (error) {
        console.error('❌ 路由缓存系统初始化失败:', error);
        console.log('⚠️  将使用降级模式（直接数据库查询）继续启动...');
        
        // 尝试启动权限变更监听（即使缓存初始化失败）
        try {
          PermissionWatcherService.startWatching();
          console.log('✅ 权限变更监听服务已启动（降级模式）');
        } catch (watcherError) {
          console.warn('⚠️  权限变更监听启动失败:', watcherError);
        }
      }
      
      // 禁用自动同步，改为使用迁移
      console.log('⚠️  注意：已禁用自动数据库同步功能，请使用迁移脚本管理数据库结构');

      // 创建HTTP服务器
      const httpServer = createServer(app);

      // 🔧 已移除Socket.IO中间件 - 直接使用HTTP API调用AIBridge
      console.log('✅ 使用HTTP API模式，无需Socket.IO');

      // 启动服务器 - 监听所有接口（包括 IPv4 和 IPv6）
      const server = httpServer.listen(port, '::', () => {
        console.log('🎉 服务器启动成功!');
        console.log(`📍 服务器地址: http://localhost:${port}`);
        console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
        console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
        console.log('📋 可用端点:');
        console.log('   - GET  /health           - 健康检查');
        console.log('   - GET  /api/direct/mock-todos - 模拟待办事项');
        console.log('   - POST /api/auth/login   - 用户登录');
        console.log('   - GET  /api/users        - 用户列表');
        console.log('   - GET  /api/kindergartens - 幼儿园列表');
        console.log('   - POST /api/ai-query     - AI查询接口 (HTTP API)');
        console.log('   - GET  /api-docs         - API文档 (Swagger UI)');

        // 🔍 自动验证和创建API文档
        console.log('\n🔍 开始API文档验证和创建流程...');
        setTimeout(() => {
          validateAndCreateApiDocs();
        }, 5000); // 等待5秒后执行，确保服务器完全启动
      });

      // 设置服务器超时 - 修复Navigation timeout问题
      server.timeout = 120000; // 2分钟超时，避免页面加载超时
      
      // 处理服务器错误
      server.on('error', (error: any) => {
        console.error('❌ 服务器错误:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ 端口 ${port} 已被占用，请检查是否有其他服务在运行`);
          process.exit(1);
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
        process.exit(1);
      }
    }
  };
  
  await attemptStart();
};

// 🔍 API文档验证和创建函数
async function validateAndCreateApiDocs() {
  try {
    console.log('📋 开始验证API文档...');

    // 导入验证和创建脚本
    const {
      checkSwaggerExists,
      scanRouteFiles,
      analyzeSwaggerComments,
      generateBasicSwagger,
      generateReport
    } = await import('../scripts/validate-and-create-api-docs.js');

    const swaggerConfig = {
      swaggerPath: path.join(__dirname, '../swagger.json'),
      routesDir: path.join(__dirname, '../src/routes'),
      minCoverage: 80
    };

    // 1. 检查Swagger文档是否存在
    let swaggerExists = checkSwaggerExists(swaggerConfig.swaggerPath);

    if (!swaggerExists) {
      console.log('⚠️  Swagger文档不存在，正在创建基础结构...');
      swaggerExists = generateBasicSwagger(swaggerConfig.swaggerPath);
      if (swaggerExists) {
        console.log('✅ 基础Swagger文档已创建');
      } else {
        console.error('❌ 基础Swagger文档创建失败');
        return;
      }
    } else {
      console.log('✅ Swagger文档已存在');
    }

    // 2. 分析路由文件和Swagger注释覆盖率
    const routeFiles = scanRouteFiles(swaggerConfig.routesDir);
    const analysis = analyzeSwaggerComments(routeFiles, swaggerConfig.routesDir);

    console.log(`📊 文档覆盖率分析:`);
    console.log(`   - 总路由文件: ${analysis.totalFiles} 个`);
    console.log(`   - 有Swagger注释: ${analysis.filesWithSwagger} 个`);
    console.log(`   - 覆盖率: ${analysis.coverageRate.toFixed(1)}%`);
    console.log(`   - Swagger注释总数: ${analysis.totalSwaggerComments} 个`);
    console.log(`   - 路由定义总数: ${analysis.totalRouteDefinitions} 个`);

    // 3. 生成详细报告
    const report = generateReport(swaggerExists, analysis, true);

    // 4. 根据覆盖率提供建议
    if (analysis.coverageRate < 80) {
      console.log('\n💡 API文档改进建议:');
      console.log('   1. 为缺少Swagger注释的路由文件添加文档');
      console.log('   2. 使用以下工具快速添加文档:');
      console.log('      - 运行: npm run api-docs:check');
      console.log('      - 生成: npm run api-docs:generate');
      console.log('   3. 访问 http://localhost:3000/api-docs 查看API文档');
    } else {
      console.log('\n🎉 API文档质量良好！');
    }

    // 5. 输出统计信息
    console.log('\n📋 API文档状态总结:');
    console.log(`   - Swagger文件: ${swaggerExists ? '✅' : '❌'} ${swaggerExists ? '存在' : '不存在'}`);
    console.log(`   - 文档覆盖率: ${analysis.coverageRate >= 80 ? '✅' : '⚠️'} ${analysis.coverageRate.toFixed(1)}%`);
    console.log(`   - API文档端点: ✅ http://localhost:3000/api-docs`);

    // 保存验证报告
    const reportPath = path.join(__dirname, '../logs/api-docs-validation-report.json');
    const fs = require('fs');

    try {
      if (!fs.existsSync(path.dirname(reportPath))) {
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      }
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 详细报告已保存: ${reportPath}`);
    } catch (err) {
      console.warn('⚠️ 无法保存验证报告:', (err as Error).message);
    }

    console.log('\n🔗 API文档链接:');
    console.log('   - Swagger UI: http://localhost:3000/api-docs');
    console.log('   - JSON格式: http://localhost:3000/api-docs.json');

  } catch (error) {
    console.error('❌ API文档验证失败:', error);

    // 尝试使用备用方案
    try {
      console.log('🔄 尝试使用备用方案创建基础API文档...');
      const fs = require('fs');
      const path = require('path');

      const basicSwagger = {
        openapi: '3.0.0',
        info: {
          title: '幼儿园管理系统API',
          version: '1.0.0',
          description: '幼儿园管理系统的RESTful API文档'
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: '开发服务器'
          }
        ],
        paths: {},
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        }
      };

      const swaggerPath = path.join(__dirname, '../swagger.json');
      fs.writeFileSync(swaggerPath, JSON.stringify(basicSwagger, null, 2));
      console.log('✅ 备用方案：基础Swagger文档已创建');
    } catch (backupError) {
      console.error('❌ 备用方案也失败了:', backupError);
    }
  }
}

// 执行启动
startServer().catch((error) => {
  console.error('❌ 启动服务器时发生未捕获错误:', error);
  process.exit(1);
}); 