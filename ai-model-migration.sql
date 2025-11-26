
-- AI模型配置迁移SQL脚本
-- 从现有ai_model_config表迁移到ai_model_config_unified表

-- 创建统一租户中心AI模型配置表
CREATE TABLE IF NOT EXISTS ai_model_config_unified (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    displayName VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    modelType ENUM('text', 'speech', 'image', 'video', 'multimodal', 'embedding', 'search') NOT NULL,
    apiVersion VARCHAR(20) DEFAULT 'v1',
    endpointUrl VARCHAR(255) NOT NULL,
    apiKey VARCHAR(255) DEFAULT 'default-key',
    modelParameters JSON,
    isDefault BOOLEAN DEFAULT false,
    status ENUM('active', 'inactive', 'testing') DEFAULT 'inactive',
    description TEXT,
    capabilities JSON,
    maxTokens INT,
    migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name_provider (name, provider),
    INDEX idx_model_type (modelType),
    INDEX idx_status (status),
    INDEX idx_source_id (source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 迁移数据
INSERT INTO ai_model_config_unified (
    source_id, name, displayName, provider, modelType, apiVersion,
    endpointUrl, modelParameters, isDefault, status,
    description, capabilities, maxTokens, createdAt, updatedAt
) VALUES
(1, 'doubao-pro-128k', '豆包Pro-128K', 'ByteDance', 'text', 'v3', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', '{"maxTokens":128000,"temperature":0.7,"topP":0.9,"contextWindow":128000}', false, 'active', '字节跳动豆包Pro大语言模型，支持128K上下文', '["chat","completion","analysis"]', 128000, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(2, 'doubao-pro-32k', '豆包Pro-32K', 'ByteDance', 'text', 'v3', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', '{"maxTokens":32000,"temperature":0.7,"topP":0.9,"contextWindow":32000}', false, 'active', '字节跳动豆包Pro大语言模型，支持32K上下文', '["chat","completion","analysis"]', 32000, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(3, 'doubao-tts-1', '豆包TTS语音合成', 'ByteDance', 'speech', 'v1', 'https://ark.cn-beijing.volces.com/api/v1/tts', '{"voice":"zh-CN-female-1","speed":1}', false, 'active', '豆包语音合成服务，支持多种音色', '["text-to-speech","voice-synthesis"]', NULL, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(4, 'doubao-flash-1.6', '豆包Flash 1.6', 'ByteDance', 'text', 'v3', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', '{"maxTokens":8000,"temperature":0.7,"topP":0.9}', false, 'active', '豆包Flash 1.6 高速推理模型', '["chat","completion","fast-response"]', 8000, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(5, 'doubao-image-gen', '豆包文生图', 'ByteDance', 'image', 'v1', 'https://ark.cn-beijing.volces.com/api/v1/images/generations', '{"size":"1024x1024","quality":"standard"}', false, 'active', '豆包图像生成模型，支持文生图功能', '["text-to-image","image-generation"]', NULL, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(6, 'doubao-think', '豆包Think推理模型', 'ByteDance', 'text', 'v3', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', '{"maxTokens":64000,"temperature":0.7,"topP":0.9}', false, 'active', '豆包Think专业推理模型', '["chat","completion","reasoning","analysis"]', 64000, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(7, 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'OpenAI', 'text', 'v1', 'https://api.openai.com/v1/chat/completions', '{"maxTokens":4096,"temperature":0.7,"topP":0.9}', false, 'inactive', 'OpenAI GPT-3.5 Turbo大语言模型', '["chat","completion","analysis"]', 4096, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(8, 'gpt-4', 'GPT-4', 'OpenAI', 'text', 'v1', 'https://api.openai.com/v1/chat/completions', '{"maxTokens":8192,"temperature":0.7,"topP":0.9}', false, 'inactive', 'OpenAI GPT-4大语言模型', '["chat","completion","analysis"]', 8192, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(9, 'claude-3-sonnet', 'Claude 3 Sonnet', 'Anthropic', 'text', '2023-06-01', 'https://api.anthropic.com/v1/messages', '{"maxTokens":4096,"temperature":0.7,"topP":0.9}', false, 'inactive', 'Anthropic Claude 3 Sonnet模型', '["chat","completion","analysis"]', 4096, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(10, 'text-embedding-ada-002', 'Text Embedding Ada 002', 'OpenAI', 'embedding', '1', 'https://api.openai.com/v1/embeddings', '{"maxTokens":8191}', false, 'inactive', 'OpenAI文本嵌入模型', '["text-embedding","semantic-search"]', 8191, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z'),
(11, 'volcano-fusion-search', '火山融合搜索', 'ByteDance', 'search', 'v1', 'https://open.volcengineapi.com', '{}', false, 'active', '火山引擎融合搜索服务', '["web-search","information-retrieval"]', NULL, '2025-11-25T23:52:12.164Z', '2025-11-25T23:52:12.164Z')
;

-- 验证迁移结果
SELECT
    source_id, name, displayName, provider, modelType, status
FROM ai_model_config_unified
ORDER BY id;
