# PowerShell 正确运行批处理文件的方式

## 🎯 问题原因
PowerShell出于安全考虑，不会自动执行当前目录的文件，需要明确指定路径。

## ✅ 正确的运行方式

### 在PowerShell中：
```powershell
.\start-all.bat
```

### 或者使用完整路径：
```powershell
./start-all.bat
```

## 🚀 多种启动方式

### 方法1：PowerShell中运行
```powershell
# 启动全部服务
.\start-all.bat

# 或者分别启动
.\start-backend.bat
.\start-frontend.bat
```

### 方法2：文件管理器双击
直接在文件夹中双击 `start-all.bat` 文件

### 方法3：命令提示符(CMD)
```cmd
start-all.bat
```

### 方法4：右键菜单
在文件上右键 → "以管理员身份运行"

## 🔧 如果还有问题

### 检查文件是否存在：
```powershell
ls *.bat
```

### 手动运行命令：
```powershell
# 启动后端
cd server
npm run dev

# 新开PowerShell窗口启动前端
cd client  
npm run dev
```

## 💡 推荐方式

**最简单**：直接在文件管理器中双击 `start-all.bat`
**最灵活**：在PowerShell中使用 `.\start-all.bat`