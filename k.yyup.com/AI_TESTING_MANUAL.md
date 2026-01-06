# 🤖 YY-AI 幼儿园管理系统 - AI功能测试执行手册

## 📋 测试概述

本手册旨在全面测试YY-AI幼儿园管理系统的所有AI功能，确保每个功能模块都能正常工作，为用户提供稳定可靠的AI服务体验。

### 🎯 测试目标
- ✅ 验证所有AI功能正常运行
- ✅ 确保前后端API调用链路畅通
- ✅ 验证用户界面交互体验
- ✅ 测试系统性能与稳定性
- ✅ 确保数据安全与权限控制

### 📊 测试范围
- 🧠 核心AI引擎 (6大模块)
- 💬 对话交互系统 (4大功能)
- 🛠️ AI工具生态系统 (17+工具)
- 📊 智能分析系统 (9大分析)
- 🎯 智能推荐系统 (10类推荐)
- 🎨 多模态AI服务 (3大类别)
- 📋 会话与记忆管理 (3大系统)
- 📈 配额与监控系统 (3大管理)
- ⚙️ 模型管理与配置 (3大服务)

### 🔧 测试环境
- **前端**: Vue 3 + TypeScript + Element Plus
- **后端**: Node.js + Express + TypeScript
- **数据库**: MySQL 8.0+
- **AI模型**: 豆包API (主要) + GPT系列 (备选)
- **浏览器**: Chrome/Edge/Firefox 最新版

---

## 🧪 测试执行计划

### 阶段一：核心AI引擎测试 (预计2小时)
1. [统一智能决策中心测试](#test-unified-intelligence)
2. [AI Bridge Service测试](#test-ai-bridge)
3. [六维记忆系统测试](#test-memory-system)

### 阶段二：对话交互系统测试 (预计1.5小时)
1. [AI助手界面测试](#test-ai-assistant)
2. [直连聊天功能测试](#test-direct-chat)
3. [统一智能对话测试](#test-unified-chat)
4. [专家咨询系统测试](#test-expert-consultation)

### 阶段三：AI工具生态测试 (预计3小时)
1. [数据库查询工具测试](#test-database-tools)
2. [网页操作工具测试](#test-web-tools)
3. [UI显示工具测试](#test-ui-tools)
4. [工作流工具测试](#test-workflow-tools)

### 阶段四：智能分析与推荐测试 (预计2小时)
1. [智能分析系统测试](#test-analysis-system)
2. [智能推荐系统测试](#test-recommendation-system)

### 阶段五：多模态AI服务测试 (预计1.5小时)
1. [图像处理服务测试](#test-image-service)
2. [视频处理服务测试](#test-video-service)
3. [音频处理服务测试](#test-audio-service)

### 阶段六：系统集成测试 (预计1小时)
1. [会话管理测试](#test-conversation-management)
2. [配额监控测试](#test-quota-monitoring)
3. [权限控制测试](#test-permission-control)

---

## 📝 详细测试用例

### <a id="test-unified-intelligence"></a>🧠 1. 统一智能决策中心测试

#### 测试用例 1.1: 三级分级检索系统
```javascript
// 测试目标：验证三级分级检索的正确路由
const testCases = [
  {
    input: "查询当前活跃学生总数",
    expectedLevel: "level-1", // 直接响应
    expectedTime: "<500ms"
  },
  {
    input: "分析本月招生趋势",
    expectedLevel: "level-2", // 轻量处理
    expectedTime: "<5s"
  },
  {
    input: "制定下学期完整的活动规划方案",
    expectedLevel: "level-3", // 完整AI处理
    expectedTime: "<60s"
  }
];
```

**执行步骤：**
1. 打开AI助手面板
2. 依次输入测试用例中的问题
3. 观察响应时间和处理级别
4. 验证回答质量和准确性

**预期结果：**
- ✅ 系统能正确识别查询复杂度
- ✅ 路由到对应的处理级别
- ✅ 响应时间符合预期
- ✅ 回答内容准确有用

#### 测试用例 1.2: 意图分析准确性
```javascript
const intentTestCases = [
  {
    input: "帮我点击保存按钮",
    expectedIntent: "PAGE_OPERATION"
  },
  {
    input: "显示学生成绩分布图表",
    expectedIntent: "DATA_VISUALIZATION"
  },
  {
    input: "创建本周工作任务清单",
    expectedIntent: "TASK_MANAGEMENT"
  },
  {
    input: "咨询教育专家关于课程设计",
    expectedIntent: "EXPERT_CONSULTATION"
  },
  {
    input: "查询张三同学的基本信息",
    expectedIntent: "INFORMATION_QUERY"
  },
  {
    input: "制定完整的新生入学流程",
    expectedIntent: "COMPLEX_WORKFLOW"
  }
];
```

### <a id="test-ai-bridge"></a>🔗 2. AI Bridge Service测试

#### 测试用例 2.1: 豆包API连接测试
```bash
# 后端测试脚本
cd server
node test-doubao-api.js
```

**验证点：**
- ✅ API密钥认证成功
- ✅ 网络连接稳定
- ✅ 代理配置正确
- ✅ 响应格式正确
- ✅ Token消耗统计准确

#### 测试用例 2.2: 模型切换与负载均衡
```javascript
const modelSwitchTest = async () => {
  // 测试主模型故障时的备用模型切换
  const responses = await Promise.all([
    callWithModel("doubao-seed-1-6-thinking-250615"),
    callWithModel("gpt-3.5-turbo"),
    callWithModel("claude-3-sonnet")
  ]);

  return responses.every(r => r.success);
};
```

### <a id="test-memory-system"></a>🧠 3. 六维记忆系统测试

#### 测试用例 3.1: 记忆存储与检索
```javascript
const memoryTestScenario = {
  conversation: [
    "用户: 我叫张老师，负责大班教学",
    "AI: 您好张老师！很高兴为您服务",
    "用户: 请帮我查询大班学生名单",
    "AI: [返回学生名单]",
    "用户: 谢谢，请记住我的身份", // 测试记忆存储
    "AI: 好的，我已记住您是大班张老师"
  ],
  laterConversation: [
    "用户: 你还记得我吗？", // 测试记忆检索
    "AI: 当然记得，您是负责大班教学的张老师"
  ]
};
```

**执行步骤：**
1. 创建新对话会话
2. 按顺序进行第一轮对话
3. 等待10分钟后开始第二轮对话
4. 验证AI是否记住用户身份

### <a id="test-ai-assistant"></a>💬 4. AI助手界面测试

#### 测试用例 4.1: 基础交互功能
```javascript
const uiInteractionTests = [
  {
    action: "发送消息",
    input: "你好",
    expected: "正常回复，不包含'抱歉'"
  },
  {
    action: "切换全屏模式",
    expected: "界面正确切换到全屏"
  },
  {
    action: "查看会话历史",
    expected: "显示历史会话列表"
  },
  {
    action: "创建新会话",
    expected: "成功创建并切换到新会话"
  },
  {
    action: "调整面板宽度",
    expected: "拖拽调整功能正常"
  }
];
```

#### 测试用例 4.2: 流式响应测试
```javascript
const streamingTest = {
  input: "请详细分析当前幼儿园的招生情况",
  expectedEvents: [
    "connected", // 连接确认
    "thinking", // 思考过程
    "tool_call", // 工具调用
    "content_update", // 内容更新
    "final_answer", // 最终答案
    "complete" // 完成信号
  ]
};
```

### <a id="test-database-tools"></a>🔍 5. 数据库查询工具测试

#### 测试用例 5.1: 精准查询工具
```javascript
const queryDataTests = [
  {
    query: "查询所有活跃学生",
    tool: "query-data.tool",
    expectedSQL: "SELECT * FROM students WHERE status = 'active'",
    expectedFields: ["id", "name", "class", "status"]
  },
  {
    query: "获取张三的详细信息",
    tool: "query-data.tool",
    expectedParams: { name: "张三" },
    expectedResult: "学生详细信息对象"
  }
];
```

#### 测试用例 5.2: 统计分析工具
```javascript
const statisticsTests = [
  {
    query: "统计各班级学生人数",
    tool: "get-statistics.tool",
    expectedChart: "柱状图",
    expectedData: [
      { class: "大班A", count: 25 },
      { class: "大班B", count: 23 }
    ]
  },
  {
    query: "分析本月活动参与率",
    tool: "get-statistics.tool",
    expectedChart: "折线图",
    expectedMetrics: ["参与率", "趋势分析"]
  }
];
```

### <a id="test-web-tools"></a>🌐 6. 网页操作工具测试

#### 测试用例 6.1: 网络搜索工具
```javascript
const webSearchTests = [
  {
    query: "幼儿园教育最新政策",
    tool: "web-search.tool",
    expectedSources: "权威教育网站",
    expectedResults: "相关政策信息"
  },
  {
    query: "儿童营养搭配建议",
    tool: "web-search.tool",
    expectedContent: "营养专业建议",
    expectedFormat: "结构化搜索结果"
  }
];
```

#### 测试用例 6.2: 页面操作工具
```javascript
const pageOperationTests = [
  {
    instruction: "点击学生管理菜单",
    tool: "navigate-page.tool",
    expectedAction: "页面跳转到学生管理",
    expectedURL: "/students"
  },
  {
    instruction: "填写新学生信息表单",
    tool: "fill-form.tool",
    expectedFields: ["姓名", "年龄", "班级"],
    expectedResult: "表单填写完成"
  }
];
```

### <a id="test-workflow-tools"></a>⚙️ 7. 工作流工具测试

#### 测试用例 7.1: 活动工作流
```javascript
const activityWorkflowTest = {
  request: "策划六一儿童节活动",
  tool: "execute-activity-workflow.tool",
  expectedSteps: [
    "活动主题确定",
    "时间地点安排",
    "人员分工规划",
    "物料采购清单",
    "安全预案制定",
    "家长通知发送"
  ],
  expectedOutputs: [
    "完整活动方案",
    "执行时间表",
    "责任分工表",
    "物料清单",
    "应急预案"
  ]
};
```

#### 测试用例 7.2: 数据导入工作流
```javascript
const dataImportWorkflowTest = {
  request: "批量导入新教师信息",
  tool: "import-teacher-data.tool",
  inputData: "教师信息Excel文件",
  expectedValidation: [
    "数据格式检查",
    "必填字段验证",
    "重复数据检测",
    "权限级别分配"
  ],
  expectedResult: "成功导入并分配账号权限"
};
```

### <a id="test-analysis-system"></a>📊 8. 智能分析系统测试

#### 测试用例 8.1: 学生表现分析
```javascript
const studentAnalysisTest = {
  request: "分析小明同学的学习表现",
  expectedAnalysis: [
    "学习进度评估",
    "强项与弱项识别",
    "行为模式分析",
    "发展建议制定"
  ],
  expectedVisuals: [
    "能力雷达图",
    "进步趋势图",
    "对比分析图"
  ],
  expectedRecommendations: [
    "个性化学习计划",
    "家长配合建议",
    "教师关注要点"
  ]
};
```

#### 测试用例 8.2: 招生预测分析
```javascript
const enrollmentPredictionTest = {
  request: "预测下学期招生情况",
  inputData: "历史招生数据 + 人口统计数据",
  expectedModel: "时间序列预测模型",
  expectedOutputs: [
    "招生人数预测",
    "年龄段分布预测",
    "地区来源分析",
    "竞争对手影响评估"
  ],
  expectedAccuracy: ">85%"
};
```

### <a id="test-recommendation-system"></a>🎯 9. 智能推荐系统测试

#### 测试用例 9.1: 学生分班推荐
```javascript
const classPlacementTest = {
  scenario: "新学期学生分班",
  inputData: [
    "学生基本信息",
    "能力评估结果",
    "性格特征分析",
    "家长偏好设置"
  ],
  expectedAlgorithm: "多目标优化算法",
  expectedOutputs: [
    "最优分班方案",
    "班级平衡度分析",
    "特殊需求照顾",
    "调整建议说明"
  ]
};
```

#### 测试用例 9.2: 个性化推荐
```javascript
const personalizedRecommendationTest = {
  user: "张老师 (大班教师)",
  context: "课程规划阶段",
  expectedRecommendations: [
    "适合大班的课程内容",
    "教学方法建议",
    "教具使用推荐",
    "评估方式建议"
  ],
  adaptiveFeatures: [
    "基于历史偏好",
    "考虑学生特点",
    "结合季节特色",
    "融入最新理念"
  ]
};
```

### <a id="test-image-service"></a>🎨 10. 多模态AI服务测试

#### 测试用例 10.1: 图像生成服务
```javascript
const imageGenerationTest = {
  request: "生成六一儿童节活动海报",
  parameters: {
    theme: "六一儿童节",
    style: "卡通可爱",
    colors: "明亮温暖",
    elements: ["儿童", "气球", "彩虹"]
  },
  expectedOutputs: [
    "高质量海报图片",
    "多种设计方案",
    "可编辑的元素说明",
    "使用建议"
  ]
};
```

#### 测试用例 10.2: 音频处理服务
```javascript
const audioProcessingTest = {
  speechToText: {
    input: "教师授课录音文件",
    expectedOutput: "准确的文字转录",
    expectedFeatures: ["标点符号", "段落分割", "关键词标注"]
  },
  textToSpeech: {
    input: "家长通知文字内容",
    expectedOutput: "自然流畅的语音文件",
    expectedQuality: "清晰易懂，情感自然"
  }
};
```

### <a id="test-conversation-management"></a>📋 11. 会话与记忆管理测试

#### 测试用例 11.1: 多会话并行
```javascript
const multiConversationTest = {
  scenario: "同时进行3个不同主题的对话",
  conversations: [
    {
      id: "conv1",
      topic: "学生管理问题",
      context: "保持学生管理上下文"
    },
    {
      id: "conv2",
      topic: "活动策划讨论",
      context: "保持活动策划上下文"
    },
    {
      id: "conv3",
      topic: "教学方法咨询",
      context: "保持教学方法上下文"
    }
  ],
  expectedBehavior: "每个会话保持独立的上下文，不相互干扰"
};
```

### <a id="test-quota-monitoring"></a>📈 12. 配额与监控测试

#### 测试用例 12.1: 配额管理
```javascript
const quotaManagementTest = {
  user: "普通教师用户",
  monthlyQuota: 1000, // Token配额
  testScenarios: [
    {
      usage: 800,
      expected: "正常使用，显示剩余200"
    },
    {
      usage: 950,
      expected: "警告提示，剩余50"
    },
    {
      usage: 1000,
      expected: "达到限制，提示升级"
    },
    {
      usage: 1050,
      expected: "超额使用，记录计费"
    }
  ]
};
```

### <a id="test-permission-control"></a>🛡️ 13. 权限控制测试

#### 测试用例 13.1: 角色权限验证
```javascript
const permissionTests = [
  {
    role: "园长",
    allowedOperations: [
      "查看所有数据",
      "管理教师信息",
      "制定政策决策",
      "访问财务数据"
    ],
    restrictedOperations: []
  },
  {
    role: "教师",
    allowedOperations: [
      "查看自己班级数据",
      "管理班级学生",
      "创建教学计划"
    ],
    restrictedOperations: [
      "查看其他班级敏感信息",
      "修改系统配置",
      "访问财务数据"
    ]
  },
  {
    role: "家长",
    allowedOperations: [
      "查看自己孩子信息",
      "参与活动报名",
      "查看通知公告"
    ],
    restrictedOperations: [
      "查看其他学生信息",
      "管理班级数据",
      "访问系统后台"
    ]
  }
];
```

---

## 🔧 测试工具与脚本

### 自动化测试脚本

```javascript
// comprehensive-ai-test.js
const AITestSuite = {

  // 核心引擎测试
  async testUnifiedIntelligence() {
    console.log('🧠 测试统一智能决策中心...');
    // 实现三级分级检索测试
  },

  // 对话系统测试
  async testConversationSystem() {
    console.log('💬 测试对话交互系统...');
    // 实现SSE流式对话测试
  },

  // 工具生态测试
  async testToolEcosystem() {
    console.log('🛠️ 测试AI工具生态系统...');
    // 实现17+工具功能测试
  },

  // 多模态服务测试
  async testMultimodalServices() {
    console.log('🎨 测试多模态AI服务...');
    // 实现图像/音频/视频处理测试
  },

  // 系统集成测试
  async testSystemIntegration() {
    console.log('⚙️ 测试系统集成功能...');
    // 实现权限/配额/监控测试
  },

  // 执行完整测试套件
  async runFullTestSuite() {
    const results = [];

    try {
      results.push(await this.testUnifiedIntelligence());
      results.push(await this.testConversationSystem());
      results.push(await this.testToolEcosystem());
      results.push(await this.testMultimodalServices());
      results.push(await this.testSystemIntegration());

      return {
        success: results.every(r => r.success),
        results: results,
        summary: this.generateTestSummary(results)
      };
    } catch (error) {
      console.error('❌ 测试套件执行失败:', error);
      return { success: false, error: error.message };
    }
  }
};
```

### 性能测试脚本

```bash
#!/bin/bash
# performance-test.sh

echo "🚀 开始AI系统性能测试..."

# 并发对话测试
echo "📊 并发对话测试 (50个并发用户)..."
artillery run artillery-config.yml

# 内存使用监控
echo "🧠 内存使用情况监控..."
while true; do
  ps aux | grep "ts-node\|node" | grep -v grep
  sleep 5
done &

# API响应时间测试
echo "⏱️ API响应时间测试..."
curl -o /dev/null -s -w "响应时间: %{time_total}s\n" \
  -X POST http://localhost:3000/api/ai/unified/direct-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "测试消息", "userId": "test"}'

echo "✅ 性能测试完成"
```

---

## 📋 测试检查清单

### 🧠 核心AI引擎
- [ ] 统一智能决策中心响应正确
- [ ] 三级分级检索路由准确
- [ ] 意图分析识别精确
- [ ] AI Bridge Service连接稳定
- [ ] 豆包API调用成功
- [ ] 模型切换机制正常
- [ ] 六维记忆存储检索功能正常

### 💬 对话交互系统
- [ ] AI助手界面加载正常
- [ ] 消息发送接收正常
- [ ] SSE流式响应显示正确
- [ ] 思考过程可视化正常
- [ ] 工具调用状态显示准确
- [ ] 多会话管理功能正常
- [ ] 会话历史保存正确

### 🛠️ AI工具生态系统
- [ ] 数据库查询工具工作正常
- [ ] 网页操作工具执行成功
- [ ] 统计分析工具结果准确
- [ ] 网络搜索工具返回相关结果
- [ ] UI显示工具渲染正确
- [ ] 工作流工具执行完整
- [ ] 工具选择机制智能准确

### 📊 智能分析与推荐
- [ ] 学生表现分析准确
- [ ] 教师效率分析有效
- [ ] 招生预测分析合理
- [ ] 智能推荐结果相关
- [ ] 个性化推荐精准
- [ ] 分析报告格式正确

### 🎨 多模态AI服务
- [ ] 图像生成质量良好
- [ ] 图像识别准确
- [ ] 音频转文字准确
- [ ] 文字转音频自然
- [ ] 视频处理功能正常

### 📋 系统集成功能
- [ ] 会话管理功能完整
- [ ] 记忆系统工作正常
- [ ] 配额管理准确
- [ ] 使用统计正确
- [ ] 权限控制有效
- [ ] 安全审计完善

---

## 🐛 问题排查指南

### 常见问题及解决方案

1. **AI助手总是回复"抱歉"**
   - ✅ 已修复：代理配置问题已解决
   - 🔧 检查方法：运行 `node test-doubao-api.js`

2. **SSE流式响应中断**
   - 🔍 检查网络连接稳定性
   - 🔧 验证浏览器EventSource支持

3. **工具调用失败**
   - 🔍 检查工具权限配置
   - 🔧 验证数据库连接

4. **记忆系统检索不准确**
   - 🔍 检查向量化存储
   - 🔧 重建向量索引

5. **配额统计不准确**
   - 🔍 检查Token计算逻辑
   - 🔧 同步使用记录

### 测试数据清理

```sql
-- 清理测试数据
DELETE FROM ai_conversations WHERE user_id = 'test_user';
DELETE FROM ai_messages WHERE conversation_id IN (
  SELECT id FROM ai_conversations WHERE user_id = 'test_user'
);
DELETE FROM ai_model_usage WHERE user_id = 'test_user';
```

---

## 📈 测试报告模板

```markdown
# AI功能测试报告

## 测试概要
- 测试时间: [日期时间]
- 测试人员: [姓名]
- 测试环境: [环境信息]
- 测试版本: [版本号]

## 测试结果统计
- 总测试用例: [数量]
- 通过用例: [数量]
- 失败用例: [数量]
- 通过率: [百分比]

## 详细测试结果
[按模块列出测试结果]

## 发现的问题
[列出发现的问题及严重程度]

## 建议与改进
[提出改进建议]

## 结论
[测试总结与建议]
```

---

这个测试手册覆盖了YY-AI系统的所有功能模块，确保每个功能都得到充分验证。请按照手册执行测试，并及时记录测试结果。