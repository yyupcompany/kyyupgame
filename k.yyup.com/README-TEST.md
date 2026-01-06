# 后端AI工具完整测试指南

## 📋 测试概览

本测试套件覆盖所有 **27个后端AI工具**，包括：
- ✅ 正常场景测试
- ⚠️ 边缘情况测试
- ❌ 错误处理测试

## 🧪 测试工具清单

### 1. 数据库查询 (2个)
- `read_data_record` - 简单全量查询
- `any_query` - 复杂条件查询

### 2. 数据库CRUD (4个)
- `create_data_record` - 创建数据记录
- `update_data_record` - 更新数据记录
- `delete_data_record` - 删除数据记录
- `batch_import_data` - 批量导入数据

### 3. 网页操作 (9个)
- `navigate_to_page` - 页面导航
- `navigate_back` - 返回上一页
- `capture_screen` - 截图
- `fill_form` - 填写表单
- `type_text` - 输入文本
- `select_option` - 选择下拉选项
- `wait_for_condition` - 等待条件
- `console_monitor` - 控制台监控
- `web_search` - 网络搜索

### 4. 工作流 (6个)
- `analyze_task_complexity` - 任务复杂度分析
- `create_todo_list` - 创建任务清单
- `execute_activity_workflow` - 执行活动工作流
- `generate_complete_activity_plan` - 生成活动方案
- `import_teacher_data` - 导入教师数据
- `import_parent_data` - 导入家长数据

### 5. UI显示 (2个)
- `render_component` - 渲染UI组件
- `generate_html_preview` - 生成HTML预览

### 6. 文档生成 (4个)
- `generate_excel_report` - 生成Excel报表
- `generate_word_document` - 生成Word文档
- `generate_pdf_report` - 生成PDF报告
- `generate_ppt_presentation` - 生成PPT演示

## 🚀 运行测试

### 前提条件
1. 后端服务已启动（运行在 `http://localhost:3000`）
2. 已安装依赖：
```bash
npm install axios ts-node typescript @types/node
```

### 执行测试
```bash
# 运行完整测试套件
ts-node test-all-tools.ts

# 或者使用 npm script
npm run test:tools
```

### 配置

修改 `test-all-tools.ts` 中的配置：
```typescript
const API_BASE_URL = 'http://localhost:3000';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
```

## 📊 测试报告

测试完成后会生成：

### 1. 终端输出报告
```
╔════════════════════════════════════════════════╗
║              📊 测试报告                       ║
╚════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 总测试数: 50
✅ 通过: 48
❌ 失败: 2
📊 成功率: 96.00%
⏱️  总耗时: 45230ms
⏱️  平均耗时: 904.6ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. JSON详细报告
自动保存到 `test-results-{timestamp}.json`

报告包含：
- 每个测试的详细结果
- 响应时间
- 错误信息
- 响应数据

## 🧪 测试场景

### 正常场景
测试工具在标准条件下的表现：
- ✅ 有效的输入参数
- ✅ 正确的数据格式
- ✅ 合理的业务逻辑

### 边缘情况
测试工具对异常情况的处理：
- ⚠️ 空参数
- ⚠️ 不存在的ID
- ⚠️ 极限值
- ⚠️ 特殊字符
- ⚠️ 超长输入
- ⚠️ 矛盾指令

### 错误处理
测试工具的容错能力：
- ❌ 无效参数
- ❌ 权限不足
- ❌ 数据不存在
- ❌ 网络错误

## 📝 测试示例

### 示例1：正常场景
```typescript
// 测试 read_data_record 工具
await sendAIMessage('查询所有学生记录');
// 预期：成功返回学生数据列表
```

### 示例2：边缘情况
```typescript
// 测试 navigate_to_page 工具 - 不存在的页面
await sendAIMessage('转到xyz123页面');
// 预期：优雅处理，给出错误提示
```

### 示例3：多工具组合
```typescript
// 测试工具链调用
await sendAIMessage('查询所有学生，然后用表格展示，最后生成Excel报表');
// 预期：依次调用 read_data_record -> render_component -> generate_excel_report
```

## 🐛 问题排查

### 测试失败原因分析
1. **网络连接失败**
   - 检查后端服务是否启动
   - 确认端口3000未被占用

2. **认证失败**
   - 检查用户名密码是否正确
   - 确认用户有admin权限

3. **工具未注册**
   - 检查工具是否在 `tool-loader.service.ts` 中注册
   - 确认工具文件路径正确

4. **超时**
   - 增加 `timeout` 配置
   - 检查数据库连接

## 🔧 自定义测试

### 添加新测试
```typescript
// 在对应的测试函数中添加
await testTool('tool_name', '测试场景描述', async () => {
  const response = await sendAIMessage('你的测试消息');
  return response.includes('期望的内容');
});
```

### 跳过某些测试
```typescript
// 使用 optional 参数
await testTool('tool_name', '场景', async () => {
  // ... test logic
}, true); // true = 可选，失败不算错误
```

## 📈 性能基准

| 工具类型 | 预期响应时间 |
|---------|-------------|
| 数据查询 | < 1000ms |
| 数据库CRUD | < 1500ms |
| 网页操作 | < 2000ms |
| 工作流 | < 3000ms |
| UI显示 | < 1500ms |
| 文档生成 | < 5000ms |

## 🎯 测试目标

- ✅ 所有工具都能正确调用
- ✅ 边缘情况得到优雅处理
- ✅ 错误信息清晰明确
- ✅ 响应时间在合理范围内
- ✅ 成功率 > 95%

## 📞 支持

如遇问题：
1. 查看详细JSON报告
2. 检查后端日志
3. 验证工具注册状态
4. 确认数据库连接

## 🔄 持续改进

测试失败时：
1. 记录失败场景
2. 分析失败原因
3. 修复工具实现
4. 重新运行测试
5. 更新测试用例

---

**最后更新**: 2025-11-05
**测试工具数**: 27个
**测试场景数**: 50+个

