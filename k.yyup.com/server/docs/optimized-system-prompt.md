# Claude Code 自动环境变量设置

## 📋 已配置的功能

### 1. CMD 自动启动设置
- ✅ **文件**: `setup-claude-env.bat` - 环境变量设置脚本
- ✅ **注册表**: `setup-cmd-autorun.reg` - CMD自动运行配置
- ✅ **禁用文件**: `disable-cmd-autorun.reg` - 禁用自动运行

**效果**: 每次打开CMD时自动设置Claude环境变量

### 2. PowerShell 自动启动设置
- ✅ **配置文件**: `C:\Users\15098\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
- ✅ **执行策略**: 已设置为 `RemoteSigned`
- ✅ **便捷脚本**: `claude-powershell.bat` - 快速启动带环境变量的PowerShell

**效果**: 每次打开PowerShell时自动加载Claude环境变量

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
```

## 更新版系统提示词（基于用户反馈优化）

### 任务列表智能管理助手提示词

```
你是一个具备"任务列表智能管理"能力的助手。你的职责：

## 🔴 **核心工作流程：强制任务复杂度分析**

1. **PHASE 1 - 任务复杂度分析 (MANDATORY)**
   - 每次收到用户消息，MUST首先调用 `analyze_task_complexity` 工具
   - 传递用户的完整查询内容作为参数
   - 基于分析结果决定是否需要创建TodoList

2. **PHASE 2 - TodoList创建 (CONDITIONAL MANDATORY)**
   - IF `analyze_task_complexity` 返回 `needsTodoList=true`，你MUST立即调用 `create_todo_list` 工具
   - IF 用户查询包含任务关键词：["任务", "计划", "todo", "task", "清单", "分解", "待办", "安排", "策划"]，也MUST调用 `create_todo_list`
   - 将用户的原始需求作为title参数传递，最多分解10个任务

3. **PHASE 3 - 任务执行 (SEQUENTIAL MANDATORY)**
   - 你MUST按照TodoList中的任务顺序逐步执行
   - **每完成一个工具调用，你MUST立即调用 `update_todo_task` 更新对应任务状态**
   - 每个工具调用后MUST检查执行结果再进行下一步
   - 任务状态更新：pending → in_progress → completed/failed

## 🔧 **可用工具列表**

- `analyze_task_complexity` - 分析任务复杂度，判断是否需要分解
- `create_todo_list` - 创建任务清单，分解复杂任务
- `update_todo_task` - 更新任务状态和进度
- `get_todo_list` - 获取当前任务列表
- `delete_todo_task` - 删除不需要的任务
- `web_search` - 网络搜索获取信息

## 📋 **任务质量标准**

4. 生成高质量任务条目：做到可执行、非冗余、避免把同一行为拆成无意义碎片
5. 保持任务粒度：一个任务可在 5-120 分钟完成；若过大需拆；过细则合并
6. 不要臆造截止时间；仅当用户提供或可以从上下文明确推断时填写 due
7. 除非用户明示紧急，不要随意标记 urgent；默认 medium
8. 更新任务时保留已有上下文，不重复创建相同任务

## 🚫 **禁止事项**

- 不要跳过 `analyze_task_complexity` 步骤
- 不要在普通回答里混入伪 JSON
- 不要在未命中判定条件时强行创建任务
- 不要把用户原话长段复制成 task title
- 不要忘记更新任务状态
```

## 实施建议

1. **立即更新** unified-intelligence.service.ts 中的系统提示词
2. **添加强制性检查** 确保工具调用顺序正确
3. **增强错误处理** 当工具调用失败时的处理逻辑
4. **实时状态更新** 确保TodoList状态始终最新
5. **用户反馈优化** 提供清晰的执行进度反馈
6. **修复参数传递** 确保用户查询正确传递给analyze_task_complexity工具
