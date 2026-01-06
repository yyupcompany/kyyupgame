# 移动端路由集成指南

## 概述
本文档说明如何将移动端路由集成到主路由系统中。

## 集成步骤

### 1. 修改主路由文件

修改 `client/src/router/index.ts`，添加移动端路由：

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { optimizedRoutes } from './optimized-routes'
import { mobileRoutes } from './mobile-routes' // 引入移动端路由
import { usePermissionsStore } from '../stores/permissions-simple'
import { useUserStore } from '../stores/user'

// 防止循环跳转的标记
let isNavigating = false
const navigationLock = new Set<string>()

// 合并路由配置（PC端 + 移动端）
let routes: Array<RouteRecordRaw> = [
  ...optimizedRoutes.filter(route => route && route.path),
  ...mobileRoutes // 添加移动端路由
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // ... 现有代码 ...

  // 检查移动端路由权限
  if (to.path.startsWith('/mobile')) {
    // 移动端路由权限检查逻辑
    const userStore = useUserStore()
    const userRole = userStore.user?.role

    // 检查角色权限
    const routeRoles = to.meta?.role as string[] || []
    if (routeRoles.length > 0 && !routeRoles.includes(userRole)) {
      console.log('❌ 用户无权限访问移动端路由:', to.path)
      return next('/403')
    }
  }

  // ... 现有代码 ...
})

export default router
```

### 2. 设备检测与自动跳转（可选）

可以在路由守卫中添加设备检测，自动跳转到移动端或PC端：

```typescript
import { isMobile } from '../utils/mobile'

router.beforeEach(async (to, from, next) => {
  // 设备检测与路由跳转
  const isMobileDevice = isMobile()

  // 如果是移动设备访问PC路由，自动跳转到移动端
  if (isMobileDevice && !to.path.startsWith('/mobile') && to.path !== '/login') {
    const mobilePath = '/mobile' + to.path
    return next(mobilePath)
  }

  // 如果是PC设备访问移动端路由，自动跳转到PC端
  if (!isMobileDevice && to.path.startsWith('/mobile') && to.path !== '/login') {
    const pcPath = to.path.replace('/mobile', '')
    return next(pcPath)
  }

  // ... 权限检查 ...
})
```

### 3. 移动端入口页面

创建移动端入口页面 `client/src/pages/mobile/index.vue`：

```vue
<template>
  <div class="mobile-entry">
    <van-empty
      image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
      description="正在跳转到移动端..."
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isMobile } from '../../utils/mobile'

const router = useRouter()

onMounted(() => {
  // 根据用户角色跳转
  const userRole = localStorage.getItem('userRole')

  let targetPath = '/mobile/centers'
  if (userRole === 'parent') {
    targetPath = '/mobile/parent-center'
  } else if (userRole === 'teacher') {
    targetPath = '/mobile/teacher-center'
  }

  router.replace(targetPath)
})
</script>
```

### 4. 在主页面添加移动端入口

在PC端主页（如Dashboard）添加移动端入口按钮：

```vue
<template>
  <div class="dashboard">
    <!-- 现有内容 -->

    <!-- 移动端入口 -->
    <van-button
      type="primary"
      icon="wap-nav"
      @click="goToMobile"
      class="mobile-entry-btn"
    >
      移动端
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToMobile = () => {
  router.push('/mobile')
}
</script>

<style scoped>
.mobile-entry-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}
</style>
```

## 路由结构说明

### 路径规范
- **管理中心**: `/mobile/centers/*`
- **教师中心**: `/mobile/teacher-center/*`
- **家长中心**: `/mobile/parent-center/*`

### 路由命名规范
- `Mobile` + `CenterName` + `PageName`
- 例如: `MobileCenters`, `MobileTeacherCenterHome`, `MobileParentDashboard`

### 路由元信息
每个路由包含以下元信息：
```typescript
{
  title: '页面标题',           // 用于显示和SEO
  requiresAuth: true,         // 是否需要登录
  role: ['admin', 'teacher']  // 可访问的角色
}
```

## 权限控制

### 角色权限
- **admin**: 系统管理员，可以访问所有移动端页面
- **principal**: 园长，可以访问大部分移动端页面
- **teacher**: 教师，可以访问教师和部分管理页面
- **parent**: 家长，只能访问家长中心页面

### 权限检查
路由守卫会自动检查用户角色，确保只有有权限的用户才能访问对应的移动端页面。

## 导航菜单

### 在移动端页面中添加导航

```vue
<template>
  <MobilePage
    title="页面标题"
    :show-tab-bar="true"
    :tabs="tabs"
    @tab-change="handleTabChange"
  >
    <!-- 页面内容 -->
  </MobilePage>
</template>

<script setup lang="ts">
const tabs = ref([
  { name: 'home', title: '首页', icon: 'home-o', path: '/mobile/centers' },
  { name: 'activities', title: '活动', icon: 'flag-o', path: '/mobile/centers/activity-center' },
  { name: 'students', title: '学生', icon: 'contact', path: '/mobile/centers/student-center' },
  { name: 'finance', title: '财务', icon: 'gold-coin-o', path: '/mobile/centers/finance-center' }
])
</script>
```

## 最佳实践

1. **懒加载**: 所有移动端页面都使用动态导入，实现路由懒加载
2. **权限检查**: 每个路由都配置了角色权限，确保安全
3. **页面标题**: 每个路由都有明确的页面标题
4. **统一组件**: 使用统一的移动端组件（MobilePage、MobileList等）
5. **响应式设计**: 所有页面都适配移动设备

## 注意事项

1. 移动端路由路径以 `/mobile` 开头，避免与PC端路由冲突
2. 确保在用户登录后才能访问移动端路由
3. 定期检查路由权限配置，确保安全性
4. 使用动态导入减少初始加载时间
5. 保持路由命名规范的一致性

## 测试建议

1. **功能测试**: 测试每个移动端页面的基本功能
2. **权限测试**: 验证不同角色的路由访问权限
3. **导航测试**: 测试页面间导航和返回功能
4. **响应式测试**: 测试在不同屏幕尺寸下的显示效果
5. **性能测试**: 测试页面加载速度和流畅度

