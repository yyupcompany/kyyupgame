/**
 * Swagger 中间件
 * 初始化和配置 Swagger/OpenAPI 文档服务
 */

import { Express, Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '../config/swagger-config';

/**
 * 初始化 Swagger 文档
 * @param app Express 应用实例
 */
export function initializeSwagger(app: Express): void {
  try {
    // 生成 OpenAPI 规范
    const specs = swaggerJsdoc(swaggerOptions);

    // 配置 Swagger UI
    const swaggerUiOptions: any = {
      customCss: `
        .swagger-ui .topbar {
          background-color: #1890ff;
        }
        .swagger-ui .scheme-container {
          background-color: #f0f2f5;
        }
        .swagger-ui .info .title {
          color: #1890ff;
        }
      `,
      customSiteTitle: '幼教系统 API 文档',
      swaggerOptions: {
        deepLinking: true,
        layout: 'StandaloneLayout',
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true
      }
    };

    // 挂载 Swagger UI
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(specs, swaggerUiOptions)
    );

    // 提供原始 OpenAPI 规范 JSON
    app.get('/api/docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });

    // 提供 OpenAPI 规范 YAML
    app.get('/api/docs.yaml', (req, res) => {
      res.setHeader('Content-Type', 'application/yaml');
      res.send(swaggerJsdoc({
        ...swaggerOptions,
        definition: {
          ...swaggerOptions.definition,
          // YAML 格式配置
        }
      }));
    });

    console.log(`
╔════════════════════════════════════════════════════════════╗
║                 📚 Swagger API 文档已启动                  ║
╚════════════════════════════════════════════════════════════╝

📖 访问地址:
   • 交互式文档: http://localhost:3000/api/docs
   • JSON 规范:   http://localhost:3000/api/docs.json
   • YAML 规范:   http://localhost:3000/api/docs.yaml

✨ 功能:
   • 查看所有 API 端点
   • 查看请求/响应示例
   • 直接在浏览器中测试 API
   • 下载 OpenAPI 规范

💡 提示:
   使用认证: 在 Swagger UI 中点击右上角"Authorize"按钮添加 JWT token

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  } catch (error) {
    console.error('❌ Swagger 初始化失败:', error);
  }
}

export default initializeSwagger;

