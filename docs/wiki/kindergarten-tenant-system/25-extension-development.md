# 幼儿园租户系统扩展开发指南

## 📋 概述

本指南为开发者提供了基于**共享连接池架构**的幼儿园统一租户系统的完整开发流程和扩展方法。通过本指南，开发者可以快速理解多租户架构的核心原理，掌握扩展开发技能，为系统贡献代码。

### 🎯 开发重点

- **共享连接池架构**: 深入理解创新的多租户数据库架构
- **智能租户识别**: 掌握基于域名的自动租户识别机制
- **透明数据隔离**: 学习如何在不修改业务代码的情况下实现数据隔离
- **高性能开发**: 利用连接池优化提升系统性能
- **扩展性设计**: 开发支持动态租户的扩展功能

### 🚀 核心技术特性

- **单连接池服务**: `TenantDatabaseSharedPoolService` 统一管理
- **智能SQL路由**: 自动表名转换和查询路由
- **租户识别中间件**: `tenantResolverSharedPoolMiddleware`
- **数据隔离机制**: 完整的租户级别数据隔离
- **性能监控**: 连接池和租户级别的性能监控

## 开发环境搭建

### 1. 系统要求

- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **Redis**: 6.0 或更高版本
- **Git**: 2.30 或更高版本

### 2. 开发工具推荐

- **IDE**: Visual Studio Code
- **数据库工具**: DBeaver, MySQL Workbench
- **API测试**: Postman, Insomnia
- **版本控制**: Git, GitHub Desktop
- **容器**: Docker Desktop

### 3. 环境配置步骤

#### 克隆项目

```bash
# 克隆仓库
git clone <repository-url> unified-tenant-system
cd unified-tenant-system

# 查看项目结构
tree -L 2
```

#### 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install

# 返回根目录
cd ..
```

#### 环境变量配置

```bash
# 复制环境变量模板
cp server/.env.example server/.env
cp client/.env.example client/.env

# 编辑后端环境变量
vim server/.env
```

**开发环境变量配置 (server/.env)**：
```bash
# 应用配置
NODE_ENV=development
PORT=3000
APP_NAME=KindergartenTenantSystem
APP_VERSION=1.0.0

# 共享连接池配置（多租户架构核心）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=mysql  # 连接到MySQL系统数据库

# 连接池配置
DB_POOL_MAX=10          # 开发环境最大连接数
DB_POOL_MIN=2           # 开发环境最小连接数
DB_POOL_ACQUIRE=15000   # 获取连接超时15秒
DB_POOL_IDLE=5000       # 空闲连接超时5秒

# 租户配置
TENANT_DATABASE_PREFIX=tenant_  # 租户数据库前缀
TENANT_DOMAIN_PATTERN=k{code}.yyup.cc  # 租户域名模式
DEFAULT_TENANT_CODE=k001
TENANT_VALIDATION_ENABLED=true
TENANT_RESOLVER_DEVELOPMENT_MODE=true  # 开发环境允许默认租户

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=kts_dev:  # 开发环境前缀

# JWT 配置
JWT_SECRET=your_jwt_secret_for_development
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# 监控配置
CONNECTION_POOL_MONITORING_ENABLED=true
API_PERFORMANCE_MONITORING_ENABLED=true
TENANT_METRICS_ENABLED=true
SQL_QUERY_LOGGING=true  # 开发环境启用SQL日志

# 文件存储
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 日志配置
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
TENANT_LOG_PREFIX_ENABLED=true

# 开发特定配置
ENABLE_CORS=true
ENABLE_DEBUG=true
ENABLE_MOCK_DATA=false
ENABLE_DEV_TOOLS=true
```

**前端环境变量配置 (client/.env)**：
```bash
# 应用配置
VITE_APP_TITLE=幼儿园租户系统(开发版)
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# 租户配置
VITE_DEFAULT_TENANT_CODE=k001
VITE_ENABLE_MULTI_TENANT=true
VITE_TENANT_DOMAIN_SUFFIX=yyup.cc

# 功能开关
VITE_ENABLE_AI=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=true

# 开发特定配置
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEVTOOLS=true
VITE_API_DELAY=0  # 开发环境API延迟模拟
```

**前端环境变量配置 (client/.env)**：
```bash
# 应用配置
VITE_APP_TITLE=幼儿园管理系统(开发版)
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# 租户配置
VITE_DEFAULT_TENANT_CODE=k001
VITE_ENABLE_MULTI_TENANT=true

# 功能开关
VITE_ENABLE_AI=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=true

# 开发特定配置
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEVTOOLS=true
```

#### 数据库初始化

```bash
cd server

# 创建开发数据库
mysql -u root -p -e "CREATE DATABASE kargerdensales CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 运行数据库迁移
npm run db:migrate

# 初始化种子数据
npm run seed-data:dev

# 创建测试用户
npm run create-dev-user
```

### 4. 启动开发服务

```bash
# 启动后端服务（终端1）
cd server
npm run dev

# 启动前端服务（终端2）
cd client
npm run dev

# 启动Redis（如果未自动启动）
redis-server

# 访问应用
# 前端: http://localhost:5173
# 后端API: http://localhost:3000
# API文档: http://localhost:3000/api-docs
```

## 项目结构详解

### 整体目录结构

```
unified-tenant-system/
├── client/                     # 前端应用
│   ├── public/                 # 静态资源
│   ├── src/                    # 源代码
│   │   ├── api/                # API调用
│   │   ├── components/         # 公共组件
│   │   ├── layouts/            # 布局组件
│   │   ├── pages/              # 页面组件
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # 状态管理
│   │   ├── styles/             # 样式文件
│   │   ├── types/              # 类型定义
│   │   ├── utils/              # 工具函数
│   │   └── main.ts             # 入口文件
│   ├── package.json            # 依赖配置
│   ├── vite.config.ts          # Vite配置
│   └── tsconfig.json           # TypeScript配置
├── server/                     # 后端应用
│   ├── src/                    # 源代码
│   │   ├── controllers/        # 控制器
│   │   ├── models/             # 数据模型
│   │   ├── routes/             # 路由定义
│   │   ├── services/           # 业务服务
│   │   ├── middlewares/        # 中间件
│   │   ├── utils/              # 工具函数
│   │   ├── types/              # 类型定义
│   │   ├── config/             # 配置文件
│   │   └── server.ts           # 服务器入口
│   ├── migrations/             # 数据库迁移
│   ├── seeders/                # 种子数据
│   ├── tests/                  # 测试文件
│   ├── package.json            # 依赖配置
│   └── tsconfig.json           # TypeScript配置
├── docs/                       # 项目文档
├── docker/                     # Docker配置
├── scripts/                    # 构建脚本
├── .env.example                # 环境变量模板
├── .gitignore                  # Git忽略文件
├── docker-compose.yml          # Docker编排
├── package.json                # 根依赖配置
└── README.md                   # 项目说明
```

### 前端架构

```typescript
// src/main.ts - 应用入口
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import router from './router';
import App from './App.vue';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

app.mount('#app');
```

```typescript
// src/router/index.ts - 路由配置
import { createRouter, createWebHistory } from 'vue-router';
import { setupPermissionGuard } from './guards/permission';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: { requiresAuth: true, permission: 'dashboard.read' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

setupPermissionGuard(router);

export default router;
```

### 后端架构

```typescript
// src/server.ts - 服务器入口
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';
import { tenantMiddleware } from './middlewares/tenant';
import { authMiddleware } from './middlewares/auth';
import routes from './routes';

const app = express();

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(tenantMiddleware);
app.use(authMiddleware);

// 路由
app.use('/api', routes);

// 错误处理
app.use(errorHandler);

export default app;
```

## 编码规范

### 1. TypeScript 规范

#### 类型定义

```typescript
// types/common.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

#### 函数定义

```typescript
// services/user.service.ts
export class UserService {
  /**
   * 获取用户列表
   * @param tenantId 租户ID
   * @param query 查询参数
   * @returns 分页用户列表
   */
  async getUsers(
    tenantId: number,
    query: GetUsersQuery
  ): Promise<PaginatedResponse<User>> {
    // 实现
  }

  /**
   * 创建用户
   * @param tenantId 租户ID
   * @param userData 用户数据
   * @returns 创建的用户信息
   * @throws {ValidationError} 当数据验证失败时
   */
  async createUser(
    tenantId: number,
    userData: CreateUserData
  ): Promise<User> {
    // 实现
  }
}
```

### 2. Vue 组件规范

#### 组件结构

```vue
<!-- components/UserForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名" />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { UserService } from '@/services/user.service';
import type { User, CreateUserData } from '@/types/user';

// Props 定义
interface Props {
  userId?: number;
  mode?: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
});

// Emits 定义
interface Emits {
  (e: 'success', user: User): void;
  (e: 'cancel'): void;
}

const emit = defineEmits<Emits>();

// 响应式数据
const formRef = ref<FormInstance>();
const isEdit = computed(() => props.mode === 'edit');
const loading = ref(false);

const form = reactive<CreateUserData>({
  username: '',
  email: '',
  realName: '',
  phone: ''
});

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ]
};

// 方法定义
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const userService = new UserService();

    if (isEdit.value) {
      const updatedUser = await userService.updateUser(props.userId!, form);
      ElMessage.success('用户更新成功');
      emit('success', updatedUser);
    } else {
      const newUser = await userService.createUser(form);
      ElMessage.success('用户创建成功');
      emit('success', newUser);
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error(error.message || '提交失败');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};

// 生命周期
onMounted(async () => {
  if (isEdit.value && props.userId) {
    try {
      const userService = new UserService();
      const user = await userService.getUserById(props.userId);
      Object.assign(form, user);
    } catch (error) {
      ElMessage.error('获取用户信息失败');
      handleCancel();
    }
  }
});
</script>

<style scoped>
.el-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>
```

### 3. 后端代码规范

#### 控制器规范

```typescript
// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse, PaginationQuery } from '../types/common';
import { User } from '../models/user.model';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 获取用户列表
   * GET /api/users
   */
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenantId;
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await this.userService.getUsers(tenantId, query);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 创建用户
   * POST /api/users
   */
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenantId;
      const userData = req.body;

      // 验证必需字段
      if (!userData.username || !userData.email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '用户名和邮箱为必填字段'
          },
          timestamp: new Date().toISOString()
        });
      }

      const user = await this.userService.createUser(tenantId, userData);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: '用户创建成功',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
```

#### 服务层规范

```typescript
// services/user.service.ts
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { PasswordUtils } from '../utils/password';
import { PaginationQuery, PaginatedResponse } from '../types/common';
import { Op, FindOptions } from 'sequelize';

export interface GetUsersQuery extends PaginationQuery {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  realName: string;
  phone?: string;
  roleIds?: number[];
}

export class UserService {
  /**
   * 获取用户列表
   */
  async getUsers(
    tenantId: number,
    query: GetUsersQuery
  ): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      role,
      status
    } = query;

    const where: any = {
      tenant_id: tenantId
    };

    // 搜索条件
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { real_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 构建查询选项
    const options: FindOptions = {
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: role ? [{
        model: Role,
        where: { code: role },
        required: true
      }] : undefined
    };

    // 执行查询
    const { count, rows } = await User.findAndCountAll(options);

    return {
      items: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  /**
   * 创建用户
   */
  async createUser(tenantId: number, userData: CreateUserData): Promise<User> {
    const { username, email, password, roleIds, ...otherData } = userData;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: {
        tenant_id: tenantId,
        username
      }
    });

    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: {
        tenant_id: tenantId,
        email
      }
    });

    if (existingEmail) {
      throw new Error('邮箱已存在');
    }

    // 密码加密
    const passwordHash = await PasswordUtils.hash(password);

    // 创建用户
    const user = await User.create({
      tenant_id: tenantId,
      username,
      email,
      password_hash: passwordHash,
      ...otherData
    });

    // 分配角色
    if (roleIds && roleIds.length > 0) {
      await user.$set('roles', roleIds);
    }

    return user;
  }
}
```

## 功能扩展开发

### 1. 添加新的业务模块

#### 步骤1: 创建数据模型

```typescript
// models/course.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';
import { Tenant } from './tenant.model';

interface CourseAttributes {
  id: number;
  tenantId: number;
  name: string;
  code: string;
  description: string;
  duration: number;
  price: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface CourseCreationAttributes extends Optional<CourseAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public id!: number;
  public tenantId!: number;
  public name!: string;
  public code!: string;
  public description!: string;
  public duration!: number;
  public price!: number;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Course.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'Course',
  tableName: 'courses',
  timestamps: true,
  underscored: true
});
```

#### 步骤2: 创建服务层

```typescript
// services/course.service.ts
import { Course } from '../models/course.model';
import { PaginationQuery, PaginatedResponse } from '../types/common';

export interface CreateCourseData {
  name: string;
  code: string;
  description: string;
  duration: number;
  price: number;
}

export class CourseService {
  async getCourses(
    tenantId: number,
    query: PaginationQuery & { search?: string; status?: string }
  ): Promise<PaginatedResponse<Course>> {
    const { page = 1, pageSize = 20, search, status } = query;

    const where: any = { tenantId };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Course.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      items: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  async createCourse(tenantId: number, courseData: CreateCourseData): Promise<Course> {
    // 检查课程代码是否已存在
    const existingCourse = await Course.findOne({
      where: {
        tenantId,
        code: courseData.code
      }
    });

    if (existingCourse) {
      throw new Error('课程代码已存在');
    }

    return await Course.create({
      tenantId,
      ...courseData
    });
  }
}
```

#### 步骤3: 创建控制器

```typescript
// controllers/course.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { ApiResponse } from '../types/common';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  getCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenantId;
      const query = req.query;

      const result = await this.courseService.getCourses(tenantId, query);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenantId;
      const courseData = req.body;

      const course = await this.courseService.createCourse(tenantId, courseData);

      const response: ApiResponse = {
        success: true,
        data: course,
        message: '课程创建成功',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
```

#### 步骤4: 创建路由

```typescript
// routes/course.routes.ts
import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authMiddleware } from '../middlewares/auth';
import { PermissionMiddleware } from '../middlewares/permission';

const router = Router();
const courseController = new CourseController();

// 所有路由都需要认证
router.use(authMiddleware);

// 获取课程列表 - 需要课程查看权限
router.get('/',
  PermissionMiddleware.checkPermission('course.read'),
  courseController.getCourses
);

// 创建课程 - 需要课程创建权限
router.post('/',
  PermissionMiddleware.checkPermission('course.create'),
  courseController.createCourse
);

export default router;
```

#### 步骤5: 注册路由

```typescript
// routes/index.ts
import { Router } from 'express';
import courseRoutes from './course.routes';

const router = Router();

// 注册课程路由
router.use('/courses', courseRoutes);

export default router;
```

### 2. 添加前端页面

#### 步骤1: 创建API服务

```typescript
// src/api/course.ts
import { request } from '@/utils/request';
import type { ApiResponse, PaginatedResponse } from '@/types/common';

export interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  duration: number;
  price: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  name: string;
  code: string;
  description: string;
  duration: number;
  price: number;
}

export interface CourseQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export const courseApi = {
  // 获取课程列表
  getCourses(params?: CourseQuery): Promise<ApiResponse<PaginatedResponse<Course>>> {
    return request.get('/courses', { params });
  },

  // 创建课程
  createCourse(data: CreateCourseData): Promise<ApiResponse<Course>> {
    return request.post('/courses', data);
  },

  // 更新课程
  updateCourse(id: number, data: Partial<CreateCourseData>): Promise<ApiResponse<Course>> {
    return request.put(`/courses/${id}`, data);
  },

  // 删除课程
  deleteCourse(id: number): Promise<ApiResponse> {
    return request.delete(`/courses/${id}`);
  }
};
```

#### 步骤2: 创建页面组件

```vue
<!-- src/pages/course/list.vue -->
<template>
  <div class="course-list">
    <div class="page-header">
      <h1>课程管理</h1>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增课程
      </el-button>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.search"
            placeholder="请输入课程名称或代码"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
      >
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="code" label="课程代码" />
        <el-table-column prop="duration" label="课时数" />
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <CourseForm
      v-model:visible="dialogVisible"
      :course="currentCourse"
      :mode="dialogMode"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { courseApi, type Course, type CourseQuery } from '@/api/course';
import CourseForm from './components/CourseForm.vue';

// 响应式数据
const loading = ref(false);
const tableData = ref<Course[]>([]);
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const currentCourse = ref<Course | null>(null);

const searchForm = reactive<CourseQuery>({
  search: '',
  status: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 方法定义
const loadCourses = async () => {
  try {
    loading.value = true;
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    };

    const response = await courseApi.getCourses(params);

    if (response.success) {
      tableData.value = response.data.items;
      pagination.total = response.data.total;
    }
  } catch (error) {
    console.error('加载课程列表失败:', error);
    ElMessage.error('加载课程列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadCourses();
};

const handleReset = () => {
  Object.assign(searchForm, {
    search: '',
    status: ''
  });
  handleSearch();
};

const handleCreate = () => {
  dialogMode.value = 'create';
  currentCourse.value = null;
  dialogVisible.value = true;
};

const handleEdit = (course: Course) => {
  dialogMode.value = 'edit';
  currentCourse.value = course;
  dialogVisible.value = true;
};

const handleDelete = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程"${course.name}"吗？`,
      '确认删除',
      {
        type: 'warning'
      }
    );

    await courseApi.deleteCourse(course.id);
    ElMessage.success('删除成功');
    loadCourses();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleFormSuccess = () => {
  dialogVisible.value = false;
  loadCourses();
};

const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  loadCourses();
};

const handleCurrentChange = (val: number) => {
  pagination.page = val;
  loadCourses();
};

// 生命周期
onMounted(() => {
  loadCourses();
});
</script>

<style scoped>
.course-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
</style>
```

#### 步骤3: 配置路由和权限

```typescript
// src/router/modules/course.ts
export default {
  path: '/course',
  name: 'Course',
  component: () => import('@/layouts/MainLayout.vue'),
  meta: {
    title: '课程管理',
    icon: 'Book',
    requiresAuth: true,
    permission: 'course.manage'
  },
  children: [
    {
      path: '',
      name: 'CourseList',
      component: () => import('@/pages/course/list.vue'),
      meta: {
        title: '课程列表',
        permission: 'course.read'
      }
    },
    {
      path: 'create',
      name: 'CourseCreate',
      component: () => import('@/pages/course/create.vue'),
      meta: {
        title: '新增课程',
        permission: 'course.create',
        hidden: true
      }
    }
  ]
};
```

## 插件开发

### 1. 创建插件结构

```bash
# 创建插件目录
mkdir plugins
cd plugins

# 创建示例插件
mkdir example-plugin
cd example-plugin

# 创建插件文件
touch package.json
touch index.ts
touch README.md
```

### 2. 插件配置文件

```json
// plugins/example-plugin/package.json
{
  "name": "@kindergarten/example-plugin",
  "version": "1.0.0",
  "description": "示例插件",
  "main": "index.js",
  "kindergarten": {
    "version": "1.0.0",
    "permissions": [
      "example.plugin.read",
      "example.plugin.write"
    ],
    "routes": [
      {
        "path": "/example",
        "component": "./views/Example.vue",
        "permission": "example.plugin.read"
      }
    ],
    "menus": [
      {
        "title": "示例插件",
        "icon": "example",
        "path": "/example",
        "permission": "example.plugin.read"
      }
    ]
  },
  "dependencies": {},
  "devDependencies": {}
}
```

### 3. 插件主文件

```typescript
// plugins/example-plugin/index.ts
import { Plugin } from '../types/plugin';

export default class ExamplePlugin implements Plugin {
  name = 'example-plugin';
  version = '1.0.0';
  description = '示例插件';

  async install(app: any): Promise<void> {
    // 注册路由
    this.registerRoutes(app);

    // 注册菜单
    this.registerMenus(app);

    // 注册权限
    this.registerPermissions(app);

    console.log('示例插件安装成功');
  }

  async uninstall(app: any): Promise<void> {
    // 清理资源
    console.log('示例插件卸载成功');
  }

  private registerRoutes(app: any) {
    // 注册插件路由
  }

  private registerMenus(app: any) {
    // 注册插件菜单
  }

  private registerPermissions(app: any) {
    // 注册插件权限
  }
}
```

## 测试开发

### 1. 单元测试

```typescript
// tests/services/user.service.test.ts
import { UserService } from '../../src/services/user.service';
import { User } from '../../src/models/user.model';

describe('UserService', () => {
  let userService: UserService;
  let testTenant: any;

  beforeEach(async () => {
    userService = new UserService();
    testTenant = await Tenant.create({ code: 'test', name: 'Test Tenant' });
  });

  afterEach(async () => {
    await testTenant.destroy();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户'
      };

      const user = await userService.createUser(testTenant.id, userData);

      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.tenantId).toBe(testTenant.id);
    });

    it('should throw error when username exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户'
      };

      // 创建第一个用户
      await userService.createUser(testTenant.id, userData);

      // 尝试创建相同用户名的用户
      await expect(
        userService.createUser(testTenant.id, userData)
      ).rejects.toThrow('用户名已存在');
    });
  });
});
```

### 2. 集成测试

```typescript
// tests/integration/user.test.ts
import request from 'supertest';
import { app } from '../../src/server';
import { User } from '../../src/models/user.model';

describe('User API Integration', () => {
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    // 创建测试用户并获取认证令牌
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });

    authToken = response.body.data.token;
    testUser = response.body.data.user;
  });

  describe('GET /api/users', () => {
    it('should return users list with authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });
  });
});
```

### 3. E2E测试

```typescript
// tests/e2e/user.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid=username]', 'testuser');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new user', async ({ page }) => {
    // 导航到用户管理页面
    await page.click('[data-testid=users-menu]');
    await page.waitForURL('/users');

    // 点击新增用户按钮
    await page.click('[data-testid=create-user-button]');

    // 填写用户信息
    await page.fill('[data-testid=username]', 'newuser');
    await page.fill('[data-testid=email]', 'newuser@example.com');
    await page.fill('[data-testid=realName]', '新用户');
    await page.fill('[data-testid=password]', 'password123');

    // 提交表单
    await page.click('[data-testid=submit-button]');

    // 验证成功消息
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();

    // 验证用户出现在列表中
    await expect(page.locator('text=newuser')).toBeVisible();
  });
});
```

## 部署和发布

### 1. 构建流程

```bash
# 构建前端
cd client
npm run build

# 构建后端
cd ../server
npm run build

# 运行测试
npm run test
npm run test:e2e
```

### 2. 版本管理

```json
// package.json
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major",
    "release": "npm run build && npm run test && npm publish"
  }
}
```

### 3. CI/CD配置

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: test_db
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: |
        cd server && npm ci
        cd ../client && npm ci

    - name: Run tests
      run: |
        cd server && npm run test
        cd ../client && npm run test:unit

    - name: Build
      run: |
        cd client && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to production
      run: |
        # 部署脚本
        echo "Deploying to production..."
```

## 贡献指南

### 1. 开发流程

1. Fork 项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建 Pull Request

### 2. 代码规范

- 遵循 ESLint 和 Prettier 配置
- 编写单元测试和集成测试
- 更新相关文档
- 遵循提交信息规范

### 3. 提交信息规范

```
feat: 添加新的功能模块
fix: 修复用户登录问题
docs: 更新API文档
style: 代码格式调整
refactor: 重构用户服务
test: 添加单元测试
chore: 更新依赖包
```

## 总结

本开发指南提供了：

1. **环境搭建**：完整的开发环境配置
2. **编码规范**：TypeScript、Vue、Node.js 最佳实践
3. **功能扩展**：模块化开发流程
4. **插件开发**：可扩展的插件系统
5. **测试策略**：单元测试、集成测试、E2E测试
6. **部署发布**：CI/CD流程和版本管理
7. **贡献指南**：开源协作流程

遵循这些规范和最佳实践，可以确保代码质量、可维护性和团队协作效率。