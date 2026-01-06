-- 添加优化的豆包模型配置
-- 用于AI查询系统的成本优化

-- 1. 添加lite-32k模型用于意图分析（最经济）
INSERT INTO ai_model_config (
  modelName, 
  displayName, 
  provider, 
  version,
  capabilities, 
  contextWindow, 
  maxTokens, 
  isActive, 
  isDefault,
  apiEndpoint,
  apiKey,
  description
) VALUES 
(
  'Doubao-lite-32k',
  '豆包Lite 32K（经济版）', 
  'ByteDance', 
  'v1',
  '["text"]', 
  32768, 
  4096, 
  1, 
  0,
  'https://aiproxy.hzh.sealos.run/v1/chat/completions',
  'sk-OMDg69YDtWF30kEiDdsmXccPBoFbDAeAj5nF4IJxZjEIH2cR',
  '最经济的文本模型，适用于意图分析、简单问答等任务。输入0.0003/1k tokens，输出0.0006/1k tokens'
),

-- 2. 添加pro-32k模型用于SQL生成（平衡性能和成本）
(
  'Doubao-pro-32k',
  '豆包Pro 32K（平衡版）', 
  'ByteDance', 
  'v1',
  '["text"]', 
  32768, 
  4096, 
  1, 
  0,
  'https://aiproxy.hzh.sealos.run/v1/chat/completions',
  'sk-OMDg69YDtWF30kEiDdsmXccPBoFbDAeAj5nF4IJxZjEIH2cR',
  '平衡性能和成本的文本模型，适用于SQL生成、复杂查询等任务。输入0.0008/1k tokens，输出0.002/1k tokens'
),

-- 3. 添加最新版lite模型
(
  'doubao-lite-32k-240828',
  '豆包Lite 32K 2024版', 
  'ByteDance', 
  'v1',
  '["text"]', 
  32768, 
  4096, 
  1, 
  0,
  'https://aiproxy.hzh.sealos.run/v1/chat/completions',
  'sk-OMDg69YDtWF30kEiDdsmXccPBoFbDAeAj5nF4IJxZjEIH2cR',
  '2024年8月版本的经济模型，功能增强。输入0.0003/1k tokens，输出0.0006/1k tokens'
),

-- 4. 添加最新版pro模型
(
  'doubao-pro-32k-241215',
  '豆包Pro 32K 2024版', 
  'ByteDance', 
  'v1',
  '["text"]', 
  32768, 
  4096, 
  1, 
  0,
  'https://aiproxy.hzh.sealos.run/v1/chat/completions',
  'sk-OMDg69YDtWF30kEiDdsmXccPBoFbDAeAj5nF4IJxZjEIH2cR',
  '2024年12月版本的Pro模型，精度更高。输入0.0008/1k tokens，输出0.002/1k tokens'
);

-- 更新原有的128k模型为非默认（避免浪费）
UPDATE ai_model_config 
SET isDefault = 0, 
    description = '高端模型，大上下文，适用于复杂文档分析。成本较高，建议谨慎使用。输入0.005/1k tokens，输出0.009/1k tokens'
WHERE modelName = 'Doubao-pro-128k';

-- 设置lite-32k为默认模型（最经济）
UPDATE ai_model_config 
SET isDefault = 1 
WHERE modelName = 'Doubao-lite-32k' 
LIMIT 1;