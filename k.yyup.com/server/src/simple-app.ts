import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { Sequelize } from 'sequelize';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('加载环境变量，当前目录:', __dirname);
console.log('环境变量文件路径:', path.resolve(__dirname, '../.env'));

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  database: process.env.DB_NAME || 'kargerdensales',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  dialect: 'mysql' as const,
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true,
    freezeTableName: true, // 避免自动复数化
  }
};

// 初始化 Sequelize 实例
console.log('=== 开始初始化数据库连接 ===');
console.log(`数据库连接信息: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    logging: console.log
  }
);

// 初始化Express应用
const app = express();
const port = process.env.PORT || 3003;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true }));

// 添加全局错误捕获中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('全局错误捕获', err);
  next(err);
});

// 配置静态文件服务
const uploadsPath = path.join(__dirname, '../../uploads'); 
app.use('/uploads', express.static(uploadsPath));
console.log(`静态文件服务已配置，指向目录: ${uploadsPath}`);

// 根路由
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '幼儿园招生管理系统API' });
});

// 健康检查路由
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'up', 
    timestamp: new Date().toISOString(),
    checks: [
      { name: 'api', status: 'up' }
    ] 
  });
});

// 测试数据库连接
const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接测试成功');
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    process.exit(1);
  }
};

// 启动服务器
const startServer = async () => {
  try {
    console.log('======== 服务器启动流程开始 ========');
    console.log('正在连接数据库...');
    
    // 测试数据库连接
    await testConnection();
    console.log('数据库连接测试完成');
    
    // 启动服务器
    app.listen(port, () => {
      console.log(`服务器运行在 http://localhost:${port}`);
      console.log('======== 服务器启动完成 ========');
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 执行启动
startServer(); 