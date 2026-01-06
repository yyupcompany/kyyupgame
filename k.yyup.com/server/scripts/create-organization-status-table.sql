-- 创建机构现状表
CREATE TABLE IF NOT EXISTS `organization_status` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `kindergarten_id` INT NOT NULL COMMENT '幼儿园ID',
  
  -- 基本情况
  `total_classes` INT DEFAULT 0 COMMENT '班级总数',
  `total_students` INT DEFAULT 0 COMMENT '学生总数',
  `total_teachers` INT DEFAULT 0 COMMENT '教师总数',
  `teacher_student_ratio` DECIMAL(5, 2) DEFAULT 0 COMMENT '师生比',
  
  -- 在园生源数量
  `current_enrollment` INT DEFAULT 0 COMMENT '当前在园人数',
  `enrollment_capacity` INT DEFAULT 0 COMMENT '招生容量',
  `enrollment_rate` DECIMAL(5, 2) DEFAULT 0 COMMENT '入园率(%)',
  `waiting_list_count` INT DEFAULT 0 COMMENT '候补名单人数',
  
  -- 师资数量
  `full_time_teachers` INT DEFAULT 0 COMMENT '全职教师数',
  `part_time_teachers` INT DEFAULT 0 COMMENT '兼职教师数',
  `senior_teachers` INT DEFAULT 0 COMMENT '高级教师数',
  `average_teaching_years` DECIMAL(5, 2) DEFAULT 0 COMMENT '平均教龄(年)',
  
  -- 招生频次
  `monthly_enrollment_frequency` INT DEFAULT 0 COMMENT '月度招生频次',
  `quarterly_enrollment_frequency` INT DEFAULT 0 COMMENT '季度招生频次',
  `yearly_enrollment_frequency` INT DEFAULT 0 COMMENT '年度招生频次',
  
  -- 招生转化率
  `enrollment_conversion_rate` DECIMAL(5, 2) DEFAULT 0 COMMENT '招生转化率(%)',
  `average_enrollment_cycle` INT DEFAULT 0 COMMENT '平均招生周期(天)',
  
  -- 客户跟进现状
  `total_leads` INT DEFAULT 0 COMMENT '总线索数',
  `active_leads` INT DEFAULT 0 COMMENT '活跃线索数',
  `converted_leads` INT DEFAULT 0 COMMENT '已转化线索数',
  `average_followup_count` DECIMAL(5, 2) DEFAULT 0 COMMENT '平均跟进次数',
  `average_response_time` INT DEFAULT 0 COMMENT '平均响应时间(小时)',
  `teacher_followup_load` DECIMAL(5, 2) DEFAULT 0 COMMENT '教师跟进负荷(线索/人)',
  
  -- 财务数据
  `monthly_revenue` DECIMAL(12, 2) DEFAULT 0 COMMENT '月度收入',
  `average_tuition_fee` DECIMAL(10, 2) DEFAULT 0 COMMENT '平均学费',
  `outstanding_payments` DECIMAL(12, 2) DEFAULT 0 COMMENT '待收款项',
  
  -- 活动数据
  `monthly_activity_count` INT DEFAULT 0 COMMENT '月度活动数量',
  `activity_participation_rate` DECIMAL(5, 2) DEFAULT 0 COMMENT '活动参与率(%)',
  
  -- 数据更新时间
  `data_updated_at` DATETIME DEFAULT NULL COMMENT '数据最后更新时间',
  
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kindergarten_id` (`kindergarten_id`),
  KEY `idx_organization_status_kindergarten_id` (`kindergarten_id`),
  CONSTRAINT `fk_organization_status_kindergarten` FOREIGN KEY (`kindergarten_id`) REFERENCES `kindergartens` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='机构现状数据表';

-- 插入示例数据（假设幼儿园ID为1）
INSERT INTO `organization_status` (
  `kindergarten_id`,
  `total_classes`,
  `total_students`,
  `total_teachers`,
  `teacher_student_ratio`,
  `current_enrollment`,
  `enrollment_capacity`,
  `enrollment_rate`,
  `waiting_list_count`,
  `full_time_teachers`,
  `part_time_teachers`,
  `senior_teachers`,
  `average_teaching_years`,
  `monthly_enrollment_frequency`,
  `quarterly_enrollment_frequency`,
  `yearly_enrollment_frequency`,
  `enrollment_conversion_rate`,
  `average_enrollment_cycle`,
  `total_leads`,
  `active_leads`,
  `converted_leads`,
  `average_followup_count`,
  `average_response_time`,
  `teacher_followup_load`,
  `monthly_revenue`,
  `average_tuition_fee`,
  `outstanding_payments`,
  `monthly_activity_count`,
  `activity_participation_rate`,
  `data_updated_at`
) VALUES (
  1,                    -- kindergarten_id
  12,                   -- total_classes: 12个班级
  360,                  -- total_students: 360名学生
  45,                   -- total_teachers: 45名教师
  8.00,                 -- teacher_student_ratio: 师生比1:8
  360,                  -- current_enrollment: 当前在园360人
  400,                  -- enrollment_capacity: 招生容量400人
  90.00,                -- enrollment_rate: 入园率90%
  15,                   -- waiting_list_count: 候补名单15人
  40,                   -- full_time_teachers: 全职教师40人
  5,                    -- part_time_teachers: 兼职教师5人
  12,                   -- senior_teachers: 高级教师12人
  5.50,                 -- average_teaching_years: 平均教龄5.5年
  8,                    -- monthly_enrollment_frequency: 月度招生8次
  25,                   -- quarterly_enrollment_frequency: 季度招生25次
  95,                   -- yearly_enrollment_frequency: 年度招生95次
  35.00,                -- enrollment_conversion_rate: 招生转化率35%
  45,                   -- average_enrollment_cycle: 平均招生周期45天
  280,                  -- total_leads: 总线索280个
  120,                  -- active_leads: 活跃线索120个
  98,                   -- converted_leads: 已转化线索98个
  4.50,                 -- average_followup_count: 平均跟进4.5次
  24,                   -- average_response_time: 平均响应时间24小时
  6.22,                 -- teacher_followup_load: 教师跟进负荷6.22线索/人
  540000.00,            -- monthly_revenue: 月度收入54万元
  3000.00,              -- average_tuition_fee: 平均学费3000元/月
  85000.00,             -- outstanding_payments: 待收款项8.5万元
  12,                   -- monthly_activity_count: 月度活动12次
  85.00,                -- activity_participation_rate: 活动参与率85%
  NOW()                 -- data_updated_at: 数据更新时间
) ON DUPLICATE KEY UPDATE
  `total_classes` = VALUES(`total_classes`),
  `total_students` = VALUES(`total_students`),
  `total_teachers` = VALUES(`total_teachers`),
  `teacher_student_ratio` = VALUES(`teacher_student_ratio`),
  `current_enrollment` = VALUES(`current_enrollment`),
  `enrollment_capacity` = VALUES(`enrollment_capacity`),
  `enrollment_rate` = VALUES(`enrollment_rate`),
  `waiting_list_count` = VALUES(`waiting_list_count`),
  `full_time_teachers` = VALUES(`full_time_teachers`),
  `part_time_teachers` = VALUES(`part_time_teachers`),
  `senior_teachers` = VALUES(`senior_teachers`),
  `average_teaching_years` = VALUES(`average_teaching_years`),
  `monthly_enrollment_frequency` = VALUES(`monthly_enrollment_frequency`),
  `quarterly_enrollment_frequency` = VALUES(`quarterly_enrollment_frequency`),
  `yearly_enrollment_frequency` = VALUES(`yearly_enrollment_frequency`),
  `enrollment_conversion_rate` = VALUES(`enrollment_conversion_rate`),
  `average_enrollment_cycle` = VALUES(`average_enrollment_cycle`),
  `total_leads` = VALUES(`total_leads`),
  `active_leads` = VALUES(`active_leads`),
  `converted_leads` = VALUES(`converted_leads`),
  `average_followup_count` = VALUES(`average_followup_count`),
  `average_response_time` = VALUES(`average_response_time`),
  `teacher_followup_load` = VALUES(`teacher_followup_load`),
  `monthly_revenue` = VALUES(`monthly_revenue`),
  `average_tuition_fee` = VALUES(`average_tuition_fee`),
  `outstanding_payments` = VALUES(`outstanding_payments`),
  `monthly_activity_count` = VALUES(`monthly_activity_count`),
  `activity_participation_rate` = VALUES(`activity_participation_rate`),
  `data_updated_at` = VALUES(`data_updated_at`);

