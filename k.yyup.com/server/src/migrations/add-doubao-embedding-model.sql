-- 添加豆包向量模型配置
-- 执行时间: 2025-07-17

-- 插入豆包向量模型配置
INSERT INTO ai_model_config (
  name,
  display_name,
  provider,
  model_type,
  api_version,
  endpoint_url,
  api_key,
  model_parameters,
  is_default,
  status,
  description,
  capabilities,
  max_tokens,
  creator_id,
  created_at,
  updated_at
) VALUES (
  'Doubao-embedding',
  '豆包向量模型',
  'ByteDance',
  'embedding',
  'v1',
  'https://aiproxy.hzh.sealos.run/v1/embeddings',
  'sk-0VDz3ocCPlPMP37bEs7O29MvLRu61RPAj3r4nryb6QgIVW54',
  JSON_OBJECT(
    'dimensions', 1024,
    'max_input_tokens', 8192,
    'encoding_format', 'float'
  ),
  true,
  'active',
  '豆包向量嵌入模型，用于生成文本的向量表示，支持语义相似度搜索',
  JSON_ARRAY('text_embedding', 'semantic_search', 'similarity_matching'),
  8192,
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  endpoint_url = VALUES(endpoint_url),
  api_key = VALUES(api_key),
  model_parameters = VALUES(model_parameters),
  status = VALUES(status),
  description = VALUES(description),
  capabilities = VALUES(capabilities),
  updated_at = NOW();

-- 验证插入结果
SELECT 
  id,
  name,
  display_name,
  provider,
  model_type,
  endpoint_url,
  status,
  is_default
FROM ai_model_config 
WHERE name = 'Doubao-embedding';
