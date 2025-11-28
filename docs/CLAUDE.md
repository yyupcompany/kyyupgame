# Claude Code 项目说明

## 🧠 记忆系统

### 概述

本项目集成了Claude记忆系统，**用于自动记录和检索每次对话中的问题-解决方案知识库**。

### ⚠️ Claude必须遵守的记忆规则

#### 1. 自动记录对话
每次对话结束时，**Claude必须主动执行以下操作**：
- 记录用户的每个问题
- 记录Claude提供的解决方案
- 自动提取关键词并存储到记忆系统

#### 2. 记忆内容格式
每次对话需要记录到记忆系统：

**问题部分**:
- 用户的完整问题描述
- 涉及的技术栈和上下文

**解决方案部分**:
- Claude提供的完整解决方案
- 具体的操作步骤
- 关键代码片段
- 注意事项

**关键词**:
- 自动提取技术词汇（node、git、docker、redis等）
- 问题类型标签

#### 3. Claude操作流程

**每次对话结束后**：

```bash
# Claude必须执行
cd /home/zhgue/kyyupgame/docs/claude-memory

# 添加记忆记录
./memory.sh add --question "用户问题" --solution "完整解决方案"
```

**每次新对话开始时**：

```bash
# 加载历史记忆
./memory.sh start

# 将输出内容作为对话开头提供上下文
```

#### 4. 记忆内容示例

当用户问："如何解决Node.js内存泄漏问题" 时，Claude回答后必须记录：

```bash
./memory.sh add --question "如何解决Node.js内存泄漏问题" --solution "使用heapdump和node --inspect分析内存快照，定位泄漏源。步骤：1. 安装heapdump 2. 在关键位置调用heapdump.writeSnapshot() 3. 用Chrome DevTools分析快照文件 4. 查找可疑的闭包和全局对象"
```

#### 5. 搜索历史记录

当遇到类似问题时，Claude必须先搜索历史：

```bash
./memory.sh search "node"
./memory.sh search "git"
./memory.sh search "docker"
./memory.sh search "redis"
```

如果有相关历史记录，优先利用历史经验。

#### 6. 典型工作流

**对话前**：
1. Claude运行 `./memory.sh start` 加载历史记忆
2. 主动查看相关关键词的过往记录
3. 在回答中引用历史经验

**对话中**：
1. 根据历史记忆回答问题
2. 记录新学到的知识和解决方案

**对话后**：
1. Claude主动运行 `./memory.sh add` 记录本次对话
2. 更新记忆数据库

#### 7. 搜索示例

当用户提问时，Claude应该先尝试搜索：

```bash
# 搜索Node.js相关问题
./memory.sh search "node"

# 搜索Git操作问题
./memory.sh search "git"

# 搜索Docker相关
./memory.sh search "docker"

# 搜索Redis缓存问题
./memory.sh search "redis"
```

#### 8. 系统位置

**记忆系统目录**: `/home/zhgue/kyyupgame/docs/claude-memory/`
**数据文件**: `claude-memory.json`
**索引文件**: `claude-memory-index.json`

#### 9. Claude必须遵守的规则

1. **每次对话结束必须记录**：Claude不得跳过记录步骤
2. **自动提取关键词**：自动识别技术词汇（node、git、docker、redis、vue、react、nginx、mysql等）
3. **详细记录解决方案**：包含步骤、代码、注意事项
4. **搜索历史优先**：遇到类似问题时先查历史记录
5. **启动时加载记忆**：每次对话开始前必须运行 `./memory.sh start`

#### 10. 快速操作命令

```bash
# 初始化记忆数据库（首次使用）
cd /home/zhgue/kyyupgame/docs/claude-memory && ./memory.sh init

# 加载启动记忆
./memory.sh start

# 搜索历史
./memory.sh search "关键词"

# 查看最近记录
./memory.sh recent

# 添加记录
./memory.sh add

# 查看帮助
./memory.sh help
```

### 最佳实践

1. **Claude主动记忆**：每次对话结束，Claude必须主动记录
2. **问题描述完整**：记录用户问题的完整上下文
3. **解决方案详细**：包含步骤、代码片段、注意事项
4. **自动提取关键词**：识别所有技术栈相关词汇
5. **利用历史记忆**：回答新问题时优先查看历史记录
6. **启动时加载**：每次对话开始前自动加载历史记忆

### 系统特性

- ✅ 零依赖，纯JavaScript实现
- ✅ 智能关键词提取（支持技术词汇）
- ✅ 毫秒级搜索性能
- ✅ MD5哈希去重机制
- ✅ JSON文件本地存储
- ✅ **自动记录机制**（Claude执行）
- ✅ **历史记忆优先**（搜索后再回答）

---

## 项目结构

```
kyyupgame/
├── docs/                          # 项目文档
│   ├── CLAUDE.md                  # Claude使用说明（本文件）
│   └── claude-memory/             # 记忆系统
│       ├── memory-db.js           # 核心数据库
│       ├── memory-cli.js          # 命令行接口
│       ├── memory.sh              # Shell脚本
│       ├── README.md              # 记忆系统说明
│       └── claude-memory.json     # 记忆数据文件
├── kyyupgame/                     # 游戏主项目
└── client/                        # 前端客户端
```

## 技术栈

- **后端**: Node.js
- **前端**: Vue.js / React (移动端)
- **存储**: JSON本地文件
- **工具**: Claude记忆系统

## 开发规范

1. 保持代码风格一致
2. 及时更新文档
3. 使用记忆系统记录开发经验
4. 定期备份重要数据

---

## 🔗 相关链接

- [记忆系统README](claude-memory/README.md)
- Claude Code记忆系统版本: v1.0.0
