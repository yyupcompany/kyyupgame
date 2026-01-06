# API请求标准化迁移指南

本指南提供了在项目中标准化API请求实现的步骤和最佳实践。

## 存在的问题

目前项目中API请求实现存在以下问题：

1. **混用axios和request工具**：有些地方直接使用axios，有些地方使用自定义的request工具函数
2. **API类型不匹配**：`utils/request.ts`和`types/system.ts`中的`ApiResponse`类型定义不兼容
3. **硬编码端口**：在代码中直接硬编码端口号(如5176)
4. **不一致的错误处理**：不同地方使用不同的错误处理方式

## 迁移步骤

### 1. 使用统一的请求工具

```typescript
// ❌ 错误示例：直接使用axios
import axios from 'axios';

function getData() {
  return axios.get('/api/data')
    .then(response => response.data);
}

// ✅ 正确示例：使用request工具
import { get, post, put, del } from '@/utils/request';

function getData() {
  return get('/api/data');
}
```

### 2. 解决API类型不匹配问题

有四种解决方案，选择一种最适合你的场景：

#### 方案1：统一使用utils/request中的ApiResponse类型

```typescript
import type { ApiResponse } from '@/utils/request';

function getData(): Promise<ApiResponse<any>> {
  return get('/api/data');
}
```

#### 方案2：使用转换函数处理类型不匹配

```typescript
import { wrapApiFunction } from '@/api/fix-api-types';
import { get } from '@/utils/request';

// 原始函数
function getDataRaw(id: string) {
  return get(`/api/data/${id}`);
}

// 包装后函数，返回符合system.ApiResponse类型的结果
export const getData = wrapApiFunction(getDataRaw);
```

#### 方案3：使用类型断言

```typescript
import type { ApiResponse as SystemApiResponse } from '@/types/system';
import { get } from '@/utils/request';

function getData(id: string): Promise<SystemApiResponse<any>> {
  return get(`/api/data/${id}`) as Promise<SystemApiResponse<any>>;
}
```

### 3. 使用配置常量而非硬编码值

```typescript
// ❌ 错误示例：直接硬编码端口和URL
axios.get('http://localhost:5176/api/data');

// ✅ 正确示例：使用配置常量
import { API_CONFIG } from '@/utils/request-config';
import { get } from '@/utils/request';

// 使用相对路径，依赖Vite代理
get('/api/data');

// 或者使用构建函数生成完整URL
get(API_CONFIG.buildApiUrl('/api/data'));
```

### 4. 在API模块中使用正确的结构

```typescript
// ✅ 良好实践：接口定义在顶部
export interface DataItem {
  id: string;
  name: string;
}

// ✅ 良好实践：导出对象形式的API
export const dataApi = {
  getList(): Promise<ApiResponse<DataItem[]>> {
    return get('/api/data');
  },
  
  getItem(id: string): Promise<ApiResponse<DataItem>> {
    return get(`/api/data/${id}`);
  },
  
  createItem(data: Omit<DataItem, 'id'>): Promise<ApiResponse<DataItem>> {
    return post('/api/data', data);
  }
};

// ✅ 或者导出独立函数
export function getDataList(): Promise<ApiResponse<DataItem[]>> {
  return get('/api/data');
}

export function getDataItem(id: string): Promise<ApiResponse<DataItem>> {
  return get(`/api/data/${id}`);
}
```

## 最佳实践

### API模块组织

- **按功能模块组织**：将相关API函数放在同一个文件中
- **使用明确的命名**：函数名应明确表示操作，如`getUser`、`createUser`等
- **遵循RESTful风格**：使用`get`、`post`、`put`、`delete`等HTTP方法
- **导出接口定义**：在API模块中导出类型定义，方便组件使用

### 错误处理

- **利用内置错误处理**：`request`工具已经包含基本错误处理
- **组件中处理特殊错误**：
  ```typescript
  async function fetchData() {
    try {
      const response = await dataApi.getList();
      return response.data;
    } catch (error) {
      // 处理特殊错误
      console.error('获取数据失败:', error);
      return [];
    }
  }
  ```

### 授权与认证

- **不要在每个API调用中单独处理token**，使用拦截器统一处理
- **使用`AUTH_CONFIG`中的方法**处理token存储和获取

## 常见问题

### Q: 如何处理需要特殊headers的请求？

```typescript
import { get } from '@/utils/request';

function getFileData() {
  return get('/api/file', {}, {
    headers: {
      'Accept': 'application/octet-stream'
    },
    responseType: 'blob'
  });
}
```

### Q: 如何处理上传文件？

```typescript
import { post } from '@/utils/request';

function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
```

### Q: 如何在组件中使用API？

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { dataApi } from '@/api/data';

const data = ref([]);
const loading = ref(false);
const error = ref(null);

async function fetchData() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await dataApi.getList();
    data.value = response.data || [];
  } catch (err) {
    error.value = err.message || '加载数据失败';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>
``` 