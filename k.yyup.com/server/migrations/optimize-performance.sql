-- =====================================================
-- 幼儿园管理系统性能优化 - 数据库索引优化脚本
-- 创建时间: 2025-11-16
-- 目标: 优化中心页面查询性能，减少API响应时间
-- =====================================================

-- 设置事务开始
START TRANSACTION;

-- =====================================================
-- 1. 系统中心 (/centers/system) 相关索引优化
-- 解决15.4秒加载异常问题
-- =====================================================

-- 用户表索引优化 - 系统管理查询
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_real_name ON users(real_name);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_status_updated_at ON users(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_users_email_status ON users(email, status);

-- 角色表索引优化
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_status ON roles(status);

-- 权限表索引优化
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);

-- 角色权限关联表索引优化
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- 系统日志表索引优化 - 查询系统状态
CREATE INDEX IF NOT EXISTS idx_system_logs_level_operation ON system_logs(level, operation_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_module_created ON system_logs(module_name, created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id_level ON system_logs(user_id, level);

-- =====================================================
-- 2. 财务中心 (/centers/finance) 相关索引优化
-- 解决4.49秒加载问题
-- =====================================================

-- 缴费单表索引优化 - 财务统计查询
CREATE INDEX IF NOT EXISTS idx_payment_bills_status_amount ON payment_bills(status, total_amount);
CREATE INDEX IF NOT EXISTS idx_payment_bills_due_date ON payment_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_bills_student_id ON payment_bills(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_bills_created_at ON payment_bills(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_bills_kindergarten_id ON payment_bills(kindergarten_id);
CREATE INDEX IF NOT EXISTS idx_payment_bills_status_template ON payment_bills(status, template_id);

-- 缴费记录表索引优化 - 支付统计
CREATE INDEX IF NOT EXISTS idx_payment_records_status_date ON payment_records(status, payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_bill_id ON payment_records(billId);
CREATE INDEX IF NOT EXISTS idx_payment_records_confirmed_by ON payment_records(confirmed_by);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_method ON payment_records(payment_method);

-- 收费项目表索引优化
CREATE INDEX IF NOT EXISTS idx_fee_items_category_status ON fee_items(category, status);
CREATE INDEX IF NOT EXISTS idx_fee_items_kindergarten_id ON fee_items(kindergarten_id);
CREATE INDEX IF NOT EXISTS idx_fee_items_name ON fee_items(name);

-- 财务报表表索引优化
CREATE INDEX IF NOT EXISTS idx_financial_reports_type_period ON financial_reports(type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_reports_kindergarten_id ON financial_reports(kindergarten_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_created_by ON financial_reports(created_by);

-- 费用套餐模板表索引优化
CREATE INDEX IF NOT EXISTS idx_fee_package_templates_kindergarten_id ON fee_package_templates(kindergarten_id);
CREATE INDEX IF NOT EXISTS idx_fee_package_templates_status ON fee_package_templates(status);

-- =====================================================
-- 3. 活动中心 (/centers/activity) 相关索引优化
-- 解决6.19秒加载问题
-- =====================================================

-- 活动表索引优化 - 活动列表查询
CREATE INDEX IF NOT EXISTS idx_activities_status_type_time ON activities(status, activity_type, start_time);
CREATE INDEX IF NOT EXISTS idx_activities_kindergarten_id_time ON activities(kindergarten_id, start_time);
CREATE INDEX IF NOT EXISTS idx_activities_creator_id ON activities(creator_id);
CREATE INDEX IF NOT EXISTS idx_activities_publish_status ON activities(publish_status);
CREATE INDEX IF NOT EXISTS idx_activities_end_time ON activities(end_time);
CREATE INDEX IF NOT EXISTS idx_activities_max_participants ON activities(max_participants);

-- 活动报名表索引优化 - 报名统计查询
CREATE INDEX IF NOT EXISTS idx_activity_registrations_status_activity ON activity_registrations(status, activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_student_id ON activity_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_time ON activity_registrations(registration_time);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_share_by ON activity_registrations(share_by);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_source_type ON activity_registrations(source_type);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_parent_id ON activity_registrations(parentId);

-- 活动计划表索引优化
CREATE INDEX IF NOT EXISTS idx_activity_plans_kindergarten_id ON activity_plans(kindergarten_id);
CREATE INDEX IF NOT EXISTS idx_activity_plans_status ON activity_plans(status);

-- =====================================================
-- 4. 教师中心 (teacher-center/dashboard) 相关索引优化
-- 解决5.98秒加载问题
-- =====================================================

-- 教师表索引优化 - 教师管理查询
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_kindergarten_id_status ON teachers(kindergarten_id, status);
CREATE INDEX IF NOT EXISTS idx_teachers_position_status ON teachers(position, status);
CREATE INDEX IF NOT EXISTS idx_teachers_hire_date ON teachers(hire_date);
CREATE INDEX IF NOT EXISTS idx_teachers_group_id ON teachers(group_id);

-- 任务表索引优化 - 任务统计查询
CREATE INDEX IF NOT EXISTS idx_todos_assigned_to_status ON todos(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_todos_due_date_status ON todos(due_date, status);
CREATE INDEX IF NOT EXISTS idx_todos_priority_status ON todos(priority, status);
CREATE INDEX IF NOT EXISTS idx_todos_related_id_type ON todos(related_id, related_type);
CREATE INDEX IF NOT EXISTS idx_todos_kindergarten_id ON todos(kindergarten_id);

-- 通知表索引优化 - 通知查询
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_type_created_at ON notifications(type, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_kindergarten_id ON notifications(kindergarten_id);

-- 日程表索引优化 - 日程查询
CREATE INDEX IF NOT EXISTS idx_schedules_user_id_date ON schedules(user_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_schedules_kindergarten_id ON schedules(kindergarten_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON schedules(start_time);

-- 课程进度表索引优化 - 教学进度查询
CREATE INDEX IF NOT EXISTS idx_course_progress_teacher_id_date ON course_progress(teacher_id, session_date);
CREATE INDEX IF NOT EXISTS idx_course_progress_teacher_status ON course_progress(teacher_id, completion_status);
CREATE INDEX IF NOT EXISTS idx_course_progress_class_id ON course_progress(class_id);

-- =====================================================
-- 5. 评估中心相关索引优化
-- =====================================================

-- 评估配置表索引优化
CREATE INDEX IF NOT EXISTS idx_assessment_configs_type ON assessment_configs(type);
CREATE INDEX IF NOT EXISTS idx_assessment_configs_kindergarten_id ON assessment_configs(kindergarten_id);

-- 评估问题表索引优化
CREATE INDEX IF NOT EXISTS idx_assessment_questions_config_id ON assessment_questions(config_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_difficulty ON assessment_questions(difficulty);

-- 体测项目表索引优化
CREATE INDEX IF NOT EXISTS idx_physical_items_category ON physical_items(category);
CREATE INDEX IF NOT EXISTS idx_physical_items_age_group ON physical_items(age_group);

-- 评估记录表索引优化
CREATE INDEX IF NOT EXISTS idx_assessment_records_student_id ON assessment_records(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_records_config_id ON assessment_records(config_id);
CREATE INDEX IF NOT EXISTS idx_assessment_records_created_at ON assessment_records(created_at);

-- =====================================================
-- 6. 通用优化索引
-- =====================================================

-- 班级表索引优化
CREATE INDEX IF NOT EXISTS idx_classes_kindergarten_id_status ON classes(kindergarten_id, status);
CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(name);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade);

-- 学生表索引优化
CREATE INDEX IF NOT EXISTS idx_students_kindergarten_id_class ON students(kindergarten_id, classId);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- 家长表索引优化
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_parents_kindergarten_id ON parents(kindergartenId);
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone);

-- =====================================================
-- 7. 查询性能监控索引
-- =====================================================

-- 创建慢查询日志表（如果不存在）
CREATE TABLE IF NOT EXISTS slow_query_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query_text TEXT NOT NULL,
    execution_time DECIMAL(10,3) NOT NULL,
    rows_examined INT DEFAULT 0,
    rows_sent INT DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    database_name VARCHAR(100),
    table_name VARCHAR(100),
    INDEX idx_slow_query_time (execution_time),
    INDEX idx_slow_query_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建索引使用统计表（如果不存在）
CREATE TABLE IF NOT EXISTS index_usage_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    index_name VARCHAR(100) NOT NULL,
    usage_count INT DEFAULT 0,
    last_used DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_table_index (table_name, index_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 8. 索引效果验证查询
-- =====================================================

-- 查看所有创建的索引
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    INDEX_TYPE,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN (
        'users', 'roles', 'permissions', 'role_permissions', 'system_logs',
        'payment_bills', 'payment_records', 'fee_items', 'financial_reports',
        'fee_package_templates',
        'activities', 'activity_registrations', 'activity_plans',
        'teachers', 'todos', 'notifications', 'schedules', 'course_progress',
        'assessment_configs', 'assessment_questions', 'physical_items', 'assessment_records',
        'classes', 'students', 'parents'
    )
ORDER BY TABLE_NAME, INDEX_NAME;

-- 验证索引创建状态
SELECT
    COUNT(*) as total_indexes_created,
    COUNT(DISTINCT TABLE_NAME) as tables_optimized
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
    AND INDEX_NAME LIKE 'idx_%';

-- =====================================================
-- 9. 性能测试查询（执行前记录）
-- =====================================================

-- 系统中心测试查询
EXPLAIN SELECT * FROM users WHERE role = 'admin' AND status = 'active' ORDER BY created_at DESC LIMIT 20;

-- 财务中心测试查询
EXPLAIN SELECT * FROM payment_bills WHERE status = 'pending' AND due_date < NOW() ORDER BY due_date ASC LIMIT 20;

-- 活动中心测试查询
EXPLAIN SELECT a.*, COUNT(ar.id) as registration_count
FROM activities a
LEFT JOIN activity_registrations ar ON a.id = ar.activity_id AND ar.status != 'cancelled'
WHERE a.kindergarten_id = 1 AND a.status = 'published'
GROUP BY a.id
ORDER BY a.start_time DESC
LIMIT 20;

-- 教师中心测试查询
EXPLAIN SELECT t.*,
       COUNT(CASE WHEN todo.status != 'completed' THEN 1 END) as pending_tasks
FROM teachers t
LEFT JOIN todos ON t.id = todos.assigned_to
WHERE t.kindergarten_id = 1 AND t.status = 'active'
GROUP BY t.id
ORDER BY t.hire_date DESC
LIMIT 20;

-- =====================================================
-- 提交事务
-- =====================================================

COMMIT;

-- =====================================================
-- 10. 执行完成提示
-- =====================================================

SELECT '性能优化索引创建完成！' as message,
       '建议重启数据库服务以使索引生效' as recommendation,
       NOW() as completion_time;

-- 显示创建的索引统计
SELECT
    '索引创建统计' as description,
    COUNT(*) as total_indexes,
    COUNT(DISTINCT TABLE_NAME) as optimized_tables
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
    AND INDEX_NAME LIKE 'idx_%';

SELECT '性能优化脚本执行完成！请重新启动数据库服务以应用索引优化。' as final_message;