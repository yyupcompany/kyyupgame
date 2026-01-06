# 贡献指南

感谢您对幼儿园管理系统项目的关注！本文档将指导您如何为项目做出贡献。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request流程](#pull-request流程)
- [问题报告](#问题报告)

---

## 🤝 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们承诺：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

- 使用性化的语言或图像
- 人身攻击或侮辱性评论
- 公开或私下骚扰
- 未经许可发布他人的私人信息
- 其他不道德或不专业的行为

---

## 💡 如何贡献

### 贡献类型

您可以通过以下方式为项目做出贡献：

1. **报告Bug** - 发现并报告问题
2. **建议功能** - 提出新功能想法
3. **改进文档** - 完善项目文档
4. **提交代码** - 修复Bug或实现新功能
5. **代码审查** - 审查其他人的Pull Request
6. **测试** - 编写和运行测试

---

## 🔄 开发流程

### 1. Fork项目

```bash
# 在GitHub上Fork项目
# 然后克隆到本地
git clone https://github.com/YOUR_USERNAME/k.yyup.com.git
cd k.yyup.com
```

### 2. 添加上游仓库

```bash
git remote add upstream https://github.com/yyupcompany/k.yyup.com.git
```

### 3. 创建分支

```bash
# 从最新的master创建分支
git checkout master
git pull upstream master
git checkout -b feature/your-feature-name
```

**分支命名规范**:
- `feature/` - 新功能
- `fix/` - Bug修复
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关
- `chore/` - 构建/工具相关

### 4. 开发

```bash
# 安装依赖
npm run install:all

# 启动开发服务器
npm run start:all

# 进行开发...
```

### 5. 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm run test:unit
npm run test:integration
npm run test:e2e

# 检查代码质量
npm run lint
npm run typecheck
```

### 6. 提交

```bash
# 添加更改
git add .

# 提交（遵循提交规范）
git commit -m "feat: add new feature"

# 推送到您的Fork
git push origin feature/your-feature-name
```

### 7. 创建Pull Request

1. 访问您的Fork页面
2. 点击"New Pull Request"
3. 填写PR描述
4. 等待审查

---

## 📝 代码规范

### TypeScript规范

```typescript
// ✅ 好的做法
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  const user = await userService.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

// ❌ 不好的做法
function getUser(id) {  // 缺少类型
  return userService.findById(id);  // 缺少错误处理
}
```

### Vue组件规范

```vue
<!-- ✅ 好的做法 -->
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});

const emit = defineEmits<{
  update: [value: number];
}>();

const displayCount = computed(() => props.count);
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <p>Count: {{ displayCount }}</p>
  </div>
</template>

<style scoped>
.component {
  padding: 16px;
}
</style>
```

### 命名规范

**文件命名**:
- 组件: `PascalCase.vue` (例如: `StudentList.vue`)
- 工具函数: `kebab-case.ts` (例如: `format-date.ts`)
- 服务: `kebab-case.service.ts` (例如: `user.service.ts`)

**变量命名**:
- 变量/函数: `camelCase`
- 常量: `UPPER_SNAKE_CASE`
- 类/接口: `PascalCase`
- 私有属性: `_camelCase`

### 代码风格

- 使用2空格缩进
- 使用单引号
- 语句末尾加分号
- 每行最多120字符
- 使用ESLint和Prettier

---

## 📋 提交规范

### Commit Message格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关
- `revert`: 回滚

### 示例

```bash
# 新功能
git commit -m "feat(user): add user profile page"

# Bug修复
git commit -m "fix(auth): fix login token expiration issue"

# 文档
git commit -m "docs: update API documentation"

# 重构
git commit -m "refactor(service): extract common logic to base service"

# 性能优化
git commit -m "perf(query): optimize database query performance"
```

### 详细示例

```
feat(ai-operator): add performance monitoring service

- Add PerformanceMonitorService for metrics collection
- Implement P50/P95/P99 statistics
- Add system health check
- Generate performance reports

Closes #123
```

---

## 🔍 Pull Request流程

### PR标题

使用与Commit Message相同的格式：

```
feat(user): add user profile page
```

### PR描述模板

```markdown
## 描述
简要描述此PR的目的和内容

## 类型
- [ ] 新功能
- [ ] Bug修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 测试
- [ ] 其他

## 变更内容
- 变更1
- 变更2
- 变更3

## 测试
描述如何测试这些变更

## 截图（如果适用）
添加截图

## 相关Issue
Closes #123

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加/更新测试
- [ ] 所有测试通过
- [ ] 已更新文档
- [ ] 代码已经过自我审查
- [ ] 没有新的警告
```

### PR审查流程

1. **自动检查**
   - CI/CD流程自动运行
   - 代码风格检查
   - 测试执行
   - 构建验证

2. **代码审查**
   - 至少需要1个审查者批准
   - 解决所有审查意见
   - 保持代码质量

3. **合并**
   - 审查通过后合并到master
   - 使用Squash and Merge
   - 删除分支

---

## 🐛 问题报告

### Bug报告模板

```markdown
## Bug描述
清晰简洁地描述Bug

## 复现步骤
1. 访问 '...'
2. 点击 '...'
3. 滚动到 '...'
4. 看到错误

## 预期行为
描述您期望发生什么

## 实际行为
描述实际发生了什么

## 截图
如果适用，添加截图

## 环境
- OS: [例如 macOS 12.0]
- Browser: [例如 Chrome 95]
- Node版本: [例如 18.0.0]
- 项目版本: [例如 2.0.0]

## 附加信息
添加任何其他相关信息
```

### 功能请求模板

```markdown
## 功能描述
清晰简洁地描述您想要的功能

## 问题
这个功能解决什么问题？

## 建议的解决方案
描述您希望如何实现

## 替代方案
描述您考虑过的替代方案

## 附加信息
添加任何其他相关信息
```

---

## ✅ 代码审查清单

### 功能性
- [ ] 代码实现了预期功能
- [ ] 边界情况已处理
- [ ] 错误处理完善
- [ ] 性能可接受

### 代码质量
- [ ] 代码清晰易读
- [ ] 遵循项目规范
- [ ] 没有重复代码
- [ ] 适当的注释

### 测试
- [ ] 有足够的测试覆盖
- [ ] 测试用例有意义
- [ ] 所有测试通过

### 文档
- [ ] 代码有适当注释
- [ ] API文档已更新
- [ ] README已更新（如需要）

### 安全
- [ ] 没有安全漏洞
- [ ] 敏感数据已保护
- [ ] 输入已验证

---

## 📚 资源

### 文档
- [快速启动指南](./docs/QUICK_START_GUIDE.md)
- [项目最终总结](./docs/Project-Final-Summary.md)
- [AI Operator README](./server/src/services/ai-operator/README.md)

### 工具
- [ESLint配置](./.eslintrc.js)
- [Prettier配置](./.prettierrc)
- [TypeScript配置](./tsconfig.json)

---

## 🙏 致谢

感谢所有为项目做出贡献的开发者！

---

**最后更新**: 2025-10-05  
**版本**: 2.0.0

