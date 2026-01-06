import express from 'express';
import cors from 'cors';
import { setupSwagger } from './config/swagger.config';

const app = express();
const PORT = 3001;

// 基础中间件
app.use(cors());
app.use(express.json());

// 设置Swagger文档
setupSwagger(app);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'up',
    service: 'docs-server',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// 首页重定向到API文档
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`📚 API文档服务器已启动`);
  console.log(`🌐 服务地址: http://localhost:${PORT}`);
  console.log(`📖 API文档: http://localhost:${PORT}/api-docs`);
  console.log(`📄 JSON规范: http://localhost:${PORT}/api-docs.json`);
});

export default app;