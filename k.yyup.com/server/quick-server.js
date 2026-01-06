const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 简单的认证API
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2MzM2NzI4MDAsImV4cCI6MTYzMzc1OTIwMH0.test',
      user: { id: 1, username: 'admin', name: '管理员' }
    }
  });
});

// 简单的API响应生成器
const simpleApiResponse = (name, count = 5) => ({
  success: true,
  message: `获取${name}列表成功`,
  data: {
    items: Array.from({length: count}, (_, i) => ({
      id: i + 1,
      name: `${name}${i + 1}`,
      status: 1,
      createdAt: new Date()
    })),
    total: count,
    page: 1,
    pageSize: 10
  }
});

// 批量注册API
const apis = [
  'users', 'permissions', 'kindergartens', 'classes', 'teachers', 
  'students', 'parents', 'enrollment-plans', 'enrollment-applications',
  'enrollment-consultations', 'enrollment-statistics', 'activity-plans',
  'activity-registrations', 'activity-evaluations', 'advertisements',
  'channel-trackings'
];

apis.forEach(api => {
  // GET 列表
  app.get(`/api/${api}`, (req, res) => {
    res.json(simpleApiResponse(api.replace('-', '')));
  });
  
  // GET 详情
  app.get(`/api/${api}/:id`, (req, res) => {
    res.json({
      success: true,
      message: `获取${api}详情成功`,
      data: {
        id: parseInt(req.params.id),
        name: `${api}详情`,
        status: 1,
        createdAt: new Date()
      }
    });
  });
  
  // PUT 更新
  app.put(`/api/${api}/:id`, (req, res) => {
    res.json({
      success: true,
      message: `更新${api}成功`,
      data: { 
        id: parseInt(req.params.id), 
        ...req.body, 
        updatedAt: new Date() 
      }
    });
  });
  
  // PUT 密码修改 (特殊处理)
  app.put(`/api/${api}/:id/password`, (req, res) => {
    res.json({
      success: true,
      message: `修改${api}密码成功`
    });
  });
});

// 特殊路由
app.get('/api/user-roles/users/:id/roles', (req, res) => {
  res.json({
    success: true,
    message: '获取用户角色成功',
    data: [
      { id: 1, name: '管理员', code: 'admin' },
      { id: 2, name: '教师', code: 'teacher' }
    ]
  });
});

app.listen(3000, () => {
  console.log('🚀 简化服务器启动成功，端口: 3000');
  console.log('📋 已注册', apis.length, '个模块的API');
  console.log('✅ 所有API都会返回成功响应');
});