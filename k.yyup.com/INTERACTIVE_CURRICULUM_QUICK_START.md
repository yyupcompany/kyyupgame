# 互动多媒体课程生成系统 - 快速启动指南

## 🚀 5分钟快速启动

### 第一步：启动系统

```bash
# 在项目根目录运行
npm run start:all
```

这会同时启动：
- ✅ 前端开发服务器 (http://localhost:5173:5173)
- ✅ 后端 API 服务器 (http://localhost:3000)

### 第二步：运行数据库迁移

```bash
# 在新的终端窗口运行
cd server
npm run db:migrate
```

这会添加新的数据库字段：
- `media` - 存储图片和视频
- `metadata` - 存储生成元数据
- `courseAnalysis` - 存储课程分析
- `curriculumType` - 课程类型

### 第三步：访问应用

打开浏览器访问：
```
http://localhost:5173/teacher-center/creative-curriculum/interactive
```

## 📝 使用流程

### 1️⃣ 输入课程需求

在左侧输入框中描述你想要的课程：

```
示例：生成一个认识小猫咪的互动课程，适合4-5岁幼儿，
包含卡通风格的图片和动画视频，教学目标是让孩子了解
猫咪的特征和生活习性。
```

### 2️⃣ 选择课程领域和年龄段

- **课程领域**：健康、语言、社会、科学、艺术
- **年龄段**：如 4-5岁、5-6岁 等

### 3️⃣ 点击"开始生成"

系统会：
1. 分析你的需求（第一阶段）
2. 并行生成代码、图片、视频（第二阶段）
3. 显示实时进度

### 4️⃣ 查看预览

生成完成后，可以在右侧查看：
- 💻 **代码预览** - HTML/CSS/JS 代码
- 🖼️ **课程图片** - 多张配图轮播
- 🎬 **课程视频** - 动画视频播放
- 📋 **课程信息** - 课程元数据

### 5️⃣ 编辑和保存

- **编辑课程** - 跳转到编辑器修改代码
- **保存课程** - 保存到数据库

## 🧪 测试 API

### 方法1：使用测试脚本

```bash
node test-interactive-curriculum.cjs
```

### 方法2：使用 curl

```bash
# 生成课程
curl -X POST http://localhost:3000/api/interactive-curriculum/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "生成一个认识小猫咪的互动课程",
    "domain": "science",
    "ageGroup": "4-5岁"
  }'

# 查询进度
curl http://localhost:3000/api/interactive-curriculum/progress/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 方法3：使用 Postman

1. 导入 API 集合
2. 设置 Authorization token
3. 调用端点

## 📊 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    前端应用                              │
│  interactive-curriculum.vue                             │
│  ├─ ProgressPanel.vue (进度显示)                        │
│  ├─ ImageCarousel.vue (图片轮播)                        │
│  ├─ VideoPlayer.vue (视频播放)                          │
│  └─ CurriculumPreview.vue (代码预览)                    │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP API
┌────────────────▼────────────────────────────────────────┐
│                  后端 API 服务                           │
│  /api/interactive-curriculum                            │
│  ├─ POST /generate (生成课程)                           │
│  ├─ GET /progress/:taskId (查询进度)                    │
│  ├─ GET /:id (获取详情)                                 │
│  └─ POST /:id/save (保存课程)                           │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│              InteractiveCurriculumService                │
│  ├─ 第一阶段：深度分析 + 提示词规划                     │
│  └─ 第二阶段：并行生成 (代码、图片、视频)              │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                  AIBridge 服务                           │
│  ├─ generateChatCompletion() (Think 1.6)               │
│  ├─ generateImage() (文生图)                            │
│  └─ generateVideo() (视频生成)                          │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│              外部 AI 模型 API                            │
│  ├─ 豆包 Think 1.6 (文本生成)                           │
│  ├─ 豆包 SeedDream (图片生成)                           │
│  └─ 豆包 SeedDance (视频生成)                           │
└─────────────────────────────────────────────────────────┘
```

## ⚙️ 配置说明

### 环境变量

在 `.env` 文件中配置：

```env
# AI 模型配置
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# Redis 配置（用于进度跟踪）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kindergarten_system
DB_USER=root
DB_PASSWORD=password
```

### 数据库配置

在 `server/src/config/database.ts` 中配置数据库连接。

## 🐛 常见问题

### Q1: 生成超时怎么办？

A: 生成可能需要 2-5 分钟，请耐心等待。如果超过 10 分钟仍未完成，请检查：
- 后端日志是否有错误
- AI API 是否可用
- 网络连接是否正常

### Q2: 图片或视频生成失败？

A: 检查：
- AI 模型配置是否正确
- API Key 是否有效
- 配额是否充足

### Q3: 如何修改生成的课程？

A: 点击"编辑课程"按钮，会跳转到创意课程编辑器，可以修改代码、图片等。

### Q4: 如何下载生成的课程？

A: 在视频播放器中点击"下载"按钮可以下载视频。代码可以复制后保存。

## 📚 相关文档

- [完整开发文档](./INTERACTIVE_CURRICULUM_DEVELOPMENT.md)
- [设计文档](./INTERACTIVE_CURRICULUM_DESIGN.md)
- [实现方案](./INTERACTIVE_CURRICULUM_IMPLEMENTATION.md)
- [API 文档](http://localhost:3000/api-docs)

## 🎯 下一步

1. ✅ 启动系统
2. ✅ 运行迁移
3. ✅ 访问应用
4. ✅ 生成第一个课程
5. 📝 根据需要调整和优化

## 💡 提示

- 第一次生成可能较慢，因为需要初始化 AI 模型
- 生成过程中请勿关闭页面
- 可以同时生成多个课程（异步处理）
- 生成的课程会自动保存到数据库

## 🆘 获取帮助

如有问题，请：
1. 查看后端日志：`npm run logs:backend`
2. 查看前端控制台：浏览器 F12
3. 检查 API 文档：http://localhost:3000/api-docs
4. 查看完整开发文档

---

**祝你使用愉快！** 🎉

