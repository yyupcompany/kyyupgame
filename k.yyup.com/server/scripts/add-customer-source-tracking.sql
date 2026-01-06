-- 添加客户来源追踪字段
-- 执行时间: 2025-01-05

-- 1. 更新 activity_registrations 表
ALTER TABLE activity_registrations 
ADD COLUMN IF NOT EXISTS share_by INT COMMENT '分享者ID（老师或园长）' AFTER source,
ADD COLUMN IF NOT EXISTS share_type VARCHAR(20) COMMENT '分享类型: teacher/principal/wechat/qrcode' AFTER share_by,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) COMMENT '来源类型: ACTIVITY_ONLINE/ACTIVITY_OFFLINE等' AFTER share_type,
ADD COLUMN IF NOT EXISTS source_detail JSON COMMENT '来源详情（JSON格式）' AFTER source_type,
ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT FALSE COMMENT '是否自动分配给老师' AFTER source_detail;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_activity_registrations_share_by ON activity_registrations(share_by);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_source_type ON activity_registrations(source_type);

-- 2. 更新 teacher_customers 表
ALTER TABLE teacher_customers 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) COMMENT '来源类型: ACTIVITY_ONLINE/ACTIVITY_OFFLINE等' AFTER source,
ADD COLUMN IF NOT EXISTS source_id INT COMMENT '来源ID（活动ID、报名ID等）' AFTER source_type,
ADD COLUMN IF NOT EXISTS source_detail JSON COMMENT '来源详情（JSON格式）' AFTER source_id,
ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT FALSE COMMENT '是否自动分配' AFTER source_detail;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_teacher_customers_source_type ON teacher_customers(source_type);
CREATE INDEX IF NOT EXISTS idx_teacher_customers_source_id ON teacher_customers(source_id);

-- 验证字段是否添加成功
SELECT 
  'activity_registrations' as table_name,
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'activity_registrations'
  AND COLUMN_NAME IN ('share_by', 'share_type', 'source_type', 'source_detail', 'auto_assigned')
UNION ALL
SELECT 
  'teacher_customers' as table_name,
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'teacher_customers'
  AND COLUMN_NAME IN ('source_type', 'source_id', 'source_detail', 'auto_assigned');

