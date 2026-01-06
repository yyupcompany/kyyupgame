# 移动端教师客户池页面

## 文件路径
- 主页面：`/client/src/pages/mobile/teacher-center/customer-pool/index.vue`
- API模块：`/client/src/api/modules/customer-pool.ts`

## 功能特性

### 1. 统计概览
- 总客户数
- 未分配客户数
- 已分配给我的客户数
- 已分配给他人的客户数

### 2. 筛选功能
- 搜索：支持客户姓名/电话搜索
- 分配状态筛选：未分配/已分配给我/已分配给他人
- 客户来源筛选：线上咨询/电话咨询/现场咨询/转介绍

### 3. 客户列表
- 移动端卡片式展示
- 支持无限滚动加载
- 批量选择功能（仅限未分配客户）
- 客户状态标签显示
- 一键申请跟踪

### 4. 批量操作
- 批量选择未分配客户
- 批量申请跟踪
- 申请理由填写
- 实时进度显示

### 5. 移动端优化
- 响应式设计，适配各种屏幕尺寸
- 触摸友好的交互设计
- 底部导航栏集成
- 安全区域适配

## API集成

### 客户池API
```typescript
// 获取客户池列表
customerPoolApi.getCustomers(params)

// 获取统计数据
customerPoolApi.getStats()

// 客户申请API
customerApplicationApi.applyForCustomers(params)
```

### API错误处理
- 自动fallback到模拟数据
- 开发环境错误提示
- 用户友好的错误消息

## 组件结构

### 主要组件
- `RoleBasedMobileLayout` - 基于角色的移动端布局
- `van-grid` - 统计卡片网格
- `van-list` - 客户列表
- `van-popup` - 弹窗组件
- `van-picker` - 选择器组件

### 交互组件
- 客户搜索框
- 状态筛选器
- 来源筛选器
- 申请对话框
- 批量操作栏

## 使用说明

1. **访问路径**：`/mobile/teacher-center/customer-pool`
2. **权限要求**：教师角色
3. **依赖库**：Vant 4、Vue 3、TypeScript

## 数据结构

### CustomerPoolCustomer
```typescript
interface CustomerPoolCustomer {
  id: number
  name: string
  phone: string
  source: string
  assigned_teacher_id?: number | null
  assignmentStatus: 'unassigned' | 'mine' | 'assigned'
  assignedTeacherName?: string
  createdAt: string
  updatedAt?: string
}
```

### CustomerPoolStats
```typescript
interface CustomerPoolStats {
  total: number
  unassigned: number
  mine: number
  assigned: number
}
```

## 测试建议

1. **功能测试**
   - 搜索功能测试
   - 筛选功能测试
   - 申请功能测试
   - 批量操作测试

2. **UI测试**
   - 响应式布局测试
   - 触摸交互测试
   - 加载状态测试
   - 错误状态测试

3. **性能测试**
   - 大量数据加载测试
   - 滚动性能测试
   - 内存使用测试

## 兼容性

- **浏览器**：Chrome 70+、Safari 12+、Android 7+
- **屏幕尺寸**：320px - 768px（移动端优化）
- **触摸设备**：完全支持触摸交互

## 注意事项

1. 页面使用了Vant 4组件库，请确保正确安装
2. API模块需要在后端实现对应的接口
3. 模拟数据仅用于开发测试，生产环境请使用真实API
4. 页面已集成权限控制，只有教师角色可以访问

## 扩展功能

未来可以考虑添加：
- 客户详情页
- 客户跟进记录
- 客户标签管理
- 客户转化统计
- 导出功能
- 消息推送