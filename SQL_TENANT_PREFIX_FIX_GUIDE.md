# SQL租户数据库前缀修复指南

## 📋 修复目标

将所有SQL查询从简单表名格式改为带租户数据库前缀的完整表名格式，以支持共享连接池架构。

## 🎯 为什么要修复

### 背景
项目已从"每租户独立连接池"架构升级为"全局共享连接池"架构：
- **旧架构**：每个租户一个独立的Sequelize连接（100个租户 × 10个连接 = 1000个连接）
- **新架构**：全局共享连接池（30个连接），通过完整表名访问不同租户数据库

### 问题
旧的SQL查询使用简单表名（如 `FROM users`），在共享连接池架构下无法正确识别租户数据库。

### 解决方案
所有SQL查询必须使用完整表名格式：`${tenantDb}.table_name`

**示例对比：**
```typescript
// ❌ 旧格式（错误）
FROM users
LEFT JOIN roles ON users.role_id = roles.id
UPDATE students SET name = ?

// ✅ 新格式（正确）
FROM ${tenantDb}.users
LEFT JOIN ${tenantDb}.roles ON users.role_id = roles.id
UPDATE ${tenantDb}.students SET name = ?
```

## 🔧 如何修复

### 修复步骤（针对每个文件）

#### 1. 在每个函数开头添加 tenantDb 变量

**对于控制器函数：**
```typescript
export const functionName = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';  // ← 添加这一行
    const userId = req.user?.id;
    // ... 其余代码
```

**对于路由处理函数：**
```typescript
router.get('/path', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';  // ← 添加这一行
    // ... 其余代码
```

**对于私有方法（有context参数）：**
```typescript
private async executeDataQueries(intentAnalysis: any, context?: any) {
  const tenantDb = context?.tenantDb || 'tenant_dev';  // ← 添加这一行
  try {
    // ... 其余代码
```

#### 2. 修复所有SQL查询中的表名

**FROM 子句：**
```typescript
// ❌ 修复前
FROM users
FROM students  
FROM classes

// ✅ 修复后
FROM ${tenantDb}.users
FROM ${tenantDb}.students
FROM ${tenantDb}.classes
```

**LEFT/RIGHT/INNER JOIN：**
```typescript
// ❌ 修复前
LEFT JOIN users u ON ar.user_id = u.id
LEFT JOIN classes c ON s.class_id = c.id

// ✅ 修复后
LEFT JOIN ${tenantDb}.users u ON ar.user_id = u.id
LEFT JOIN ${tenantDb}.classes c ON s.class_id = c.id
```

**UPDATE 语句：**
```typescript
// ❌ 修复前
UPDATE users SET name = ?
UPDATE students SET status = ?

// ✅ 修复后
UPDATE ${tenantDb}.users SET name = ?
UPDATE ${tenantDb}.students SET status = ?
```

**INSERT 语句：**
```typescript
// ❌ 修复前
INSERT INTO users (name, phone) VALUES (?, ?)
INSERT INTO students (name, age) VALUES (?, ?)

// ✅ 修复后
INSERT INTO ${tenantDb}.users (name, phone) VALUES (?, ?)
INSERT INTO ${tenantDb}.students (name, age) VALUES (?, ?)
```

**子查询：**
```typescript
// ❌ 修复前
(SELECT COUNT(*) FROM students WHERE status = 1)
(SELECT id FROM users WHERE phone = ?)

// ✅ 修复后
(SELECT COUNT(*) FROM ${tenantDb}.students WHERE status = 1)
(SELECT id FROM ${tenantDb}.users WHERE phone = ?)
```

## 📁 需要修复的文件清单

### ✅ 已完成修复的文件（可作为参考）
1. `k.yyup.com/server/src/controllers/activity-checkin.controller.ts` - 17处
2. `k.yyup.com/server/src/controllers/activity-registration.controller.ts` - 15处
3. `k.yyup.com/server/src/controllers/admission-notification.controller.ts` - 19处
4. `k.yyup.com/server/src/controllers/admission-result.controller.ts` - 26处
5. `k.yyup.com/server/src/controllers/activity-plan.controller.ts` - 3处
6. `k.yyup.com/server/src/controllers/ai-query.controller.ts` - 7处
7. `k.yyup.com/server/src/routes/customer-pool.routes.ts` - 部分修复

### ⚠️ 待修复的文件（按优先级排序）

**高优先级（核心业务文件）：**
1. `k.yyup.com/server/src/routes/customer-pool.routes.ts` - 35处（还有剩余）
2. `k.yyup.com/server/src/controllers/class.controller.ts` - 22处
3. `k.yyup.com/server/src/controllers/teacher.controller.ts` - 21处
4. `k.yyup.com/server/src/routes/statistics.routes.ts` - 18处
5. `k.yyup.com/server/src/controllers/dashboard.controller.ts` - 17处

**中优先级：**
6. `k.yyup.com/server/src/controllers/enrollment-interview.controller.ts` - 10处
7. `k.yyup.com/server/src/controllers/marketing.controller.ts` - 7处
8. `k.yyup.com/server/src/controllers/enrollment-finance.controller.ts` - 6处
9. `k.yyup.com/server/src/routes/enrollment.routes.ts` - 5处
10. `k.yyup.com/server/src/routes/system.routes.ts` - 4处
11. `k.yyup.com/server/src/controllers/teacher-dashboard.controller.ts` - 4处

**低优先级（辅助功能）：**
12. `k.yyup.com/server/src/routes/unified-statistics.routes.ts` - 3处
13. `k.yyup.com/server/src/routes/user-role.routes.ts` - 2处
14. `k.yyup.com/server/src/routes/activity-evaluation.routes.ts` - 2处
15. `k.yyup.com/server/src/controllers/user-simple.controller.ts` - 2处
16. `k.yyup.com/server/src/controllers/teacher-customers.controller.ts` - 2处
17. `k.yyup.com/server/src/controllers/marketing-center.controller.ts` - 2处
18. `k.yyup.com/server/src/controllers/marketing-campaign.controller.ts` - 2处
19. `k.yyup.com/server/src/controllers/enrollment-application.controller.ts` - 2处
20. `k.yyup.com/server/src/routes/user.routes.ts` - 1处
21. `k.yyup.com/server/src/routes/activity-checkin.routes.ts` - 1处
22. `k.yyup.com/server/src/controllers/user.controller.ts` - 1处
23. `k.yyup.com/server/src/controllers/usage-quota.controller.ts` - 1处
24. `k.yyup.com/server/src/controllers/setup-permissions.controller.ts` - 1处
25. `k.yyup.com/server/src/controllers/quotas.controller.ts` - 1处
26. `k.yyup.com/server/src/controllers/migration.controller.ts` - 1处
27. `k.yyup.com/server/src/controllers/applications.controller.ts` - 1处

**总计：约182处需要修复**

## 🔍 检测脚本

### 查找未修复的SQL查询
```bash
cd /home/zhgue/kyyupgame/k.yyup.com/server

# 检测单个文件中未修复的查询
grep -n "FROM users\|FROM students\|FROM classes\|FROM activities\|FROM parents\|FROM teachers\|LEFT JOIN users\|LEFT JOIN students\|LEFT JOIN classes" src/controllers/class.controller.ts | grep -v "tenantDb"

# 统计所有文件的未修复数量
grep -rn "FROM users\|FROM students\|FROM classes\|FROM activities\|FROM parents\|FROM teachers\|LEFT JOIN users\|LEFT JOIN students\|LEFT JOIN classes\|LEFT JOIN activities\|UPDATE users\|UPDATE students\|UPDATE classes\|INSERT INTO users\|INSERT INTO students" src/controllers/*.ts src/routes/*.ts 2>/dev/null | grep -v "tenantDb" | wc -l

# 按文件分组统计
grep -rn "FROM users\|FROM students\|FROM classes\|FROM activities\|FROM parents\|FROM teachers\|LEFT JOIN users\|LEFT JOIN students\|LEFT JOIN classes\|LEFT JOIN activities" src/controllers/*.ts src/routes/*.ts 2>/dev/null | grep -v "tenantDb" | cut -d: -f1 | sort | uniq -c | sort -rn
```

## ✅ 验证步骤

### 1. 编译测试
每修复一个文件后立即编译：
```bash
cd /home/zhgue/kyyupgame/k.yyup.com/server
npm run build
```

### 2. 检查是否还有遗漏
```bash
# 应该返回 0
grep -rn "FROM users\|FROM students\|FROM classes" src/controllers/文件名.ts | grep -v "tenantDb" | wc -l
```

### 3. 最终全局验证
```bash
# 所有文件都修复完成后，这个命令应该返回 0
cd /home/zhgue/kyyupgame/k.yyup.com/server
grep -rn "FROM users\|FROM students\|FROM classes\|FROM activities\|FROM parents\|FROM teachers\|LEFT JOIN users\|LEFT JOIN students\|LEFT JOIN classes\|LEFT JOIN activities\|UPDATE users\|UPDATE students\|UPDATE classes\|INSERT INTO users\|INSERT INTO students" src/controllers/*.ts src/routes/*.ts 2>/dev/null | grep -v "tenantDb" | wc -l
```

## 📝 注意事项

### 1. 不要使用脚本自动修改
**❌ 禁止操作：**
- 不要使用 sed、awk 等命令批量替换
- 不要使用脚本自动修改源代码
- 脚本只能用于检测，不能用于修改

**✅ 正确做法：**
- 手动逐个文件修复
- 使用IDE的 search_replace 工具
- 每次修改后验证编译

### 2. 常见的表名列表
需要添加 `${tenantDb}.` 前缀的表包括：
- users（用户表）
- students（学生表）
- teachers（教师表）
- parents（家长表）
- classes（班级表）
- activities（活动表）
- roles（角色表）
- permissions（权限表）
- announcements（公告表）
- attendance（考勤表）
- enrollments（报名表）
- applications（申请表）
- admissions（招生表）
- **以及其他所有业务表**

### 3. 不需要修改的情况
以下情况不需要添加前缀：
- 系统表（如 `information_schema`、`mysql` 数据库的表）
- 已经包含 `${tenantDb}.` 的查询
- 字符串常量中的表名（不在SQL中使用）

### 4. 特殊处理的函数
对于类的私有方法，如果没有 `req` 参数：
```typescript
// 从调用方传递 tenantDb
private async helperMethod(data: any, tenantDb: string) {
  const results = await db.query(`SELECT * FROM ${tenantDb}.users`);
}

// 调用时传递
const results = await this.helperMethod(data, tenantDb);
```

## 🎯 修复示例

### 示例1：简单控制器函数
```typescript
// ❌ 修复前
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const db = getSequelizeInstance();
    
    const users = await db.query(
      'SELECT * FROM users WHERE status = 1',
      { type: QueryTypes.SELECT }
    );
    
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// ✅ 修复后
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';  // ← 添加
    const userId = req.user?.id;
    const db = getSequelizeInstance();
    
    const users = await db.query(
      `SELECT * FROM ${tenantDb}.users WHERE status = 1`,  // ← 修改
      { type: QueryTypes.SELECT }
    );
    
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
```

### 示例2：带JOIN的复杂查询
```typescript
// ❌ 修复前
const results = await db.query(`
  SELECT s.*, c.name as class_name, t.real_name as teacher_name
  FROM students s
  LEFT JOIN classes c ON s.class_id = c.id
  LEFT JOIN teachers t ON c.teacher_id = t.id
  WHERE s.status = 1
`, { type: QueryTypes.SELECT });

// ✅ 修复后
const tenantDb = req.tenant?.databaseName || 'tenant_dev';  // ← 添加
const results = await db.query(`
  SELECT s.*, c.name as class_name, t.real_name as teacher_name
  FROM ${tenantDb}.students s                                    // ← 修改
  LEFT JOIN ${tenantDb}.classes c ON s.class_id = c.id          // ← 修改
  LEFT JOIN ${tenantDb}.teachers t ON c.teacher_id = t.id       // ← 修改
  WHERE s.status = 1
`, { type: QueryTypes.SELECT });
```

### 示例3：子查询
```typescript
// ❌ 修复前
const stats = await db.query(`
  SELECT 
    (SELECT COUNT(*) FROM students WHERE status = 1) as totalStudents,
    (SELECT COUNT(*) FROM classes WHERE status = 1) as totalClasses,
    (SELECT AVG(age) FROM students WHERE status = 1) as avgAge
`, { type: QueryTypes.SELECT });

// ✅ 修复后
const tenantDb = req.tenant?.databaseName || 'tenant_dev';  // ← 添加
const stats = await db.query(`
  SELECT 
    (SELECT COUNT(*) FROM ${tenantDb}.students WHERE status = 1) as totalStudents,    // ← 修改
    (SELECT COUNT(*) FROM ${tenantDb}.classes WHERE status = 1) as totalClasses,      // ← 修改
    (SELECT AVG(age) FROM ${tenantDb}.students WHERE status = 1) as avgAge            // ← 修改
`, { type: QueryTypes.SELECT });
```

## 🚀 建议的修复顺序

1. **第一批（高优先级核心文件）**：修复 customer-pool.routes.ts, class.controller.ts, teacher.controller.ts
2. **第二批（中优先级）**：修复 statistics.routes.ts, dashboard.controller.ts, enrollment相关文件
3. **第三批（低优先级）**：修复其余文件
4. **最终验证**：编译测试 + 全局检查

## 📊 进度追踪

可以使用以下命令实时查看修复进度：
```bash
# 查看剩余未修复数量
cd /home/zhgue/kyyupgame/k.yyup.com/server
echo "剩余未修复: $(grep -rn "FROM users\|FROM students\|FROM classes\|FROM activities\|FROM parents\|FROM teachers\|LEFT JOIN users\|LEFT JOIN students\|LEFT JOIN classes\|LEFT JOIN activities\|UPDATE users\|UPDATE students\|UPDATE classes\|INSERT INTO users\|INSERT INTO students" src/controllers/*.ts src/routes/*.ts 2>/dev/null | grep -v "tenantDb" | wc -l) 处"
```

---

## 📮 完成标准

当以下命令返回 `0` 时，表示修复完成：
```bash
cd /home/zhgue/kyyupgame/k.yyup.com/server
grep -rn "FROM users\|FROM students\|FROM classes\|FROM activities\|FROM parents\|FROM teachers\|LEFT JOIN users\|LEFT JOIN students\|LEFT JOIN classes\|LEFT JOIN activities\|UPDATE users\|UPDATE students\|UPDATE classes\|INSERT INTO users\|INSERT INTO students" src/controllers/*.ts src/routes/*.ts 2>/dev/null | grep -v "tenantDb" | wc -l
```

并且编译通过：
```bash
npm run build
```

---

**祝修复顺利！🎉**
