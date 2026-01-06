-- 插入默认SIP配置
-- 服务器: 47.94.82.59:5060
-- 用户名: kanderadmin
-- 密码: Szblade3944

-- 检查表是否存在
SELECT 'Checking if sip_configs table exists...' AS status;

-- 删除已存在的默认配置（如果有）
DELETE FROM sip_configs WHERE username = 'kanderadmin';

-- 插入默认SIP配置
INSERT INTO sip_configs (
  user_id,
  server_host,
  server_port,
  username,
  password,
  protocol,
  is_active,
  register_interval,
  created_at,
  updated_at
) VALUES (
  1,                    -- 管理员用户ID
  '47.94.82.59',       -- SIP服务器地址
  5060,                -- SIP端口
  'kanderadmin',       -- 用户名
  'Szblade3944',       -- 密码
  'UDP',               -- 协议
  TRUE,                -- 启用
  3600,                -- 注册间隔(秒)
  NOW(),               -- 创建时间
  NOW()                -- 更新时间
);

-- 验证插入
SELECT 
  id,
  server_host,
  server_port,
  username,
  protocol,
  is_active,
  register_interval,
  created_at
FROM sip_configs
WHERE username = 'kanderadmin';

SELECT 'Default SIP configuration inserted successfully!' AS status;

