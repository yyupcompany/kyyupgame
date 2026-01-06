# TTS音频文件清理策略

## 📋 概述

本文档描述了视频创作系统中TTS音频文件的生命周期管理和自动清理机制。

---

## 🎯 设计原则

### 核心理念
TTS大模型生成的音频文件应该：
1. **即时保存** - 生成后立即保存到服务器
2. **短期存储** - 只在项目生命周期内保留
3. **自动清理** - 重新生成或失败时自动删除

### 为什么需要清理？
- ❌ **问题1**: TTS生成的音频文件一直保存，占用存储空间
- ❌ **问题2**: 用户重新生成时，旧文件没有被删除
- ❌ **问题3**: TTS失败时，部分生成的文件残留
- ❌ **问题4**: 数据库记录与物理文件不一致

---

## 🔄 音频文件生命周期

### 1. 生成阶段
```
用户请求 → TTS大模型生成 → 立即保存到服务器 → 返回URL → 保存到数据库
```

**文件命名规则**:
```
{projectId}_scene_{sceneNumber}_audio.mp3
```

**示例**:
```
123e4567_scene_1_audio.mp3
123e4567_scene_2_audio.mp3
123e4567_scene_3_audio.mp3
```

### 2. 使用阶段
```
前端请求 → 后端返回URL → 前端<audio>标签加载 → 用户播放
```

**URL格式**:
```
/uploads/video-audio/{projectId}_scene_{sceneNumber}_audio.mp3
```

### 3. 清理阶段

#### 场景A: 用户重新生成
```
用户点击"重新生成" → 清理旧文件 → 清空数据库 → 生成新文件
```

#### 场景B: TTS失败
```
TTS失败 → 清理部分文件 → 清空数据库 → 返回错误 → 用户重试
```

#### 场景C: 项目删除
```
用户删除项目 → 清理所有文件 → 删除数据库记录
```

---

## 🛠️ 实现细节

### 1. 清理方法

#### `cleanupProjectAudio(projectId: string)`
**功能**: 清理项目的所有音频文件（物理删除）

**实现**:
```typescript
async cleanupProjectAudio(projectId: string): Promise<void> {
  // 1. 查找所有该项目的音频文件
  const files = fs.readdirSync(this.uploadDir);
  const projectFiles = files.filter(file => file.startsWith(`${projectId}_`));
  
  // 2. 删除所有匹配的文件
  for (const file of projectFiles) {
    const filePath = path.join(this.uploadDir, file);
    fs.unlinkSync(filePath);
  }
}
```

**调用时机**:
- ✅ 生成配音前（清理旧文件）
- ✅ TTS失败时（清理部分文件）

#### `cleanupAudioFile(audioPath: string)`
**功能**: 清理单个音频文件（物理删除）

**实现**:
```typescript
private cleanupAudioFile(audioPath: string): void {
  if (fs.existsSync(audioPath)) {
    fs.unlinkSync(audioPath);
  }
}
```

**调用时机**:
- ✅ 单个场景重新生成时

### 2. 数据库清理

#### 生成前清理
```typescript
// 清理数据库中的旧配音数据
await project.update({ 
  audioData: null,
  status: VideoProjectStatus.GENERATING_AUDIO 
});
```

#### 失败时清理
```typescript
// 清空失败的配音数据
await VideoProject.update({
  status: VideoProjectStatus.FAILED,
  errorMessage: error.message,
  audioData: null,
}, { where: { id: projectId } });
```

---

## 📊 清理流程图

### 正常流程
```
┌─────────────────┐
│ 用户请求生成配音 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 1️⃣ 清理旧文件    │ ← cleanupProjectAudio()
│   (物理删除)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2️⃣ 清空数据库    │ ← audioData = null
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3️⃣ 生成新配音    │ ← TTS V3服务
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4️⃣ 保存新文件    │ ← saveAudioFile()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5️⃣ 更新数据库    │ ← audioData = [...]
└─────────────────┘
```

### 失败流程
```
┌─────────────────┐
│ TTS生成失败      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 1️⃣ 清理部分文件  │ ← cleanupProjectAudio()
│   (物理删除)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2️⃣ 清空数据库    │ ← audioData = null
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3️⃣ 设置失败状态  │ ← status = FAILED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4️⃣ 返回错误信息  │ ← error.message
└─────────────────┘
```

---

## ✅ 优势

### 1. 存储空间优化
- 🎯 避免旧文件累积
- 🎯 失败文件自动清理
- 🎯 只保留当前有效文件

### 2. 数据一致性
- 🎯 物理文件与数据库同步
- 🎯 失败时自动重置状态
- 🎯 避免脏数据残留

### 3. 用户体验
- 🎯 重新生成时自动清理
- 🎯 失败后可以直接重试
- 🎯 无需手动清理旧文件

### 4. 系统稳定性
- 🎯 减少存储压力
- 🎯 避免文件冲突
- 🎯 清晰的错误处理

---

## 🔍 测试验证

### 测试场景1: 正常生成
```bash
# 1. 生成配音
POST /api/video-creation/projects/{projectId}/audio

# 2. 验证文件存在
ls uploads/video-audio/{projectId}_scene_*_audio.mp3

# 3. 验证数据库
SELECT audioData FROM video_projects WHERE id = {projectId}
```

### 测试场景2: 重新生成
```bash
# 1. 第一次生成
POST /api/video-creation/projects/{projectId}/audio

# 2. 第二次生成（应该清理旧文件）
POST /api/video-creation/projects/{projectId}/audio

# 3. 验证只有新文件
ls uploads/video-audio/{projectId}_scene_*_audio.mp3
# 应该只有最新的文件，旧文件已被删除
```

### 测试场景3: TTS失败
```bash
# 1. 模拟TTS失败（断网或API错误）
POST /api/video-creation/projects/{projectId}/audio

# 2. 验证文件已清理
ls uploads/video-audio/{projectId}_scene_*_audio.mp3
# 应该没有残留文件

# 3. 验证数据库状态
SELECT status, audioData FROM video_projects WHERE id = {projectId}
# status = 'failed', audioData = null
```

---

## 📝 代码示例

### 完整的生成流程
```typescript
async generateSceneAudio(
  scenes: VideoScene[],
  projectId: string,
  voiceStyle: string = 'alloy'
): Promise<SceneAudio[]> {
  try {
    // 1️⃣ 先清理该项目的旧音频文件
    await this.cleanupProjectAudio(projectId);
    
    // 2️⃣ 生成新配音
    const audioTasks = scenes.map(async (scene) => {
      const v3Result = await volcengineTTSV3BidirectionService.textToSpeech({
        text: scene.narration,
        speaker: mappedVoice,
        format: 'mp3',
      });
      
      // 保存音频文件
      const filename = `${projectId}_scene_${scene.sceneNumber}_audio.mp3`;
      const audioPath = await this.saveAudioFile(v3Result.audioBuffer, filename);
      
      return {
        sceneNumber: scene.sceneNumber,
        audioPath: audioPath,
        audioUrl: this.getAudioUrl(audioPath),
      };
    });
    
    // 3️⃣ 并行生成所有配音
    const results = await Promise.all(audioTasks);
    
    return results;
  } catch (error: any) {
    // 4️⃣ 生成失败时，清理已生成的部分文件
    await this.cleanupProjectAudio(projectId);
    throw new Error(`配音生成失败: ${error.message}`);
  }
}
```

---

## 🚀 未来优化

### 1. 定时清理任务
```typescript
// 每天凌晨清理超过7天的音频文件
cron.schedule('0 0 * * *', async () => {
  await cleanupOldAudioFiles(7); // 7天前的文件
});
```

### 2. 存储配额管理
```typescript
// 检查存储空间，超过限制时清理最旧的文件
if (getStorageUsage() > MAX_STORAGE) {
  await cleanupOldestFiles();
}
```

### 3. 云存储集成
```typescript
// 将音频文件上传到云存储（OSS/S3）
// 本地只保留临时文件
await uploadToCloudStorage(audioPath);
await cleanupLocalFile(audioPath);
```

---

## 📚 相关文档

- [视频创作功能文档](./VIDEO_CREATION_README.md)
- [TTS服务配置](./VIDEO_CREATION_ISSUES_TRACKING.md)
- [API文档](http://localhost:3000/api-docs)

---

**最后更新**: 2025-10-03  
**版本**: v1.0.0  
**状态**: ✅ 已实现并测试

