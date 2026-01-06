#!/usr/bin/env node

/**
 * 基于Swagger文档的Mock测试服务器
 * 
 * 功能：
 * 1. 读取swagger.json文档
 * 2. 自动生成mock API端点
 * 3. 返回符合schema的模拟数据
 * 4. 支持CRUD操作的状态管理
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.MOCK_PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 读取swagger文档
let swaggerDoc;
try {
  const swaggerPath = path.join(__dirname, 'swagger.json');
  swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  console.log('📖 已加载swagger文档');
} catch (error) {
  console.error('❌ 无法加载swagger文档:', error.message);
  process.exit(1);
}

// 内存数据存储
const mockData = {
  users: [
    { id: 1, username: 'admin', email: 'admin@example.com', name: '管理员', role: 'admin', status: 'active' },
    { id: 2, username: 'teacher1', email: 'teacher1@example.com', name: '张老师', role: 'teacher', status: 'active' },
    { id: 3, username: 'parent1', email: 'parent1@example.com', name: '李家长', role: 'parent', status: 'active' }
  ],
  students: [
    { id: 1, name: '小明', studentId: 'S001', birthDate: '2019-05-15', gender: 'male', classId: 1, status: 'active' },
    { id: 2, name: '小红', studentId: 'S002', birthDate: '2019-08-20', gender: 'female', classId: 1, status: 'active' },
    { id: 3, name: '小刚', studentId: 'S003', birthDate: '2019-03-10', gender: 'male', classId: 2, status: 'active' }
  ],
  teachers: [
    { id: 1, name: '张老师', employeeId: 'T001', phone: '13800138001', email: 'zhang@example.com', department: '小班部', status: 'active' },
    { id: 2, name: '李老师', employeeId: 'T002', phone: '13800138002', email: 'li@example.com', department: '中班部', status: 'active' }
  ],
  parents: [
    { id: 1, name: '李家长', phone: '13800138003', email: 'parent1@example.com', relationship: 'father', status: 'active' },
    { id: 2, name: '王家长', phone: '13800138004', email: 'parent2@example.com', relationship: 'mother', status: 'active' }
  ],
  classes: [
    { id: 1, name: '小班A', capacity: 25, currentCount: 20, teacherId: 1, status: 'active' },
    { id: 2, name: '中班B', capacity: 30, currentCount: 25, teacherId: 2, status: 'active' }
  ]
};

// 生成模拟数据的工具函数
function generateMockResponse(schema, isArray = false) {
  if (isArray) {
    return {
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10
      },
      message: '获取成功'
    };
  }
  
  return {
    success: true,
    data: {},
    message: '操作成功'
  };
}

// 获取资源名称（从路径中提取）
function getResourceName(path) {
  const match = path.match(/\/api\/([^\/]+)/);
  return match ? match[1] : null;
}

// 生成ID
let idCounter = 1000;
function generateId() {
  return ++idCounter;
}

// 动态创建路由
function createMockRoutes() {
  const paths = swaggerDoc.paths || {};
  
  Object.keys(paths).forEach(apiPath => {
    const pathMethods = paths[apiPath];
    
    Object.keys(pathMethods).forEach(method => {
      const methodInfo = pathMethods[method];
      const expressPath = apiPath.replace(/{([^}]+)}/g, ':$1');
      
      console.log(`📍 创建路由: ${method.toUpperCase()} ${expressPath}`);
      
      app[method.toLowerCase()](expressPath, (req, res) => {
        const resourceName = getResourceName(apiPath);
        const resourceData = mockData[resourceName] || [];
        
        try {
          // 根据HTTP方法处理请求
          switch (method.toUpperCase()) {
            case 'GET':
              if (req.params.id) {
                // 获取单个资源
                const item = resourceData.find(item => item.id == req.params.id);
                if (item) {
                  res.json({
                    success: true,
                    data: item,
                    message: '获取成功'
                  });
                } else {
                  res.status(404).json({
                    success: false,
                    message: '资源不存在'
                  });
                }
              } else {
                // 获取资源列表
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                
                res.json({
                  success: true,
                  data: {
                    items: resourceData.slice(start, end),
                    total: resourceData.length,
                    page,
                    pageSize
                  },
                  message: '获取成功'
                });
              }
              break;
              
            case 'POST':
              // 创建资源
              const newItem = {
                id: generateId(),
                ...req.body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              if (resourceData) {
                resourceData.push(newItem);
              }
              
              res.status(201).json({
                success: true,
                data: newItem,
                message: '创建成功'
              });
              break;
              
            case 'PUT':
            case 'PATCH':
              // 更新资源
              if (req.params.id && resourceData) {
                const index = resourceData.findIndex(item => item.id == req.params.id);
                if (index !== -1) {
                  resourceData[index] = {
                    ...resourceData[index],
                    ...req.body,
                    updatedAt: new Date().toISOString()
                  };
                  
                  res.json({
                    success: true,
                    data: resourceData[index],
                    message: '更新成功'
                  });
                } else {
                  res.status(404).json({
                    success: false,
                    message: '资源不存在'
                  });
                }
              } else {
                res.status(400).json({
                  success: false,
                  message: '缺少资源ID'
                });
              }
              break;
              
            case 'DELETE':
              // 删除资源
              if (req.params.id && resourceData) {
                const index = resourceData.findIndex(item => item.id == req.params.id);
                if (index !== -1) {
                  resourceData.splice(index, 1);
                  res.json({
                    success: true,
                    message: '删除成功'
                  });
                } else {
                  res.status(404).json({
                    success: false,
                    message: '资源不存在'
                  });
                }
              } else {
                res.status(400).json({
                  success: false,
                  message: '缺少资源ID'
                });
              }
              break;
              
            default:
              res.json({
                success: true,
                data: {},
                message: `Mock响应: ${method.toUpperCase()} ${apiPath}`
              });
          }
        } catch (error) {
          res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
          });
        }
      });
    });
  });
}

// 特殊路由处理
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: mockData.users.find(u => u.username === username) || mockData.users[0],
        expiresIn: 3600
      },
      message: '登录成功'
    });
  } else {
    res.status(400).json({
      success: false,
      message: '用户名或密码不能为空'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: '退出成功'
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'up',
    service: 'mock-server',
    port: PORT,
    timestamp: new Date().toISOString(),
    apiCount: Object.keys(swaggerDoc.paths || {}).length
  });
});

// API信息
app.get('/', (req, res) => {
  res.json({
    name: 'Kindergarten Management System Mock Server',
    version: '1.0.0',
    description: '基于Swagger文档的Mock API服务器',
    apiCount: Object.keys(swaggerDoc.paths || {}).length,
    endpoints: {
      health: '/health',
      docs: 'http://localhost:3000/api-docs',
      mockData: '/mock-data'
    },
    timestamp: new Date().toISOString()
  });
});

// 查看mock数据
app.get('/mock-data', (req, res) => {
  res.json({
    success: true,
    data: Object.keys(mockData).reduce((acc, key) => {
      acc[key] = {
        count: mockData[key].length,
        sample: mockData[key][0] || null
      };
      return acc;
    }, {}),
    message: 'Mock数据概览'
  });
});

// 创建所有路由
createMockRoutes();

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 Mock服务器已启动');
  console.log(`🌐 服务地址: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`📄 Mock数据: http://localhost:${PORT}/mock-data`);
  console.log(`📖 API文档: http://localhost:3000/api-docs`);
  console.log(`📍 API端点数量: ${Object.keys(swaggerDoc.paths || {}).length}`);
});

module.exports = app;
