# 侧边栏菜单结构备份
## Sidebar Menu Structure Backup

以下是原有侧边栏的完整菜单结构和路由信息，用于重新创建时参考：

## 菜单分类和页面链接

### 1. 工作台 (Dashboard)
- **图标**: House
- **路由**:
  - `/dashboard` - 数据概览
  - `/dashboard/schedule` - 日程管理  
  - `/dashboard/important-notices` - 消息通知
  - `/dashboard/campus-overview` - 园区概览
  - `/dashboard/data-statistics` - 数据统计

### 2. 招生管理 (Enrollment)
- **图标**: UserFilled
- **路由**:
  - `/enrollment-plan` - 招生计划
  - `/enrollment` - 招生活动
  - `/enrollment-plan/statistics` - 招生统计
  - `/enrollment-plan/quota-manage` - 名额管理

### 3. 客户管理 (Customer)
- **图标**: User
- **路由**:
  - `/customer` - 客户列表
  - `/principal/customer-pool` - 客户池

### 4. 学生管理 (Student)
- **图标**: Avatar
- **路由**:
  - `/class` - 班级管理
  - `/application` - 入园申请

### 5. 活动管理 (Activity)
- **图标**: Calendar
- **路由**:
  - `/activity` - 活动列表
  - `/activity/create` - 创建活动
  - `/principal/activities` - 园长活动

### 6. 家长服务 (Parent)
- **图标**: User
- **路由**:
  - `/parent` - 家长列表
  - `/parent/children` - 孩子列表

### 7. 教师管理 (Teacher)
- **图标**: Avatar
- **路由**:
  - `/teacher` - 教师列表

### 8. 营销工具 (Marketing)
- **图标**: Promotion
- **路由**:
  - `/principal/poster-editor` - 海报编辑
  - `/principal/poster-generator` - 海报生成器
  - `/chat` - 在线咨询
  - `/ai` - AI助手

### 9. 数据分析 (Analytics)
- **图标**: TrendCharts
- **路由**:
  - `/statistics` - 统计报表
  - `/principal/performance` - 绩效管理
  - `/principal/marketing-analysis` - 经营分析
  - `/principal/dashboard` - 园长仪表盘

### 10. 系统管理 (System)
- **图标**: Setting
- **路由**:
  - `/system/users` - 用户管理
  - `/system/roles` - 角色管理
  - `/system/permissions` - 权限管理
  - `/system/logs` - 系统日志
  - `/system/backup` - 数据备份
  - `/system/settings` - 系统配置
  - `/system/ai-model-config` - AI模型配置

## 技术信息

### Element Plus 图标依赖
```javascript
import { 
  House, User, Calendar, TrendCharts, Avatar, Setting, 
  Expand, Fold, SwitchButton, Sunny, FullScreen, Aim,
  UserFilled, Promotion
} from '@element-plus/icons-vue'
```

### 用户权限和角色系统
- 使用 `useUserStore()` 管理用户状态
- 导入 `PERMISSIONS, ROLES` 用于权限控制
- 支持基于角色的菜单显示

### 系统品牌信息
- **Logo**: `@/assets/logo.png`
- **系统名称**: "幼儿园管理"
- **Alt文本**: "幼儿园管理系统"

### CSS类名标识
- `cls-performance-fix` - 性能优化类
- `cls-final-fix-2025` - 最终修复类
- `cls-menu-static-stable` - 菜单稳定类
- `cls-menu-always-visible` - 菜单可见类
- `cls-menu-absolute-stable` - 菜单绝对稳定类

### 重要功能特性
1. **响应式设计** - 支持移动端折叠
2. **路由集成** - 使用 Vue Router
3. **主题切换** - 支持7种主题
4. **权限控制** - 基于用户角色显示菜单
5. **状态管理** - 集成 Pinia store