# AI视频制作功能开发文档

## 📋 功能概述

为新媒体中心添加AI视频制作功能，实现从创意输入到视频成片的全自动化流程。用户只需提供创意思路，系统将自动完成脚本生成、配音合成、分镜制作、视频剪辑等全流程操作。

### 核心特点

- ✅ **智能脚本生成** - 使用豆包1.6-thinking模型生成专业30秒短视频脚本
- ✅ **AI配音合成** - 自动为每个场景生成自然流畅的配音
- ✅ **分镜视频生成** - 使用视频大模型生成多个分镜画面
- ✅ **智能视频剪辑** - 基于火山引擎VOD实现自动剪辑合成
- ✅ **实时预览调整** - 支持预览和微调视频效果
- ✅ **多平台导出** - 一键导出到抖音、快手、视频号等平台

### 技术栈

- **前端**: Vue 3 + TypeScript + Element Plus
- **AI模型**: 
  - 豆包1.6-thinking (脚本生成)
  - TTS模型 (语音合成)
  - 视频生成模型 (分镜制作)
- **视频处理**: 火山引擎视频点播 (VOD)
- **后端**: Express.js + Sequelize

---

## 🎯 Timeline流程设计

### 7步工作流程

```typescript
const videoCreationSteps = [
  {
    id: 1,
    title: '创意输入',
    description: '输入视频创意和基本信息',
    icon: '💡',
    estimatedTime: '1分钟',
    type: 'user-input'
  },
  {
    id: 2,
    title: '脚本生成',
    description: '使用豆包1.6-thinking生成30秒视频脚本',
    icon: '📝',
    estimatedTime: '30秒',
    type: 'ai-generation',
    aiModel: 'doubao-seed-1-6-thinking-250615'
  },
  {
    id: 3,
    title: '配音合成',
    description: '使用语音大模型生成专业配音',
    icon: '🎤',
    estimatedTime: '20秒',
    type: 'ai-generation',
    aiModel: 'tts-1-hd'
  },
  {
    id: 4,
    title: '分镜生成',
    description: '使用视频大模型生成分镜画面',
    icon: '🎬',
    estimatedTime: '2-3分钟',
    type: 'ai-generation',
    aiModel: 'video-generation-model'
  },
  {
    id: 5,
    title: '视频剪辑',
    description: '使用火山引擎VOD进行分镜剪辑合成',
    icon: '✂️',
    estimatedTime: '1-2分钟',
    type: 'video-processing',
    service: 'volcengine-vod'
  },
  {
    id: 6,
    title: '预览调整',
    description: '预览视频效果并进行微调',
    icon: '👁️',
    estimatedTime: '按需',
    type: 'user-review'
  },
  {
    id: 7,
    title: '导出发布',
    description: '导出视频或直接发布到平台',
    icon: '🚀',
    estimatedTime: '30秒',
    type: 'export'
  }
]
```

---

## 📁 文件结构

### 前端文件

```
client/src/pages/principal/media-center/
├── VideoCreatorTimeline.vue          # 主组件（Timeline版本）
├── VideoCreator.vue                  # 原有组件（保留兼容）
└── components/
    ├── VideoScriptEditor.vue         # 脚本编辑器
    ├── VideoScenePreview.vue         # 场景预览
    ├── VideoClipEditor.vue           # 视频剪辑编辑器
    └── VideoExportDialog.vue         # 导出对话框
```

### 后端文件

```
server/src/
├── controllers/
│   └── video-creation.controller.ts  # 视频制作控制器
├── services/
│   ├── ai/
│   │   ├── video-script.service.ts   # 脚本生成服务
│   │   ├── video-audio.service.ts    # 配音合成服务
│   │   └── video-generation.service.ts # 视频生成服务
│   └── volcengine/
│       └── vod.service.ts            # 火山引擎VOD服务
├── routes/
│   └── video-creation.routes.ts      # 视频制作路由
└── models/
    ├── VideoProject.ts               # 视频项目模型
    ├── VideoScene.ts                 # 视频场景模型
    └── VideoAsset.ts                 # 视频素材模型
```

---

## 🔧 核心功能实现

### 1. 创意输入（步骤1）

#### 前端表单设计

```typescript
interface VideoFormData {
  platform: string          // 发布平台：douyin, kuaishou, wechat_video
  videoType: string         // 视频类型：enrollment, activity, course
  topic: string             // 视频主题
  duration: number          // 视频时长（秒）：15, 30, 60
  style: string             // 风格：warm, professional, lively
  keyPoints: string         // 关键信息点
  targetAudience: string    // 目标受众：parents, teachers
  voiceStyle: string        // 配音风格：alloy, echo, fable
}
```

### 2. 脚本生成（步骤2）

使用豆包1.6-thinking模型生成结构化视频脚本：

```typescript
interface VideoScript {
  title: string
  description: string
  totalDuration: number
  scenes: VideoScene[]
  bgmSuggestion: string
  colorTone: string
  hashtags: string[]
}

interface VideoScene {
  sceneNumber: number
  duration: number
  visualDescription: string      // 用于AI生成视频
  narration: string              // 用于语音合成
  cameraAngle: string            // 镜头角度
  cameraMovement: string         // 镜头运动
  transition: string             // 转场效果
}
```

### 3. 配音合成（步骤3）

为每个场景的旁白生成语音：

```typescript
interface SceneAudio {
  sceneNumber: number
  audioPath: string
  audioUrl: string
  duration: number
  narration: string
}
```

### 4. 分镜生成（步骤4）

使用视频生成模型为每个场景生成视频片段：

```typescript
interface SceneVideo {
  sceneNumber: number
  videoPath: string
  videoUrl: string
  duration: number
  taskId: string
  thumbnailUrl: string
}
```

### 5. 视频剪辑（步骤5）

使用火山引擎VOD或FFmpeg进行视频剪辑合成：

- 合并所有分镜视频
- 叠加配音音轨
- 添加转场效果
- 添加背景音乐
- 输出最终视频

### 6. 预览调整（步骤6）

提供视频预览和编辑功能：

- 视频播放器
- 时间轴展示
- 场景裁剪
- 音频调整
- 字幕添加
- 滤镜特效

### 7. 导出发布（步骤7）

导出视频并支持多平台发布：

- 格式转换（MP4, MOV等）
- 质量选择（低/中/高/超高）
- 平台适配（抖音/快手/视频号等）
- 元数据配置（标题/描述/标签）

---

## 🗄️ 数据库模型

### VideoProject模型

```sql
CREATE TABLE video_projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  platform VARCHAR(50) NOT NULL,
  video_type VARCHAR(50) NOT NULL,
  duration INT NOT NULL DEFAULT 30,
  style VARCHAR(50) NOT NULL DEFAULT 'warm',
  status ENUM('draft', 'generating', 'completed', 'failed') DEFAULT 'draft',
  script_data JSON,
  audio_data JSON,
  video_data JSON,
  final_video_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔌 API接口

### 视频制作API

```
POST   /api/video-creation/projects              # 创建项目
POST   /api/video-creation/projects/:id/script   # 生成脚本
POST   /api/video-creation/projects/:id/audio    # 生成配音
POST   /api/video-creation/projects/:id/videos   # 生成分镜
POST   /api/video-creation/projects/:id/edit     # 剪辑合成
POST   /api/video-creation/projects/:id/export   # 导出视频
GET    /api/video-creation/projects/:id          # 获取项目详情
GET    /api/video-creation/projects              # 获取项目列表
```

---

## 🚀 开发计划

### Phase 1: 基础架构（第1-2天）
- [x] 创建开发文档
- [ ] 创建数据库模型和迁移
- [ ] 创建后端服务基础结构
- [ ] 创建前端组件基础结构

### Phase 2: 核心功能（第3-5天）
- [ ] 实现脚本生成服务
- [ ] 实现配音合成服务
- [ ] 实现视频生成服务（模拟）
- [ ] 实现视频剪辑服务（FFmpeg）

### Phase 3: 前端界面（第6-7天）
- [ ] 实现Timeline主界面
- [ ] 实现7步工作流程
- [ ] 实现实时进度显示
- [ ] 实现预览和编辑功能

### Phase 4: 集成优化（第8-9天）
- [ ] 集成火山引擎VOD
- [ ] 性能优化和错误处理
- [ ] 添加单元测试
- [ ] 完善文档

### Phase 5: 测试发布（第10天）
- [ ] 端到端测试
- [ ] 用户体验优化
- [ ] 部署上线

---

## 📝 环境变量配置

```env
# 火山引擎配置
VOLCENGINE_ACCESS_KEY_ID=your_access_key_id
VOLCENGINE_SECRET_ACCESS_KEY=your_secret_access_key
VOLCENGINE_REGION=cn-beijing

# AI模型配置
DOUBAO_THINKING_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_THINKING_API_KEY=your_api_key

# TTS配置
TTS_ENDPOINT_URL=https://api.openai.com/v1
TTS_API_KEY=your_tts_api_key

# 视频生成配置
VIDEO_GEN_ENDPOINT_URL=https://video-gen-api.example.com
VIDEO_GEN_API_KEY=your_video_gen_api_key

# 视频处理配置
USE_VOLCENGINE_VOD=false  # true使用火山引擎VOD，false使用本地FFmpeg
FFMPEG_PATH=/usr/bin/ffmpeg
```

---

## 🎯 成功指标

- ✅ 用户可以在5分钟内完成一个30秒视频的制作
- ✅ 脚本生成准确率 > 90%
- ✅ 配音自然度评分 > 4.0/5.0
- ✅ 视频生成成功率 > 85%
- ✅ 系统响应时间 < 5秒（除AI生成步骤）
- ✅ 用户满意度 > 4.5/5.0

---

## 📚 参考资料

- [豆包大模型文档](https://www.volcengine.com/docs/82379)
- [火山引擎视频点播文档](https://www.volcengine.com/docs/4/65777)
- [FFmpeg官方文档](https://ffmpeg.org/documentation.html)
- [Element Plus组件库](https://element-plus.org/)

---

**最后更新**: 2025-10-01
**开发状态**: 🚧 开发中
**负责人**: AI开发团队

