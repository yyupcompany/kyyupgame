# 代码规范指南

## 📝 代码规范概述

为了保证代码质量、提高开发效率、降低维护成本，本团队制定了一套完整的代码规范。所有团队成员都必须遵循这些规范，确保代码的一致性和可读性。

## 🎯 编码原则

### 1. 简洁性原则 (KISS)
- Keep It Simple, Stupid
- 代码应该简单明了，避免过度设计
- 优先选择简单、直接的解决方案

### 2. 单一职责原则 (SRP)
- 每个函数、类、模块只负责一个功能
- 避免功能过于复杂的函数或类

### 3. 可读性优先
- 代码首先是写给人看的，其次才是给机器执行的
- 使用有意义的变量名和函数名
- 添加必要的注释和文档

### 4. 一致性原则
- 在整个项目中保持编码风格的一致性
- 遵循团队约定的命名规范和格式标准

## 📂 项目结构规范

### 目录结构
```
k.yyup.com/
├── client/                     # 前端项目
│   ├── public/                # 静态资源
│   ├── src/
│   │   ├── api/              # API 接口
│   │   ├── assets/           # 资源文件
│   │   ├── components/       # 公共组件
│   │   ├── layouts/          # 布局组件
│   │   ├── pages/            # 页面组件
│   │   ├── router/           # 路由配置
│   │   ├── stores/           # 状态管理
│   │   ├── styles/           # 样式文件
│   │   ├── utils/            # 工具函数
│   │   ├── types/            # 类型定义
│   │   └── main.ts           # 入口文件
│   ├── package.json
│   └── vite.config.ts
├── server/                     # 后端项目
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── services/         # 服务层
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由定义
│   │   ├── middlewares/      # 中间件
│   │   ├── utils/            # 工具函数
│   │   ├── config/           # 配置文件
│   │   ├── types/            # 类型定义
│   │   └── app.ts            # 应用入口
│   ├── tests/                # 测试文件
│   ├── migrations/           # 数据库迁移
│   ├── seeders/              # 数据种子
│   └── package.json
├── docs/                      # 文档
├── scripts/                   # 脚本文件
└── README.md
```

### 文件命名规范
```
# Vue 组件
PascalCase.vue              # 组件文件：UserProfile.vue
kebab-case.vue             # 页面文件：user-management.vue

# TypeScript 文件
kebab-case.ts              # 工具文件：user-utils.ts
PascalCase.ts              # 类型文件：UserTypes.ts
camelCase.service.ts       # 服务文件：userService.ts

# 样式文件
kebab-case.module.scss     # 模块样式：user-card.module.scss
kebab-case.scss           # 全局样式：variables.scss

# 配置文件
kebab-case.config.js      # 配置文件：vite.config.js
```

## 🎨 前端编码规范

### Vue 组件规范

#### 组件基本结构
```vue
<template>
  <!-- 模板内容 -->
  <div class="user-profile">
    <!-- 使用语义化的 HTML 标签 -->
    <header class="user-profile__header">
      <h1 class="user-profile__title">{{ title }}</h1>
    </header>

    <main class="user-profile__content">
      <!-- 组件内容 -->
    </main>

    <footer class="user-profile__footer">
      <!-- 页脚内容 -->
    </footer>
  </div>
</template>

<script setup lang="ts">
// 导入依赖
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types/user'

// 定义 Props
interface Props {
  userId: number
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

// 定义 Emits
interface Emits {
  update: [user: User]
  delete: [id: number]
}
const emit = defineEmits<Emits>()

// 响应式数据
const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<string>('')

// 计算属性
const title = computed(() => {
  return user.value?.nickname || '用户资料'
})

const isEditable = computed(() => {
  return !props.readonly && user.value?.id === getCurrentUserId()
})

// 方法
const loadUser = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await userApi.getUser(props.userId)
    user.value = response.data
  } catch (err) {
    error.value = err.message || '加载用户失败'
    console.error('Failed to load user:', err)
  } finally {
    loading.value = false
  }
}

const handleUpdate = (updatedUser: User) => {
  emit('update', updatedUser)
}

// 生命周期
onMounted(() => {
  loadUser()
})
</script>

<style lang="scss" scoped>
.user-profile {
  // 使用 BEM 命名规范
  &__header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__content {
    padding: 1rem;
  }

  &__footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
  }
}
</style>
```

#### 组件命名规范
```typescript
// ✅ 好的命名
UserProfile.vue        // 用户资料组件
UserList.vue          // 用户列表组件
UserManagement.vue    // 用户管理页面

// ❌ 避免的命名
userprofile.vue       // 应该使用 PascalCase
UserComponent.vue     // 过于通用
Component1.vue        // 无意义的命名
```

### TypeScript 规范

#### 类型定义
```typescript
// 使用 interface 定义对象类型
interface User {
  id: number
  username: string
  email: string
  nickname?: string      // 可选属性
  readonly createdAt: Date // 只读属性
}

// 使用 type 定义联合类型、交叉类型
type Status = 'active' | 'inactive' | 'locked'
type UserRole = User & { role: Role }

// 泛型使用
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

// 枚举使用
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Locked = 'locked'
}
```

#### 函数定义
```typescript
// ✅ 好的函数定义
const getUserById = async (id: number): Promise<User | null> => {
  try {
    const response = await userApi.get<User>(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

// 函数重载
function formatDate(date: Date): string
function formatDate(date: string): string
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN')
}

// 高阶函数
const withLoading = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    loading.value = true
    try {
      return await fn(...args)
    } finally {
      loading.value = false
    }
  }) as T
}
```

### CSS/SCSS 规范

#### BEM 命名规范
```scss
// Block (块)
.user-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;

  // Element (元素)
  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 1rem;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  &__email {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  // Modifier (修饰符)
  &--active {
    border-color: var(--color-primary);
    background-color: var(--color-primary-light);
  }

  &--compact {
    padding: 0.5rem;
  }

  &__avatar--large {
    width: 64px;
    height: 64px;
  }
}
```

#### CSS 变量规范
```scss
// 颜色变量
:root {
  // 主色调
  --color-primary: #1890ff;
  --color-primary-light: #e6f7ff;
  --color-primary-dark: #096dd9;

  // 中性色
  --color-text-primary: #262626;
  --color-text-secondary: #595959;
  --color-text-disabled: #bfbfbf;

  // 背景色
  --bg-color-primary: #ffffff;
  --bg-color-secondary: #fafafa;
  --bg-color-disabled: #f5f5f5;

  // 边框色
  --border-color: #d9d9d9;
  --border-color-split: #f0f0f0;

  // 字体大小
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;

  // 间距
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  // 圆角
  --border-radius-sm: 2px;
  --border-radius-base: 6px;
  --border-radius-lg: 8px;

  // 阴影
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-base: 0 1px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

## 🖥️ 后端编码规范

### TypeScript 规范

#### 控制器规范
```typescript
// UserController.ts
import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { ApiResponse, PaginationQuery } from '../types/common'
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto'
import { validateDto } from '../utils/validation'
import { logger } from '../utils/logger'

export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取用户列表
   * @param req - Express 请求对象
   * @param res - Express 响应对象
   * @param next - Express 下一个中间件
   */
  async getUsers(
    req: Request<{}, {}, {}, PaginationQuery>,
    res: Response<ApiResponse<User[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, pageSize = 20, keyword, userType } = req.query

      const result = await this.userService.getUsers({
        page: Number(page),
        pageSize: Number(pageSize),
        keyword: keyword as string,
        userType: userType as string
      })

      const response: ApiResponse<User[]> = {
        success: true,
        data: result.users,
        message: '获取用户列表成功',
        timestamp: new Date().toISOString()
      }

      // 添加分页信息到响应头
      res.setHeader('X-Pagination', JSON.stringify(result.pagination))
      res.json(response)
    } catch (error) {
      logger.error('Failed to get users:', error)
      next(error)
    }
  }

  /**
   * 创建用户
   * @param req - Express 请求对象
   * @param res - Express 响应对象
   * @param next - Express 下一个中间件
   */
  async createUser(
    req: Request<{}, {}, CreateUserDto>,
    res: Response<ApiResponse<User>>,
    next: NextFunction
  ): Promise<void> {
    try {
      // 验证请求数据
      const createUserData = await validateDto(CreateUserDto, req.body)

      const user = await this.userService.createUser(createUserData)

      const response: ApiResponse<User> = {
        success: true,
        data: user,
        message: '用户创建成功',
        timestamp: new Date().toISOString()
      }

      res.status(201).json(response)
    } catch (error) {
      logger.error('Failed to create user:', error)
      next(error)
    }
  }
}
```

#### 服务层规范
```typescript
// UserService.ts
import { User } from '../models/user.model'
import { CreateUserDto, UpdateUserDto, UserQuery } from '../dto/user.dto'
import { UserRepository } from '../repositories/user.repository'
import { hashPassword } from '../utils/password'
import { ConflictError, NotFoundError } from '../utils/errors'

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 获取用户列表
   * @param query - 查询参数
   * @returns 用户列表和分页信息
   */
  async getUsers(query: UserQuery): Promise<{
    users: User[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }> {
    const { page, pageSize, keyword, userType, status } = query

    const where: any = {}

    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
        { nickname: { [Op.like]: `%${keyword}%` } }
      ]
    }

    if (userType) {
      where.userType = userType
    }

    if (status) {
      where.status = status
    }

    const { count, rows } = await this.userRepository.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']],
      include: [
        {
          association: 'roles',
          attributes: ['id', 'name', 'displayName']
        }
      ]
    })

    return {
      users: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    }
  }

  /**
   * 创建用户
   * @param userData - 用户数据
   * @returns 创建的用户
   * @throws ConflictError - 用户已存在
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    // 检查用户是否已存在
    const existingUser = await this.userRepository.findOne({
      where: {
        [Op.or]: [
          { username: userData.username },
          { email: userData.email }
        ]
      }
    })

    if (existingUser) {
      throw new ConflictError('用户名或邮箱已存在')
    }

    // 加密密码
    const hashedPassword = await hashPassword(userData.password)

    // 创建用户
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      status: 'pending_activation'
    })

    // 返回用户信息（不包含密码）
    return this.sanitizeUser(user)
  }

  /**
   * 清理用户敏感信息
   * @param user - 用户对象
   * @returns 清理后的用户对象
   */
  private sanitizeUser(user: User): User {
    const { password, ...sanitizedUser } = user.toJSON()
    return sanitizedUser
  }
}
```

#### DTO 规范
```typescript
// CreateUserDto.ts
import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator'
import { UserType, Gender } from '../enums/user.enum'

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  username: string

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string

  @IsOptional()
  @IsString()
  nickname?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEnum(Gender, { message: '性别值无效' })
  gender?: Gender

  @IsEnum(UserType, { message: '用户类型无效' })
  userType: UserType

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  avatar?: string
}
```

### 数据库规范

#### 模型定义
```typescript
// User.ts
import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript'
import { hashPassword } from '../utils/password'

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true, // 软删除
  indexes: [
    {
      fields: ['email'],
      unique: true
    },
    {
      fields: ['username'],
      unique: true
    },
    {
      fields: ['user_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class User extends Model<User> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  })
  username!: string

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    comment: '邮箱地址'
  })
  email!: string

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '密码哈希'
  })
  password!: string

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: '昵称'
  })
  nickname?: string

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    comment: '手机号码'
  })
  phone?: string

  @Column({
    type: DataType.ENUM('male', 'female', 'other'),
    allowNull: true,
    comment: '性别'
  })
  gender?: 'male' | 'female' | 'other'

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    comment: '生日'
  })
  birthday?: Date

  @Column({
    type: DataType.ENUM('admin', 'principal', 'teacher', 'parent', 'student'),
    allowNull: false,
    defaultValue: 'parent',
    comment: '用户类型'
  })
  userType!: string

  @Column({
    type: DataType.ENUM('active', 'inactive', 'locked', 'pending_activation'),
    allowNull: false,
    defaultValue: 'pending_activation',
    comment: '用户状态'
  })
  status!: string

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment: '头像URL'
  })
  avatar?: string

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment: '地址'
  })
  address?: string

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '最后登录时间'
  })
  lastLoginAt?: Date

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '密码修改时间'
  })
  passwordChangedAt?: Date

  // 关联关系
  @BelongsToMany(() => Role, {
    through: () => UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles'
  })
  roles!: Role[]

  @HasMany(() => Activity, {
    foreignKey: 'createdBy',
    as: 'createdActivities'
  })
  createdActivities!: Activity[]

  // 钩子函数
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      user.password = await hashPassword(user.password)
    }
  }
}
```

## 📝 注释规范

### JSDoc 注释
```typescript
/**
 * 用户服务类
 * @class UserService
 * @description 提供用户相关的业务逻辑处理
 * @author 开发团队
 * @since 1.0.0
 */
export class UserService {
  /**
   * 根据ID获取用户信息
   * @async
   * @method getUserById
   * @param {number} id - 用户ID
   * @param {boolean} [includePassword=false] - 是否包含密码信息
   * @returns {Promise<User | null>} 用户对象，如果不存在则返回null
   * @throws {ValidationError} 当ID无效时抛出验证错误
   * @example
   * ```typescript
   * const user = await userService.getUserById(123)
   * if (user) {
   *   console.log(`用户名: ${user.username}`)
   * }
   * ```
   */
  async getUserById(
    id: number,
    includePassword: boolean = false
  ): Promise<User | null> {
    // 实现逻辑
  }
}
```

### 代码注释
```typescript
// TODO: 这里需要优化查询性能
const users = await User.findAll()

// HACK: 临时解决方案，待重构
const tempData = rawData.map(item => ({ ...item, status: 'active' }))

// FIXME: 修复这里的内存泄漏问题
const cache = new Map()

// NOTE: 这个函数在并发调用时可能有问题，需要加锁
const updateCounter = () => {
  counter++
}

// WARNING: 不要在生产环境中使用这个方法
const debugMode = true
```

## 🔍 代码审查规范

### 审查检查清单

#### 功能性检查
- [ ] 代码是否实现了预期的功能
- [ ] 是否有遗漏的边界情况
- [ ] 错误处理是否完整
- [ ] 性能是否满足要求

#### 代码质量检查
- [ ] 代码是否遵循团队的编码规范
- [ ] 变量和函数命名是否清晰
- [ ] 代码结构是否合理
- [ ] 是否有重复代码

#### 安全性检查
- [ ] 是否有安全漏洞（SQL注入、XSS等）
- [ ] 敏感信息是否正确处理
- [ ] 权限控制是否正确实现
- [ ] 输入验证是否完整

#### 测试检查
- [ ] 是否有相应的单元测试
- [ ] 测试覆盖率是否达标
- [ ] 测试用例是否覆盖边界情况
- [ ] 集成测试是否通过

### Pull Request 模板
```markdown
## 变更描述
简要描述本次变更的内容和目的

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 代码风格调整

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自我审查代码
- [ ] 添加必要的注释
- [ ] 更新相关文档

## 相关问题
Closes #123
Related to #456

## 截图
如果有UI变更，请添加截图

## 其他说明
其他需要说明的信息
```

## 🧪 测试规范

### 单元测试
```typescript
// UserService.test.ts
import { UserService } from '../services/user.service'
import { UserRepository } from '../repositories/user.repository'
import { ConflictError } from '../utils/errors'

describe('UserService', () => {
  let userService: UserService
  let mockUserRepository: jest.Mocked<UserRepository>

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      findAndCountAll: jest.fn()
    } as any

    userService = new UserService(mockUserRepository)
  })

  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        userType: 'parent'
      }

      const createdUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        userType: 'parent',
        status: 'pending_activation'
      }

      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockResolvedValue(createdUser)

      // Act
      const result = await userService.createUser(userData)

      // Assert
      expect(result).toEqual(createdUser)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          [Op.or]: expect.any(Array)
        })
      })
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...userData,
          password: expect.any(String), // 密码应该被哈希
          status: 'pending_activation'
        })
      )
    })

    it('当用户已存在时应该抛出 ConflictError', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        userType: 'parent'
      }

      const existingUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      }

      mockUserRepository.findOne.mockResolvedValue(existingUser as any)

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(ConflictError)
    })
  })
})
```

## 🛠️ 开发工具配置

### ESLint 配置
```json
{
  "extends": [
    "@vue/typescript/recommended",
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier"
  ],
  "rules": {
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/no-unused-components": "error",
    "vue/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": "warn",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier 配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### VS Code 配置
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "vue": "html"
  }
}
```

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0
**维护团队**: 统一认证管理系统开发团队