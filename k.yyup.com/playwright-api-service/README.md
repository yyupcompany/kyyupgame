# Playwright API Service

完整的 Playwright 浏览器自动化 API 服务，替代 MCP Playwright。

## 🎯 核心优势

- ✅ **零上下文消耗** - 生成脚本后独立运行
- ✅ **极快执行速度** - 无协议开销
- ✅ **完全可控** - 代码透明，易于调试
- ✅ **无限次执行** - 不受限制
- ✅ **免费使用** - 无需订阅

## 🚀 快速开始

### 1. 安装依赖

```bash
cd playwright-api-service
npm install
```

### 2. 基本使用

```typescript
import { playwright } from './src';

async function main() {
  await playwright.start('http://localhost:5173');

  await playwright.page.wait(2000);

  await playwright.screenshot.saveScreenshot('page.png');

  await playwright.close();
}

main();
```

### 3. 运行脚本

```bash
npx ts-node your-script.ts
```

## 📚 API 文档

完整 API 参考：[../.claude/skills/playwright-master/api-reference.md](../.claude/skills/playwright-master/api-reference.md)

使用示例：[../.claude/skills/playwright-master/examples.md](../.claude/skills/playwright-master/examples.md)

## 🎨 Claude Code Skill

此服务已集成到 Claude Code Skill 中！

当你在 Claude Code 中请求浏览器自动化任务时，AI 会自动：

1. 分析你的需求
2. 选择合适的 API
3. 生成完整的 TypeScript 脚本
4. 提供执行说明

**无需手动调用 MCP 工具！**

## 📋 项目结构

```
playwright-api-service/
├── src/
│   ├── index.ts                 # 主入口
│   ├── browser-manager.ts       # 浏览器管理
│   ├── page-operations.ts       # 页面操作
│   ├── element-operations.ts    # 元素操作
│   ├── console-monitor.ts       # 控制台监控
│   ├── network-monitor.ts       # 网络监控
│   ├── screenshot.ts            # 截图功能
│   └── types.ts                 # 类型定义
├── package.json
├── tsconfig.json
└── README.md
```

## 💡 使用场景

- ✅ 批量页面检查（100+ 页面）
- ✅ 自动化测试
- ✅ 表单自动填写
- ✅ 截图生成
- ✅ 控制台错误监控
- ✅ 网络请求分析
- ✅ 性能测试

## 🔥 与 MCP Playwright 对比

| 特性 | MCP Playwright | Playwright API Service |
|------|----------------|------------------------|
| 上下文消耗 | 高 (10k+ tokens) | 低 (仅生成时) |
| 执行速度 | 慢 (协议开销) | 快 (直接 API) |
| 可检查页面数 | ~18 个 (限制) | 无限 |
| 费用 | 需订阅 | 免费 |
| 自定义扩展 | 困难 | 简单 |

## 📝 许可证

MIT License
