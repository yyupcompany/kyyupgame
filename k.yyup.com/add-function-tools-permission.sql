-- 添加Function Tools页面权限
INSERT INTO permissions (
    name,
    code,
    path,
    component,
    type,
    status,
    sort,
    icon,
    description,
    parent_id,
    created_at,
    updated_at
) VALUES (
    'Function Tools',
    'AI_FUNCTION_TOOLS',
    '/ai-center/function-tools',
    'pages/ai-center/function-tools.vue',
    'menu',
    1,
    100,
    'Tools',
    '智能工具调用系统，支持数据查询、页面导航等多种功能',
    3006,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    updated_at = NOW(),
    status = 1;

-- 查询刚插入的记录
SELECT * FROM permissions WHERE code = 'AI_FUNCTION_TOOLS';
