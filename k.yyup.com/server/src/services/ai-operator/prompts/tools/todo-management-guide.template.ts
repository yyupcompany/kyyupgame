/**
 * 任务管理工具使用指南模板
 * 指导AI如何使用任务复杂度分析和TodoList管理工具
 */

export const todoManagementGuideTemplate = {
  name: 'todo_management_guide',
  description: '任务管理工具指南 - 定义复杂任务分析和TodoList使用规则',
  variables: [],
  
  template: `## 📋 任务管理工具使用指南

### 🎯 核心工具

#### 1. analyze_task_complexity（任务复杂度分析）
**触发条件**：当用户请求包含以下特征时，必须先调用此工具：
- 包含多个操作动词（创建、发送、通知、安排、组织等）
- 包含时间序列词汇（首先、然后、接着、最后、之后）
- 包含复杂任务关键词（策划、方案、计划、流程、工作流）
- 描述长度超过50个字符
- 涉及多个业务对象（学生、老师、家长、班级、活动等）

**调用方式**：
\`\`\`json
{
  "name": "analyze_task_complexity",
  "arguments": {
    "userInput": "用户的完整请求内容",
    "context": "可选的上下文信息"
  }
}
\`\`\`

**返回结果解读**：
- \`needsTodoList: true\` → 必须创建TodoList进行任务分解
- \`needsTodoList: false\` → 可直接执行，无需分解
- \`complexityLevel\`: simple/moderate/complex/very_complex
- \`estimatedSteps\`: 预计所需步骤数

#### 2. create_todo_list（创建任务清单）
**触发条件**：当 \`analyze_task_complexity\` 返回 \`needsTodoList: true\` 时自动调用

**调用方式**：
\`\`\`json
{
  "name": "create_todo_list",
  "arguments": {
    "title": "任务清单标题",
    "description": "任务清单描述",
    "tasks": [
      {
        "title": "步骤1: 具体任务",
        "description": "任务详细说明",
        "priority": "high",
        "estimatedTime": "5分钟"
      }
    ],
    "category": "活动策划/招生管理/日常工作"
  }
}
\`\`\`

#### 3. update_todo_task（更新任务状态）
**使用场景**：执行完某个步骤后，更新对应任务的状态

\`\`\`json
{
  "name": "update_todo_task",
  "arguments": {
    "todoId": "任务ID",
    "status": "completed/in_progress/pending/cancelled",
    "progress": 80,
    "result": "执行结果描述"
  }
}
\`\`\`

#### 4. get_todo_list（获取任务清单）
**使用场景**：查看当前任务进度或恢复中断的任务

---

### 🔄 复杂任务处理流程

**步骤1：复杂度分析**
\`\`\`
用户请求 → analyze_task_complexity → 判断是否需要TodoList
\`\`\`

**步骤2：任务分解（如果需要）**
\`\`\`
needsTodoList=true → create_todo_list → 创建可执行的任务清单
\`\`\`

**步骤3：逐步执行**
\`\`\`
获取第一个pending任务 → 执行任务 → update_todo_task → 获取下一个任务
\`\`\`

**步骤4：完成报告**
\`\`\`
所有任务完成 → 生成执行总结 → 通知用户
\`\`\`

---

### 📊 复杂度等级与处理策略

| 等级 | 分数 | 处理策略 | 示例 |
|------|------|----------|------|
| simple | <2 | 直接执行 | "查询学生列表" |
| moderate | 2-4 | 引导执行 | "创建一个活动" |
| complex | 4-6 | 创建TodoList | "策划一个运动会并通知家长" |
| very_complex | ≥6 | 工作流+TodoList | "策划活动、生成海报、配置营销、发送通知" |

---

### ⚠️ 重要规则

1. **优先分析**：遇到复杂请求时，必须先调用 \`analyze_task_complexity\`
2. **自动触发**：当分析结果为 \`needsTodoList=true\`，自动调用 \`create_todo_list\`
3. **状态同步**：每完成一个步骤，必须调用 \`update_todo_task\` 更新状态
4. **异常处理**：某步骤失败时，标记为failed并尝试执行下一步或回滚
5. **进度反馈**：执行过程中向用户实时反馈进度

---

### 🎯 典型场景示例

**场景1：简单查询（不需要TodoList）**
- 用户："查看今天有多少学生"
- 处理：直接调用查询工具，无需分析

**场景2：中等复杂度（可选TodoList）**
- 用户："创建一个春游活动"
- 处理：分析复杂度 → 如果simple/moderate，直接执行

**场景3：高复杂度（必须TodoList）**
- 用户："帮我策划一个亲子运动会，需要发通知、安排场地、准备物资"
- 处理：
  1. \`analyze_task_complexity\` → needsTodoList=true
  2. \`create_todo_list\` → 创建包含5个子任务的清单
  3. 逐步执行并更新状态

**场景4：超高复杂度（工作流模式）**
- 用户："策划活动、生成海报、配置营销策略、发送全园通知"
- 处理：
  1. 检测到活动+海报关键词 → 调用 \`execute_activity_workflow\`
  2. 或创建详细TodoList手动执行

---

### 🔗 与其他工具的配合

- **与 execute_activity_workflow 的关系**：活动相关的复杂任务优先使用活动工作流
- **与 any_query 的配合**：TodoList中的数据查询任务使用 any_query 执行
- **与 render_component 的配合**：展示任务进度时可渲染进度组件
`
};

export default todoManagementGuideTemplate;

