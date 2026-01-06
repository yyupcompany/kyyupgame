# 手动清理权限重复记录指南

## 🎯 目标
手动核对并清理数据库中重复的权限记录，确保数据的准确性和一致性。

## ⚠️ 重要提醒
- **必须先备份数据库**
- **在测试环境先验证**
- **逐条核对，不要批量删除**
- **删除前检查角色关联**

## 📋 操作步骤

### 步骤1: 备份数据库
```bash
# 备份整个数据库
mysqldump -u root -p kindergarten_management > backup_$(date +%Y%m%d_%H%M%S).sql

# 或者只备份相关表
mysqldump -u root -p kindergarten_management permissions role_permissions > permissions_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 步骤2: 检查重复记录
```bash
# 运行检查脚本
node scripts/check-permission-duplicates.js

# 分析具体重复情况
node scripts/analyze-specific-duplicates.js
```

### 步骤3: 手动核对每条重复记录

#### 3.1 路径重复的处理原则
```sql
-- 查看具体的重复路径
SELECT id, name, code, path, type, parent_id, created_at, updated_at
FROM permissions 
WHERE path = '/具体路径'
ORDER BY id;
```

**决策原则：**
- 保留最早创建的记录（ID最小）
- 如果功能描述更准确，保留描述更好的
- 如果有角色关联，优先保留有关联的记录

#### 3.2 名称重复的处理原则
```sql
-- 查看具体的重复名称
SELECT id, name, code, path, type, parent_id, created_at
FROM permissions 
WHERE name = '具体名称'
ORDER BY id;
```

**决策原则：**
- 如果路径不同，可能是不同功能，需要重命名而不是删除
- 如果路径相同，按路径重复的原则处理
- 检查是否有业务逻辑差异

#### 3.3 代码重复的处理原则
```sql
-- 查看具体的重复代码
SELECT id, name, code, path, type, parent_id, created_at
FROM permissions 
WHERE code = '具体代码'
ORDER BY id;
```

**决策原则：**
- 权限代码必须唯一
- 保留功能最完整的记录
- 其他记录需要重新分配代码或删除

### 步骤4: 检查角色关联
```sql
-- 检查权限是否被角色使用
SELECT 
    p.id, p.name, p.path,
    r.id as role_id, r.name as role_name
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
LEFT JOIN roles r ON rp.role_id = r.id
WHERE p.id IN (要检查的权限ID列表)
ORDER BY p.id, r.id;
```

**处理原则：**
- 如果权限被角色使用，删除前需要先处理角色关联
- 可以将角色关联转移到保留的权限上
- 或者删除不必要的角色关联

### 步骤5: 执行删除操作

#### 5.1 转移角色关联（如果需要）
```sql
-- 将角色关联从旧权限转移到新权限
UPDATE role_permissions 
SET permission_id = 保留的权限ID 
WHERE permission_id = 要删除的权限ID;
```

#### 5.2 删除重复权限
```sql
-- 开始事务
START TRANSACTION;

-- 删除角色权限关联
DELETE FROM role_permissions WHERE permission_id = 要删除的权限ID;

-- 删除权限记录
DELETE FROM permissions WHERE id = 要删除的权限ID;

-- 验证删除结果
SELECT * FROM permissions WHERE id = 要删除的权限ID;

-- 如果确认无误，提交事务
COMMIT;

-- 如果有问题，回滚事务
-- ROLLBACK;
```

## 📝 具体案例示例

### 案例1: 重复路径 `/class`
```sql
-- 检查重复记录
SELECT id, name, code, path, type, created_at
FROM permissions 
WHERE path = '/class'
ORDER BY id;

-- 假设结果：
-- ID: 1133, 名称: "班级管理", 代码: "CLASS_MANAGE", 创建时间: 2024-01-01
-- ID: 1139, 名称: "班级管理", 代码: "CLASS_MANAGE", 创建时间: 2024-01-15
-- ID: 1262, 名称: "班级列表", 代码: "CLASS_LIST", 创建时间: 2024-02-01

-- 决策：保留ID 1133（最早且功能完整），删除其他
-- 检查角色关联
SELECT rp.role_id, r.name 
FROM role_permissions rp 
JOIN roles r ON rp.role_id = r.id 
WHERE rp.permission_id IN (1139, 1262);

-- 如果有角色关联，先转移
UPDATE role_permissions SET permission_id = 1133 WHERE permission_id IN (1139, 1262);

-- 删除重复记录
DELETE FROM role_permissions WHERE permission_id IN (1139, 1262);
DELETE FROM permissions WHERE id IN (1139, 1262);
```

### 案例2: 相同名称不同路径
```sql
-- 检查重复名称
SELECT id, name, code, path, type
FROM permissions 
WHERE name = '用户管理'
ORDER BY id;

-- 假设结果：
-- ID: 100, 路径: "/users", 代码: "USER_MANAGE"
-- ID: 200, 路径: "/system/users", 代码: "SYSTEM_USER_MANAGE"

-- 决策：这是不同的功能，需要重命名而不是删除
UPDATE permissions 
SET name = '系统用户管理' 
WHERE id = 200;
```

## ✅ 验证清理结果

### 检查是否还有重复
```sql
-- 检查重复路径
SELECT path, COUNT(*) as count
FROM permissions 
WHERE path IS NOT NULL AND path != '' 
GROUP BY path 
HAVING COUNT(*) > 1;

-- 检查重复名称
SELECT name, COUNT(*) as count
FROM permissions 
WHERE name IS NOT NULL AND name != '' 
GROUP BY name 
HAVING COUNT(*) > 1;

-- 检查重复代码
SELECT code, COUNT(*) as count
FROM permissions 
WHERE code IS NOT NULL AND code != '' 
GROUP BY code 
HAVING COUNT(*) > 1;
```

### 检查数据完整性
```sql
-- 检查是否有孤立的角色权限关联
SELECT rp.* 
FROM role_permissions rp 
LEFT JOIN permissions p ON rp.permission_id = p.id 
WHERE p.id IS NULL;

-- 检查权限层级关系
SELECT p1.id, p1.name, p1.parent_id, p2.name as parent_name
FROM permissions p1
LEFT JOIN permissions p2 ON p1.parent_id = p2.id
WHERE p1.parent_id IS NOT NULL AND p2.id IS NULL;
```

## 📊 清理记录

建议记录每次清理的详细信息：

```markdown
## 权限清理记录 - 2024-XX-XX

### 删除的重复权限
- ID: 1139, 名称: "班级管理", 路径: "/class", 原因: 与ID 1133重复
- ID: 1262, 名称: "班级列表", 路径: "/class", 原因: 与ID 1133重复

### 重命名的权限
- ID: 200, 原名称: "用户管理", 新名称: "系统用户管理", 原因: 与ID 100名称重复但功能不同

### 转移的角色关联
- 权限ID 1139 的角色关联转移到 1133
- 权限ID 1262 的角色关联转移到 1133

### 清理结果
- 删除重复权限: 2条
- 重命名权限: 1条
- 转移角色关联: 3条
```

## 🚨 注意事项

1. **分批处理**: 不要一次性删除太多记录
2. **测试验证**: 每次删除后测试相关功能
3. **保留备份**: 至少保留一周的备份
4. **文档更新**: 及时更新相关文档
5. **团队通知**: 通知团队成员清理结果
