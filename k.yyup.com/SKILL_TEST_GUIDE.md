# 🎯 Skill 系统测试指南

## ✅ 第一步：MCP Playwright 已禁用

- ✅ 原始配置已备份到: `mcp_playwright_config.json.backup`
- ✅ MCP Playwright 已从配置中移除
- ✅ 保留了其他 MCP 服务（sequential-thinking, mysql）

---

## 🧪 第二步：测试 Skill 是否生效

### 测试方法 1：简单请求

**在当前对话中说：**

```
帮我创建一个脚本，访问 http://localhost:5173/dashboard 页面，
检查控制台是否有错误，如果有就截图保存。
```

### 预期结果

AI 应该：

1. ✅ **识别需求** - 这是浏览器自动化任务
2. ✅ **激活 Skill** - 自动激活 `playwright-master` Skill
3. ✅ **生成脚本** - 生成完整的 TypeScript 代码
4. ✅ **提供说明** - 告诉你如何运行脚本

**AI 应该生成类似这样的代码：**

```typescript
import { browserManager, pageOperations, consoleMonitor, screenshotService } from './playwright-api-service/src';

async function checkDashboard() {
  await browserManager.launch({ headless: true });

  // 开始监控控制台
  consoleMonitor.startMonitoring();

  // 访问页面
  await pageOperations.goto('http://localhost:5173/dashboard');
  await pageOperations.wait(2000);

  // 检查错误
  const errors = consoleMonitor.getErrors();

  if (errors.length > 0) {
    console.log(`❌ 发现 ${errors.length} 个控制台错误`);
    await screenshotService.saveScreenshot('dashboard-errors.png');

    // 输出错误详情
    errors.forEach((error, index) => {
      console.log(`错误 ${index + 1}: ${error.text}`);
    });
  } else {
    console.log('✅ 没有发现控制台错误');
  }

  await browserManager.close();
}

checkDashboard();
```

---

## ❌ 不应该出现的情况

如果 AI 说出以下内容，说明 Skill 未生效：

- ❌ "我将使用 MCP Playwright 工具..."
- ❌ "调用 mcp__playwright__init-browser..."
- ❌ "MCP Playwright 服务不可用..."

---

## 🔍 第三步：验证 Skill 文件

确认 Skill 文件存在且格式正确：

```bash
# 检查 Skill 文件
ls -la .claude/skills/playwright-master/

# 应该看到：
# SKILL.md           - Skill 定义（AI 会读取）
# api-reference.md   - API 文档
# examples.md        - 使用示例
```

---

## 🚀 第四步：运行生成的脚本

### 1. 安装依赖（首次）

```bash
cd playwright-api-service
npm install
```

### 2. 运行脚本

```bash
npx ts-node your-script.ts
```

### 3. 查看结果

脚本应该：
- ✅ 启动浏览器
- ✅ 访问页面
- ✅ 检查控制台
- ✅ 生成报告
- ✅ 如有错误则截图

---

## 🎯 更多测试用例

### 测试用例 2：批量检查

**说：**
```
帮我创建一个脚本，批量检查以下 5 个页面的控制台错误：
/dashboard
/ai/memory
/activities
/students
/teachers

对每个页面截图并生成 JSON 报告。
```

### 测试用例 3：自动登录

**说：**
```
创建一个自动登录脚本：
1. 访问 http://localhost:5173/login
2. 填写用户名 admin，密码 123456
3. 点击登录按钮
4. 验证是否跳转到 dashboard
5. 截图保存
```

### 测试用例 4：表单填写

**说：**
```
创建一个表单自动填写脚本，
填写学生报名表单的所有字段。
```

---

## 📊 对比验证

### MCP 方式（已禁用）

如果系统仍在使用 MCP，你会看到：

```
我将使用 MCP Playwright 工具来完成这个任务。

[调用 mcp__playwright__init-browser]
[调用 mcp__playwright__goto]
[调用 mcp__playwright__get-screenshot]

任务完成。
```

**特点：**
- 直接调用 MCP 工具
- 没有生成脚本代码
- 消耗大量上下文

### Skill 方式（新系统）

你应该看到：

```
我来创建一个脚本，使用 Playwright API Service 检查页面。

[生成完整的 TypeScript 代码]

运行方式：
cd playwright-api-service
npm install
npx ts-node check-dashboard.ts
```

**特点：**
- 生成完整脚本代码
- 提供执行说明
- 零上下文消耗

---

## 🐛 故障排查

### 问题 1：AI 仍在调用 MCP 工具

**可能原因：**
- Claude Code 缓存了旧配置
- 需要重启 Claude Code

**解决方案：**
1. 重启 Claude Code
2. 启动新会话
3. 再次测试

### 问题 2：AI 没有生成脚本

**可能原因：**
- Skill 文件格式错误
- 描述关键词不匹配

**解决方案：**
```bash
# 检查 Skill 文件
cat .claude/skills/playwright-master/SKILL.md | head -10
```

确认第一行是正确的 YAML 前置元数据：
```yaml
---
name: playwright-master
description: 完整的 Playwright 浏览器自动化 API。...
---
```

### 问题 3：脚本运行失败

**可能原因：**
- 依赖未安装
- TypeScript 编译错误

**解决方案：**
```bash
cd playwright-api-service
npm install
npm run build  # 编译 TypeScript
```

---

## ✅ 成功标志

如果测试成功，你会看到：

1. ✅ AI 生成了完整的 TypeScript 脚本
2. ✅ 脚本使用了 `playwright-api-service/src` 的 API
3. ✅ 没有提到 "MCP" 或 "mcp__playwright__*"
4. ✅ 脚本可以成功运行
5. ✅ 生成了预期的结果（报告、截图等）

---

## 🎉 下一步

测试成功后，你就可以：

1. ✅ **自由使用** - 在对话中随时请求浏览器自动化
2. ✅ **批量操作** - 检查 100+ 个页面不受限制
3. ✅ **重复执行** - 脚本可以无限次运行
4. ✅ **自定义扩展** - 修改脚本添加新功能
5. ✅ **团队共享** - 分享脚本给团队成员

---

**准备好了吗？在当前对话中说：**

```
帮我创建一个脚本，访问 localhost:5173/dashboard，
检查控制台错误，如果有就截图。
```

**让我们看看 Skill 系统是否正常工作！** 🚀
