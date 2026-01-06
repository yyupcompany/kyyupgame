# TypeScript 严格模式配置与注意事项

## 概述

本项目启用了 TypeScript 严格模式，以确保代码质量和类型安全。严格模式包含了多个严格的类型检查选项，有助于在开发阶段发现潜在问题。

## 严格模式配置

### 当前配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": false,
    "noImplicitOverride": false
  }
}
```

### 严格模式选项说明

| 选项 | 说明 | 影响 |
|------|------|------|
| `strict` | 启用所有严格类型检查选项 | 全局严格模式 |
| `noImplicitAny` | 禁止隐式 any 类型 | 必须显式声明类型 |
| `strictNullChecks` | 严格的 null 检查 | null/undefined 必须显式处理 |
| `strictFunctionTypes` | 严格的函数类型检查 | 函数参数逆变检查 |
| `noImplicitReturns` | 禁止隐式返回 | 所有代码路径必须有返回值 |
| `noFallthroughCasesInSwitch` | 禁止 switch 穿透 | switch case 必须有 break |

## 常见错误类型与解决方案

### 1. TS2307: Cannot find module

**错误示例**:
```typescript
// ❌ 错误
import { request } from '@/utils/request'
// Error: Cannot find module '@/utils/request'
```

**解决方案**:
- 确保 `src/types/path-aliases.d.ts` 文件存在且完整
- 检查模块声明是否正确

```typescript
// ✅ 正确的模块声明
declare module '@/utils/request' {
  export const request: any
  export const get: any
  // ... 其他导出
}
```

### 2. TS2305: Module has no exported member

**错误示例**:
```typescript
// ❌ 错误
import { nonExistentFunction } from '@/utils/request'
// Error: Module has no exported member 'nonExistentFunction'
```

**解决方案**:
- 检查实际模块的导出内容
- 更新类型声明文件

```typescript
// ✅ 正确的导出声明
declare module '@/utils/request' {
  export const get: <T = any>(url: string) => Promise<T>
  export const post: <T = any>(url: string, data?: any) => Promise<T>
  // 只声明实际存在的导出
}
```

### 3. TS2345: Argument type mismatch

**错误示例**:
```typescript
// ❌ 错误
const result = await get('/api/users', { userId: 123 })
// Error: Argument of type '{ userId: number }' is not assignable to parameter of type 'AxiosRequestConfig'
```

**解决方案**:
- 使用正确的参数类型
- 添加类型断言或修正函数签名

```typescript
// ✅ 正确的用法
const result = await get('/api/users', { params: { userId: 123 } })
// 或者使用类型断言
const result = await get('/api/users', { userId: 123 } as any)
```

### 4. TS7006: Parameter implicitly has 'any' type

**错误示例**:
```typescript
// ❌ 错误
function handleClick(event) {
  // Error: Parameter 'event' implicitly has an 'any' type
}
```

**解决方案**:
- 显式声明参数类型

```typescript
// ✅ 正确
function handleClick(event: MouseEvent) {
  console.log(event.target)
}

// Vue 组件中
function handleClick(event: Event) {
  console.log(event)
}
```

### 5. TS18046: 'error' is of type 'unknown'

**错误示例**:
```typescript
// ❌ 错误
try {
  // some code
} catch (error) {
  console.log(error.message) // Error: 'error' is of type 'unknown'
}
```

**解决方案**:
- 使用类型断言或类型守卫

```typescript
// ✅ 正确
try {
  // some code
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log('Unknown error:', error)
  }
}

// 或者使用类型断言
try {
  // some code
} catch (error) {
  console.log((error as Error).message)
}
```

## Vue 3 + TypeScript 特殊注意事项

### 1. 组件 Props 类型

```typescript
// ✅ 推荐：使用 defineProps 与泛型
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()

// 或者使用默认值
const props = withDefaults(defineProps<Props>(), {
  count: 0
})
```

### 2. 组件 Emits 类型

```typescript
// ✅ 推荐：明确声明事件类型
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const emit = defineEmits<Emits>()
```

### 3. Ref 类型声明

```typescript
// ✅ 推荐：明确 ref 类型
const count = ref<number>(0)
const user = ref<User | null>(null)
const element = ref<HTMLElement>()
```

### 4. Computed 类型推断

```typescript
// ✅ TypeScript 会自动推断类型
const doubleCount = computed(() => count.value * 2) // number

// 复杂情况下可以显式声明
const complexComputed = computed<string>(() => {
  return someComplexLogic()
})
```

## 开发工具配置

### VS Code 设置

```json
{
  "typescript.preferences.strictFunctionTypes": true,
  "typescript.preferences.strictNullChecks": true,
  "typescript.preferences.noImplicitAny": true,
  "typescript.preferences.noImplicitReturns": true,
  "typescript.suggest.autoImports": true,
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

### ESLint 配置

```javascript
module.exports = {
  extends: [
    '@vue/typescript/recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn'
  }
}
```

## 性能优化建议

### 1. 编译性能

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

### 2. 开发体验优化

- 使用 `// @ts-ignore` 谨慎地忽略特定错误
- 使用 `// @ts-expect-error` 标记预期的错误
- 利用类型断言 `as` 处理复杂类型转换

## 最佳实践

### 1. 类型定义

```typescript
// ✅ 推荐：创建明确的接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// ✅ 推荐：使用联合类型
type Status = 'loading' | 'success' | 'error'

// ✅ 推荐：使用泛型
function createApiCall<T>(url: string): Promise<ApiResponse<T>> {
  return request.get(url)
}
```

### 2. 错误处理

```typescript
// ✅ 推荐：统一的错误处理
async function handleApiCall() {
  try {
    const result = await api.getUsers()
    return result
  } catch (error) {
    if (error instanceof Error) {
      console.error('API Error:', error.message)
    }
    throw error
  }
}
```

### 3. 类型守卫

```typescript
// ✅ 推荐：使用类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript 知道这里 value 是 string 类型
    console.log(value.toUpperCase())
  }
}
```

## 故障排除

### 常用检查命令

```bash
# 检查所有 TypeScript 错误
npx tsc --noEmit --strict

# 检查特定错误类型
npx tsc --noEmit --strict 2>&1 | grep "TS2307"

# 生成类型检查报告
npx tsc --noEmit --strict --pretty > typescript-errors.log
```

### 常见解决步骤

1. **重启 TypeScript 服务**
2. **清理缓存**: `rm -rf node_modules/.cache`
3. **重新安装依赖**: `npm ci`
4. **检查配置文件**: 确保 `tsconfig.json` 正确
5. **更新类型声明**: 检查 `path-aliases.d.ts`

## 总结

严格模式虽然增加了开发时的约束，但带来了以下好处：

- ✅ **更高的代码质量**：在编译时发现潜在问题
- ✅ **更好的 IDE 支持**：准确的类型提示和自动完成
- ✅ **更少的运行时错误**：类型安全减少了生产环境问题
- ✅ **更好的团队协作**：明确的类型契约提高代码可读性

通过遵循本文档的指导原则，可以充分利用 TypeScript 严格模式的优势，同时避免常见的陷阱。
