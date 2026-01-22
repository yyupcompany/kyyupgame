import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '幼儿园管理系统 API',
      version: '1.0.0',
      description: '幼儿园管理系统的完整API文档，包含所有业务模块的接口说明',
      contact: {
        name: 'API Support',
        email: 'support@kindergarten.com',
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境',
      },
      {
        url: process.env.SERVER_URL || 'https://shlxlyzagqnc.sealoshzh.site',
        description: '生产环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token认证',
        },
      },
      responses: {
        UnauthorizedError: {
          description: '访问令牌丢失、无效或过期',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  code: {
                    type: 'integer',
                    example: 401,
                  },
                  message: {
                    type: 'string',
                    example: '用户未授权',
                  },
                },
              },
            },
          },
        },
        BadRequest: {
          description: '请求参数错误',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  code: {
                    type: 'integer',
                    example: 400,
                  },
                  message: {
                    type: 'string',
                    example: '请求参数错误',
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                        },
                        message: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Forbidden: {
          description: '权限不足',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  code: {
                    type: 'integer',
                    example: 403,
                  },
                  message: {
                    type: 'string',
                    example: '权限不足',
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description: '资源不存在',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  code: {
                    type: 'integer',
                    example: 404,
                  },
                  message: {
                    type: 'string',
                    example: '资源不存在',
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: '服务器内部错误',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  code: {
                    type: 'integer',
                    example: 500,
                  },
                  message: {
                    type: 'string',
                    example: '服务器内部错误',
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: '用户认证相关接口',
      },
      {
        name: 'Dashboard',
        description: '仪表盘数据接口',
      },
      {
        name: 'User Management',
        description: '用户管理接口',
      },
      {
        name: 'Student Management',
        description: '学生管理接口',
      },
      {
        name: 'Teacher Management',
        description: '教师管理接口',
      },
      {
        name: 'Class Management',
        description: '班级管理接口',
      },
      {
        name: 'Activity Management',
        description: '活动管理接口',
      },
      {
        name: 'Enrollment Management',
        description: '招生管理接口',
      },
      {
        name: 'AI Management',
        description: 'AI功能管理接口',
      },
      {
        name: 'System Management',
        description: '系统管理接口',
      },
      {
        name: 'File Management',
        description: '文件管理接口',
      },
      {
        name: 'Permission Management',
        description: '权限管理接口',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

let specs: any;
try {
  specs = swaggerJsdoc(options);
} catch (error) {
  console.warn('⚠️  Swagger文档解析失败，将使用空文档:', error);
  specs = { paths: {}, components: { schemas: {} } };
}

// 忽略 swagger-jsdoc 的YAML语法警告
console.log('✅ Swagger配置加载完成');
if (specs && (specs as any).paths) {
  const pathCount = Object.keys((specs as any).paths).length;
  console.log(`📚 Swagger文档已加载 ${pathCount} 个API路径`);
} else {
  console.warn('⚠️  Swagger文档加载为空，请检查YAML语法');
}

export const setupSwagger = (app: Express): void => {
  // Swagger UI配置
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    customSiteTitle: '幼儿园管理系统 API 文档',
  };

  // 设置API文档路由
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  
  // 提供JSON格式的API规范
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger UI 已启用');
  console.log('📖 API 文档地址: http://localhost:3000/api-docs');
  console.log('📄 API JSON 规范: http://localhost:3000/api-docs.json');
  if (process.env.SERVER_URL) {
    console.log('🌐 生产环境 API 文档: ' + process.env.SERVER_URL + '/api-docs');
  }
};

export { specs };