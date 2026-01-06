# 🎨 互动多媒体课程 - UI设计方案（完全兼容系统架构）

## 📋 设计原则

✅ **完全兼容现有系统**：
- 使用全局CSS变量（`--primary-color`, `--bg-primary`, `--text-primary`等）
- 支持主题切换（暗黑/明亮/自定义主题）
- 集成Element Plus组件库
- 使用AIBridge统一AI服务

---

## 🎨 色彩系统（使用全局变量）

### 暗黑主题（默认）
```scss
// 使用全局变量，自动适配主题
$primary: var(--primary-color);           // #7c3aed
$primary-hover: var(--primary-hover);     // #5b21b6
$accent: var(--accent-color);             // #f59e0b
$bg-primary: var(--bg-primary);           // #0c0a1a
$bg-secondary: var(--bg-secondary);       // #1a1625
$text-primary: var(--text-primary);       // #f1f5f9
$text-secondary: var(--text-secondary);   // #d1d5db
$border: var(--border-color);             // rgba(255,255,255,0.08)
```

### 明亮主题
```scss
// 自动切换到明亮主题变量
$primary: var(--primary-color);           // #007bff
$bg-primary: var(--bg-primary);           // linear-gradient(...)
$text-primary: var(--text-primary);       // #333333
```

---

## 🏗️ 组件结构（使用Element Plus）

### 1. 主容器组件

```vue
<template>
  <div class="interactive-curriculum-container">
    <!-- 使用全局样式类 -->
    <div class="enhanced-page-container">
      <!-- 顶部导航 -->
      <div class="enhanced-page-header">
        <h1>🎓 创意课程生成器</h1>
        <el-progress 
          v-if="generating" 
          :percentage="progress"
          :color="progressColor"
        />
      </div>

      <!-- 主内容区域 -->
      <div class="curriculum-content">
        <!-- 输入面板 -->
        <InputPanel 
          v-if="!generating && !curriculum"
          @generate="handleGenerate"
        />

        <!-- 进度面板 -->
        <ProgressPanel 
          v-if="generating"
          :tasks="tasks"
          :overall-progress="progress"
        />

        <!-- 预览面板 -->
        <PreviewPanel 
          v-if="curriculum && !generating"
          :curriculum="curriculum"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.interactive-curriculum-container {
  // 继承全局样式
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  padding: var(--spacing-lg);
}

.curriculum-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  
  @media (min-width: 1920px) {
    grid-template-columns: 35% 65%;
  }
}
</style>
```

### 2. 输入面板（使用Element Plus表单）

```vue
<template>
  <el-card class="input-panel">
    <template #header>
      <div class="card-header">
        <span>📝 描述你想要的课程</span>
      </div>
    </template>

    <el-form :model="form" label-width="auto">
      <el-form-item label="课程描述">
        <el-input
          v-model="form.prompt"
          type="textarea"
          :rows="6"
          placeholder="例如: 生成一个关于古诗《春晓》的课程..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button 
          type="primary" 
          size="large"
          @click="handleGenerate"
          :loading="loading"
        >
          🚀 生成课程
        </el-button>
        <el-button @click="handleClear">🔄 清空</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped lang="scss">
.input-panel {
  // 使用全局变量
  background-color: var(--bg-card);
  border-color: var(--border-color);
  border-radius: var(--radius-lg);
  
  :deep(.el-card__header) {
    border-bottom-color: var(--border-color);
  }
}

.card-header {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
```

### 3. 进度面板（使用Element Plus进度条）

```vue
<template>
  <el-card class="progress-panel">
    <template #header>
      <span>⏳ 生成进度</span>
    </template>

    <!-- 总进度 -->
    <el-progress 
      :percentage="overallProgress"
      :color="progressColor"
      :stroke-width="8"
    />
    <p class="progress-text">{{ overallProgress }}% - 预计完成: {{ estimatedTime }}</p>

    <!-- 任务列表 -->
    <div class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-header">
          <span class="task-icon">{{ task.icon }}</span>
          <span class="task-name">{{ task.name }}</span>
          <el-tag 
            :type="task.status === '✅ 完成' ? 'success' : 'info'"
            size="small"
          >
            {{ task.status }}
          </el-tag>
        </div>
        <el-progress 
          :percentage="task.progress"
          :status="task.status === '✅ 完成' ? 'success' : 'normal'"
        />
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.progress-panel {
  background-color: var(--bg-card);
  border-color: var(--border-color);
  
  .task-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }

  .task-item {
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
  }

  .task-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
  }

  .task-icon {
    font-size: 20px;
  }

  .task-name {
    flex: 1;
    color: var(--text-primary);
    font-weight: 500;
  }
}
</style>
```

### 4. 预览面板（左右布局）

```vue
<template>
  <div class="preview-panel">
    <div class="preview-left">
      <ImageCarousel :images="curriculum.media.images" />
    </div>
    <div class="preview-right">
      <VideoPlayer :video="curriculum.media.video" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-panel {
  display: grid;
  grid-template-columns: 35% 65%;
  gap: var(--spacing-lg);
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.preview-left,
.preview-right {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}
</style>
```

---

## 🔌 AIBridge集成

### 后端服务调用

```typescript
// server/src/services/curriculum/interactive-curriculum.service.ts

import { aiBridgeService } from '../ai/bridge/ai-bridge.service';

export class InteractiveCurriculumService {
  
  // 1. 需求分析
  async analyzeRequirements(prompt: string) {
    return await aiBridgeService.generateChatCompletion({
      model: 'doubao-seed-1-6-thinking-250615',
      messages: [
        { role: 'system', content: '你是课程设计专家...' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });
  }

  // 2. 生成图片
  async generateImages(prompts: string[]) {
    return Promise.all(
      prompts.map(prompt =>
        aiBridgeService.generateImage({
          model: 'doubao-seedream-3-0-t2i-250415',
          prompt,
          size: '1024x1024',
          quality: 'standard'
        })
      )
    );
  }

  // 3. 生成视频
  async generateVideo(script: string) {
    // 使用媒体中心的视频生成接口
    return await videoCreationService.generateVideo({
      script,
      style: 'animation',
      duration: 30
    });
  }
}
```

### 前端API调用

```typescript
// client/src/api/modules/interactive-curriculum.ts

import { post } from '@/utils/request';

export const interactiveCurriculumApi = {
  // 生成课程
  async generateCurriculum(prompt: string) {
    return post('/interactive-curriculum/generate', { prompt });
  },

  // 获取生成进度
  async getProgress(taskId: string) {
    return post(`/interactive-curriculum/progress/${taskId}`);
  },

  // 保存课程
  async saveCurriculum(data: any) {
    return post('/interactive-curriculum/save', data);
  }
};
```

---

## 📱 响应式设计

```scss
// 使用全局间距变量
:root {
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
}

// 桌面版
@media (min-width: 1920px) {
  .preview-panel {
    grid-template-columns: 35% 65%;
  }
}

// 平板版
@media (min-width: 1024px) and (max-width: 1920px) {
  .preview-panel {
    grid-template-columns: 40% 60%;
  }
}

// 手机版
@media (max-width: 1024px) {
  .preview-panel {
    grid-template-columns: 1fr;
  }
}
```

---

## ✨ 主题适配

```typescript
// 自动适配主题
export const getProgressColor = (percentage: number) => {
  const isDark = document.documentElement.classList.contains('dark-theme');
  
  if (percentage < 50) {
    return isDark ? '#fbbf24' : '#f97316';  // 警告色
  }
  if (percentage < 80) {
    return isDark ? '#fb923c' : '#f59e0b';  // 强调色
  }
  return isDark ? '#34d399' : '#10b981';    // 成功色
};
```

---

## 🎯 总结

✅ **完全兼容现有系统**：
- 使用全局CSS变量自动适配主题
- 集成Element Plus组件库
- 支持暗黑/明亮主题切换
- 使用AIBridge统一AI服务
- 响应式设计支持所有屏幕尺寸

✅ **开发效率高**：
- 复用现有样式系统
- 无需重复定义颜色和间距
- 主题切换自动生效
- 代码简洁易维护

**准备好开始实现了吗？** 🚀

