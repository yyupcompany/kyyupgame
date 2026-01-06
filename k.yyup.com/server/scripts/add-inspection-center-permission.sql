-- 添加检查中心权限记录
-- 权限ID: 5001
-- 权限代码: INSPECTION_CENTER

-- 检查权限是否已存在
SELECT * FROM permissions WHERE id = 5001 OR code = 'INSPECTION_CENTER';

-- 如果不存在，则插入检查中心权限
INSERT INTO permissions (
  id,
  name,
  chinese_name,
  code,
  type,
  parent_id,
  path,
  component,
  file_path,
  permission,
  icon,
  sort,
  status,
  created_at,
  updated_at
) VALUES (
  5001,
  'Inspection Center',
  '检查中心',
  'INSPECTION_CENTER',
  'menu',
  NULL,
  '/centers/inspection',
  'InspectionCenter',
  'pages/centers/InspectionCenter.vue',
  'INSPECTION_CENTER',
  'inspection',
  12,
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  chinese_name = '检查中心',
  path = '/centers/inspection',
  component = 'InspectionCenter',
  file_path = 'pages/centers/InspectionCenter.vue',
  status = 1,
  updated_at = NOW();

-- 验证插入结果
SELECT * FROM permissions WHERE id = 5001;

