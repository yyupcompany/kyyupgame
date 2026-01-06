-- 修复AI聊天界面权限配置
-- 执行时间: 2025-07-24

START TRANSACTION;

-- 1. 检查并创建AI助手主菜单权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('AI助手', 'AI_ASSISTANT_USE', 'menu', NULL, '/ai', 'Layout', 'ai:assistant:use', 'ChatDotRound', 20, 1, NOW(), NOW());

-- 获取AI助手主菜单ID
SET @ai_menu_id = (SELECT id FROM permissions WHERE code = 'AI_ASSISTANT_USE' LIMIT 1);

-- 2. 删除可能存在的冲突配置
DELETE FROM permissions WHERE code IN ('AI_ASSISTANT_CHAT', 'ai:chat', 'AI_CHAT_USE') AND parent_id = @ai_menu_id;

-- 3. 添加正确的AI聊天界面权限配置
INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES 
('AI聊天界面', 'AI_CHAT_INTERFACE', 'menu', @ai_menu_id, '/ai', 'pages/ai/ChatInterface.vue', 'ai:chat:interface', 'ChatRound', 1, 1, NOW(), NOW());

-- 获取新创建的AI聊天界面权限ID
SET @ai_chat_id = (SELECT id FROM permissions WHERE code = 'AI_CHAT_INTERFACE' LIMIT 1);

-- 4. 为admin角色分配AI聊天界面权限
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @ai_menu_id, NOW(), NOW()
WHERE @ai_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 1, @ai_chat_id, NOW(), NOW()
WHERE @ai_chat_id IS NOT NULL;

-- 5. 为园长角色分配AI聊天界面权限（如果园长角色存在）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @ai_menu_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @ai_menu_id IS NOT NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, @ai_chat_id, NOW(), NOW()
FROM roles r 
WHERE r.name = '园长' AND @ai_chat_id IS NOT NULL;

-- 6. 验证配置
SELECT 
    p.id,
    p.name,
    p.code,
    p.type,
    p.path,
    p.component,
    p.permission,
    p.status
FROM permissions p 
WHERE p.code IN ('AI_ASSISTANT_USE', 'AI_CHAT_INTERFACE')
ORDER BY p.sort;

COMMIT;

-- 显示结果
SELECT '✅ AI聊天界面权限配置修复完成' as result;
