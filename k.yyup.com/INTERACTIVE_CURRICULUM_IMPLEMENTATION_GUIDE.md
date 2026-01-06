# 🚀 互动多媒体课程 - 完整实现指南

## 📋 快速开始

### Phase 1：基础框架（第1周）

#### 1. 后端服务

**文件**：`server/src/services/curriculum/interactive-curriculum.service.ts`

```typescript
import { aiBridgeService } from '../ai/bridge/ai-bridge.service';
import { AIBridgeMessage } from '../ai/bridge/ai-bridge.types';

export class InteractiveCurriculumService {
  
  /**
   * 分析课程需求
   */
  async analyzeRequirements(prompt: string) {
    const systemPrompt = `你是一位专业的幼儿园课程设计师。
    根据教师的描述，生成一个结构化的课程规格说明。
    返回JSON格式，包含：title, domain, ageGroup, codeSpec, imageSpecs, videoSpec`;

    const response = await aiBridgeService.generateChatCompletion({
      model: 'doubao-seed-1-6-thinking-250615',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ] as AIBridgeMessage[],
      temperature: 0.7,
      max_tokens: 4000
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * 生成课程代码
   */
  async generateCode(spec: any) {
    const codePrompt = `生成一个完整的HTML/CSS/JavaScript课程代码...`;
    
    const response = await aiBridgeService.generateChatCompletion({
      model: 'doubao-seed-1-6-thinking-250615',
      messages: [
        { role: 'user', content: codePrompt }
      ] as AIBridgeMessage[],
      temperature: 0.7,
      max_tokens: 8000
    });

    return response.choices[0].message.content;
  }

  /**
   * 生成图片
   */
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

  /**
   * 并行生成所有资源
   */
  async generateAssets(spec: any) {
    const [code, images] = await Promise.all([
      this.generateCode(spec),
      this.generateImages(spec.imageSpecs)
    ]);

    return { code, images };
  }
}

export const interactiveCurriculumService = new InteractiveCurriculumService();
```

#### 2. 后端路由

**文件**：`server/src/routes/interactive-curriculum.routes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { interactiveCurriculumService } from '../services/curriculum/interactive-curriculum.service';

const router = Router();

// 生成课程
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    // 1. 分析需求
    const spec = await interactiveCurriculumService.analyzeRequirements(prompt);
    
    // 2. 并行生成资源
    const assets = await interactiveCurriculumService.generateAssets(spec);
    
    // 3. 返回结果
    res.json({
      success: true,
      data: {
        htmlCode: assets.code.html,
        cssCode: assets.code.css,
        jsCode: assets.code.js,
        media: {
          images: assets.images,
          video: null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

#### 3. 前端API模块

**文件**：`client/src/api/modules/interactive-curriculum.ts`

```typescript
import { post } from '@/utils/request';
import { ApiResponse } from '@/types/api';

export const interactiveCurriculumApi = {
  /**
   * 生成课程
   */
  async generateCurriculum(prompt: string): Promise<ApiResponse> {
    return post('/interactive-curriculum/generate', { prompt });
  },

  /**
   * 保存课程
   */
  async saveCurriculum(data: any): Promise<ApiResponse> {
    return post('/interactive-curriculum/save', data);
  }
};
```

#### 4. 前端主组件

**文件**：`client/src/pages/teacher-center/creative-curriculum/InteractiveCurriculumGenerator.vue`

```vue
<template>
  <div class="interactive-curriculum-generator">
    <!-- 输入面板 -->
    <InputPanel 
      v-if="!generating && !curriculum"
      @generate="handleGenerate"
    />

    <!-- 进度面板 -->
    <ProgressPanel 
      v-if="generating"
      :progress="progress"
      :tasks="tasks"
    />

    <!-- 预览面板 -->
    <PreviewPanel 
      v-if="curriculum && !generating"
      :curriculum="curriculum"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { interactiveCurriculumApi } from '@/api/modules/interactive-curriculum';
import InputPanel from './components/InputPanel.vue';
import ProgressPanel from './components/ProgressPanel.vue';
import PreviewPanel from './components/PreviewPanel.vue';

const generating = ref(false);
const progress = ref(0);
const curriculum = ref(null);
const tasks = ref([]);

const handleGenerate = async (prompt: string) => {
  generating.value = true;
  progress.value = 0;
  
  try {
    const response = await interactiveCurriculumApi.generateCurriculum(prompt);
    curriculum.value = response.data;
    progress.value = 100;
  } catch (error) {
    console.error('生成失败:', error);
  } finally {
    generating.value = false;
  }
};
</script>

<style scoped lang="scss">
.interactive-curriculum-generator {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--spacing-lg);
  min-height: 100vh;
}
</style>
```

---

## 📊 Phase 2：完整功能（第2周）

### 关键改进

1. **进度跟踪**：使用Redis存储任务进度
2. **错误处理**：完整的重试机制
3. **流式输出**：支持实时进度更新
4. **媒体管理**：CDN上传和管理

---

## 🔧 配置清单

- [ ] 创建后端服务文件
- [ ] 创建后端路由文件
- [ ] 创建前端API模块
- [ ] 创建前端主组件
- [ ] 创建前端子组件（InputPanel, ProgressPanel, PreviewPanel）
- [ ] 集成AIBridge服务
- [ ] 测试完整流程
- [ ] 优化性能

---

## 🎯 下一步

1. **确认实现方案**
2. **开始Phase 1开发**
3. **完成基础功能**
4. **进行集成测试**

**准备好了吗？** 🚀

