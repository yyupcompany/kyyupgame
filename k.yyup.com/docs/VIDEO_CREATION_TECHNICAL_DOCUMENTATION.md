# 视频制作功能技术文档

## 📋 目录

1. [功能概述](#功能概述)
2. [技术架构](#技术架构)
3. [前端实现](#前端实现)
4. [后端实现](#后端实现)
5. [数据流转](#数据流转)
6. [API接口](#api接口)
7. [数据库设计](#数据库设计)
8. [已知问题](#已知问题)
9. [故障排查](#故障排查)

---

## 功能概述

### 业务流程

智能视频制作功能提供7步完整的视频创作流程：

```
步骤1: 创意输入 → 步骤2: 脚本生成 → 步骤3: 配音合成 → 步骤4: 分镜生成 
→ 步骤5: 视频剪辑 → 步骤6: 预览调整 → 步骤7: 导出发布
```

### 核心功能

- ✅ AI智能脚本生成
- ✅ 多音色配音合成
- ✅ 文本转视频分镜
- ✅ 视频自动剪辑合成
- ✅ 项目自动保存和恢复
- ✅ 重新生成功能
- ✅ 实时进度轮询

---

## 技术架构

### 前端技术栈

- **框架**: Vue 3 + TypeScript + Composition API
- **UI库**: Element Plus
- **状态管理**: Ref/Reactive (Composition API)
- **HTTP客户端**: Axios (封装为 videoCreationRequest)
- **路由**: Vue Router

### 后端技术栈

- **框架**: Express.js + TypeScript
- **ORM**: Sequelize
- **数据库**: MySQL
- **AI服务**: 
  - 火山引擎 TTS (配音)
  - 火山引擎 Video Generation (视频生成)
  - AI Bridge Service (统一调用)

### 第三方服务

- **火山引擎 TTS**: 文本转语音
- **火山引擎 Video Generation**: 文本转视频
- **火山引擎 VOD**: 视频剪辑合成

---

## 前端实现

### 文件位置

```
client/src/pages/principal/media-center/VideoCreatorTimeline.vue
```

### 核心响应式变量

```typescript
// 当前步骤
const currentStep = ref(1)

// 项目ID
const projectId = ref('')

// 表单数据
const formData = ref({
  topic: '',           // 视频主题
  platform: '',        // 发布平台
  videoType: '',       // 视频类型
  duration: 'short',   // 视频时长
  keyPoints: '',       // 关键要点
  voiceStyle: ''       // 配音风格
})

// 步骤2: 脚本数据
const scriptData = ref<any>(null)
const scriptGenerating = ref(false)
const scriptProgress = ref(0)

// 步骤3: 配音数据
const audioData = ref<any[]>([])
const audioGenerating = ref(false)
const audioProgress = ref(0)

// 步骤4: 分镜数据
const sceneVideos = ref<any[]>([])
const scenesGenerating = ref(false)
const scenesProgress = ref(0)

// 步骤5: 最终视频
const finalVideoUrl = ref('')
const merging = ref(false)
const mergeProgress = ref(0)

// 轮询相关
let pollingTimer: number | null = null
const isPolling = ref(false)
const realProgress = ref(0)
const realProgressMessage = ref('')
```

### 关键方法

#### 1. 项目恢复 (checkUnfinishedProjects)

```typescript
const checkUnfinishedProjects = async () => {
  // 1. 调用后端接口获取未完成项目
  const response = await videoCreationRequest.get('/video-creation/unfinished')
  
  // 2. 恢复项目基本信息
  projectId.value = project.id
  
  // 3. 根据数据优先级恢复到对应步骤
  if (project.sceneVideos && project.sceneVideos.length > 0) {
    // 有分镜数据 → 恢复到步骤4
    currentStep.value = 4
    sceneVideos.value = project.sceneVideos
    audioData.value = project.audioData || []
  } else if (project.audioData && project.audioData.length > 0) {
    // 有配音数据 → 恢复到步骤3
    currentStep.value = 3
    audioData.value = project.audioData
  } else {
    // 只有脚本数据 → 恢复到步骤2
    currentStep.value = 2
  }
  
  // 4. 恢复表单数据
  scriptData.value = project.scriptData
  formData.value = { ...project }
}
```

#### 2. 脚本生成 (generateScript)

```typescript
const generateScript = async () => {
  scriptGenerating.value = true
  
  // 调用后端API
  await videoCreationRequest.post(
    `/video-creation/projects/${projectId.value}/script`,
    {
      topic: formData.value.topic,
      platform: formData.value.platform,
      videoType: formData.value.videoType,
      duration: getDurationInSeconds(formData.value.duration),
      keyPoints: formData.value.keyPoints
    }
  )
  
  // 开始轮询进度
  startPolling()
}
```

#### 3. 配音生成 (generateAudio)

```typescript
const generateAudio = async () => {
  audioGenerating.value = true
  
  // 调用后端API
  const response = await videoCreationRequest.post(
    `/video-creation/projects/${projectId.value}/audio`,
    {
      scriptData: scriptData.value,
      voiceStyle: formData.value.voiceStyle
    }
  )
  
  // 保存配音数据
  audioData.value = response.data.audioData
}
```

#### 4. 分镜生成 (generateScenes)

```typescript
const generateScenes = async () => {
  scenesGenerating.value = true
  
  // 调用后端API
  const response = await videoCreationRequest.post(
    `/video-creation/projects/${projectId.value}/scenes`,
    {
      scriptData: scriptData.value
    }
  )
  
  // 保存分镜数据
  sceneVideos.value = response.data.sceneVideos
}
```

#### 5. 视频合成 (mergeVideos)

```typescript
const mergeVideos = async () => {
  merging.value = true
  
  // 调用后端API
  const response = await videoCreationRequest.post(
    `/video-creation/projects/${projectId.value}/merge`,
    {
      sceneVideos: sceneVideos.value,
      audioData: audioData.value
    }
  )
  
  // 保存最终视频URL
  finalVideoUrl.value = response.data.videoUrl
}
```

### 条件渲染逻辑

#### 步骤4的显示逻辑

```vue
<div v-if="currentStep === 4" class="step-content">
  <!-- 正在生成：显示进度条 -->
  <el-progress v-if="scenesGenerating" :percentage="scenesProgress" />
  
  <!-- 已生成：显示视频卡片 -->
  <div v-if="sceneVideos.length > 0" class="scenes-preview">
    <el-row :gutter="16">
      <el-col :span="8" v-for="(scene, index) in sceneVideos" :key="index">
        <el-card @click="previewSceneVideo(scene, index)">
          <!-- 视频缩略图 -->
          <video :src="scene.videoUrl" class="thumbnail-video"></video>
        </el-card>
      </el-col>
    </el-row>
    <el-button @click="approveScenes">确认分镜，继续下一步</el-button>
  </div>
  
  <!-- 未生成：显示生成按钮 -->
  <el-button v-else @click="generateScenes">生成分镜视频</el-button>
</div>
```

---

## 后端实现

### 文件位置

```
server/src/controllers/video-creation.controller.ts
server/src/routes/video-creation.routes.ts
server/src/models/video-project.model.ts
```

### 数据模型 (VideoProject)

```typescript
class VideoProject extends Model {
  id: string
  userId: string
  title: string
  status: VideoProjectStatus
  progress: number
  progressMessage: string
  
  // 表单数据
  topic: string
  platform: string
  videoType: string
  duration: string
  keyPoints: string
  voiceStyle: string
  
  // 生成数据 (JSON字段)
  scriptData: any
  audioData: any[]
  sceneVideos: any[]
  
  // 最终视频
  finalVideoUrl: string
  finalVideoId: string
  
  createdAt: Date
  updatedAt: Date
}
```

### 项目状态枚举

```typescript
enum VideoProjectStatus {
  DRAFT = 'draft',                      // 草稿
  GENERATING_SCRIPT = 'generating_script',  // 生成脚本中
  GENERATING_AUDIO = 'generating_audio',    // 生成配音中
  GENERATING_VIDEO = 'generating_video',    // 生成视频中
  EDITING = 'editing',                      // 剪辑中
  COMPLETED = 'completed',                  // 已完成
  FAILED = 'failed'                         // 失败
}
```

### 核心控制器方法

#### 1. 获取未完成项目 (getUnfinishedProjects)

```typescript
async getUnfinishedProjects(req: Request, res: Response) {
  const userId = (req as any).user?.id
  
  // 查询未完成的项目
  const projects = await VideoProject.findAll({
    where: {
      userId,
      status: [
        VideoProjectStatus.DRAFT,
        VideoProjectStatus.GENERATING_SCRIPT,
        VideoProjectStatus.GENERATING_AUDIO,
        VideoProjectStatus.GENERATING_VIDEO,
        VideoProjectStatus.EDITING,
      ],
    },
    order: [['updatedAt', 'DESC']],
    limit: 10,
  })
  
  res.json({
    success: true,
    data: projects.map(p => ({
      id: p.id,
      title: p.title,
      status: p.status,
      progress: p.progress,
      progressMessage: p.progressMessage,
      scriptData: p.scriptData,      // ⚠️ 关键：必须返回
      audioData: p.audioData,         // ⚠️ 关键：必须返回
      sceneVideos: p.sceneVideos,     // ⚠️ 关键：必须返回
      topic: p.topic,
      platform: p.platform,
      videoType: p.videoType,
      duration: p.duration,
      keyPoints: p.keyPoints,
      voiceStyle: p.voiceStyle,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  })
}
```

#### 2. 生成脚本 (generateScript)

```typescript
async generateScript(req: Request, res: Response) {
  const { projectId } = req.params
  const { topic, platform, videoType, duration, keyPoints } = req.body
  
  // 更新项目状态
  await project.update({
    status: VideoProjectStatus.GENERATING_SCRIPT,
    progress: 0,
    progressMessage: '正在生成脚本...'
  })
  
  // 调用AI服务生成脚本
  const scriptData = await aiService.generateVideoScript({
    topic,
    platform,
    videoType,
    duration,
    keyPoints
  })
  
  // 保存脚本数据
  await project.update({
    status: VideoProjectStatus.DRAFT,
    progress: 100,
    progressMessage: '脚本生成完成',
    scriptData: scriptData
  })
  
  res.json({
    success: true,
    data: { scriptData }
  })
}
```

#### 3. 生成配音 (generateAudio)

```typescript
async generateAudio(req: Request, res: Response) {
  const { projectId } = req.params
  const { scriptData, voiceStyle } = req.body
  
  const audioData = []
  
  // 为每个场景生成配音
  for (let i = 0; i < scriptData.scenes.length; i++) {
    const scene = scriptData.scenes[i]
    
    // 调用TTS服务
    const audioResult = await ttsService.synthesize({
      text: scene.narration,
      voiceStyle: voiceStyle
    })
    
    audioData.push({
      sceneNumber: i + 1,
      narration: scene.narration,
      audioUrl: audioResult.audioUrl,
      duration: audioResult.duration
    })
  }
  
  // 保存配音数据
  await project.update({
    audioData: audioData
  })
  
  res.json({
    success: true,
    data: { audioData }
  })
}
```

#### 4. 生成分镜 (generateVideoScenes)

```typescript
async generateVideoScenes(req: Request, res: Response) {
  const { projectId } = req.params
  const { scriptData } = req.body
  
  const sceneVideos = []
  
  // 为每个场景生成视频
  for (let i = 0; i < scriptData.scenes.length; i++) {
    const scene = scriptData.scenes[i]
    
    // 获取场景描述
    const prompt = scene.visualDescription || 
                   scene.visual || 
                   scene.description || 
                   scene.sceneTitle || 
                   '视频场景'
    
    // 调用视频生成服务
    const videoResult = await videoService.generateVideoFromText({
      prompt: prompt,
      duration: scene.duration || 5
    })
    
    sceneVideos.push({
      sceneIndex: i,
      sceneTitle: scene.sceneTitle,
      videoUrl: videoResult.videoUrl
    })
  }
  
  // 保存分镜数据
  await project.update({
    sceneVideos: sceneVideos
  })
  
  res.json({
    success: true,
    data: { sceneVideos }
  })
}
```

#### 5. 合并视频 (mergeVideoScenes)

```typescript
async mergeVideoScenes(req: Request, res: Response) {
  const { projectId } = req.params
  const { sceneVideos, audioData } = req.body
  
  // 提取视频URL列表
  const videoUrls = sceneVideos
    .filter(scene => scene.videoUrl)
    .map(scene => scene.videoUrl)
  
  // 步骤1: 合并视频片段
  const mergedVideo = await vodService.mergeVideos({
    videoUrls,
    outputFilename: `${project.title}_merged.mp4`
  })
  
  // 步骤2: 添加配音
  let finalVideo = mergedVideo
  if (audioData && audioData.length > 0) {
    const audioUrl = audioData[0].audioUrl
    finalVideo = await vodService.addAudioToVideo({
      videoUrl: mergedVideo.videoUrl,
      audioUrl: audioUrl
    })
  }
  
  // 步骤3: 转码优化
  const optimizedVideo = await vodService.transcodeVideo({
    videoUrl: finalVideo.videoUrl,
    format: 'mp4',
    quality: 'high'
  })
  
  // 保存最终视频
  await project.update({
    status: VideoProjectStatus.COMPLETED,
    finalVideoUrl: optimizedVideo.videoUrl
  })
  
  res.json({
    success: true,
    data: {
      videoUrl: optimizedVideo.videoUrl
    }
  })
}
```

---

## 数据流转

### 完整流程数据流

```
用户输入 (formData)
  ↓
创建项目 (POST /projects)
  ↓
生成脚本 (POST /projects/:id/script)
  ↓ 保存 scriptData
轮询状态 (GET /projects/:id/status)
  ↓
生成配音 (POST /projects/:id/audio)
  ↓ 保存 audioData[]
生成分镜 (POST /projects/:id/scenes)
  ↓ 保存 sceneVideos[]
合并视频 (POST /projects/:id/merge)
  ↓ 保存 finalVideoUrl
完成 (status = COMPLETED)
```

### 项目恢复数据流

```
页面加载 (onMounted)
  ↓
检查未完成项目 (GET /unfinished)
  ↓
后端返回项目数据:
  - scriptData (JSON)
  - audioData (JSON Array)
  - sceneVideos (JSON Array)
  ↓
前端解析并恢复:
  - 检查 sceneVideos.length > 0 → 步骤4
  - 检查 audioData.length > 0 → 步骤3
  - 检查 scriptData → 步骤2
  ↓
显示对应步骤内容
```

---

## API接口

### 基础路径

```
/api/video-creation
```

### 接口列表

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| POST | `/projects` | 创建项目 | formData | projectId |
| GET | `/projects/:id` | 获取项目详情 | - | project |
| GET | `/projects` | 获取项目列表 | - | projects[] |
| GET | `/unfinished` | 获取未完成项目 | - | projects[] |
| POST | `/projects/:id/script` | 生成脚本 | topic, platform, etc | scriptData |
| POST | `/projects/:id/audio` | 生成配音 | scriptData, voiceStyle | audioData[] |
| POST | `/projects/:id/scenes` | 生成分镜 | scriptData | sceneVideos[] |
| POST | `/projects/:id/merge` | 合并视频 | sceneVideos, audioData | videoUrl |
| GET | `/projects/:id/status` | 获取状态（轮询） | - | status, progress |
| DELETE | `/projects/:id` | 删除项目 | - | success |

### 关键接口详情

#### GET /unfinished

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "春季招生宣传",
      "status": "draft",
      "progress": 100,
      "progressMessage": "脚本生成完成",
      "scriptData": {
        "title": "春季招生宣传",
        "scenes": [...]
      },
      "audioData": [
        {
          "sceneNumber": 1,
          "narration": "...",
          "audioUrl": "https://...",
          "duration": 5
        }
      ],
      "sceneVideos": [
        {
          "sceneIndex": 0,
          "sceneTitle": "场景1",
          "videoUrl": "https://..."
        }
      ],
      "topic": "春季招生宣传",
      "platform": "douyin",
      "videoType": "enrollment",
      "duration": "short",
      "keyPoints": "...",
      "voiceStyle": "zh_female_cancan_mars_bigtts"
    }
  ]
}
```

---

## 数据库设计

### video_projects 表结构

```sql
CREATE TABLE video_projects (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  progress INT DEFAULT 0,
  progressMessage TEXT,
  
  -- 表单数据
  topic VARCHAR(255),
  platform VARCHAR(50),
  videoType VARCHAR(50),
  duration VARCHAR(50),
  keyPoints TEXT,
  voiceStyle VARCHAR(100),
  
  -- 生成数据 (JSON)
  scriptData JSON,
  audioData JSON,
  sceneVideos JSON,
  
  -- 最终视频
  finalVideoUrl VARCHAR(500),
  finalVideoId VARCHAR(100),
  
  createdAt DATETIME,
  updatedAt DATETIME,
  
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_updatedAt (updatedAt)
);
```

### JSON字段结构

#### scriptData
```json
{
  "title": "视频标题",
  "description": "视频简介",
  "totalDuration": 30,
  "scenes": [
    {
      "sceneTitle": "场景标题",
      "visualDescription": "画面描述",
      "narration": "旁白文案",
      "subtitle": "字幕文本",
      "duration": 5,
      "cameraAngle": "镜头角度",
      "cameraMovement": "镜头运动",
      "transition": "转场效果"
    }
  ]
}
```

#### audioData
```json
[
  {
    "sceneNumber": 1,
    "narration": "旁白文案",
    "audioUrl": "https://...",
    "duration": 5
  }
]
```

#### sceneVideos
```json
[
  {
    "sceneIndex": 0,
    "sceneTitle": "场景标题",
    "videoUrl": "https://..."
  }
]
```

---

## 已知问题

### 问题1: 配音显示"共0个音频"

**现象**:
- 步骤3显示"✅ 配音已生成（共0个音频）"
- 点击"查看配音列表"没有数据

**原因**:
- 后端 `getUnfinishedProjects` 接口没有返回 `audioData` 字段
- 前端恢复时 `audioData.value` 为空数组

**解决方案**:
```typescript
// ✅ 后端必须返回 audioData
data: projects.map(p => ({
  // ...
  audioData: p.audioData,  // 添加此行
}))
```

**状态**: ✅ 已修复 (commit: 18abeff)

---

### 问题2: 分镜视频卡片不显示

**现象**:
- 步骤4显示"脚本生成完成"
- 显示"生成分镜视频"按钮
- 但实际分镜已生成

**原因**:
1. 后端 `getUnfinishedProjects` 接口没有返回 `sceneVideos` 字段
2. 前端恢复时 `sceneVideos.value` 为空数组
3. 条件 `sceneVideos.length > 0` 为 false，显示生成按钮而不是卡片

**解决方案**:
```typescript
// ✅ 后端必须返回 sceneVideos
data: projects.map(p => ({
  // ...
  sceneVideos: p.sceneVideos,  // 添加此行
}))

// ✅ 前端恢复分镜数据
if (project.sceneVideos && project.sceneVideos.length > 0) {
  currentStep.value = 4
  sceneVideos.value = project.sceneVideos
}
```

**状态**: ✅ 已修复 (commit: 18abeff)

---

### 问题3: 流程卡死无法继续

**现象**:
- 步骤2脚本生成完成后，没有"确认脚本，继续"按钮
- 用户无法进入步骤3

**原因**:
- 代码中有两个重复的 `v-else-if="currentStep > 2"` 块
- 第二个块覆盖了第一个，导致按钮显示混乱

**解决方案**:
```vue
<!-- ❌ 错误：重复的条件块 -->
<div v-else-if="currentStep > 2">...</div>
<div v-else-if="currentStep > 2">...</div>

<!-- ✅ 正确：删除重复块 -->
<div v-else-if="currentStep > 2">...</div>
```

**状态**: ✅ 已修复 (commit: 9aea312)

---

### 问题4: 项目恢复步骤错误

**现象**:
- 已生成分镜，但刷新后回到步骤3或步骤2

**原因**:
- 前端恢复逻辑没有检查 `sceneVideos`
- 只检查了 `audioData`

**解决方案**:
```typescript
// ✅ 按优先级恢复
if (project.sceneVideos && project.sceneVideos.length > 0) {
  currentStep.value = 4  // 优先级1
} else if (project.audioData && project.audioData.length > 0) {
  currentStep.value = 3  // 优先级2
} else {
  currentStep.value = 2  // 优先级3
}
```

**状态**: ✅ 已修复 (commit: 18abeff)

---

### 问题5: 数据类型不匹配

**现象**:
- 后端返回的 `audioData` 和 `sceneVideos` 可能是JSON字符串
- 前端期望是数组

**可能原因**:
- Sequelize返回JSON字段时，可能返回字符串而不是对象
- 需要手动解析

**排查方法**:
```typescript
// 添加调试日志
console.log('audioData类型:', typeof project.audioData)
console.log('audioData是否为数组:', Array.isArray(project.audioData))
console.log('audioData内容:', project.audioData)
```

**解决方案**:
```typescript
// 如果是字符串，需要解析
if (typeof project.audioData === 'string') {
  audioData.value = JSON.parse(project.audioData)
} else {
  audioData.value = project.audioData
}
```

**状态**: 🔍 待确认

---

## 故障排查

### 排查步骤

#### 1. 检查后端服务

```bash
# 检查服务状态
npm run status

# 重启后端服务
npm run stop
npm run start:backend

# 查看后端日志
cd server && npm run dev
```

#### 2. 检查数据库数据

```bash
# 使用脚本查询
node scripts/check-video-projects.cjs

# 或直接查询数据库
mysql -h <host> -u <user> -p<password> <database> \
  -e "SELECT id, status, LENGTH(audioData), LENGTH(sceneVideos) FROM video_projects ORDER BY updatedAt DESC LIMIT 5;"
```

#### 3. 检查前端控制台

打开浏览器控制台 (F12)，查看：

**项目恢复日志**:
```
🔍 检查分镜数据: { hasSceneVideos: true, isArray: true, length: 3 }
✅ 恢复分镜数据: 3 个场景视频
🔍 检查配音数据: { hasAudioData: true, isArray: true, length: 3 }
✅ 恢复配音数据: 3 个音频文件
```

**页面调试信息**:
- 当前步骤: 4
- 分镜数量: 3
- 正在生成: false
- 生成进度: 100%
- 分镜数据: 有数据

#### 4. 检查API响应

使用浏览器Network面板，查看 `/api/video-creation/unfinished` 响应：

```json
{
  "success": true,
  "data": [{
    "audioData": [...],      // ⚠️ 必须存在
    "sceneVideos": [...],    // ⚠️ 必须存在
    "scriptData": {...}      // ⚠️ 必须存在
  }]
}
```

### 常见问题检查清单

- [ ] 后端服务是否运行
- [ ] 数据库连接是否正常
- [ ] `getUnfinishedProjects` 是否返回 `audioData`
- [ ] `getUnfinishedProjects` 是否返回 `sceneVideos`
- [ ] 前端是否正确解析数据
- [ ] `sceneVideos.length` 是否 > 0
- [ ] `currentStep` 是否等于 4
- [ ] 浏览器是否缓存了旧代码（强制刷新 Ctrl+Shift+R）

### 调试代码

当前代码已添加详细调试日志 (commit: cb175ff)：

**前端调试**:
- 步骤4顶部显示灰色调试框
- 控制台输出详细数据结构

**后端调试**:
- 添加日志输出 `audioData` 和 `sceneVideos` 的长度

---

## 开发建议

### 1. 数据一致性

确保前后端数据字段名一致：
- ✅ `audioData` (不是 `audio_data`)
- ✅ `sceneVideos` (不是 `scene_videos`)
- ✅ `scriptData` (不是 `script_data`)

### 2. 类型安全

使用TypeScript接口定义数据结构：

```typescript
interface AudioData {
  sceneNumber: number
  narration: string
  audioUrl: string
  duration: number
}

interface SceneVideo {
  sceneIndex: number
  sceneTitle: string
  videoUrl: string
}
```

### 3. 错误处理

添加完善的错误处理：

```typescript
try {
  const response = await videoCreationRequest.get('/unfinished')
  if (!response.success) {
    throw new Error(response.message)
  }
} catch (error) {
  console.error('恢复项目失败:', error)
  ElMessage.error('恢复项目失败，请重试')
}
```

### 4. 数据验证

在恢复数据前验证数据格式：

```typescript
// 验证 audioData
if (project.audioData) {
  if (typeof project.audioData === 'string') {
    audioData.value = JSON.parse(project.audioData)
  } else if (Array.isArray(project.audioData)) {
    audioData.value = project.audioData
  } else {
    console.warn('audioData格式错误:', project.audioData)
    audioData.value = []
  }
}
```

---

## 相关文档

- [视频创作测试指南](./VIDEO_CREATION_TIMELINE_TEST_GUIDE.md)
- [视频创作快速参考](./VIDEO_CREATION_QUICK_REFERENCE.md)
- [API文档](http://localhost:3000/api-docs)

---

**最后更新**: 2025-01-XX  
**文档版本**: 1.0  
**维护者**: 开发团队

