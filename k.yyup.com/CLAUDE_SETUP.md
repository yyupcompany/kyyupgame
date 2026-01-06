# Claude Code 安装和使用指南

## 📦 已安装组件

### 1. Claude Code CLI
- **包名**: `@anthropic-ai/claude-code`
- **版本**: 1.0.43
- **命令**: `claude`
- **安装位置**: `~/.nvm/versions/node/v22.11.0/lib/node_modules/@anthropic-ai/claude-code/`

### 2. Anthropic Python SDK
- **包名**: `anthropic`
- **版本**: 0.57.1
- **安装位置**: `./claude-env/` (虚拟环境)

## 🚀 快速开始

### 1. 设置API密钥
```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

### 2. 启动Claude Code
```bash
# 使用启动脚本
./start_claude.sh

# 或者直接启动
claude
```

### 3. 激活Python环境
```bash
source claude-env/bin/activate
```

## 📋 可用命令

### Claude CLI命令
- `claude` - 启动交互式会话
- `claude --help` - 查看帮助
- `claude --version` - 查看版本
- `claude config` - 管理配置
- `claude mcp` - 管理MCP服务器
- `claude --print "问题"` - 非交互式输出
- `claude -c` - 继续最近的对话
- `claude -r` - 恢复对话

### Python SDK使用
```python
from anthropic import Anthropic

client = Anthropic(api_key="your_api_key")
message = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=100,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## 🔧 配置选项

### 1. 全局配置
```bash
claude config set -g theme dark
claude config set -g model sonnet
```

### 2. 工具权限
```bash
claude --allowedTools "Bash Edit"
claude --disallowedTools "Bash(git:*)"
```

### 3. MCP服务器配置
```bash
claude mcp add server-name
claude mcp list
```

## 🎯 使用示例

### 1. 基本对话
```bash
claude
> 你好，请帮我写一个Python函数
```

### 2. 非交互式使用
```bash
claude --print "解释什么是递归"
```

### 3. 继续对话
```bash
claude -c
```

### 4. 指定模型
```bash
claude --model opus
```

## 📁 文件结构

```
project/
├── claude-env/              # Python虚拟环境
├── claude_examples.py       # Python SDK示例
├── start_claude.sh         # 启动脚本
├── CLAUDE_SETUP.md         # 本文档
└── ...
```

## 🔍 故障排除

### 1. 命令未找到
```bash
# 检查安装
npm list -g @anthropic-ai/claude-code

# 重新安装
npm install -g @anthropic-ai/claude-code
```

### 2. API密钥问题
```bash
# 检查环境变量
echo $ANTHROPIC_API_KEY

# 设置密钥
export ANTHROPIC_API_KEY=your_key
```

### 3. Python环境问题
```bash
# 重新创建虚拟环境
rm -rf claude-env
python3 -m venv claude-env
source claude-env/bin/activate
pip install anthropic
```

## 📚 更多资源

- [Claude Code 官方文档](https://docs.anthropic.com/claude/docs/claude-code)
- [Anthropic API 文档](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Python SDK 文档](https://github.com/anthropics/anthropic-sdk-python)

## 💡 使用技巧

1. **持续对话**: 使用 `-c` 参数继续之前的对话
2. **模型选择**: 使用 `--model` 参数选择不同的模型
3. **工具权限**: 使用 `--allowedTools` 和 `--disallowedTools` 控制工具访问
4. **调试模式**: 使用 `--debug` 参数启用调试模式
5. **批处理**: 使用 `--print` 参数进行非交互式处理

## 🛡️ 安全注意事项

- 不要在公共仓库中暴露API密钥
- 使用环境变量或配置文件管理密钥
- 定期轮换API密钥
- 谨慎使用 `--dangerously-skip-permissions` 参数 