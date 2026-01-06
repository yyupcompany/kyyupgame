# Claude Code 环境变量设置（已禁用）

## 📋 配置状态

### 1. CMD 自动启动设置（已禁用）
- ❌ **文件**: `setup-claude-env.bat` - 环境变量设置脚本（已清空）
- ❌ **注册表**: `setup-cmd-autorun.reg` - CMD自动运行配置（已注释）
- ✅ **禁用文件**: `disable-cmd-autorun.reg` - 禁用自动运行

**状态**: CMD 不再自动设置 Claude 环境变量

### 2. PowerShell 自动启动设置（已禁用）
- ✅ **配置文件**: `C:\Users\15098\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`（仅包含路径设置）
- ✅ **执行策略**: 已设置为 `RemoteSigned`
- ❌ **便捷脚本**: `claude-powershell.bat` - 启动脚本（环境变量已移除）

**状态**: PowerShell 不再自动加载 Claude 环境变量

## 🔧 环境变量配置

**注意：环境变量已被移除**

```
# 环境变量已被清除，如需使用请手动设置：
# ANTHROPIC_API_KEY=your-api-key-here
# ANTHROPIC_BASE_URL=your-base-url-here
# ANTHROPIC_AUTH_TOKEN=your-auth-token-here
```

## 🚀 使用方法

### CMD 使用
```cmd
# 直接使用（环境变量已自动设置）
claude --print "hello world"
```

### PowerShell 使用
```powershell
# 直接使用（环境变量已自动设置）
claude --print "hello world"

# 或者使用便捷启动脚本
.\claude-powershell.bat
```

## 🛠️ 管理命令

### 禁用自动设置
```cmd
# 禁用CMD自动运行
regedit /s disable-cmd-autorun.reg

# 删除PowerShell配置文件
del "C:\Users\15098\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
```

### 重新启用
```cmd
# 重新启用CMD自动运行
regedit /s setup-cmd-autorun.reg

# 重新创建PowerShell配置文件（运行setup-powershell-profile.ps1）
```

## ✅ 验证设置

### 检查环境变量
```cmd
# CMD中检查
echo %ANTHROPIC_API_KEY%

# PowerShell中检查
$env:ANTHROPIC_API_KEY
```

### 测试Claude命令
```cmd
claude --print "测试连接"
```

## 📝 注意事项

1. **安全性**: API密钥已硬编码在脚本中，请确保文件安全
2. **更新**: 如需更换API密钥，需要修改相应的脚本文件
3. **兼容性**: 适用于Windows 10/11系统
4. **权限**: 某些操作可能需要管理员权限

## 🔄 更新API密钥

如需更换API密钥，请修改以下文件：
1. `setup-claude-env.bat`
2. `C:\Users\15098\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
3. `claude-powershell.bat`
