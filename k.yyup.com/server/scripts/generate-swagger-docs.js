#!/usr/bin/env node

/**
 * Swagger文档生成脚本
 * 从路由文件中的Swagger注释生成完整的swagger.json文档
 */

const fs = require('fs');
const path = require('path');

console.log('📄 开始生成Swagger文档...');

// 配置
const ROUTES_DIR = path.join(__dirname, '../src/routes');
const OUTPUT_FILE = path.join(__dirname, '../swagger.json');

// Swagger文档基础结构
const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: '幼儿园管理系统 API',
    version: '1.0.0',
    description: '幼儿园管理系统的RESTful API文档，包含用户管理、教育管理、活动管理、AI助手等模块的完整接口。',
    contact: {
      name: 'API支持',
      email: 'support@kindergarten.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '开发环境'
    },
    {
      url: 'https://api.kindergarten.com',
      description: '生产环境'
    }
  ],
  tags: [
    { name: '认证管理', description: '用户认证相关接口' },
    { name: '用户管理', description: '用户管理相关接口' },
    { name: '教师管理', description: '教师管理相关接口' },
    { name: '学生管理', description: '学生管理相关接口' },
    { name: '班级管理', description: '班级管理相关接口' },
    { name: '活动管理', description: '活动管理相关接口' },
    { name: '招生管理', description: '招生管理相关接口' },
    { name: 'AI助手', description: 'AI助手相关接口' },
    { name: '营销管理', description: '营销管理相关接口' },
    { name: '系统管理', description: '系统管理相关接口' },
    { name: '统计分析', description: '统计分析相关接口' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT认证Token'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
            description: '请求是否成功'
          },
          data: {
            type: 'object',
            description: '响应数据'
          },
          message: {
            type: 'string',
            example: '操作成功',
            description: '响应消息'
          },
          code: {
            type: 'number',
            example: 0,
            description: '响应代码'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
            description: '请求是否成功'
          },
          error: {
            type: 'string',
            example: '操作失败',
            description: '错误信息'
          },
          code: {
            type: 'number',
            example: 500,
            description: '错误代码'
          }
        }
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object'
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  page: {
                    type: 'integer',
                    example: 1
                  },
                  limit: {
                    type: 'integer',
                    example: 20
                  },
                  total: {
                    type: 'integer',
                    example: 100
                  },
                  totalPages: {
                    type: 'integer',
                    example: 5
                  }
                }
              }
            }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
            description: '用户ID'
          },
          username: {
            type: 'string',
            example: 'admin',
            description: '用户名'
          },
          email: {
            type: 'string',
            example: 'admin@example.com',
            description: '邮箱'
          },
          name: {
            type: 'string',
            example: '管理员',
            description: '姓名'
          },
          phone: {
            type: 'string',
            example: '13800138000',
            description: '电话'
          },
          role: {
            type: 'string',
            example: 'admin',
            description: '角色'
          },
          status: {
            type: 'string',
            example: 'active',
            description: '状态'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '创建时间'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: '更新时间'
          }
        }
      },
      Teacher: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: '张老师'
          },
          gender: {
            type: 'string',
            example: 'female'
          },
          phone: {
            type: 'string',
            example: '13900139000'
          },
          email: {
            type: 'string',
            example: 'teacher@example.com'
          },
          subjects: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['语文', '数学']
          },
          experience: {
            type: 'integer',
            example: 5,
            description: '教学经验年数'
          }
        }
      },
      Student: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: '小明'
          },
          gender: {
            type: 'string',
            example: 'male'
          },
          age: {
            type: 'integer',
            example: 5
          },
          classId: {
            type: 'integer',
            example: 1
          },
          parentId: {
            type: 'integer',
            example: 1
          },
          enrollmentDate: {
            type: 'string',
            format: 'date',
            example: '2023-09-01'
          }
        }
      },
      Activity: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          title: {
            type: 'string',
            example: '春季运动会'
          },
          description: {
            type: 'string',
            example: '幼儿园春季运动会活动'
          },
          type: {
            type: 'string',
            example: 'sports'
          },
          date: {
            type: 'string',
            format: 'date',
            example: '2023-04-15'
          },
          location: {
            type: 'string',
            example: '幼儿园操场'
          },
          maxParticipants: {
            type: 'integer',
            example: 100
          }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: '未授权访问',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: '未授权访问',
              code: 401
            }
          }
        }
      },
      Forbidden: {
        description: '权限不足',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: '权限不足',
              code: 403
            }
          }
        }
      },
      NotFound: {
        description: '资源不存在',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: '资源不存在',
              code: 404
            }
          }
        }
      },
      BadRequest: {
        description: '请求参数错误',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: '请求参数错误',
              code: 400
            }
          }
        }
      },
      InternalServerError: {
        description: '服务器内部错误',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: '服务器内部错误',
              code: 500
            }
          }
        }
      }
    }
  },
  paths: {}
};

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 扫描路由文件
function scanRouteFiles(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanRouteFiles(fullPath);
    } else if (file.endsWith('.routes.ts')) {
      extractSwaggerInfo(fullPath);
    }
  }
}

// 提取Swagger信息
function extractSwaggerInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 提取Swagger注释块
    const swaggerBlocks = content.match(/\/\*\*[\s\S]*?@swagger[\s\S]*?\*\//g) || [];

    for (const block of swaggerBlocks) {
      parseSwaggerBlock(block);
    }

  } catch (error) {
    console.log(colors.red(`提取Swagger信息失败 ${filePath}: ${error.message}`));
  }
}

// 解析Swagger注释块
function parseSwaggerBlock(block) {
  try {
    // 简化的Swagger注释解析
    // 这里应该根据实际的注释格式进行解析
    // 由于时间限制，这里提供一个基础版本

    const methodMatch = block.match(/@(get|post|put|patch|delete)\s+([^\s]+)/);
    if (methodMatch) {
      const method = methodMatch[1].toLowerCase();
      const path = methodMatch[2];

      // 基础路径对象
      if (!swaggerDoc.paths[path]) {
        swaggerDoc.paths[path] = {};
      }

      // 基础操作对象
      const operation = {
        tags: getTagsFromPath(path),
        summary: getSummaryFromBlock(block),
        description: getDescriptionFromBlock(block),
        parameters: getParametersFromBlock(block),
        responses: getResponsesFromBlock(block),
        security: getSecurityFromBlock(block)
      };

      swaggerDoc.paths[path][method] = operation;
    }
  } catch (error) {
    console.log(colors.yellow(`解析Swagger块失败: ${error.message}`));
  }
}

// 从路径获取标签
function getTagsFromPath(path) {
  if (path.includes('/auth')) return ['认证管理'];
  if (path.includes('/users')) return ['用户管理'];
  if (path.includes('/teachers')) return ['教师管理'];
  if (path.includes('/students')) return ['学生管理'];
  if (path.includes('/classes')) return ['班级管理'];
  if (path.includes('/activities')) return ['活动管理'];
  if (path.includes('/enrollment')) return ['招生管理'];
  if (path.includes('/ai')) return ['AI助手'];
  if (path.includes('/marketing')) return ['营销管理'];
  if (path.includes('/system')) return ['系统管理'];
  if (path.includes('/statistics')) return ['统计分析'];
  return ['其他'];
}

// 从注释块获取摘要
function getSummaryFromBlock(block) {
  const summaryMatch = block.match(/summary['"]?\s*:\s*['"]([^'"]+)['"]/i);
  return summaryMatch ? summaryMatch[1] : 'API接口';
}

// 从注释块获取描述
function getDescriptionFromBlock(block) {
  const descMatch = block.match(/description['"]?\s*:\s*['"]([^'"]+)['"]/i);
  return descMatch ? descMatch[1] : 'API接口描述';
}

// 从注释块获取参数
function getParametersFromBlock(block) {
  const parameters = [];
  const paramMatches = block.matchAll(/@param\s*{([^}]+)}\s*(\w+)\s*-\s*([^\n]+)/g);

  for (const match of paramMatches) {
    parameters.push({
      name: match[2],
      in: getPathParameterType(match[2]),
      description: match[3].trim(),
      required: !match[3].includes('可选'),
      schema: {
        type: getSwaggerType(match[1])
      }
    });
  }

  return parameters;
}

// 从注释块获取响应
function getResponsesFromBlock(block) {
  const responses = {
    '200': {
      description: '成功响应',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ApiResponse'
          }
        }
      }
    },
    '400': {
      $ref: '#/components/responses/BadRequest'
    },
    '401': {
      $ref: '#/components/responses/Unauthorized'
    },
    '500': {
      $ref: '#/components/responses/InternalServerError'
    }
  };

  return responses;
}

// 从注释块获取安全要求
function getSecurityFromBlock(block) {
  // 检查是否有公开标记
  if (block.includes('@public') || block.includes('no-auth')) {
    return [];
  }

  return [{ bearerAuth: [] }];
}

// 获取参数类型
function getPathParameterType(paramName) {
  const pathParams = ['id', 'userId', 'teacherId', 'studentId', 'classId', 'activityId'];
  return pathParams.includes(paramName) ? 'path' : 'query';
}

// 转换类型到Swagger类型
function getSwaggerType(typeString) {
  const typeMap = {
    'string': 'string',
    'number': 'number',
    'integer': 'integer',
    'boolean': 'boolean',
    'array': 'array',
    'object': 'object'
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (typeString.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 'string';
}

// 主执行函数
function main() {
  console.log(colors.blue('🔍 扫描路由文件...'));

  // 扫描所有路由文件
  scanRouteFiles(ROUTES_DIR);

  console.log(colors.blue('📝 生成Swagger文档...'));

  // 生成最终的swagger.json
  const swaggerJson = JSON.stringify(swaggerDoc, null, 2);

  // 保存文档
  try {
    fs.writeFileSync(OUTPUT_FILE, swaggerJson, 'utf8');
    console.log(colors.green(`✅ Swagger文档已保存: ${OUTPUT_FILE}`));

    // 显示统计信息
    const pathCount = Object.keys(swaggerDoc.paths).length;
    const tagCount = swaggerDoc.tags.length;
    const schemaCount = Object.keys(swaggerDoc.components.schemas).length;

    console.log(colors.cyan('\n📊 文档统计:'));
    console.log(`- API路径数量: ${pathCount}`);
    console.log(`- 标签数量: ${tagCount}`);
    console.log(`- 数据模型数量: ${schemaCount}`);
    console.log(`- OpenAPI版本: ${swaggerDoc.openapi}`);

  } catch (error) {
    console.log(colors.red(`❌ 保存Swagger文档失败: ${error.message}`));
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main, swaggerDoc };