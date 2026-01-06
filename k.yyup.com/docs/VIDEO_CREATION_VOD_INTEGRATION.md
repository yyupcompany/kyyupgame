# 视频制作与VOD集成完整指南

## 📋 概述

本文档描述了媒体中心视频制作功能与火山引擎VOD（视频点播）服务的完整集成方案。

## 🎯 功能特性

### 7步Timeline视频制作流程

1. **💡 创意输入** - 用户输入视频主题、平台、类型等基本信息
2. **📝 脚本生成** - AI自动生成视频脚本，包含多个场景
3. **🎤 配音合成** - 使用TTS服务生成专业配音
4. **🎬 分镜生成** - 为每个场景生成视频片段
5. **✂️ 视频剪辑** - 使用VOD服务合并视频、添加配音、转码优化
6. **👁️ 预览调整** - 预览最终视频，支持重新生成
7. **🚀 导出发布** - 下载视频或发布到各大平台

## 🏗️ 架构设计

### 前端组件

```
MediaCenter.vue (媒体中心主页)
  └── VideoCreatorTimeline.vue (Timeline布局视频创作)
       ├── 步骤1: 创意输入表单
       ├── 步骤2: 脚本生成与预览
       ├── 步骤3: 配音生成与试听
       ├── 步骤4: 分镜视频生成
       ├── 步骤5: VOD剪辑合成
       ├── 步骤6: 预览与调整
       └── 步骤7: 导出与发布
```

### 后端服务

```
video-creation.controller.ts (视频制作控制器)
  ├── createProject() - 创建项目
  ├── generateScript() - 生成脚本
  ├── generateAudio() - 生成配音
  ├── generateVideoScenes() - 生成分镜
  └── mergeVideoScenes() - VOD剪辑合成

服务层:
  ├── video-script.service.ts - 脚本生成
  ├── video-audio.service.ts - 配音生成
  ├── video.service.ts - 视频生成
  └── vod.service.ts - VOD服务 (新增)
```

### VOD服务功能

**文件**: `server/src/services/volcengine/vod.service.ts`

**核心方法**:
- `uploadVideo(videoBuffer, filename)` - 上传视频到VOD
- `mergeVideos(videoUrls, outputFilename)` - 合并多个视频片段
- `addAudioToVideo(videoUrl, audioUrl, outputFilename)` - 添加音频轨道
- `transcodeVideo(videoUrl, format, quality)` - 视频转码
- `getTaskStatus(taskId)` - 查询处理状态

## 🗄️ 数据库配置

### AI模型配置表

已添加VOD服务配置：

```sql
INSERT INTO ai_model_config (
  name: 'volcengine-vod-service',
  display_name: '火山引擎视频点播服务 (VOD)',
  model_type: 'vod',
  provider: 'bytedance_doubao',
  endpoint_url: 'https://ark.cn-beijing.volces.com/api/v3/vod',
  api_key: '[与其他火山引擎服务共享]',
  status: 'active',
  is_default: 1
)
```

### VideoProject模型扩展

新增字段：
- `sceneVideos: TEXT` - 场景视频JSON字符串
- `finalVideoId: VARCHAR(200)` - VOD视频ID
- `finalVideoUrl: VARCHAR(500)` - 最终视频URL

## 🔌 API接口

### 视频制作流程API

#### 1. 创建项目
```http
POST /api/video-creation/projects
Content-Type: application/json

{
  "topic": "春季招生宣传",
  "platform": "douyin",
  "videoType": "enrollment",
  "duration": "short",
  "keyPoints": "突出师资力量和教学环境",
  "voiceStyle": "gentle_female"
}

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "status": "draft"
  }
}
```

#### 2. 生成脚本
```http
POST /api/video-creation/projects/:projectId/script

Response:
{
  "success": true,
  "data": {
    "script": {
      "title": "春季招生宣传",
      "scenes": [
        {
          "title": "开场",
          "visual": "幼儿园大门全景",
          "narration": "欢迎来到XX幼儿园",
          "duration": 5
        }
      ]
    }
  }
}
```

#### 3. 生成配音
```http
POST /api/video-creation/projects/:projectId/audio

{
  "script": { ... },
  "voiceStyle": "gentle_female"
}

Response:
{
  "success": true,
  "data": {
    "audioUrl": "https://..."
  }
}
```

#### 4. 生成分镜视频
```http
POST /api/video-creation/projects/:projectId/scenes

{
  "scenes": [
    {
      "title": "开场",
      "visual": "幼儿园大门全景",
      "duration": 5
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "sceneVideos": [
      {
        "sceneIndex": 0,
        "sceneTitle": "开场",
        "videoUrl": "https://...",
        "taskId": "task_123"
      }
    ]
  }
}
```

#### 5. VOD剪辑合成 (核心步骤)
```http
POST /api/video-creation/projects/:projectId/merge

{
  "sceneVideos": [
    {
      "sceneIndex": 0,
      "videoUrl": "https://scene1.mp4"
    },
    {
      "sceneIndex": 1,
      "videoUrl": "https://scene2.mp4"
    }
  ],
  "audioUrl": "https://audio.mp3"
}

Response:
{
  "success": true,
  "data": {
    "videoUrl": "https://final-video.mp4",
    "videoId": "vod_123456",
    "duration": 30
  }
}
```

## 🔄 完整工作流程

### 步骤5: VOD剪辑合成详细流程

```javascript
// 1. 合并视频片段
const mergedVideo = await vodService.mergeVideos(
  videoUrls,
  `${projectTitle}_merged.mp4`
);

// 2. 添加配音（如果有）
const finalVideo = await vodService.addAudioToVideo(
  mergedVideo.videoUrl,
  audioUrl,
  `${projectTitle}_final.mp4`
);

// 3. 转码优化
const optimizedVideo = await vodService.transcodeVideo(
  finalVideo.videoUrl,
  'mp4',
  'high'
);

// 4. 更新项目状态
await project.update({
  status: 'completed',
  finalVideoUrl: optimizedVideo.videoUrl,
  finalVideoId: optimizedVideo.videoId,
  duration: optimizedVideo.duration
});
```

## 🎨 前端Timeline组件

### 关键特性

1. **步骤状态管理**
   - 当前步骤高亮显示
   - 已完成步骤显示绿色勾选
   - 未开始步骤显示灰色

2. **进度反馈**
   - 每个步骤都有进度条
   - 实时显示处理状态文本
   - 支持长时间任务的进度更新

3. **预览功能**
   - 脚本预览（文本）
   - 配音试听（音频播放器）
   - 分镜预览（视频播放器）
   - 最终视频预览（全屏播放）

4. **用户交互**
   - 每步完成后需要用户确认
   - 支持重新生成
   - 支持跳过某些步骤

## 📦 依赖包

### 后端
```json
{
  "@volcengine/openapi": "^latest",
  "axios": "^1.x",
  "form-data": "^4.x"
}
```

### 前端
```json
{
  "element-plus": "^2.x",
  "vue": "^3.x"
}
```

## 🚀 部署与配置

### 1. 数据库配置

运行脚本插入VOD配置：
```bash
cd server
node scripts/insert-vod-config.js
```

### 2. 环境变量（可选）

如果需要独立配置VOD服务：
```env
# server/.env
VOLCENGINE_ACCESS_KEY_ID=your_access_key
VOLCENGINE_SECRET_ACCESS_KEY=your_secret_key
VOLCENGINE_REGION=cn-beijing
```

### 3. 启动服务

```bash
# 启动后端
cd server && npm run dev

# 启动前端
cd client && npm run dev
```

## 🧪 测试指南

### 手动测试流程

1. 访问 `http://localhost:5173`
2. 登录系统
3. 进入"新媒体中心"
4. 点击"视频创作"标签
5. 按照7步Timeline流程操作：
   - 输入视频主题和基本信息
   - 等待脚本生成并确认
   - 选择配音风格并生成
   - 等待分镜视频生成
   - 自动进行VOD剪辑合成
   - 预览最终视频
   - 下载或发布

### API测试

使用Postman或curl测试各个API端点：

```bash
# 1. 创建项目
curl -X POST http://localhost:3000/api/video-creation/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic":"测试视频","platform":"douyin","videoType":"enrollment"}'

# 2. 生成脚本
curl -X POST http://localhost:3000/api/video-creation/projects/123/script \
  -H "Authorization: Bearer YOUR_TOKEN"

# ... 其他步骤类似
```

## 📊 性能优化

### VOD服务优化

1. **并发处理**: 多个场景视频可以并发生成
2. **缓存机制**: 相同参数的视频可以复用
3. **异步处理**: 长时间任务使用异步队列
4. **进度反馈**: 实时更新处理进度

### 前端优化

1. **懒加载**: 视频组件按需加载
2. **预加载**: 提前加载下一步所需资源
3. **缓存**: 已生成的内容缓存到本地
4. **压缩**: 视频预览使用低质量版本

## 🐛 故障排除

### 常见问题

1. **VOD服务初始化失败**
   - 检查数据库中VOD配置是否存在
   - 验证API密钥是否正确
   - 确认网络连接正常

2. **视频合并失败**
   - 检查视频URL是否可访问
   - 验证视频格式是否支持
   - 查看服务器日志获取详细错误

3. **配音添加失败**
   - 确认音频URL有效
   - 检查音频格式（支持mp3, wav）
   - 验证音频时长与视频匹配

## 📝 后续优化计划

1. **功能增强**
   - 支持更多视频特效
   - 添加字幕功能
   - 支持多语言配音

2. **性能优化**
   - 实现视频处理队列
   - 添加CDN加速
   - 优化大文件上传

3. **用户体验**
   - 添加模板库
   - 支持批量生成
   - 提供更多自定义选项

## 🎉 总结

完整的视频制作与VOD集成功能已经实现，包括：

✅ 7步Timeline布局的视频创作界面
✅ 完整的后端API接口
✅ VOD服务集成（上传、合并、配音、转码）
✅ 数据库配置和模型扩展
✅ 前后端完整对接

用户现在可以通过简单的7步流程，从创意到成品，完成专业视频的制作！

