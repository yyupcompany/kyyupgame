const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 简单的认证中间件 (模拟)
const mockAuth = (req, res, next) => {
  req.user = { id: 121, role: 'admin', permissions: ['AI_QUERY_EXECUTE', 'AI_QUERY_HISTORY', 'AI_QUERY_TEMPLATE', 'AI_QUERY_STATS'] };
  next();
};

app.use(mockAuth);

// AI查询模拟端点
app.post('/api/ai-query/chat', (req, res) => {
  const { message, userId } = req.body;
  
  console.log('🤖 AI查询请求:', { message, userId });
  
  // 模拟AI处理延迟
  setTimeout(() => {
    const mockResponse = {
      response: `我理解您想要查询"${message}"。这是一个模拟的AI回复。`,
      queryResult: [
        { id: 1, name: '张三', age: 5, class: '小班一组', status: '在读' },
        { id: 2, name: '李四', age: 6, class: '中班一组', status: '在读' },
        { id: 3, name: '王五', age: 4, class: '小班二组', status: '在读' }
      ],
      sessionId: 'test-session-' + Date.now(),
      analysis: {
        intent: 'student_query',
        confidence: 0.95,
        keywords: ['学生', '基本信息', '查询']
      },
      metadata: {
        queryTime: new Date().toISOString(),
        dataSource: 'students',
        rowCount: 3,
        executionTime: '1.2s'
      }
    };

    res.json({
      success: true,
      data: mockResponse,
      message: 'AI查询执行成功'
    });
  }, 1000);
});

app.get('/api/ai-query/history', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  
  const mockHistory = {
    items: [
      {
        id: 1,
        query: '查询所有学生的基本信息',
        timestamp: new Date().toISOString(),
        status: 'success',
        resultCount: 3
      },
      {
        id: 2,
        query: '统计各班级学生人数',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success',
        resultCount: 5
      }
    ],
    total: 2,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: 1
  };

  res.json({
    success: true,
    data: mockHistory,
    message: '查询历史获取成功'
  });
});

app.get('/api/ai-query/templates', (req, res) => {
  const mockTemplates = [
    {
      id: 1,
      title: '学生基本信息查询',
      description: '查询学生的姓名、年龄、班级等基本信息',
      template: '查询所有学生的基本信息',
      category: 'student'
    },
    {
      id: 2,
      title: '班级统计',
      description: '统计各班级的学生人数',
      template: '统计各班级学生人数',
      category: 'statistics'
    }
  ];

  res.json({
    success: true,
    data: mockTemplates,
    message: '查询模板获取成功'
  });
});

app.get('/api/ai-query/suggestions', (req, res) => {
  const mockSuggestions = [
    '查询本月新入学的学生',
    '统计各年龄段学生分布',
    '查看最近的活动参与情况',
    '分析招生渠道效果'
  ];

  res.json({
    success: true,
    data: mockSuggestions,
    message: '查询建议获取成功'
  });
});

app.get('/api/ai-query/statistics', (req, res) => {
  const mockStats = {
    totalQueries: 156,
    successfulQueries: 142,
    failedQueries: 14,
    averageResponseTime: '1.8s',
    topQueries: [
      { query: '学生信息查询', count: 45 },
      { query: '班级统计', count: 32 },
      { query: '活动分析', count: 28 }
    ]
  };

  res.json({
    success: true,
    data: mockStats,
    message: '查询统计获取成功'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'up', 
    timestamp: new Date().toISOString(),
    message: 'Simple AI Query Test Server'
  });
});

app.listen(port, () => {
  console.log(`🚀 Simple AI Query Test Server running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  POST /api/ai-query/chat');
  console.log('  GET  /api/ai-query/history');
  console.log('  GET  /api/ai-query/templates');
  console.log('  GET  /api/ai-query/suggestions');
  console.log('  GET  /api/ai-query/statistics');
  console.log('  GET  /health');
});