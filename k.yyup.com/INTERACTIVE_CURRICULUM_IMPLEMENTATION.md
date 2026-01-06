# 🚀 互动多媒体课程 - 技术实现方案

## 📐 架构设计详解

### 1. 后端架构

#### 新增服务层

**文件**：`server/src/services/curriculum/interactive-curriculum.service.ts`

```typescript
// 核心服务类
class InteractiveCurriculumService {
  
  // 1. 需求分析
  async analyzeRequirements(prompt: string): Promise<CurriculumSpec> {
    // 调用 Think 1.6 模型
    // 返回结构化的课程规格
  }
  
  // 2. 任务分解
  async decomposeTasks(spec: CurriculumSpec): Promise<Task[]> {
    // 分解为三个并行任务
    // 返回任务列表
  }
  
  // 3. 并行生成资源
  async generateAssets(tasks: Task[]): Promise<Assets> {
    // 使用 Promise.all 并行执行
    // 返回所有生成的资源
  }
  
  // 4. 资源整合
  async integrateAssets(assets: Assets): Promise<InteractiveCurriculum> {
    // 整合代码、图片、视频
    // 返回完整的课程对象
  }
  
  // 5. 进度跟踪
  async trackProgress(taskId: string): Promise<Progress> {
    // 从 Redis 获取进度信息
    // 返回当前进度
  }
}
```

#### 新增路由

**文件**：`server/src/routes/interactive-curriculum.routes.ts`

```typescript
// POST /api/interactive-curriculum/generate
// 生成互动课程

// GET /api/interactive-curriculum/progress/:taskId
// 获取生成进度

// GET /api/interactive-curriculum/:id
// 获取课程详情

// POST /api/interactive-curriculum/:id/save
// 保存课程
```

#### 数据库模型扩展

**文件**：`server/src/models/interactive-curriculum.model.ts`

```typescript
interface InteractiveCurriculum {
  id: number;
  creatorId: number;
  kindergartenId: number;
  
  // 基本信息
  title: string;
  description: string;
  domain: string;
  ageGroup: string;
  
  // 代码部分
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  
  // 媒体资源
  media: {
    images: MediaImage[];
    video: MediaVideo;
  };
  
  // 元'EOF'
  metadata: {
    generatedAt: Date;
    models: {
      text: string;
      image: string;
      video: string;
    };
    status: 'generating' | 'completed' | 'failed';
    progress: number;
  };
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

interface MediaImage {
  id: string;
  url: string;
  description: string;
  order: number;
  generatedAt: Date;
}

interface MediaVideo {
  url: string;
  duration: number;
  script: string;
  generatedAt: Date;
}
```

### 2. 前端架构

#### 新增组件

*********：`client/src/pages/teacher-center/creative-curriculum/components/InteractiveCurriculumGenerator.vue`

```vue
<template>
  <div class="interactive-curriculum-generator">
    <!-- 输入区域 -->
    <div class="input-section">
      <el-input 
        v-model="prompt" 
        type="textarea"
        placeholder="描述你想要的课程..."
      />
      <el-button @click="generateCurriculum">生成课程</el-button>
    </div>
    
    <!-- 进度显示 -->
    <div v-if="generating" class="progress-section">
      <el-progress :percentage="progress" />
      <p>{{ progressText }}</p>
    </div>
    
    <!-- 预览区域 -->
    <div v-if="curriculum" class="preview-section">
      <div class="left-panel">
        <!-- 图片轮播 -->
        <ImageCarousel :images="curriculum.media.images" />
      </div>
      <div class="right-panel">
        <!-- 视频播放器 -->
        <VideoPlayer :video="curriculum.media.video" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 实现逻辑
</script>
```

#### 新增子组件

1. **ImageCarousel.vue** - 图片轮播组件
   - 支持上下滑动
   - 显示当前图片描述
   - 导航按钮

2. **VideoPlayer.vue** - 视频播放器
   - 自动播放
   - 播放控制
   - 进度条

3. **ProgressTracker.vue** - 进
   - 实时显示生成进度
   - 显示当前任务
   - 错误提示

### 3. 数据'EOF''EOF'

#### 请求流程

```
 → 后端分析 → 任务分解 → 并行生成 → 资源整合 → 返回结果 → 前端展示
```

#### 响应数据结构

```json
{
  "success": true,
  "data": {
    "id": "curriculum_123",
    "title": "古诗《春晓》互动课程",
    "htmlCode": "...",
    "cssCode": "...",
    "jsCode": "...",
    "media": {
      "images": [
        {
          "id": "img_1",
          "url": "https://...",
          "description": "古诗原文配图",
          "order": 1
        }
      ],
      "video": {
        "url": "https://...",
        "duration": 30,
        "script": "..."
      }
    },
    "metadata": {
      "generatedAt": "2025-10-23T...",
      "models": {
        "text": "doubao-seed-1-6-thinking-250615",
        "image": "doubao-seedream-3-0-t2i-250415",
        "video": "doubao-seedance-1-0-pro-250528"
      },
      "status": "completed",
      "progress": 100
    }
  }
}
```

---



### 1. AIBridge 集成

```typescript
// 文本生成
const textResponse = await aiBridgeService.generateChatCompletion({
  model: 'doubao-seed-1-6-thinking-250615',
  messages: [...],
  temperature: 0.7,
  max_tokens: 4000
});

// 图片生成
const imageResponse = await aiBridgeService.generateImage({
  model: 'doubao-seedream-3-0-t2i-250415',
  prompt: imagePrompt,
  size: '1024x1024',
  quality: 'standard'
});

// 视频生成
const videoResponse = await aiBridgeService.generateVideo({
  model: 'doubao-seedance-1-0-pro-250528',
  prompt: videoPrompt,
  duration: 30,
  size: '1280x720'
});
```

### 2. 媒体中心集成

```typescript
// 利用现有的视频生成接口
const videoResult = await videoCreationService.generateVideo({
  script: videoScript,
  style: 'animation',
  duration: 30
});
```

### 3. 创意课程集成

```typescript
// 扩展现有的课程模
const curriculum = await CreativeCurriculum.create({
  ...baseData,
  media: {
    images: generatedImages,
    video: generatedVideo
  }
});
```

---

## 🎯 关键实现要点

### 1. 并行处理

```typescript
// 使用 Promise.all 并行执行三个任务
const [codeResult, imagesResult, videoResult] = await Promise.all([
  generateCode(spec),
  generateImages(spec),
  generateVideo(spec)
]);
```

### 2. 进度跟踪

```typescript
// 使用 Redis 存储进度
await redis.set(`curriculum:${taskId}:progress`, {
  overall: 30,
  tasks: {
    code: 100,
    images: 50,
    video: 0
  }
});
```

### 3. 错误处理

```typescript
// 实现重试机制
async function generateWithRetry(task, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await task();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1));
    }
  }
}
```

### 4. 资源管理

```typescript
// 存储媒体文件到 CDN
const imageUrl = await uploadToCDN(imageBuffer, 'curriculum/images');
const videoUrl = await uploadToCDN(videoBuffer, 'curriculum/videos');
```

---

## 📊 性能优化

1. **并行处理**：三个任务同时执行，减少总耗时
2. **缓存**：缓存生成的提示词和模型配置
3. **流式处理**：大文件使用流式上传/下载
4. **CDN加速**：媒体文件使用 CDN 加速

---

## 🧪 测试策略

1. **单元测试**：测试各个服务方法

3. **端到端测试**：使用 Playwright 测试前端交互
4. **性能测试**：

---

## 📈 扩展方向

1. **模板库**：预定义的课程模板
2. **编辑功能**：允许编辑生成的课程
3. **分享功能**：分享课程给其他教师
4. **数据分**：分析课程使用情况

---

**准备好开始实现了吗？**
