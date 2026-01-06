-- 清除视频项目的错误状态
-- 查看有错误的项目
SELECT id, title, status, errorMessage 
FROM video_projects 
WHERE errorMessage IS NOT NULL;

-- 清除错误消息并重置状态
UPDATE video_projects 
SET errorMessage = NULL, 
    status = 'draft'
WHERE errorMessage IS NOT NULL;

-- 验证清除结果
SELECT id, title, status, errorMessage 
FROM video_projects 
WHERE id IN (SELECT id FROM video_projects WHERE errorMessage IS NOT NULL);

