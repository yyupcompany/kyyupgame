-- ============================================
-- 集团管理系统数据库Schema
-- ============================================
-- 版本: 1.0.0
-- 创建日期: 2025-01-10
-- 说明: 集团管理功能的完整数据库设计
-- ============================================

-- ============================================
-- 1. 集团表 (groups)
-- ============================================
CREATE TABLE `groups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '集团ID',
  `name` VARCHAR(100) NOT NULL COMMENT '集团名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '集团编码',
  `type` TINYINT NOT NULL DEFAULT 1 COMMENT '集团类型: 1-教育集团 2-连锁品牌 3-投资集团',
  
  -- 法人信息
  `legal_person` VARCHAR(50) COMMENT '法人代表',
  `registered_capital` DECIMAL(15,2) COMMENT '注册资本(元)',
  `business_license` VARCHAR(100) COMMENT '营业执照号',
  `established_date` DATE COMMENT '成立日期',
  
  -- 联系信息
  `address` VARCHAR(200) COMMENT '总部地址',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `email` VARCHAR(100) COMMENT '联系邮箱',
  `website` VARCHAR(200) COMMENT '官方网站',
  
  -- 品牌信息
  `logo_url` VARCHAR(500) COMMENT '集团Logo URL',
  `brand_name` VARCHAR(100) COMMENT '品牌名称',
  `slogan` VARCHAR(200) COMMENT '品牌口号',
  `description` TEXT COMMENT '集团简介',
  `vision` TEXT COMMENT '愿景使命',
  `culture` TEXT COMMENT '企业文化',
  
  -- 管理信息
  `chairman` VARCHAR(50) COMMENT '董事长',
  `ceo` VARCHAR(50) COMMENT 'CEO/总经理',
  `investor_id` INT COMMENT '主要投资人用户ID',
  
  -- 统计字段 (冗余字段,提升查询性能)
  `kindergarten_count` INT DEFAULT 0 COMMENT '园所数量',
  `total_students` INT DEFAULT 0 COMMENT '总学生数',
  `total_teachers` INT DEFAULT 0 COMMENT '总教师数',
  `total_classes` INT DEFAULT 0 COMMENT '总班级数',
  `total_capacity` INT DEFAULT 0 COMMENT '总容量',
  
  -- 财务统计 (可选)
  `annual_revenue` DECIMAL(15,2) COMMENT '年度收入(元)',
  `annual_profit` DECIMAL(15,2) COMMENT '年度利润(元)',
  
  -- 状态和审计
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-正常 2-审核中',
  `creator_id` INT COMMENT '创建人ID',
  `updater_id` INT COMMENT '更新人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL COMMENT '软删除时间',
  
  -- 索引
  INDEX `idx_code` (`code`),
  INDEX `idx_investor` (`investor_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  
  -- 外键
  FOREIGN KEY (`investor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`updater_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='集团表';

-- ============================================
-- 2. 集团用户关联表 (group_users)
-- ============================================
CREATE TABLE `group_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `group_id` INT NOT NULL COMMENT '集团ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `role` TINYINT NOT NULL COMMENT '集团角色: 1-投资人 2-集团管理员 3-财务总监 4-运营总监 5-人力总监',
  
  -- 权限配置
  `permissions` JSON COMMENT '权限配置 (JSON格式)',
  `can_view_all_kindergartens` TINYINT DEFAULT 1 COMMENT '可查看所有园所: 0-否 1-是',
  `can_manage_kindergartens` TINYINT DEFAULT 0 COMMENT '可管理园所: 0-否 1-是',
  `can_view_finance` TINYINT DEFAULT 0 COMMENT '可查看财务: 0-否 1-是',
  `can_manage_finance` TINYINT DEFAULT 0 COMMENT '可管理财务: 0-否 1-是',
  
  -- 备注
  `remark` VARCHAR(500) COMMENT '备注',
  
  -- 状态和审计
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL COMMENT '软删除时间',
  
  -- 索引
  UNIQUE KEY `uk_group_user` (`group_id`, `user_id`, `deleted_at`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`),
  
  -- 外键
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='集团用户关联表';

-- ============================================
-- 3. 幼儿园表扩展 (kindergartens)
-- ============================================
-- 为现有的 kindergartens 表添加集团相关字段

ALTER TABLE `kindergartens` 
ADD COLUMN `group_id` INT NULL COMMENT '所属集团ID' AFTER `id`,
ADD COLUMN `is_group_headquarters` TINYINT DEFAULT 0 COMMENT '是否集团总部: 0-否 1-是' AFTER `group_id`,
ADD COLUMN `join_group_date` DATE NULL COMMENT '加入集团日期' AFTER `is_group_headquarters`,
ADD COLUMN `group_role` TINYINT NULL COMMENT '集团角色: 1-旗舰园 2-标准园 3-加盟园 4-托管园' AFTER `join_group_date`,
ADD COLUMN `group_order` INT DEFAULT 0 COMMENT '集团内排序' AFTER `group_role`;

-- 添加索引
ALTER TABLE `kindergartens`
ADD INDEX `idx_group_id` (`group_id`),
ADD INDEX `idx_is_headquarters` (`is_group_headquarters`);

-- 添加外键约束
ALTER TABLE `kindergartens`
ADD CONSTRAINT `fk_kindergarten_group` 
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE SET NULL;

-- ============================================
-- 4. 集团配置表 (group_configs) - 可选
-- ============================================
CREATE TABLE `group_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `group_id` INT NOT NULL COMMENT '集团ID',
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `config_type` VARCHAR(50) DEFAULT 'string' COMMENT '配置类型: string/number/boolean/json',
  `description` VARCHAR(500) COMMENT '配置说明',
  
  -- 审计
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  UNIQUE KEY `uk_group_config` (`group_id`, `config_key`),
  INDEX `idx_config_key` (`config_key`),
  
  -- 外键
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='集团配置表';

-- ============================================
-- 5. 集团操作日志表 (group_operation_logs) - 可选
-- ============================================
CREATE TABLE `group_operation_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `group_id` INT NOT NULL COMMENT '集团ID',
  `user_id` INT NOT NULL COMMENT '操作人ID',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `operation_desc` VARCHAR(500) COMMENT '操作描述',
  `target_type` VARCHAR(50) COMMENT '目标类型: kindergarten/user/config',
  `target_id` INT COMMENT '目标ID',
  `old_value` JSON COMMENT '旧值',
  `new_value` JSON COMMENT '新值',
  `ip_address` VARCHAR(50) COMMENT 'IP地址',
  `user_agent` VARCHAR(500) COMMENT '用户代理',
  
  -- 审计
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 索引
  INDEX `idx_group` (`group_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_operation_type` (`operation_type`),
  INDEX `idx_created_at` (`created_at`),
  
  -- 外键
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='集团操作日志表';

-- ============================================
-- 6. 视图定义
-- ============================================

-- 集团统计视图
CREATE OR REPLACE VIEW `v_group_statistics` AS
SELECT 
  g.id AS group_id,
  g.name AS group_name,
  g.code AS group_code,
  COUNT(DISTINCT k.id) AS kindergarten_count,
  SUM(k.student_count) AS total_students,
  SUM(k.teacher_count) AS total_teachers,
  SUM(k.class_count) AS total_classes,
  AVG(k.student_count) AS avg_students_per_kindergarten,
  MAX(k.student_count) AS max_students,
  MIN(k.student_count) AS min_students
FROM `groups` g
LEFT JOIN `kindergartens` k ON g.id = k.group_id AND k.deleted_at IS NULL
WHERE g.deleted_at IS NULL
GROUP BY g.id, g.name, g.code;

-- 集团园所详情视图
CREATE OR REPLACE VIEW `v_group_kindergartens` AS
SELECT 
  g.id AS group_id,
  g.name AS group_name,
  k.id AS kindergarten_id,
  k.name AS kindergarten_name,
  k.code AS kindergarten_code,
  k.is_group_headquarters,
  k.group_role,
  k.join_group_date,
  k.student_count,
  k.teacher_count,
  k.class_count,
  k.status
FROM `groups` g
INNER JOIN `kindergartens` k ON g.id = k.group_id
WHERE g.deleted_at IS NULL AND k.deleted_at IS NULL;

-- ============================================
-- 7. 存储过程
-- ============================================

-- 更新集团统计数据
DELIMITER $$

CREATE PROCEDURE `sp_update_group_statistics`(IN p_group_id INT)
BEGIN
  UPDATE `groups` g
  SET 
    g.kindergarten_count = (
      SELECT COUNT(*) 
      FROM `kindergartens` k 
      WHERE k.group_id = p_group_id AND k.deleted_at IS NULL
    ),
    g.total_students = (
      SELECT COALESCE(SUM(k.student_count), 0)
      FROM `kindergartens` k 
      WHERE k.group_id = p_group_id AND k.deleted_at IS NULL
    ),
    g.total_teachers = (
      SELECT COALESCE(SUM(k.teacher_count), 0)
      FROM `kindergartens` k 
      WHERE k.group_id = p_group_id AND k.deleted_at IS NULL
    ),
    g.total_classes = (
      SELECT COALESCE(SUM(k.class_count), 0)
      FROM `kindergartens` k 
      WHERE k.group_id = p_group_id AND k.deleted_at IS NULL
    ),
    g.updated_at = NOW()
  WHERE g.id = p_group_id;
END$$

DELIMITER ;

-- ============================================
-- 8. 触发器
-- ============================================

-- 幼儿园加入集团时更新集团统计
DELIMITER $$

CREATE TRIGGER `trg_kindergarten_join_group_after_update`
AFTER UPDATE ON `kindergartens`
FOR EACH ROW
BEGIN
  -- 如果 group_id 发生变化
  IF OLD.group_id IS NULL AND NEW.group_id IS NOT NULL THEN
    -- 新集团统计+1
    CALL sp_update_group_statistics(NEW.group_id);
  ELSEIF OLD.group_id IS NOT NULL AND NEW.group_id IS NULL THEN
    -- 旧集团统计-1
    CALL sp_update_group_statistics(OLD.group_id);
  ELSEIF OLD.group_id IS NOT NULL AND NEW.group_id IS NOT NULL AND OLD.group_id != NEW.group_id THEN
    -- 从旧集团转到新集团
    CALL sp_update_group_statistics(OLD.group_id);
    CALL sp_update_group_statistics(NEW.group_id);
  END IF;
END$$

DELIMITER ;

-- ============================================
-- 9. 初始数据
-- ============================================

-- 插入示例集团数据 (可选)
INSERT INTO `groups` (
  `name`, `code`, `type`, `legal_person`, `registered_capital`, 
  `established_date`, `address`, `phone`, `email`, 
  `brand_name`, `slogan`, `description`, `status`
) VALUES (
  '阳光教育集团', 'SUNSHINE001', 1, '张三', 10000000.00,
  '2020-01-01', '北京市朝阳区阳光大道123号', '010-12345678', 'contact@sunshine-edu.com',
  '阳光幼教', '让每个孩子都能享受阳光般的教育', '阳光教育集团成立于2020年，致力于提供优质的学前教育服务...', 1
);

-- ============================================
-- 10. 权限设置
-- ============================================

-- 创建集团管理专用数据库用户 (可选)
-- CREATE USER 'group_admin'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON kindergarten_db.groups TO 'group_admin'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON kindergarten_db.group_users TO 'group_admin'@'localhost';
-- GRANT SELECT, UPDATE ON kindergarten_db.kindergartens TO 'group_admin'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- 说明
-- ============================================
-- 1. 所有表都使用 InnoDB 引擎，支持事务和外键
-- 2. 使用 utf8mb4 字符集，支持emoji等特殊字符
-- 3. 所有表都包含软删除字段 deleted_at
-- 4. 使用冗余字段提升查询性能 (如 kindergarten_count)
-- 5. 通过触发器自动维护统计数据的一致性
-- 6. 提供视图简化常用查询
-- 7. 提供存储过程封装复杂业务逻辑
-- ============================================

