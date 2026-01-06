# 自动化页面修复脚本

这个Python脚本使用Claude Code SDK自动修复幼儿园招生管理系统的前端页面，支持断线续传和进度保存。

## 快速开始

### 1. 一键安装
```bash
# 运行自动安装脚本
./install_claude_code.sh
```

### 2. 手动安装

#### 安装Claude Code CLI
```bash
npm install -g @anthropic-ai/claude-code
```

#### 安装Python依赖
```bash
pip install claude-code-sdk anyio
```

#### 设置API密钥
```bash
# 设置Anthropic API密钥
export ANTHROPIC_API_KEY="your-api-key-here"

# 或者添加到 ~/.bashrc
echo "export ANTHROPIC_API_KEY='your-api-key-here'" >> ~/.bashrc
```

### 3. 测试安装
```bash
# 测试Claude Code SDK
python3 test_claude_code.py

# 或使用Shell脚本测试
./run_auto_fix.sh --check
```

## 使用方法

### 基本用法

```bash
# 修复所有页面
python auto_fix_pages.py

# 列出所有页面
python auto_fix_pages.py --list

# 重置进度重新开始
python auto_fix_pages.py --reset

# 只修复系统管理页面
python auto_fix_pages.py --category system

# 只修复优先级1的页面
python auto_fix_pages.py --priority 1

# 组合使用
python auto_fix_pages.py --category education --reset
```

### 命令行参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--reset` | 重置进度，从头开始 | `--reset` |
| `--category` | 只修复指定分类的页面 | `--category system` |
| `--priority` | 只修复指定优先级的页面 | `--priority 1` |
| `--list` | 列出所有页面 | `--list` |

## 页面分类

| 分类 | 优先级 | 描述 | 页面数量 |
|------|--------|------|----------|
| system | 1,6 | 系统管理（用户、角色、权限、设置等） | 8个 |
| education | 2 | 教育管理（学生、教师、家长、班级） | 8个 |
| enrollment | 3 | 招生管理（计划、统计） | 5个 |
| activity | 4 | 活动管理（列表、创建、详情） | 3个 |
| ai | 5 | AI系统（对话、助手、记忆、模型） | 4个 |
| principal | 7 | 园长功能（仪表板、绩效、客户池） | 3个 |
| business | 8 | 业务扩展（统计、客户、广告、营销） | 6个 |

## 功能特性

### 1. 断线续传
- 自动保存进度到 `.auto_fix_progress.json`
- 支持中断后继续执行
- 跳过已完成的页面

### 2. 错误处理
- 自动重试失败的页面（最多3次）
- 详细的错误日志记录
- 优雅的异常处理

### 3. 进度跟踪
- 实时显示修复进度
- 记录成功和失败的页面
- 生成详细的执行日志

### 4. 智能提示词
- 根据页面分类生成专门的修复指导
- 包含完整的技术栈信息
- 提供具体的修复要求

## 输出格式

脚本使用Claude Code SDK的JSON输出格式，包含以下信息：

```json
{
  "type": "result",
  "subtype": "success",
  "total_cost_usd": 0.003,
  "is_error": false,
  "duration_ms": 1234,
  "duration_api_ms": 800,
  "num_turns": 6,
  "result": "修复结果文本...",
  "session_id": "abc123"
}
```

## 日志文件

- **进度文件**: `.auto_fix_progress.json` - 保存执行进度
- **日志文件**: `auto_fix.log` - 详细的执行日志

### 进度文件格式
```json
{
  "completed": ["client/src/views/system/User.vue"],
  "failed": [
    {
      "path": "client/src/views/system/Role.vue",
      "reason": "file_not_found",
      "timestamp": "2024-01-15T10:30:00"
    }
  ],
  "current_index": 1,
  "start_time": "2024-01-15T10:00:00"
}
```

## 修复策略

### 系统管理页面 (system)
- 实现CRUD操作（增删改查）
- 权限控制和角色验证
- 数据表格和分页
- 搜索和筛选功能

### 教育管理页面 (education)
- 学生/教师/家长信息管理
- 关联关系处理
- 详情页面和编辑功能
- 数据导入导出

### 招生管理页面 (enrollment)
- 招生计划管理
- 统计图表展示
- 报名流程处理
- 数据分析功能

### 活动管理页面 (activity)
- 活动列表和详情
- 活动创建和编辑
- 参与者管理
- 活动状态跟踪

### AI系统页面 (ai)
- 对话界面设计
- AI助手功能
- 记忆管理
- 模型配置

### 园长功能页面 (principal)
- 数据仪表板
- 绩效分析
- 客户池管理
- 决策支持

### 业务扩展页面 (business)
- 统计分析图表
- 客户关系管理
- 营销活动管理
- 应用集成

## 最佳实践

### 1. 分批执行
```bash
# 按优先级分批执行
python auto_fix_pages.py --priority 1  # 先修复核心功能
python auto_fix_pages.py --priority 2  # 再修复教育管理
python auto_fix_pages.py --priority 3  # 最后修复其他功能
```

### 2. 分类执行
```bash
# 按功能模块分别执行
python auto_fix_pages.py --category system
python auto_fix_pages.py --category education
python auto_fix_pages.py --category enrollment
```

### 3. 监控执行
```bash
# 实时查看日志
tail -f auto_fix.log

# 查看进度
cat .auto_fix_progress.json | jq '.'
```

## 故障排除

### 1. API密钥问题
```bash
# 检查API密钥是否设置
echo $ANTHROPIC_API_KEY

# 测试Claude Code CLI
claude -p "Hello world"
```

### 2. 依赖问题
```bash
# 重新安装依赖
pip uninstall claude-code-sdk anyio
pip install claude-code-sdk anyio

# 检查Claude Code版本
claude --version
```

### 3. 权限问题
```bash
# 确保脚本有执行权限
chmod +x auto_fix_pages.py

# 检查文件路径
ls -la client/src/views/
```

### 4. 重置和清理
```bash
# 重置进度
python auto_fix_pages.py --reset

# 清理日志
rm auto_fix.log .auto_fix_progress.json
```

## 注意事项

1. **备份代码**: 在运行脚本前请备份你的代码
2. **API费用**: 使用Claude API会产生费用，请注意控制
3. **网络连接**: 确保网络连接稳定
4. **文件权限**: 确保脚本有读写文件的权限
5. **中断恢复**: 可以随时中断脚本，下次运行会自动继续

## 示例输出

```
🚀 开始自动修复页面
总页面数: 37
已完成: 0
已失败: 0
开始修复页面: client/src/views/system/User.vue (分类: system, 优先级: 1)
✅ 页面修复成功: client/src/views/system/User.vue
开始修复页面: client/src/views/system/Role.vue (分类: system, 优先级: 1)
✅ 页面修复成功: client/src/views/system/Role.vue
...
🎉 自动修复完成！
✅ 成功: 35
❌ 失败: 2
```

## 支持

如果遇到问题，请检查：
1. Claude Code CLI是否正确安装
2. API密钥是否正确设置
3. Python依赖是否正确安装
4. 网络连接是否正常
