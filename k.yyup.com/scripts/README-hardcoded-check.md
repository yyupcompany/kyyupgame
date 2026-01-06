# 后端硬编码数据检测工具

## 📋 功能说明

这个工具用于自动检测后端控制器中返回硬编码数据而不是从数据库查询的情况，帮助提高代码质量和数据一致性。

## 🚀 使用方法

### 运行检测

```bash
npm run check:hardcoded
```

### 查看报告

检测完成后，会在 `server/hardcoded-data-report.md` 生成详细报告。

## 🔍 检测内容

### 1. Mock 数据声明

检测类似以下模式的代码：

```typescript
const mockTemplates = [
  { id: 1, name: '模板1', ... },
  { id: 2, name: '模板2', ... }
];
```

### 2. 直接返回数组字面量

检测类似以下模式的代码：

```typescript
ApiResponse.success(res, [
  { id: 1, name: '数据1' },
  { id: 2, name: '数据2' }
], '成功');
```

### 3. Mock 相关注释

检测包含以下关键词的注释：
- mock
- 硬编码
- 临时数据
- 测试数据
- 假数据

## 📊 严重程度分级

### 🔴 高严重程度

**特征**：
- 返回大量硬编码数据（3个以上对象）
- 没有任何数据库查询
- 没有导入 Sequelize 模型

**建议**：应立即修复，将硬编码数据改为从数据库查询

**示例**：
```typescript
export const getTemplates = async (req: Request, res: Response) => {
  // ❌ 没有数据库查询，直接返回硬编码数据
  const mockTemplates = [
    { id: 1, name: '模板1' },
    { id: 2, name: '模板2' },
    { id: 3, name: '模板3' },
    { id: 4, name: '模板4' }
  ];
  
  ApiResponse.success(res, mockTemplates);
};
```

### 🟡 中严重程度

**特征**：
- 有数据库查询，但也返回硬编码数据
- 可能是降级方案或默认值
- 需要人工判断是否合理

**建议**：检查是否为合理的降级或默认值，如果不是应修复

**示例**：
```typescript
export const getTemplates = async (req: Request, res: Response) => {
  try {
    // ✅ 尝试从数据库查询
    const templates = await Template.findAll();
    
    if (templates.length === 0) {
      // ⚠️ 降级：返回默认模板
      const defaultTemplates = [
        { id: 1, name: '默认模板' }
      ];
      return ApiResponse.success(res, defaultTemplates);
    }
    
    ApiResponse.success(res, templates);
  } catch (error) {
    // ⚠️ 错误降级：返回空数组
    ApiResponse.success(res, []);
  }
};
```

### 🟢 低严重程度

**特征**：
- 只是注释提到 mock
- 配置或枚举值
- 不影响实际数据返回

**建议**：可能是配置或枚举值，需要人工判断是否需要修复

**示例**：
```typescript
export const getCategories = async (req: Request, res: Response) => {
  // 兼容测试数据 - 这只是注释，不影响实际逻辑
  const categories = await Category.findAll();
  ApiResponse.success(res, categories);
};
```

## 📈 报告示例

```markdown
# 后端硬编码数据检测报告

**生成时间**: 2025/10/1 22:25:17

## 📊 统计概览

- 总文件数: 86
- 扫描文件数: 80
- 发现问题: 32
- 高严重程度: 0
- 中严重程度: 28
- 低严重程度: 4

## 🔍 详细问题列表

### 1. poster-template.controller.ts

**文件路径**: `/server/src/controllers/poster-template.controller.ts`

**数据库查询**: ✅ 有

**Sequelize导入**: ✅ 有

**问题数量**: 1

#### 问题 1: Mock数据声明

- **严重程度**: 🟡 中
- **行号**: 128
- **变量名**: `mockTemplates`
- **数据规模**: 约 4 个对象

**代码片段**:

\`\`\`typescript
const mockTemplates = [
  {
    id: 1,
    name: '秋季入学招生海报',
    ...
  }
];
\`\`\`
```

## 🛠️ 修复建议

### 1. 将硬编码数据移到数据库

**修复前**：
```typescript
export const getTemplates = async (req: Request, res: Response) => {
  const mockTemplates = [
    { id: 1, name: '模板1' },
    { id: 2, name: '模板2' }
  ];
  
  ApiResponse.success(res, mockTemplates);
};
```

**修复后**：
```typescript
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await Template.findAll({
      where: { status: 1 },
      order: [['createdAt', 'DESC']]
    });
    
    ApiResponse.success(res, templates);
  } catch (error) {
    ApiResponse.handleError(res, error, '获取模板失败');
  }
};
```

### 2. 使用数据库种子数据

如果需要初始数据，应该使用数据库种子脚本：

```bash
# 创建种子数据脚本
cd server
npx sequelize-cli seed:generate --name demo-templates

# 编辑种子文件
# server/src/seeders/XXXXXX-demo-templates.js

# 运行种子数据
npx sequelize-cli db:seed:all
```

### 3. 合理的降级方案

如果确实需要降级方案，应该明确标注：

```typescript
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await Template.findAll();
    
    // 如果数据库为空，返回空数组而不是硬编码数据
    if (templates.length === 0) {
      console.warn('⚠️ 数据库中没有模板数据');
      return ApiResponse.success(res, [], '暂无模板数据');
    }
    
    ApiResponse.success(res, templates);
  } catch (error) {
    console.error('❌ 数据库查询失败，返回空数组作为降级方案');
    ApiResponse.success(res, [], '获取模板失败');
  }
};
```

## 🔧 配置说明

脚本配置位于 `scripts/check-hardcoded-data.cjs` 文件顶部：

```javascript
const CONFIG = {
  controllersDir: path.join(__dirname, '../server/src/controllers'),
  outputFile: path.join(__dirname, '../server/hardcoded-data-report.md'),
  excludeFiles: ['index.ts', 'base.controller.ts'],
};
```

### 配置项说明

- `controllersDir`: 控制器文件目录
- `outputFile`: 报告输出文件路径
- `excludeFiles`: 排除的文件列表

## 📝 最佳实践

### ✅ 推荐做法

1. **始终从数据库查询数据**
   ```typescript
   const data = await Model.findAll();
   ```

2. **使用数据库种子脚本初始化数据**
   ```bash
   npm run seed-data:basic
   ```

3. **明确的错误处理**
   ```typescript
   try {
     const data = await Model.findAll();
     ApiResponse.success(res, data);
   } catch (error) {
     ApiResponse.handleError(res, error);
   }
   ```

### ❌ 避免做法

1. **直接返回硬编码数组**
   ```typescript
   // ❌ 不推荐
   ApiResponse.success(res, [{ id: 1, name: 'test' }]);
   ```

2. **在控制器中定义大量 mock 数据**
   ```typescript
   // ❌ 不推荐
   const mockData = [
     { id: 1, ... },
     { id: 2, ... },
     // ... 很多数据
   ];
   ```

3. **没有错误处理的数据库查询**
   ```typescript
   // ❌ 不推荐
   const data = await Model.findAll();
   ApiResponse.success(res, data);
   ```

## 🎯 检测结果解读

### 零问题

```
总问题数: 0
  - 🔴 高严重程度: 0
  - 🟡 中严重程度: 0
  - 🟢 低严重程度: 0
```

**说明**：所有控制器都正确使用数据库查询，代码质量优秀！

### 有问题但无高严重程度

```
总问题数: 32
  - 🔴 高严重程度: 0
  - 🟡 中严重程度: 28
  - 🟢 低严重程度: 4
```

**说明**：存在一些硬编码数据，但都有数据库查询作为主要数据源，可能是降级方案或默认值，需要人工审查。

### 有高严重程度问题

```
总问题数: 45
  - 🔴 高严重程度: 5
  - 🟡 中严重程度: 35
  - 🟢 低严重程度: 5
```

**说明**：存在直接返回硬编码数据的情况，应立即修复！

## 🔄 持续集成

可以将此检测添加到 CI/CD 流程中：

```yaml
# .github/workflows/code-quality.yml
name: Code Quality Check

on: [push, pull_request]

jobs:
  check-hardcoded-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Check hardcoded data
        run: npm run check:hardcoded
      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: hardcoded-data-report
          path: server/hardcoded-data-report.md
```

## 📞 支持

如有问题或建议，请联系开发团队或提交 Issue。

