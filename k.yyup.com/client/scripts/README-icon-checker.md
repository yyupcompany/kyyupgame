# 图标映射检测脚本使用指南

## 🎯 功能介绍

这个脚本可以自动扫描项目中所有使用 `UnifiedIcon` 的组件，检查图标是否已正确映射，帮助你快速发现未映射的图标。

## 🚀 使用方法

### 方式一：直接运行脚本（推荐）
```bash
# 在 client 目录下运行
cd client
node scripts/check-unmapped-icons.js
```

### 方式二：使用 npm 脚本
```bash
# 在 client 目录下添加 package.json 脚本后运行
npm run check-icons
```

### 方式三：作为可执行文件运行
```bash
cd client
./scripts/check-unmapped-icons.js
```

## 📊 报告示例

运行脚本后会生成如下报告：

```
🔍 图标映射检测报告
================================================================================

📊 统计信息:
  总文件数: 156
  扫描文件数: 89
  总图标数: 245
  已映射图标: 243
  未映射图标: 2

❌ 未映射的图标列表:
--------------------------------------------------------------------------------
  📁 src/pages/TestPage.vue
    - Gamepad2
    - UnknownIcon

💡 建议:
  1. 检查图标名称是否正确
  2. 在 icon-mapping.ts 中添加映射
  3. 在 UnifiedIcon.vue 中添加图标定义

✅ 已映射的图标:
--------------------------------------------------------------------------------
  ✓ analytics
  ✓ bell
  ✓ briefcase
  ✓ calendar
  ✓ chat-square
  ... (更多)
```

## 🔍 检测规则

脚本会检查以下几种情况：

1. **已知图标名称**: 直接匹配已定义的图标
2. **kebab-case转换**: 自动转换驼峰命名（如 `LayoutDashboard` → `layout-dashboard`）
3. **别名映射**: 检查 `ICON_ALIASES` 中定义的映射
4. **重复检测**: 自动去重相同的图标名称

## 📝 扫描范围

默认扫描以下目录：
- `src/components` - 所有组件
- `src/pages` - 所有页面
- `src/layouts` - 所有布局

扫描以下文件类型：
- `.vue` 文件
- `.ts` 文件
- `.js` 文件

## 🛠️ 自定义配置

可以修改脚本顶部的配置来调整扫描范围：

```javascript
// 扫描目录配置
const SCAN_DIRS = [
  'src/components',
  'src/pages',
  'src/layouts'
]

// 文件扩展名
const FILE_EXTENSIONS = ['.vue', '.ts', '.js']
```

## 💡 使用建议

1. **定期运行**: 建议在添加新图标后运行此脚本
2. **CI集成**: 可以将此脚本集成到 CI/CD 流程中
3. **批量修复**: 根据报告批量修复未映射的图标

## 📋 输出文件

可以将报告保存到文件：
```bash
node scripts/check-unmapped-icons.js > icon-report.txt
```

## 🎉 最佳实践

1. **新图标**: 添加新图标时，确保在以下两个地方都添加：
   - `icon-mapping.ts` 中的 `ICON_ALIASES`
   - `UnifiedIcon.vue` 中的 `kindergartenIcons`

2. **命名规范**: 建议使用小写和连字符的命名方式（如 `my-icon`）

3. **检查控制台**: 运行脚本后，检查控制台是否有 UnifiedIcon 相关的警告信息

## ❓ 常见问题

**Q: 脚本运行缓慢怎么办？**
A: 可以通过修改 `SCAN_DIRS` 来缩小扫描范围

**Q: 如何忽略某些文件？**
A: 修改脚本中的目录过滤逻辑，添加忽略规则

**Q: 可以输出JSON格式吗？**
A: 目前是表格格式，后续可以添加 JSON 输出选项

## 📞 技术支持

如果遇到问题，请检查：
1. Node.js 版本是否 >= 12
2. 是否在 client 目录下运行
3. 图标映射文件是否存在

---
*最后更新: 2025-11-16*
