-- 添加 total_tokens 字段到 ai_model_usage 表
ALTER TABLE ai_model_usage 
ADD COLUMN IF NOT EXISTS total_tokens INT DEFAULT 0 COMMENT '总token数（prompt_tokens + completion_tokens）';

-- 验证字段是否添加成功
DESCRIBE ai_model_usage;

