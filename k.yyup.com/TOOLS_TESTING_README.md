# 幼儿园AI助手工具测试指南

## 📚 目录

1. [工具概述](#工具概述)
2. [测试准备](#测试准备)
3. [批量测试](#批量测试)
4. [单独测试](#单独测试)
5. [查看结果](#查看结果)
6. [园长视角的使用建议](#园长视角的使用建议)

---

## 🛠️ 工具概述

我们的幼儿园AI助手系统包含36个强大的工具，分为9大类：

### 📊 工具分类

| 类别 | 工具数量 | 说明 |
|------|---------|------|
| 📚 数据查询与管理类 | 6个 | 数据的增删改查和批量操作 |
| 🎨 页面操作类 | 8个 | 页面导航、表单操作等 |
| ✅ 任务管理类 | 5个 | 任务分解、待办清单管理 |
| 🎭 UI展示类 | 2个 | 组件渲染、HTML预览 |
| 👨‍🏫 专家咨询类 | 4个 | 专业建议和专家指导 |
| 🔄 工作流类 | 2个 | 自动化工作流程 |
| 🌐 网络搜索类 | 1个 | 互联网信息搜索 |
| 📄 文档生成类 | 4个 | Excel、Word、PDF、PPT生成 |
| 🛠️ 其他工具类 | 4个 | 系统级辅助功能 |

### ✨ 特色功能

1. **园长语言风格** - 所有提示词都采用亲切温和的园长语言
2. **业务场景化** - 每个工具都针对幼儿园实际工作场景设计
3. **完整测试** - 提供完整的测试脚本和结果记录
4. **详细文档** - 包含工具说明书和使用指南

---

## 🔧 测试准备

### 环境要求

1. **后端服务运行中**
   ```bash
   # 确保后端服务在3000端口运行
   cd server && npm run dev
   ```

2. **获取JWT Token**
   - 登录系统后，从浏览器开发者工具中获取
   - 或使用API接口获取

### 设置Token

编辑 `batch_test_tools.sh` 文件，替换以下行：

```bash
# 找到这一行：
-H "Authorization: Bearer YOUR_JWT_TOKEN"

# 替换为：
-H "Authorization: Bearer YOUR_ACTUAL_JWT_TOKEN"
```

或使用环境变量：

```bash
export JWT_TOKEN="your_actual_jwt_token_here"
./batch_test_tools.sh
```

---

## 🚀 批量测试

### 运行批量测试

```bash
# 给脚本添加执行权限
chmod +x batch_test_tools.sh

# 运行批量测试
./batch_test_tools.sh
```

### 测试过程

批量测试脚本会：

1. **逐个测试36个工具** - 按照分类顺序进行
2. **发送HTTP请求** - 使用curl命令调用API
3. **保存响应结果** - 每个工具的结果保存在JSON文件
4. **显示进度** - 实时显示测试进度和结果

### 输出文件

- **目录**: `tool_test_results/`
- **文件**: `tool_编号_工具名称.json`
- **示例**:
  - `tool_1_any_query.json`
  - `tool_2_read_data_record.json`
  - `...`

---

## 🔍 单独测试

### 测试单个工具

```bash
# 给脚本添加执行权限
chmod +x test_single_tool.sh

# 测试特定工具
./test_single_tool.sh 1 any_query "请查询学生人数"
```

### 参数说明

```bash
./test_single_tool.sh <工具编号> <工具名称> [测试消息]

# 参数说明：
# - 工具编号: 1-36
# - 工具名称: 工具的英文名称
# - 测试消息: 自定义测试消息（可选）
```

### 示例

```bash
# 测试工具1 - any_query
./test_single_tool.sh 1 any_query "园长想了解学生总数"

# 测试工具22 - 招生策划咨询
./test_single_tool.sh 22 consult_recruitment_planner "幼儿园计划扩招新生"

# 测试工具29 - Excel报表生成
./test_single_tool.sh 29 generate_excel_report "生成学生成绩报表"
```

---

## 📊 查看结果

### 生成汇总报告

```bash
# 给脚本添加执行权限
chmod +x generate_test_summary.sh

# 生成汇总报告
./generate_test_summary.sh
```

### 查看单个工具结果

```bash
# 查看特定工具的测试结果
cat tool_test_results/tool_1_any_query.json

# 查看所有测试结果文件
ls -la tool_test_results/
```

### 分析测试结果

每个JSON文件包含：

1. **HTTP状态码** - 请求是否成功
2. **响应时间** - API调用耗时
3. **响应内容** - 服务器返回的完整数据
4. **事件序列** - SSE事件的完整序列

```json
{
  "type": "thinking_start",
  "content": "AI开始思考...",
  "timestamp": "2025-11-20T10:30:00Z"
}
```

---

## 👨‍🏫 园长视角的使用建议

### 💡 使用技巧

1. **优先使用智能工具**
   - `any_query` - 万能数据查询，日常最常用
   - `get_organization_status` - 快速了解幼儿园现状

2. **工作流自动化**
   - 复杂任务先用 `analyze_task_complexity` 分析
   - 然后用 `create_todo_list` 制定计划
   - 最后用 `execute_activity_workflow` 自动执行

3. **文档生成**
   - 月度报表 → `generate_excel_report`
   - 正式通知 → `generate_word_document`
   - 向教育局报告 → `generate_pdf_report`
   - 家长会PPT → `generate_ppt_presentation`

### 🎯 场景示例

#### 场景1：月度工作总结

```bash
# 1. 获取数据
./test_single_tool.sh 1 any_query "查询本月学生出勤情况和教学成果"

# 2. 分析数据
./test_single_tool.sh 29 generate_excel_report "生成月度工作总结Excel报表"

# 3. 制作PPT
./test_single_tool.sh 32 generate_ppt_presentation "制作月度工作汇报PPT"
```

#### 场景2：新学期准备

```bash
# 1. 分析任务复杂度
./test_single_tool.sh 15 analyze_task_complexity "分析新学期准备工作"

# 2. 创建待办清单
./test_single_tool.sh 16 create_todo_list "创建新学期准备工作清单"

# 3. 招生策划
./test_single_tool.sh 22 consult_recruitment_planner "制定新学期招生策略"

# 4. 批量导入学生信息
./test_single_tool.sh 6 batch_import_data "导入新学期学生信息"
```

#### 场景3：活动策划

```bash
# 1. 生成活动方案
./test_single_tool.sh 26 generate_complete_activity_plan "制定母亲节活动方案"

# 2. 执行工作流
./test_single_tool.sh 27 execute_activity_workflow "执行母亲节活动准备流程"

# 3. 制作通知文档
./test_single_tool.sh 30 generate_word_document "生成家长会通知"
```

### ⚠️ 注意事项

1. **权限控制**
   - 部分工具需要管理员权限
   - 教师角色只能使用部分工具

2. **数据安全**
   - 所有工具都在登录状态下使用
   - 不要泄露JWT Token

3. **网络要求**
   - 需要稳定的网络连接
   - 部分工具依赖外部服务

4. **定期备份**
   - 重要的测试结果请及时备份
   - 建议保存到云端或本地安全位置

---

## 📞 技术支持

### 常见问题

**Q: 测试失败，提示401未授权**
A: 请检查JWT Token是否正确设置，是否已过期

**Q: 响应时间过长**
A: 网络延迟或服务器负载高，请稍后重试

**Q: 结果文件为空**
A: 可能是服务器未启动或端口错误，请检查服务状态

### 联系方式

如有技术问题，请联系：
- 技术负责人：园长办公室
- 邮箱：tech-support@kindergarten.edu
- 电话：园内分机8888

---

## 📝 更新日志

### v1.0 (2025-11-20)
- ✅ 完成36个工具的测试脚本
- ✅ 创建园长视角的使用指南
- ✅ 实现批量测试和单独测试功能
- ✅ 提供完整的测试结果汇总工具

---

*最后更新: 2025-11-20*
