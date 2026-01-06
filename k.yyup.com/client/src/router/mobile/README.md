# 移动端分级路由架构

## 📁 文件结构

```
client/src/router/mobile/
├── index.ts                    # 移动端路由主入口
├── centers-routes.ts          # 管理中心路由 (20个中心)
├── teacher-center-routes.ts   # 教师中心路由 (15个功能)
├── parent-center-routes.ts    # 家长中心路由 (38个功能)
└── README.md                  # 架构说明文档
```

## 🏗️ 架构设计

### 1. 分级结构
- **一级路由**: `/mobile/centers`, `/mobile/teacher-center`, `/mobile/parent-center`
- **二级路由**: 各功能模块主页面
- **三级路由**: 详情页面、子功能页面

### 2. 路由命名规范
- 命名空间: `Mobile[Center][Feature]`
- 例如: `MobileTeacherDashboard`, `MobileParentAssessment`

## 📊 路由统计

### 管理中心 (centers-routes.ts)
- **总路由数**: 21个
- **核心功能**: 20个管理中心 + 1个首页
- **权限层级**: admin, principal, teacher

### 教师中心 (teacher-center-routes.ts)
- **总路由数**: 15个主功能 + 11个子路由 = 26个
- **核心功能**: 教学、活动、任务、考勤、绩效等
- **权限层级**: teacher

### 家长中心 (parent-center-routes.ts)
- **总路由数**: 12个主功能 + 26个子路由 = 38个
- **核心功能**: 孩子管理、测评系统、游戏、互动沟通等
- **权限层级**: parent

## 🔧 技术实现

### Vue Router 4 配置
```typescript
import { RouteRecordRaw } from 'vue-router'

const mobileRoutes: RouteRecordRaw[] = [
  {
    path: '/mobile/centers',
    name: 'MobileCentersIndex',
    component: MobileLayout,
    redirect: '/mobile/centers/dashboard',
    meta: {
      title: '管理中心',
      requiresAuth: true,
      roles: ['admin', 'principal', 'teacher'],
      icon: 'Grid'
    },
    children: [
      // 嵌套路由配置
    ]
  }
]
```

### 权限控制
- `requiresAuth`: 需要登录验证
- `roles`: 角色权限控制
- `hideInMenu`: 隐藏在菜单中
- `icon`: 图标标识

### 组件懒加载
```typescript
component: () => import('../../pages/mobile/centers/index.vue')
```

## 📱 移动端特性

### 1. 响应式布局
- 使用移动端专用的 `MobileLayout.vue`
- 适配移动设备屏幕尺寸
- 触摸友好的交互设计

### 2. 路径规范
- 统一前缀: `/mobile`
- 与PC端路径1:1对应
- 保持SEO友好

### 3. 导航模式
- 底部导航栏
- 汉堡菜单
- 手势支持

## 🎯 PC端 vs 移动端对应关系

| 功能模块 | PC端路径 | 移动端路径 | 状态 |
|---------|---------|-----------|------|
| 管理中心 | `/centers/*` | `/mobile/centers/*` | ✅ 完成 |
| 教师中心 | `/teacher-center/*` | `/mobile/teacher-center/*` | ✅ 完成 |
| 家长中心 | `/parent-center/*` | `/mobile/parent-center/*` | ✅ 完成 |

## 🚀 使用方法

### 1. 导入路由
```typescript
import { mobileRoutes } from '@/router/mobile'
```

### 2. 注册路由
```typescript
const router = createRouter({
  history: createWebHistory(),
  routes: [...pcRoutes, ...mobileRoutes]
})
```

### 3. 权限守卫
```typescript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.roles && !hasRole(to.meta.roles)) {
    next('/403')
  } else {
    next()
  }
})
```

## 📝 开发指南

### 1. 添加新路由
1. 在对应的路由文件中添加路由配置
2. 创建对应的Vue组件
3. 更新权限配置
4. 测试路由跳转

### 2. 权限配置
```typescript
meta: {
  requiresAuth: true,
  roles: ['admin', 'principal'], // 支持多角色
  icon: 'Setting',
  hideInMenu: false
}
```

### 3. 嵌套路由
```typescript
children: [
  {
    path: 'detail/:id',
    name: 'MobileDetail',
    component: () => import('./Detail.vue'),
    meta: {
      hideInMenu: true // 详情页不显示在菜单
    }
  }
]
```

## ⚠️ 注意事项

1. **路径一致性**: 移动端路径必须与PC端保持一致（添加`/mobile`前缀）
2. **权限继承**: 移动端权限配置与PC端完全相同
3. **组件路径**: 当前配置的组件路径需要实际对应的Vue组件
4. **类型安全**: 使用TypeScript确保路由类型安全

## 🔄 下一步工作

1. **创建移动端页面组件**: 根据路由配置创建对应的Vue组件
2. **创建移动端Layout组件**: 设计移动端专用布局
3. **集成路由系统**: 将移动端路由集成到主路由系统
4. **测试路由功能**: 验证所有路由跳转正常工作
5. **优化性能**: 实现代码分割和懒加载

---

*此文档描述了移动端分级路由架构的完整设计，确保与PC端功能1:1对应。*