# 如何检查MCP Server配置状态

## 🔍 在Cursor中检查MCP配置

### 方法1: 通过Cursor设置界面检查

1. **打开Cursor设置**
   - 点击左下角的设置图标（⚙️）
   - 选择"Settings" 或 "设置"

2. **查看MCP配置**
   - 在左侧菜单中找到"MCP"选项
   - 点击进入MCP配置页面
   - 这里会显示所有已配置的MCP服务器

3. **检查服务器状态**
   - 绿色圆点：服务器运行正常
   - 红色圆点：服务器连接失败
   - 灰色圆点：服务器未启动

### 方法2: 通过聊天界面测试

在Cursor的聊天窗口中输入以下测试命令：

```
@playwright 帮我打开浏览器
```

或者：

```
请使用playwright打开 http://localhost:5173
```

**成功标志：**
- AI回复表示可以执行playwright操作
- 实际打开了浏览器窗口

**失败标志：**
- AI回复"我无法访问playwright功能"
- 出现MCP连接错误信息

### 方法3: 检查Cursor日志

1. **打开开发者工具**
   - 按 `Ctrl+Shift+I` (Windows) 或 `Cmd+Option+I` (Mac)
   - 或者通过菜单：Help > Toggle Developer Tools

2. **查看Console日志**
   - 切换到Console标签
   - 查找MCP相关的日志信息
   - 成功连接会显示类似：`MCP server 'playwright' connected`

3. **查看Network标签**
   - 切换到Network标签
   - 查看是否有MCP相关的网络请求

## 📋 配置文件位置

### Windows系统
```
%APPDATA%\Cursor\User\settings.json
```

### macOS系统
```
~/Library/Application Support/Cursor/User/settings.json
```

### Linux系统
```
~/.config/Cursor/User/settings.json
```

## 🛠️ 常见问题排查

### 1. MCP服务器显示为离线
**可能原因：**
- npm包未正确安装
- 网络连接问题
- 权限不足

**解决方法：**
```bash
# 检查npm是否可用
npm --version

# 手动安装playwright MCP
npm install -g @playwright/mcp

# 检查playwright是否安装
npx playwright --version
```

### 2. 找不到MCP设置选项
**可能原因：**
- Cursor版本过旧
- 功能未启用

**解决方法：**
- 更新Cursor到最新版本
- 检查是否在设置中启用了MCP功能

### 3. 权限错误
**Windows解决方法：**
```cmd
# 以管理员身份运行命令提示符
npm install -g @playwright/mcp
```

**Linux/macOS解决方法：**
```bash
# 使用sudo安装
sudo npm install -g @playwright/mcp
```

## ✅ 验证清单

- [ ] Cursor设置中可以看到MCP选项
- [ ] playwright服务器显示为已连接（绿色状态）
- [ ] 在聊天中可以调用playwright功能
- [ ] 开发者工具中没有MCP错误日志
- [ ] 可以成功打开浏览器并执行自动化操作

## 🎯 测试命令

配置成功后，你可以尝试这些命令：

```
1. 打开浏览器并访问项目首页
2. 截取当前页面截图
3. 帮我测试登录功能
4. 检查页面是否有硬编码数据
5. 模拟用户点击操作
```

如果这些命令都能正常执行，说明MCP Playwright配置成功！
