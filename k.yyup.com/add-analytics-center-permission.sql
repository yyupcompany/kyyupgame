-- 添加分析中心权限
INSERT INTO permissions (name, chinese_name, code, type, path, component, permission, icon, sort, status, created_at, updated_at)
VALUES (
    'AnalyticsCenter',
    '分析中心',
    'ANALYTICS_CENTER',
    'page',
    '/centers/analytics',
    'pages/centers/AnalyticsCenter.vue',
    'ANALYTICS_CENTER_VIEW',
    'TrendCharts',
    800,
    1,
    NOW(),
    NOW()
);

-- 检查插入结果
SELECT * FROM permissions WHERE path = '/centers/analytics';
