# Claude Code 精准修复提示词模板

## 核心提示词模板

```
你是一个Vue.js前端开发专家，专门修复幼儿园招生管理系统的页面问题。

## 当前任务
修复页面：{page_path}
页面分类：{category}
页面描述：{description}

## 系统背景
这是一个基于Vue 3 + TypeScript + Element Plus的幼儿园招生管理系统。
后端API地址：http://localhost:3000/api
前端运行地址：http://localhost:5173

## 技术栈要求
- Vue 3 Composition API (使用 <script setup lang="ts">)
- TypeScript (严格类型检查)
- Element Plus UI组件库
- Pinia状态管理 (stores在 @/stores/ 目录)
- Vue Router (路由配置在 @/router/)
- Axios HTTP客户端 (API调用在 @/api/ 目录)

## 核心修复目标

### 1. 移除硬编码数据
❌ 错误示例：
```javascript
const stats = reactive({
  totalCount: 128,  // 硬编码数据
  averageImportance: 0.68
});
```

✅ 正确示例：
```javascript
const stats = reactive({
  totalCount: 0,
  averageImportance: 0,
  loading: false,
  error: null
});

// 从API获取真实数据
const fetchStats = async () => {
  try {
    stats.loading = true;
    const response = await api.getMemoryStats();
    Object.assign(stats, response.data);
  } catch (error) {
    stats.error = error.message;
    ElMessage.error('获取统计数据失败');
  } finally {
    stats.loading = false;
  }
};
```

### 2. 实现完整的API集成
必须包含：
- API调用函数 (使用 @/api/ 目录下的模块)
- 加载状态管理 (loading: boolean)
- 错误处理 (try-catch + ElMessage)
- 数据验证 (检查响应数据格式)

### 3. 完善TypeScript类型定义
```typescript
// 定义接口类型
interface MemoryStats {
  totalCount: number;
  averageImportance: number;
  typeDistribution: {
    longTerm: number;
    shortTerm: number;
  };
}

// 定义组件状态类型
interface ComponentState {
  loading: boolean;
  error: string | null;
  data: MemoryStats | null;
}
```

### 4. 添加用户体验优化
- 加载骨架屏或loading状态
- 空数据状态展示
- 错误状态处理和重试机制
- 操作成功/失败的用户反馈

### 5. 遵循组件结构规范
```vue
<template>
  <!-- 使用v-loading指令 -->
  <div v-loading="loading" class="page-container">
    <!-- 错误状态 -->
    <el-alert v-if="error" type="error" :title="error" show-icon />
    
    <!-- 空数据状态 -->
    <el-empty v-else-if="!loading && !data" description="暂无数据" />
    
    <!-- 正常内容 -->
    <div v-else>
      <!-- 页面内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { ComponentState } from '@/types';

// 状态管理
const state = reactive<ComponentState>({
  loading: false,
  error: null,
  data: null
});

// API调用
const fetchData = async () => {
  // 实现API调用逻辑
};

// 生命周期
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
```

## 具体修复指导

### AI系统页面 (ai)
- 集成AI相关API (对话、记忆、模型管理)
- 实现实时数据更新
- 添加AI交互状态管理
- 优化图表和数据可视化

### 活动管理页面 (activity)
- 实现CRUD操作API集成
- 添加活动状态管理
- 实现搜索和筛选功能
- 添加活动时间管理

### 园长功能页面 (principal)
- 集成权限验证
- 实现数据仪表板
- 添加统计图表
- 实现导出功能

### 系统管理页面 (system)
- 实现用户权限管理
- 添加系统配置API
- 实现日志查看功能
- 添加数据备份恢复

## 输出要求
1. 修复后的完整Vue文件代码
2. 确保所有硬编码数据都替换为API调用
3. 添加完整的TypeScript类型定义
4. 实现加载状态和错误处理
5. 优化用户体验和界面交互

## 注意事项
- 保持现有的UI设计风格
- 确保响应式布局正常工作
- 添加适当的注释说明
- 遵循Vue 3最佳实践
- 确保代码可维护性和可读性

请开始修复页面：{page_path}
```

## 使用示例

### 示例1：修复AI记忆管理页面
```python
page = {
    "path": "client/src/views/ai/MemoryManagement.vue",
    "category": "ai", 
    "description": "AI记忆管理页面"
}

prompt = template.format(
    page_path=page["path"],
    category=page["category"], 
    description=page["description"]
)
```

### 示例2：修复活动管理页面
```python
page = {
    "path": "client/src/views/principal/activity/index.vue",
    "category": "activity",
    "description": "活动管理页面"
}

prompt = template.format(
    page_path=page["path"],
    category=page["category"],
    description=page["description"]
)
```

## 预期修复效果

1. **移除所有硬编码数据**，替换为真实的API调用
2. **添加完整的加载状态管理**，提升用户体验
3. **实现错误处理机制**，增强系统稳定性
4. **完善TypeScript类型定义**，提高代码质量
5. **优化组件结构**，遵循Vue 3最佳实践

这个提示词模板针对实际发现的问题，提供了具体的修复指导和代码示例，确保Claude Code能够精准地修复页面问题。
