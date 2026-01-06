-- SIP配置初始化脚本
-- 用于呼叫中心功能

-- 创建sip_configs表（如果不存在）
CREATE TABLE IF NOT EXISTS sip_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  server_host VARCHAR(255) NOT NULL COMMENT 'SIP服务器地址',
  server_port INT NOT NULL DEFAULT 5060 COMMENT 'SIP服务器端口',
  username VARCHAR(100) NOT NULL COMMENT 'SIP用户名',
  password VARCHAR(255) NOT NULL COMMENT 'SIP密码',
  protocol ENUM('UDP', 'TCP') DEFAULT 'UDP' COMMENT '通信协议',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  last_register_time TIMESTAMP NULL COMMENT '最后注册时间',
  register_interval INT DEFAULT 3600 COMMENT '注册间隔(秒)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SIP服务器配置表';

-- 插入默认SIP配置（基于Python测试脚本成功的配置）
INSERT INTO sip_configs (
  user_id, 
  server_host, 
  server_port, 
  username, 
  password, 
  protocol, 
  is_active, 
  register_interval
) VALUES (
  1,                    -- user_id: 管理员用户
  '47.94.82.59',        -- server_host: Kamailio服务器地址
  5060,                 -- server_port: SIP标准端口
  'kanderadmin',        -- username: SIP主账号
  'Szblade3944',        -- password: SIP密码
  'UDP',                -- protocol: UDP协议（与Python脚本一致）
  TRUE,                 -- is_active: 启用
  3600                  -- register_interval: 每小时注册一次
)
ON DUPLICATE KEY UPDATE
  server_host = VALUES(server_host),
  server_port = VALUES(server_port),
  username = VALUES(username),
  password = VALUES(password),
  protocol = VALUES(protocol),
  is_active = VALUES(is_active),
  register_interval = VALUES(register_interval),
  updated_at = CURRENT_TIMESTAMP;

-- 创建sip_extensions表（分机账号表）
CREATE TABLE IF NOT EXISTS sip_extensions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sip_config_id INT NOT NULL COMMENT '关联SIP配置ID',
  extension VARCHAR(20) NOT NULL COMMENT '分机号',
  password VARCHAR(255) NOT NULL COMMENT '分机密码',
  display_name VARCHAR(100) COMMENT '显示名称',
  permission_level INT DEFAULT 1 COMMENT '权限级别',
  max_concurrent_calls INT DEFAULT 1 COMMENT '最大并发通话数',
  allow_outbound BOOLEAN DEFAULT TRUE COMMENT '允许呼出',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  last_register_time TIMESTAMP NULL COMMENT '最后注册时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sip_config_id) REFERENCES sip_configs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_extension (sip_config_id, extension),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SIP分机账号表';

-- 插入示例分机账号
INSERT INTO sip_extensions (
  sip_config_id,
  extension,
  password,
  display_name,
  permission_level,
  max_concurrent_calls,
  allow_outbound,
  is_active
) VALUES 
(1, '1001', 'ext1001pass', '招生顾问1号', 1, 2, TRUE, TRUE),
(1, '1002', 'ext1002pass', '招生顾问2号', 1, 2, TRUE, TRUE),
(1, '1003', 'ext1003pass', '招生顾问3号', 1, 2, TRUE, TRUE)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  display_name = VALUES(display_name),
  permission_level = VALUES(permission_level),
  max_concurrent_calls = VALUES(max_concurrent_calls),
  allow_outbound = VALUES(allow_outbound),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;

-- 验证插入结果
SELECT 
  id,
  server_host,
  server_port,
  username,
  protocol,
  is_active,
  created_at
FROM sip_configs 
WHERE is_active = TRUE;

SELECT 
  e.id,
  e.extension,
  e.display_name,
  e.is_active,
  c.server_host
FROM sip_extensions e
JOIN sip_configs c ON e.sip_config_id = c.id
WHERE e.is_active = TRUE;

