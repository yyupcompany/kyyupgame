# 活动中心数据显示问题修复

## 🐛 问题描述

**现象**: 活动中心页面显示的数据都是0，没有正确反馈后端的数据

**原因**: 优化后的SQL查询使用了错误的字段名，导致数据库查询失败

## 🔍 问题分析

### 错误1: activity_evaluations 表字段错误

**错误的SQL**:
```sql
SELECT COALESCE(AVG(rating), 5) FROM activity_evaluations WHERE deleted_at IS NULL
```

**错误信息**:
```
Unknown column 'rating' in 'field list'
```

**正确的字段名**: `overall_rating`（不是 `rating`）

### 错误2: activity_registrations 表字段错误

**错误的SQL**:
```sql
SELECT ar.participant_name, ar.participant_phone
FROM activity_registrations ar
```

**错误信息**:
```
Unknown column 'ar.participant_name' in 'field list'
```

**正确的字段名**: 
- `contact_name`（不是 `participant_name`）
- `contact_phone`（不是 `participant_phone`）

## ✅ 修复方案

### 修复1: 更正评分字段

**文件**: `server/src/controllers/centers/activity-center.controller.ts`

**修改位置**: 第122行

```typescript
// 修改前
(SELECT COALESCE(AVG(rating), 5) FROM activity_evaluations WHERE deleted_at IS NULL) as averageRating

// 修改后
(SELECT COALESCE(AVG(overall_rating), 5) FROM activity_evaluations WHERE deleted_at IS NULL) as averageRating
```

### 修复2: 更正报名字段

**文件**: `server/src/controllers/centers/activity-center.controller.ts`

**修改位置**: 第214-215行

```typescript
// 修改前
ar.participant_name, ar.participant_phone

// 修改后
ar.contact_name, ar.contact_phone
```

## 📊 数据模型参考

### ActivityEvaluation 模型字段

```typescript
declare overallRating: number;           // 总体评分
declare contentRating: number | null;    // 内容评分
declare organizationRating: number | null; // 组织评分
declare environmentRating: number | null;  // 环境评分
declare serviceRating: number | null;      // 服务评分
```

### ActivityRegistration 模型字段

```typescript
declare contactName: string;      // 联系人姓名
declare contactPhone: string;     // 联系人电话
declare childName: string | null; // 儿童姓名
declare childAge: number | null;  // 儿童年龄
```

## 🔧 修复步骤

1. **修改SQL查询**
   ```bash
   # 编辑文件
   vim server/src/controllers/centers/activity-center.controller.ts
   ```

2. **重新编译TypeScript**
   ```bash
   npm run compile
   ```

3. **重启服务**
   ```bash
   npm run stop
   npm run start:all
   ```

## ✅ 验证结果

### 修复前
- ❌ 活动总数: 0
- ❌ 进行中活动: 0
- ❌ 报名总数: 0
- ❌ 平均评分: 5（默认值）

### 修复后
- ✅ 活动总数: 显示实际数据
- ✅ 进行中活动: 显示实际数据
- ✅ 报名总数: 显示实际数据
- ✅ 平均评分: 显示实际评分

## 📝 经验教训

### 1. 数据库字段命名规范

在编写SQL查询前，应该：
1. ✅ 查看数据模型定义
2. ✅ 确认实际的字段名
3. ✅ 使用正确的字段名

### 2. 错误处理机制

虽然代码有错误处理（返回默认值），但这掩盖了真正的问题：
```typescript
catch (error) {
  console.warn('⚠️ 活动统计数据查询失败，使用默认值:', error);
  return {
    totalActivities: 0,
    ongoingActivities: 0,
    totalRegistrations: 0,
    averageRating: 5
  };
}
```

**改进建议**: 
- 在开发环境应该抛出错误，而不是静默返回默认值
- 在生产环境可以返回默认值，但应该记录详细的错误日志

### 3. 测试的重要性

这个问题本应该在测试阶段发现：
- ✅ 应该有集成测试验证API返回的数据
- ✅ 应该有E2E测试验证页面显示的数据
- ✅ 应该在开发环境测试真实数据

## 🚀 后续优化建议

### 1. 添加字段验证

在查询前验证字段是否存在：
```typescript
// 获取表结构
const tableInfo = await sequelize.query('DESCRIBE activity_evaluations');
// 验证字段存在
if (!tableInfo.find(col => col.Field === 'overall_rating')) {
  throw new Error('Field overall_rating not found');
}
```

### 2. 使用ORM查询

使用Sequelize ORM而不是原生SQL：
```typescript
const stats = await ActivityEvaluation.findOne({
  attributes: [
    [sequelize.fn('AVG', sequelize.col('overall_rating')), 'averageRating']
  ],
  where: { deletedAt: null }
});
```

**优点**:
- ✅ 类型安全
- ✅ 自动字段映射
- ✅ 更好的错误提示

### 3. 添加数据验证测试

```typescript
describe('Activity Center API', () => {
  it('should return correct statistics', async () => {
    const response = await request(app)
      .get('/api/centers/activity/dashboard')
      .expect(200);
    
    expect(response.body.data.statistics).toBeDefined();
    expect(response.body.data.statistics.totalActivities).toBeGreaterThanOrEqual(0);
    expect(response.body.data.statistics.averageRating).toBeGreaterThanOrEqual(0);
  });
});
```

## 📚 相关文档

- [活动中心性能优化文档](./ACTIVITY_CENTER_OPTIMIZATION.md)
- [数据模型文档](../server/src/models/README.md)
- [API文档](http://localhost:3000/api-docs)

---

**修复时间**: 2025-10-04
**修复版本**: v1.0.1
**修复人**: AI Assistant

