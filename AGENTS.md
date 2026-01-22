# AGENTS.md

This file provides guidance to agentic coding agents working with code in this repository.

**请使用中文回复。Please respond in Chinese.**

## 项目概览

幼儿园管理系统，Vue 3 + Express.js全栈架构，支持多租户、动态权限系统、AI集成。

**规模**: 80+Vue组件，162+页面，155+API端点，73+数据模型，95+权限记录，~150k行代码
**域名**: `http://localhost:5173` (前端)，`http://localhost:3000` (后端API)

## 构建和代码质量命令

### 基础命令
```bash
# 安装依赖
npm run install:all              # 安装前后端所有依赖
npm run install:server          # 仅安装后端依赖
npm run install:client          # 仅安装前端依赖

# 开发启动
npm run start:all              # 并发启动前后端（推荐）
npm run start:frontend         # 前端 (5173端口)
npm run start:backend          # 后端 (3000端口)
npm run dev:quick             # 快速启动（绕过初始化）
npm run dev                   # 开发模式（监视文件变化）

# 生产构建
npm run build                  # 构建前后端
npm run build:backend          # 构建后端
npm run build:frontend         # 构建前端
npm run build:turbo           # 高性能构建

# 验证和检查
npm run validate               # TypeScript + ESLint + 单元测试
npm run quality:check         # 完整质量检查
npm run typecheck             # TypeScript类型检查
npm run lint                  # ESLint代码检查
npm run lint:backend          # 后端代码检查
npm run lint:frontend         # 前端代码检查
```

### 测试命令
```bash
# 运行所有测试
npm test                      # 运行集成测试套件
npm run test:all             # 运行所有测试

# 单个测试运行
npm run test:unit             # 前端+后端单元测试
npm run test:unit:backend     # 后端单元测试
npm run test:unit:frontend    # 前端单元测试
npm run test:integration       # 集成测试
npm run test:backend          # 后端测试
npm run test:frontend         # 前端测试

# 单个测试文件运行
cd server && npm test -- --testNamePattern="specific_test"
cd client && npx vitest run specific.test.ts

# E2E和API测试
npm run test:e2e             # E2E测试（必须无头模式）
npm run test:api              # API测试
npm run test:apitest         # API测试（备用）

# 测试覆盖率
npm run test:coverage         # 测试覆盖率报告
npm run coverage:monitor      # 覆盖率监控
npm run coverage:full         # 完整覆盖率报告

# 专项测试
npm run test:ai-assistant     # AI助手测试
npm run test:smart-agent      # 智能代理测试
npm run test:console         # 控制台错误测试
npm run test:button          # 按钮功能测试
```

### 数据库管理
```bash
# 数据库初始化
npm run seed-data:complete    # 完整初始化数据库和测试数据
npm run seed-data:all        # 运行所有种子数据脚本
npm run seed-data:basic      # 基础数据种子

# 数据库迁移
cd server && npx sequelize-cli db:migrate
cd server && npx sequelize-cli db:migrate:undo

# 数据库性能
npm run db:diagnose         # 数据库性能诊断
npm run db:optimize         # 数据库性能优化
npm run db:slow-queries    # 监控慢查询
```

### 清理命令
```bash
npm run clean               # 清理构建文件
npm run clean:all          # 清理所有依赖和构建文件
npm run clean:backend      # 清理后端构建文件
npm run clean:frontend     # 清理前端构建文件
```

## 代码风格指南

### 导入规范
```typescript
// 1. 顺序：Node.js -> 第三方库 -> 本地模块
import fs from 'fs'
import path from 'path'
import express from 'express'
import { Router } from 'express'

// 2. 绝对路径优先，使用 @ 别名
import { UserModel } from '@/models'
import { validateInput } from '@/utils'
import { ApiResponse } from '@/types'

// 3. 类型导入使用 import type
import type { User, RequestWithUser } from '@/types'

// 4. Vue组件导入
import { defineComponent, ref, computed } from 'vue'
import { ElButton, ElTable } from 'element-plus'
import type { TableColumnCtx } from 'element-plus'
```

### 命名约定
```typescript
// 组件：PascalCase
export default defineComponent({
  name: 'StudentManagementDialog'
})

// 页面文件：kebab-case
// student-management.vue
// teacher-profile.vue

// 函数和变量：camelCase
const getUserList = async () => {}
const isLoading = ref(false)

// 常量：SCREAMING_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000/api'
const MAX_RETRY_ATTEMPTS = 3

// 数据库：snake_case表名，camelCase属性
CREATE TABLE student_profiles (...)
interface StudentProfile {
  firstName: string
  lastName: string
  createdAt: Date
}

// API端点：kebab-case
GET /api/students
GET /api/students/:id
POST /api/teachers
PUT /api/classes/:classId
```

### TypeScript类型规范
```typescript
// 1. 使用接口定义对象类型
interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: Date
}

// 2. 联合类型使用 | 分隔
type UserRole = 'admin' | 'teacher' | 'parent' | 'student'
type ApiStatus = 'pending' | 'success' | 'error'

// 3. 泛型使用 T, U, V 等大写字母
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 4. 函数类型定义
type AsyncFunction<T, R> = (param: T) => Promise<R>
```

### 错误处理规范
```typescript
// 1. 统一错误处理类
class ErrorHandler {
  static handle(error: Error): ApiResponse<null> {
    console.error('Error:', error)
    return {
      success: false,
      data: null,
      message: error.message
    }
  }
}

// 2. API错误处理
try {
  const result = await apiCall()
  return result
} catch (error) {
  return ErrorHandler.handle(error as Error)
}

// 3. 前端错误边界
const handleError = (error: Error) => {
  console.error('Component error:', error)
  ElMessage.error('操作失败：' + error.message)
}
```

### Vue组件规范
```vue
<template>
  <!-- 1. 使用双引号 -->
  <div class="student-list">
    <!-- 2. 自闭合标签 -->
    <el-input v-model="searchText" placeholder="搜索学生" />
    <!-- 3. 属性换行：最多3个属性单行 -->
    <el-table 
      :data="students"
      :loading="isLoading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
// 1. 导入顺序
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Student } from '@/types'
import { studentApi } from '@/api'

// 2. 响应式数据
const students = ref<Student[]>([])
const isLoading = ref(false)
const searchText = ref('')

// 3. 计算属性
const filteredStudents = computed(() => {
  return students.value.filter(student => 
    student.name.includes(searchText.value)
  )
})

// 4. 方法
const loadStudents = async () => {
  try {
    isLoading.value = true
    const response = await studentApi.getList()
    students.value = response.data
  } catch (error) {
    ElMessage.error('加载学生列表失败')
  } finally {
    isLoading.value = false
  }
}

// 5. 生命周期
onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
/* 1. 使用 scoped */
/* 2. 遵循 BEM 命名 */
.student-list {
  padding: 20px;
}

.student-list__header {
  margin-bottom: 16px;
}

.student-list__table {
  width: 100%;
}
</style>
```

### API开发规范
```typescript
// 1. 控制器模式
export class StudentController {
  static async getList(req: Request, res: Response) {
    try {
      const result = await StudentService.getList(req.query)
      res.json(ApiResponse.success(result))
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message))
    }
  }
}

// 2. 服务层模式
export class StudentService {
  static async getList(query: any): Promise<Student[]> {
    const { page, limit, search } = query
    return await Student.findAll({
      where: search ? { name: { [Op.like]: `%${search}%` } } : {},
      limit: parseInt(limit) || 10,
      offset: (parseInt(page) - 1) * (parseInt(limit) || 10)
    })
  }
}

// 3. 统一响应格式
export class ApiResponse {
  static success<T>(data: T, message = 'success'): ApiResponse<T> {
    return { success: true, data, message }
  }
  
  static error(message: string, data = null): ApiResponse<null> {
    return { success: false, data, message }
  }
}
```

### 数据库模型规范
```typescript
// 1. Sequelize模型定义
export const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'students',
  timestamps: true
})

// 2. 关联定义
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' })
Class.hasMany(Student, { foreignKey: 'classId', as: 'students' })
```

### 测试规范
```typescript
// 1. 单元测试结构
describe('StudentService', () => {
  beforeEach(async () => {
    await setupTestDatabase()
  })

  afterEach(async () => {
    await cleanupTestDatabase()
  })

  describe('getList', () => {
    it('should return student list', async () => {
      // Arrange
      const mockStudent = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      })

      // Act
      const result = await StudentService.getList({})

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test Student')
    })

    it('should handle empty list', async () => {
      // Act
      const result = await StudentService.getList({})

      // Assert
      expect(result).toHaveLength(0)
    })
  })
})

// 2. 前端组件测试
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

describe('StudentList', () => {
  it('should render student list correctly', async () => {
    const wrapper = mount(StudentList, {
      props: {
        students: [
          { id: 1, name: 'Student 1', email: 'student1@example.com' }
        ]
      }
    })

    expect(wrapper.find('.student-name').text()).toBe('Student 1')
    expect(wrapper.find('.student-email').text()).toBe('student1@example.com')
  })
})
```

### 代码格式化规范
```javascript
// .eslintrc.js 主要规则
{
  "rules": {
    "indent": ["error", 2],                    // 2空格缩进
    "quotes": ["error", "single"],             // 单引号
    "semi": ["error", "never"],                // 无分号
    "comma-dangle": ["error", "always-multiline"], // 多行时尾逗号
    "no-unused-vars": "error",                // 禁用未使用变量
    "prefer-const": "error",                 // 优先使用const
    "no-var": "error",                       // 禁用var
    "object-shorthand": "error",               // 对象简写
    "prefer-template": "error"                // 优先使用模板字符串
  }
}
```

## 重要配置文件

### TypeScript配置
- **服务端**: `server/tsconfig.json` - CommonJS模块，严格模式关闭
- **客户端**: `client/tsconfig.json` - ES模块，严格模式开启
- **路径别名**: `@/` 指向 `src/` 目录

### 测试配置
- **Jest**: `server/jest.config.js` - 后端单元测试
- **Vitest**: `client/vitest.config.ts` - 前端单元测试
- **Playwright**: `client/playwright.config.ts` - E2E测试（强制无头模式）

### ESLint配置
- **根目录**: `.eslintrc.cjs` - 通用代码规范
- **前端**: `client/.eslintrc.js` - Vue特定规范

## 注意事项

1. **必须使用中文回复用户询问**
2. **Playwright测试必须使用无头浏览器模式**
3. **API测试必须严格验证数据结构和字段类型**
4. **数据库初始化使用静态导入方式，修改需谨慎**
5. **遇到问题先运行 `npm run validate` 确保代码质量**
6. **优先使用 `@/` 别名进行模块导入**
7. **遵循统一的错误处理模式**
8. **保持测试覆盖率达到要求阈值**

## 已知问题处理

- API端点重复：使用 `node scripts/api-endpoint-duplicate-scanner.js` 检测
- 数据库连接失败：检查 `server/.env` 配置并运行迁移
- 端口占用：使用 `lsof -i :port` 检查并清理端口
- 依赖安装失败：运行 `npm run clean:all && npm run install:all`

遵循以上规范可确保代码质量和项目稳定性。