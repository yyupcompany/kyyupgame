# MCP Playwright 安装完成指南

## ✅ 安装状态

MCP Playwright 已成功安装并配置完成！

## 📁 文件结构

```
k.yyup.com/
├── mcp-config-playwright.json     # MCP Playwright 配置文件
├── start-mcp-playwright.sh       # 启动脚本
└── .playwright-mcp/
    └── output/                  # 输出目录（截图、视频、trace）
```

## 🚀 使用方法

### 1. 在 opencode 中配置 MCP

将以下配置添加到你的 opencode 设置中：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--headless",
        "--allow-unrestricted-file-access",
        "--shared-browser-context",
        "--save-trace",
        "--output-dir",
        "./.playwright-mcp/output"
      ]
    }
  }
}
```

### 2. 启动方式

#### 方式1：直接启动（推荐）
```bash
cd k.yyup.com
./start-mcp-playwright.sh headless    # 无头模式
./start-mcp-playwright.sh headed      # 有头模式
./start-mcp-playwright.sh debug       # 调试模式
```

#### 方式2：手动启动
```bash
# 无头模式（默认）
npx -y @playwright/mcp@latest \
  --headless \
  --allow-unrestricted-file-access \
  --shared-browser-context \
  --save-trace \
  --output-dir "./.playwright-mcp/output"

# 有头模式（调试用）
npx -y @playwright/mcp@latest \
  --allow-unrestricted-file-access \
  --shared-browser-context \
  --save-trace \
  --save-video=1280x720 \
  --output-dir "./.playwright-mcp/output"
```

## 🎯 功能特性

### ✅ 已启用功能
- **无限制文件访问** - 可访问项目所有文件
- **共享浏览器上下文** - 多客户端共享同一浏览器实例
- **自动保存Trace** - 记录所有操作轨迹
- **视频录制** - 有头模式下自动录制
- **多浏览器支持** - Chrome、Firefox、Safari、Edge

### 🔧 配置选项
- `--headless` - 无头模式（生产环境推荐）
- `--save-trace` - 保存性能轨迹
- `--save-video=1280x720` - 保存视频录制
- `--console-level debug` - 调试信息输出
- `--port 12306` - 自定义端口

## 📊 输出文件

MCP Playwright 会自动生成以下文件：

```
.playwright-mcp/output/
├── trace/              # 性能轨迹文件
├── video/              # 视频录制（有头模式）
├── screenshot/         # 截图文件
└── session/            # 会话状态文件
```

## 🔄 与 opencode 集成

### 在代码中使用
MCP Playwright 集成后，你可以在 opencode 中：

```typescript
// 让 opencode 使用 Playwright MCP
"请用 Playwright 打开 http://localhost:5173 并截图保存"

// 自动化浏览器操作
"请用 Playwright 测试登录功能，输入用户名 admin，密码 123456"
```

### 可用操作
- 🌐 **网页导航** - 打开任意URL
- 📸 **截图操作** - 保存页面截图
- 🎥 **视频录制** - 记录操作过程
- 🔍 **元素定位** - 通过CSS选择器或文本查找
- 📝 **文本输入** - 填写表单字段
- 🖱️ **点击操作** - 模拟鼠标点击
- ⌨️ **键盘输入** - 模拟键盘操作
- 📊 **性能分析** - 获取页面性能数据

## 🛠️ 故障排除

### 常见问题

#### 1. 端口占用
```bash
# 检查端口占用
lsof -i :12306

# 使用不同端口
npx -y @playwright/mcp@latest --port 12307
```

#### 2. 权限问题
```bash
# 确保脚本有执行权限
chmod +x start-mcp-playwright.sh

# 确保输出目录可写
mkdir -p .playwright-mcp/output
chmod 755 .playwright-mcp/output
```

#### 3. 依赖问题
```bash
# 重新安装 Playwright
npm install -g @playwright/mcp

# 安装浏览器
npx playwright install
```

## 📝 使用示例

### 示例1：自动化测试
```bash
# 启动 MCP 服务
./start-mcp-playwright.sh

# 在 opencode 中执行
"请用 Playwright 打开 http://localhost:5173，等待页面加载完成，然后截图保存为 homepage.png"
```

### 示例2：调试功能
```bash
# 启动调试模式
./start-mcp-playwright.sh debug

# 在 opencode 中执行
"请用 Playwright 测试学生管理页面的添加功能，记录每个步骤的截图"
```

## 🎉 完成！

你的 MCP Playwright 现在已经完全配置好，可以与 opencode 无缝协作使用了！

---
*最后更新：2026-01-22*