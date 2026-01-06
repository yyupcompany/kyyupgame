# TypeScript 路径解析配置说明

## 概述

本项目使用了路径别名（Path Aliases）来简化模块导入，通过 `@/` 前缀来引用 `src/` 目录下的文件。为了确保 TypeScript 编译器能够正确解析这些路径别名，我们创建了专门的类型声明文件。

## 路径别名配置

### 1. Vite 配置 (`vite.config.ts`)

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### 2. TypeScript 配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/api/*": ["./src/api/*"],
      "@/components/*": ["./src/components/*"],
      "@/composables/*": ["./src/composables/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/layouts/*": ["./src/layouts/*"],
      "@/router/*": ["./src/router/*"],
      "@/services/*": ["./src/services/*"],
      "@/config/*": ["./src/config/*"],
      "@/mock/*": ["./src/mock/*"],
      "@/directives/*": ["./src/directives/*"],
      "@/plugins/*": ["./src/plugins/*"]
    }
  }
}
```

### 3. 路径别名类型声明 (`src/types/path-aliases.d.ts`)

这是解决 TS2307 错误的关键文件，为所有路径别名提供了完整的类型声明。

## 严格模式下的注意事项

### TypeScript 严格模式配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 常见问题与解决方案

#### 1. TS2307: Cannot find module '@/...' 错误

**问题**: TypeScript 编译器无法解析路径别名

**解决方案**: 
- 确保 `src/types/path-aliases.d.ts` 文件存在
- 检查 `tsconfig.json` 中是否包含了该文件
- 验证路径别名声明是否完整

#### 2. TS2305: Module has no exported member 错误

**问题**: 模块导出成员不匹配

**解决方案**:
- 检查实际模块的导出内容
- 更新 `path-aliases.d.ts` 中的类型声明
- 确保导出签名与实际代码一致

#### 3. 模块解析策略

在严格模式下，推荐使用以下配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "isolatedModules": true
  }
}
```

## 路径别名使用规范

### 推荐的导入方式

```typescript
// ✅ 推荐：使用路径别名
import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/stores/user'

// ❌ 不推荐：相对路径
import { request } from '../../../utils/request'
import type { ApiResponse } from '../../types/api'
```

### 支持的路径别名

| 别名 | 对应路径 | 用途 |
|------|----------|------|
| `@/api/*` | `src/api/*` | API 接口定义 |
| `@/components/*` | `src/components/*` | Vue 组件 |
| `@/composables/*` | `src/composables/*` | 组合式函数 |
| `@/stores/*` | `src/stores/*` | 状态管理 |
| `@/utils/*` | `src/utils/*` | 工具函数 |
| `@/types/*` | `src/types/*` | 类型定义 |
| `@/styles/*` | `src/styles/*` | 样式文件 |
| `@/pages/*` | `src/pages/*` | 页面组件 |
| `@/layouts/*` | `src/layouts/*` | 布局组件 |
| `@/router/*` | `src/router/*` | 路由配置 |
| `@/services/*` | `src/services/*` | 业务服务 |
| `@/config/*` | `src/config/*` | 配置文件 |
| `@/mock/*` | `src/mock/*` | 模拟数据 |
| `@/directives/*` | `src/directives/*` | Vue 指令 |
| `@/plugins/*` | `src/plugins/*` | 插件 |

## 维护指南

### 添加新模块时

1. **创建新文件**后，如果使用了新的路径别名模式
2. **更新** `src/types/path-aliases.d.ts` 文件
3. **添加对应的模块声明**

示例：
```typescript
// 新增模块声明
declare module '@/services/new-service' {
  export * from '../services/new-service'
}
```

### 重构路径时

1. **同步更新** `tsconfig.json` 中的 paths 配置
2. **更新** `path-aliases.d.ts` 中的声明
3. **运行类型检查** 确保无错误

### 验证配置

运行以下命令验证路径解析配置：

```bash
# 检查 TypeScript 错误
npx tsc --noEmit --strict

# 检查特定的路径解析错误
npx tsc --noEmit --strict 2>&1 | Select-String "TS2307"
```

## 最佳实践

### 1. 保持一致性
- 始终使用路径别名而不是相对路径
- 遵循项目的目录结构约定

### 2. 类型安全
- 为所有导出提供准确的类型声明
- 定期检查类型声明与实际代码的一致性

### 3. IDE 支持
- 确保 IDE 能够正确识别路径别名
- 利用自动导入功能提高开发效率

### 4. 团队协作
- 新团队成员应了解路径别名配置
- 在代码审查中检查路径使用规范

## 故障排除

### 常见错误诊断

1. **检查文件是否存在**
   ```bash
   ls -la src/types/path-aliases.d.ts
   ```

2. **验证 tsconfig.json 配置**
   ```bash
   cat tsconfig.json | grep -A 20 "paths"
   ```

3. **重启 TypeScript 服务**
   - VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
   - 其他 IDE: 重启语言服务

### 性能优化

- 避免过度嵌套的路径别名
- 定期清理未使用的模块声明
- 使用 `skipLibCheck: true` 提高编译速度（仅在必要时）

## 总结

通过正确配置路径别名和类型声明，我们实现了：

- ✅ **零 TS2307 错误**：完全解决了模块路径解析问题
- ✅ **优秀的 IDE 体验**：代码提示、跳转、重构功能完美工作
- ✅ **严格模式兼容**：在 TypeScript 严格模式下正常工作
- ✅ **团队协作友好**：统一的导入规范和清晰的配置文档

这套配置为项目的长期维护和团队协作提供了坚实的基础。
