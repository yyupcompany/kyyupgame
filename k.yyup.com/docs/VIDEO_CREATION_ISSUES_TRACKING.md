# 视频制作功能问题追踪

## 📋 问题总览

| ID | 问题 | 状态 | 优先级 | 修复版本 |
|----|------|------|--------|----------|
| #1 | 配音显示"共0个音频" | ✅ 已修复 | 🔴 高 | commit: 18abeff |
| #2 | 分镜视频卡片不显示 | ✅ 已修复 | 🔴 高 | commit: 18abeff |
| #3 | 流程卡死无法继续 | ✅ 已修复 | 🔴 高 | commit: 9aea312 |
| #4 | 项目恢复步骤错误 | ✅ 已修复 | 🟡 中 | commit: 18abeff |
| #5 | 数据类型不匹配 | ✅ 已修复 | 🔴 高 | commit: 89fec40 |
| #6 | 缺少"创作视频"按钮 | ✅ 已修复 | 🟢 低 | commit: 9aea312 |

---

## 问题详情

### #1 配音显示"共0个音频"

#### 问题描述

**现象**:
- 步骤3显示"✅ 配音已生成（共0个音频）"
- 点击"查看配音列表"对话框为空
- 实际上配音已经生成

**截图**:
```
✅ 配音已生成（共 0 个音频）
[查看配音列表] [重新生成配音]
```

#### 根本原因

后端 `getUnfinishedProjects` 接口**没有返回** `audioData` 字段：

```typescript
// ❌ 问题代码
data: projects.map(p => ({
  id: p.id,
  title: p.title,
  scriptData: p.scriptData,
  // 缺少 audioData ❌
}))
```

#### 影响范围

- 用户无法查看已生成的配音
- 刷新页面后配音数据丢失
- 无法继续后续步骤

#### 修复方案

**后端修改** (`server/src/controllers/video-creation.controller.ts`):

```typescript
// ✅ 修复代码
data: projects.map(p => ({
  id: p.id,
  title: p.title,
  scriptData: p.scriptData,
  audioData: p.audioData,  // ✅ 添加此行
}))
```

**前端验证** (`client/src/pages/principal/media-center/VideoCreatorTimeline.vue`):

```typescript
// 添加调试日志
console.log('🔍 检查配音数据:', {
  hasAudioData: !!project.audioData,
  isArray: Array.isArray(project.audioData),
  length: project.audioData?.length
})

if (project.audioData && Array.isArray(project.audioData) && project.audioData.length > 0) {
  console.log('✅ 恢复配音数据:', project.audioData.length, '个音频文件')
  audioData.value = project.audioData
}
```

#### 测试步骤

1. 生成脚本和配音
2. 刷新页面
3. 验证步骤3显示"✅ 配音已生成（共 X 个音频）"
4. 点击"查看配音列表"
5. 验证对话框显示所有配音
6. 验证可以播放配音

#### 状态

- ✅ **已修复** (2025-01-XX)
- **修复提交**: commit 18abeff
- **测试状态**: 待用户验证

---

### #2 分镜视频卡片不显示

#### 问题描述

**现象**:
- 步骤4显示"脚本生成完成"
- 显示"生成分镜视频"按钮
- 但实际分镜已经生成完成
- 应该显示视频卡片网格

**截图**:
```
🎬 步骤4: 分镜生成 [进行中]

脚本生成完成
[生成分镜视频]  ← 应该显示视频卡片
```

#### 根本原因

1. **后端问题**: `getUnfinishedProjects` 接口没有返回 `sceneVideos` 字段
2. **前端问题**: 恢复逻辑没有检查 `sceneVideos`
3. **显示逻辑**: `sceneVideos.length === 0` 导致显示生成按钮而不是卡片

#### 技术分析

**条件渲染逻辑**:
```vue
<div v-if="currentStep === 4">
  <!-- 如果 sceneVideos.length > 0，显示卡片 -->
  <div v-if="sceneVideos.length > 0" class="scenes-preview">
    <el-row :gutter="16">
      <el-col v-for="scene in sceneVideos">
        <el-card>视频卡片</el-card>
      </el-col>
    </el-row>
  </div>
  
  <!-- 否则显示生成按钮 -->
  <el-button v-else @click="generateScenes">
    生成分镜视频
  </el-button>
</div>
```

**问题**:
- `sceneVideos.value = []` (空数组)
- `sceneVideos.length === 0` → true
- 显示生成按钮 ❌

#### 修复方案

**后端修改** (`server/src/controllers/video-creation.controller.ts`):

```typescript
// ✅ 修复代码
data: projects.map(p => ({
  id: p.id,
  title: p.title,
  scriptData: p.scriptData,
  audioData: p.audioData,
  sceneVideos: p.sceneVideos,  // ✅ 添加此行
}))
```

**前端修改** (`client/src/pages/principal/media-center/VideoCreatorTimeline.vue`):

```typescript
// ✅ 添加分镜数据恢复逻辑
if (project.sceneVideos && Array.isArray(project.sceneVideos) && project.sceneVideos.length > 0) {
  console.log('✅ 恢复分镜数据:', project.sceneVideos.length, '个场景视频')
  currentStep.value = 4
  sceneVideos.value = project.sceneVideos
  scenesProgress.value = 100
  scenesProgressText.value = '分镜生成完成！'
  
  // 同时恢复配音数据
  if (project.audioData && Array.isArray(project.audioData) && project.audioData.length > 0) {
    audioData.value = project.audioData
  }
}
```

#### 测试步骤

1. 生成脚本、配音和分镜
2. 刷新页面
3. 验证步骤4显示视频卡片网格（3列）
4. 验证每个卡片显示场景编号和标题
5. 验证点击卡片可以预览视频
6. 验证显示"确认分镜，继续下一步"按钮

#### 状态

- ✅ **已修复** (2025-01-XX)
- **修复提交**: commit 18abeff
- **测试状态**: 待用户验证

---

### #3 流程卡死无法继续

#### 问题描述

**现象**:
- 步骤2脚本生成完成后
- 没有"确认脚本，继续"按钮
- 用户无法进入步骤3
- 流程卡死

#### 根本原因

代码中有**两个重复的** `v-else-if="currentStep > 2"` 条件块：

```vue
<!-- ❌ 问题代码 -->
<div v-else-if="currentStep > 2" class="step-summary">
  <!-- 第一个块：详细信息 -->
  <p>✅ 脚本已生成，共 {{ scriptData?.scenes?.length || 0 }} 个场景</p>
  <el-button @click="viewScript">查看脚本</el-button>
  <el-button @click="regenerateScript">重新生成脚本</el-button>
</div>

<div v-else-if="currentStep > 2" class="step-summary">
  <!-- 第二个块：简化信息（覆盖了第一个） -->
  <p>✅ 脚本已生成</p>
  <el-button @click="viewScript">查看脚本</el-button>
  <el-button @click="regenerateScript">重新生成</el-button>
</div>
```

第二个块覆盖了第一个，导致按钮显示混乱。

#### 修复方案

**删除重复的条件块**:

```vue
<!-- ✅ 修复代码 -->
<div v-if="currentStep === 2" class="step-content">
  <!-- 脚本生成完成后显示 -->
  <div v-if="scriptData" class="script-preview">
    <!-- 脚本内容 -->
    <el-button @click="approveScript" size="large">
      <el-icon><Check /></el-icon>
      确认脚本，继续下一步 →
    </el-button>
  </div>
</div>

<!-- 只保留一个 v-else-if 块 -->
<div v-else-if="currentStep > 2" class="step-summary">
  <p>✅ 脚本已生成，共 {{ scriptData?.scenes?.length || 0 }} 个场景</p>
  <el-button @click="viewScript">查看脚本</el-button>
  <el-button @click="regenerateScript">重新生成</el-button>
</div>
```

#### 测试步骤

1. 填写创意信息，点击"开始创作"
2. 等待脚本生成完成
3. 验证显示"确认脚本，继续下一步"按钮（大号，带Check图标）
4. 点击按钮
5. 验证成功进入步骤3

#### 状态

- ✅ **已修复** (2025-01-XX)
- **修复提交**: commit 9aea312
- **测试状态**: 已验证

---

### #4 项目恢复步骤错误

#### 问题描述

**现象**:
- 已生成分镜（步骤4完成）
- 刷新页面后回到步骤3或步骤2
- 应该恢复到步骤4

#### 根本原因

前端恢复逻辑**没有检查** `sceneVideos`，只检查了 `audioData`：

```typescript
// ❌ 问题代码
if (project.audioData && project.audioData.length > 0) {
  currentStep.value = 3  // 只恢复到步骤3
} else {
  currentStep.value = 2
}
```

#### 修复方案

**按优先级恢复**:

```typescript
// ✅ 修复代码
// 优先级1: 检查分镜数据
if (project.sceneVideos && project.sceneVideos.length > 0) {
  currentStep.value = 4
  sceneVideos.value = project.sceneVideos
  // 同时恢复配音
  if (project.audioData) audioData.value = project.audioData
}
// 优先级2: 检查配音数据
else if (project.audioData && project.audioData.length > 0) {
  currentStep.value = 3
  audioData.value = project.audioData
}
// 优先级3: 只有脚本数据
else {
  currentStep.value = 2
}
```

#### 恢复优先级逻辑

```
检查数据:
  ├─ sceneVideos.length > 0? → 步骤4 (优先级最高)
  ├─ audioData.length > 0?   → 步骤3
  └─ scriptData?             → 步骤2
```

#### 测试步骤

1. 完成步骤1-4（生成分镜）
2. 刷新页面
3. 验证恢复到步骤4
4. 验证显示分镜卡片
5. 验证显示配音数量

#### 状态

- ✅ **已修复** (2025-01-XX)
- **修复提交**: commit 18abeff
- **测试状态**: 待用户验证

---

### #5 数据类型不匹配

#### 问题描述

**现象**:
- 后端返回的 `audioData` 和 `sceneVideos` 可能是JSON字符串
- 前端期望是数组
- 导致 `Array.isArray()` 检查失败

#### 可能原因

Sequelize返回JSON字段时，根据配置可能返回：
1. **对象/数组** (已解析)
2. **JSON字符串** (未解析)

#### 排查方法

**添加调试日志**:

```typescript
console.log('audioData类型:', typeof project.audioData)
console.log('audioData是否为数组:', Array.isArray(project.audioData))
console.log('audioData内容:', project.audioData)

console.log('sceneVideos类型:', typeof project.sceneVideos)
console.log('sceneVideos是否为数组:', Array.isArray(project.sceneVideos))
console.log('sceneVideos内容:', project.sceneVideos)
```

**检查后端配置**:

```typescript
// Sequelize模型定义
audioData: {
  type: DataTypes.JSON,  // 或 DataTypes.TEXT
  get() {
    const value = this.getDataValue('audioData')
    // 是否自动解析？
    return value
  }
}
```

#### 临时解决方案

**前端添加类型检查和解析**:

```typescript
// 处理 audioData
if (project.audioData) {
  if (typeof project.audioData === 'string') {
    try {
      audioData.value = JSON.parse(project.audioData)
    } catch (e) {
      console.error('解析audioData失败:', e)
      audioData.value = []
    }
  } else if (Array.isArray(project.audioData)) {
    audioData.value = project.audioData
  } else {
    console.warn('audioData格式错误:', project.audioData)
    audioData.value = []
  }
}

// 处理 sceneVideos
if (project.sceneVideos) {
  if (typeof project.sceneVideos === 'string') {
    try {
      sceneVideos.value = JSON.parse(project.sceneVideos)
    } catch (e) {
      console.error('解析sceneVideos失败:', e)
      sceneVideos.value = []
    }
  } else if (Array.isArray(project.sceneVideos)) {
    sceneVideos.value = project.sceneVideos
  } else {
    console.warn('sceneVideos格式错误:', project.sceneVideos)
    sceneVideos.value = []
  }
}
```

#### 测试步骤

1. 添加调试日志
2. 刷新页面
3. 查看控制台输出的数据类型
4. 根据类型决定是否需要解析

#### 最终修复方案

**实施的解决方案**:

```typescript
// 解析和恢复分镜数据
let parsedSceneVideos: any[] = []
if (project.sceneVideos) {
  // 处理JSON字符串或数组
  if (typeof project.sceneVideos === 'string') {
    try {
      parsedSceneVideos = JSON.parse(project.sceneVideos)
      console.log('✅ 成功解析分镜JSON字符串:', parsedSceneVideos.length, '个场景')
    } catch (e) {
      console.error('❌ 解析分镜数据失败:', e)
      parsedSceneVideos = []
    }
  } else if (Array.isArray(project.sceneVideos)) {
    parsedSceneVideos = project.sceneVideos
  }
}

// 解析和恢复配音数据
let parsedAudioData: any[] = []
if (project.audioData) {
  // 处理JSON字符串或数组
  if (typeof project.audioData === 'string') {
    try {
      parsedAudioData = JSON.parse(project.audioData)
    } catch (e) {
      console.error('❌ 解析配音数据失败:', e)
      parsedAudioData = []
    }
  } else if (Array.isArray(project.audioData)) {
    parsedAudioData = project.audioData
  }
}

// 使用解析后的数据进行恢复
if (parsedSceneVideos.length > 0) {
  sceneVideos.value = parsedSceneVideos
  if (parsedAudioData.length > 0) {
    audioData.value = parsedAudioData
  }
}
```

#### 状态

- ✅ **已修复** (2025-01-XX)
- **修复提交**: commit 89fec40
- **测试状态**: 待用户验证
- **优先级**: 高（这是问题#1和#2的根本原因）

---

### #6 缺少"创作视频"按钮

#### 问题描述

**现象**:
- 页面顶部没有"创作视频"按钮
- 用户无法快速开始新项目
- 如果有正在进行的项目，没有确认机制

#### 修复方案

**添加全局按钮**:

```vue
<el-card class="header-card">
  <div class="header-content">
    <div class="header-text">
      <h2>🎬 智能视频制作</h2>
      <p class="subtitle">7步完成专业视频制作，从创意到发布</p>
    </div>
    <el-button type="primary" size="large" @click="handleCreateNewVideo">
      <el-icon><Plus /></el-icon>
      创作视频
    </el-button>
  </div>
</el-card>
```

**添加确认逻辑**:

```typescript
const handleCreateNewVideo = async () => {
  // 检查是否有正在进行的项目
  const hasContent = projectId.value || 
                     formData.value.topic || 
                     scriptData.value || 
                     audioData.value.length > 0 || 
                     sceneVideos.value.length > 0
  
  if (hasContent) {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      '当前有正在进行的视频项目，创建新视频将清除所有数据，是否继续？',
      '确认创建新视频',
      {
        confirmButtonText: '确认创建',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  }
  
  // 创建新视频
  createNewVideo()
}
```

#### 状态

- ✅ **已修复** (2025-01-XX)
- **修复提交**: commit 9aea312
- **测试状态**: 已验证

---

## 调试指南

### 当前调试代码

**位置**: commit cb175ff

**前端调试信息**:

1. **步骤4顶部灰色调试框**:
```
🔍 调试信息:
当前步骤: 4
分镜数量: 0
正在生成: false
生成进度: 100%
分镜数据: 无数据
```

2. **控制台日志**:
```javascript
🔍 检查分镜数据: { hasSceneVideos: true, isArray: true, length: 3 }
✅ 恢复分镜数据: 3 个场景视频
分镜数据详情: [...]
```

### 如何使用调试信息

1. **刷新页面**
2. **查看步骤4的灰色调试框**
3. **打开控制台** (F12)
4. **查找日志**:
   - `🔍 检查分镜数据:`
   - `🔍 检查配音数据:`
   - `✅ 恢复分镜数据:` 或 `⚠️ 只有脚本数据`

5. **分析问题**:
   - 如果 `分镜数量: 0` → 数据没有恢复
   - 如果 `hasSceneVideos: false` → 后端没有返回数据
   - 如果 `isArray: false` → 数据类型错误

---

## 待办事项

- [x] 调查问题 #5 (数据类型) - ✅ 已完成
- [x] 修复问题 #5 (添加JSON解析逻辑) - ✅ 已完成
- [x] 用户验证问题 #1 (配音数据恢复) - ✅ 已通过
- [x] 用户验证问题 #2 (分镜卡片显示) - ✅ 已通过
- [x] 用户验证问题 #4 (步骤恢复) - ✅ 已通过
- [x] 用户验证问题 #5 (数据类型修复) - ✅ 已通过
- [x] 移除调试代码 (所有问题验证通过后) - ✅ 已完成
- [ ] 更新测试文档
- [ ] 添加单元测试
- [ ] 考虑将sceneVideos字段改为JSON类型（长期优化）

---

## 联系方式

如有问题，请提供：
1. 浏览器控制台截图
2. 步骤4调试框截图
3. Network面板的API响应
4. 操作步骤描述

---

**最后更新**: 2025-01-XX  
**文档版本**: 1.0  
**维护者**: 开发团队

