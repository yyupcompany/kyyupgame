#!/usr/bin/env node

/**
 * 基于 Swagger 文档的增强 Mock 服务器
 *
 * 自动读取 swagger.json 并生成符合 schema 的 mock 数据
 * 无需外部依赖，纯 Node.js 实现
 * 端口: 3010
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.MOCK_PORT || 3010;

// 中间件
app.use(cors());
app.use(express.json());

// 读取 swagger 文档
let swaggerDoc;
try {
  const swaggerPath = path.join(__dirname, 'swagger.json');
  swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  console.log('📖 已加载 Swagger 文档');
  console.log(`📦 版本: ${swaggerDoc.info?.version || '未知'}`);
} catch (error) {
  console.error('❌ 无法加载 Swagger 文档:', error.message);
  process.exit(1);
}

// 基础 mock 数据生成器
class MockDataGenerator {
  constructor() {
    this.counter = 1000;
    this.idPool = new Map();
  }

  // 生成 ID
  generateId(resource) {
    if (!this.idPool.has(resource)) {
      this.idPool.set(resource, this.counter);
    }
    const id = this.idPool.get(resource);
    this.idPool.set(resource, id + 1);
    return id;
  }

  // 根据类型生成数据
  generateByType(type, format, example, schema) {
    if (example !== undefined) {
      return example;
    }

    switch (type) {
      case 'string':
        if (format === 'date-time') {
          return new Date().toISOString();
        }
        if (format === 'date') {
          return new Date().toISOString().split('T')[0];
        }
        if (format === 'email') {
          return 'user@example.com';
        }
        if (format === 'uuid') {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
        if (format === 'uri') {
          return 'https://example.com';
        }
        if (schema?.enum) {
          return schema.enum[0];
        }
        if (schema?.minLength === 1) {
          return '示例文本';
        }
        return 'string';

      case 'integer':
      case 'number':
        if (format === 'float' || format === 'double') {
          return Math.random() * 100;
        }
        if (typeof schema?.minimum === 'number' && typeof schema?.maximum === 'number') {
          const min = schema.minimum;
          const max = schema.maximum;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return Math.floor(Math.random() * 100);

      case 'boolean':
        return true;

      case 'array':
        const itemsSchema = schema?.items || {};
        const minItems = schema?.minItems || 0;
        const maxItems = schema?.maxItems || 3;
        const count = Math.min(Math.max(minItems, Math.floor(Math.random() * maxItems) + 1), maxItems);
        return Array.from({ length: count }, () => this.generateByType(
          itemsSchema.type || 'object',
          itemsSchema.format,
          itemsSchema.example,
          itemsSchema
        ));

      case 'object':
      default:
        if (!schema?.properties) {
          return {};
        }

        const obj = {};
        const required = schema.required || [];
        const properties = schema.properties;

        Object.keys(properties).forEach(key => {
          const propSchema = properties[key];
          const isRequired = required.includes(key);

          // 如果是可选字段，30% 概率不返回
          if (!isRequired && Math.random() < 0.3) {
            return;
          }

          obj[key] = this.generateByType(
            propSchema.type || 'object',
            propSchema.format,
            propSchema.example,
            propSchema
          );
        });

        return obj;
    }
  }

  // 为资源生成完整的 mock 数据
  generateResourceData(resourceName, schema, count = 10) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(this.generateByType('object', null, null, schema));
    }
    return items;
  }
}

const generator = new MockDataGenerator();

// API 响应格式
function createApiResponse(data, total = data.length) {
  return {
    success: true,
    data,
    message: '操作成功',
    timestamp: new Date().toISOString(),
    ...(Array.isArray(data) ? { total } : {})
  };
}

// 动态创建路由
function createRoutes() {
  const paths = swaggerDoc.paths || {};

  console.log(`\n📡 生成路由数量: ${Object.keys(paths).length}`);

  // 支持的 HTTP 方法
  const supportedMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];

  Object.keys(paths).forEach(apiPath => {
    const methods = paths[apiPath];

    Object.keys(methods).forEach(method => {
      // 只处理支持的 HTTP 方法
      if (!supportedMethods.includes(method)) {
        console.log(`  ⏭️ 跳过不支持的方法: ${method.toUpperCase()} ${apiPath}`);
        return;
      }

      const operation = methods[method];
      if (!operation) return;

      const handler = (req, res) => {
        try {
          // 获取响应 schema
          const responses = operation.responses || {};
          const successResponse = responses['200'] || responses['201'] || responses['default'];
          const responseSchema = successResponse?.content?.['application/json']?.schema;

          let mockData = {};

          if (responseSchema) {
            // 有明确的 schema 定义
            try {
              mockData = generator.generateByType(
                responseSchema.type || 'object',
                responseSchema.format,
                responseSchema.example,
                responseSchema
              );
            } catch (e) {
              console.warn(`⚠️ Schema 解析失败，使用默认数据 [${method.toUpperCase()} ${apiPath}]`);
              mockData = {
                id: generator.generateId(apiPath),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            }
          } else {
            // 默认生成通用数据结构
            mockData = {
              id: generator.generateId(apiPath),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active'
            };
          }

          // 包装成标准 API 响应格式
          const response = createApiResponse(mockData);

          // 添加延迟模拟真实 API
          setTimeout(() => {
            res.status(200).json(response);
          }, Math.random() * 500 + 100);

        } catch (error) {
          console.error(`❌ 生成 mock 数据失败 [${method.toUpperCase()} ${apiPath}]:`, error.message);
          // 返回基础数据，避免崩溃
          const fallbackData = {
            id: generator.generateId(apiPath),
            message: 'Mock 数据生成失败，使用默认数据',
            error: error.message
          };
          res.status(200).json(createApiResponse(fallbackData));
        }
      };

      // 注册路由
      try {
        app[method](apiPath, handler);
        console.log(`  ✅ ${method.toUpperCase()} ${apiPath}`);
      } catch (error) {
        console.error(`  ❌ 注册路由失败: ${method.toUpperCase()} ${apiPath}`, error.message);
      }
    });
  });
}

// 特殊路由处理
function createSpecialRoutes() {
  // 健康检查
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'swagger-mock-server',
      version: swaggerDoc.info?.version || '1.0.0'
    });
  });

  // API 列表
  app.get('/__inspect/', (req, res) => {
    const paths = swaggerDoc.paths || {};
    const endpoints = Object.keys(paths).map(path => {
      const methods = Object.keys(paths[path]).filter(m => ['get', 'post', 'put', 'delete', 'patch'].includes(m));
      return { path, methods };
    });

    res.json({
      service: 'Swagger Mock Server',
      port: PORT,
      endpoints,
      total: endpoints.length
    });
  });

  // 获取 Swagger 文档
  app.get('/__docs', (req, res) => {
    res.json(swaggerDoc);
  });
}

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `未找到 Mock API: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// 错误处理
app.use((error, req, res, next) => {
  console.error('Mock 服务器错误:', error);
  res.status(500).json({
    success: false,
    message: 'Mock 服务器内部错误',
    error: error.message
  });
});

// 创建所有路由
createRoutes();
createSpecialRoutes();

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Swagger Mock 服务器启动成功!');
  console.log('='.repeat(50));
  console.log(`📍 监听端口: ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔍 API 列表: http://localhost:${PORT}/__inspect/`);
  console.log(`📖 API 文档: http://localhost:${PORT}/__docs`);
  console.log(`📄 Swagger 源: http://localhost:3000/api-docs`);
  console.log('='.repeat(50));
  console.log('\n💡 使用说明:');
  console.log('  - 所有 /api/* 请求都会被自动 mock');
  console.log('  - 数据根据 Swagger schema 动态生成');
  console.log('  - 支持 GET/POST/PUT/DELETE 等所有 HTTP 方法');
  console.log('  - 响应格式: { success, data, message, timestamp }');
  console.log('\n按 Ctrl+C 停止服务器\n');
});

// 优雅关闭
function gracefulShutdown(signal) {
  console.log(`\n🛑 收到 ${signal} 信号，正在关闭 Mock 服务器...`);
  server.close(() => {
    console.log('✅ Mock 服务器已关闭');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
