# 项目文档

欢迎来到项目文档！本文档自动生成，包含项目的所有技术文档。

## 文档导航

### 核心文档
- [组件文档](./components.md) - 所有可复用组件的详细说明
- [API文档](./api.md) - 所有API接口的详细说明
- [Composables文档](./composables.md) - 所有可复用逻辑的详细说明

### TypeScript 配置文档
- [TypeScript 路径解析配置](./typescript-path-resolution.md) - 路径别名配置与 TS2307 错误解决方案
- [TypeScript 严格模式指南](./typescript-strict-mode.md) - 严格模式配置与常见问题解决

## 项目结构

```
src/
├── components/     # 可复用组件
├── composables/    # 可复用逻辑
├── api/           # API接口
├── pages/         # 页面组件
├── utils/         # 工具函数
├── types/         # 类型定义
└── styles/        # 样式文件
```

## 开发指南

### 组件开发

1. 所有组件应该放在 `src/components` 目录下
2. 组件应该有清晰的Props定义和文档注释
3. 组件应该是可复用的

### API开发

1. 所有API接口应该放在 `src/api` 目录下
2. API函数应该有清晰的类型定义
3. API函数应该有错误处理

### Composables开发

1. 所有可复用逻辑应该放在 `src/composables` 目录下
2. Composables应该有清晰的参数和返回值类型
3. Composables应该是纯函数或响应式的

---

*文档最后更新时间: 2025/9/11 00:37:47*
