/**
 * Swagger/OpenAPI 配置文件
 * 为后端 API 生成交互式文档
 */

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '幼教系统 API 文档',
    version: '1.0.0',
    description: '完整的后端 API 文档，包含所有端点和模型定义',
    contact: {
      name: 'API 支持',
      email: 'support@yyup.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '开发环境'
    },
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: '生产环境'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '使用 JWT token 进行认证'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: '请求是否成功'
          },
          message: {
            type: 'string',
            description: '响应消息'
          },
          data: {
            type: 'object',
            description: '响应数据'
          },
          error: {
            type: 'string',
            description: '错误信息（失败时返回）'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string'
          },
          error: {
            type: 'string'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    // 路径由 swagger-jsdoc 从 JSDoc 注释自动生成
  }
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/**/*.ts',
    './src/routes/**/*.routes.ts',
    './src/routes/*/index.ts'
  ]
};

export default swaggerOptions;

