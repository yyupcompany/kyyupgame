import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiMainRoutes from './routes/index';

import { errorHandler } from './middlewares/errorHandler';
import { sequelize } from './init';
import path from 'path';
import { secureAuditLogService } from './services/secure-audit-log.service';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// 中间件配置
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api', apiMainRoutes);


// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务运行正常' });
});

// 全局错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    console.log('=== 开始启动简化服务器 ===');
    
    // 验证数据库连接
    console.log('正在验证数据库连接...');
    await sequelize.authenticate();
    console.log('数据库连接验证成功');
    
    // 初始化防篡改审计日志服务（等保三级合规）
    console.log('正在初始化安全审计日志服务...');
    await secureAuditLogService.initialize(sequelize);
    console.log('安全审计日志服务初始化成功');
    
    // 启动HTTP服务器
    console.log('正在启动HTTP服务器...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ 服务器成功启动在端口: ${PORT}`);
      console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
      console.log(`📡 API入口: http://localhost:${PORT}/api`);
      console.log(`🧪 测试API: http://localhost:${PORT}/api/test`);
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    console.error('错误详情:', error);
    
    // 即使数据库连接失败，也启动HTTP服务器
    console.log('尝试在没有数据库的情况下启动服务器...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ 服务器启动在端口: ${PORT} (数据库连接失败)`);
      console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
    });
  }
};

// 开始启动服务器
startServer(); 