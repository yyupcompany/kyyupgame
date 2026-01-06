const express = require('express');
const cors = require('cors');
const { EventEmitter } = require('events');

const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 简单的用户数据
const mockUsers = {
  admin: {
    id: 121,
    username: 'admin',
    password: 'admin123',
    realName: '沈燕',
    role: 'admin'
  }
};

// 简单的班级数据
const mockClasses = [
  { id: 1, name: '大班1班', studentCount: 25, teacherName: '张老师' },
  { id: 2, name: '大班2班', studentCount: 23, teacherName: '李老师' },
  { id: 3, name: '中班1班', studentCount: 20, teacherName: '王老师' },
  { id: 4, name: '中班2班', studentCount: 18, teacherName: '赵老师' },
  { id: 5, name: '小班1班', studentCount: 15, teacherName: '刘老师' },
  { id: 6, name: '小班2班', studentCount: 12, teacherName: '陈老师' },
  { id: 7, name: '小班3班', studentCount: 14, teacherName: '周老师' },
  { id: 8, name: '托班1班', studentCount: 10, teacherName: '吴老师' },
  { id: 9, name: '托班2班', studentCount: 8, teacherName: '郑老师' }
];

// 简单的学生数据
const mockStudents = [
  { id: 1, name: '张小明', class: '大班1班', age: 6, gender: '男' },
  { id: 2, name: '李小红', class: '大班1班', age: 6, gender: '女' },
  { id: 3, name: '王小强', class: '大班2班', age: 6, gender: '男' },
  { id: 4, name: '赵小美', class: '中班1班', age: 5, gender: '女' },
  { id: 5, name: '刘小刚', class: '中班1班', age: 5, gender: '男' }
];

// 简单的教师数据
const mockTeachers = [
  { id: 1, name: '张老师', class: '大班1班', subject: '主班老师', experience: '5年' },
  { id: 2, name: '李老师', class: '大班2班', subject: '主班老师', experience: '3年' },
  { id: 3, name: '王老师', class: '中班1班', subject: '主班老师', experience: '4年' }
];

// 登录接口
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    const user = mockUsers[username];
    const token = 'mock-jwt-token-' + Date.now();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 模拟AI聊天流式接口（使用stream-chat接口）
app.post('/api/ai/unified/stream-chat', (req, res) => {
  const { message, userId, conversationId } = req.body;

  console.log(`🤖 收到AI请求: "${message}"`);

  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // 🆕 工具叙述服务（简化版）
  const generateToolNarration = (toolName, userQuery, isIntent = false) => {
    const narrations = {
      // 工具意图说明（调用前）
      intent: {
        'any_query': {
          '检查我有多少班级': '我来查询一下幼儿园的班级数量统计信息',
          '查询有多少个老师': '我来统计一下老师的人员数量',
          default: '我来查询相关数据信息'
        },
        'render_component': {
          '用列表显示出来': '我准备为您生成一个列表形式的数据展示',
          '给我一个报表': '我将为您创建一个数据报表组件',
          default: '我准备为您展示数据可视化组件'
        }
      },
      // 工具结果说明（调用后）
      result: {
        'any_query': '查询成功，已获取相关数据',
        'render_component': '✅ 已为您展示数据'
      }
    };

    if (isIntent) {
      // 返回意图说明
      const toolNarrations = narrations.intent[toolName] || {};
      return toolNarrations[userQuery] || toolNarrations.default || `正在使用${toolName}工具处理您的请求`;
    } else {
      // 返回结果说明
      return narrations.result[toolName] || '操作已完成';
    }
  };

  // 模拟工具选择验证器逻辑
  const isUIComponentRequest = (query) => {
    const realWorldPatterns = [
      /我要.*报表/, /给我.*报表/, /生成.*报表/, /创建.*报表/, /做.*报表/,
      /我要.*图表/, /给我.*图表/, /生成.*图表/, /创建.*图表/, /做.*图表/,
      /显示.*图表/, /展示.*图表/,
      /我要.*表格/, /给我.*表格/, /生成.*表格/, /创建.*表格/, /做.*表格/,
      /表格显示/, /表格展示/, /用表格.*显示/, /用表格.*展示/,
      /我要.*任务/, /给我.*任务/, /显示.*任务/, /展示.*任务/,
      /我要.*待办/, /给我.*待办/, /显示.*待办/, /展示.*待办/,
      /任务列表/, /待办列表/,
      /我要.*统计/, /给我.*统计/, /统计.*显示/, /统计.*展示/,
      /数据.*显示/, /数据.*展示/, /我要.*数据/, /给我.*数据/,
      /我要.*界面/, /给我.*界面/, /界面显示/, /界面展示/,
      /我要.*页面/, /给我.*页面/, /页面显示/, /页面展示/,
      /我要.*看板/, /给我.*看板/, /显示.*看板/, /展示.*看板/,
      /我要.*面板/, /给我.*面板/, /显示.*面板/, /展示.*面板/,
      /用列表.*显示/, /用列表.*展示/, /列表显示/, /列表展示/
    ];

    const dataQueryPatterns = [
      /查询.*有多少/, /查询.*多少个/, /统计.*数量/, /统计.*总数/,
      /有多少.*学生/, /有多少.*老师/, /有多少.*班级/,
      /多少个.*学生/, /多少个.*老师/, /多少个.*班级/,
      /查询.*信息/, /查询.*数据/, /显示.*信息/, /显示.*数据/,
      /学生总数/, /老师总数/, /班级总数/, /幼儿园.*情况/,
      /基本.*情况/, /总体.*情况/, /检查.*有多少/, /检查.*多少个/
    ];

    const hasRealWorldRequest = realWorldPatterns.some(pattern => pattern.test(query));
    const hasDataQuery = dataQueryPatterns.some(pattern => pattern.test(query));

    console.log(`🔍 [工具选择验证] 检测UI组件渲染请求: "${query}"`);

    if (hasRealWorldRequest) {
      console.log(`✅ [工具选择验证] 发现用户实际可视化需求 - 应该使用render_component`);
      return true;
    }

    if (hasDataQuery) {
      console.log(`❌ [工具选择验证] 发现普通数据查询 - 应该使用Markdown格式回答`);
      return false;
    }

    console.log(`❌ [工具选择验证] 不是明确的可视化需求，使用Markdown格式`);
    return false;
  };

  const shouldUseComponent = isUIComponentRequest(message);

  // 发送开始事件
  res.write(`data: ${JSON.stringify({ type: 'start', message: '🔗 正在连接AI服务...' })}\n\n`);

  // 发送思考开始事件
  res.write(`data: ${JSON.stringify({ type: 'thinking_start', message: '🤔 AI开始思考...' })}\n\n`);

  // 模拟处理延迟
  setTimeout(() => {
    const toolName = shouldUseComponent ? 'render_component' : 'any_query';
    const toolArguments = shouldUseComponent
      ? { component_type: 'data-table', title: '查询结果' }
      : { query: message };

    // 🆕 发送工具意图说明事件（调用前）
    const toolIntent = generateToolNarration(toolName, message, true);
    res.write(`data: ${JSON.stringify({
      type: 'tool_intent',
      toolName: toolName,
      narration: toolIntent,
      arguments: toolArguments
    })}\n\n`);

    // 发送工具调用开始事件
    res.write(`data: ${JSON.stringify({
      type: 'tool_call_start',
      toolName: toolName,
      arguments: toolArguments
    })}\n\n`);

    // 发送工具调用完成事件
    const toolResult = shouldUseComponent
      ? { success: true, component: { type: 'data-table', data: mockClasses } }
      : { success: true, data: mockClasses };

    // 🆕 发送工具结果说明事件（调用后）
    const toolResultNarration = generateToolNarration(toolName, message, false);

    res.write(`data: ${JSON.stringify({
      type: 'tool_call_complete',
      toolName: toolName,
      result: toolResult,
      narration: toolResultNarration
    })}\n\n`);

    // 发送最终答案事件
    setTimeout(() => {
      let finalAnswer = '';

      if (shouldUseComponent) {
        finalAnswer = `已经为您生成了${message.includes('报表') ? '报表' : message.includes('表格') ? '表格' : '数据展示'}组件，您可以在界面上查看详细信息。`;
      } else {
        // 生成Markdown格式的回复
        if (message.includes('班级')) {
          finalAnswer = `## 班级统计信息\n\n我们幼儿园共有 **${mockClasses.length}** 个班级：\n\n`;
          finalAnswer += `| 班级名称 | 学生人数 | 班主任老师 |\n`;
          finalAnswer += `|---------|---------|-----------|\n`;
          mockClasses.forEach(cls => {
            finalAnswer += `| ${cls.name} | ${cls.studentCount}人 | ${cls.teacherName} |\n`;
          });
        } else if (message.includes('老师') || message.includes('教师')) {
          finalAnswer = `## 教师信息\n\n我们幼儿园共有 **${mockTeachers.length}** 位教师：\n\n`;
          finalAnswer += `| 姓名 | 班级 | 科目 | 教学经验 |\n`;
          finalAnswer += `|-----|-----|-----|----------|\n`;
          mockTeachers.forEach(teacher => {
            finalAnswer += `| ${teacher.name} | ${teacher.class} | ${teacher.subject} | ${teacher.experience} |\n`;
          });
        } else {
          finalAnswer = `根据查询，相关信息已准备好，请查看详细数据。`;
        }
      }

      res.write(`data: ${JSON.stringify({
        type: 'final_answer',
        content: finalAnswer
      })}\n\n`);

      // 发送完成事件
      res.write(`data: ${JSON.stringify({ type: 'complete', message: '✅ 处理完成' })}\n\n`);

      res.end();
    }, 1000);

  }, 2000);
});

// 权限和菜单相关API（前端需要）
app.get('/api/auth-permissions/menu', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: '仪表板',
        path: '/dashboard',
        icon: 'dashboard',
        children: []
      },
      {
        id: 2,
        name: 'AI助手',
        path: '/ai-assistant',
        icon: 'robot',
        children: []
      }
    ]
  });
});

app.get('/api/auth-permissions/roles', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'admin',
        description: '管理员',
        permissions: ['*']
      }
    ]
  });
});

app.get('/api/auth-permissions/permissions', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'all',
        description: '所有权限',
        code: '*'
      }
    ]
  });
});

// 用户信息API
app.get('/api/users/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 121,
      username: 'admin',
      realName: '沈燕',
      role: 'admin',
      avatar: null
    }
  });
});

// 仪表板统计API
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalStudents: mockStudents.length,
      totalTeachers: mockTeachers.length,
      totalClasses: mockClasses.length,
      totalActivities: 5
    }
  });
});

// 其他API接口
app.get('/api/classes', (req, res) => {
  res.json({
    success: true,
    data: mockClasses
  });
});

app.get('/api/students', (req, res) => {
  res.json({
    success: true,
    data: mockStudents
  });
});

app.get('/api/teachers', (req, res) => {
  res.json({
    success: true,
    data: mockTeachers
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 简化后端服务启动成功!`);
  console.log(`📍 服务地址: http://localhost:${port}`);
  console.log(`📝 支持测试的查询示例:`);
  console.log(`   - "检查我有多少班级" (不调用render_component)`);
  console.log(`   - "检查我有多少班级，用列表显示出来" (调用render_component)`);
  console.log(`   - "给我一个学生报表" (调用render_component)`);
  console.log(`   - "查询有多少个老师" (不调用render_component)`);
  console.log(`   - "我要一个教师表格显示" (调用render_component)`);
});