-- 为海报编辑器页面添加功能板块
-- 页面说明文档ID: 57 (从前面的脚本输出获得)

USE kargerdensales;

-- 插入海报编辑器功能板块
INSERT INTO page_guide_sections (
  page_guide_id,
  section_name,
  section_description,
  section_path,
  features,
  sort_order,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  57,
  '海报预览区',
  '实时预览生成的海报效果，支持查看、重新生成和重置操作',
  '/principal/poster-editor#preview',
  '["实时预览", "海报展示", "重新生成", "重置操作", "效果查看"]',
  1,
  1,
  NOW(),
  NOW()
),
(
  57,
  'AI设计助手',
  '智能对话界面，通过自然语言与AI交流，描述您的海报需求',
  '/principal/poster-editor#ai-chat',
  '["智能对话", "需求理解", "风格建议", "内容优化", "实时交互"]',
  2,
  1,
  NOW(),
  NOW()
),
(
  57,
  '快速操作',
  '预设的海报风格快捷按钮，一键生成常用风格的海报提示词',
  '/principal/poster-editor#quick-actions',
  '["温馨可爱", "色彩鲜艳", "简约清新", "添加装饰", "调整颜色", "修改排版"]',
  3,
  1,
  NOW(),
  NOW()
),
(
  57,
  '风格设置',
  '详细的海报风格配置选项，包括风格、镜头、色调、构图等设置',
  '/principal/poster-editor#style-settings',
  '["风格选择", "镜头设置", "色调配置", "构图布局", "参数调整"]',
  4,
  1,
  NOW(),
  NOW()
),
(
  57,
  '操作工具栏',
  '海报编辑的核心操作区域，包括保存、导出、返回等功能',
  '/principal/poster-editor#toolbar',
  '["保存海报", "导出功能", "返回导航", "操作历史", "快捷键支持"]',
  5,
  1,
  NOW(),
  NOW()
);

-- 验证插入结果
SELECT 
  pg.page_name,
  pgs.section_name,
  pgs.section_description,
  pgs.sort_order
FROM page_guides pg
JOIN page_guide_sections pgs ON pg.id = pgs.page_guide_id
WHERE pg.page_path = '/principal/poster-editor'
ORDER BY pgs.sort_order;
