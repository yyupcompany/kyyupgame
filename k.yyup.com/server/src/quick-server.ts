import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sequelize } from './init';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import path from 'path';

const app = express();
const PORT = 3000;

console.log('🚀 快速启动模式...');

// 基础中间件
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// API路由
app.use('/api', routes);

// 错误处理
app.use(errorHandler);

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ 服务器启动成功！`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV}`);
  
  // 异步初始化Redis和缓存（不阻塞启动）
  setTimeout(async () => {
    try {
      const { PermissionPreloadService } = await import('./services/permission-preload.service');
      await PermissionPreloadService.initialize();
      console.log('✅ 权限预加载完成');
    } catch (error) {
      console.warn('⚠️  权限预加载失败，将使用数据库查询:', error);
    }
  }, 1000);
});

// 优雅退出
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    sequelize.close();
    process.exit(0);
  });
});





