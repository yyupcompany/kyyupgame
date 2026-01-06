-- 添加创意课程生成器权限配置
-- 为教师角色添加创意课程生成器菜单权限

START TRANSACTION;

-- 1. 查找或创建教师中心分类
SET @teacher_center_category_id = (SELECT id FROM permissions WHERE code = 'TEACHER_CENTER_CATEGORY' AND type = 'category' LIMIT 1);

IF @teacher_center_category_id IS NULL THEN
  INSERT INTO permissions (name, chinese_name, code, type, path, icon, sort, status, created_at, updated_at)
  VALUES ('Teacher Center', '教师中心', 'TEACHER_CENTER_CATEGORY', 'category', '#teacher-center', 'briefcase', 50, 1, NOW(), NOW());
  
  SET @teacher_center_category_id = LAST_INSERT_ID();
  SELECT CONCAT('✅ 教师中心分类创建成功，ID: ', @teacher_center_category_id) AS message;
ELSE
  SELECT CONCAT('✅ 教师中心分类已存在，ID: ', @teacher_center_category_id) AS message;
END IF;

-- 2. 查找或创建创意课程权限
SET @creative_curriculum_id = (SELECT id FROM permissions WHERE code = 'TEACHER_CREATIVE_CURRICULUM' LIMIT 1);

IF @creative_curriculum_id IS NULL THEN
  INSERT INTO permissions (name, chinese_name, code, type, path, component, icon, sort, parent_id, status, created_at, updated_at)
  VALUES ('Creative Curriculum', '创意课程', 'TEACHER_CREATIVE_CURRICULUM', 'menu', '/teacher-center/creative-curriculum', 'pages/teacher-center/creative-curriculum/index.vue', 'star', 70, @teacher_center_category_id, 1, NOW(), NOW());
  
  SET @creative_curriculum_id = LAST_INSERT_ID();
  SELECT CONCAT('✅ 创意课程权限创建成功，ID: ', @creative_curriculum_id) AS message;
ELSE
  SELECT CONCAT('✅ 创意课程权限已存在，ID: ', @creative_curriculum_id) AS message;
END IF;

-- 3. 查找教师角色
SET @teacher_role_id = (SELECT id FROM roles WHERE code = 'teacher' LIMIT 1);

IF @teacher_role_id IS NULL THEN
  SELECT '❌ 未找到教师角色' AS message;
ELSE
  SELECT CONCAT('✅ 找到教师角色，ID: ', @teacher_role_id) AS message;
  
  -- 4. 为教师角色分配教师中心分类权限
  INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
  VALUES (@teacher_role_id, @teacher_center_category_id, NOW(), NOW());
  
  SELECT '✅ 为教师角色分配教师中心分类权限' AS message;
  
  -- 5. 为教师角色分配创意课程权限
  INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
  VALUES (@teacher_role_id, @creative_curriculum_id, NOW(), NOW());
  
  SELECT '✅ 为教师角色分配创意课程权限' AS message;
  
  -- 6. 验证配置
  SELECT 
    p.id,
    p.name,
    p.chinese_name,
    p.code,
    p.path,
    p.type,
    p.sort
  FROM permissions p
  WHERE p.code IN ('TEACHER_CENTER_CATEGORY', 'TEACHER_CREATIVE_CURRICULUM')
  ORDER BY p.sort;
END IF;

COMMIT;

SELECT '🎉 创意课程权限配置完成！' AS message;

