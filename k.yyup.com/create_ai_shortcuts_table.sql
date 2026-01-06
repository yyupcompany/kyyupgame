-- 创建 AI 快捷操作表
CREATE TABLE IF NOT EXISTS ai_shortcuts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shortcut_name VARCHAR(100) NOT NULL COMMENT '快捷操作名称',
  prompt_name VARCHAR(100) NOT NULL COMMENT '提示词名称',
  category VARCHAR(50) NOT NULL COMMENT '类别',
  role VARCHAR(50) NOT NULL DEFAULT 'all' COMMENT '适用角色',
  api_endpoint VARCHAR(200) COMMENT 'API端点',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否激活',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI快捷操作配置表';

-- 插入一些示例数据
INSERT INTO ai_shortcuts (shortcut_name, prompt_name, category, role, sort_order) VALUES
('招生数据分析', '分析招生数据趋势', 'enrollment_planning', 'admin', 1),
('活动策划建议', '生成活动策划方案', 'activity_planning', 'teacher', 2),
('学生进展分析', '分析学生学习进展', 'progress_analysis', 'teacher', 3),
('家长沟通提醒', '生成家长沟通内容', 'follow_up_reminder', 'teacher', 4),
('转化率监控', '监控招生转化率', 'conversion_monitoring', 'admin', 5);
