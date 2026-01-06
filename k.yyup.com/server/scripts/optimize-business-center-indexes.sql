-- =====================================================
-- 业务中心性能优化 - 数据库索引优化脚本
-- =====================================================
-- 用途：为业务中心相关表添加索引，提升查询性能
-- 执行方式：mysql -u root -p kindergarten_db < optimize-business-center-indexes.sql
-- =====================================================

USE kindergarten_db;

-- =====================================================
-- 1. 招生相关表索引优化
-- =====================================================

-- 招生申请表 (enrollment_applications)
-- 优化 status 和 createdAt 查询
ALTER TABLE enrollment_applications 
ADD INDEX idx_status (status),
ADD INDEX idx_created_at (created_at),
ADD INDEX idx_status_created (status, created_at);

-- 招生咨询表 (enrollment_consultations)
-- 优化时间范围查询
ALTER TABLE enrollment_consultations
ADD INDEX idx_created_at (created_at),
ADD INDEX idx_status_created (status, created_at);

-- =====================================================
-- 2. 人员相关表索引优化
-- =====================================================

-- 教师表 (teachers)
-- 优化状态查询
ALTER TABLE teachers
ADD INDEX idx_status (status);

-- 学生表 (students)
-- 优化状态查询
ALTER TABLE students
ADD INDEX idx_status (status);

-- 班级表 (classes)
-- 优化状态查询
ALTER TABLE classes
ADD INDEX idx_status (status);

-- =====================================================
-- 3. 活动相关表索引优化
-- =====================================================

-- 活动计划表 (activity_plans)
-- 优化状态查询
ALTER TABLE activity_plans
ADD INDEX idx_status (status),
ADD INDEX idx_created_at (created_at);

-- =====================================================
-- 4. 营销相关表索引优化
-- =====================================================

-- 营销活动表 (marketing_campaigns)
-- 优化状态查询
ALTER TABLE marketing_campaigns
ADD INDEX idx_status (status),
ADD INDEX idx_created_at (created_at);

-- =====================================================
-- 5. 任务相关表索引优化
-- =====================================================

-- 待办事项表 (todos)
-- 优化状态和截止日期查询
ALTER TABLE todos
ADD INDEX idx_status (status),
ADD INDEX idx_due_date (due_date),
ADD INDEX idx_status_due (status, due_date);

-- =====================================================
-- 6. 财务相关表索引优化
-- =====================================================

-- 缴费单表 (payment_bills)
-- 优化状态查询
ALTER TABLE payment_bills
ADD INDEX idx_status (status);

-- 缴费记录表 (payment_records)
-- 优化状态查询
ALTER TABLE payment_records
ADD INDEX idx_status (status);

-- =====================================================
-- 7. 系统配置表索引优化
-- =====================================================

-- 系统配置表 (system_configs)
-- 优化配置查询
ALTER TABLE system_configs
ADD INDEX idx_group_key (group_key, config_key);

-- =====================================================
-- 8. 验证索引创建结果
-- =====================================================

-- 查看招生申请表的索引
SHOW INDEX FROM enrollment_applications;

-- 查看招生咨询表的索引
SHOW INDEX FROM enrollment_consultations;

-- 查看活动计划表的索引
SHOW INDEX FROM activity_plans;

-- 查看营销活动表的索引
SHOW INDEX FROM marketing_campaigns;

-- 查看待办事项表的索引
SHOW INDEX FROM todos;

-- 查看缴费单表的索引
SHOW INDEX FROM payment_bills;

-- 查看系统配置表的索引
SHOW INDEX FROM system_configs;

-- =====================================================
-- 9. 性能分析建议
-- =====================================================

-- 分析招生申请表的查询性能
EXPLAIN SELECT COUNT(*) FROM enrollment_applications WHERE created_at >= '2024-01-01';

-- 分析活动计划表的查询性能
EXPLAIN SELECT COUNT(*) FROM activity_plans WHERE status = 'ongoing';

-- 分析待办事项表的查询性能
EXPLAIN SELECT COUNT(*) FROM todos WHERE status != 'completed' AND due_date < NOW();

-- =====================================================
-- 完成
-- =====================================================
SELECT '✅ 业务中心数据库索引优化完成！' AS message;

