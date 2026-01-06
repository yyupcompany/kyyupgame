# 创意课程生成器

## 📚 功能概述

创意课程生成器是一个为幼儿园教师设计的强大工具，用于动态创建和管理互动式课程。该工具基于中国教育局要求的**五大领域课程**（健康、语言、社会、科学、艺术），帮助教师快速生成符合教学要求的课程。

## 🎯 核心功能

### 1. **课程模板库**
- 🏃 **健康领域** - 健康操表演、运动游戏等
- 🗣️ **语言领域** - 故事讲述、语言表达等
- 👥 **社会领域** - 角色扮演、社交互动等
- 🔬 **科学领域** - 科学实验、探索发现等
- 🎨 **艺术领域** - 绘画创意、音乐表演等

### 2. **代码编辑器**
- 支持 HTML、CSS、JavaScript 三种语言
- 实时代码高亮显示
- 代码格式化功能
- 行数和字符计数

### 3. **实时预览**
- Sandbox 沙箱模式预览
- 实时更新显示
- 错误提示和调试

### 4. **课程表构建器**
- 按周次安排课程
- 设置课程时间
- 指定教室和备注
- 灵活的课程管理

### 5. **课程保存**
- 保存课程信息
- 保存代码和配置
- 保存课程表安排

## 📁 文件结构

```
creative-curriculum/
├── index.vue                          # 主页面
├── README.md                          # 本文档
├── types/
│   └── curriculum.ts                  # 类型定义
├── utils/
│   └── curriculum-templates.ts        # 课程模板库
└── components/
    ├── CodeEditor.vue                 # 代码编辑器
    ├── CurriculumPreview.vue          # 预览组件
    ├── ScheduleBuilder.vue            # 课程表构建器
    └── TemplateSelector.vue           # 模板选择器
```

## 🚀 使用指南

### 快速开始

1. **访问创意课程生成器**
   - 在教师中心菜单中点击"创意课程生成器"

2. **选择模板**
   - 点击"新建课程"按钮
   - 从五大领域中选择合适的模板
   - 系统会自动加载模板代码

3. **编辑课程**
   - 修改课程名称和描述
   - 在代码编辑器中编辑 HTML、CSS、JavaScript
   - 实时预览效果

4. **构建课程表**
   - 点击"管理课程表"
   - 添加课程安排
   - 设置时间和教室

5. **保存课程**
   - 点击"保存课程"按钮
   - 课程将被保存到数据库

### 代码编辑技巧

#### HTML 编辑
```html
<div class="lesson-container">
  <h1>课程标题</h1>
  <p>课程内容</p>
  <button id="actionBtn">操作按钮</button>
</div>
```

#### CSS 编辑
```css
.lesson-container {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}
```

#### JavaScript 编辑
```javascript
document.getElementById('actionBtn').addEventListener('click', function() {
  alert('按钮被点击了！');
});
```

## 📊 课程模板详情

### 健康领域 - 健康操表演
- **目标**: 增强身体协调能力、培养节奏感
- **年龄段**: 3-4岁
- **时长**: 30分钟
- **特点**: 包含热身、主要运动、放松三个环节

### 语言领域 - 故事讲述互动
- **目标**: 提高语言表达能力、增强理解能力
- **年龄段**: 4-5岁
- **时长**: 30分钟
- **特点**: 支持多页故事、文字朗读功能

### 社会领域 - 角色扮演游戏
- **目标**: 培养社交能力、理解不同角色
- **年龄段**: 3-5岁
- **时长**: 45分钟
- **特点**: 包含医生、老师、厨师、店员等多个角色

### 科学领域 - 科学实验探索
- **目标**: 培养观察能力、理解科学原理
- **年龄段**: 4-5岁
- **时长**: 40分钟
- **特点**: 包含彩虹、磁铁、植物生长等实验

### 艺术领域 - 绘画创意工坊
- **目标**: 培养创意思维、提高艺术表达能力
- **年龄段**: 3-5岁
- **时长**: 35分钟
- **特点**: 支持自由绘画、颜色选择、笔刷大小调整

## 🔧 技术细节

### 使用的技术栈
- **前端框架**: Vue 3 + TypeScript
- **UI 组件库**: Element Plus
- **样式**: SCSS
- **代码编辑**: 原生 Textarea（可扩展为 Monaco Editor）
- **预览**: iframe Sandbox

### 沙箱安全性
- 使用 iframe sandbox 属性隔离代码执行
- 允许脚本执行但限制跨域访问
- 防止恶意代码对主应用的影响

## 📝 数据结构

### Curriculum 接口
```typescript
interface Curriculum {
  id?: string
  name: string                 // 课程名称
  description: string          // 课程描述
  domain: CurriculumDomain     // 所属领域
  semester: Semester            // 学期
  ageGroup: string             // 年龄段
  duration: number             // 课程时长（分钟）
  difficulty: DifficultyLevel  // 难度等级
  objectives: string[]         // 学习目标
  materials: string[]          // 所需材料
  htmlCode: string             // HTML 代码
  cssCode: string              // CSS 代码
  jsCode: string               // JavaScript 代码
  thumbnail?: string           // 缩略图
  createdAt?: Date
  updatedAt?: Date
  teacherId?: number
}
```

### ScheduleItem 接口
```typescript
interface ScheduleItem {
  id?: string
  curriculumId: string
  dayOfWeek: number            // 0-6 (周一-周日)
  startTime: string            // HH:mm 格式
  endTime: string              // HH:mm 格式
  classroom?: string           // 教室
  notes?: string               // 备注
}
```

## 🎓 教学建议

1. **循序渐进** - 从简单的模板开始，逐步学习编辑代码
2. **互动设计** - 在课程中添加按钮、输入框等交互元素
3. **视觉吸引** - 使用鲜艳的颜色和有趣的动画
4. **年龄适配** - 根据幼儿年龄段调整课程难度
5. **定期更新** - 定期更新和改进课程内容

## 🐛 常见问题

### Q: 如何添加音乐或视频？
A: 可以在 HTML 中使用 `<audio>` 或 `<video>` 标签，并在 JavaScript 中控制播放。

### Q: 预览不显示怎么办？
A: 检查代码是否有语法错误，点击"刷新预览"按钮重新加载。

### Q: 如何保存课程到本地？
A: 点击"保存课程"按钮，课程将被保存到服务器数据库。

### Q: 可以导入外部资源吗？
A: 由于沙箱限制，建议使用 Data URL 或 Base64 编码的资源。

## 📞 支持

如有问题或建议，请联系技术支持团队。

---

**版本**: 1.0.0  
**最后更新**: 2024年10月  
**作者**: 幼儿园管理系统开发团队

