# AI助手角色权限配置功能设计

## 概述

基于当前系统中已实现的AI助手功能（包括PC端全屏模式、PC端侧边栏模式和移动端模式），为园长、老师、家长三种不同角色配置差异化的**快捷导航按钮**和AI权限。

**核心简化**：
- AI已具备通用API自动发现能力（api_search → 获取端点 → 获取详细说明）
- 无需为每个快捷操作预设复杂提示词
- **只需配置简单的快捷导航文本**，AI自动理解并调用对应API
- 通过现有权限表控制不同角色的数据访问范围

同时，针对移动端和PC端侧边栏采用Markdown渲染，PC端全屏模式使用Markdown与渲染组件配合显示的差异化展示策略。

## 业务背景

### 当前AI助手实现现状

系统已实现三种AI助手交互模式：

1. **PC端全屏模式**：通过路由 `/aiassistant` 访问，提供完整的AI交互界面，包含左侧功能栏、中央对话区和输入区
2. **PC端侧边栏模式**：通过头部"YY-AI助手"按钮唤起，以侧边抽屉形式提供快捷AI交互
3. **移动端模式**：移动端专属界面，提供触屏优化的AI对话体验

### 核心需求

不同角色的用户在使用AI助手时需要针对性的**快捷入口**：

- **园长角色**：需要运营决策、数据分析相关的快捷入口
- **老师角色**：需要教学计划、班级管理相关的快捷入口
- **家长角色**：需要孩子成长、育儿建议相关的快捷入口

**设计原则**：
- 快捷导航只是简单的文本按钮（如"查看今日数据"、"生成教学计划"）
- AI收到文本后，自动通过`api_search`发现相关API并调用
- 不同角色通过权限控制访问不同的数据范围

不同显示场景需要差异化的内容渲染策略：

- **移动端和PC侧边栏**：空间有限，适合简洁的Markdown文本展示
- **PC端全屏模式**：空间充足，可展示复杂的数据表格、图表等可视化组件

## 功能设计

### 角色权限配置体系

#### 数据存储方案

**重要说明**：系统已支持通过API对所有数据表进行CRUD操作，AI工具（如`any_query`）可以直接调用现有API，**无需创建独立的配置表**。

##### 使用现有数据表

系统中已存在以下表可以直接复用：

| 现有表名 | 用途 | 字段示例 |
|---------|-----|--------|
| roles | 角色定义 | id, role_code, role_name, description |
| permissions | 权限定义 | id, permission_code, permission_name, resource_type |
| role_permissions | 角色权限关联 | role_id, permission_id |

##### 配置数据存储方式

**方案：使用配置文件 + 数据库混合模式**

1. **快捷操作配置**：存储在前端配置文件中（JSON格式），根据角色动态加载
2. **AI功能权限**：通过现有的`permissions`表扩展，添加AI相关权限项
3. **渲染模式配置**：前端配置文件，根据显示模式和角色决定

**优势：**
- 无需创建新表，降低数据库复杂度
- 利用现有RBAC权限体系
- 配置文件便于版本管理和快速迭代
- AI工具可直接通过API查询权限数据

##### 扩展现有权限表

在`permissions`表中添加AI相关权限：

| permission_code | permission_name | resource_type | description |
|----------------|----------------|---------------|-------------|
| AI_DATA_QUERY_ALL | AI数据全局查询 | ai_feature | 园长可查询所有数据 |
| AI_DATA_QUERY_CLASS | AI数据班级查询 | ai_feature | 老师只能查询自己班级数据 |
| AI_DATA_QUERY_CHILD | AI数据孩子查询 | ai_feature | 家长只能查询自己孩子数据 |
| AI_TOOL_WEB_SEARCH | AI网络搜索 | ai_feature | 允许使用网络搜索工具 |
| AI_TOOL_COMPONENT_RENDER | AI组件渲染 | ai_feature | 允许渲染可视化组件 |
| AI_AGENT_MODE | AI智能代理模式 | ai_feature | 允许使用智能代理功能 |
| AI_FILE_UPLOAD_ALL | AI全文件上传 | ai_feature | 允许上传所有类型文件 |
| AI_FILE_UPLOAD_IMAGE | AI图片上传 | ai_feature | 仅允许上传图片 |

#### 角色快捷导航配置

**设计理念**：快捷导航只是简单的按钮文本，AI收到后自动调用`api_search`工具发现并调用对应API。

##### 园长角色快捷导航

**PC端全屏模式快捷导航**

| 导航按钮文本 | 图标 | 说明 |
|------------|------|------|
| 查看今日运营数据 | chart-line | AI自动查询招生、出勤、收入等数据 |
| 生成教师绩效报告 | user-star | AI自动获取教师数据并生成报告 |
| 分析招生趋势 | user-plus | AI自动分析招生数据趋势 |
| 生成财务报表 | money | AI自动汇总财务数据 |
| 查看家长反馈 | smile | AI自动统计家长满意度 |
| 策划全园活动 | calendar | AI提供活动策划建议 |
| 优化资源配置 | setting | AI分析资源使用情况 |
| 风险预警 | warning | AI分析潜在运营风险 |

**PC端侧边栏快捷导航**

| 导航按钮文本 | 说明 |
|------------|------|
| 今日数据 | AI自动展示今日关键指标 |
| 待办事项 | AI自动列出待处理事项 |
| 快速查询 | 打开快速查询对话 |
| 紧急咨询 | 快速咨询入口 |

**移动端快捷导航**

| 导航按钮文本 | 说明 |
|------------|------|
| 实时看板 | AI展示实时运营数据 |
| 审批事项 | AI列出需审批项 |
| 消息通知 | AI汇总重要通知 |
| 语音输入 | 支持语音交互 |

##### 老师角色快捷导航

**PC端全屏模式快捷导航**

| 导航按钮文本 | 图标 | 说明 |
|------------|------|------|
| 生成教学计划 | document | AI自动生成本周教学计划 |
| 生成学生评估 | file-text | AI为指定学生生成评估报告 |
| 策划班级活动 | activities | AI提供班级活动方案 |
| 家长沟通建议 | chat | AI提供沟通话术建议 |
| 记录课堂观察 | eye | AI辅助整理观察记录 |
| 分析学生行为 | user-check | AI分析学生行为表现 |
| 推荐教学资源 | book | AI推荐适合的教学资源 |
| 个别化方案 | user-edit | AI制定个别化教育方案 |

**PC端侧边栏快捷导航**

| 导航按钮文本 | 说明 |
|------------|------|
| 今日课程 | AI展示今日课程安排 |
| 快速点名 | AI辅助班级考勤 |
| 学生信息 | AI查询学生信息 |
| 教学灵感 | AI提供教学创意 |

**移动端快捷导航**

| 导航按钮文本 | 说明 |
|------------|------|
| 随手记录 | 快速记录课堂观察 |
| 家长消息 | AI辅助回复家长 |
| 应急处理 | AI提供应急建议 |
| 拍照识别 | 支持拍照上传 |

##### 家长角色快捷功能

**PC端全屏模式快捷操作**

| 操作名称 | 操作代码 | 类别 | 图标 | 提示词模板 |
|---------|---------|------|------|----------|
| 育儿知识问答 | parenting_qa | knowledge | question | 关于{孩子年龄}孩子的{问题}应该怎么处理 |
| 成长报告解读 | growth_report_interpretation | report | chart | 解读{孩子姓名}的成长评估报告 |
| 亲子活动建议 | family_activity_suggestion | activity | heart | 推荐适合周末的亲子活动 |
| 营养食谱推荐 | nutrition_recipe_recommendation | health | food | 推荐适合{年龄}孩子的营养食谱 |
| 行为问题咨询 | behavior_problem_consultation | consultation | user-question | 孩子出现{行为}怎么办 |
| 学习能力评估 | learning_ability_assessment | assessment | file | 评估孩子的{能力}发展情况 |
| 家庭教育建议 | family_education_advice | education | book | 给予家庭教育方法建议 |
| 心理健康咨询 | psychological_health_consultation | health | heart-pulse | 关于孩子心理健康的咨询 |

**PC端侧边栏快捷操作**

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 今日表现查询 | today_performance | 查看孩子今天在园表现 |
| 快速提问 | quick_question | 快速咨询育儿问题 |
| 作业辅导 | homework_tutoring | 帮助辅导孩子完成{作业} |
| 老师留言 | teacher_message | 查看老师的留言和反馈 |

**移动端快捷操作**

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 即时咨询 | instant_consultation | 紧急育儿问题咨询 |
| 成长记录 | growth_record | 记录孩子的成长瞬间 |
| 接送提醒 | pickup_reminder | 设置接送时间提醒 |
| 健康打卡 | health_checkin | 提交孩子健康状况 |

#### AI功能配置

##### 功能能力矩阵

| AI功能 | 园长 | 老师 | 家长 | 功能说明 |
|-------|-----|-----|-----|---------|
| 数据查询与分析 | 全部权限 | 班级数据 | 孩子数据 | 查询和分析相关数据 |
| 智能报告生成 | 运营报告 | 教学报告 | 成长报告 | 自动生成各类报告文档 |
| 工具调用能力 | 全部工具 | 教学工具 | 基础工具 | 可调用的后端工具集 |
| 组件渲染能力 | 全部组件 | 教学组件 | 简化组件 | 可展示的可视化组件 |
| 多轮对话能力 | 支持 | 支持 | 支持 | 上下文连续对话 |
| 智能代理模式 | 支持 | 支持 | 不支持 | Auto自动工具调用 |
| 文件上传能力 | 支持 | 支持 | 仅图片 | 文件/图片上传分析 |
| 语音交互能力 | 移动端支持 | 移动端支持 | 全端支持 | 语音输入输出 |
| 历史记录查询 | 全部记录 | 个人记录 | 个人记录 | 对话历史查询 |
| 网络搜索能力 | 支持 | 支持 | 限制 | 调用网络搜索 |

##### 园长角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "all",
    tables: ["students", "teachers", "classes", "enrollment", "finance", "activities"],
    permissions: ["read", "export"]
  },
  reportGeneration: {
    enabled: true,
    types: ["operation", "finance", "performance", "analysis"],
    formats: ["pdf", "word", "excel"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "any_query",
      "generate_report",
      "data_analysis",
      "render_component",
      "web_search",
      "generate_document",
      "send_notification"
    ],
    maxRounds: 20
  },
  componentRendering: {
    enabled: true,
    availableComponents: [
      "data-table",
      "chart-bar",
      "chart-line",
      "chart-pie",
      "statistics-card",
      "dashboard"
    ]
  },
  agentMode: {
    enabled: true,
    autoToolSelection: true,
    maxIterations: 10
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image", "document", "excel"],
    maxSize: 10485760
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile"]
  },
  webSearch: {
    enabled: true,
    sources: ["all"]
  }
}
```

##### 老师角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "class_and_student",
    tables: ["students", "classes", "activities", "assessments"],
    filters: ["own_class_only"],
    permissions: ["read"]
  },
  reportGeneration: {
    enabled: true,
    types: ["teaching_plan", "student_assessment", "class_activity"],
    formats: ["pdf", "word"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "query_student_info",
      "query_class_data",
      "generate_teaching_plan",
      "render_component",
      "generate_assessment",
      "web_search"
    ],
    maxRounds: 15
  },
  componentRendering: {
    enabled: true,
    availableComponents: [
      "data-table",
      "chart-bar",
      "student-card",
      "attendance-table",
      "schedule-calendar"
    ]
  },
  agentMode: {
    enabled: true,
    autoToolSelection: true,
    maxIterations: 8
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image", "document"],
    maxSize: 5242880
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile"]
  },
  webSearch: {
    enabled: true,
    sources: ["education", "parenting"]
  }
}
```

##### 家长角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "own_child_only",
    tables: ["students", "activities", "assessments"],
    filters: ["own_child_relation"],
    permissions: ["read"]
  },
  reportGeneration: {
    enabled: true,
    types: ["growth_report"],
    formats: ["pdf"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "query_child_info",
      "query_child_performance",
      "parenting_consultation"
    ],
    maxRounds: 10
  },
  componentRendering: {
    enabled: false,
    availableComponents: []
  },
  agentMode: {
    enabled: false
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image"],
    maxSize: 2097152
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile", "sidebar"]
  },
  webSearch: {
    enabled: false
  }
}
```

### 渲染模式配置

#### 渲染策略设计

系统根据不同的显示场景采用差异化的内容渲染策略，以适配不同的界面空间和交互方式。

##### 渲染模式类型

| 渲染模式 | 适用场景 | 说明 | 技术实现 |
|---------|---------|------|---------|
| markdown | 移动端、PC侧边栏 | 纯Markdown文本渲染 | 使用marked库解析Markdown |
| component | PC全屏模式 | 可视化组件渲染 | Vue组件动态渲染 |
| hybrid | PC全屏模式 | Markdown + 组件混合 | 同时支持文本和组件 |

##### PC端全屏模式渲染策略（hybrid）

**渲染决策流程**

```
用户查询 → AI分析意图 → 判断是否需要组件渲染
                               ↓
                    是 → 调用render_component工具 → 返回组件配置
                               ↓
                    否 → 使用Markdown格式回复
                               ↓
                    前端接收响应 → 渲染处理
                               ↓
               ┌───────────────┴───────────────┐
               ↓                               ↓
        包含组件数据                      仅包含文本
               ↓                               ↓
    DynamicComponentRenderer             MarkdownRenderer
        渲染可视化组件                      渲染格式化文本
```

**组件渲染触发条件**

- 用户明确要求表格、图表等可视化展示
- 查询结果数据量较大（超过10条记录）
- 数据需要对比分析（如时间序列、分类统计）
- 需要交互操作（如排序、筛选、导出）

**组件类型与适用场景**

| 组件类型 | 组件代码 | 适用场景 | 支持的角色 |
|---------|---------|---------|----------|
| 数据表格 | data-table | 展示列表数据，支持排序、筛选 | 园长、老师 |
| 柱状图 | chart-bar | 数据对比分析 | 园长、老师 |
| 折线图 | chart-line | 趋势分析 | 园长、老师 |
| 饼图 | chart-pie | 比例分析 | 园长、老师 |
| 统计卡片 | statistics-card | 关键指标展示 | 园长、老师 |
| 仪表盘 | dashboard | 综合数据看板 | 园长 |
| 日历 | schedule-calendar | 课程安排、活动日历 | 老师 |
| 学生卡片 | student-card | 学生信息展示 | 老师 |

**Markdown渲染场景**

- 简单文本回复
- 建议和指导性内容
- 步骤说明和流程描述
- 问答式对话

##### PC端侧边栏模式渲染策略（markdown）

**仅使用Markdown渲染**

由于侧边栏空间有限，所有AI回复均使用Markdown格式展示，提供简洁清晰的文本信息。

**Markdown增强格式支持**

- 标题分级（H1-H6）
- 列表（有序/无序）
- 代码块（带语法高亮）
- 表格（简单表格）
- 引用块
- 粗体/斜体/删除线
- 链接和图片（图片支持点击放大）

**侧边栏Markdown样式优化**

- 字体大小：适中（14px）
- 行间距：适当增加（1.6）
- 表格：自适应宽度，横向滚动
- 代码块：深色背景，浅色文字
- 引用块：左侧蓝色竖条标识

##### 移动端模式渲染策略（markdown）

**触屏优化的Markdown渲染**

移动端同样采用纯Markdown渲染，但针对触屏操作进行优化。

**移动端Markdown特殊优化**

- 字体大小：较大（16px），便于阅读
- 触摸区域：链接和按钮区域放大（最小44x44px）
- 表格：完全响应式，自动折叠为卡片式展示
- 代码块：支持横向滑动，固定高度
- 图片：自动适配屏幕宽度，支持手势缩放
- 列表：间距增大，便于点击
- 引用块：简化样式，减少视觉干扰

**移动端内容简化策略**

AI在为移动端生成回复时，会自动：

- 减少文本长度（控制在300字以内）
- 使用列表代替长段落
- 突出关键信息
- 减少专业术语
- 提供简明扼要的结论

#### 渲染模式配置表

##### 角色与场景渲染配置

| 角色 | PC全屏模式 | PC侧边栏模式 | 移动端模式 |
|-----|----------|------------|----------|
| 园长 | hybrid（优先component） | markdown | markdown |
| 老师 | hybrid（适度component） | markdown | markdown |
| 家长 | markdown | markdown | markdown |

##### 渲染配置参数

**园长角色 - PC全屏模式**

```
render_config: {
  mode: "hybrid",
  componentPriority: "high",
  markdownConfig: {
    theme: "default",
    codeHighlight: true,
    tableStyle: "bordered",
    fontSize: 14
  },
  componentConfig: {
    enabledComponents: [
      "data-table",
      "chart-bar",
      "chart-line",
      "chart-pie",
      "statistics-card",
      "dashboard"
    ],
    defaultChartTheme: "professional",
    tablePageSize: 20,
    enableExport: true,
    enableInteraction: true
  },
  renderRules: {
    autoComponentThreshold: 10,
    preferComponentForQuery: true,
    maxComponentsPerResponse: 3
  }
}
```

**老师角色 - PC全屏模式**

```
render_config: {
  mode: "hybrid",
  componentPriority: "medium",
  markdownConfig: {
    theme: "default",
    codeHighlight: true,
    tableStyle: "striped",
    fontSize: 14
  },
  componentConfig: {
    enabledComponents: [
      "data-table",
      "chart-bar",
      "student-card",
      "attendance-table",
      "schedule-calendar"
    ],
    defaultChartTheme: "friendly",
    tablePageSize: 15,
    enableExport: false,
    enableInteraction: true
  },
  renderRules: {
    autoComponentThreshold: 15,
    preferComponentForQuery: false,
    maxComponentsPerResponse: 2
  }
}
```

**所有角色 - PC侧边栏模式**

```
render_config: {
  mode: "markdown",
  markdownConfig: {
    theme: "compact",
    codeHighlight: true,
    tableStyle: "simple",
    fontSize: 14,
    maxWidth: "100%",
    lineHeight: 1.6,
    compactSpacing: true
  },
  fallbackRules: {
    maxTableRows: 5,
    tableTruncateMessage: "数据过多，请在全屏模式查看完整内容"
  }
}
```

**所有角色 - 移动端模式**

```
render_config: {
  mode: "markdown",
  markdownConfig: {
    theme: "mobile",
    codeHighlight: false,
    tableStyle: "card",
    fontSize: 16,
    touchOptimized: true,
    lineHeight: 1.8,
    imageAutoSize: true,
    enableImageZoom: true
  },
  contentOptimization: {
    maxLength: 300,
    preferList: true,
    simplifyTables: true,
    autoSummary: true
  }
}
```

### 权限验证机制

#### 前端权限控制

##### 快捷操作权限验证

前端在渲染快捷操作按钮时，根据用户角色过滤可用操作：

```
验证流程：
用户登录 → 获取用户角色（principal/teacher/parent）
         ↓
    获取当前显示模式（fullpage/sidebar/mobile）
         ↓
    查询角色快捷操作配置（role_quick_action_relations）
         ↓
    过滤符合当前角色和显示模式的操作
         ↓
    按display_order排序后渲染
```

##### 功能入口权限控制

不同功能入口根据角色显示或隐藏：

| 功能入口 | 园长 | 老师 | 家长 | 验证方式 |
|---------|-----|-----|-----|---------|
| 智能代理按钮 | 显示 | 显示 | 隐藏 | 前端v-if判断 |
| 文件上传入口 | 显示 | 显示 | 仅图片上传 | 文件类型限制 |
| 历史记录查看 | 全部记录 | 个人记录 | 个人记录 | 数据过滤 |
| 网络搜索开关 | 显示 | 显示 | 隐藏 | 前端v-if判断 |
| 导出功能 | 显示 | 部分显示 | 隐藏 | 基于配置显示 |

#### 后端权限控制

##### API接口权限验证

所有AI相关API请求都需要进行权限验证：

```
请求接收 → JWT Token验证 → 解析用户角色
                            ↓
                    加载角色AI功能配置
                            ↓
                    验证请求功能是否允许
                            ↓
            ┌───────────────┴───────────────┐
            ↓                               ↓
        权限通过                         权限拒绝
            ↓                               ↓
        执行业务逻辑                   返回403错误
```

##### 数据查询权限控制

不同角色访问数据时进行权限过滤：

**园长角色数据权限**

- 可访问全部数据表
- 不受数据范围限制
- 可导出所有数据

**老师角色数据权限**

- 只能访问自己班级的学生数据
- 只能查询自己负责的活动数据
- 不能访问财务相关数据
- 查询时自动添加过滤条件：`WHERE class_id IN (teacher_classes)`

**家长角色数据权限**

- 只能访问自己孩子的数据
- 只能查看孩子相关的活动和评估
- 不能访问其他学生数据
- 查询时自动添加过滤条件：`WHERE student_id IN (parent_children)`

##### 工具调用权限控制

后端AI工具调用时验证用户是否有权限调用该工具：

```
AI意图识别 → 选择工具 → 验证用户角色是否允许调用该工具
                                ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
                允许调用                  拒绝调用
                    ↓                       ↓
                执行工具                  返回错误提示
                    ↓
            工具内部再次验证数据权限
                    ↓
                返回结果
```

### 用户体验设计

#### 界面布局优化

##### PC端全屏模式界面

**园长角色专属界面**

```
┌─────────────────────────────────────────────────────────────┐
│ 左侧功能栏（折叠）   │    中央对话区              │  执行步骤区  │
├─────────────────────┼─────────────────────────┼────────────┤
│ 【新建对话】         │  对话历史消息              │  工具调用   │
│                     │  ┌────────────────────┐ │  进度展示   │
│ 快捷操作：           │  │ 用户：分析本月数据   │ │            │
│ • 运营数据分析       │  └────────────────────┘ │  【数据表格】│
│ • 教师绩效评估       │                         │  【图表展示】│
│ • 招生策略规划       │  ┌────────────────────┐ │            │
│ • 财务报表生成       │  │ AI：[数据表格组件]  │ │            │
│ • 家长满意度分析     │  │    [趋势图表组件]   │ │            │
│ • 活动策划建议       │  │                     │ │            │
│ • 资源配置优化       │  │  Markdown分析文本   │ │            │
│ • 风险预警分析       │  └────────────────────┘ │            │
│                     │                         │            │
│ 常用功能：           │  输入区：               │            │
│ • 统计信息           │  [___________________] │            │
│ • 设置               │  [发送] [停止] [智能代理]│           │
└─────────────────────┴─────────────────────────┴────────────┘
```

**老师角色专属界面**

```
┌─────────────────────────────────────────────────────────────┐
│ 左侧功能栏（折叠）   │    中央对话区              │  执行步骤区  │
├─────────────────────┼─────────────────────────┼────────────┤
│ 【新建对话】         │  对话历史消息              │  工具调用   │
│                     │                         │  进度展示   │
│ 快捷操作：           │  ┌────────────────────┐ │            │
│ • 教学计划生成       │  │ 用户：查询今天课程   │ │  【学生卡片】│
│ • 学生评估报告       │  └────────────────────┘ │  【课程表】  │
│ • 班级活动策划       │                         │            │
│ • 家长沟通话术       │  ┌────────────────────┐ │            │
│ • 课堂观察记录       │  │ AI：[课程表组件]    │ │            │
│ • 学生行为分析       │  │                     │ │            │
│ • 教学资源推荐       │  │  Markdown文字说明   │ │            │
│ • 个别化教育方案     │  └────────────────────┘ │            │
│                     │                         │            │
│ 我的班级：           │  输入区：               │            │
│ • 小班A             │  [___________________] │            │
│ • 学生列表           │  [发送] [停止] [智能代理]│           │
└─────────────────────┴─────────────────────────┴────────────┘
```

##### PC端侧边栏模式界面

**通用侧边栏布局（所有角色）**

```
┌────────────────────────────┐
│  AI助手                [X] │
├────────────────────────────┤
│  【快捷操作】（基于角色动态）│
│  ┌────┐ ┌────┐ ┌────┐    │
│  │操作1│ │操作2│ │操作3│   │
│  └────┘ └────┘ └────┘    │
├────────────────────────────┤
│  对话区（Markdown渲染）     │
│                            │
│  用户：查询今天数据          │
│  ────────────────────────  │
│  AI：                      │
│  ## 今日数据概览            │
│                            │
│  - 项目1：XXX              │
│  - 项目2：XXX              │
│  - 项目3：XXX              │
│                            │
│  > 提示：详细数据请在全屏    │
│  > 模式查看                │
│                            │
│  （自动滚动）               │
├────────────────────────────┤
│  输入区：                   │
│  [___________________]    │
│  [发送] [全屏] [清空]       │
└────────────────────────────┘
```

##### 移动端界面

**通用移动端布局（所有角色）**

```
┌────────────────────────────┐
│ ← AI育儿助手              ≡│
├────────────────────────────┤
│  【头部统计卡片】            │
│  对话次数 | 解决问题 | 满意度│
├────────────────────────────┤
│  【搜索栏】                 │
│  🔍 搜索历史对话...         │
├────────────────────────────┤
│  【快捷问题】（基于角色）     │
│  ┌────────┐ ┌────────┐    │
│  │ 问题1   │ │ 问题2   │   │
│  └────────┘ └────────┘    │
│  ┌────────┐ ┌────────┐    │
│  │ 问题3   │ │ 问题4   │   │
│  └────────┘ └────────┘    │
├────────────────────────────┤
│  【对话区】（Markdown渲染）  │
│                            │
│  👤 用户                   │
│  ┌──────────────────────┐│
│  │ 查询孩子今天表现       ││
│  └──────────────────────┘│
│                            │
│  🤖 AI助手                 │
│  ┌──────────────────────┐│
│  │ ## 今日表现            ││
│  │                       ││
│  │ - 出勤正常             ││
│  │ - 午餐情况良好         ││
│  │ - 活动积极参与         ││
│  └──────────────────────┘│
│                            │
│  （触摸滑动查看更多）        │
├────────────────────────────┤
│  【输入区】                 │
│  [_____________________]  │
│  [🎤] [📷] [发送]          │
└────────────────────────────┘
```

#### 交互流程设计

##### 快捷操作使用流程

```
用户点击快捷操作按钮
        ↓
自动填充预设提示词模板
        ↓
提示词包含变量（如{班级}、{主题}）
        ↓
    ┌───┴────┐
    ↓        ↓
  有变量    无变量
    ↓        ↓
弹出表单     直接发送
填写变量     
    ↓        ↓
提交表单 ←───┘
    ↓
AI开始处理
    ↓
实时显示处理进度（全屏模式）
    ↓
返回结果（根据渲染模式展示）
```

##### 渲染模式自动切换流程

```
AI生成回复内容
        ↓
判断当前显示模式
        ↓
    ┌───┴────────┐
    ↓            ↓
 PC全屏模式    侧边栏/移动端
    ↓            ↓
分析回复内容   强制Markdown渲染
    ↓
是否包含大量数据
    ↓
  ┌─┴─┐
  ↓   ↓
 是   否
  ↓   ↓
组件渲染 Markdown渲染
```

##### 权限受限处理流程

```
用户尝试使用功能
        ↓
后端验证权限
        ↓
    ┌───┴────┐
    ↓        ↓
 权限通过   权限拒绝
    ↓        ↓
 正常执行   返回友好提示
            ↓
        "此功能仅对{角色}开放"
            ↓
        提供替代建议
```

## 技术实现要点

### 前端实现要点

#### 角色配置获取

在用户登录后，前端需要获取当前角色的AI功能配置：

```
API端点：GET /api/ai/role-config?role={role_code}&display_mode={mode}

返回数据结构：
{
  roleCode: "principal",
  roleName: "园长",
  displayMode: "fullpage",
  quickActions: [
    {
      actionCode: "operation_data_analysis",
      actionName: "运营数据分析",
      icon: "chart-line",
      promptTemplate: "分析最近{period}的运营数据",
      displayOrder: 1
    },
    ...
  ],
  aiFeatures: {
    dataQuery: { enabled: true, scope: "all", ... },
    reportGeneration: { enabled: true, types: [...], ... },
    ...
  },
  renderConfig: {
    mode: "hybrid",
    componentPriority: "high",
    ...
  }
}
```

#### 快捷操作组件实现

根据角色配置动态渲染快捷操作按钮：

```
组件伪代码逻辑：

<template>
  <div class="quick-actions">
    <button
      v-for="action in availableActions"
      :key="action.actionCode"
      @click="handleQuickAction(action)"
      class="action-btn"
    >
      <icon :name="action.icon" />
      <span>{{ action.actionName }}</span>
    </button>
  </div>
</template>

<script>
computed: {
  availableActions() {
    // 根据当前角色和显示模式过滤快捷操作
    return this.roleConfig.quickActions
      .filter(action => 
        action.displayModes.includes(this.currentDisplayMode)
      )
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }
}

methods: {
  handleQuickAction(action) {
    // 处理提示词模板中的变量
    if (action.promptTemplate.includes('{')) {
      this.showVariableForm(action)
    } else {
      this.sendMessage(action.promptTemplate)
    }
  }
}
</script>
```

#### 渲染模式处理

根据配置和内容类型选择渲染方式：

```
渲染逻辑伪代码：

function renderAIResponse(response, displayMode, roleConfig) {
  const renderMode = roleConfig.renderConfig.mode
  
  if (displayMode === 'sidebar' || displayMode === 'mobile') {
    // 强制使用Markdown渲染
    return renderMarkdown(response.content)
  }
  
  if (displayMode === 'fullpage' && renderMode === 'hybrid') {
    // 检查是否包含组件数据
    if (response.componentData) {
      return renderComponent(response.componentData)
    } else {
      return renderMarkdown(response.content)
    }
  }
  
  // 默认使用Markdown
  return renderMarkdown(response.content)
}
```

#### Markdown渲染增强

针对不同场景优化Markdown渲染样式：

```
Markdown配置伪代码：

const markdownConfig = {
  sidebar: {
    fontSize: 14,
    lineHeight: 1.6,
    compactSpacing: true,
    maxTableRows: 5,
    tableOverflowHandler: 'scroll'
  },
  mobile: {
    fontSize: 16,
    lineHeight: 1.8,
    touchOptimized: true,
    tableStyle: 'card',
    imageAutoSize: true,
    enableImageZoom: true
  },
  fullpage: {
    fontSize: 14,
    lineHeight: 1.6,
    tableStyle: 'bordered',
    codeHighlight: true
  }
}
```

### 后端实现要点

#### 角色配置管理接口

提供角色配置的CRUD接口：

```
接口列表：

1. 获取角色配置
   GET /api/ai/role-config?role={role_code}&display_mode={mode}
   
2. 获取快捷操作列表
   GET /api/ai/quick-actions?role={role_code}&display_mode={mode}
   
3. 创建快捷操作（管理员）
   POST /api/ai/quick-actions
   
4. 更新快捷操作（管理员）
   PUT /api/ai/quick-actions/:id
   
5. 删除快捷操作（管理员）
   DELETE /api/ai/quick-actions/:id
   
6. 关联角色与快捷操作（管理员）
   POST /api/ai/role-quick-action-relations
```

#### AI请求权限验证

在AI服务中集成权限验证逻辑：

```
验证逻辑伪代码：

async function handleAIRequest(userId, message, context) {
  // 1. 获取用户角色
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证AI功能权限
  if (!roleConfig.aiFeatures.enabled) {
    throw new PermissionDeniedError("AI功能未对此角色开放")
  }
  
  // 3. 分析用户意图
  const intent = await analyzeIntent(message)
  
  // 4. 验证工具调用权限
  const requiredTools = await selectTools(intent)
  for (const tool of requiredTools) {
    if (!roleConfig.aiFeatures.toolCalling.availableTools.includes(tool)) {
      throw new PermissionDeniedError(`您没有权限使用${tool}工具`)
    }
  }
  
  // 5. 处理AI请求
  const response = await callAIModel(message, requiredTools, context)
  
  // 6. 根据角色配置决定渲染模式
  const renderMode = determineRenderMode(
    response, 
    context.displayMode, 
    roleConfig.renderConfig
  )
  
  return {
    content: response.content,
    componentData: renderMode === 'component' ? response.componentData : null,
    renderMode: renderMode
  }
}
```

#### 数据权限过滤

在数据查询工具中实施权限过滤：

```
数据过滤伪代码：

async function queryData(tableName, conditions, userId) {
  // 1. 获取用户角色
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证表访问权限
  if (!roleConfig.aiFeatures.dataQuery.tables.includes(tableName)) {
    throw new PermissionDeniedError(`您没有权限访问${tableName}表`)
  }
  
  // 3. 应用数据范围过滤
  const filters = await getDataFilters(user, roleConfig)
  
  switch (roleConfig.aiFeatures.dataQuery.scope) {
    case "all":
      // 园长：无额外过滤
      break
      
    case "class_and_student":
      // 老师：只查询自己班级的数据
      const teacherClasses = await getTeacherClasses(userId)
      conditions.classId = { $in: teacherClasses.map(c => c.id) }
      break
      
    case "own_child_only":
      // 家长：只查询自己孩子的数据
      const parentChildren = await getParentChildren(userId)
      conditions.studentId = { $in: parentChildren.map(c => c.id) }
      break
  }
  
  // 4. 执行查询
  return await database.query(tableName, conditions)
}
```

#### 工具调用权限控制

在AI工具编排时验证权限：

```
工具权限验证伪代码：

async function executeToolCall(toolName, params, userId) {
  // 1. 获取用户角色配置
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证工具调用权限
  if (!roleConfig.aiFeatures.toolCalling.availableTools.includes(toolName)) {
    return {
      success: false,
      error: `您的角色（${roleConfig.roleName}）没有权限调用${toolName}工具`
    }
  }
  
  // 3. 验证工具调用参数
  const validatedParams = await validateToolParams(toolName, params, userId)
  
  // 4. 执行工具
  const result = await tools[toolName].execute(validatedParams, userId)
  
  return {
    success: true,
    result: result
  }
}
```

#### 渲染决策逻辑

后端需要根据角色配置决定是否返回组件数据：

```
渲染决策伪代码：

function shouldRenderComponent(
  queryResult,
  displayMode,
  roleConfig
) {
  // 1. 侧边栏和移动端不支持组件渲染
  if (displayMode === 'sidebar' || displayMode === 'mobile') {
    return false
  }
  
  // 2. 检查角色是否启用组件渲染
  if (!roleConfig.renderConfig.componentConfig.enabledComponents.length) {
    return false
  }
  
  // 3. 根据数据量判断
  const threshold = roleConfig.renderConfig.renderRules.autoComponentThreshold
  if (queryResult.rows && queryResult.rows.length > threshold) {
    return true
  }
  
  // 4. 根据查询意图判断
  if (roleConfig.renderConfig.renderRules.preferComponentForQuery) {
    const queryKeywords = ['统计', '分析', '对比', '趋势']
    if (queryKeywords.some(kw => queryResult.query.includes(kw))) {
      return true
    }
  }
  
  return false
}
```

### 数据库实现要点

#### 表结构创建

需要创建的数据表及索引：

```
数据表创建要点：

1. ai_role_configs表
   - 主键：id
   - 唯一索引：(role_code, display_mode)
   - 状态索引：status
   
2. ai_quick_actions表
   - 主键：id
   - 唯一索引：action_code
   - 类别索引：action_category
   - 状态索引：status
   
3. role_quick_action_relations表
   - 主键：id
   - 联合唯一索引：(role_code, action_code, display_mode)
   - 角色索引：role_code
   - 显示模式索引：display_mode
```

#### 初始数据填充

系统需要预置三种角色的默认配置：

```
初始化数据要点：

1. 三种角色基础配置（principal, teacher, parent）
2. 各角色在三种显示模式下的配置（fullpage, sidebar, mobile）
3. 预置快捷操作数据（每个角色8-10个）
4. 角色与快捷操作的关联关系
5. 默认AI功能配置（JSON格式）
6. 默认渲染模式配置（JSON格式）
```

### 配置管理实现

#### 动态配置更新

支持运行时动态更新角色配置，无需重启服务：

```
配置更新流程：

管理员修改配置 → 保存到数据库 → 触发配置更新事件
                                    ↓
                              更新内存缓存
                                    ↓
                              通知相关服务
                                    ↓
                              配置生效（实时）
```

#### 配置缓存策略

为提升性能，角色配置应实施缓存：

```
缓存策略：

1. 首次加载时将配置缓存到内存
2. 缓存过期时间：30分钟
3. 配置更新时立即清除缓存
4. 支持按角色分片缓存
5. 缓存键格式：ai_role_config:{role_code}:{display_mode}
```

## 测试验证

### 功能测试

#### 角色权限测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| 园长快捷操作 | 园长登录后查看全屏模式快捷操作 | 显示运营分析、教师绩效等8个操作 |
| 老师快捷操作 | 老师登录后查看侧边栏快捷操作 | 显示今日课程、快速点名等4个操作 |
| 家长快捷操作 | 家长登录后查看移动端快捷操作 | 显示即时咨询、成长记录等4个操作 |
| 跨角色访问限制 | 家长尝试访问运营数据分析 | 提示权限不足，拒绝访问 |
| 数据权限隔离 | 老师查询学生数据 | 只返回自己班级的学生 |
| 工具调用限制 | 家长尝试调用web_search工具 | 工具不可用，返回友好提示 |

#### 渲染模式测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| PC全屏组件渲染 | 园长查询"招生数据统计" | 返回数据表格和图表组件 |
| PC全屏Markdown渲染 | 老师咨询"如何提升课堂氛围" | 返回Markdown格式建议 |
| 侧边栏Markdown渲染 | 任意角色在侧边栏查询数据 | 所有回复均为Markdown格式 |
| 移动端Markdown渲染 | 家长在移动端咨询育儿问题 | Markdown格式，字体较大，触屏优化 |
| 大数据表格简化 | 侧边栏查询返回超过10条数据 | 显示前5条 + "查看完整内容"提示 |
| 组件自动选择 | 园长查询"教师绩效对比" | 自动选择柱状图组件展示 |

#### 快捷操作测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| 快捷操作点击 | 点击"运营数据分析"按钮 | 自动填充提示词并发送 |
| 变量替换 | 点击包含变量的快捷操作 | 弹出表单要求填写变量 |
| 操作排序 | 查看快捷操作列表 | 按display_order顺序显示 |
| 模式适配 | 切换显示模式后查看快捷操作 | 显示适配当前模式的操作 |
| 图标显示 | 检查所有快捷操作图标 | 所有图标正确显示 |

### 性能测试

| 测试项 | 性能指标 | 测试方法 |
|-------|---------|---------|
| 配置加载速度 | < 100ms | 测量获取角色配置API响应时间 |
| 快捷操作渲染 | < 50ms | 测量快捷操作列表渲染时间 |
| 组件渲染性能 | < 200ms | 测量大数据表格渲染时间 |
| Markdown渲染性能 | < 100ms | 测量复杂Markdown内容渲染时间 |
| 权限验证开销 | < 20ms | 测量单次权限验证耗时 |
| 配置缓存命中率 | > 95% | 统计缓存命中率 |

### 兼容性测试

| 测试项 | 测试环境 | 预期结果 |
|-------|---------|---------|
| PC端浏览器 | Chrome, Firefox, Edge | 功能正常，样式一致 |
| 移动端浏览器 | iOS Safari, Android Chrome | 触屏交互流畅，Markdown显示正常 |
| 移动端屏幕适配 | 不同尺寸设备 | 界面自适应，文字可读 |
| 深色模式 | 系统深色模式 | Markdown样式适配深色主题 |

## 部署方案

### 数据库迁移

1. 创建新表：ai_role_configs、ai_quick_actions、role_quick_action_relations
2. 初始化三种角色的默认配置数据
3. 初始化快捷操作数据
4. 创建角色与快捷操作的关联关系

### 后端部署

1. 部署角色配置管理服务
2. 部署权限验证中间件
3. 更新AI服务，集成权限控制逻辑
4. 部署配置缓存服务
5. 更新API路由，添加新接口

### 前端部署

1. 更新AI助手组件，集成角色配置逻辑
2. 实现快捷操作动态渲染组件
3. 优化Markdown渲染器，支持多场景配置
4. 更新移动端AI助手页面
5. 部署新版本前端资源

### 配置管理

1. 创建配置管理后台界面（管理员专用）
2. 支持在线修改角色配置
3. 支持添加、编辑、删除快捷操作
4. 支持调整快捷操作与角色的关联关系
5. 提供配置导入导出功能

## 运维监控

### 监控指标

| 监控项 | 指标说明 | 告警阈值 |
|-------|---------|---------|
| 配置加载失败率 | 配置加载失败次数 / 总请求数 | > 1% |
| 权限验证失败率 | 权限验证失败次数 / 总AI请求数 | > 5% |
| 组件渲染失败率 | 组件渲染错误次数 / 总渲染次数 | > 2% |
| Markdown渲染失败率 | Markdown渲染错误次数 / 总渲染次数 | > 1% |
| 配置缓存命中率 | 缓存命中次数 / 缓存查询次数 | < 90% |
| 快捷操作使用率 | 快捷操作使用次数 / 总AI请求数 | - |

### 日志记录

需要记录的关键日志：

- 用户角色配置加载日志
- 权限验证结果日志（成功/失败）
- 快捷操作使用日志
- 渲染模式选择日志
- 组件渲染错误日志
- 数据权限过滤日志
- 配置更新操作日志

### 异常处理

| 异常情况 | 处理策略 |
|---------|---------|
| 配置加载失败 | 使用默认配置，记录错误日志 |
| 权限验证失败 | 返回友好提示，不暴露敏感信息 |
| 组件渲染失败 | 降级为Markdown渲染 |
| Markdown渲染失败 | 显示纯文本内容 |
| 工具调用权限不足 | 返回权限说明和替代建议 |
| 数据查询权限不足 | 自动过滤数据，只返回允许的范围 |

## 后续优化方向

### 短期优化（1-3个月）

1. 收集用户使用反馈，优化快捷操作设置
2. 分析各角色快捷操作使用频率，调整默认配置
3. 优化Markdown渲染样式，提升移动端阅读体验
4. 增加更多可视化组件类型
5. 优化组件渲染性能

### 中期优化（3-6个月）

1. 支持用户自定义快捷操作
2. 实现快捷操作模板市场
3. 支持多语言提示词模板
4. 增加AI功能使用教程和引导
5. 实现快捷操作分组和分类

### 长期优化（6-12个月）

1. 基于用户行为智能推荐快捷操作
2. 实现角色配置的A/B测试能力
3. 支持跨角色协作功能
4. 增加语音快捷操作
5. 实现AI助手个性化定制

## 风险评估

| 风险项 | 风险等级 | 应对措施 |
|-------|---------|---------|
| 角色配置错误导致功能不可用 | 高 | 配置校验机制，默认配置兜底 |
| 权限控制漏洞导致数据泄露 | 高 | 多层权限验证，安全审计 |
| 组件渲染性能问题 | 中 | 降级策略，性能监控 |
| 移动端Markdown显示异常 | 中 | 兼容性测试，样式兜底 |
| 配置缓存不一致 | 中 | 缓存失效机制，定期刷新 |
| 快捷操作提示词设计不合理 | 低 | 用户反馈迭代，持续优化 |

## 成功指标

| 指标 | 目标值 | 测量方法 |
|-----|--------|---------|
| 快捷操作使用率 | > 40% | 统计快捷操作触发次数占AI请求总数的比例 |
| 各角色AI功能使用率 | 园长 > 60%, 老师 > 70%, 家长 > 50% | 统计各角色使用AI功能的活跃用户比例 |
| 权限验证准确率 | 100% | 测试所有权限场景，确保无漏洞 |
| 渲染模式正确率 | > 95% | 统计组件渲染决策的准确性 |
| 用户满意度 | > 4.0/5.0 | 用户反馈调查问卷 |
| 系统响应时间 | P95 < 2s | 监控AI请求端到端响应时间 |

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 今日课程安排 | today_schedule | 显示今天的课程安排和注意事项 |
| 快速点名 | quick_attendance | 协助进行班级考勤 |
| 学生信息查询 | student_info_query | 查询{学生姓名}的信息 |
| 教学灵感 | teaching_inspiration | 给我一些关于{主题}的教学灵感 |

**移动端快捷操作**

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 随手记录 | quick_note | 记录课堂观察或学生表现 |
| 家长消息 | parent_message | 帮我回复家长关于{话题}的消息 |
| 应急处理 | emergency_handling | 遇到{情况}应该如何处理 |
| 拍照识别 | photo_recognition | （支持拍照上传识别） |

##### 家长角色快捷功能

**PC端全屏模式快捷操作**

| 操作名称 | 操作代码 | 类别 | 图标 | 提示词模板 |
|---------|---------|------|------|----------|
| 育儿知识问答 | parenting_qa | knowledge | question | 关于{孩子年龄}孩子的{问题}应该怎么处理 |
| 成长报告解读 | growth_report_interpretation | report | chart | 解读{孩子姓名}的成长评估报告 |
| 亲子活动建议 | family_activity_suggestion | activity | heart | 推荐适合周末的亲子活动 |
| 营养食谱推荐 | nutrition_recipe_recommendation | health | food | 推荐适合{年龄}孩子的营养食谱 |
| 行为问题咨询 | behavior_problem_consultation | consultation | user-question | 孩子出现{行为}怎么办 |
| 学习能力评估 | learning_ability_assessment | assessment | file | 评估孩子的{能力}发展情况 |
| 家庭教育建议 | family_education_advice | education | book | 给予家庭教育方法建议 |
| 心理健康咨询 | psychological_health_consultation | health | heart-pulse | 关于孩子心理健康的咨询 |

**PC端侧边栏快捷操作**

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 今日表现查询 | today_performance | 查看孩子今天在园表现 |
| 快速提问 | quick_question | 快速咨询育儿问题 |
| 作业辅导 | homework_tutoring | 帮助辅导孩子完成{作业} |
| 老师留言 | teacher_message | 查看老师的留言和反馈 |

**移动端快捷操作**

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 即时咨询 | instant_consultation | 紧急育儿问题咨询 |
| 成长记录 | growth_record | 记录孩子的成长瞬间 |
| 接送提醒 | pickup_reminder | 设置接送时间提醒 |
| 健康打卡 | health_checkin | 提交孩子健康状况 |

#### AI功能配置

##### 功能能力矩阵

| AI功能 | 园长 | 老师 | 家长 | 功能说明 |
|-------|-----|-----|-----|---------|
| 数据查询与分析 | 全部权限 | 班级数据 | 孩子数据 | 查询和分析相关数据 |
| 智能报告生成 | 运营报告 | 教学报告 | 成长报告 | 自动生成各类报告文档 |
| 工具调用能力 | 全部工具 | 教学工具 | 基础工具 | 可调用的后端工具集 |
| 组件渲染能力 | 全部组件 | 教学组件 | 简化组件 | 可展示的可视化组件 |
| 多轮对话能力 | 支持 | 支持 | 支持 | 上下文连续对话 |
| 智能代理模式 | 支持 | 支持 | 不支持 | Auto自动工具调用 |
| 文件上传能力 | 支持 | 支持 | 仅图片 | 文件/图片上传分析 |
| 语音交互能力 | 移动端支持 | 移动端支持 | 全端支持 | 语音输入输出 |
| 历史记录查询 | 全部记录 | 个人记录 | 个人记录 | 对话历史查询 |
| 网络搜索能力 | 支持 | 支持 | 限制 | 调用网络搜索 |

##### 园长角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "all",
    tables: ["students", "teachers", "classes", "enrollment", "finance", "activities"],
    permissions: ["read", "export"]
  },
  reportGeneration: {
    enabled: true,
    types: ["operation", "finance", "performance", "analysis"],
    formats: ["pdf", "word", "excel"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "any_query",
      "generate_report",
      "data_analysis",
      "render_component",
      "web_search",
      "generate_document",
      "send_notification"
    ],
    maxRounds: 20
  },
  componentRendering: {
    enabled: true,
    availableComponents: [
      "data-table",
      "chart-bar",
      "chart-line",
      "chart-pie",
      "statistics-card",
      "dashboard"
    ]
  },
  agentMode: {
    enabled: true,
    autoToolSelection: true,
    maxIterations: 10
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image", "document", "excel"],
    maxSize: 10485760
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile"]
  },
  webSearch: {
    enabled: true,
    sources: ["all"]
  }
}
```

##### 老师角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "class_and_student",
    tables: ["students", "classes", "activities", "assessments"],
    filters: ["own_class_only"],
    permissions: ["read"]
  },
  reportGeneration: {
    enabled: true,
    types: ["teaching_plan", "student_assessment", "class_activity"],
    formats: ["pdf", "word"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "query_student_info",
      "query_class_data",
      "generate_teaching_plan",
      "render_component",
      "generate_assessment",
      "web_search"
    ],
    maxRounds: 15
  },
  componentRendering: {
    enabled: true,
    availableComponents: [
      "data-table",
      "chart-bar",
      "student-card",
      "attendance-table",
      "schedule-calendar"
    ]
  },
  agentMode: {
    enabled: true,
    autoToolSelection: true,
    maxIterations: 8
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image", "document"],
    maxSize: 5242880
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile"]
  },
  webSearch: {
    enabled: true,
    sources: ["education", "parenting"]
  }
}
```

##### 家长角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "own_child_only",
    tables: ["students", "activities", "assessments"],
    filters: ["own_child_relation"],
    permissions: ["read"]
  },
  reportGeneration: {
    enabled: true,
    types: ["growth_report"],
    formats: ["pdf"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "query_child_info",
      "query_child_performance",
      "parenting_consultation"
    ],
    maxRounds: 10
  },
  componentRendering: {
    enabled: false,
    availableComponents: []
  },
  agentMode: {
    enabled: false
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image"],
    maxSize: 2097152
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile", "sidebar"]
  },
  webSearch: {
    enabled: false
  }
}
```

### 渲染模式配置

#### 渲染策略设计

系统根据不同的显示场景采用差异化的内容渲染策略，以适配不同的界面空间和交互方式。

##### 渲染模式类型

| 渲染模式 | 适用场景 | 说明 | 技术实现 |
|---------|---------|------|---------|
| markdown | 移动端、PC侧边栏 | 纯Markdown文本渲染 | 使用marked库解析Markdown |
| component | PC全屏模式 | 可视化组件渲染 | Vue组件动态渲染 |
| hybrid | PC全屏模式 | Markdown + 组件混合 | 同时支持文本和组件 |

##### PC端全屏模式渲染策略（hybrid）

**渲染决策流程**

```
用户查询 → AI分析意图 → 判断是否需要组件渲染
                               ↓
                    是 → 调用render_component工具 → 返回组件配置
                               ↓
                    否 → 使用Markdown格式回复
                               ↓
                    前端接收响应 → 渲染处理
                               ↓
               ┌───────────────┴───────────────┐
               ↓                               ↓
        包含组件数据                      仅包含文本
               ↓                               ↓
    DynamicComponentRenderer             MarkdownRenderer
        渲染可视化组件                      渲染格式化文本
```

**组件渲染触发条件**

- 用户明确要求表格、图表等可视化展示
- 查询结果数据量较大（超过10条记录）
- 数据需要对比分析（如时间序列、分类统计）
- 需要交互操作（如排序、筛选、导出）

**组件类型与适用场景**

| 组件类型 | 组件代码 | 适用场景 | 支持的角色 |
|---------|---------|---------|----------|
| 数据表格 | data-table | 展示列表数据，支持排序、筛选 | 园长、老师 |
| 柱状图 | chart-bar | 数据对比分析 | 园长、老师 |
| 折线图 | chart-line | 趋势分析 | 园长、老师 |
| 饼图 | chart-pie | 比例分析 | 园长、老师 |
| 统计卡片 | statistics-card | 关键指标展示 | 园长、老师 |
| 仪表盘 | dashboard | 综合数据看板 | 园长 |
| 日历 | schedule-calendar | 课程安排、活动日历 | 老师 |
| 学生卡片 | student-card | 学生信息展示 | 老师 |

**Markdown渲染场景**

- 简单文本回复
- 建议和指导性内容
- 步骤说明和流程描述
- 问答式对话

##### PC端侧边栏模式渲染策略（markdown）

**仅使用Markdown渲染**

由于侧边栏空间有限，所有AI回复均使用Markdown格式展示，提供简洁清晰的文本信息。

**Markdown增强格式支持**

- 标题分级（H1-H6）
- 列表（有序/无序）
- 代码块（带语法高亮）
- 表格（简单表格）
- 引用块
- 粗体/斜体/删除线
- 链接和图片（图片支持点击放大）

**侧边栏Markdown样式优化**

- 字体大小：适中（14px）
- 行间距：适当增加（1.6）
- 表格：自适应宽度，横向滚动
- 代码块：深色背景，浅色文字
- 引用块：左侧蓝色竖条标识

##### 移动端模式渲染策略（markdown）

**触屏优化的Markdown渲染**

移动端同样采用纯Markdown渲染，但针对触屏操作进行优化。

**移动端Markdown特殊优化**

- 字体大小：较大（16px），便于阅读
- 触摸区域：链接和按钮区域放大（最小44x44px）
- 表格：完全响应式，自动折叠为卡片式展示
- 代码块：支持横向滑动，固定高度
- 图片：自动适配屏幕宽度，支持手势缩放
- 列表：间距增大，便于点击
- 引用块：简化样式，减少视觉干扰

**移动端内容简化策略**

AI在为移动端生成回复时，会自动：

- 减少文本长度（控制在300字以内）
- 使用列表代替长段落
- 突出关键信息
- 减少专业术语
- 提供简明扼要的结论

#### 渲染模式配置表

##### 角色与场景渲染配置

| 角色 | PC全屏模式 | PC侧边栏模式 | 移动端模式 |
|-----|----------|------------|----------|
| 园长 | hybrid（优先component） | markdown | markdown |
| 老师 | hybrid（适度component） | markdown | markdown |
| 家长 | markdown | markdown | markdown |

##### 渲染配置参数

**园长角色 - PC全屏模式**

```
render_config: {
  mode: "hybrid",
  componentPriority: "high",
  markdownConfig: {
    theme: "default",
    codeHighlight: true,
    tableStyle: "bordered",
    fontSize: 14
  },
  componentConfig: {
    enabledComponents: [
      "data-table",
      "chart-bar",
      "chart-line",
      "chart-pie",
      "statistics-card",
      "dashboard"
    ],
    defaultChartTheme: "professional",
    tablePageSize: 20,
    enableExport: true,
    enableInteraction: true
  },
  renderRules: {
    autoComponentThreshold: 10,
    preferComponentForQuery: true,
    maxComponentsPerResponse: 3
  }
}
```

**老师角色 - PC全屏模式**

```
render_config: {
  mode: "hybrid",
  componentPriority: "medium",
  markdownConfig: {
    theme: "default",
    codeHighlight: true,
    tableStyle: "striped",
    fontSize: 14
  },
  componentConfig: {
    enabledComponents: [
      "data-table",
      "chart-bar",
      "student-card",
      "attendance-table",
      "schedule-calendar"
    ],
    defaultChartTheme: "friendly",
    tablePageSize: 15,
    enableExport: false,
    enableInteraction: true
  },
  renderRules: {
    autoComponentThreshold: 15,
    preferComponentForQuery: false,
    maxComponentsPerResponse: 2
  }
}
```

**所有角色 - PC侧边栏模式**

```
render_config: {
  mode: "markdown",
  markdownConfig: {
    theme: "compact",
    codeHighlight: true,
    tableStyle: "simple",
    fontSize: 14,
    maxWidth: "100%",
    lineHeight: 1.6,
    compactSpacing: true
  },
  fallbackRules: {
    maxTableRows: 5,
    tableTruncateMessage: "数据过多，请在全屏模式查看完整内容"
  }
}
```

**所有角色 - 移动端模式**

```
render_config: {
  mode: "markdown",
  markdownConfig: {
    theme: "mobile",
    codeHighlight: false,
    tableStyle: "card",
    fontSize: 16,
    touchOptimized: true,
    lineHeight: 1.8,
    imageAutoSize: true,
    enableImageZoom: true
  },
  contentOptimization: {
    maxLength: 300,
    preferList: true,
    simplifyTables: true,
    autoSummary: true
  }
}
```

### 权限验证机制

#### 前端权限控制

##### 快捷操作权限验证

前端在渲染快捷操作按钮时，根据用户角色过滤可用操作：

```
验证流程：
用户登录 → 获取用户角色（principal/teacher/parent）
         ↓
    获取当前显示模式（fullpage/sidebar/mobile）
         ↓
    查询角色快捷操作配置（role_quick_action_relations）
         ↓
    过滤符合当前角色和显示模式的操作
         ↓
    按display_order排序后渲染
```

##### 功能入口权限控制

不同功能入口根据角色显示或隐藏：

| 功能入口 | 园长 | 老师 | 家长 | 验证方式 |
|---------|-----|-----|-----|---------|
| 智能代理按钮 | 显示 | 显示 | 隐藏 | 前端v-if判断 |
| 文件上传入口 | 显示 | 显示 | 仅图片上传 | 文件类型限制 |
| 历史记录查看 | 全部记录 | 个人记录 | 个人记录 | 数据过滤 |
| 网络搜索开关 | 显示 | 显示 | 隐藏 | 前端v-if判断 |
| 导出功能 | 显示 | 部分显示 | 隐藏 | 基于配置显示 |

#### 后端权限控制

##### API接口权限验证

所有AI相关API请求都需要进行权限验证：

```
请求接收 → JWT Token验证 → 解析用户角色
                            ↓
                    加载角色AI功能配置
                            ↓
                    验证请求功能是否允许
                            ↓
            ┌───────────────┴───────────────┐
            ↓                               ↓
        权限通过                         权限拒绝
            ↓                               ↓
        执行业务逻辑                   返回403错误
```

##### 数据查询权限控制

不同角色访问数据时进行权限过滤：

**园长角色数据权限**

- 可访问全部数据表
- 不受数据范围限制
- 可导出所有数据

**老师角色数据权限**

- 只能访问自己班级的学生数据
- 只能查询自己负责的活动数据
- 不能访问财务相关数据
- 查询时自动添加过滤条件：`WHERE class_id IN (teacher_classes)`

**家长角色数据权限**

- 只能访问自己孩子的数据
- 只能查看孩子相关的活动和评估
- 不能访问其他学生数据
- 查询时自动添加过滤条件：`WHERE student_id IN (parent_children)`

##### 工具调用权限控制

后端AI工具调用时验证用户是否有权限调用该工具：

```
AI意图识别 → 选择工具 → 验证用户角色是否允许调用该工具
                                ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
                允许调用                  拒绝调用
                    ↓                       ↓
                执行工具                  返回错误提示
                    ↓
            工具内部再次验证数据权限
                    ↓
                返回结果
```

### 用户体验设计

#### 界面布局优化

##### PC端全屏模式界面

**园长角色专属界面**

```
┌─────────────────────────────────────────────────────────────┐
│ 左侧功能栏（折叠）   │    中央对话区              │  执行步骤区  │
├─────────────────────┼─────────────────────────┼────────────┤
│ 【新建对话】         │  对话历史消息              │  工具调用   │
│                     │  ┌────────────────────┐ │  进度展示   │
│ 快捷操作：           │  │ 用户：分析本月数据   │ │            │
│ • 运营数据分析       │  └────────────────────┘ │  【数据表格】│
│ • 教师绩效评估       │                         │  【图表展示】│
│ • 招生策略规划       │  ┌────────────────────┐ │            │
│ • 财务报表生成       │  │ AI：[数据表格组件]  │ │            │
│ • 家长满意度分析     │  │    [趋势图表组件]   │ │            │
│ • 活动策划建议       │  │                     │ │            │
│ • 资源配置优化       │  │  Markdown分析文本   │ │            │
│ • 风险预警分析       │  └────────────────────┘ │            │
│                     │                         │            │
│ 常用功能：           │  输入区：               │            │
│ • 统计信息           │  [___________________] │            │
│ • 设置               │  [发送] [停止] [智能代理]│           │
└─────────────────────┴─────────────────────────┴────────────┘
```

**老师角色专属界面**

```
┌─────────────────────────────────────────────────────────────┐
│ 左侧功能栏（折叠）   │    中央对话区              │  执行步骤区  │
├─────────────────────┼─────────────────────────┼────────────┤
│ 【新建对话】         │  对话历史消息              │  工具调用   │
│                     │                         │  进度展示   │
│ 快捷操作：           │  ┌────────────────────┐ │            │
│ • 教学计划生成       │  │ 用户：查询今天课程   │ │  【学生卡片】│
│ • 学生评估报告       │  └────────────────────┘ │  【课程表】  │
│ • 班级活动策划       │                         │            │
│ • 家长沟通话术       │  ┌────────────────────┐ │            │
│ • 课堂观察记录       │  │ AI：[课程表组件]    │ │            │
│ • 学生行为分析       │  │                     │ │            │
│ • 教学资源推荐       │  │  Markdown文字说明   │ │            │
│ • 个别化教育方案     │  └────────────────────┘ │            │
│                     │                         │            │
│ 我的班级：           │  输入区：               │            │
│ • 小班A             │  [___________________] │            │
│ • 学生列表           │  [发送] [停止] [智能代理]│           │
└─────────────────────┴─────────────────────────┴────────────┘
```

##### PC端侧边栏模式界面

**通用侧边栏布局（所有角色）**

```
┌────────────────────────────┐
│  AI助手                [X] │
├────────────────────────────┤
│  【快捷操作】（基于角色动态）│
│  ┌────┐ ┌────┐ ┌────┐    │
│  │操作1│ │操作2│ │操作3│   │
│  └────┘ └────┘ └────┘    │
├────────────────────────────┤
│  对话区（Markdown渲染）     │
│                            │
│  用户：查询今天数据          │
│  ────────────────────────  │
│  AI：                      │
│  ## 今日数据概览            │
│                            │
│  - 项目1：XXX              │
│  - 项目2：XXX              │
│  - 项目3：XXX              │
│                            │
│  > 提示：详细数据请在全屏    │
│  > 模式查看                │
│                            │
│  （自动滚动）               │
├────────────────────────────┤
│  输入区：                   │
│  [___________________]    │
│  [发送] [全屏] [清空]       │
└────────────────────────────┘
```

##### 移动端界面

**通用移动端布局（所有角色）**

```
┌────────────────────────────┐
│ ← AI育儿助手              ≡│
├────────────────────────────┤
│  【头部统计卡片】            │
│  对话次数 | 解决问题 | 满意度│
├────────────────────────────┤
│  【搜索栏】                 │
│  🔍 搜索历史对话...         │
├────────────────────────────┤
│  【快捷问题】（基于角色）     │
│  ┌────────┐ ┌────────┐    │
│  │ 问题1   │ │ 问题2   │   │
│  └────────┘ └────────┘    │
│  ┌────────┐ ┌────────┐    │
│  │ 问题3   │ │ 问题4   │   │
│  └────────┘ └────────┘    │
├────────────────────────────┤
│  【对话区】（Markdown渲染）  │
│                            │
│  👤 用户                   │
│  ┌──────────────────────┐│
│  │ 查询孩子今天表现       ││
│  └──────────────────────┘│
│                            │
│  🤖 AI助手                 │
│  ┌──────────────────────┐│
│  │ ## 今日表现            ││
│  │                       ││
│  │ - 出勤正常             ││
│  │ - 午餐情况良好         ││
│  │ - 活动积极参与         ││
│  └──────────────────────┘│
│                            │
│  （触摸滑动查看更多）        │
├────────────────────────────┤
│  【输入区】                 │
│  [_____________________]  │
│  [🎤] [📷] [发送]          │
└────────────────────────────┘
```

#### 交互流程设计

##### 快捷操作使用流程

```
用户点击快捷操作按钮
        ↓
自动填充预设提示词模板
        ↓
提示词包含变量（如{班级}、{主题}）
        ↓
    ┌───┴────┐
    ↓        ↓
  有变量    无变量
    ↓        ↓
弹出表单     直接发送
填写变量     
    ↓        ↓
提交表单 ←───┘
    ↓
AI开始处理
    ↓
实时显示处理进度（全屏模式）
    ↓
返回结果（根据渲染模式展示）
```

##### 渲染模式自动切换流程

```
AI生成回复内容
        ↓
判断当前显示模式
        ↓
    ┌───┴────────┐
    ↓            ↓
 PC全屏模式    侧边栏/移动端
    ↓            ↓
分析回复内容   强制Markdown渲染
    ↓
是否包含大量数据
    ↓
  ┌─┴─┐
  ↓   ↓
 是   否
  ↓   ↓
组件渲染 Markdown渲染
```

##### 权限受限处理流程

```
用户尝试使用功能
        ↓
后端验证权限
        ↓
    ┌───┴────┐
    ↓        ↓
 权限通过   权限拒绝
    ↓        ↓
 正常执行   返回友好提示
            ↓
        "此功能仅对{角色}开放"
            ↓
        提供替代建议
```

## 技术实现要点

### 前端实现要点

#### 角色配置获取

在用户登录后，前端需要获取当前角色的AI功能配置：

```
API端点：GET /api/ai/role-config?role={role_code}&display_mode={mode}

返回数据结构：
{
  roleCode: "principal",
  roleName: "园长",
  displayMode: "fullpage",
  quickActions: [
    {
      actionCode: "operation_data_analysis",
      actionName: "运营数据分析",
      icon: "chart-line",
      promptTemplate: "分析最近{period}的运营数据",
      displayOrder: 1
    },
    ...
  ],
  aiFeatures: {
    dataQuery: { enabled: true, scope: "all", ... },
    reportGeneration: { enabled: true, types: [...], ... },
    ...
  },
  renderConfig: {
    mode: "hybrid",
    componentPriority: "high",
    ...
  }
}
```

#### 快捷操作组件实现

根据角色配置动态渲染快捷操作按钮：

```
组件伪代码逻辑：

<template>
  <div class="quick-actions">
    <button
      v-for="action in availableActions"
      :key="action.actionCode"
      @click="handleQuickAction(action)"
      class="action-btn"
    >
      <icon :name="action.icon" />
      <span>{{ action.actionName }}</span>
    </button>
  </div>
</template>

<script>
computed: {
  availableActions() {
    // 根据当前角色和显示模式过滤快捷操作
    return this.roleConfig.quickActions
      .filter(action => 
        action.displayModes.includes(this.currentDisplayMode)
      )
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }
}

methods: {
  handleQuickAction(action) {
    // 处理提示词模板中的变量
    if (action.promptTemplate.includes('{')) {
      this.showVariableForm(action)
    } else {
      this.sendMessage(action.promptTemplate)
    }
  }
}
</script>
```

#### 渲染模式处理

根据配置和内容类型选择渲染方式：

```
渲染逻辑伪代码：

function renderAIResponse(response, displayMode, roleConfig) {
  const renderMode = roleConfig.renderConfig.mode
  
  if (displayMode === 'sidebar' || displayMode === 'mobile') {
    // 强制使用Markdown渲染
    return renderMarkdown(response.content)
  }
  
  if (displayMode === 'fullpage' && renderMode === 'hybrid') {
    // 检查是否包含组件数据
    if (response.componentData) {
      return renderComponent(response.componentData)
    } else {
      return renderMarkdown(response.content)
    }
  }
  
  // 默认使用Markdown
  return renderMarkdown(response.content)
}
```

#### Markdown渲染增强

针对不同场景优化Markdown渲染样式：

```
Markdown配置伪代码：

const markdownConfig = {
  sidebar: {
    fontSize: 14,
    lineHeight: 1.6,
    compactSpacing: true,
    maxTableRows: 5,
    tableOverflowHandler: 'scroll'
  },
  mobile: {
    fontSize: 16,
    lineHeight: 1.8,
    touchOptimized: true,
    tableStyle: 'card',
    imageAutoSize: true,
    enableImageZoom: true
  },
  fullpage: {
    fontSize: 14,
    lineHeight: 1.6,
    tableStyle: 'bordered',
    codeHighlight: true
  }
}
```

### 后端实现要点

#### 角色配置管理接口

提供角色配置的CRUD接口：

```
接口列表：

1. 获取角色配置
   GET /api/ai/role-config?role={role_code}&display_mode={mode}
   
2. 获取快捷操作列表
   GET /api/ai/quick-actions?role={role_code}&display_mode={mode}
   
3. 创建快捷操作（管理员）
   POST /api/ai/quick-actions
   
4. 更新快捷操作（管理员）
   PUT /api/ai/quick-actions/:id
   
5. 删除快捷操作（管理员）
   DELETE /api/ai/quick-actions/:id
   
6. 关联角色与快捷操作（管理员）
   POST /api/ai/role-quick-action-relations
```

#### AI请求权限验证

在AI服务中集成权限验证逻辑：

```
验证逻辑伪代码：

async function handleAIRequest(userId, message, context) {
  // 1. 获取用户角色
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证AI功能权限
  if (!roleConfig.aiFeatures.enabled) {
    throw new PermissionDeniedError("AI功能未对此角色开放")
  }
  
  // 3. 分析用户意图
  const intent = await analyzeIntent(message)
  
  // 4. 验证工具调用权限
  const requiredTools = await selectTools(intent)
  for (const tool of requiredTools) {
    if (!roleConfig.aiFeatures.toolCalling.availableTools.includes(tool)) {
      throw new PermissionDeniedError(`您没有权限使用${tool}工具`)
    }
  }
  
  // 5. 处理AI请求
  const response = await callAIModel(message, requiredTools, context)
  
  // 6. 根据角色配置决定渲染模式
  const renderMode = determineRenderMode(
    response, 
    context.displayMode, 
    roleConfig.renderConfig
  )
  
  return {
    content: response.content,
    componentData: renderMode === 'component' ? response.componentData : null,
    renderMode: renderMode
  }
}
```

#### 数据权限过滤

在数据查询工具中实施权限过滤：

```
数据过滤伪代码：

async function queryData(tableName, conditions, userId) {
  // 1. 获取用户角色
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证表访问权限
  if (!roleConfig.aiFeatures.dataQuery.tables.includes(tableName)) {
    throw new PermissionDeniedError(`您没有权限访问${tableName}表`)
  }
  
  // 3. 应用数据范围过滤
  const filters = await getDataFilters(user, roleConfig)
  
  switch (roleConfig.aiFeatures.dataQuery.scope) {
    case "all":
      // 园长：无额外过滤
      break
      
    case "class_and_student":
      // 老师：只查询自己班级的数据
      const teacherClasses = await getTeacherClasses(userId)
      conditions.classId = { $in: teacherClasses.map(c => c.id) }
      break
      
    case "own_child_only":
      // 家长：只查询自己孩子的数据
      const parentChildren = await getParentChildren(userId)
      conditions.studentId = { $in: parentChildren.map(c => c.id) }
      break
  }
  
  // 4. 执行查询
  return await database.query(tableName, conditions)
}
```

#### 工具调用权限控制

在AI工具编排时验证权限：

```
工具权限验证伪代码：

async function executeToolCall(toolName, params, userId) {
  // 1. 获取用户角色配置
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证工具调用权限
  if (!roleConfig.aiFeatures.toolCalling.availableTools.includes(toolName)) {
    return {
      success: false,
      error: `您的角色（${roleConfig.roleName}）没有权限调用${toolName}工具`
    }
  }
  
  // 3. 验证工具调用参数
  const validatedParams = await validateToolParams(toolName, params, userId)
  
  // 4. 执行工具
  const result = await tools[toolName].execute(validatedParams, userId)
  
  return {
    success: true,
    result: result
  }
}
```

#### 渲染决策逻辑

后端需要根据角色配置决定是否返回组件数据：

```
渲染决策伪代码：

function shouldRenderComponent(
  queryResult,
  displayMode,
  roleConfig
) {
  // 1. 侧边栏和移动端不支持组件渲染
  if (displayMode === 'sidebar' || displayMode === 'mobile') {
    return false
  }
  
  // 2. 检查角色是否启用组件渲染
  if (!roleConfig.renderConfig.componentConfig.enabledComponents.length) {
    return false
  }
  
  // 3. 根据数据量判断
  const threshold = roleConfig.renderConfig.renderRules.autoComponentThreshold
  if (queryResult.rows && queryResult.rows.length > threshold) {
    return true
  }
  
  // 4. 根据查询意图判断
  if (roleConfig.renderConfig.renderRules.preferComponentForQuery) {
    const queryKeywords = ['统计', '分析', '对比', '趋势']
    if (queryKeywords.some(kw => queryResult.query.includes(kw))) {
      return true
    }
  }
  
  return false
}
```

### 数据库实现要点

#### 表结构创建

需要创建的数据表及索引：

```
数据表创建要点：

1. ai_role_configs表
   - 主键：id
   - 唯一索引：(role_code, display_mode)
   - 状态索引：status
   
2. ai_quick_actions表
   - 主键：id
   - 唯一索引：action_code
   - 类别索引：action_category
   - 状态索引：status
   
3. role_quick_action_relations表
   - 主键：id
   - 联合唯一索引：(role_code, action_code, display_mode)
   - 角色索引：role_code
   - 显示模式索引：display_mode
```

#### 初始数据填充

系统需要预置三种角色的默认配置：

```
初始化数据要点：

1. 三种角色基础配置（principal, teacher, parent）
2. 各角色在三种显示模式下的配置（fullpage, sidebar, mobile）
3. 预置快捷操作数据（每个角色8-10个）
4. 角色与快捷操作的关联关系
5. 默认AI功能配置（JSON格式）
6. 默认渲染模式配置（JSON格式）
```

### 配置管理实现

#### 动态配置更新

支持运行时动态更新角色配置，无需重启服务：

```
配置更新流程：

管理员修改配置 → 保存到数据库 → 触发配置更新事件
                                    ↓
                              更新内存缓存
                                    ↓
                              通知相关服务
                                    ↓
                              配置生效（实时）
```

#### 配置缓存策略

为提升性能，角色配置应实施缓存：

```
缓存策略：

1. 首次加载时将配置缓存到内存
2. 缓存过期时间：30分钟
3. 配置更新时立即清除缓存
4. 支持按角色分片缓存
5. 缓存键格式：ai_role_config:{role_code}:{display_mode}
```

## 测试验证

### 功能测试

#### 角色权限测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| 园长快捷操作 | 园长登录后查看全屏模式快捷操作 | 显示运营分析、教师绩效等8个操作 |
| 老师快捷操作 | 老师登录后查看侧边栏快捷操作 | 显示今日课程、快速点名等4个操作 |
| 家长快捷操作 | 家长登录后查看移动端快捷操作 | 显示即时咨询、成长记录等4个操作 |
| 跨角色访问限制 | 家长尝试访问运营数据分析 | 提示权限不足，拒绝访问 |
| 数据权限隔离 | 老师查询学生数据 | 只返回自己班级的学生 |
| 工具调用限制 | 家长尝试调用web_search工具 | 工具不可用，返回友好提示 |

#### 渲染模式测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| PC全屏组件渲染 | 园长查询"招生数据统计" | 返回数据表格和图表组件 |
| PC全屏Markdown渲染 | 老师咨询"如何提升课堂氛围" | 返回Markdown格式建议 |
| 侧边栏Markdown渲染 | 任意角色在侧边栏查询数据 | 所有回复均为Markdown格式 |
| 移动端Markdown渲染 | 家长在移动端咨询育儿问题 | Markdown格式，字体较大，触屏优化 |
| 大数据表格简化 | 侧边栏查询返回超过10条数据 | 显示前5条 + "查看完整内容"提示 |
| 组件自动选择 | 园长查询"教师绩效对比" | 自动选择柱状图组件展示 |

#### 快捷操作测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| 快捷操作点击 | 点击"运营数据分析"按钮 | 自动填充提示词并发送 |
| 变量替换 | 点击包含变量的快捷操作 | 弹出表单要求填写变量 |
| 操作排序 | 查看快捷操作列表 | 按display_order顺序显示 |
| 模式适配 | 切换显示模式后查看快捷操作 | 显示适配当前模式的操作 |
| 图标显示 | 检查所有快捷操作图标 | 所有图标正确显示 |

### 性能测试

| 测试项 | 性能指标 | 测试方法 |
|-------|---------|---------|
| 配置加载速度 | < 100ms | 测量获取角色配置API响应时间 |
| 快捷操作渲染 | < 50ms | 测量快捷操作列表渲染时间 |
| 组件渲染性能 | < 200ms | 测量大数据表格渲染时间 |
| Markdown渲染性能 | < 100ms | 测量复杂Markdown内容渲染时间 |
| 权限验证开销 | < 20ms | 测量单次权限验证耗时 |
| 配置缓存命中率 | > 95% | 统计缓存命中率 |

### 兼容性测试

| 测试项 | 测试环境 | 预期结果 |
|-------|---------|---------|
| PC端浏览器 | Chrome, Firefox, Edge | 功能正常，样式一致 |
| 移动端浏览器 | iOS Safari, Android Chrome | 触屏交互流畅，Markdown显示正常 |
| 移动端屏幕适配 | 不同尺寸设备 | 界面自适应，文字可读 |
| 深色模式 | 系统深色模式 | Markdown样式适配深色主题 |

## 部署方案

### 数据库迁移

1. 创建新表：ai_role_configs、ai_quick_actions、role_quick_action_relations
2. 初始化三种角色的默认配置数据
3. 初始化快捷操作数据
4. 创建角色与快捷操作的关联关系

### 后端部署

1. 部署角色配置管理服务
2. 部署权限验证中间件
3. 更新AI服务，集成权限控制逻辑
4. 部署配置缓存服务
5. 更新API路由，添加新接口

### 前端部署

1. 更新AI助手组件，集成角色配置逻辑
2. 实现快捷操作动态渲染组件
3. 优化Markdown渲染器，支持多场景配置
4. 更新移动端AI助手页面
5. 部署新版本前端资源

### 配置管理

1. 创建配置管理后台界面（管理员专用）
2. 支持在线修改角色配置
3. 支持添加、编辑、删除快捷操作
4. 支持调整快捷操作与角色的关联关系
5. 提供配置导入导出功能

## 运维监控

### 监控指标

| 监控项 | 指标说明 | 告警阈值 |
|-------|---------|---------|
| 配置加载失败率 | 配置加载失败次数 / 总请求数 | > 1% |
| 权限验证失败率 | 权限验证失败次数 / 总AI请求数 | > 5% |
| 组件渲染失败率 | 组件渲染错误次数 / 总渲染次数 | > 2% |
| Markdown渲染失败率 | Markdown渲染错误次数 / 总渲染次数 | > 1% |
| 配置缓存命中率 | 缓存命中次数 / 缓存查询次数 | < 90% |
| 快捷操作使用率 | 快捷操作使用次数 / 总AI请求数 | - |

### 日志记录

需要记录的关键日志：

- 用户角色配置加载日志
- 权限验证结果日志（成功/失败）
- 快捷操作使用日志
- 渲染模式选择日志
- 组件渲染错误日志
- 数据权限过滤日志
- 配置更新操作日志

### 异常处理

| 异常情况 | 处理策略 |
|---------|---------|
| 配置加载失败 | 使用默认配置，记录错误日志 |
| 权限验证失败 | 返回友好提示，不暴露敏感信息 |
| 组件渲染失败 | 降级为Markdown渲染 |
| Markdown渲染失败 | 显示纯文本内容 |
| 工具调用权限不足 | 返回权限说明和替代建议 |
| 数据查询权限不足 | 自动过滤数据，只返回允许的范围 |

## 后续优化方向

### 短期优化（1-3个月）

1. 收集用户使用反馈，优化快捷操作设置
2. 分析各角色快捷操作使用频率，调整默认配置
3. 优化Markdown渲染样式，提升移动端阅读体验
4. 增加更多可视化组件类型
5. 优化组件渲染性能

### 中期优化（3-6个月）

1. 支持用户自定义快捷操作
2. 实现快捷操作模板市场
3. 支持多语言提示词模板
4. 增加AI功能使用教程和引导
5. 实现快捷操作分组和分类

### 长期优化（6-12个月）

1. 基于用户行为智能推荐快捷操作
2. 实现角色配置的A/B测试能力
3. 支持跨角色协作功能
4. 增加语音快捷操作
5. 实现AI助手个性化定制

## 风险评估

| 风险项 | 风险等级 | 应对措施 |
|-------|---------|---------|
| 角色配置错误导致功能不可用 | 高 | 配置校验机制，默认配置兜底 |
| 权限控制漏洞导致数据泄露 | 高 | 多层权限验证，安全审计 |
| 组件渲染性能问题 | 中 | 降级策略，性能监控 |
| 移动端Markdown显示异常 | 中 | 兼容性测试，样式兜底 |
| 配置缓存不一致 | 中 | 缓存失效机制，定期刷新 |
| 快捷操作提示词设计不合理 | 低 | 用户反馈迭代，持续优化 |

## 成功指标

| 指标 | 目标值 | 测量方法 |
|-----|--------|---------|
| 快捷操作使用率 | > 40% | 统计快捷操作触发次数占AI请求总数的比例 |
| 各角色AI功能使用率 | 园长 > 60%, 老师 > 70%, 家长 > 50% | 统计各角色使用AI功能的活跃用户比例 |
| 权限验证准确率 | 100% | 测试所有权限场景，确保无漏洞 |
| 渲染模式正确率 | > 95% | 统计组件渲染决策的准确性 |
| 用户满意度 | > 4.0/5.0 | 用户反馈调查问卷 |
| 系统响应时间 | P95 < 2s | 监控AI请求端到端响应时间 |

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 今日课程安排 | today_schedule | 显示今天的课程安排和注意事项 |
| 快速点名 | quick_attendance | 协助进行班级考勤 |
| 学生信息查询 | student_info_query | 查询{学生姓名}的信息 |
| 教学灵感 | teaching_inspiration | 给我一些关于{主题}的教学灵感 |

**移动端快捷操作**

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 随手记录 | quick_note | 记录课堂观察或学生表现 |
| 家长消息 | parent_message | 帮我回复家长关于{话题}的消息 |
| 应急处理 | emergency_handling | 遇到{情况}应该如何处理 |
| 拍照识别 | photo_recognition | （支持拍照上传识别） |

##### 家长角色快捷功能

**PC端全屏模式快捷操作**

| 操作名称 | 操作代码 | 类别 | 图标 | 提示词模板 |
|---------|---------|------|------|----------|
| 育儿知识问答 | parenting_qa | knowledge | question | 关于{孩子年龄}孩子的{问题}应该怎么处理 |
| 成长报告解读 | growth_report_interpretation | report | chart | 解读{孩子姓名}的成长评估报告 |
| 亲子活动建议 | family_activity_suggestion | activity | heart | 推荐适合周末的亲子活动 |
| 营养食谱推荐 | nutrition_recipe_recommendation | health | food | 推荐适合{年龄}孩子的营养食谱 |
| 行为问题咨询 | behavior_problem_consultation | consultation | user-question | 孩子出现{行为}怎么办 |
| 学习能力评估 | learning_ability_assessment | assessment | file | 评估孩子的{能力}发展情况 |
| 家庭教育建议 | family_education_advice | education | book | 给予家庭教育方法建议 |
| 心理健康咨询 | psychological_health_consultation | health | heart-pulse | 关于孩子心理健康的咨询 |

**PC端侧边栏快捷操作**

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 今日表现查询 | today_performance | 查看孩子今天在园表现 |
| 快速提问 | quick_question | 快速咨询育儿问题 |
| 作业辅导 | homework_tutoring | 帮助辅导孩子完成{作业} |
| 老师留言 | teacher_message | 查看老师的留言和反馈 |

**移动端快捷操作**

| 操作名称 | 操作代码 | 提示词模板 |
|---------|---------|----------|
| 即时咨询 | instant_consultation | 紧急育儿问题咨询 |
| 成长记录 | growth_record | 记录孩子的成长瞬间 |
| 接送提醒 | pickup_reminder | 设置接送时间提醒 |
| 健康打卡 | health_checkin | 提交孩子健康状况 |

#### AI功能配置

##### 功能能力矩阵

| AI功能 | 园长 | 老师 | 家长 | 功能说明 |
|-------|-----|-----|-----|---------|
| 数据查询与分析 | 全部权限 | 班级数据 | 孩子数据 | 查询和分析相关数据 |
| 智能报告生成 | 运营报告 | 教学报告 | 成长报告 | 自动生成各类报告文档 |
| 工具调用能力 | 全部工具 | 教学工具 | 基础工具 | 可调用的后端工具集 |
| 组件渲染能力 | 全部组件 | 教学组件 | 简化组件 | 可展示的可视化组件 |
| 多轮对话能力 | 支持 | 支持 | 支持 | 上下文连续对话 |
| 智能代理模式 | 支持 | 支持 | 不支持 | Auto自动工具调用 |
| 文件上传能力 | 支持 | 支持 | 仅图片 | 文件/图片上传分析 |
| 语音交互能力 | 移动端支持 | 移动端支持 | 全端支持 | 语音输入输出 |
| 历史记录查询 | 全部记录 | 个人记录 | 个人记录 | 对话历史查询 |
| 网络搜索能力 | 支持 | 支持 | 限制 | 调用网络搜索 |

##### 园长角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "all",
    tables: ["students", "teachers", "classes", "enrollment", "finance", "activities"],
    permissions: ["read", "export"]
  },
  reportGeneration: {
    enabled: true,
    types: ["operation", "finance", "performance", "analysis"],
    formats: ["pdf", "word", "excel"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "any_query",
      "generate_report",
      "data_analysis",
      "render_component",
      "web_search",
      "generate_document",
      "send_notification"
    ],
    maxRounds: 20
  },
  componentRendering: {
    enabled: true,
    availableComponents: [
      "data-table",
      "chart-bar",
      "chart-line",
      "chart-pie",
      "statistics-card",
      "dashboard"
    ]
  },
  agentMode: {
    enabled: true,
    autoToolSelection: true,
    maxIterations: 10
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image", "document", "excel"],
    maxSize: 10485760
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile"]
  },
  webSearch: {
    enabled: true,
    sources: ["all"]
  }
}
```

##### 老师角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "class_and_student",
    tables: ["students", "classes", "activities", "assessments"],
    filters: ["own_class_only"],
    permissions: ["read"]
  },
  reportGeneration: {
    enabled: true,
    types: ["teaching_plan", "student_assessment", "class_activity"],
    formats: ["pdf", "word"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "query_student_info",
      "query_class_data",
      "generate_teaching_plan",
      "render_component",
      "generate_assessment",
      "web_search"
    ],
    maxRounds: 15
  },
  componentRendering: {
    enabled: true,
    availableComponents: [
      "data-table",
      "chart-bar",
      "student-card",
      "attendance-table",
      "schedule-calendar"
    ]
  },
  agentMode: {
    enabled: true,
    autoToolSelection: true,
    maxIterations: 8
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image", "document"],
    maxSize: 5242880
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile"]
  },
  webSearch: {
    enabled: true,
    sources: ["education", "parenting"]
  }
}
```

##### 家长角色AI功能配置

```
ai_features_config: {
  dataQuery: {
    enabled: true,
    scope: "own_child_only",
    tables: ["students", "activities", "assessments"],
    filters: ["own_child_relation"],
    permissions: ["read"]
  },
  reportGeneration: {
    enabled: true,
    types: ["growth_report"],
    formats: ["pdf"]
  },
  toolCalling: {
    enabled: true,
    availableTools: [
      "query_child_info",
      "query_child_performance",
      "parenting_consultation"
    ],
    maxRounds: 10
  },
  componentRendering: {
    enabled: false,
    availableComponents: []
  },
  agentMode: {
    enabled: false
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ["image"],
    maxSize: 2097152
  },
  voiceInteraction: {
    enabled: true,
    modes: ["mobile", "sidebar"]
  },
  webSearch: {
    enabled: false
  }
}
```

### 渲染模式配置

#### 渲染策略设计

系统根据不同的显示场景采用差异化的内容渲染策略，以适配不同的界面空间和交互方式。

##### 渲染模式类型

| 渲染模式 | 适用场景 | 说明 | 技术实现 |
|---------|---------|------|---------|
| markdown | 移动端、PC侧边栏 | 纯Markdown文本渲染 | 使用marked库解析Markdown |
| component | PC全屏模式 | 可视化组件渲染 | Vue组件动态渲染 |
| hybrid | PC全屏模式 | Markdown + 组件混合 | 同时支持文本和组件 |

##### PC端全屏模式渲染策略（hybrid）

**渲染决策流程**

```
用户查询 → AI分析意图 → 判断是否需要组件渲染
                               ↓
                    是 → 调用render_component工具 → 返回组件配置
                               ↓
                    否 → 使用Markdown格式回复
                               ↓
                    前端接收响应 → 渲染处理
                               ↓
               ┌───────────────┴───────────────┐
               ↓                               ↓
        包含组件数据                      仅包含文本
               ↓                               ↓
    DynamicComponentRenderer             MarkdownRenderer
        渲染可视化组件                      渲染格式化文本
```

**组件渲染触发条件**

- 用户明确要求表格、图表等可视化展示
- 查询结果数据量较大（超过10条记录）
- 数据需要对比分析（如时间序列、分类统计）
- 需要交互操作（如排序、筛选、导出）

**组件类型与适用场景**

| 组件类型 | 组件代码 | 适用场景 | 支持的角色 |
|---------|---------|---------|----------|
| 数据表格 | data-table | 展示列表数据，支持排序、筛选 | 园长、老师 |
| 柱状图 | chart-bar | 数据对比分析 | 园长、老师 |
| 折线图 | chart-line | 趋势分析 | 园长、老师 |
| 饼图 | chart-pie | 比例分析 | 园长、老师 |
| 统计卡片 | statistics-card | 关键指标展示 | 园长、老师 |
| 仪表盘 | dashboard | 综合数据看板 | 园长 |
| 日历 | schedule-calendar | 课程安排、活动日历 | 老师 |
| 学生卡片 | student-card | 学生信息展示 | 老师 |

**Markdown渲染场景**

- 简单文本回复
- 建议和指导性内容
- 步骤说明和流程描述
- 问答式对话

##### PC端侧边栏模式渲染策略（markdown）

**仅使用Markdown渲染**

由于侧边栏空间有限，所有AI回复均使用Markdown格式展示，提供简洁清晰的文本信息。

**Markdown增强格式支持**

- 标题分级（H1-H6）
- 列表（有序/无序）
- 代码块（带语法高亮）
- 表格（简单表格）
- 引用块
- 粗体/斜体/删除线
- 链接和图片（图片支持点击放大）

**侧边栏Markdown样式优化**

- 字体大小：适中（14px）
- 行间距：适当增加（1.6）
- 表格：自适应宽度，横向滚动
- 代码块：深色背景，浅色文字
- 引用块：左侧蓝色竖条标识

##### 移动端模式渲染策略（markdown）

**触屏优化的Markdown渲染**

移动端同样采用纯Markdown渲染，但针对触屏操作进行优化。

**移动端Markdown特殊优化**

- 字体大小：较大（16px），便于阅读
- 触摸区域：链接和按钮区域放大（最小44x44px）
- 表格：完全响应式，自动折叠为卡片式展示
- 代码块：支持横向滑动，固定高度
- 图片：自动适配屏幕宽度，支持手势缩放
- 列表：间距增大，便于点击
- 引用块：简化样式，减少视觉干扰

**移动端内容简化策略**

AI在为移动端生成回复时，会自动：

- 减少文本长度（控制在300字以内）
- 使用列表代替长段落
- 突出关键信息
- 减少专业术语
- 提供简明扼要的结论

#### 渲染模式配置表

##### 角色与场景渲染配置

| 角色 | PC全屏模式 | PC侧边栏模式 | 移动端模式 |
|-----|----------|------------|----------|
| 园长 | hybrid（优先component） | markdown | markdown |
| 老师 | hybrid（适度component） | markdown | markdown |
| 家长 | markdown | markdown | markdown |

##### 渲染配置参数

**园长角色 - PC全屏模式**

```
render_config: {
  mode: "hybrid",
  componentPriority: "high",
  markdownConfig: {
    theme: "default",
    codeHighlight: true,
    tableStyle: "bordered",
    fontSize: 14
  },
  componentConfig: {
    enabledComponents: [
      "data-table",
      "chart-bar",
      "chart-line",
      "chart-pie",
      "statistics-card",
      "dashboard"
    ],
    defaultChartTheme: "professional",
    tablePageSize: 20,
    enableExport: true,
    enableInteraction: true
  },
  renderRules: {
    autoComponentThreshold: 10,
    preferComponentForQuery: true,
    maxComponentsPerResponse: 3
  }
}
```

**老师角色 - PC全屏模式**

```
render_config: {
  mode: "hybrid",
  componentPriority: "medium",
  markdownConfig: {
    theme: "default",
    codeHighlight: true,
    tableStyle: "striped",
    fontSize: 14
  },
  componentConfig: {
    enabledComponents: [
      "data-table",
      "chart-bar",
      "student-card",
      "attendance-table",
      "schedule-calendar"
    ],
    defaultChartTheme: "friendly",
    tablePageSize: 15,
    enableExport: false,
    enableInteraction: true
  },
  renderRules: {
    autoComponentThreshold: 15,
    preferComponentForQuery: false,
    maxComponentsPerResponse: 2
  }
}
```

**所有角色 - PC侧边栏模式**

```
render_config: {
  mode: "markdown",
  markdownConfig: {
    theme: "compact",
    codeHighlight: true,
    tableStyle: "simple",
    fontSize: 14,
    maxWidth: "100%",
    lineHeight: 1.6,
    compactSpacing: true
  },
  fallbackRules: {
    maxTableRows: 5,
    tableTruncateMessage: "数据过多，请在全屏模式查看完整内容"
  }
}
```

**所有角色 - 移动端模式**

```
render_config: {
  mode: "markdown",
  markdownConfig: {
    theme: "mobile",
    codeHighlight: false,
    tableStyle: "card",
    fontSize: 16,
    touchOptimized: true,
    lineHeight: 1.8,
    imageAutoSize: true,
    enableImageZoom: true
  },
  contentOptimization: {
    maxLength: 300,
    preferList: true,
    simplifyTables: true,
    autoSummary: true
  }
}
```

### 权限验证机制

#### 前端权限控制

##### 快捷操作权限验证

前端在渲染快捷操作按钮时，根据用户角色过滤可用操作：

```
验证流程：
用户登录 → 获取用户角色（principal/teacher/parent）
         ↓
    获取当前显示模式（fullpage/sidebar/mobile）
         ↓
    查询角色快捷操作配置（role_quick_action_relations）
         ↓
    过滤符合当前角色和显示模式的操作
         ↓
    按display_order排序后渲染
```

##### 功能入口权限控制

不同功能入口根据角色显示或隐藏：

| 功能入口 | 园长 | 老师 | 家长 | 验证方式 |
|---------|-----|-----|-----|---------|
| 智能代理按钮 | 显示 | 显示 | 隐藏 | 前端v-if判断 |
| 文件上传入口 | 显示 | 显示 | 仅图片上传 | 文件类型限制 |
| 历史记录查看 | 全部记录 | 个人记录 | 个人记录 | 数据过滤 |
| 网络搜索开关 | 显示 | 显示 | 隐藏 | 前端v-if判断 |
| 导出功能 | 显示 | 部分显示 | 隐藏 | 基于配置显示 |

#### 后端权限控制

##### API接口权限验证

所有AI相关API请求都需要进行权限验证：

```
请求接收 → JWT Token验证 → 解析用户角色
                            ↓
                    加载角色AI功能配置
                            ↓
                    验证请求功能是否允许
                            ↓
            ┌───────────────┴───────────────┐
            ↓                               ↓
        权限通过                         权限拒绝
            ↓                               ↓
        执行业务逻辑                   返回403错误
```

##### 数据查询权限控制

不同角色访问数据时进行权限过滤：

**园长角色数据权限**

- 可访问全部数据表
- 不受数据范围限制
- 可导出所有数据

**老师角色数据权限**

- 只能访问自己班级的学生数据
- 只能查询自己负责的活动数据
- 不能访问财务相关数据
- 查询时自动添加过滤条件：`WHERE class_id IN (teacher_classes)`

**家长角色数据权限**

- 只能访问自己孩子的数据
- 只能查看孩子相关的活动和评估
- 不能访问其他学生数据
- 查询时自动添加过滤条件：`WHERE student_id IN (parent_children)`

##### 工具调用权限控制

后端AI工具调用时验证用户是否有权限调用该工具：

```
AI意图识别 → 选择工具 → 验证用户角色是否允许调用该工具
                                ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
                允许调用                  拒绝调用
                    ↓                       ↓
                执行工具                  返回错误提示
                    ↓
            工具内部再次验证数据权限
                    ↓
                返回结果
```

### 用户体验设计

#### 界面布局优化

##### PC端全屏模式界面

**园长角色专属界面**

```
┌─────────────────────────────────────────────────────────────┐
│ 左侧功能栏（折叠）   │    中央对话区              │  执行步骤区  │
├─────────────────────┼─────────────────────────┼────────────┤
│ 【新建对话】         │  对话历史消息              │  工具调用   │
│                     │  ┌────────────────────┐ │  进度展示   │
│ 快捷操作：           │  │ 用户：分析本月数据   │ │            │
│ • 运营数据分析       │  └────────────────────┘ │  【数据表格】│
│ • 教师绩效评估       │                         │  【图表展示】│
│ • 招生策略规划       │  ┌────────────────────┐ │            │
│ • 财务报表生成       │  │ AI：[数据表格组件]  │ │            │
│ • 家长满意度分析     │  │    [趋势图表组件]   │ │            │
│ • 活动策划建议       │  │                     │ │            │
│ • 资源配置优化       │  │  Markdown分析文本   │ │            │
│ • 风险预警分析       │  └────────────────────┘ │            │
│                     │                         │            │
│ 常用功能：           │  输入区：               │            │
│ • 统计信息           │  [___________________] │            │
│ • 设置               │  [发送] [停止] [智能代理]│           │
└─────────────────────┴─────────────────────────┴────────────┘
```

**老师角色专属界面**

```
┌─────────────────────────────────────────────────────────────┐
│ 左侧功能栏（折叠）   │    中央对话区              │  执行步骤区  │
├─────────────────────┼─────────────────────────┼────────────┤
│ 【新建对话】         │  对话历史消息              │  工具调用   │
│                     │                         │  进度展示   │
│ 快捷操作：           │  ┌────────────────────┐ │            │
│ • 教学计划生成       │  │ 用户：查询今天课程   │ │  【学生卡片】│
│ • 学生评估报告       │  └────────────────────┘ │  【课程表】  │
│ • 班级活动策划       │                         │            │
│ • 家长沟通话术       │  ┌────────────────────┐ │            │
│ • 课堂观察记录       │  │ AI：[课程表组件]    │ │            │
│ • 学生行为分析       │  │                     │ │            │
│ • 教学资源推荐       │  │  Markdown文字说明   │ │            │
│ • 个别化教育方案     │  └────────────────────┘ │            │
│                     │                         │            │
│ 我的班级：           │  输入区：               │            │
│ • 小班A             │  [___________________] │            │
│ • 学生列表           │  [发送] [停止] [智能代理]│           │
└─────────────────────┴─────────────────────────┴────────────┘
```

##### PC端侧边栏模式界面

**通用侧边栏布局（所有角色）**

```
┌────────────────────────────┐
│  AI助手                [X] │
├────────────────────────────┤
│  【快捷操作】（基于角色动态）│
│  ┌────┐ ┌────┐ ┌────┐    │
│  │操作1│ │操作2│ │操作3│   │
│  └────┘ └────┘ └────┘    │
├────────────────────────────┤
│  对话区（Markdown渲染）     │
│                            │
│  用户：查询今天数据          │
│  ────────────────────────  │
│  AI：                      │
│  ## 今日数据概览            │
│                            │
│  - 项目1：XXX              │
│  - 项目2：XXX              │
│  - 项目3：XXX              │
│                            │
│  > 提示：详细数据请在全屏    │
│  > 模式查看                │
│                            │
│  （自动滚动）               │
├────────────────────────────┤
│  输入区：                   │
│  [___________________]    │
│  [发送] [全屏] [清空]       │
└────────────────────────────┘
```

##### 移动端界面

**通用移动端布局（所有角色）**

```
┌────────────────────────────┐
│ ← AI育儿助手              ≡│
├────────────────────────────┤
│  【头部统计卡片】            │
│  对话次数 | 解决问题 | 满意度│
├────────────────────────────┤
│  【搜索栏】                 │
│  🔍 搜索历史对话...         │
├────────────────────────────┤
│  【快捷问题】（基于角色）     │
│  ┌────────┐ ┌────────┐    │
│  │ 问题1   │ │ 问题2   │   │
│  └────────┘ └────────┘    │
│  ┌────────┐ ┌────────┐    │
│  │ 问题3   │ │ 问题4   │   │
│  └────────┘ └────────┘    │
├────────────────────────────┤
│  【对话区】（Markdown渲染）  │
│                            │
│  👤 用户                   │
│  ┌──────────────────────┐│
│  │ 查询孩子今天表现       ││
│  └──────────────────────┘│
│                            │
│  🤖 AI助手                 │
│  ┌──────────────────────┐│
│  │ ## 今日表现            ││
│  │                       ││
│  │ - 出勤正常             ││
│  │ - 午餐情况良好         ││
│  │ - 活动积极参与         ││
│  └──────────────────────┘│
│                            │
│  （触摸滑动查看更多）        │
├────────────────────────────┤
│  【输入区】                 │
│  [_____________________]  │
│  [🎤] [📷] [发送]          │
└────────────────────────────┘
```

#### 交互流程设计

##### 快捷操作使用流程

```
用户点击快捷操作按钮
        ↓
自动填充预设提示词模板
        ↓
提示词包含变量（如{班级}、{主题}）
        ↓
    ┌───┴────┐
    ↓        ↓
  有变量    无变量
    ↓        ↓
弹出表单     直接发送
填写变量     
    ↓        ↓
提交表单 ←───┘
    ↓
AI开始处理
    ↓
实时显示处理进度（全屏模式）
    ↓
返回结果（根据渲染模式展示）
```

##### 渲染模式自动切换流程

```
AI生成回复内容
        ↓
判断当前显示模式
        ↓
    ┌───┴────────┐
    ↓            ↓
 PC全屏模式    侧边栏/移动端
    ↓            ↓
分析回复内容   强制Markdown渲染
    ↓
是否包含大量数据
    ↓
  ┌─┴─┐
  ↓   ↓
 是   否
  ↓   ↓
组件渲染 Markdown渲染
```

##### 权限受限处理流程

```
用户尝试使用功能
        ↓
后端验证权限
        ↓
    ┌───┴────┐
    ↓        ↓
 权限通过   权限拒绝
    ↓        ↓
 正常执行   返回友好提示
            ↓
        "此功能仅对{角色}开放"
            ↓
        提供替代建议
```

## 技术实现要点

### 前端实现要点

#### 角色配置获取

在用户登录后，前端需要获取当前角色的AI功能配置：

```
API端点：GET /api/ai/role-config?role={role_code}&display_mode={mode}

返回数据结构：
{
  roleCode: "principal",
  roleName: "园长",
  displayMode: "fullpage",
  quickActions: [
    {
      actionCode: "operation_data_analysis",
      actionName: "运营数据分析",
      icon: "chart-line",
      promptTemplate: "分析最近{period}的运营数据",
      displayOrder: 1
    },
    ...
  ],
  aiFeatures: {
    dataQuery: { enabled: true, scope: "all", ... },
    reportGeneration: { enabled: true, types: [...], ... },
    ...
  },
  renderConfig: {
    mode: "hybrid",
    componentPriority: "high",
    ...
  }
}
```

#### 快捷操作组件实现

根据角色配置动态渲染快捷操作按钮：

```
组件伪代码逻辑：

<template>
  <div class="quick-actions">
    <button
      v-for="action in availableActions"
      :key="action.actionCode"
      @click="handleQuickAction(action)"
      class="action-btn"
    >
      <icon :name="action.icon" />
      <span>{{ action.actionName }}</span>
    </button>
  </div>
</template>

<script>
computed: {
  availableActions() {
    // 根据当前角色和显示模式过滤快捷操作
    return this.roleConfig.quickActions
      .filter(action => 
        action.displayModes.includes(this.currentDisplayMode)
      )
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }
}

methods: {
  handleQuickAction(action) {
    // 处理提示词模板中的变量
    if (action.promptTemplate.includes('{')) {
      this.showVariableForm(action)
    } else {
      this.sendMessage(action.promptTemplate)
    }
  }
}
</script>
```

#### 渲染模式处理

根据配置和内容类型选择渲染方式：

```
渲染逻辑伪代码：

function renderAIResponse(response, displayMode, roleConfig) {
  const renderMode = roleConfig.renderConfig.mode
  
  if (displayMode === 'sidebar' || displayMode === 'mobile') {
    // 强制使用Markdown渲染
    return renderMarkdown(response.content)
  }
  
  if (displayMode === 'fullpage' && renderMode === 'hybrid') {
    // 检查是否包含组件数据
    if (response.componentData) {
      return renderComponent(response.componentData)
    } else {
      return renderMarkdown(response.content)
    }
  }
  
  // 默认使用Markdown
  return renderMarkdown(response.content)
}
```

#### Markdown渲染增强

针对不同场景优化Markdown渲染样式：

```
Markdown配置伪代码：

const markdownConfig = {
  sidebar: {
    fontSize: 14,
    lineHeight: 1.6,
    compactSpacing: true,
    maxTableRows: 5,
    tableOverflowHandler: 'scroll'
  },
  mobile: {
    fontSize: 16,
    lineHeight: 1.8,
    touchOptimized: true,
    tableStyle: 'card',
    imageAutoSize: true,
    enableImageZoom: true
  },
  fullpage: {
    fontSize: 14,
    lineHeight: 1.6,
    tableStyle: 'bordered',
    codeHighlight: true
  }
}
```

### 后端实现要点

#### 角色配置管理接口

提供角色配置的CRUD接口：

```
接口列表：

1. 获取角色配置
   GET /api/ai/role-config?role={role_code}&display_mode={mode}
   
2. 获取快捷操作列表
   GET /api/ai/quick-actions?role={role_code}&display_mode={mode}
   
3. 创建快捷操作（管理员）
   POST /api/ai/quick-actions
   
4. 更新快捷操作（管理员）
   PUT /api/ai/quick-actions/:id
   
5. 删除快捷操作（管理员）
   DELETE /api/ai/quick-actions/:id
   
6. 关联角色与快捷操作（管理员）
   POST /api/ai/role-quick-action-relations
```

#### AI请求权限验证

在AI服务中集成权限验证逻辑：

```
验证逻辑伪代码：

async function handleAIRequest(userId, message, context) {
  // 1. 获取用户角色
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证AI功能权限
  if (!roleConfig.aiFeatures.enabled) {
    throw new PermissionDeniedError("AI功能未对此角色开放")
  }
  
  // 3. 分析用户意图
  const intent = await analyzeIntent(message)
  
  // 4. 验证工具调用权限
  const requiredTools = await selectTools(intent)
  for (const tool of requiredTools) {
    if (!roleConfig.aiFeatures.toolCalling.availableTools.includes(tool)) {
      throw new PermissionDeniedError(`您没有权限使用${tool}工具`)
    }
  }
  
  // 5. 处理AI请求
  const response = await callAIModel(message, requiredTools, context)
  
  // 6. 根据角色配置决定渲染模式
  const renderMode = determineRenderMode(
    response, 
    context.displayMode, 
    roleConfig.renderConfig
  )
  
  return {
    content: response.content,
    componentData: renderMode === 'component' ? response.componentData : null,
    renderMode: renderMode
  }
}
```

#### 数据权限过滤

在数据查询工具中实施权限过滤：

```
数据过滤伪代码：

async function queryData(tableName, conditions, userId) {
  // 1. 获取用户角色
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证表访问权限
  if (!roleConfig.aiFeatures.dataQuery.tables.includes(tableName)) {
    throw new PermissionDeniedError(`您没有权限访问${tableName}表`)
  }
  
  // 3. 应用数据范围过滤
  const filters = await getDataFilters(user, roleConfig)
  
  switch (roleConfig.aiFeatures.dataQuery.scope) {
    case "all":
      // 园长：无额外过滤
      break
      
    case "class_and_student":
      // 老师：只查询自己班级的数据
      const teacherClasses = await getTeacherClasses(userId)
      conditions.classId = { $in: teacherClasses.map(c => c.id) }
      break
      
    case "own_child_only":
      // 家长：只查询自己孩子的数据
      const parentChildren = await getParentChildren(userId)
      conditions.studentId = { $in: parentChildren.map(c => c.id) }
      break
  }
  
  // 4. 执行查询
  return await database.query(tableName, conditions)
}
```

#### 工具调用权限控制

在AI工具编排时验证权限：

```
工具权限验证伪代码：

async function executeToolCall(toolName, params, userId) {
  // 1. 获取用户角色配置
  const user = await getUserById(userId)
  const roleConfig = await getRoleConfig(user.role)
  
  // 2. 验证工具调用权限
  if (!roleConfig.aiFeatures.toolCalling.availableTools.includes(toolName)) {
    return {
      success: false,
      error: `您的角色（${roleConfig.roleName}）没有权限调用${toolName}工具`
    }
  }
  
  // 3. 验证工具调用参数
  const validatedParams = await validateToolParams(toolName, params, userId)
  
  // 4. 执行工具
  const result = await tools[toolName].execute(validatedParams, userId)
  
  return {
    success: true,
    result: result
  }
}
```

#### 渲染决策逻辑

后端需要根据角色配置决定是否返回组件数据：

```
渲染决策伪代码：

function shouldRenderComponent(
  queryResult,
  displayMode,
  roleConfig
) {
  // 1. 侧边栏和移动端不支持组件渲染
  if (displayMode === 'sidebar' || displayMode === 'mobile') {
    return false
  }
  
  // 2. 检查角色是否启用组件渲染
  if (!roleConfig.renderConfig.componentConfig.enabledComponents.length) {
    return false
  }
  
  // 3. 根据数据量判断
  const threshold = roleConfig.renderConfig.renderRules.autoComponentThreshold
  if (queryResult.rows && queryResult.rows.length > threshold) {
    return true
  }
  
  // 4. 根据查询意图判断
  if (roleConfig.renderConfig.renderRules.preferComponentForQuery) {
    const queryKeywords = ['统计', '分析', '对比', '趋势']
    if (queryKeywords.some(kw => queryResult.query.includes(kw))) {
      return true
    }
  }
  
  return false
}
```

### 数据库实现要点

#### 表结构创建

需要创建的数据表及索引：

```
数据表创建要点：

1. ai_role_configs表
   - 主键：id
   - 唯一索引：(role_code, display_mode)
   - 状态索引：status
   
2. ai_quick_actions表
   - 主键：id
   - 唯一索引：action_code
   - 类别索引：action_category
   - 状态索引：status
   
3. role_quick_action_relations表
   - 主键：id
   - 联合唯一索引：(role_code, action_code, display_mode)
   - 角色索引：role_code
   - 显示模式索引：display_mode
```

#### 初始数据填充

系统需要预置三种角色的默认配置：

```
初始化数据要点：

1. 三种角色基础配置（principal, teacher, parent）
2. 各角色在三种显示模式下的配置（fullpage, sidebar, mobile）
3. 预置快捷操作数据（每个角色8-10个）
4. 角色与快捷操作的关联关系
5. 默认AI功能配置（JSON格式）
6. 默认渲染模式配置（JSON格式）
```

### 配置管理实现

#### 动态配置更新

支持运行时动态更新角色配置，无需重启服务：

```
配置更新流程：

管理员修改配置 → 保存到数据库 → 触发配置更新事件
                                    ↓
                              更新内存缓存
                                    ↓
                              通知相关服务
                                    ↓
                              配置生效（实时）
```

#### 配置缓存策略

为提升性能，角色配置应实施缓存：

```
缓存策略：

1. 首次加载时将配置缓存到内存
2. 缓存过期时间：30分钟
3. 配置更新时立即清除缓存
4. 支持按角色分片缓存
5. 缓存键格式：ai_role_config:{role_code}:{display_mode}
```

## 测试验证

### 功能测试

#### 角色权限测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| 园长快捷操作 | 园长登录后查看全屏模式快捷操作 | 显示运营分析、教师绩效等8个操作 |
| 老师快捷操作 | 老师登录后查看侧边栏快捷操作 | 显示今日课程、快速点名等4个操作 |
| 家长快捷操作 | 家长登录后查看移动端快捷操作 | 显示即时咨询、成长记录等4个操作 |
| 跨角色访问限制 | 家长尝试访问运营数据分析 | 提示权限不足，拒绝访问 |
| 数据权限隔离 | 老师查询学生数据 | 只返回自己班级的学生 |
| 工具调用限制 | 家长尝试调用web_search工具 | 工具不可用，返回友好提示 |

#### 渲染模式测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| PC全屏组件渲染 | 园长查询"招生数据统计" | 返回数据表格和图表组件 |
| PC全屏Markdown渲染 | 老师咨询"如何提升课堂氛围" | 返回Markdown格式建议 |
| 侧边栏Markdown渲染 | 任意角色在侧边栏查询数据 | 所有回复均为Markdown格式 |
| 移动端Markdown渲染 | 家长在移动端咨询育儿问题 | Markdown格式，字体较大，触屏优化 |
| 大数据表格简化 | 侧边栏查询返回超过10条数据 | 显示前5条 + "查看完整内容"提示 |
| 组件自动选择 | 园长查询"教师绩效对比" | 自动选择柱状图组件展示 |

#### 快捷操作测试

| 测试项 | 测试场景 | 预期结果 |
|-------|---------|---------|
| 快捷操作点击 | 点击"运营数据分析"按钮 | 自动填充提示词并发送 |
| 变量替换 | 点击包含变量的快捷操作 | 弹出表单要求填写变量 |
| 操作排序 | 查看快捷操作列表 | 按display_order顺序显示 |
| 模式适配 | 切换显示模式后查看快捷操作 | 显示适配当前模式的操作 |
| 图标显示 | 检查所有快捷操作图标 | 所有图标正确显示 |

### 性能测试

| 测试项 | 性能指标 | 测试方法 |
|-------|---------|---------|
| 配置加载速度 | < 100ms | 测量获取角色配置API响应时间 |
| 快捷操作渲染 | < 50ms | 测量快捷操作列表渲染时间 |
| 组件渲染性能 | < 200ms | 测量大数据表格渲染时间 |
| Markdown渲染性能 | < 100ms | 测量复杂Markdown内容渲染时间 |
| 权限验证开销 | < 20ms | 测量单次权限验证耗时 |
| 配置缓存命中率 | > 95% | 统计缓存命中率 |

### 兼容性测试

| 测试项 | 测试环境 | 预期结果 |
|-------|---------|---------|
| PC端浏览器 | Chrome, Firefox, Edge | 功能正常，样式一致 |
| 移动端浏览器 | iOS Safari, Android Chrome | 触屏交互流畅，Markdown显示正常 |
| 移动端屏幕适配 | 不同尺寸设备 | 界面自适应，文字可读 |
| 深色模式 | 系统深色模式 | Markdown样式适配深色主题 |

## 部署方案

### 数据库迁移

1. 创建新表：ai_role_configs、ai_quick_actions、role_quick_action_relations
2. 初始化三种角色的默认配置数据
3. 初始化快捷操作数据
4. 创建角色与快捷操作的关联关系

### 后端部署

1. 部署角色配置管理服务
2. 部署权限验证中间件
3. 更新AI服务，集成权限控制逻辑
4. 部署配置缓存服务
5. 更新API路由，添加新接口

### 前端部署

1. 更新AI助手组件，集成角色配置逻辑
2. 实现快捷操作动态渲染组件
3. 优化Markdown渲染器，支持多场景配置
4. 更新移动端AI助手页面
5. 部署新版本前端资源

### 配置管理

1. 创建配置管理后台界面（管理员专用）
2. 支持在线修改角色配置
3. 支持添加、编辑、删除快捷操作
4. 支持调整快捷操作与角色的关联关系
5. 提供配置导入导出功能

## 运维监控

### 监控指标

| 监控项 | 指标说明 | 告警阈值 |
|-------|---------|---------|
| 配置加载失败率 | 配置加载失败次数 / 总请求数 | > 1% |
| 权限验证失败率 | 权限验证失败次数 / 总AI请求数 | > 5% |
| 组件渲染失败率 | 组件渲染错误次数 / 总渲染次数 | > 2% |
| Markdown渲染失败率 | Markdown渲染错误次数 / 总渲染次数 | > 1% |
| 配置缓存命中率 | 缓存命中次数 / 缓存查询次数 | < 90% |
| 快捷操作使用率 | 快捷操作使用次数 / 总AI请求数 | - |

### 日志记录

需要记录的关键日志：

- 用户角色配置加载日志
- 权限验证结果日志（成功/失败）
- 快捷操作使用日志
- 渲染模式选择日志
- 组件渲染错误日志
- 数据权限过滤日志
- 配置更新操作日志

### 异常处理

| 异常情况 | 处理策略 |
|---------|---------|
| 配置加载失败 | 使用默认配置，记录错误日志 |
| 权限验证失败 | 返回友好提示，不暴露敏感信息 |
| 组件渲染失败 | 降级为Markdown渲染 |
| Markdown渲染失败 | 显示纯文本内容 |
| 工具调用权限不足 | 返回权限说明和替代建议 |
| 数据查询权限不足 | 自动过滤数据，只返回允许的范围 |

## 后续优化方向

### 短期优化（1-3个月）

1. 收集用户使用反馈，优化快捷操作设置
2. 分析各角色快捷操作使用频率，调整默认配置
3. 优化Markdown渲染样式，提升移动端阅读体验
4. 增加更多可视化组件类型
5. 优化组件渲染性能

### 中期优化（3-6个月）

1. 支持用户自定义快捷操作
2. 实现快捷操作模板市场
3. 支持多语言提示词模板
4. 增加AI功能使用教程和引导
5. 实现快捷操作分组和分类

### 长期优化（6-12个月）

1. 基于用户行为智能推荐快捷操作
2. 实现角色配置的A/B测试能力
3. 支持跨角色协作功能
4. 增加语音快捷操作
5. 实现AI助手个性化定制

## 风险评估

| 风险项 | 风险等级 | 应对措施 |
|-------|---------|---------|
| 角色配置错误导致功能不可用 | 高 | 配置校验机制，默认配置兜底 |
| 权限控制漏洞导致数据泄露 | 高 | 多层权限验证，安全审计 |
| 组件渲染性能问题 | 中 | 降级策略，性能监控 |
| 移动端Markdown显示异常 | 中 | 兼容性测试，样式兜底 |
| 配置缓存不一致 | 中 | 缓存失效机制，定期刷新 |
| 快捷操作提示词设计不合理 | 低 | 用户反馈迭代，持续优化 |

## 成功指标

| 指标 | 目标值 | 测量方法 |
|-----|--------|---------|
| 快捷操作使用率 | > 40% | 统计快捷操作触发次数占AI请求总数的比例 |
| 各角色AI功能使用率 | 园长 > 60%, 老师 > 70%, 家长 > 50% | 统计各角色使用AI功能的活跃用户比例 |
| 权限验证准确率 | 100% | 测试所有权限场景，确保无漏洞 |
| 渲染模式正确率 | > 95% | 统计组件渲染决策的准确性 |
| 用户满意度 | > 4.0/5.0 | 用户反馈调查问卷 |
| 系统响应时间 | P95 < 2s | 监控AI请求端到端响应时间 |
