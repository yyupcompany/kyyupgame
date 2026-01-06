<!--
  📝 图文混排 Markdown Demo 页面
  
  展示 MarkdownRenderer 组件的各种功能
  包含图片、文字、代码、表格等混排效果
-->

<template>
  <div class="markdown-demo-page">
    <!-- 页面头部 -->
    <div class="demo-header">
      <h1>📝 图文混排 Markdown Demo</h1>
      <p>展示 MarkdownRenderer 组件的强大功能</p>
      
      <!-- 控制面板 -->
      <div class="control-panel">
        <el-switch
          v-model="isDark"
          active-text="深色模式"
          inactive-text="浅色模式"
          @change="toggleTheme"
        />
        <el-switch
          v-model="isMobile"
          active-text="移动端"
          inactive-text="桌面端"
          style="margin-left: var(--text-2xl);"
        />
        <el-button 
          type="primary" 
          @click="showSource = !showSource"
          style="margin-left: var(--text-2xl);"
        >
          {{ showSource ? '隐藏源码' : '查看源码' }}
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="demo-content" :class="{ 'dark-mode': isDark }">
      <!-- 源码显示 -->
      <el-collapse v-if="showSource" style="margin-bottom: var(--text-2xl);">
        <el-collapse-item title="📄 Markdown 源码" name="source">
          <pre class="source-code">{{ markdownContent }}</pre>
        </el-collapse-item>
      </el-collapse>

      <!-- 渲染结果 -->
      <div class="render-container">
        <div
          class="simple-markdown-renderer"
          v-html="renderedMarkdown"
        ></div>
      </div>
    </div>

    <!-- 示例切换 -->
    <div class="demo-examples">
      <h3>📚 示例模板</h3>
      <div class="example-buttons">
        <el-button 
          v-for="(example, key) in examples" 
          :key="key"
          :type="currentExample === key ? 'primary' : 'default'"
          @click="switchExample(key)"
        >
          {{ example.title }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { marked } from 'marked'

// 响应式数据
const isDark = ref(false)
const isMobile = ref(false)
const showSource = ref(false)
const currentExample = ref('comprehensive')

// 示例模板
const examples = reactive({
  comprehensive: {
    title: '🎨 综合展示',
    content: `# 🎯 幼儿园管理系统 - 图文混排展示

## 📖 系统简介

**幼儿园管理系统**是一个现代化的教育管理平台，集成了多种先进技术，为幼儿园提供全方位的管理解决方案。

![系统架构图](https://via.placeholder.com/600x300/4f46e5/ffffff?text=系统架构图)

### 🚀 核心功能

#### 1. 学生管理
- **学生档案管理**: 完整的学生信息记录
- **健康档案**: 疫苗接种、体检记录
- **成长记录**: 学习进度、行为表现

#### 2. 教师管理
- **教师档案**: 个人信息、资质证书
- **课程安排**: 智能排课系统
- **绩效考核**: 多维度评估体系

### 📊 数据统计

| 模块 | 功能数量 | 完成度 | 优先级 |
|------|----------|--------|--------|
| 学生管理 | 15 | 95% | ⭐⭐⭐ |
| 教师管理 | 12 | 90% | ⭐⭐⭐ |
| 财务管理 | 8 | 85% | ⭐⭐ |
| 活动管理 | 10 | 80% | ⭐⭐ |

### 💻 技术栈

\`\`\`typescript
// 前端技术栈
const frontendStack = {
  framework: 'Vue 3',
  language: 'TypeScript',
  ui: 'Element Plus',
  state: 'Pinia',
  router: 'Vue Router 4'
}

// 后端技术栈
const backendStack = {
  runtime: 'Node.js',
  framework: 'Express',
  database: 'MySQL',
  orm: 'Sequelize',
  auth: 'JWT'
}
\`\`\`

### 🎨 界面预览

![登录界面](https://via.placeholder.com/400x250/10b981/ffffff?text=登录界面)
![仪表板](https://via.placeholder.com/400x250/3b82f6/ffffff?text=仪表板)

> 💡 **设计理念**: 我们采用现代化的扁平设计风格，注重用户体验和界面的直观性。每个功能模块都经过精心设计，确保操作简单、高效。

### 🔧 安装指南

1. **克隆项目**
   \`\`\`bash
   git clone https://github.com/your-repo/kindergarten-system.git
   cd kindergarten-system
   \`\`\`

2. **安装依赖**
   \`\`\`bash
   npm install
   \`\`\`

3. **启动服务**
   \`\`\`bash
   npm run dev
   \`\`\`

### 📈 性能指标

- **页面加载速度**: < 2秒
- **API响应时间**: < 100ms
- **并发用户数**: 1000+
- **数据处理能力**: 10万+记录

---

## 🎯 未来规划

### 短期目标 (3个月)
- [ ] 完善移动端适配
- [ ] 增加离线功能
- [ ] 优化性能表现

### 长期目标 (1年)
- [ ] AI智能分析
- [ ] 多语言支持
- [ ] 云端部署方案

**联系我们**: support@kindergarten-system.com`
  },
  
  technical: {
    title: '💻 技术文档',
    content: `# 🔧 技术架构文档

## 系统架构图

![架构图](https://via.placeholder.com/700x400/6366f1/ffffff?text=系统架构图)

## 🏗️ 前端架构

### 技术选型

\`\`\`json
{
  "framework": "Vue 3.5.14",
  "language": "TypeScript",
  "bundler": "Vite 4.5.14",
  "ui": "Element Plus",
  "state": "Pinia",
  "router": "Vue Router 4"
}
\`\`\`

### 项目结构

\`\`\`
client/
├── src/
│   ├── components/     # 公共组件
│   ├── pages/         # 页面组件
│   ├── stores/        # 状态管理
│   ├── utils/         # 工具函数
│   └── types/         # 类型定义
├── public/            # 静态资源
└── dist/             # 构建输出
\`\`\`

## 🚀 后端架构

### API 设计

\`\`\`typescript
// 用户认证接口
interface AuthAPI {
  login(credentials: LoginCredentials): Promise<AuthResponse>
  logout(): Promise<void>
  refresh(token: string): Promise<TokenResponse>
}

// 学生管理接口
interface StudentAPI {
  getStudents(params: QueryParams): Promise<Student[]>
  createStudent(data: CreateStudentData): Promise<Student>
  updateStudent(id: string, data: UpdateStudentData): Promise<Student>
  deleteStudent(id: string): Promise<void>
}
\`\`\`

### 数据库设计

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| users | 用户表 | id, username, email, role |
| students | 学生表 | id, name, age, class_id |
| teachers | 教师表 | id, name, subject, department |
| classes | 班级表 | id, name, grade, teacher_id |

## 🔐 安全机制

> ⚠️ **重要**: 系统采用多层安全防护机制

1. **身份认证**: JWT Token + 刷新机制
2. **权限控制**: RBAC 基于角色的访问控制
3. **数据加密**: 敏感数据 AES-256 加密
4. **SQL注入防护**: 参数化查询 + ORM保护

![安全架构](https://via.placeholder.com/600x350/ef4444/ffffff?text=安全架构图)`
  },

  tutorial: {
    title: '📚 使用教程',
    content: `# 📖 系统使用教程

## 🎯 快速开始

### 第一步：登录系统

![登录步骤](https://via.placeholder.com/500x300/8b5cf6/ffffff?text=登录步骤)

1. 打开浏览器，访问系统地址
2. 输入用户名和密码
3. 点击"登录"按钮

> 💡 **提示**: 首次登录请联系管理员获取账号

### 第二步：熟悉界面

系统主界面包含以下区域：

- **顶部导航栏**: 系统功能入口
- **侧边菜单**: 详细功能分类
- **主内容区**: 具体功能操作
- **状态栏**: 系统状态信息

## 👥 学生管理

### 添加学生

\`\`\`markdown
1. 点击"学生管理" → "添加学生"
2. 填写学生基本信息：
   - 姓名 *（必填）
   - 性别 *（必填）
   - 出生日期 *（必填）
   - 联系电话
   - 家庭地址
3. 上传学生照片（可选）
4. 点击"保存"完成添加
\`\`\`

![添加学生界面](https://via.placeholder.com/600x400/10b981/ffffff?text=添加学生界面)

### 学生信息管理

| 功能 | 操作路径 | 说明 |
|------|----------|------|
| 查看学生列表 | 学生管理 → 学生列表 | 显示所有学生信息 |
| 编辑学生信息 | 学生列表 → 编辑按钮 | 修改学生详细信息 |
| 删除学生 | 学生列表 → 删除按钮 | 移除学生记录 |
| 导出学生数据 | 学生列表 → 导出按钮 | 生成Excel文件 |

## 🏫 班级管理

### 创建班级

\`\`\`typescript
// 班级信息结构
interface ClassInfo {
  name: string        // 班级名称
  grade: string       // 年级
  capacity: number    // 容量
  teacherId: string   // 班主任ID
  description?: string // 班级描述
}
\`\`\`

### 班级操作流程

1. **创建班级**
   - 设置班级基本信息
   - 分配班主任
   - 设定班级容量

2. **学生分班**
   - 选择待分班学生
   - 指定目标班级
   - 确认分班操作

3. **班级管理**
   - 查看班级详情
   - 调整班级设置
   - 管理班级学生

> ⚠️ **注意**: 删除班级前请确保已妥善处理班级内的学生

## 📊 数据统计

系统提供丰富的数据统计功能：

![数据统计图表](https://via.placeholder.com/700x400/f59e0b/ffffff?text=数据统计图表)

### 统计维度

- **学生统计**: 按年龄、性别、班级分布
- **教师统计**: 按科目、工龄、绩效分析
- **财务统计**: 收入支出、费用分类统计
- **活动统计**: 参与度、满意度分析

## 🔧 系统设置

### 用户权限管理

\`\`\`yaml
权限级别:
  - 超级管理员: 所有权限
  - 园长: 管理权限（除系统设置）
  - 教师: 教学相关权限
  - 财务: 财务管理权限
  - 家长: 查看权限
\`\`\`

### 系统配置

- **基础设置**: 园所信息、学期设置
- **通知设置**: 消息推送、邮件配置
- **安全设置**: 密码策略、登录限制
- **备份设置**: 数据备份、恢复策略

---

## 🆘 常见问题

### Q: 忘记密码怎么办？
A: 点击登录页面的"忘记密码"链接，按提示重置密码。

### Q: 如何批量导入学生信息？
A: 使用"学生管理" → "批量导入"功能，下载模板后填写数据。

### Q: 系统支持哪些浏览器？
A: 推荐使用 Chrome、Firefox、Safari 等现代浏览器。`
  }
})

// 当前显示的 markdown 内容
const markdownContent = ref('')

// 初始化内容
markdownContent.value = String(examples.comprehensive.content || '')

// 切换示例
const switchExample = (key: string) => {
  currentExample.value = key
  markdownContent.value = String(examples[key].content || '')
}

// 简单的 markdown 渲染
const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return ''

  try {
    // 配置 marked
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false,
      mangle: false
    })

    return marked.parse(markdownContent.value)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return `<p style="color: var(--danger-color);">Markdown渲染失败: ${error.message}</p>`
  }
})

// 切换主题
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<style scoped>
.markdown-demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--text-2xl);
  background: var(--el-bg-color);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-8xl);
  padding: var(--spacing-8xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--shadow-light);
}

.demo-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  font-weight: 600;
}

.demo-header p {
  margin: 0 0 var(--text-2xl) 0;
  font-size: 1.2em;
  opacity: 0.9;
}

.control-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--text-2xl);
  flex-wrap: wrap;
}

.demo-content {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--spacing-8xl);
  box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--black-alpha-8);
  margin-bottom: var(--spacing-8xl);
  transition: all 0.3s ease;
}

.demo-content.dark-mode {
  background: #1a1a1a;
  color: #e5e5e5;
}

.source-code {
  background: var(--bg-gray-light);
  border: var(--border-width-base) solid #e9ecef;
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: var(--text-base);
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.render-container {
  border: 2px dashed #e9ecef;
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  background: var(--bg-tertiary);
  transition: all 0.3s ease;
}

.demo-content.dark-mode .render-container {
  background: #2a2a2a;
  border-color: #404040;
}

.demo-examples {
  text-align: center;
  padding: var(--text-2xl);
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--black-alpha-8);
}

.demo-examples h3 {
  margin: 0 0 var(--text-2xl) 0;
  color: var(--text-primary);
  font-size: 1.5em;
}

.example-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4xl);
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .markdown-demo-page {
    padding: var(--spacing-2xl);
  }
  
  .demo-header {
    padding: var(--text-2xl);
  }
  
  .demo-header h1 {
    font-size: 2em;
  }
  
  .control-panel {
    flex-direction: column;
    gap: var(--spacing-2xl);
  }
  
  .demo-content {
    padding: var(--text-2xl);
  }
  
  .example-buttons {
    flex-direction: column;
    align-items: center;
  }
}

/* 深色模式适配 */
.dark .markdown-demo-page {
  background: #0f0f0f;
}

.dark .demo-examples {
  background: #1a1a1a;
  color: #e5e5e5;
}

.dark .demo-examples h3 {
  color: #e5e5e5;
}

.dark .source-code {
  background: #2a2a2a;
  border-color: #404040;
  color: #e5e5e5;
}

/* Markdown 渲染样式 */
.simple-markdown-renderer {
  line-height: 1.6;
  color: var(--text-primary);
}

.simple-markdown-renderer h1,
.simple-markdown-renderer h2,
.simple-markdown-renderer h3,
.simple-markdown-renderer h4,
.simple-markdown-renderer h5,
.simple-markdown-renderer h6 {
  margin: 1.5em 0 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}

.simple-markdown-renderer h1 { font-size: 2.2em; color: #2563eb; }
.simple-markdown-renderer h2 { font-size: 1.8em; color: var(--primary-color); }
.simple-markdown-renderer h3 { font-size: 1.5em; color: var(--primary-color); }
.simple-markdown-renderer h4 { font-size: 1.3em; color: var(--ai-primary); }

.simple-markdown-renderer p {
  margin: 1em 0;
  text-align: justify;
}

.simple-markdown-renderer img {
  max-width: 100%;
  height: auto;
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  margin: 1em 0;
}

.simple-markdown-renderer code {
  background: var(--dark-bg-secondary);
  padding: var(--spacing-sm) 6px;
  border-radius: var(--spacing-xs);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  color: #e11d48;
}

.simple-markdown-renderer pre {
  background: var(--text-primary-dark);
  color: #e2e8f0;
  padding: 1.5em;
  border-radius: var(--spacing-sm);
  overflow-x: auto;
  margin: 1.5em 0;
}

.simple-markdown-renderer pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.simple-markdown-renderer table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  border-radius: var(--spacing-sm);
  overflow: hidden;
}

.simple-markdown-renderer th,
.simple-markdown-renderer td {
  padding: var(--text-sm) var(--text-lg);
  text-align: left;
  border-bottom: var(--border-width-base) solid #e2e8f0;
}

.simple-markdown-renderer th {
  background: var(--text-primary-light);
  font-weight: 600;
  color: var(--color-gray-700);
}

.simple-markdown-renderer tr:hover {
  background: #f9fafb;
}

.simple-markdown-renderer blockquote {
  border-left: var(--spacing-xs) solid var(--primary-color);
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background: var(--text-primary-light);
  border-radius: 0 var(--spacing-sm) var(--spacing-sm) 0;
  font-style: italic;
  color: var(--color-gray-600);
}

.simple-markdown-renderer ul,
.simple-markdown-renderer ol {
  margin: 1em 0;
  padding-left: 2em;
}

.simple-markdown-renderer li {
  margin: 0.5em 0;
}

.simple-markdown-renderer strong {
  font-weight: 600;
  color: var(--text-primary);
}

.simple-markdown-renderer em {
  font-style: italic;
  color: var(--text-secondary);
}

.simple-markdown-renderer a {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: var(--border-width-base) solid transparent;
  transition: all 0.2s ease;
}

.simple-markdown-renderer a:hover {
  border-bottom-color: var(--primary-color);
}

/* 深色模式适配 */
.demo-content.dark-mode .simple-markdown-renderer {
  color: #e5e5e5;
}

.demo-content.dark-mode .simple-markdown-renderer h1,
.demo-content.dark-mode .simple-markdown-renderer h2,
.demo-content.dark-mode .simple-markdown-renderer h3,
.demo-content.dark-mode .simple-markdown-renderer h4 {
  color: var(--status-info);
}

.demo-content.dark-mode .simple-markdown-renderer code {
  background: var(--color-gray-700);
  color: var(--warning-color);
}

.demo-content.dark-mode .simple-markdown-renderer th {
  background: var(--color-gray-700);
  color: #e5e5e5;
}

.demo-content.dark-mode .simple-markdown-renderer tr:hover {
  background: var(--color-gray-700);
}

.demo-content.dark-mode .simple-markdown-renderer blockquote {
  background: var(--color-gray-700);
  border-left-color: var(--status-info);
  color: var(--border-color);
}
</style>
