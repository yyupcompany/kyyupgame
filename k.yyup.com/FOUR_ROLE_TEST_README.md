# 四角色完整测试系统使用指南

## 概述

这是一个为幼儿园管理系统设计的半自动化测试系统，用于测试四个角色（admin、园长、教师、家长）的所有页面功能。

## 测试范围

### 测试角色
- **Admin（系统管理员）**：约30个页面
- **园长**：约30个页面
- **教师**：约25个页面
- **家长**：约20个页面

### 测试内容
- **元素级测试**：检查页面元素是否正确渲染
- **功能级测试**：验证按钮、表单等交互功能
- **数据验证**：通过网络请求监控验证数据来源（非硬编码）
- **控制台监控**：检测JavaScript错误和警告

## 前置要求

### 1. 启动服务
确保前端和后端服务已启动：

```bash
# 启动后端服务
cd server
npm run dev

# 启动前端服务（新终端）
cd client
npm run dev
```

前端服务应该运行在 `http://localhost:5173`

### 2. 安装依赖
确保已安装Playwright：

```bash
cd client
npm install
npx playwright install
```

### 3. 测试数据
确保数据库有足够的测试数据：

```bash
npm run seed-data:complete
```

## 使用方法

### 方式1：使用运行脚本（推荐）

```bash
# 查看帮助
node scripts/run-four-role-test.js --help

# 测试所有角色
node scripts/run-four-role-test.js --all

# 测试指定角色
node scripts/run-four-role-test.js --role admin
node scripts/run-four-role-test.js --role principal
node scripts/run-four-role-test.js --role teacher
node scripts/run-four-role-test.js --role parent

# 测试多个角色
node scripts/run-four-role-test.js --role admin,principal

# 使用有头模式（显示浏览器）
node scripts/run-four-role-test.js --role teacher --headed

# 调试模式
node scripts/run-four-role-test.js --role parent --debug --headed
```

### 方式2：直接运行Playwright测试

```bash
cd client/tests/comprehensive-e2e

# 测试所有角色
npx playwright test

# 测试指定角色
npx playwright test --grep "Admin角色测试"
npx playwright test --grep "园长角色测试"
npx playwright test --grep "教师角色测试"
npx playwright test --grep "家长角色测试"

# 使用有头模式
npx playwright test --headed

# 调试模式
npx playwright test --debug
```

## 测试流程

### 1. 选择测试角色
- 使用命令行参数指定角色
- 或在交互式菜单中选择

### 2. 登录测试
- 使用快捷登录按钮登录
- 验证登录成功
- 验证跳转到正确的首页

### 3. 页面遍历测试
对每个角色的每个页面执行以下测试：

**元素级测试：**
- 检查页面是否正常加载
- 检查页面是否空白
- 检查是否有错误消息
- 检查是否有骨架屏或加载状态

**功能级测试：**
- 检测所有按钮的可点击性
- 检查按钮是否有事件监听器
- 检查按钮是否被遮挡
- 检查表单元素是否正常

**数据验证测试（网络请求监控）：**
- 监控所有API请求
- 检查API响应状态
- 验证数据是否来自API而非硬编码
- 检查是否有API错误
- 检查是否有空数据卡片/表格

**控制台错误检测：**
- 监控JavaScript错误
- 监控警告信息
- 监控资源加载错误

### 4. 生成测试报告
- 生成Markdown格式测试报告
- 生成汇总报告
- 保存到 `client/tests/comprehensive-e2e/reports/` 目录

## 测试报告

### 报告位置
```
client/tests/comprehensive-e2e/reports/
├── admin-report.md              # Admin角色测试报告
├── principal-report.md          # 园长角色测试报告
├── teacher-report.md            # 教师角色测试报告
├── parent-report.md             # 家长角色测试报告
└── summary-report.md            # 汇总报告
```

### 报告内容
每个角色的测试报告包含：

1. **测试概览**
   - 开始时间、结束时间
   - 测试时长

2. **汇总统计**
   - 测试页面数
   - 有问题的页面
   - 按钮问题数
   - 控制台错误数
   - 内容问题数
   - 数据问题数

3. **页面详细结果**
   - 每个页面的测试结果
   - 按钮检测详情
   - 控制台错误详情
   - 内容验证详情
   - 数据检查详情

4. **问题汇总**
   - 严重问题
   - 中等问题
   - 轻微问题

## 文件结构

```
client/tests/comprehensive-e2e/
├── config/
│   ├── test-users.ts              # 测试用户配置
│   └── page-routes.ts            # 页面路由配置
├── utils/
│   ├── login-helper.ts            # 登录辅助工具
│   ├── button-checker.ts          # 按钮检测器
│   ├── console-monitor.ts         # 控制台监控
│   ├── content-validator.ts       # 内容验证器
│   ├── data-checker.ts            # 数据检查器
│   ├── network-monitor.ts          # 网络监控器（新增）
│   └── reporter.ts               # 报告生成器
├── tests/
│   └── four-role-complete-test.spec.ts  # 主测试文件（新增）
├── reports/                      # 测试报告输出目录
├── screenshots/                  # 截图目录
└── playwright.config.ts           # Playwright配置（新增）
```

## 快捷登录

测试系统使用快捷登录功能，无需输入密码：

| 角色 | Token | 用户ID | 用户名 | 显示名称 |
|------|--------|--------|--------|----------|
| admin | `mock_dev_token_admin` | 121 | admin | 系统管理员 |
| 园长 | `mock_dev_token_principal` | 2 | principal | 园长 |
| 教师 | `mock_dev_token_teacher` | 3 | teacher | 教师 |
| 家长 | `mock_dev_token_parent` | 4 | test_parent | 家长 |

## 注意事项

1. **测试环境**：确保在开发环境运行（localhost）
2. **测试数据**：确保数据库有足够的测试数据
3. **网络监控**：网络请求监控可能会影响性能，建议在测试时关闭不必要的网络请求
4. **半自动化**：关键步骤需要人工确认，测试过程中不要关闭终端
5. **报告保存**：测试报告会覆盖同名文件，如需保留请备份
6. **浏览器依赖**：首次运行需要安装浏览器：`npx playwright install`

## 故障排除

### 问题1：测试失败，提示"登录失败"
**解决方案**：
- 确保前端服务运行在 `http://localhost:5173`
- 检查后端服务是否正常运行
- 检查数据库连接是否正常

### 问题2：页面加载超时
**解决方案**：
- 增加超时时间：修改 `playwright.config.ts` 中的 `timeout` 配置
- 检查网络连接
- 检查API响应时间

### 问题3：找不到测试文件
**解决方案**：
- 确保在正确的目录运行命令
- 检查文件路径是否正确

### 问题4：Playwright未安装
**解决方案**：
```bash
cd client
npm install
npx playwright install
```

## 后续优化

1. 添加更多测试用例（如表单提交、数据编辑等）
2. 添加性能测试（页面加载时间、API响应时间等）
3. 添加移动端测试
4. 添加CI/CD集成
5. 添加测试覆盖率统计

## 联系方式

如有问题，请联系开发团队。
