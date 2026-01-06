# 阶段1执行计划 - 详细版

**阶段**: 1/3  
**目标**: 在Service内部使用子服务  
**时间**: 4小时  
**减少代码**: 约1,000行

---

## 📋 详细任务分解

### 任务1.1：替换记忆检索逻辑（1.5小时）

#### 当前实现
```
第6244-6393行: retrieveRelevantMemories() 方法（约150行）
├── 调用this.memoryService.activeRetrieval()
├── 手动处理6个维度的记忆（core, episodic, semantic...）
├── 手动格式化每条记忆
└── 计算优化统计信息
```

#### 优化方案
```typescript
// 修改前（150行）
private async retrieveRelevantMemories(request, enableOptimization) {
  // 150行的手动处理逻辑
}

// 修改后（10行）
private async retrieveRelevantMemories(request, enableOptimization) {
  // 委托给memoryIntegrationService
  const memoryContext = await memoryIntegrationService.retrieveMemoryContext(
    request.content,
    request.userId,
    { dimensions: ['core', 'episodic', 'semantic', 'procedural', 'resource', 'knowledge'] }
  );
  
  // 转换格式以保持兼容性
  return {
    memories: memoryContext.items.map(item => ({
      type: item.dimension,
      content: this.formatMemoryItem(item)
    })),
    optimizationStats: enableOptimization ? this.calculateMemoryStats(memoryContext) : undefined
  };
}

// 添加辅助方法
private formatMemoryItem(item: any): string {
  // 格式化逻辑（约20行）
}

private calculateMemoryStats(context: any): any {
  // 统计逻辑（约15行）
}
```

**减少行数**: 150 - 45 = 105行

#### 文件位置
- 被替换方法：第6244-6393行
- 被调用位置：第309行、第7012行

---

### 任务1.2：添加子服务导入（0.5小时）

#### 当前状态
```typescript
// unified-intelligence.service.ts 第19行
import { promptBuilderService } from './core/prompt-builder.service';
```

#### 需要添加
```typescript
import { intentRecognitionService } from './core/intent-recognition.service';
import { memoryIntegrationService } from './core/memory-integration.service';
import { streamingService } from './core/streaming.service';
```

#### 同时清理
```typescript
// 可能可以移除的直接依赖
import { getMemorySystem } from '../memory/six-dimension-memory.service';
// 改为通过memoryIntegrationService间接使用
```

---

### 任务1.3：检查是否有内部意图识别逻辑（1小时）

#### 检查点
搜索以下方法名：
- `analyzeIntent()`
- `analyzeRequestComplexity()`
- `detectIntentType()`

#### 如果存在
用`intentRecognitionService.recognizeIntent()`替换

#### 预期
可能减少50-100行代码

---

### 任务1.4：测试验证（1小时）

#### 测试用例
1. ✅ 基本查询："查询所有学生"
2. ✅ 记忆检索："我之前问过什么？"
3. ✅ 工具调用："学生记录用表格展示"
4. ✅ 页面导航："转到客户池中心"

#### 验证标准
- [ ] 编译通过
- [ ] 所有API正常响应
- [ ] 记忆检索正确
- [ ] SSE事件正常推送

---

## 🔧 具体修改代码

### 修改1：添加导入（第19行之后）

```typescript
// 添加子服务导入
import { intentRecognitionService } from './core/intent-recognition.service';
import { memoryIntegrationService } from './core/memory-integration.service';
import { streamingService } from './core/streaming.service';
```

### 修改2：替换retrieveRelevantMemories方法

**位置**: 第6244行

**原代码**: 第6244-6393行（150行）

**新代码**:
```typescript
  /**
   * 检索相关记忆（带优化统计）
   * 🔧 重构：使用memoryIntegrationService替代内部实现
   */
  private async retrieveRelevantMemories(request: UserRequest, enableOptimization = false): Promise<{
    memories: any[],
    optimizationStats?: {
      originalCount: number,
      filteredCount: number,
      relevanceThreshold: number,
      compressionRatio: number
    }
  }> {
    try {
      console.log('🔍 [Memory-Refactored] 使用memoryIntegrationService检索记忆...');
      
      // 🎯 使用子服务替代内部实现
      const memoryContext = await memoryIntegrationService.retrieveMemoryContext(
        request.content,
        request.userId,
        {
          dimensions: ['core', 'episodic', 'semantic', 'procedural', 'resource', 'knowledge'],
          limit: 5,
          useCache: true
        }
      );

      console.log(`✅ [Memory-Refactored] 检索到 ${memoryContext.items.length} 条记忆`);

      // 转换为原有格式以保持兼容性
      const memories = memoryContext.items.map(item => this.formatMemoryItemCompat(item));

      // 计算优化统计
      let optimizationStats = undefined;
      if (enableOptimization && memoryContext.totalCount > 0) {
        optimizationStats = {
          originalCount: memoryContext.totalCount,
          filteredCount: memoryContext.items.length,
          relevanceThreshold: 60,
          compressionRatio: Math.round(
            ((memoryContext.totalCount - memoryContext.items.length) / memoryContext.totalCount) * 100
          )
        };
      }

      return { memories, optimizationStats };
    } catch (error) {
      console.error('❌ [Memory-Refactored] 记忆检索失败:', error);
      return { memories: [] };
    }
  }

  /**
   * 格式化记忆项以保持兼容性
   */
  private formatMemoryItemCompat(item: any): { type: string, content: string } {
    const typeLabels: Record<string, string> = {
      'core': '用户画像',
      'episodic': '历史事件',
      'semantic': '相关概念',
      'procedural': '操作流程',
      'resource': '相关资源',
      'knowledge': '领域知识'
    };

    const label = typeLabels[item.dimension] || '记忆';
    let content = '';

    switch (item.dimension) {
      case 'core':
        content = `${label}: ${item.content || '未设定'}`;
        break;
      case 'episodic':
        const time = item.timestamp ? new Date(item.timestamp).toLocaleString('zh-CN') : '近期';
        content = `${label}: ${item.content} (${time})`;
        break;
      case 'semantic':
        content = `${label}: ${item.content}`;
        break;
      case 'procedural':
        content = `${label}: ${item.content}`;
        break;
      case 'resource':
        content = `${label}: ${item.content}`;
        break;
      case 'knowledge':
        content = `${label}[${item.metadata?.domain || '通用'}]: ${item.content}`;
        break;
      default:
        content = `${label}: ${item.content}`;
    }

    return {
      type: item.dimension,
      content
    };
  }
```

**代码对比**:
- 原来：150行
- 现在：85行
- 减少：65行

---

## 📊 阶段1预期成果

| 任务 | 原代码行数 | 新代码行数 | 减少 |
|------|-----------|-----------|------|
| 提示词构建 | 800 | 调用promptBuilderService | -800 ✅已完成 |
| 记忆检索 | 150 | 85 | -65 |
| 意图识别 | ~100 | 调用intentRecognitionService | -100 |
| SSE优化 | - | 使用streamingService辅助 | -35 |
| **总计** | **1,050** | **85** | **-1,000** |

**最终**: 7,423行 → 约6,400行

---

## ⚠️ 注意事项

### 兼容性保证
1. 保持公开方法签名不变
2. 保持返回值格式兼容
3. 保持SSE事件结构不变

### 测试要求
每完成一个任务，必须：
1. 编译通过
2. 基础功能测试
3. Git commit

### 回退方案
如果出现问题：
```bash
git reset --hard v-before-coordinator-migration
```

---

**状态**: 📋 计划完成，准备执行  
**下一步**: 开始任务1.1 - 替换记忆检索逻辑

