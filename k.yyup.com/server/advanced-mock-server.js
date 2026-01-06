#!/usr/bin/env node

/**
 * 高级Mock服务器 - 基于Swagger Schema智能生成数据
 * 
 * 功能：
 * 1. 解析swagger schema自动生成符合规范的mock数据
 * 2. 支持复杂的数据关系和约束
 * 3. 提供数据持久化（内存存储）
 * 4. 支持高级查询和过滤
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.MOCK_PORT || 3002;

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

// 智能数据生成器
class MockDataGenerator {
  constructor() {
    this.idCounters = {};
    this.chineseNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
    this.studentNames = ['小明', '小红', '小刚', '小丽', '小华', '小芳', '小强', '小美'];
    this.teacherNames = ['张老师', '李老师', '王老师', '赵老师', '钱老师', '孙老师'];
    this.emails = ['@example.com', '@test.com', '@demo.com'];
    this.phones = ['138', '139', '150', '151', '152', '153'];
  }

  generateId(type = 'default') {
    if (!this.idCounters[type]) {
      this.idCounters[type] = 1;
    }
    return this.idCounters[type]++;
  }

  generateBySchema(schema, type = 'object') {
    if (!schema) return null;

    switch (schema.type) {
      case 'string':
        return this.generateString(schema, type);
      case 'integer':
      case 'number':
        return this.generateNumber(schema);
      case 'boolean':
        return Math.random() > 0.5;
      case 'array':
        return this.generateArray(schema);
      case 'object':
        return this.generateObject(schema, type);
      default:
        return null;
    }
  }

  generateString(schema, type) {
    if (schema.enum) {
      return schema.enum[Math.floor(Math.random() * schema.enum.length)];
    }

    if (schema.format === 'email') {
      const name = this.chineseNames[Math.floor(Math.random() * this.chineseNames.length)];
      const domain = this.emails[Math.floor(Math.random() * this.emails.length)];
      return `${name.toLowerCase()}${domain}`;
    }

    if (schema.format === 'date') {
      const start = new Date(2020, 0, 1);
      const end = new Date();
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
    }

    if (schema.format === 'date-time') {
      return new Date().toISOString();
    }

    // 根据字段名生成特定数据
    if (type.includes('name') || type.includes('Name')) {
      if (type.includes('student')) {
        return this.studentNames[Math.floor(Math.random() * this.studentNames.length)];
      } else if (type.includes('teacher')) {
        return this.teacherNames[Math.floor(Math.random() * this.teacherNames.length)];
      } else {
        return this.chineseNames[Math.floor(Math.random() * this.chineseNames.length)];
      }
    }

    if (type.includes('phone') || type.includes('Phone')) {
      const prefix = this.phones[Math.floor(Math.random() * this.phones.length)];
      const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      return prefix + suffix;
    }

    if (type.includes('address') || type.includes('Address')) {
      const cities = ['北京市', '上海市', '广州市', '深圳市'];
      const districts = ['朝阳区', '海淀区', '西城区', '东城区'];
      const streets = ['学院路', '中关村大街', '王府井大街', '长安街'];
      return `${cities[Math.floor(Math.random() * cities.length)]}${districts[Math.floor(Math.random() * districts.length)]}${streets[Math.floor(Math.random() * streets.length)]}${Math.floor(Math.random() * 999) + 1}号`;
    }

    // 默认字符串
    const length = schema.maxLength || 10;
    return `mock_${type}_${Math.random().toString(36).substring(2, length)}`;
  }

  generateNumber(schema) {
    const min = schema.minimum || 0;
    const max = schema.maximum || 100;
    
    if (schema.type === 'integer') {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    return Math.random() * (max - min) + min;
  }

  generateArray(schema) {
    const items = schema.items;
    const length = Math.floor(Math.random() * 5) + 1;
    const result = [];
    
    for (let i = 0; i < length; i++) {
      result.push(this.generateBySchema(items));
    }
    
    return result;
  }

  generateObject(schema, type) {
    const result = {};
    const properties = schema.properties || {};
    
    Object.keys(properties).forEach(key => {
      const property = properties[key];
      const isRequired = schema.required && schema.required.includes(key);
      
      if (isRequired || Math.random() > 0.3) {
        result[key] = this.generateBySchema(property, key);
      }
    });
    
    return result;
  }
}

// 初始化数据生成器
const generator = new MockDataGenerator();

// 内存数据存储
const mockDatabase = {
  users: [],
  students: [],
  teachers: [],
  parents: [],
  classes: [],
  activities: [],
  enrollments: []
};

// 初始化示例数据
function initializeMockData() {
  // 生成用户数据
  for (let i = 0; i < 10; i++) {
    mockDatabase.users.push({
      id: generator.generateId('user'),
      username: `user${i + 1}`,
      email: generator.generateString({ format: 'email' }, 'email'),
      name: generator.generateString({}, 'name'),
      role: ['admin', 'teacher', 'parent'][Math.floor(Math.random() * 3)],
      status: 'active',
      createdAt: generator.generateString({ format: 'date-time' }),
      updatedAt: generator.generateString({ format: 'date-time' })
    });
  }

  // 生成学生数据
  for (let i = 0; i < 20; i++) {
    mockDatabase.students.push({
      id: generator.generateId('student'),
      name: generator.generateString({}, 'studentName'),
      studentId: `S${(i + 1).toString().padStart(3, '0')}`,
      birthDate: generator.generateString({ format: 'date' }),
      gender: ['male', 'female'][Math.floor(Math.random() * 2)],
      classId: Math.floor(Math.random() * 5) + 1,
      status: 'active',
      address: generator.generateString({}, 'address'),
      phone: generator.generateString({}, 'phone'),
      createdAt: generator.generateString({ format: 'date-time' }),
      updatedAt: generator.generateString({ format: 'date-time' })
    });
  }

  // 生成教师数据
  for (let i = 0; i < 8; i++) {
    mockDatabase.teachers.push({
      id: generator.generateId('teacher'),
      name: generator.generateString({}, 'teacherName'),
      employeeId: `T${(i + 1).toString().padStart(3, '0')}`,
      phone: generator.generateString({}, 'phone'),
      email: generator.generateString({ format: 'email' }, 'email'),
      department: ['小班部', '中班部', '大班部'][Math.floor(Math.random() * 3)],
      status: 'active',
      createdAt: generator.generateString({ format: 'date-time' }),
      updatedAt: generator.generateString({ format: 'date-time' })
    });
  }

  console.log('📊 已初始化Mock数据');
  console.log(`👥 用户: ${mockDatabase.users.length} 条`);
  console.log(`👶 学生: ${mockDatabase.students.length} 条`);
  console.log(`👨‍🏫 教师: ${mockDatabase.teachers.length} 条`);
}

// 高级查询处理器
class QueryProcessor {
  static processQuery(data, query) {
    let result = [...data];

    // 分页
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 10;

    // 搜索
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    // 过滤
    Object.keys(query).forEach(key => {
      if (!['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        result = result.filter(item => item[key] == query[key]);
      }
    });

    // 排序
    if (query.sortBy) {
      const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const aVal = a[query.sortBy];
        const bVal = b[query.sortBy];
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    }

    // 分页处理
    const total = result.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = result.slice(start, end);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
}

// 动态路由创建器
class RouteCreator {
  static createRoutes() {
    const paths = swaggerDoc.paths || {};
    let routeCount = 0;

    Object.keys(paths).forEach(apiPath => {
      const pathMethods = paths[apiPath];
      
      Object.keys(pathMethods).forEach(method => {
        const methodInfo = pathMethods[method];
        const expressPath = apiPath.replace(/{([^}]+)}/g, ':$1');
        
        app[method.toLowerCase()](expressPath, (req, res) => {
          RouteCreator.handleRequest(req, res, apiPath, method, methodInfo);
        });
        
        routeCount++;
      });
    });

    console.log(`📍 已创建 ${routeCount} 个动态路由`);
  }

  static handleRequest(req, res, apiPath, method, methodInfo) {
    const resourceName = this.getResourceName(apiPath);
    const resourceData = mockDatabase[resourceName];

    try {
      switch (method.toUpperCase()) {
        case 'GET':
          this.handleGet(req, res, resourceData, resourceName);
          break;
        case 'POST':
          this.handlePost(req, res, resourceData, resourceName, methodInfo);
          break;
        case 'PUT':
        case 'PATCH':
          this.handleUpdate(req, res, resourceData, resourceName);
          break;
        case 'DELETE':
          this.handleDelete(req, res, resourceData, resourceName);
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
  }

  static handleGet(req, res, resourceData, resourceName) {
    if (!resourceData) {
      return res.status(404).json({
        success: false,
        message: '资源不存在'
      });
    }

    if (req.params.id) {
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
      const result = QueryProcessor.processQuery(resourceData, req.query);
      res.json({
        success: true,
        data: result,
        message: '获取成功'
      });
    }
  }

  static handlePost(req, res, resourceData, resourceName, methodInfo) {
    if (!resourceData) {
      return res.status(400).json({
        success: false,
        message: '不支持的资源类型'
      });
    }

    const newItem = {
      id: generator.generateId(resourceName),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    resourceData.push(newItem);

    res.status(201).json({
      success: true,
      data: newItem,
      message: '创建成功'
    });
  }

  static handleUpdate(req, res, resourceData, resourceName) {
    if (!resourceData || !req.params.id) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

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
  }

  static handleDelete(req, res, resourceData, resourceName) {
    if (!resourceData || !req.params.id) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

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
  }

  static getResourceName(path) {
    const match = path.match(/\/api\/([^\/]+)/);
    return match ? match[1] : null;
  }
}

// 特殊路由
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username && password) {
    const user = mockDatabase.users.find(u => u.username === username) || mockDatabase.users[0];
    res.json({
      success: true,
      data: {
        token: `mock-jwt-token-${Date.now()}`,
        user,
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

// 系统信息路由
app.get('/health', (req, res) => {
  res.json({
    status: 'up',
    service: 'advanced-mock-server',
    port: PORT,
    timestamp: new Date().toISOString(),
    apiCount: Object.keys(swaggerDoc.paths || {}).length,
    dataStats: Object.keys(mockDatabase).reduce((acc, key) => {
      acc[key] = mockDatabase[key].length;
      return acc;
    }, {})
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Advanced Kindergarten Mock Server',
    version: '2.0.0',
    description: '基于Swagger Schema的智能Mock API服务器',
    features: [
      '智能数据生成',
      '高级查询支持',
      '数据关系维护',
      '动态路由创建'
    ],
    apiCount: Object.keys(swaggerDoc.paths || {}).length,
    endpoints: {
      health: '/health',
      mockData: '/mock-data',
      docs: 'http://localhost:3000/api-docs'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/mock-data', (req, res) => {
  res.json({
    success: true,
    data: Object.keys(mockDatabase).reduce((acc, key) => {
      acc[key] = {
        count: mockDatabase[key].length,
        sample: mockDatabase[key][0] || null
      };
      return acc;
    }, {}),
    message: 'Mock数据概览'
  });
});

// 初始化并启动
initializeMockData();
RouteCreator.createRoutes();

app.listen(PORT, () => {
  console.log('🚀 高级Mock服务器已启动');
  console.log(`🌐 服务地址: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`📄 Mock数据: http://localhost:${PORT}/mock-data`);
  console.log(`📖 API文档: http://localhost:3000/api-docs`);
  console.log(`📍 API端点数量: ${Object.keys(swaggerDoc.paths || {}).length}`);
});

module.exports = app;
