# Cursor MCP Playwright 配置指南

## 🎯 在Cursor中配置MCP Playwright服务器

### 方法1: 通过Cursor设置界面（推荐）

1. **打开Cursor设置**
   - 点击左下角的设置图标（⚙️）
   - 选择"Cursor 设置"

2. **添加MCP服务器**
   - 切换到"MCP"标签页
   - 点击"添加 MCP 服务器"按钮

3. **配置Playwright MCP服务器**
   ```
   名称: playwright
   命令: npx
   参数: @playwright/mcp
   ```

4. **高级配置（可选）**
   ```
   环境变量:
   PLAYWRIGHT_HEADLESS=false
   PLAYWRIGHT_SLOW_MO=1000
   PLAYWRIGHT_TIMEOUT=30000
   ```

### 方法2: 通过配置文件

如果你需要手动配置，可以在Cursor的配置目录中创建或编辑MCP配置文件：

**Windows路径**: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\config.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false",
        "PLAYWRIGHT_SLOW_MO": "1000",
        "PLAYWRIGHT_TIMEOUT": "30000"
      }
    }
  }
}
```

## 🚀 使用MCP Playwright

配置完成后，你可以在Cursor中：

1. **自动化浏览器操作**
   - 打开网页
   - 点击元素
   - 填写表单
   - 截图

2. **测试网页功能**
   - 检查页面加载
   - 验证用户交互
   - 测试API调用

3. **项目特定配置**
   - 基础URL: http://localhost:5173
   - API URL: http://localhost:3000
   - 测试用户凭据已配置

## 📋 验证配置

配置完成后，重启Cursor，然后：

1. 在聊天中询问："帮我打开浏览器并访问项目首页"
2. 如果MCP Playwright配置正确，AI将能够控制浏览器

## 🛠️ 故障排除

### 常见问题：

1. **MCP服务器未启动**
   - 检查网络连接
   - 确保npm可以访问@playwright/mcp包

2. **权限问题**
   - 确保Cursor有足够权限执行npx命令
   - 在Windows上可能需要管理员权限

3. **端口冲突**
   - 确保配置的端口没有被其他应用占用

### 调试步骤：

1. 检查Cursor的MCP日志
2. 验证playwright包是否正确安装
3. 测试基本的MCP连接

## 💡 最佳实践

1. **开发环境配置**
   - 使用非无头模式便于调试
   - 设置适当的慢动作延迟
   - 配置合理的超时时间

2. **生产环境配置**
   - 启用无头模式提高性能
   - 减少延迟时间
   - 增加错误重试机制

3. **安全考虑**
   - 不要在配置中硬编码敏感信息
   - 使用环境变量管理凭据
   - 定期更新MCP服务器版本
