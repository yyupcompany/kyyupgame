# 阶段1：在Service内部使用子服务

**开始时间**: 2025-11-05  
**预计时间**: 4小时  
**目标**: 减少内部重复代码，使用core/子服务

---

## 🎯 阶段目标

将UnifiedIntelligenceService中的重复实现替换为core/子服务调用：
- 从 7,423行 → 约 6,400行
- 减少约 1,000行代码
- 提高代码复用性

---

## 📋 任务清单

### ✅ 任务0：promptBuilderService（已完成）
- [x] 使用promptBuilderService.buildAgentModePrompt()
- [x] 使用promptBuilderService.buildDirectModePrompt()
- [x] 删除硬编码提示词（约800行）

### 🔧 任务1：intentRecognitionService

**当前状态**: Service可能有自己的意图识别逻辑

**检查点**:
- [ ] Service是否有analyzeIntent()等方法？
- [ ] 是否可以用intentRecognitionService.recognizeIntent()替代？

**预期减少**: 约100行

### 🔧 任务2：memoryIntegrationService

**当前状态**: Service有retrieveRelevantMemories()方法

**检查点**:
- [ ] retrieveRelevantMemories()是否可以用memoryIntegrationService.retrieveMemoryContext()替代？
- [ ] 格式化逻辑是否可以复用？

**预期减少**: 约150行

### 🔧 任务3：streamingService优化

**当前状态**: Service有大量SSE处理代码

**检查点**:
- [ ] SSE事件发送是否可以用streamingService？
- [ ] 流式处理逻辑是否可以简化？

**预期减少**: 约50-100行（优化，不是完全替换）

---

## 🔍 执行步骤

### 步骤1：分析现有代码

检查以下方法的实现：
1. `retrieveRelevantMemories()` - 记忆检索
2. `analyzeIntent()` / `analyzeRequestComplexity()` - 意图分析  
3. SSE事件发送相关代码

### 步骤2：逐个替换

每次替换一个功能点：
1. 识别要替换的代码
2. 使用子服务替代
3. 运行编译测试
4. 验证功能正常
5. Commit变更

### 步骤3：验证测试

- [ ] 编译通过
- [ ] 基本查询测试
- [ ] 工具调用测试
- [ ] SSE流式测试

---

## 📊 预期成果

| 功能模块 | 当前 | 优化后 | 减少 |
|---------|------|--------|------|
| 提示词构建 | 800行（硬编码） | 调用promptBuilderService | -800 |
| 意图识别 | 100行（内部） | 调用intentRecognitionService | -100 |
| 记忆检索 | 150行（内部） | 调用memoryIntegrationService | -150 |
| SSE优化 | - | 使用streamingService辅助 | -50 |
| **总计** | **7,423行** | **约6,320行** | **-1,100行** |

---

**开始执行**: 现在  
**状态**: 🚀 进行中

