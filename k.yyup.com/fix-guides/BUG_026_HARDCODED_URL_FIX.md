# Bug #26 修复指南 - 硬编码的域名和路径

## 问题描述
前端代码中存在硬编码的域名、API路径、静态资源路径等，导致部署和配置困难。

## 严重级别
**中**

## 受影响的文件
- `client/src/utils/request.ts`
- `client/src/api/endpoints/`
- 多个组件文件

## 问题分析

1. **部署困难**: 硬编码域名导致不同环境部署困难
2. **维护困难**: 路径变更需要修改多处代码
3. **环境切换**: 开发/测试/生产环境切换麻烦
4. **配置混乱**: 配置分散在代码各处

## 修复方案（使用环境变量，提供fallback）

### 步骤 1: 创建环境变量类型定义

在 `client/src/types/env.types.ts` 创建类型定义：

```typescript
/**
 * 环境变量类型定义
 */

/**
 * 应用环境
 */
export type AppEnvironment = 'development' | 'test' | 'staging' | 'production';

/**
 * API配置
 */
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  apiVersion?: string;
}

/**
 * OSS配置
 */
export interface OssConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  endpoint?: string;
}

/**
 * 应用配置
 */
export interface AppConfig {
  // 环境信息
  environment: AppEnvironment;
  version: string;
  buildTime: string;

  // API配置
  api: ApiConfig;

  // OSS配置
  oss: OssConfig;

  // 功能开关
  features: {
    enableAI: boolean;
    enableUpload: boolean;
    enableWebSocket: boolean;
  };

  // 路径配置
  paths: {
    upload: string;
    static: string;
    assets: string;
  };

  // 第三方服务
  services: {
    analytics?: string;
    monitoring?: string;
    cdn?: string;
  };
}
```

### 步骤 2: 创建配置管理

在 `client/src/config/app.config.ts` 创建配置文件：

```typescript
import type { AppConfig, AppEnvironment } from '../types/env.types';

/**
 * 获取环境变量，带默认值
 */
function getEnvVar(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * 获取布尔环境变量
 */
function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * 获取数字环境变量
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 确定当前环境
 */
function getEnvironment(): AppEnvironment {
  const env = getEnvVar('VITE_ENV', 'development');

  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  if (env === 'staging') return 'staging';
  return 'development';
}

/**
 * 获取API基础URL
 */
function getApiBaseURL(): string {
  // 优先使用环境变量
  const envURL = getEnvVar('VITE_API_BASE_URL', '');

  if (envURL) {
    return envURL;
  }

  // 根据环境自动配置
  const environment = getEnvironment();

  switch (environment) {
    case 'production':
      return getEnvVar('VITE_API_PROD_URL', 'https://api.example.com');
    case 'staging':
      return getEnvVar('VITE_API_STAGING_URL', 'https://api-staging.example.com');
    case 'test':
      return getEnvVar('VITE_API_TEST_URL', 'https://api-test.example.com');
    case 'development':
    default:
      return getEnvVar('VITE_API_DEV_URL', '/api');
  }
}

/**
 * 应用配置
 */
export const appConfig: AppConfig = {
  // 环境信息
  environment: getEnvironment(),
  version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  buildTime: getEnvVar('VITE_BUILD_TIME', new Date().toISOString()),

  // API配置
  api: {
    baseURL: getApiBaseURL(),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
    apiVersion: getEnvVar('VITE_API_VERSION', 'v1')
  },

  // OSS配置
  oss: {
    region: getEnvVar('VITE_OSS_REGION', 'oss-cn-hangzhou'),
    bucket: getEnvVar('VITE_OSS_BUCKET', ''),
    accessKeyId: getEnvVar('VITE_OSS_ACCESS_KEY_ID', ''),
    accessKeySecret: getEnvVar('VITE_OSS_ACCESS_KEY_SECRET', ''),
    endpoint: getEnvVar('VITE_OSS_ENDPOINT', '')
  },

  // 功能开关
  features: {
    enableAI: getEnvBool('VITE_ENABLE_AI', true),
    enableUpload: getEnvBool('VITE_ENABLE_UPLOAD', true),
    enableWebSocket: getEnvBool('VITE_ENABLE_WEBSOCKET', true)
  },

  // 路径配置
  paths: {
    upload: getEnvVar('VITE_UPLOAD_PATH', '/api/upload'),
    static: getEnvVar('VITE_STATIC_PATH', '/static'),
    assets: getEnvVar('VITE_ASSETS_PATH', '/assets')
  },

  // 第三方服务
  services: {
    analytics: getEnvVar('VITE_ANALYTICS_URL', ''),
    monitoring: getEnvVar('VITE_MONITORING_URL', ''),
    cdn: getEnvVar('VITE_CDN_URL', '')
  }
};

/**
 * 获取完整URL（相对于API基础URL）
 */
export function getApiUrl(path: string): string {
  // 移除开头的斜杠
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  // 确保baseURL没有末尾斜杠
  const baseURL = appConfig.api.baseURL.endsWith('/')
    ? appConfig.api.baseURL.slice(0, -1)
    : appConfig.api.baseURL;

  return `${baseURL}/${cleanPath}`;
}

/**
 * 获取静态资源URL
 */
export function getStaticUrl(path: string): string {
  const cdnUrl = appConfig.services.cdn;
  const staticPath = appConfig.paths.static;

  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const base = cdnUrl || staticPath;

  return `${base}/${cleanPath}`;
}

/**
 * 获取上传URL
 */
export function getUploadUrl(): string {
  return getApiUrl(appConfig.paths.upload);
}

/**
 * 获取OSS URL
 */
export function getOssUrl(path: string): string {
  const { endpoint, bucket } = appConfig.oss;

  if (!endpoint) {
    return path; // 返回相对路径
  }

  return `${endpoint.replace('${bucket}', bucket)}/${path}`;
}
```

### 步骤 3: 更新request.ts

**修复前：**
```typescript
// ❌ 硬编码的API基础URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000
});
```

**修复后：**
```typescript
import { appConfig } from '../config/app.config';

/**
 * 创建axios实例
 */
const axiosInstance = axios.create({
  baseURL: appConfig.api.baseURL,
  timeout: appConfig.api.timeout
});
```

### 步骤 4: 创建API端点配置

在 `client/src/config/api-endpoints.config.ts` 创建端点配置：

```typescript
import { getApiUrl } from './app.config';

/**
 * API端点配置
 * 集中管理所有API路径
 */
export const apiEndpoints = {
  // 认证相关
  auth: {
    login: () => getApiUrl('/auth/login'),
    logout: () => getApiUrl('/auth/logout'),
    refresh: () => getApiUrl('/auth/refresh'),
    register: () => getApiUrl('/auth/register'),
    verify: () => getApiUrl('/auth/verify')
  },

  // 用户相关
  users: {
    list: () => getApiUrl('/users'),
    detail: (id: number) => getApiUrl(`/users/${id}`),
    create: () => getApiUrl('/users'),
    update: (id: number) => getApiUrl(`/users/${id}`),
    delete: (id: number) => getApiUrl(`/users/${id}`),
    profile: () => getApiUrl('/users/profile'),
    changePassword: () => getApiUrl('/users/change-password')
  },

  // 学生相关
  students: {
    list: () => getApiUrl('/students'),
    detail: (id: number) => getApiUrl(`/students/${id}`),
    create: () => getApiUrl('/students'),
    update: (id: number) => getApiUrl(`/students/${id}`),
    delete: (id: number) => getApiUrl(`/students/${id}`),
    assessment: (id: number) => getApiUrl(`/students/${id}/assessment`),
    growth: (id: number) => getApiUrl(`/students/${id}/growth`)
  },

  // 教师相关
  teachers: {
    list: () => getApiUrl('/teachers'),
    detail: (id: number) => getApiUrl(`/teachers/${id}`),
    create: () => getApiUrl('/teachers'),
    update: (id: number) => getApiUrl(`/teachers/${id}`),
    delete: (id: number) => getApiUrl(`/teachers/${id}`),
    classes: (id: number) => getApiUrl(`/teachers/${id}/classes`)
  },

  // 班级相关
  classes: {
    list: () => getApiUrl('/classes'),
    detail: (id: number) => getApiUrl(`/classes/${id}`),
    create: () => getApiUrl('/classes'),
    update: (id: number) => getApiUrl(`/classes/${id}`),
    delete: (id: number) => getApiUrl(`/classes/${id}`),
    students: (id: number) => getApiUrl(`/classes/${id}/students`),
    teachers: (id: number) => getApiUrl(`/classes/${id}/teachers`)
  },

  // 活动相关
  activities: {
    list: () => getApiUrl('/activities'),
    detail: (id: number) => getApiUrl(`/activities/${id}`),
    create: () => getApiUrl('/activities'),
    update: (id: number) => getApiUrl(`/activities/${id}`),
    delete: (id: number) => getApiUrl(`/activities/${id}`),
    register: (id: number) => getApiUrl(`/activities/${id}/register`)
  },

  // AI相关
  ai: {
    query: () => getApiUrl('/ai/query'),
    analyze: () => getApiUrl('/ai/analyze'),
    chat: () => getApiUrl('/ai/chat'),
    assistant: () => getApiUrl('/ai/assistant'),
    smartAssign: () => getApiUrl('/ai/smart-assign')
  },

  // 上传相关
  upload: {
    image: () => getApiUrl('/upload/image'),
    file: () => getApiUrl('/upload/file'),
    video: () => getApiUrl('/upload/video'),
    oss: () => getApiUrl('/upload/oss')
  },

  // 统计相关
  statistics: {
    dashboard: () => getApiUrl('/statistics/dashboard'),
    user: () => getApiUrl('/statistics/user'),
    activity: () => getApiUrl('/statistics/activity'),
    enrollment: () => getApiUrl('/statistics/enrollment')
  }
};
```

### 步骤 5: 在组件中使用

```vue
<script setup lang="ts">
import { apiEndpoints } from '@/config/api-endpoints.config';
import axios from '@/utils/request';

export default {
  data() {
    return {
      users: []
    };
  },

  methods: {
    async fetchUsers() {
      // 使用配置的端点
      const response = await axios.get(apiEndpoints.users.list());
      this.users = response.data;
    },

    async createUser(userData: any) {
      const response = await axios.post(
        apiEndpoints.users.create(),
        userData
      );
      return response.data;
    },

    async getUserDetail(id: number) {
      const response = await axios.get(
        apiEndpoints.users.detail(id)
      );
      return response.data;
    },

    async uploadImage(file: File) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        apiEndpoints.upload.image(),
        formData
      );
      return response.data;
    }
  }
};
</script>
```

### 步骤 6: 环境变量配置

在 `client/.env` 中添加默认配置：

```bash
# ================================
# 环境配置
# ================================

# 环境 (development|test|staging|production)
VITE_ENV=development

# 应用版本
VITE_APP_VERSION=1.0.0

# 构建时间（自动生成）
VITE_BUILD_TIME=

# ================================
# API配置
# ================================

# API基础URL（留空则使用默认值）
VITE_API_BASE_URL=/api

# API超时时间（毫秒）
VITE_API_TIMEOUT=30000

# API版本
VITE_API_VERSION=v1

# 开发环境API
VITE_API_DEV_URL=/api

# 测试环境API
VITE_API_TEST_URL=https://api-test.example.com

# 预发布环境API
VITE_API_STAGING_URL=https://api-staging.example.com

# 生产环境API
VITE_API_PROD_URL=https://api.example.com

# ================================
# OSS配置
# ================================

# OSS区域
VITE_OSS_REGION=oss-cn-hangzhou

# OSS Bucket
VITE_OSS_BUCKET=

# OSS Access Key ID
VITE_OSS_ACCESS_KEY_ID=

# OSS Access Key Secret
VITE_OSS_ACCESS_KEY_SECRET=

# OSS Endpoint
VITE_OSS_ENDPOINT=https://${bucket}.oss-cn-hangzhou.aliyuncs.com

# ================================
# 功能开关
# ================================

# 启用AI功能
VITE_ENABLE_AI=true

# 启用上传功能
VITE_ENABLE_UPLOAD=true

# 启用WebSocket
VITE_ENABLE_WEBSOCKET=true

# ================================
# 路径配置
# ================================

# 上传路径
VITE_UPLOAD_PATH=/api/upload

# 静态资源路径
VITE_STATIC_PATH=/static

# 资源路径
VITE_ASSETS_PATH=/assets

# ================================
# 第三方服务
# ================================

# CDN URL
VITE_CDN_URL=

# 分析服务URL
VITE_ANALYTICS_URL=

# 监控服务URL
VITE_MONITORING_URL=
```

### 步骤 7: 创建环境特定配置文件

**开发环境 (`.env.development`):**
```bash
VITE_ENV=development
VITE_API_BASE_URL=/api
VITE_ENABLE_AI=true
```

**测试环境 (`.env.test`):**
```bash
VITE_ENV=test
VITE_API_BASE_URL=https://api-test.example.com
VITE_ENABLE_AI=true
```

**预发布环境 (`.env.staging`):**
```bash
VITE_ENV=staging
VITE_API_BASE_URL=https://api-staging.example.com
VITE_ENABLE_AI=true
```

**生产环境 (`.env.production`):**
```bash
VITE_ENV=production
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_AI=false
```

### 步骤 8: 创建配置切换工具

在 `client/src/utils/config-debug.ts` 创建调试工具：

```typescript
import { appConfig } from '../config/app.config';

/**
 * 打印当前配置（开发环境）
 */
export function printConfig(): void {
  if (import.meta.env.DEV) {
    console.group('🔧 应用配置');
    console.log('环境:', appConfig.environment);
    console.log('版本:', appConfig.version);
    console.log('API基础URL:', appConfig.api.baseURL);
    console.log('API超时:', appConfig.api.timeout);
    console.log('OSS区域:', appConfig.oss.region);
    console.log('功能开关:', appConfig.features);
    console.log('路径配置:', appConfig.paths);
    console.groupEnd();
  }
}

/**
 * 检查配置
 */
export function checkConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查必需的配置
  if (!appConfig.api.baseURL) {
    errors.push('API基础URL未配置');
  }

  if (appConfig.features.enableUpload && !appConfig.paths.upload) {
    errors.push('上传功能已启用但上传路径未配置');
  }

  if (appConfig.features.enableAI && !appConfig.oss.accessKeyId) {
    errors.push('AI功能已启用但OSS配置不完整');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 动态更新配置（仅开发环境）
 */
export function updateConfig(key: string, value: any): boolean {
  if (import.meta.env.PROD) {
    console.warn('生产环境不允许动态更新配置');
    return false;
  }

  // 注意：这只是更新内存中的配置，不会持久化
  (appConfig as any)[key] = value;
  console.log(`✅ 配置已更新: ${key} =`, value);
  return true;
}
```

## 本地调试保证

### 默认值fallback

```typescript
// 所有环境变量都有默认值
const baseURL = getEnvVar('VITE_API_BASE_URL', '/api');

// 开发环境自动使用相对路径
const baseURL = environment === 'development'
  ? '/api'
  : getEnvVar('VITE_API_BASE_URL', 'https://api.example.com');
```

- ✅ 不设置任何环境变量也能正常工作
- ✅ 开发环境使用相对路径
- ✅ 本地调试无需额外配置

### 开发环境配置

```bash
# .env.development
VITE_ENV=development
VITE_API_BASE_URL=/api  # 相对路径，使用代理
```

- ✅ 使用Vite代理
- ✅ 避免CORS问题
- ✅ 热更新正常工作

## 验证步骤

### 1. 测试默认配置

```bash
# 不设置任何环境变量
npm run dev

# 检查控制台，应该使用默认配置
```

### 2. 测试环境切换

```bash
# 开发环境
npm run dev

# 构建生产版本
npm run build
npm run preview

# 检查API URL是否正确
```

### 3. 测试配置工具

```javascript
// 在浏览器控制台测试
import { printConfig, checkConfig } from '@/utils/config-debug';

printConfig();
checkConfig();
```

### 4. 测试API端点

```javascript
import { apiEndpoints } from '@/config/api-endpoints.config';

console.log(apiEndpoints.users.list());      // /api/users
console.log(apiEndpoints.users.detail(1));   // /api/users/1
console.log(apiEndpoints.upload.image());    // /api/upload/image
```

### 5. 测试动态配置（仅开发）

```javascript
import { updateConfig } from '@/utils/config-debug';

updateConfig('api', { baseURL: '/new-api' });
```

## 回滚方案

如果配置导致问题：

1. **使用硬编码值**：
   ```typescript
   const baseURL = 'http://localhost:3000/api';
   ```

2. **恢复旧的request.ts**：
   ```typescript
   const axiosInstance = axios.create({
     baseURL: 'http://localhost:3000/api',
     timeout: 30000
   });
   ```

3. **禁用配置系统**：
   ```typescript
   // 直接使用环境变量
   const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
   ```

## 修复完成检查清单

- [ ] 环境变量类型定义已创建
- [ ] 配置管理已创建
- [ ] request.ts已更新
- [ ] API端点配置已创建
- [ ] 环境变量文件已配置
- [ ] 默认值已测试
- [ ] 环境切换已测试
- [ ] 配置工具已创建
- [ ] 本地调试正常工作

## 风险评估

- **风险级别**: 低
- **影响范围**: API调用和资源路径
- **回滚难度**: 低（恢复硬编码值）
- **本地调试影响**: 无（默认值保证可用）

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
