# API端点优化计划

## 当前问题
- **860个API端点过多，存在大量重复**
- 每个模块都重复定义基础CRUD操作 (`/`, `/:id`, `/stats`)
- 功能相似的端点散布在不同文件中
- 测试端点混入生产代码

## 优化目标
- 将860个端点精简至 **180-250个核心端点**
- 消除重复功能，统一API设计
- 提高代码可维护性

## 具体优化方案

### 1. 基础CRUD路由统一化
**问题**: 每个模块都重复定义 `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`

**解决方案**: 
- 创建通用CRUD中间件
- 每个资源只需配置资源名和特殊逻辑
- 预计减少 **200-300个重复端点**

```typescript
// 统一CRUD路由工厂
function createResourceRoutes(resourceName: string, controller: ResourceController) {
  return {
    [`GET /${resourceName}`]: controller.list,
    [`POST /${resourceName}`]: controller.create,
    [`GET /${resourceName}/:id`]: controller.get,
    [`PUT /${resourceName}/:id`]: controller.update,
    [`DELETE /${resourceName}/:id`]: controller.delete,
  }
}
```

### 2. 统计功能整合
**问题**: 
- `GET /statistics` - 16次重复
- `GET /stats` - 15次重复  
- 总计31个相似统计端点

**解决方案**:
```typescript
// 统一统计API
GET /api/statistics?module=enrollment&type=trend
GET /api/statistics?module=activities&type=summary
// 替代原有的分散统计端点
```
**预计减少**: **25-30个端点**

### 3. AI服务模块整合
**问题**: AI相关端点分散在多个文件中，功能重叠

**当前**: 28个AI端点分散在:
- `/ai/` 目录下8个文件
- `ai.ts` 主文件
- `ai-legacy.ts` 遗留版本

**解决方案**:
```typescript
// 整合为核心AI API
GET  /api/ai/conversations
POST /api/ai/conversations
GET  /api/ai/conversations/:id/messages
POST /api/ai/conversations/:id/messages
GET  /api/ai/models
POST /api/ai/feedback
```
**预计减少**: **15-20个端点**

### 4. 导出功能统一
**问题**: 多个模块重复实现导出功能

**解决方案**:
```typescript
// 统一导出API
POST /api/export
Body: {
  "module": "enrollment|activities|statistics",
  "format": "xlsx|pdf|csv",
  "filters": {...}
}
```
**预计减少**: **8-10个端点**

### 5. 删除测试和遗留端点
**需要清理的端点**:
- `test-*` 相关端点 (10+个)
- `activities-backup` 备份端点
- `ai-legacy` 遗留AI端点
- `poster-templates` 重复定义

**预计减少**: **15-20个端点**

### 6. 仪表板功能整合
**问题**: 22个仪表板相关端点功能重叠

**解决方案**:
```typescript
// 统一仪表板API
GET /api/dashboard?role=admin|principal|teacher
GET /api/dashboard/widgets?type=stats|charts|notices
```
**预计减少**: **15-18个端点**

## 分阶段实施计划

### 阶段1: 清理冗余 (立即执行)
1. 删除测试端点 (`test-*`)
2. 删除备份端点 (`*-backup`)  
3. 删除遗留端点 (`*-legacy`)
4. 合并重复的工具性端点

**预期结果**: 860 → 750个端点 (减少110个)

### 阶段2: 统计功能整合 (1-2天)
1. 创建统一统计API
2. 迁移现有统计端点
3. 更新前端调用

**预期结果**: 750 → 720个端点 (减少30个)

### 阶段3: CRUD标准化 (3-5天)
1. 创建CRUD中间件
2. 重构资源路由
3. 统一错误处理

**预期结果**: 720 → 450个端点 (减少270个)

### 阶段4: 业务功能整合 (5-7天)
1. AI服务整合
2. 导出功能统一
3. 仪表板功能合并

**预期结果**: 450 → 280个端点 (减少170个)

### 阶段5: 最终优化 (1-2天)
1. 性能优化
2. 文档更新
3. 测试验证

**最终目标**: **约250个核心端点**

## 优化收益

### 开发维护
- 代码量减少 **60-70%**
- API文档更清晰
- 测试用例减少
- Bug定位更容易

### 性能提升
- 路由匹配更快
- 内存占用减少
- 启动速度提升

### 用户体验
- API使用更一致
- 学习成本降低
- 错误处理统一

## 风险控制
1. **向后兼容**: 保留关键业务端点，添加废弃警告
2. **渐进迁移**: 分阶段实施，每阶段充分测试
3. **回滚准备**: 保留现有代码备份
4. **文档同步**: 及时更新API文档和前端调用

## 结论
通过系统性的API整合优化，可以将860个端点精简至250个左右，大幅提升系统的可维护性和性能。建议按阶段实施，确保业务连续性。