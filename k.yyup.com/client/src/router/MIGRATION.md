# 路由系统迁移说明

## 当前状态

路由拆分优化项目已完成**基础框架搭建**，建立了模块化路由架构。

### ✅ 已完成的工作

1. **目录结构搭建**
   - ✅ 创建 `routes/` 目录
   - ✅ 创建18个路由模块文件骨架

2. **核心模块实现**
   - ✅ `base.ts` (117行) - 基础路由（登录、注册、错误页面）
   - ✅ `dashboard.ts` (355行) - 仪表板路由
   - ✅ `routes/index.ts` - 路由聚合文件
   - ✅ `router-config.ts` - 路由配置文件

3. **文档完善**
   - ✅ `README.md` - 路由架构文档
   - ✅ `IMPLEMENTATION_GUIDE.md` - 实施指南
   - ✅ `MIGRATION.md` - 本迁移说明

4. **备份安全**
   - ✅ `optimized-routes.ts.backup` - 原始文件备份

## 当前路由系统

**主路由入口**: `router/index.ts`
- 当前仍使用: `optimized-routes.ts`
- 新模块系统: `routes/` 目录（正在建设中）

## 如何使用新的模块化路由

### 方案A: 渐进式迁移（推荐）

保持系统当前运行状态，逐步完成剩余模块：

```typescript
// router/index.ts 保持不变，继续使用 optimizedRoutes
import { optimizedRoutes } from './optimized-routes'
```

待所有模块完成后，一次性切换：

```typescript
// 切换到新的模块化路由
import { pcRoutes } from './routes'
const routes = [
  ...pcRoutes,  // 新的模块化路由
  ...mobileRoutes
]
```

### 方案B: 混合使用（开发/测试）

可以让部分路由使用新模块，其他继续使用旧文件：

```typescript
// router/index.ts
import { baseRoutes, dashboardRoutes } from './routes'
import { optimizedRoutes } from './optimized-routes'

// 过滤掉已迁移的路由
const legacyRoutes = optimizedRoutes.filter(route => {
  return !route.path.startsWith('/login') && 
         !route.path.startsWith('/register') &&
         route.path !== '/'
})

const routes = [
  ...baseRoutes,        // 新模块
  ...dashboardRoutes,   // 新模块
  ...legacyRoutes,      // 未迁移的路由
  ...mobileRoutes
]
```

## 待完成工作

### 高优先级（建议尽快完成）

- [ ] `class.ts` - 班级管理 (~200行)
- [ ] `student.ts` - 学生管理 (~200行)
- [ ] `teacher.ts` - 教师管理 (~250行)
- [ ] `enrollment.ts` - 招生管理 (~350行)
- [ ] `centers.ts` - 中心化页面 (~700行)

### 中优先级

- [ ] `parent.ts` - 家长管理
- [ ] `activity.ts` - 活动管理
- [ ] `customer.ts` - 客户管理
- [ ] `statistics.ts` - 统计分析
- [ ] `ai.ts` - AI功能
- [ ] `teacher-center.ts` - 教师工作台
- [ ] `parent-center.ts` - 家长工作台
- [ ] `group.ts` - 集团管理

### 低优先级

- [ ] `system.ts` - 系统管理
- [ ] `principal.ts` - 园长功能
- [ ] `demo-test.ts` - 测试演示

## 实施指南

详细的实施步骤请参考：`IMPLEMENTATION_GUIDE.md`

### 快速上手

1. 打开 `optimized-routes.ts.backup`
2. 找到对应模块的路由定义
3. 复制到新的模块文件中
4. 参考 `base.ts` 和 `dashboard.ts` 的格式
5. 在 `routes/index.ts` 中取消注释导入

### 验证测试

每完成一个模块：

```bash
# 检查TypeScript编译
cd k.yyup.com/client
npm run type-check

# 启动开发服务器
npm run dev

# 访问对应路由测试
```

## 优化收益

完成迁移后的预期收益：

- **文件大小**: 从4133行单文件 → 18个100-800行的模块文件
- **IDE性能**: 显著提升（文件解析更快）
- **团队协作**: 减少合并冲突，职责更清晰
- **可维护性**: 功能定位更快，修改影响范围小

## 注意事项

1. **保持原路由顺序**: 路由匹配顺序很重要
2. **完整复制meta信息**: 确保权限、图标等信息完整
3. **组件导入路径**: 使用 `@/` 绝对路径
4. **测试每个模块**: 避免批量修改后难以定位问题

## 时间表建议

- **紧急**: 只完成5个高优先级模块（~2-3小时）
- **标准**: 完成所有18个模块（~4-6小时）
- **理想**: 使用自动化脚本（~1-2小时）

## 技术支持

- 设计文档: `.qoder/quests/route-split-optimization.md`
- 架构说明: `README.md`
- 实施指南: `IMPLEMENTATION_GUIDE.md`
- 原始备份: `optimized-routes.ts.backup`

---

**最后更新**: 2026-01-03
**当前进度**: 2/18 模块完成 (11%)
**下一步**: 完成class.ts班级管理模块
