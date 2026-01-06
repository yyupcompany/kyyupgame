# UnifiedIntelligenceCoordinator 迁移计划

**创建日期**: 2025-11-05  
**目标**: 从UnifiedIntelligenceService切换到UnifiedIntelligenceCoordinator  
**预期收益**: 减少6,900行代码（93%）

---

## 📋 当前状态分析

### UnifiedIntelligenceService (旧版，7423行)

**被调用的公开方法**:
1. `processUserRequest(request)` - 基本请求处理
2. `processUserRequestWithProgress(request, progressCallback)` - **SSE流式处理（关键）**
3. `getOrganizationStatusText(context)` - 获取机构现状

**使用位置**:
- `server/src/routes/ai/unified-intelligence.routes.ts` （主要路由）
- `server/src/routes/ai/unified-stream.routes.ts` （流式路由）

### UnifiedIntelligenceCoordinator (新版，496行)

**已实现的方法**:
1. `processRequest(request)` - ✅ 基本请求处理
2. `processStreamRequest(request, res)` - ⚠️ 流式处理（但不是带进度回调）

**缺失的方法**:
1. ❌ `processUserRequestWithProgress(request, progressCallback)` - **关键方法缺失**
2. ❌ `getOrganizationStatusText(context)` - 辅助方法缺失

---

## 🎯 功能对比

| 功能 | UnifiedIntelligenceService | UnifiedIntelligenceCoordinator | 状态 |
|------|---------------------------|--------------------------------|------|
| 基本请求处理 | processUserRequest | processRequest | ✅ 已实现 |
| SSE流式处理 | processUserRequestWithProgress | ❌ 缺失 | 🔴 需要补充 |
| 流式请求 | - | processStreamRequest | ⚠️ 实现不同 |
| 机构现状 | getOrganizationStatusText | ❌ 缺失 | 🟡 需要补充 |

---

## 🔧 迁移步骤

### 阶段1：功能补充（预计2小时）

#### 任务1.1：添加processUserRequestWithProgress方法
**目标**: 支持SSE流式处理和进度回调

**实现要点**:
- 调用promptBuilderService.buildAgentModePrompt()构建提示词
- 调用aiBridgeService.generateChatCompletionStream()获取流式响应
- 通过progressCallback发送SSE事件

#### 任务1.2：添加getOrganizationStatusText方法
**目标**: 获取机构现状数据

**实现要点**:
- 复用UnifiedIntelligenceService的现有实现
- 或者委托给专门的OrganizationService

### 阶段2：路由切换（预计1小时）

#### 任务2.1：修改unified-intelligence.routes.ts
```typescript
// 修改前
import unifiedIntelligenceService from '../../services/ai-operator/unified-intelligence.service';

// 修改后
import { unifiedIntelligenceCoordinator } from '../../services/ai-operator/unified-intelligence-coordinator.service';
```

#### 任务2.2：调整方法调用
```typescript
// 修改前
await unifiedIntelligenceService.processUserRequestWithProgress(...)

// 修改后
await unifiedIntelligenceCoordinator.processUserRequestWithProgress(...)
```

### 阶段3：测试验证（预计1小时）

#### 测试用例
1. ✅ 基本查询："查询所有学生"
2. ✅ 表格展示："学生记录用表格展示"
3. ✅ 页面导航："转到客户池中心"
4. ✅ 复杂任务："创建亲子运动会活动"
5. ✅ SSE流式："查询班级数据"（检查进度回调）

### 阶段4：废弃标记（预计0.5小时）

#### 任务4.1：标记UnifiedIntelligenceService
```typescript
/**
 * @deprecated 此服务已废弃，请使用UnifiedIntelligenceCoordinator
 * @see UnifiedIntelligenceCoordinator
 */
export class UnifiedIntelligenceService {
  // ...
}
```

#### 任务4.2：添加迁移说明
在文件顶部添加迁移指南

---

## ⚠️ 风险评估

### 高风险点

1. **SSE流式处理** 🔴
   - 风险：Coordinator的processStreamRequest实现可能不完整
   - 缓解：仔细对比两个实现，确保事件发送完整

2. **进度回调机制** 🔴
   - 风险：路由依赖processUserRequestWithProgress
   - 缓解：必须完整实现此方法

3. **工具执行逻辑** 🟡
   - 风险：Coordinator使用toolOrchestratorService，可能行为不同
   - 缓解：测试各种工具调用场景

### 低风险点

1. **意图识别** ✅
   - Coordinator使用intentRecognitionService
   - 已验证工作正常

2. **记忆集成** ✅
   - Coordinator使用memoryIntegrationService
   - 已验证工作正常

---

## 📊 预期收益

### 代码质量

| 指标 | 当前 | 优化后 | 改善 |
|------|------|--------|------|
| 主文件大小 | 7423行 | 496行 | -93% ✅ |
| 方法数量 | 97个 | ~15个 | -85% ✅ |
| 职责数量 | 8个 | 1个 | -88% ✅ |
| 依赖复杂度 | 高 | 低 | 显著改善 ✅ |

### 维护性

- ✅ 修改单个功能只需改对应子服务
- ✅ 测试更容易（可以mock子服务）
- ✅ 代码冲突减少
- ✅ 新人上手更快

---

## 🚀 执行时间表

### 第一天（4小时）
- [x] 09:00-10:00  分析现状，制定计划
- [ ] 10:00-12:00  补充缺失方法
- [ ] 13:00-14:00  切换路由引用
- [ ] 14:00-15:00  测试验证

### 第二天（验收）
- [ ] 完整回归测试
- [ ] 性能对比测试
- [ ] 文档更新

---

## 📝 检查清单

### 开发前
- [x] 创建git回退点
- [x] 分析功能差异
- [x] 制定迁移计划

### 开发中
- [ ] 补充processUserRequestWithProgress方法
- [ ] 补充getOrganizationStatusText方法
- [ ] 修改路由引用
- [ ] 单元测试通过

### 开发后
- [ ] E2E测试通过
- [ ] 性能测试通过
- [ ] 代码Review
- [ ] 文档更新
- [ ] Git提交

---

## 🔄 回退方案

如果出现问题，执行：

```bash
# 方案1：回退到标签
git reset --hard v-before-coordinator-migration

# 方案2：回退单个文件
git checkout v-before-coordinator-migration -- server/src/routes/ai/unified-intelligence.routes.ts

# 方案3：撤销最近的提交
git revert HEAD
```

---

**计划创建时间**: 2025-11-05  
**预计完成时间**: 2025-11-05  
**状态**: 📋 准备就绪，开始执行

