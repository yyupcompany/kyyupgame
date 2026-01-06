-- 创建安全相关数据表
-- 执行时间：2024-01-01

-- 安全威胁表
CREATE TABLE IF NOT EXISTS `security_threats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `threatType` varchar(100) NOT NULL COMMENT '威胁类型：如SQL注入、XSS、暴力破解等',
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium' COMMENT '威胁严重程度',
  `status` enum('active','resolved','ignored','blocked') NOT NULL DEFAULT 'active' COMMENT '威胁状态',
  `sourceIp` varchar(45) DEFAULT NULL COMMENT '威胁来源IP地址',
  `targetResource` varchar(255) DEFAULT NULL COMMENT '目标资源',
  `description` text NOT NULL COMMENT '威胁描述',
  `detectionMethod` varchar(100) NOT NULL COMMENT '检测方法：如规则引擎、AI检测、手动报告等',
  `riskScore` int NOT NULL DEFAULT '0' COMMENT '风险评分 (0-100)',
  `handledBy` int DEFAULT NULL COMMENT '处理人员ID',
  `handledAt` datetime DEFAULT NULL COMMENT '处理时间',
  `notes` text COMMENT '处理备注',
  `metadata` text COMMENT '额外元数据（JSON格式）',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_severity` (`severity`),
  KEY `idx_threatType` (`threatType`),
  KEY `idx_sourceIp` (`sourceIp`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全威胁表';

-- 安全漏洞表
CREATE TABLE IF NOT EXISTS `security_vulnerabilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cveId` varchar(20) DEFAULT NULL COMMENT 'CVE编号',
  `title` varchar(255) NOT NULL COMMENT '漏洞标题',
  `description` text NOT NULL COMMENT '漏洞详细描述',
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium' COMMENT '漏洞严重程度',
  `status` enum('open','confirmed','fixed','ignored','false_positive') NOT NULL DEFAULT 'open' COMMENT '漏洞状态',
  `category` varchar(100) NOT NULL COMMENT '漏洞分类：如注入、认证、授权等',
  `affectedComponent` varchar(255) NOT NULL COMMENT '受影响的组件或模块',
  `discoveryMethod` varchar(100) NOT NULL COMMENT '发现方法：如自动扫描、代码审计、渗透测试等',
  `cvssScore` decimal(3,1) DEFAULT NULL COMMENT 'CVSS评分 (0.0-10.0)',
  `exploitability` enum('none','low','medium','high') NOT NULL DEFAULT 'medium' COMMENT '可利用性',
  `impact` enum('none','low','medium','high') NOT NULL DEFAULT 'medium' COMMENT '影响程度',
  `solution` text COMMENT '解决方案',
  `references` text COMMENT '参考链接（JSON格式）',
  `discoveredBy` int DEFAULT NULL COMMENT '发现人员ID',
  `assignedTo` int DEFAULT NULL COMMENT '分配给的人员ID',
  `fixedBy` int DEFAULT NULL COMMENT '修复人员ID',
  `fixedAt` datetime DEFAULT NULL COMMENT '修复时间',
  `verifiedAt` datetime DEFAULT NULL COMMENT '验证时间',
  `metadata` text COMMENT '额外元数据（JSON格式）',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cveId` (`cveId`),
  KEY `idx_status` (`status`),
  KEY `idx_severity` (`severity`),
  KEY `idx_category` (`category`),
  KEY `idx_affectedComponent` (`affectedComponent`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全漏洞表';

-- 安全配置表
CREATE TABLE IF NOT EXISTS `security_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `configKey` varchar(100) NOT NULL COMMENT '配置键名',
  `configValue` text NOT NULL COMMENT '配置值（JSON格式）',
  `description` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `category` varchar(50) NOT NULL DEFAULT 'general' COMMENT '配置分类：如password、session、auth等',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `updatedBy` int DEFAULT NULL COMMENT '更新人员ID',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_configKey` (`configKey`),
  KEY `idx_category` (`category`),
  KEY `idx_isActive` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全配置表';

-- 安全扫描日志表
CREATE TABLE IF NOT EXISTS `security_scan_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scanType` varchar(50) NOT NULL COMMENT '扫描类型：如quick、full、custom等',
  `targets` text COMMENT '扫描目标（JSON格式）',
  `status` enum('pending','running','completed','failed','cancelled') NOT NULL DEFAULT 'pending' COMMENT '扫描状态',
  `startedBy` int DEFAULT NULL COMMENT '启动扫描的用户ID',
  `startedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '扫描开始时间',
  `completedAt` datetime DEFAULT NULL COMMENT '扫描完成时间',
  `duration` int DEFAULT NULL COMMENT '扫描耗时（秒）',
  `threatsFound` int DEFAULT '0' COMMENT '发现的威胁数量',
  `vulnerabilitiesFound` int DEFAULT '0' COMMENT '发现的漏洞数量',
  `results` text COMMENT '扫描结果（JSON格式）',
  `errorMessage` text COMMENT '错误信息',
  `metadata` text COMMENT '额外元数据（JSON格式）',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_scanType` (`scanType`),
  KEY `idx_startedBy` (`startedBy`),
  KEY `idx_startedAt` (`startedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全扫描日志表';

-- 插入初始安全配置数据
INSERT INTO `security_configs` (`configKey`, `configValue`, `description`, `category`) VALUES
('passwordPolicy', '{"minLength": 8, "requireUppercase": true, "requireLowercase": true, "requireNumbers": true, "requireSpecialChars": true, "maxAge": 90}', '密码策略配置', 'password'),
('sessionTimeout', '3600', '会话超时时间（秒）', 'session'),
('maxLoginAttempts', '5', '最大登录尝试次数', 'auth'),
('enableMFA', 'false', '是否启用多因素认证', 'auth'),
('ipWhitelist', '[]', 'IP白名单', 'network'),
('enableAuditLog', 'true', '是否启用审计日志', 'audit'),
('scanSchedule', '{"enabled": true, "frequency": "daily", "time": "02:00"}', '自动扫描计划', 'scan');

-- 插入示例威胁数据
INSERT INTO `security_threats` (`threatType`, `severity`, `sourceIp`, `targetResource`, `description`, `detectionMethod`, `riskScore`) VALUES
('SQL注入尝试', 'high', '192.168.1.100', '/api/users', '检测到可疑的SQL注入攻击尝试', 'WAF规则', 85),
('暴力破解', 'medium', '10.0.0.50', '/login', '检测到针对登录接口的暴力破解攻击', '登录监控', 65),
('XSS攻击', 'medium', '172.16.0.25', '/dashboard', '检测到跨站脚本攻击尝试', '内容过滤', 60),
('异常访问', 'low', '203.0.113.10', '/admin', '检测到来自异常地理位置的访问', '地理位置检测', 30);

-- 插入示例漏洞数据
INSERT INTO `security_vulnerabilities` (`title`, `description`, `severity`, `category`, `affectedComponent`, `discoveryMethod`, `cvssScore`, `solution`) VALUES
('用户输入验证不足', '用户输入未进行充分的验证和过滤，可能导致注入攻击', 'high', '输入验证', '用户管理模块', '代码审计', 7.5, '加强输入验证和参数化查询'),
('会话管理缺陷', '会话令牌生成算法可预测，存在会话劫持风险', 'medium', '会话管理', '认证模块', '安全测试', 6.1, '使用安全的随机数生成器'),
('权限控制不当', '某些API接口缺少适当的权限检查', 'high', '访问控制', 'API网关', '渗透测试', 8.2, '实施严格的权限验证机制'),
('敏感信息泄露', '错误页面可能泄露系统敏感信息', 'low', '信息泄露', '错误处理', '自动扫描', 3.7, '自定义错误页面，避免信息泄露');
