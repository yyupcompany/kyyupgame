# 幼儿园招生管理系统前端

## 项目简介
幼儿园招生管理系统前端是一个基于Vue 3、TypeScript和Element Plus开发的管理系统，主要功能包括招生计划管理、活动管理、入学申请管理、咨询管理、营销活动管理和数据分析等模块，为幼儿园招生工作提供全方位数字化支持。

## 技术栈
- Vue 3
- TypeScript
- Element Plus
- Pinia (状态管理)
- Vue Router 4
- Axios
- ECharts
- Vite

## 开发环境
- Node.js >= 16.0.0
- npm >= 7.0.0

## 项目结构
```
client/
├── src/
│   ├── api/             # API接口
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   ├── layouts/         # 布局组件
│   ├── pages/           # 页面
│   ├── router/          # 路由配置
│   ├── stores/          # 状态管理
│   ├── styles/          # 全局样式
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── public/              # 静态资源
├── .env                 # 环境变量
├── index.html           # HTML模板
├── vite.config.ts       # Vite配置
└── tsconfig.json        # TypeScript配置
```

## 安装与运行
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行TypeScript检查
npm run type-check
```

## 功能模块
1. 招生计划与名额管理
2. 活动管理
3. 入学申请与录取管理
4. 咨询管理与跟进
5. 营销活动与海报管理
6. 广告管理与数据分析

## 开发规范
- 遵循Vue 3组件风格指南
- 使用TypeScript进行类型检查
- 使用Pinia进行状态管理
- 使用Element Plus组件库
- 采用响应式设计，适配不同尺寸屏幕
- 代码提交前运行测试确保功能正常 

## API调用指南

本项目使用集中式管理API端点的方式，避免硬编码API路径。所有API端点都定义在`src/api/endpoints.ts`文件中。

### 使用示例

```typescript
// 导入API端点
import { DASHBOARD_ENDPOINTS } from '@/api/endpoints';
import request from '@/utils/request';

// 使用API端点常量发起请求
export const getDashboardStats = () => {
  return request({
    url: DASHBOARD_ENDPOINTS.STATS,
    method: 'get'
  });
};
```

### 为什么要使用API端点常量？

1. **集中管理** - 所有API路径都在一个文件中定义，方便维护
2. **类型安全** - 使用TypeScript类型定义，避免拼写错误
3. **易于更改** - 如果API路径变更，只需修改一处
4. **文档化** - 端点文件同时作为API文档

### 新增API

如需添加新的API端点，请在`src/api/endpoints.ts`中添加，并遵循以下命名规范：

```typescript
// 举例：用户管理API
export const USER_ENDPOINTS = {
  BASE: `${API_PREFIX}/users`,                                    // 基础路径
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/users/${id}` // 参数路径
};
```

## API请求规范

为了保证代码质量和一致性，本项目采用统一的API请求规范。主要规则如下：

1. **统一使用request工具**：
   - 使用`@/utils/request`中的`get`、`post`、`put`、`del`方法进行API请求
   - 禁止直接使用axios

2. **统一的API响应类型**：
   - 使用`ApiResponse<T>`类型表示API响应
   - 推荐从`@/utils/request`导入ApiResponse类型

3. **API请求配置**：
   - API服务器配置位于`@/utils/request-config.ts`
   - 禁止在代码中硬编码端口号和服务器地址

4. **模块化API实现**：
   - 按功能模块组织API请求
   - 每个模块的API应放在单独的文件中

更多详细规则和迁移指南，请参考`/src/api/api-migration-guide.md`文档。

```typescript
// 示例：正确的API实现方式
import { get, post } from '@/utils/request';
import type { ApiResponse } from '@/utils/request';

export interface User {
  id: string;
  name: string;
}

export const userApi = {
  getUsers(): Promise<ApiResponse<User[]>> {
    return get('/api/users');
  },
  
  createUser(user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    return post('/api/users', user);
  }
};
``` 