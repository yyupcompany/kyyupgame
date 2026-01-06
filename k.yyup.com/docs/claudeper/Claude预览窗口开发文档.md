# Claude Artifacts 预览窗口开发文档

## 📋 文档概述

本文档详细说明如何在幼儿园管理系统中实现类似Claude Artifacts的HTML/CSS/JavaScript预览功能。

**创建时间**: 2025-10-14  
**版本**: v1.0  
**状态**: 设计阶段

---

## 🎯 功能目标

### 核心功能
1. ✅ AI生成HTML/CSS/JavaScript代码
2. ✅ 实时预览生成的网页内容
3. ✅ 代码编辑和实时更新
4. ✅ 全屏沉浸式预览体验
5. ✅ 自动隐藏侧边栏，对话框左移

### 应用场景
- 🎨 幼儿园小课程（认识颜色、数字、形状等）
- 🎮 互动游戏（点击游戏、拖拽游戏等）
- 📚 教学内容（故事展示、知识卡片等）
- 🌐 简单网页（活动宣传页、通知页等）

---

## 🏗️ 技术架构

### Claude Artifacts 实现原理

#### 1. 核心技术栈
```
AI生成代码 → 专用预览窗口 → iframe渲染 → 实时预览
```

#### 2. 关键技术点

**前端渲染**：
- 使用`<iframe>`的`srcdoc`属性渲染HTML
- 使用`sandbox`属性限制权限，确保安全
- 支持代码编辑和实时预览切换

**安全机制**：
```html
<iframe 
  srcdoc="<!DOCTYPE html>..." 
  sandbox="allow-scripts allow-forms allow-modals"
  style="width: 100%; height: 100%; border: none;"
></iframe>
```

**Blob URL方式**（备选）：
```javascript
const blob = new Blob([htmlContent], { type: 'text/html' });
const url = URL.createObjectURL(blob);
iframe.src = url;
```

---

## 📁 项目架构集成

### 当前系统架构

```
client/src/components/ai-assistant/
├── AIAssistantRefactored.vue          # 主容器
├── layout/FullscreenLayout.vue        # 三栏布局
│   ├── ExpertSelector (左侧)          # 专家选择面板
│   ├── center-main (中间)             # 对话区域
│   └── RightSidebar (右侧)            # 工具面板
├── composables/
│   └── useAIAssistantState.ts         # 状态管理
└── preview/                            # 新增：预览组件目录
    └── HtmlPreview.vue                 # HTML预览组件

server/src/services/ai/tools/
├── ui-display/
│   ├── render-component.tool.ts       # 现有UI渲染工具
│   └── generate-html-preview.tool.ts  # 新增：HTML预览工具
└── types/tool.types.ts                 # 工具类型定义
```

---

## 🎨 UI/UX 设计

### 布局状态变化

#### 正常状态（三栏布局）
```
┌─────────────────────────────────────────────────────┐
│  Header (YY-AI助手)                                  │
├──────┬────────────────────────────────┬─────────────┤
│      │                                │             │
│ 专家 │        对话区域                │  工具面板   │
│ 面板 │                                │             │
│ 280px│         flex: 1                │   320px     │
└──────┴────────────────────────────────┴─────────────┘
```

#### HTML预览状态（全屏）
```
┌─────────────────────────────────────────────────────┐
│  HTML预览 - 认识颜色小课程  [代码][预览][复制][下载][关闭] │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│              HTML预览内容（iframe）                  │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 关键变化
- ✅ 左侧专家面板：`leftSidebarCollapsed = true` → 宽度变为0
- ✅ 右侧工具面板：`rightSidebarVisible = false` → transform右移
- ✅ 对话区域：自动占据全部空间（flex: 1）
- ✅ HTML预览：全屏覆盖（position: fixed; z-index: 2000）

---

## 🔧 实现方案

### 一、后端工具实现

#### 文件位置
```
server/src/services/ai/tools/ui-display/generate-html-preview.tool.ts
```

#### 工具定义
```typescript
const generateHtmlPreviewTool: ToolDefinition = {
  name: "generate_html_preview",
  description: "生成HTML/CSS/JavaScript代码并在预览窗口显示",
  category: "ui-display",
  weight: 9,
  parameters: {
    type: "object",
    properties: {
      content_type: {
        type: "string",
        enum: ["course", "game", "interactive", "webpage", "demo"]
      },
      title: { type: "string" },
      description: { type: "string" },
      theme: {
        type: "string",
        enum: ["colorful", "simple", "professional", "playful"]
      },
      target_age: { type: "string", default: "3-6岁" }
    },
    required: ["content_type", "title", "description"]
  }
}
```

#### 返回数据结构
```typescript
{
  name: "generate_html_preview",
  status: "success",
  result: {
    html_code: "<!DOCTYPE html>...",
    title: "认识颜色小课程",
    content_type: "course",
    preview_instruction: {
      type: 'html_preview',      // 前端识别标识
      code: "<!DOCTYPE html>...",
      title: "认识颜色小课程",
      fullscreen: true
    }
  }
}
```

---

### 二、前端组件实现

#### 1. HTML预览组件

**文件位置**：`client/src/components/ai-assistant/preview/HtmlPreview.vue`

**组件结构**：
```vue
<template>
  <div class="html-preview-container">
    <!-- 预览头部 -->
    <div class="preview-header">
      <div class="header-left">
        <h3>{{ title }}</h3>
      </div>
      <div class="header-actions">
        <el-button @click="activeTab = 'code'">代码</el-button>
        <el-button @click="activeTab = 'preview'">预览</el-button>
        <el-button @click="copyCode">复制</el-button>
        <el-button @click="downloadHtml">下载</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </div>

    <!-- 预览内容 -->
    <div class="preview-content">
      <!-- 代码编辑器 -->
      <div v-show="activeTab === 'code'">
        <textarea v-model="editableCode"></textarea>
      </div>

      <!-- 预览区域 -->
      <div v-show="activeTab === 'preview'">
        <iframe 
          :srcdoc="previewCode"
          sandbox="allow-scripts allow-forms allow-modals"
        ></iframe>
      </div>
    </div>
  </div>
</template>
```

**核心功能**：
- ✅ 代码/预览标签切换
- ✅ 代码实时编辑
- ✅ 防抖更新预览
- ✅ 复制代码到剪贴板
- ✅ 下载HTML文件
- ✅ 关闭预览

#### 2. 状态管理扩展

**文件位置**：`client/src/components/ai-assistant/composables/useAIAssistantState.ts`

**新增状态**：
```typescript
// HTML预览相关状态
const htmlPreviewVisible = ref(false)
const htmlPreviewData = ref<{
  code: string
  title: string
  contentType: string
} | null>(null)
```

#### 3. 主组件集成

**文件位置**：`client/src/components/ai-assistant/AIAssistantRefactored.vue`

**事件处理**：
```typescript
// 在tool_call_complete事件中添加
case 'tool_call_complete':
  const previewInstruction = resultData.preview_instruction
  
  if (previewInstruction?.type === 'html_preview') {
    // 显示HTML预览
    htmlPreviewData.value = {
      code: previewInstruction.code,
      title: previewInstruction.title,
      contentType: resultData.content_type
    }
    htmlPreviewVisible.value = true
    
    // 隐藏侧边栏
    rightSidebarVisible.value = false
    leftSidebarCollapsed.value = true
  }
  break
```

---

## 🔐 安全机制

### iframe Sandbox 属性

```html
<iframe 
  sandbox="
    allow-scripts          <!-- 允许JavaScript -->
    allow-forms            <!-- 允许表单 -->
    allow-modals           <!-- 允许弹窗 -->
    allow-popups           <!-- 允许弹出窗口 -->
  "
></iframe>
```

### 禁止的权限
- ❌ `allow-same-origin` - 禁止同源访问（防止访问父页面）
- ❌ `allow-top-navigation` - 禁止导航到顶层页面
- ❌ `allow-pointer-lock` - 禁止指针锁定

---

## 📊 数据流程

### 完整流程图

```
用户输入
  ↓
"生成一个幼儿园小课程，教小朋友认识颜色"
  ↓
AI分析需求
  ↓
调用工具: generate_html_preview
  ↓
后端AI生成HTML代码
  ↓
返回工具结果 + preview_instruction
  ↓
前端检测到 preview_instruction.type === 'html_preview'
  ↓
触发预览显示
  ├─ htmlPreviewVisible = true
  ├─ rightSidebarVisible = false
  └─ leftSidebarCollapsed = true
  ↓
显示全屏HTML预览
  ├─ 代码标签：可编辑代码
  └─ 预览标签：iframe渲染
```

---

## 🎯 用户交互示例

### 示例1：认识颜色课程

**用户输入**：
```
"帮我生成一个幼儿园小课程，教小朋友认识红、黄、蓝三原色"
```

**AI工具调用**：
```json
{
  "name": "generate_html_preview",
  "arguments": {
    "content_type": "course",
    "title": "认识颜色小课程",
    "description": "教3-6岁幼儿认识红、黄、蓝三原色，包含互动点击效果",
    "theme": "colorful",
    "target_age": "3-6岁"
  }
}
```

**生成的HTML示例**：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>认识颜色小课程</title>
  <style>
    body {
      font-family: Arial;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .color-box {
      width: 150px;
      height: 150px;
      margin: 20px;
      border-radius: 20px;
      cursor: pointer;
      transition: transform 0.3s;
    }
    .color-box:hover {
      transform: scale(1.1);
    }
  </style>
</head>
<body>
  <h1>🎨 认识颜色</h1>
  <div class="color-box" style="background: red;" onclick="alert('这是红色！')"></div>
  <div class="color-box" style="background: yellow;" onclick="alert('这是黄色！')"></div>
  <div class="color-box" style="background: blue;" onclick="alert('这是蓝色！')"></div>
</body>
</html>
```

---

## 📝 开发清单

### 需要创建的文件

- [ ] `server/src/services/ai/tools/ui-display/generate-html-preview.tool.ts`
- [ ] `client/src/components/ai-assistant/preview/HtmlPreview.vue`

### 需要修改的文件

- [ ] `client/src/components/ai-assistant/composables/useAIAssistantState.ts`
- [ ] `client/src/components/ai-assistant/AIAssistantRefactored.vue`
- [ ] `server/src/services/ai/tools/ui-display/index.ts`

### 测试用例

- [ ] 测试1：生成幼儿园小课程
- [ ] 测试2：生成互动游戏
- [ ] 测试3：代码编辑和实时预览
- [ ] 测试4：复制和下载功能
- [ ] 测试5：侧边栏自动隐藏
- [ ] 测试6：关闭预览恢复布局

---

## 🚀 实施步骤

### 第一阶段：后端工具开发
1. 创建`generate-html-preview.tool.ts`
2. 实现AI代码生成逻辑
3. 注册工具到工具系统
4. 测试工具调用

### 第二阶段：前端组件开发
1. 创建`HtmlPreview.vue`组件
2. 实现代码编辑器
3. 实现iframe预览
4. 添加操作按钮

### 第三阶段：状态管理集成
1. 扩展`useAIAssistantState.ts`
2. 添加HTML预览状态
3. 实现状态切换逻辑

### 第四阶段：主组件集成
1. 修改`AIAssistantRefactored.vue`
2. 添加预览组件
3. 实现事件处理
4. 测试完整流程

### 第五阶段：测试和优化
1. 功能测试
2. 性能优化
3. 安全性检查
4. 用户体验优化

---

## 💡 技术要点

### 1. Flex布局自动调整

**原理**：
```scss
.main-content-area {
  display: flex;
  
  .expert-selector {
    width: 280px;
    &.collapsed { width: 0; }
  }
  
  .center-main {
    flex: 1;  // 自动占据剩余空间
  }
  
  .right-sidebar {
    width: 320px;
    &:not(.visible) { transform: translateX(100%); }
  }
}
```

**效果**：
- 左侧折叠时，`center-main`自动向左扩展
- 右侧隐藏时，`center-main`自动向右扩展
- 无需手动计算位置

### 2. 防抖优化

```typescript
import { debounce } from 'lodash-es'

const debouncedUpdate = debounce(() => {
  previewCode.value = editableCode.value
}, 500)
```

### 3. 安全沙箱

```html
<iframe 
  :srcdoc="htmlCode"
  sandbox="allow-scripts allow-forms allow-modals"
></iframe>
```

---

## 📚 参考资料

### Claude Artifacts 官方文档
- [Claude Artifacts 介绍](https://www.anthropic.com/news/claude-3-5-sonnet)
- [Artifacts 使用指南](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)

### 技术文档
- [MDN - iframe](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe)
- [MDN - sandbox](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#attr-sandbox)
- [Blob URL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL)

---

## 🎉 预期效果

### 用户体验
- ✅ 一键生成互动内容
- ✅ 实时预览和编辑
- ✅ 全屏沉浸式体验
- ✅ 快捷操作（复制、下载）

### 技术优势
- ✅ 完全符合现有架构
- ✅ 模块化设计，易于维护
- ✅ 安全可靠的沙箱机制
- ✅ 流畅的动画和交互

---

**文档版本**: v1.0  
**最后更新**: 2025-10-14  
**维护者**: AI助手开发团队

