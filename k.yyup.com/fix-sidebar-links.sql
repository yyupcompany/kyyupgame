-- 修复侧边栏链接配置问题
-- 将锚点链接修改为正确的路径

-- 1. 修复系统管理中心的路径
UPDATE permissions 
SET path = '/centers/system' 
WHERE name = '系统管理' AND path = '#system';

-- 2. 查找并修复话术中心的路径（如果存在）
UPDATE permissions 
SET path = '/centers/script' 
WHERE (name = 'Script Center' OR name = '话术中心') AND path = '#script';

-- 3. 查找并修复新媒体中心的路径（如果存在）
UPDATE permissions 
SET path = '/centers/media' 
WHERE (name = 'Media Center' OR name = '新媒体中心') AND path = '#media';

-- 4. 确保所有中心页面都有正确的路径配置
-- 如果话术中心不存在，创建它
INSERT IGNORE INTO permissions (name, chinese_name, code, type, path, icon, sort, parent_id, status, created_at, updated_at)
VALUES ('Script Center', '话术中心', 'SCRIPT_CENTER', 'category', '/centers/script', 'MessageSquare', 20, NULL, 1, NOW(), NOW());

-- 如果新媒体中心不存在，创建它
INSERT IGNORE INTO permissions (name, chinese_name, code, type, path, icon, sort, parent_id, status, created_at, updated_at)
VALUES ('Media Center', '新媒体中心', 'MEDIA_CENTER', 'category', '/centers/media', 'VideoCamera', 21, NULL, 1, NOW(), NOW());

-- 5. 验证修复结果
SELECT id, name, chinese_name, path, type 
FROM permissions 
WHERE name IN ('系统管理', 'Script Center', 'Media Center', '话术中心', '新媒体中心')
ORDER BY name;
