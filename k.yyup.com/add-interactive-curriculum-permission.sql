-- 添加互动课程权限记录

-- 1. 首先查找创意课程权限的ID
SET @creative_curriculum_id = (
  SELECT id FROM permissions 
  WHERE code = 'TEACHER_CREATIVE_CURRICULUM' 
  LIMIT 1
);

-- 如果创意课程权限不存在，先创建它
IF @creative_curriculum_id IS NULL THEN
  INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
  VALUES (
    '创意课程',
    'TEACHER_CREATIVE_CURRICULUM',
    'menu',
    NULL,
    '/teacher-center/creative-curriculum',
    'pages/teacher-center/creative-curriculum/index.vue',
    'teacher:creative:view',
    'BookOpen',
    50,
    1,
    NOW(),
    NOW()
  );
  
  SET @creative_curriculum_id = LAST_INSERT_ID();
END IF;

-- 2. 添加互动课程权限（如果不存在）
INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES (
  '互动多媒体课程生成器',
  'TEACHER_INTERACTIVE_CURRICULUM',
  'menu',
  @creative_curriculum_id,
  '/teacher-center/creative-curriculum/interactive',
  'pages/teacher-center/creative-curriculum/interactive-curriculum.vue',
  'teacher:interactive:view',
  'VideoPlay',
  1,
  1,
  NOW(),
  NOW()
);

-- 3. 获取互动课程权限的ID
SET @interactive_curriculum_id = (
  SELECT id FROM permissions 
  WHERE code = 'TEACHER_INTERACTIVE_CURRICULUM' 
  LIMIT 1
);

-- 4. 获取教师角色的ID
SET @teacher_role_id = (
  SELECT id FROM roles 
  WHERE code = 'teacher' 
  LIMIT 1
);

-- 5. 为教师角色分配互动课程权限（如果还没有分配）
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
VALUES (@teacher_role_id, @interactive_curriculum_id, NOW(), NOW());

-- 6. 验证权限是否添加成功
SELECT 
  p.id,
  p.name,
  p.code,
  p.path,
  p.status,
  r.code as role_code,
  rp.id as role_permission_id
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
LEFT JOIN roles r ON rp.role_id = r.id
WHERE p.code IN ('TEACHER_CREATIVE_CURRICULUM', 'TEACHER_INTERACTIVE_CURRICULUM')
ORDER BY p.id;

