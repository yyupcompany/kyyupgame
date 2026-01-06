# 批量导入工具使用指南

## 📋 概述

批量导入工具是一个AI驱动的智能数据导入系统，支持CSV、Excel、JSON等格式的文件批量导入到数据库。该工具具有以下特点：

- 🤖 **AI智能解析**: 自动识别字段映射和数据类型
- 📊 **数据验证**: 完整的数据验证和错误检测
- 👀 **预览确认**: 导入前提供详细预览和确认机制
- 🔄 **批量处理**: 支持大批量数据的分批处理
- 🛡️ **安全可靠**: 事务处理和错误回滚机制

## 🚀 快速开始

### 1. 准备测试数据

使用提供的测试文件：
```csv
姓名,邮箱,电话,角色,部门,性别,年龄,入职日期
张三,zhangsan@example.com,13800138001,teacher,教学部,male,28,2024-01-15
李四,lisi@example.com,13800138002,admin,管理部,female,32,2023-06-20
王五,wangwu@example.com,13800138003,principal,校长办,male,45,2022-03-10
```

### 2. AI对话触发

用户可以通过以下关键词触发批量导入：

**触发关键词**：
- "批量导入用户数据"
- "导入Excel文件到用户表"
- "批量添加员工信息"
- "上传CSV文件创建学生记录"

**示例对话**：
```
用户: 我想批量导入用户数据，有一个CSV文件包含姓名、邮箱、电话等信息
AI: 我来帮您批量导入用户数据。请提供CSV文件内容，我会智能分析字段映射并为您预览导入效果。
```

### 3. Function Call执行

AI会自动调用 `batch_import_data` 工具：

```typescript
{
  "name": "batch_import_data",
  "arguments": {
    "table_name": "users",
    "file_content": "姓名,邮箱,电话,角色...",
    "file_type": "csv",
    "description": "批量导入用户数据",
    "batch_size": 100,
    "auto_confirm": false
  }
}
```

## 🔧 工具参数说明

### 必填参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `table_name` | string | 目标数据表 | "users", "students", "teachers" |
| `file_content` | string | 文件内容 | CSV格式字符串或JSON字符串 |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `file_type` | string | "csv" | 文件类型：csv, json, excel |
| `description` | string | "" | 导入操作描述 |
| `batch_size` | number | 100 | 批量处理大小 |
| `auto_confirm` | boolean | false | 是否自动确认 |

## 📊 支持的数据表

| 表名 | 中文名称 | 业务中心 | 必填字段 |
|------|----------|----------|----------|
| users | 用户 | 人员中心 | name, email |
| students | 学生 | 人员中心 | name, age, kindergartenId |
| teachers | 教师 | 人员中心 | userId, kindergartenId, position |
| parents | 家长 | 人员中心 | name, phone |
| activities | 活动 | 活动中心 | title, description, startDate |
| classes | 班级 | 教学中心 | name, kindergartenId |
| enrollments | 招生 | 招生中心 | studentName, parentName, phone |
| todos | 任务 | 任务中心 | title, description |

## 🔍 字段映射规则

工具会自动识别以下字段映射：

### 用户表 (users)
```json
{
  "name": ["姓名", "名称", "name", "用户名"],
  "email": ["邮箱", "电子邮件", "email", "mail"],
  "phone": ["电话", "手机", "phone", "mobile"],
  "role": ["角色", "权限", "role", "用户类型"],
  "department": ["部门", "科室", "department"],
  "age": ["年龄", "age"],
  "gender": ["性别", "gender", "sex"]
}
```

### 学生表 (students)
```json
{
  "name": ["姓名", "学生姓名", "name"],
  "age": ["年龄", "age"],
  "gender": ["性别", "gender"],
  "classId": ["班级", "班级ID", "classId"],
  "parentId": ["家长", "家长ID", "parentId"]
}
```

## 📋 执行流程

### 第一阶段：文件解析
1. 解析文件内容（CSV/JSON/Excel）
2. 提取字段名称和数据记录
3. 生成数据统计信息

### 第二阶段：AI字段映射
1. 调用AI分析文档字段
2. 智能匹配数据库字段
3. 生成映射置信度评分

### 第三阶段：数据验证
1. 验证必填字段完整性
2. 检查数据类型正确性
3. 识别无效记录和错误

### 第四阶段：用户确认
1. 生成导入预览数据
2. 显示确认对话框
3. 等待用户确认或取消

### 第五阶段：批量执行
1. 分批调用API接口
2. 实时进度反馈
3. 错误处理和统计

## 🎯 返回结果格式

### 预览阶段 (pending_confirmation)
```json
{
  "name": "batch_import_data",
  "status": "pending_confirmation",
  "result": {
    "type": "batch_import_confirmation",
    "confirmation_data": {
      "operation_details": {
        "table_name": "users",
        "business_center": "人员中心",
        "api_endpoint": "/api/users",
        "description": "批量导入用户数据"
      },
      "data_summary": {
        "total_records": 3,
        "valid_records": 2,
        "invalid_records": 1,
        "success_rate": 67
      },
      "field_mappings": [...],
      "sample_data": {...},
      "validation_errors": [...]
    },
    "ui_instruction": {
      "type": "show_confirmation_dialog",
      "dialog_type": "batch_import_data",
      "title": "确认批量导入用户"
    }
  }
}
```

### 执行完成 (success)
```json
{
  "name": "batch_import_data",
  "status": "success",
  "result": {
    "type": "batch_import_result",
    "summary": {
      "total_records": 3,
      "success_count": 2,
      "failure_count": 1,
      "success_rate": 67
    },
    "details": {
      "inserted_ids": ["1", "2"],
      "errors": [...]
    }
  }
}
```

## 🔧 前端集成

### 1. 监听AI工具调用
```typescript
// 在AI助手组件中监听工具调用结果
const handleToolResult = (result: any) => {
  if (result.name === 'batch_import_data' && result.status === 'pending_confirmation') {
    // 显示批量导入确认对话框
    showBatchImportDialog(result.result.confirmation_data)
  }
}
```

### 2. 确认对话框组件
```vue
<BatchImportConfirmDialog
  v-model:visible="showDialog"
  :confirmation-data="confirmationData"
  @confirm="handleConfirmImport"
  @cancel="handleCancelImport"
  @adjust-mapping="handleAdjustMapping"
/>
```

### 3. 处理用户确认
```typescript
const handleConfirmImport = async (confirmationData: any) => {
  try {
    // 调用AI助手执行导入
    const result = await aiAssistant.executeConfirmedTool('batch_import_data', {
      ...confirmationData,
      _confirmed: true
    })
    
    // 显示导入结果
    showImportResult(result)
  } catch (error) {
    ElMessage.error('导入失败: ' + error.message)
  }
}
```

## 📝 测试验证

### 运行测试脚本
```bash
node test-batch-import-tool.cjs
```

### 测试覆盖
- ✅ CSV文件解析
- ✅ 字段映射分析
- ✅ 数据验证逻辑
- ✅ AI Function Call模拟
- ✅ 批量导入预览

### 测试结果
```
总测试数: 5
通过: 5
失败: 0
成功率: 100%
```

## ⚠️ 注意事项

### 数据限制
- 最大文件大小: 10MB
- 最大记录数: 10,000条
- 批量处理大小: 1-1000条

### 安全考虑
- 所有API调用都需要认证
- 数据验证严格执行
- 支持事务回滚

### 性能优化
- 分批处理避免内存溢出
- 异步执行提高响应速度
- 进度反馈提升用户体验

## 🔗 相关文件

- `server/src/services/ai/tools/database-crud/batch-import-data.tool.ts` - 工具实现
- `server/src/services/ai/tools/core/tool-registry.service.ts` - 工具注册
- `BatchImportConfirmDialog.vue` - 前端确认组件
- `test-batch-import-tool.cjs` - 测试脚本
- `batch-import-keywords-config.json` - 关键词配置

## 📞 技术支持

如有问题，请参考：
1. 测试报告: `batch-import-test-report.json`
2. 关键词配置: `batch-import-keywords-config.json`
3. 示例数据: `test-user-import-data.csv`

---

**版本**: v1.0.0  
**最后更新**: 2025-10-08  
**开发团队**: Augment Agent Development Team
