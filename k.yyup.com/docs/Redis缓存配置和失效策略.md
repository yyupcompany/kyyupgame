# Redis缓存配置和失效策略详解

> **文档版本**: v1.1
> **更新日期**: 2025-01-06
> **更新说明**: 暂时移除AI中心缓存（AI功能调试中）
>
> **针对问题**:
> 1. 系统有15个中心，教师角色和管理员/园长使用不同页面体系，如何配置Redis更好？
> 2. 当发生增删改操作时，如何处理缓存更新？

---

## 一、15个中心的Redis缓存配置方案

### 1.1 中心列表和特点

| 序号 | 中心名称 | 路由路径 | 数据特点 | 更新频率 | 推荐TTL |
|------|---------|---------|---------|---------|---------|
| 1 | Dashboard中心 | `/dashboard` | 统计聚合数据 | 高 | 5分钟 |
| 2 | 业务中心 | `/centers/business` | 多表聚合 | 中 | 10分钟 |
| 3 | 活动中心 | `/centers/activity` | 列表+统计 | 高 | 10分钟 |
| 4 | 招生中心 | `/centers/enrollment` | 流程数据 | 中 | 15分钟 |
| 5 | 营销中心 | `/centers/marketing` | 统计分析 | 中 | 15分钟 |
| 6 | ⏸️ AI中心 | `/centers/ai` | 对话记录 | 高 | 暂缓 |
| 7 | 系统中心 | `/centers/system` | 配置数据 | 低 | 1小时 |
| 8 | 人员中心 | `/centers/personnel` | 人员列表 | 中 | 15分钟 |
| 9 | 客户池中心 | `/centers/customer-pool` | 客户数据 | 高 | 10分钟 |
| 10 | 数据分析中心 | `/centers/analytics` | 分析报表 | 低 | 30分钟 |
| 11 | 任务中心 | `/centers/task` | 任务列表 | 高 | 5分钟 |
| 12 | 财务中心 | `/centers/finance` | 财务数据 | 中 | 15分钟 |
| 13 | 话术中心 | `/centers/script` | 话术模板 | 低 | 1小时 |
| 14 | 教学中心 | `/centers/teaching` | 课程进度 | 中 | 15分钟 |
| 15 | 新媒体中心 | `/centers/media` | 媒体内容 | 中 | 15分钟 |

### 1.2 按角色分层的缓存策略

#### 方案1: 角色隔离缓存 (推荐) ⭐⭐⭐⭐⭐

**设计思路**: 不同角色的缓存完全隔离，避免权限泄露

```typescript
// Redis Key设计
// 管理员/园长: 访问通用中心页面
center:{centerName}:admin:{userId} → JSON数据
center:{centerName}:principal:{userId} → JSON数据

// 教师: 访问教师专用页面
teacher-center:{centerName}:teacher:{userId} → JSON数据

// 示例
center:activity:admin:1 → {统计数据, 所有活动列表}
center:activity:principal:5 → {统计数据, 本园活动列表}
teacher-center:activity:teacher:10 → {统计数据, 本班活动列表}
```

**优点**:
- ✅ 权限隔离清晰，安全性高
- ✅ 不同角色数据互不影响
- ✅ 失效策略简单明确

**缺点**:
- ❌ 内存占用较多
- ❌ 相同数据可能重复缓存

**适用场景**: 安全性要求高，用户量不大（<10000）

#### 方案2: 数据分层缓存 (推荐) ⭐⭐⭐⭐

**设计思路**: 公共数据共享缓存，个性化数据独立缓存

```typescript
// 公共数据层 (所有角色共享)
center:{centerName}:common → JSON{基础统计, 公共配置}

// 角色数据层 (按角色过滤)
center:{centerName}:role:{roleCode} → JSON{角色可见数据}

// 用户数据层 (个性化数据)
center:{centerName}:user:{userId} → JSON{用户专属数据}

// 示例
center:activity:common → {总活动数, 活动分类}
center:activity:role:teacher → {教师可见活动列表}
center:activity:user:10 → {我的活动, 我的报名}
```

**优点**:
- ✅ 内存利用率高
- ✅ 公共数据只缓存一份
- ✅ 灵活性好

**缺点**:
- ❌ 实现复杂度较高
- ❌ 需要多次Redis查询

**适用场景**: 用户量大，内存敏感

#### 方案3: 混合缓存 (最佳实践) ⭐⭐⭐⭐⭐

**设计思路**: 结合方案1和方案2的优点

```typescript
// 1. 公共统计数据 (所有角色共享)
center:{centerName}:stats → Hash{
  totalCount: 100,
  activeCount: 50,
  timestamp: 1704528000
}
TTL: 5分钟

// 2. 角色列表数据 (按角色缓存)
center:{centerName}:list:{roleCode}:{page} → JSON{
  items: [...],
  total: 100,
  page: 1
}
TTL: 10分钟

// 3. 用户详情数据 (按用户缓存)
center:{centerName}:detail:{userId}:{itemId} → JSON{详情数据}
TTL: 15分钟

// 4. 教师专用数据 (教师角色独立)
teacher-center:{centerName}:{teacherId} → JSON{
  myClasses: [...],
  myStudents: [...],
  myTasks: [...]
}
TTL: 10分钟
```

**实现示例**:

```typescript
// server/src/services/center-cache.service.ts
export class CenterCacheService {
  /**
   * 获取中心页面数据（混合缓存策略）
   */
  static async getCenterData(
    centerName: string,
    userId: number,
    userRole: string,
    options: { page?: number; filters?: any } = {}
  ) {
    const { page = 1, filters = {} } = options;

    // 1. 获取公共统计数据（所有角色共享）
    const statsKey = `center:${centerName}:stats`;
    let stats = await RedisService.hgetall(statsKey);
    
    if (!stats) {
      stats = await this.loadStatsFromDB(centerName);
      await RedisService.hset(statsKey, 'data', stats);
      await RedisService.expire(statsKey, 300); // 5分钟
    }

    // 2. 获取列表数据（按角色缓存）
    const listKey = `center:${centerName}:list:${userRole}:${page}`;
    let listData = await RedisService.get(listKey);
    
    if (!listData) {
      listData = await this.loadListFromDB(centerName, userRole, page, filters);
      await RedisService.set(listKey, listData, 600); // 10分钟
    }

    // 3. 教师角色特殊处理
    let teacherData = null;
    if (userRole === 'teacher') {
      const teacherKey = `teacher-center:${centerName}:${userId}`;
      teacherData = await RedisService.get(teacherKey);
      
      if (!teacherData) {
        teacherData = await this.loadTeacherDataFromDB(centerName, userId);
        await RedisService.set(teacherKey, teacherData, 600); // 10分钟
      }
    }

    return {
      stats,
      list: listData,
      teacherData,
      meta: {
        cached: true,
        timestamp: Date.now()
      }
    };
  }

  /**
   * 从数据库加载统计数据
   */
  private static async loadStatsFromDB(centerName: string) {
    // 根据中心名称调用对应的统计API
    switch (centerName) {
      case 'activity':
        return await ActivityCenterService.getStats();
      case 'enrollment':
        return await EnrollmentCenterService.getStats();
      // ... 其他中心
      default:
        return {};
    }
  }

  /**
   * 从数据库加载列表数据
   */
  private static async loadListFromDB(
    centerName: string,
    userRole: string,
    page: number,
    filters: any
  ) {
    // 根据角色过滤数据
    const roleFilters = this.getRoleFilters(userRole);
    
    switch (centerName) {
      case 'activity':
        return await ActivityCenterService.getList({
          page,
          ...filters,
          ...roleFilters
        });
      // ... 其他中心
      default:
        return { items: [], total: 0 };
    }
  }

  /**
   * 从数据库加载教师专用数据
   */
  private static async loadTeacherDataFromDB(centerName: string, teacherId: number) {
    // 查询教师的班级
    const teacher = await Teacher.findByPk(teacherId, {
      include: [{ model: Class, as: 'classes' }]
    });

    const classIds = teacher?.classes?.map(c => c.id) || [];

    // 根据中心加载对应数据
    switch (centerName) {
      case 'activity':
        return {
          myClasses: teacher?.classes || [],
          myActivities: await Activity.findAll({
            where: { classId: { [Op.in]: classIds } }
          })
        };
      case 'enrollment':
        return {
          myClasses: teacher?.classes || [],
          myApplications: await EnrollmentApplication.findAll({
            where: { classId: { [Op.in]: classIds } }
          })
        };
      // ... 其他中心
      default:
        return {};
    }
  }

  /**
   * 获取角色过滤条件
   */
  private static getRoleFilters(userRole: string) {
    switch (userRole) {
      case 'teacher':
        return { scope: 'my_classes' };
      case 'principal':
        return { scope: 'my_kindergarten' };
      case 'admin':
        return { scope: 'all' };
      default:
        return {};
    }
  }
}
```

---

## 二、增删改操作的缓存失效策略

### 2.1 缓存失效的核心原则

**原则1: 先更新数据库，再删除缓存** (推荐)

```typescript
// ✅ 正确做法
async function updateActivity(activityId: number, data: any) {
  // 1. 更新数据库
  await Activity.update(data, { where: { id: activityId } });
  
  // 2. 删除相关缓存
  await CacheInvalidationService.invalidateActivity(activityId);
}

// ❌ 错误做法: 先删缓存再更新数据库
// 可能导致并发问题：删除缓存后，其他请求读到旧数据并缓存
```

**原则2: 删除缓存而不是更新缓存** (推荐)

```typescript
// ✅ 推荐: 删除缓存，让下次请求重新加载
await RedisService.del(`activity:detail:${activityId}`);

// ❌ 不推荐: 更新缓存
// 问题: 如果更新失败，缓存和数据库不一致
await RedisService.set(`activity:detail:${activityId}`, newData);
```

**原则3: 级联失效相关缓存**

```typescript
// 更新活动时，需要失效：
// 1. 活动详情缓存
// 2. 活动列表缓存
// 3. 活动中心统计缓存
// 4. 相关班级的活动列表缓存
```

### 2.2 缓存失效服务实现

```typescript
// server/src/services/cache-invalidation.service.ts
export class CacheInvalidationService {
  /**
   * 活动相关缓存失效
   */
  static async invalidateActivity(activityId: number) {
    console.log(`🔄 失效活动缓存: ${activityId}`);

    // 1. 删除活动详情缓存
    await RedisService.del(`activity:detail:${activityId}`);

    // 2. 删除活动中心统计缓存
    await RedisService.del('center:activity:stats');

    // 3. 删除所有角色的活动列表缓存
    await RedisService.delPattern('center:activity:list:*');

    // 4. 删除教师的活动缓存
    await RedisService.delPattern('teacher-center:activity:*');

    // 5. 删除活动报名相关缓存
    await RedisService.delPattern(`activity:registrations:${activityId}:*`);

    console.log(`✅ 活动缓存失效完成`);
  }

  /**
   * 学生相关缓存失效
   */
  static async invalidateStudent(studentId: number) {
    console.log(`🔄 失效学生缓存: ${studentId}`);

    // 1. 删除学生详情缓存
    await RedisService.del(`student:detail:${studentId}`);

    // 2. 删除人员中心统计缓存
    await RedisService.del('center:personnel:stats');

    // 3. 删除学生列表缓存
    await RedisService.delPattern('center:personnel:list:*');

    // 4. 删除班级学生列表缓存
    const student = await Student.findByPk(studentId);
    if (student?.classId) {
      await RedisService.delPattern(`class:${student.classId}:students:*`);
    }

    // 5. 删除教师的学生缓存
    await RedisService.delPattern('teacher-center:personnel:*');

    console.log(`✅ 学生缓存失效完成`);
  }

  /**
   * 招生相关缓存失效
   */
  static async invalidateEnrollment(applicationId: number) {
    console.log(`🔄 失效招生缓存: ${applicationId}`);

    // 1. 删除申请详情缓存
    await RedisService.del(`enrollment:application:${applicationId}`);

    // 2. 删除招生中心统计缓存
    await RedisService.del('center:enrollment:stats');

    // 3. 删除招生列表缓存
    await RedisService.delPattern('center:enrollment:list:*');

    // 4. 删除招生漏斗缓存
    await RedisService.delPattern('funnel:enrollment:*');

    console.log(`✅ 招生缓存失效完成`);
  }

  /**
   * 权限相关缓存失效
   */
  static async invalidatePermission(userId?: number, roleId?: number) {
    console.log(`🔄 失效权限缓存: 用户${userId}, 角色${roleId}`);

    if (userId) {
      // 失效指定用户的权限缓存
      await PermissionCacheService.invalidateUserCache(userId);
    } else if (roleId) {
      // 失效指定角色的权限缓存
      await PermissionCacheService.invalidateRoleCache(roleId);
    } else {
      // 失效所有权限缓存
      await PermissionCacheService.invalidateAllCache();
    }

    console.log(`✅ 权限缓存失效完成`);
  }

  /**
   * 中心页面缓存失效
   */
  static async invalidateCenter(centerName: string, options: {
    userId?: number;
    roleCode?: string;
    all?: boolean;
  } = {}) {
    console.log(`🔄 失效中心缓存: ${centerName}`, options);

    const { userId, roleCode, all } = options;

    if (all) {
      // 失效整个中心的所有缓存
      await RedisService.delPattern(`center:${centerName}:*`);
      await RedisService.delPattern(`teacher-center:${centerName}:*`);
    } else if (userId) {
      // 失效指定用户的中心缓存
      await RedisService.delPattern(`center:${centerName}:*:${userId}`);
      await RedisService.del(`teacher-center:${centerName}:${userId}`);
    } else if (roleCode) {
      // 失效指定角色的中心缓存
      await RedisService.delPattern(`center:${centerName}:list:${roleCode}:*`);
    } else {
      // 失效统计和列表缓存
      await RedisService.del(`center:${centerName}:stats`);
      await RedisService.delPattern(`center:${centerName}:list:*`);
    }

    console.log(`✅ 中心缓存失效完成`);
  }

  /**
   * 批量失效缓存
   */
  static async invalidateBatch(operations: Array<{
    type: 'activity' | 'student' | 'enrollment' | 'permission' | 'center';
    id?: number;
    centerName?: string;
    options?: any;
  }>) {
    console.log(`🔄 批量失效缓存: ${operations.length}个操作`);

    await Promise.all(
      operations.map(async (op) => {
        switch (op.type) {
          case 'activity':
            return this.invalidateActivity(op.id!);
          case 'student':
            return this.invalidateStudent(op.id!);
          case 'enrollment':
            return this.invalidateEnrollment(op.id!);
          case 'permission':
            return this.invalidatePermission(op.id, op.options?.roleId);
          case 'center':
            return this.invalidateCenter(op.centerName!, op.options);
        }
      })
    );

    console.log(`✅ 批量缓存失效完成`);
  }
}
```

### 2.3 在Controller中集成缓存失效

```typescript
// server/src/controllers/activity.controller.ts
export class ActivityController {
  /**
   * 创建活动
   */
  static async createActivity(req: Request, res: Response) {
    try {
      const data = req.body;
      
      // 1. 创建活动
      const activity = await Activity.create(data);
      
      // 2. 失效相关缓存
      await CacheInvalidationService.invalidateCenter('activity', { all: true });
      
      return ApiResponse.success(res, activity, '创建活动成功');
    } catch (error) {
      return ApiResponse.handleError(res, error, '创建活动失败');
    }
  }

  /**
   * 更新活动
   */
  static async updateActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // 1. 更新活动
      await Activity.update(data, { where: { id } });
      
      // 2. 失效相关缓存
      await CacheInvalidationService.invalidateActivity(parseInt(id));
      
      return ApiResponse.success(res, null, '更新活动成功');
    } catch (error) {
      return ApiResponse.handleError(res, error, '更新活动失败');
    }
  }

  /**
   * 删除活动
   */
  static async deleteActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // 1. 删除活动
      await Activity.destroy({ where: { id } });
      
      // 2. 失效相关缓存
      await CacheInvalidationService.invalidateActivity(parseInt(id));
      
      return ApiResponse.success(res, null, '删除活动成功');
    } catch (error) {
      return ApiResponse.handleError(res, error, '删除活动失败');
    }
  }

  /**
   * 批量操作活动
   */
  static async batchUpdateActivities(req: Request, res: Response) {
    try {
      const { ids, data } = req.body;
      
      // 1. 批量更新
      await Activity.update(data, { where: { id: { [Op.in]: ids } } });
      
      // 2. 批量失效缓存
      await CacheInvalidationService.invalidateBatch(
        ids.map((id: number) => ({ type: 'activity', id }))
      );
      
      return ApiResponse.success(res, null, '批量更新成功');
    } catch (error) {
      return ApiResponse.handleError(res, error, '批量更新失败');
    }
  }
}
```

### 2.4 缓存失效的最佳实践

#### 实践1: 使用事务确保一致性

```typescript
async function updateActivityWithCache(activityId: number, data: any) {
  const transaction = await sequelize.transaction();
  
  try {
    // 1. 更新数据库
    await Activity.update(data, { 
      where: { id: activityId },
      transaction 
    });
    
    // 2. 提交事务
    await transaction.commit();
    
    // 3. 失效缓存（事务成功后）
    await CacheInvalidationService.invalidateActivity(activityId);
    
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    throw error;
  }
}
```

#### 实践2: 延迟双删策略

```typescript
async function updateActivityWithDelayedDelete(activityId: number, data: any) {
  // 1. 第一次删除缓存
  await RedisService.del(`activity:detail:${activityId}`);
  
  // 2. 更新数据库
  await Activity.update(data, { where: { id: activityId } });
  
  // 3. 延迟1秒后再次删除缓存
  setTimeout(async () => {
    await RedisService.del(`activity:detail:${activityId}`);
  }, 1000);
}
```

#### 实践3: 使用消息队列异步失效

```typescript
// 发布缓存失效消息
await RedisService.publish('cache:invalidate', JSON.stringify({
  type: 'activity',
  id: activityId,
  timestamp: Date.now()
}));

// 订阅缓存失效消息
RedisService.subscribe('cache:invalidate', async (message) => {
  const { type, id } = JSON.parse(message);
  
  switch (type) {
    case 'activity':
      await CacheInvalidationService.invalidateActivity(id);
      break;
    // ... 其他类型
  }
});
```

---

## 三、缓存失效映射表

### 3.1 操作与缓存失效映射

| 操作 | 需要失效的缓存 | 失效范围 |
|------|---------------|---------|
| **创建活动** | 活动中心统计、活动列表 | 全部角色 |
| **更新活动** | 活动详情、活动列表、活动中心统计 | 全部角色 |
| **删除活动** | 活动详情、活动列表、活动中心统计、报名记录 | 全部角色 |
| **创建学生** | 人员中心统计、学生列表、班级学生列表 | 全部角色 |
| **更新学生** | 学生详情、学生列表、班级学生列表 | 全部角色 |
| **删除学生** | 学生详情、学生列表、班级学生列表、家长关联 | 全部角色 |
| **创建招生申请** | 招生中心统计、申请列表、招生漏斗 | 全部角色 |
| **更新申请状态** | 申请详情、申请列表、招生漏斗、统计数据 | 全部角色 |
| **分配教师** | 教师详情、班级详情、教师中心数据 | 教师角色 |
| **修改权限** | 用户权限、动态路由、权限检查 | 指定用户 |
| **修改角色权限** | 角色权限、所有该角色用户的权限 | 指定角色 |

### 3.2 中心页面缓存依赖关系

```typescript
// 缓存依赖关系配置
const CACHE_DEPENDENCIES = {
  // 活动中心依赖
  'center:activity': [
    'activity:*',           // 所有活动数据
    'activity-registration:*', // 活动报名
    'class:*:activities',   // 班级活动
    'teacher:*:activities'  // 教师活动
  ],
  
  // 人员中心依赖
  'center:personnel': [
    'student:*',            // 学生数据
    'teacher:*',            // 教师数据
    'parent:*',             // 家长数据
    'class:*:students',     // 班级学生
    'teacher:*:students'    // 教师学生
  ],
  
  // 招生中心依赖
  'center:enrollment': [
    'enrollment:application:*', // 招生申请
    'enrollment:plan:*',        // 招生计划
    'enrollment:interview:*',   // 面试记录
    'funnel:enrollment:*'       // 招生漏斗
  ],
  
  // ... 其他中心
};

/**
 * 根据数据变更失效相关中心缓存
 */
async function invalidateRelatedCenters(dataType: string, dataId: number) {
  for (const [center, dependencies] of Object.entries(CACHE_DEPENDENCIES)) {
    for (const pattern of dependencies) {
      if (pattern.startsWith(dataType)) {
        await CacheInvalidationService.invalidateCenter(
          center.replace('center:', ''),
          { all: true }
        );
        break;
      }
    }
  }
}
```

---

## 四、监控和调试

### 4.1 缓存失效日志

```typescript
// 记录缓存失效操作
class CacheInvalidationLogger {
  static log(operation: string, keys: string[], metadata?: any) {
    console.log({
      timestamp: new Date().toISOString(),
      operation,
      keys,
      metadata,
      type: 'CACHE_INVALIDATION'
    });
    
    // 可选: 写入日志文件或监控系统
  }
}

// 使用示例
await CacheInvalidationLogger.log('invalidateActivity', [
  `activity:detail:${activityId}`,
  'center:activity:stats'
], { activityId, reason: 'update' });
```

### 4.2 缓存失效统计

```typescript
class CacheInvalidationMetrics {
  private static metrics = new Map<string, number>();

  static record(type: string) {
    const count = this.metrics.get(type) || 0;
    this.metrics.set(type, count + 1);
  }

  static getStats() {
    return Object.fromEntries(this.metrics);
  }

  static reset() {
    this.metrics.clear();
  }
}

// 使用示例
CacheInvalidationMetrics.record('activity');
console.log(CacheInvalidationMetrics.getStats());
// { activity: 150, student: 80, enrollment: 45 }
```

---

## 五、总结

### 5.1 核心要点

1. **角色隔离**: 教师和管理员使用不同的缓存Key，避免权限泄露
2. **混合策略**: 公共数据共享缓存，个性化数据独立缓存
3. **先更新后删除**: 保证数据一致性
4. **级联失效**: 更新数据时失效所有相关缓存
5. **异步失效**: 使用消息队列异步处理缓存失效

### 5.2 推荐配置

**15个中心的Redis配置**:
- 使用混合缓存策略（方案3）
- 公共统计数据TTL: 5-10分钟
- 列表数据TTL: 10-15分钟
- 详情数据TTL: 15-30分钟
- 教师专用数据TTL: 10分钟

**缓存失效策略**:
- 使用 `CacheInvalidationService` 统一管理
- 在Controller层集成缓存失效
- 使用事务确保一致性
- 记录失效日志便于调试

---

**文档结束**
