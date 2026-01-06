# 智能两层架构测试用例

## 🎯 测试目标
验证新的AI助手架构：
1. 第一层：工具概览（一句话描述）
2. 第二层：智能API搜索 + 安全执行

## 📋 测试场景

### 测试1: 智能API搜索能力
**用户请求**: "我想查找支持性别过滤的学生API"
**预期行为**:
- AI选择 api_search 工具
- 使用关键词 ["学生", "性别", "过滤"] 进行搜索
- 返回 students 实体作为最佳匹配
- 返回支持的过滤器列表

### 测试2: 搜索 + 执行组合
**用户请求**: "查询所有女生学生"
**预期行为**:
- AI先调用 api_search({ keywords: ["学生", "性别"] })
- 搜索返回最佳匹配：students 实体，支持 gender 过滤器
- AI再调用 read_data_record({ entity: "students", filters: { "gender": "female" } })
- 成功执行查询并返回结果

### 测试3: 功能分类搜索
**用户请求**: "搜索所有用户管理相关的API接口"
**预期行为**:
- AI调用 api_search({ category: "user_management" })
- 返回用户管理相关的所有实体（users, teachers, parents, roles等）

### 测试4: 需求驱动搜索
**用户请求**: "我需要一个能按班级查询学生，并且支持姓名字段的接口"
**预期行为**:
- AI调用 api_search({
    keywords: ["学生", "班级"],
    requiredFields: ["name"]
  })
- 返回 students 实体，确认支持 class_id 过滤器和 name 字段

### 测试5: 安全控制验证
**用户请求**: "查询财务数据"
**预期行为**:
- AI可能尝试访问 financial 相关实体
- read_data_record 会进行权限验证
- 返回适当的权限错误或允许的查询结果

## 🔍 预期结果检查

### 工具选择验证
- ✅ AI正确选择 api_search 工具用于API发现
- ✅ AI正确选择 read_data_record 工具用于数据执行
- ✅ AI知道如何组合使用这两个工具

### SSE事件验证
- ✅ 每个工具调用都有对应的 SSE事件
- ✅ tool_narration 事件提供清晰的进度反馈
- ✅ tool_call_start 和 tool_call_complete 事件正确发送

### 安全控制验证
- ✅ read_data_record 执行权限检查
- ✅ 不合适的查询被适当拒绝
- ✅ 敏感数据得到保护

## 📊 性能指标

### Token使用效率
- 第一层工具选择：< 100 tokens
- 第二层详细说明：< 1000 tokens
- 实际查询执行：按需 tokens

### 响应时间
- api_search 搜索：< 1秒
- read_data_record 执行：< 2 秒
- 整体查询：< 5 秒

## 🚀 测试命令示例

```bash
# 测试1: 智能API搜索
curl -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "message": "我想查找支持性别过滤的学生API",
    "context": { "role": "admin", "enableTools": true }
  }' --no-buffer

# 测试2: 搜索+执行组合
curl -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "message": "查询所有女生学生",
    "context": { "role": "admin", "enableTools": true }
  }' --no-buffer
```