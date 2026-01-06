# 🎯 工具解说模板文档

> 模板 = 预设的固定文本，不需要调用AI

---

## 📊 什么是模板？

**模板**就是**预先写好的文字**，根据工具执行结果自动填充数字。

### 示例

```typescript
// 模板定义
'read_data_record': (result) => {
  const count = result.dataCount;  // 从结果中提取数字
  return `✅ 查询成功，找到 ${count} 条记录`;  // 填充到模板中
}

// 执行结果
result = { dataCount: 9 }

// 生成的文本
"✅ 查询成功，找到 9 条记录"  ← 这就是模板生成的解说
```

**不需要调用AI！直接字符串拼接！**

---

## 📋 所有工具的解说模板

### 🔍 数据查询类

```typescript
1. read_data_record（数据查询）
   模板："✅ 查询成功，找到 {count} 条记录"
   示例："✅ 查询成功，找到 9 条记录"

2. any_query（智能查询）
   模板："✅ 查询成功，找到 {count} 条数据"
   示例："✅ 查询成功，找到 15 条数据"

3. execute_database_query（数据库查询）
   模板："✅ 查询成功，找到 {count} 条记录"
   示例："✅ 查询成功，找到 3 条记录"
```

### 🧭 页面导航类

```typescript
4. navigate_to_page（页面导航）
   模板："✅ 页面导航成功"
   
5. navigate_back（返回上页）
   模板："✅ 已返回上一页"
```

### 📝 数据操作类

```typescript
6. create_student（创建学生）
   模板："✅ 学生信息已成功创建"

7. update_student（更新学生）
   模板："✅ 学生信息已更新"

8. delete_student（删除学生）
   模板："✅ 学生信息已删除"

9. get_student_detail（查看学生详情）
   模板："✅ 已获取学生详细信息"

10. create_teacher（创建教师）
    模板："✅ 教师信息已成功创建"

11. update_teacher（更新教师）
    模板："✅ 教师信息已更新"

12. create_class（创建班级）
    模板："✅ 班级已成功创建"

13. update_class（更新班级）
    模板："✅ 班级信息已更新"
```

### 🎨 UI渲染类

```typescript
14. render_component（展示数据）
    模板："✅ 已为您展示{componentType}"
    示例："✅ 已为您展示数据表格"
```

### 🔍 搜索类

```typescript
15. web_search（网络搜索）
    模板："✅ 搜索完成，找到 {count} 条结果"
    示例："✅ 搜索完成，找到 5 条结果"
```

### 📦 默认模板

```typescript
16. 其他工具（没有专门模板的）
    模板："✅ {工具中文名}执行成功"
    示例："✅ 页面截图执行成功"
```

---

## 🎯 模板 vs AI生成

### 模板（80%的工具）

```typescript
// 代码中预设的文本
const templates = {
  'read_data_record': (result) => `✅ 查询成功，找到 ${result.count} 条记录`
};

// 执行流程
工具返回 → 提取数字 → 填充模板 → 生成解说
0.1ms      0.1ms      0.1ms      完成

成本：0元  ✅
速度：<1ms ✅
```

### AI生成（20%的复杂工具）

```typescript
// 调用Flash模型生成
await callFlashModel({
  prompt: "用1-2句话解释这个工具结果",
  result: toolResult
});

// 执行流程
工具返回 → 调用API → 等待响应 → 生成解说
           1-2秒

成本：0.002元
速度：1-2秒
```

---

## 📝 调用前说明的模板

```typescript
const reasonTemplates = {
  'read_data_record': '让我查询一下数据库...',
  'any_query': '让我帮您查询相关数据...',
  'navigate_to_page': '好的，让我为您跳转页面...',
  'render_component': '让我为您展示数据...',
  'execute_activity_workflow': '好的，让我开始创建活动...',
  'web_search': '让我搜索相关信息...'
};
```

---

## ✅ 模板的优势

1. **速度极快**：<1毫秒
2. **成本为0**：不调用AI
3. **准确稳定**：固定格式
4. **易于维护**：代码中直接修改

---

## 🎊 总结

**模板就是预设的文字**，像这样：

```javascript
// 这就是模板！
"✅ 查询成功，找到 9 条记录"
"✅ 页面导航成功"
"✅ 学生信息已更新"
```

**不是AI生成的，是代码中写好的固定文本！**

80%的工具使用模板（0成本），只有20%复杂工具才调用Flash模型。
