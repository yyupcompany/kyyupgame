-- =====================================================
-- 数据库性能优化 - 添加索引
-- Database Performance Optimization - Add Indexes
-- =====================================================

-- 1. 用户角色表索引
-- User Roles Table Indexes
CREATE INDEX idx_ur_user_id ON user_roles(user_id);
CREATE INDEX idx_ur_role_id ON user_roles(role_id);
CREATE INDEX idx_ur_user_role ON user_roles(user_id, role_id);

-- 2. 角色权限表索引
-- Role Permissions Table Indexes
CREATE INDEX idx_rp_role_id ON role_permissions(role_id);
CREATE INDEX idx_rp_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_rp_role_permission ON role_permissions(role_id, permission_id);

-- 3. 权限表索引
-- Permissions Table Indexes
CREATE INDEX idx_perm_status ON permissions(status);
CREATE INDEX idx_perm_type ON permissions(type);
CREATE INDEX idx_perm_parent_id ON permissions(parent_id);
CREATE INDEX idx_perm_path ON permissions(path);
CREATE INDEX idx_perm_code ON permissions(code);
CREATE INDEX idx_perm_status_type ON permissions(status, type);

-- 4. 用户表索引
-- Users Table Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- 5. 角色表索引
-- Roles Table Indexes
CREATE INDEX idx_roles_code ON roles(code);
CREATE INDEX idx_roles_status ON roles(status);

-- =====================================================
-- 查询优化建议
-- Query Optimization Suggestions
-- =====================================================

-- 分析表以更新统计信息
ANALYZE TABLE `user_roles`;
ANALYZE TABLE `role_permissions`;
ANALYZE TABLE `permissions`;
ANALYZE TABLE `users`;
ANALYZE TABLE `roles`;

-- 显示索引信息
SHOW INDEX FROM `user_roles`;
SHOW INDEX FROM `role_permissions`;
SHOW INDEX FROM `permissions`;

