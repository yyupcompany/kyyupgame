# Claude Code Hook 故障排除指南

## 问题诊断

Hook经常触发不了的主要原因：

### 1. 权限问题
**症状**: hook配置正确但无任何输出
**解决**: 确保hook命令在settings.local.json的权限列表中

```json
{
  "permissions": {
    "allow": [
      "Bash(echo:*)",
      "Bash(pwd)",
      "Bash(date)",
      "Bash(ls)"
    ]
  }
}
```

### 2. Matcher匹配问题
**症状**: 只有特定工具触发hook
**解决**: 使用精确的matcher语法

- `"Bash"` - 只匹配Bash工具
- `"Write|Edit"` - 匹配Write或Edit工具
- `".*"` - 匹配所有工具

### 3. 事件类型选择
**症状**: 事件不在预期时机触发
**解决**: 选择正确的hook事件

- `PostToolUse` - 工具执行后
- `PreToolUse` - 工具执行前
- `Stop` - 会话结束时
- `SessionStart` - 会话开始时

## 稳定配置示例

### 基础测试Hook
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[HOOK] Bash命令完成\""
          }
        ]
      }
    ]
  }
}
```

### 通用任务完成Hook
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|Task",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "✅ 任务完成，下一步？"
          }
        ]
      }
    ]
  }
}
```

## 调试步骤

1. 检查JSON格式: `cat ~/.claude/settings.json | jq .`
2. 验证权限配置: 查看settings.local.json
3. 使用简单命令测试: `echo "test"`
4. 重启Claude Code应用

## 常见错误

- 中文引号`""` vs ASCII引号`""`
- 权限规则语法错误
- matcher正则表达式错误
- 缺少必要的权限配置

## 最佳实践

1. 从简单配置开始测试
2. 使用command类型而非prompt进行调试
3. 确保所有hook命令都有对应权限
4. 配置更改后重启Claude Code