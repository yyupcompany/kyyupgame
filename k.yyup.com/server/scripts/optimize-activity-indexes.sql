-- 活动中心性能优化 - 数据库索引
-- 用于加速活动中心仪表板查询

-- 删除可能存在的旧索引（忽略错误）
SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0;

-- 1. activities 表索引优化
-- 加速状态和时间范围查询
DROP INDEX IF EXISTS idx_activities_status_time ON activities;
CREATE INDEX idx_activities_status_time
ON activities(status, start_time, end_time, deleted_at);

-- 加速按创建时间排序
DROP INDEX IF EXISTS idx_activities_created ON activities;
CREATE INDEX idx_activities_created
ON activities(created_at, deleted_at);

-- 2. activity_registrations 表索引优化
-- 加速报名统计查询
DROP INDEX IF EXISTS idx_activity_registrations_deleted ON activity_registrations;
CREATE INDEX idx_activity_registrations_deleted
ON activity_registrations(deleted_at);

-- 加速按创建时间排序的报名查询
DROP INDEX IF EXISTS idx_activity_registrations_created ON activity_registrations;
CREATE INDEX idx_activity_registrations_created
ON activity_registrations(created_at, deleted_at);

-- 加速按活动ID查询报名
DROP INDEX IF EXISTS idx_activity_registrations_activity ON activity_registrations;
CREATE INDEX idx_activity_registrations_activity
ON activity_registrations(activity_id, deleted_at);

-- 3. activity_evaluations 表索引优化
-- 加速评分统计查询
DROP INDEX IF EXISTS idx_activity_evaluations_rating ON activity_evaluations;
CREATE INDEX idx_activity_evaluations_rating
ON activity_evaluations(rating, deleted_at);

-- 4. activity_templates 表索引优化
-- 加速模板查询
DROP INDEX IF EXISTS idx_activity_templates_status_usage ON activity_templates;
CREATE INDEX idx_activity_templates_status_usage
ON activity_templates(status, usage_count, deleted_at);

-- 5. activity_plans 表索引优化
-- 加速计划查询
DROP INDEX IF EXISTS idx_activity_plans_time ON activity_plans;
CREATE INDEX idx_activity_plans_time
ON activity_plans(start_time, deleted_at);

-- 6. poster_templates 表索引优化
-- 加速海报模板查询
DROP INDEX IF EXISTS idx_poster_templates_status_usage ON poster_templates;
CREATE INDEX idx_poster_templates_status_usage
ON poster_templates(status, usage_count, deleted_at);

SET SQL_NOTES=@OLD_SQL_NOTES;

-- 显示创建的索引
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN (
        'activities', 
        'activity_registrations', 
        'activity_evaluations',
        'activity_templates',
        'activity_plans',
        'poster_templates'
    )
    AND INDEX_NAME LIKE 'idx_%'
ORDER BY 
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

