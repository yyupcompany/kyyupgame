# 🎨 互动多媒体课程 - 前端组件框架

## 📁 组件目录结构

```
client/src/pages/teacher-center/creative-curriculum/
├── index.vue                          # 主页面
├── components/
│   ├── InteractiveCurriculumGenerator.vue    # 生成器主组件
│   ├── InputPanel.vue                        # 输入面板
│   ├── ProgressPanel.vue                     # 进度面板
│   ├── PreviewPanel.vue                      # 预览面板
│   ├── ImageCarousel.vue                     # 图片轮播
│   ├── VideoPlayer.vue                       # 视频播放器
│   └── ControlBar.vue                        # 控制条
├── services/
│   ├── interactive-curriculum.service.ts     # API 服务
│   └── progress-tracker.service.ts           # 进度跟踪
└── types/
    └── interactive-curriculum.ts             # 类型定义
```

---

## 🎬 核心组件设计

### 1. InteractiveCurriculumGenerator.vue（主组件）

```vue
<template>
  <div class="interactive-curriculum-generator">
    <!-- 顶部导航 -->
    <div class="header">
      <h1>🎓 创意课程生成器</h1>
      <ProgressBar v-if="generating" :progress="progress" />
    </div>

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
      @save="handleSave"
      @edit="handleEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { InteractiveCurriculum, Task } from '../types'
import { generateCurriculum, trackProgress } from '../services'

const generating = ref(false)
const progress = ref(0)
const curriculum = ref<InteractiveCurriculum | null>(null)
const tasks = reactive<Task[]>([])

const handleGenerate = async (prompt: string) => {
  generating.value = true
  try {
    const result = await generateCurriculum(prompt)
    curriculum.value = result
  } finally {
    generating.value = false
  }
}

const handleSave = async () => {
  // 保存课程
}

const handleEdit = () => {
  // 编辑课程
}
</script>

<style scoped>
.interactive-curriculum-generator {
  padding: 20px;
  background: #f7f9fc;
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 15px;
}
</style>
```

### 2. InputPanel.vue（输入面板）

```vue
<template>
  <div class="input-panel">
    <div class="input-container">
      <h2>📝 描述你想要的课程</h2>
      
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="6"
        placeholder="例如: 生成一个关于古诗《春晓》的课程..."
        maxlength="500"
      />
      
      <div class="char-count">
        字数: {{ prompt.length }}/500
      </div>

      <div class="tips">
        <h3>🎯 推荐信息:</h3>
        <ul>
          <li>课程主题 (例如: 古诗、科学实验)</li>
          <li>目标年龄 (例如: 3-4岁、4-5岁)</li>
          <li>教学目标 (例如: 理解、学习、体验)</li>
          <li>互动方式 (例如: 动画、游戏、讲解)</li>
        </ul>
      </div>

      <div class="actions">
        <el-button 
          type="primary" 
          size="large"
          @click="handleGenerate"
          :loading="loading"
        >
          🚀 生成课程
        </el-button>
        <el-button @click="handleClear">🔄 清空</el-button>
        <el-button @click="handleTemplate">📋 使用模板</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  generate: [prompt: string]
}>()

const prompt = ref('')
const loading = ref(false)

const handleGenerate = () => {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入课程描述')
    return
  }
  emit('generate', prompt.value)
}

const handleClear = () => {
  prompt.value = ''
}

const handleTemplate = () => {
  // 显示模板选择
}
</script>

<style scoped>
.input-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.input-container h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.char-count {
  text-align: right;
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 8px;
}

.tips {
  background: #f0f9ff;
  border-left: 4px solid #4ecdc4;
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
}

.tips h3 {
  margin: 0 0 10px 0;
  color: #4ecdc4;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
}

.tips li {
  color: #7f8c8d;
  margin: 5px 0;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
```

### 3. ProgressPanel.vue（进度面板）

```vue
<template>
  <div class="progress-panel">
    <div class="overall-progress">
      <h2>生成进度</h2>
      <el-progress 
        :percentage="overallProgress"
        :color="progressColor"
      />
      <p class="progress-text">
        {{ overallProgress }}% - 预计完成: {{ estimatedTime }}
      </p>
    </div>

    <div class="task-list">
      <div 
        v-for="task in tasks" 
        :key="task.id"
        class="task-item"
      >
        <div class="task-header">
          <span class="task-icon">{{ task.icon }}</span>
          <span class="task-name">{{ task.name }}</span>
          <span class="task-status">{{ task.status }}</span>
        </div>
        <el-progress 
          :percentage="task.progress"
          :status="task.status === '✅ 完成' ? 'success' : 'normal'"
        />
      </div>
    </div>

    <div class="tips">
      💡 正在生成中，请勿关闭页面...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Task } from '../types'

interface Props {
  tasks: Task[]
  overallProgress: number
}

const props = defineProps<Props>()

const progressColor = computed(() => {
  if (props.overallProgress < 50) return '#FFE66D'
  if (props.overallProgress < 80) return '#FF9F43'
  return '#FF6B6B'
})

const estimatedTime = computed(() => {
  const remaining = 100 - props.overallProgress
  const minutes = Math.ceil(remaining / 20)
  return `${minutes}分钟后`
})
</script>

<style scoped>
.progress-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.overall-progress {
  margin-bottom: 30px;
}

.overall-progress h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #2c3e50;
}

.progress-text {
  text-align: center;
  color: #7f8c8d;
  margin-top: 10px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-item {
  padding: 15px;
  background: #f7f9fc;
  border-radius: 8px;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.task-icon {
  font-size: 20px;
}

.task-name {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.task-status {
  color: #7f8c8d;
  font-size: 12px;
}

.tips {
  text-align: center;
  color: #4ecdc4;
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
}
</style>
```

### 4. ImageCarousel.vue（图片轮播）

```vue
<template>
  <div class="image-carousel">
    <div class="carousel-container">
      <img 
        :src="currentImage.url" 
        :alt="currentImage.description"
        class="carousel-image"
      />
      <div class="image-counter">
        {{ currentIndex + 1 }}/{{ images.length }}
      </div>
    </div>

    <div class="carousel-controls">
      <el-button 
        circle 
        @click="prevImage"
        :disabled="currentIndex === 0"
      >
        ◀
      </el-button>
      
      <div class="dots">
        <span 
          v-for="(_, index) in images"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="currentIndex = index"
        />
      </div>
      
      <el-button 
        circle 
        @click="nextImage"
        :disabled="currentIndex === images.length - 1"
      >
        ▶
      </el-button>
    </div>

    <div class="image-description">
      <p>{{ currentImage.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MediaImage } from '../types'

interface Props {
  images: MediaImage[]
}

const props = defineProps<Props>()
const currentIndex = ref(0)

const currentImage = computed(() => props.images[currentIndex.value])

const prevImage = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) currentIndex.value++
}
</script>

<style scoped>
.image-carousel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.carousel-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-counter {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: #ff6b6b;
  width: 24px;
  border-radius: 4px;
}

.image-description {
  padding: 10px;
  background: #f7f9fc;
  border-radius: 8px;
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.6;
}
</style>
```

### 5. VideoPlayer.vue（视频播放器）

```vue
<template>
  <div class="video-player">
    <div class="player-container">
      <video
        ref="videoRef"
        :src="video.url"
        class="video-element"
        @timeupdate="updateProgress"
        @ended="handleEnded"
      />
      
      <div class="play-button" v-if="!playing" @click="togglePlay">
        ⏯
      </div>
    </div>

    <div class="player-controls">
      <el-button circle size="small" @click="togglePlay">
        {{ playing ? '⏸' : '⏯' }}
      </el-button>
      
      <el-button circle size="small" @click="skipBackward">⏮</el-button>
      <el-button circle size="small" @click="skipForward">⏭</el-button>
      
      <el-slider 
        v-model="currentTime"
        :max="duration"
        class="progress-slider"
        @input="seek"
      />
      
      <span class="time-display">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>
      
      <el-button circle size="small" @click="toggleMute">
        {{ muted ? '🔇' : '🔊' }}
      </el-button>
      
      <el-button circle size="small" @click="toggleFullscreen">
        ⛶
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MediaVideo } from '../types'

interface Props {
  video: MediaVideo
}

const props = defineProps<Props>()

const videoRef = ref<HTMLVideoElement>()
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const muted = ref(false)

const togglePlay = () => {
  if (videoRef.value) {
    if (playing.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
    playing.value = !playing.value
  }
}

const skipBackward = () => {
  if (videoRef.value) videoRef.value.currentTime -= 5
}

const skipForward = () => {
  if (videoRef.value) videoRef.value.currentTime += 5
}

const seek = () => {
  if (videoRef.value) videoRef.value.currentTime = currentTime.value
}

const updateProgress = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    duration.value = videoRef.value.duration
  }
}

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !muted.value
    muted.value = !muted.value
  }
}

const toggleFullscreen = () => {
  if (videoRef.value?.requestFullscreen) {
    videoRef.value.requestFullscreen()
  }
}

const handleEnded = () => {
  playing.value = false
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.video-player {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.player-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.play-button:hover {
  opacity: 1;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f7f9fc;
  border-radius: 8px;
}

.progress-slider {
  flex: 1;
}

.time-display {
  font-size: 12px;
  color: #7f8c8d;
  min-width: 60px;
}
</style>
```

---

## 📊 类型定义

```typescript
// types/interactive-curriculum.ts

export interface InteractiveCurriculum {
  id: string
  title: string
  domain: string
  htmlCode: string
  cssCode: string
  jsCode: string
  media: {
    images: MediaImage[]
    video: MediaVideo
  }
  metadata: {
    generatedAt: Date
    models: {
      text: string
      image: string
      video: string
    }
    status: 'generating' | 'completed' | 'failed'
  }
}

export interface MediaImage {
  id: string
  url: string
  description: string
  order: number
}

export interface MediaVideo {
  url: string
  duration: number
  script: string
}

export interface Task {
  id: string
  name: string
  icon: string
  progress: number
  status: string
}
```

---

**这个组件框架已准备好实现！** 🚀

