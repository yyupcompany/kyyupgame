-- 添加缺失的字段到 creative_curriculums 表

-- 添加 media 字段
ALTER TABLE creative_curriculums ADD COLUMN media JSON NULL COMMENT '媒体数据（图片和视频）';

-- 添加 metadata 字段
ALTER TABLE creative_curriculums ADD COLUMN metadata JSON NULL COMMENT '元数据';

-- 添加 curriculum_type 字段
ALTER TABLE creative_curriculums ADD COLUMN curriculum_type VARCHAR(50) DEFAULT 'standard' COMMENT '课程类型';

