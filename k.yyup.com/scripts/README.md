# UI组件修复验证工具

这个工具用于验证Vue组件是否符合UI修复标准，确保组件样式、图标使用、响应式设计等方面符合规范。

## 安装依赖

```bash
cd scripts
npm install
```

## 使用方法

### 验证所有组件
```bash
npm run validate
```

### 验证特定文件（需要修改脚本）
```bash
node validate-component-repair.js
```

## 验证标准

### 必需导入
- ✅ `@/styles/design-tokens.scss`
- ✅ `@/styles/list-components-optimization.scss`（列表类组件）

### 设计令牌使用
- ❌ 硬编码颜色值（#ffffff, rgb(255,255,255)等）
- ❌ 硬编码尺寸值（16px, 1rem等）
- ✅ 使用CSS变量（var(--bg-color), var(--spacing-lg)等）

### 图标系统
- ❌ Element Plus图标（@element-plus/icons-vue）
- ✅ UnifiedIcon组件
- ✅ 正确的name属性

### 响应式设计
- ✅ 媒体查询使用设计令牌断点
- ✅ 移动端适配
- ⚠️ 表格组件建议添加响应式

### CSS命名
- ⚠️ 建议使用BEM命名规范
- ⚠️ 避免使用下划线连接

## 输出说明

- ✅ **PASS**: 组件通过验证
- ❌ **FAIL**: 组件存在错误
- 🔴 **ERROR**: 必须修复的问题
- 🟡 **WARNING**: 建议优化的问题
- 🔵 **INFO**: 提示信息

## 修复建议

### 错误修复（必须）
1. 添加必需的样式导入语句
2. 替换Element Plus图标为UnifiedIcon
3. 确保UnifiedIcon组件正确导入和使用

### 警告优化（建议）
1. 使用CSS变量替换硬编码颜色和尺寸
2. 使用设计令牌断点替换硬编码断点
3. 采用BEM命名规范命名CSS类

## 示例输出

```
============================================================
           UI组件修复验证报告
============================================================

📊 总体统计:
  总文件数: 15
  通过文件: 12
  失败文件: 3
  错误数量: 5
  警告数量: 8

📋 详细结果:

✅ PASS src/components/QuickActionDialog.vue

❌ FAIL src/pages/ParentList.vue
   🔴 [ERROR] 缺少必需导入: @/styles/list-components-optimization.scss:5
   🟡 [WARNING] 发现硬编码颜色值: #409eff, #67c23a:15
   🔴 [ERROR] 使用了Element Plus图标，需要替换为UnifiedIcon:1

💡 修复建议:

🔴 错误修复:
  1. 添加必需的样式导入语句
  2. 替换Element Plus图标为UnifiedIcon
  3. 确保UnifiedIcon组件正确导入和使用

🟡 警告优化:
  1. 使用CSS变量替换硬编码颜色和尺寸
  2. 使用设计令牌断点替换硬编码断点
  3. 采用BEM命名规范命名CSS类

📝 总结:
  ❌ 发现 5 个错误，需要修复
  ⚠️  发现 8 个警告，建议优化

============================================================
```

## 自定义配置

可以修改 `validate-component-repair.js` 中的配置对象来自定义验证规则：

```javascript
const config = {
  // 必需导入的样式文件
  requiredImports: [
    '@/styles/design-tokens.scss',
    '@/styles/list-components-optimization.scss'
  ],

  // 检查的文件模式
  filePatterns: [
    '**/*.vue'
  ],

  // 忽略的目录
  ignoreDirs: [
    'node_modules',
    '.git',
    'dist',
    'build'
  ]
};
```

## 故障排除

### 找不到文件
确保在项目根目录运行脚本，或者修改 `projectRoot` 配置。

### 依赖安装失败
```bash
npm install chalk@4.1.2
```

### 权限问题
```bash
chmod +x validate-component-repair.js
```