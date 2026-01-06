import { sequelize } from '../init';

async function createScriptTables() {
  try {
    console.log('开始创建话术相关表...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 创建话术分类表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`script_categories\` (
        \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '分类ID',
        \`name\` varchar(100) NOT NULL COMMENT '分类名称',
        \`description\` varchar(255) DEFAULT NULL COMMENT '分类描述',
        \`type\` enum('enrollment','phone','reception','followup','consultation','objection') NOT NULL COMMENT '话术类型',
        \`color\` varchar(20) DEFAULT NULL COMMENT '分类颜色',
        \`icon\` varchar(50) DEFAULT NULL COMMENT '分类图标',
        \`sort\` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
        \`status\` enum('active','inactive','draft') NOT NULL DEFAULT 'active' COMMENT '状态',
        \`creator_id\` int(10) unsigned DEFAULT NULL COMMENT '创建者ID',
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`script_categories_type_idx\` (\`type\`),
        KEY \`script_categories_status_idx\` (\`status\`),
        KEY \`script_categories_sort_idx\` (\`sort\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话术分类表'
    `);
    console.log('✅ script_categories 表创建成功');

    // 创建话术表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`scripts\` (
        \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '话术ID',
        \`title\` varchar(200) NOT NULL COMMENT '话术标题',
        \`content\` text NOT NULL COMMENT '话术内容',
        \`category_id\` int(10) unsigned NOT NULL COMMENT '分类ID',
        \`type\` enum('enrollment','phone','reception','followup','consultation','objection') NOT NULL COMMENT '话术类型',
        \`tags\` json DEFAULT NULL COMMENT '标签',
        \`keywords\` json DEFAULT NULL COMMENT '关键词',
        \`description\` varchar(500) DEFAULT NULL COMMENT '话术描述',
        \`usage_count\` int(11) NOT NULL DEFAULT '0' COMMENT '使用次数',
        \`effective_score\` decimal(3,2) DEFAULT NULL COMMENT '效果评分',
        \`status\` enum('active','inactive','draft') NOT NULL DEFAULT 'active' COMMENT '状态',
        \`is_template\` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为模板',
        \`variables\` json DEFAULT NULL COMMENT '变量配置',
        \`creator_id\` int(10) unsigned DEFAULT NULL COMMENT '创建者ID',
        \`updater_id\` int(10) unsigned DEFAULT NULL COMMENT '更新者ID',
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`scripts_category_id_idx\` (\`category_id\`),
        KEY \`scripts_type_idx\` (\`type\`),
        KEY \`scripts_status_idx\` (\`status\`),
        KEY \`scripts_usage_count_idx\` (\`usage_count\`),
        KEY \`scripts_effective_score_idx\` (\`effective_score\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话术模板表'
    `);
    console.log('✅ scripts 表创建成功');

    // 创建话术使用记录表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`script_usages\` (
        \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '使用记录ID',
        \`script_id\` int(10) unsigned NOT NULL COMMENT '话术ID',
        \`user_id\` int(10) unsigned NOT NULL COMMENT '用户ID',
        \`usage_context\` varchar(200) DEFAULT NULL COMMENT '使用场景',
        \`effective_rating\` int(11) DEFAULT NULL COMMENT '效果评分 1-5',
        \`feedback\` text DEFAULT NULL COMMENT '使用反馈',
        \`usage_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`script_usages_script_id_idx\` (\`script_id\`),
        KEY \`script_usages_user_id_idx\` (\`user_id\`),
        KEY \`script_usages_usage_date_idx\` (\`usage_date\`),
        KEY \`script_usages_effective_rating_idx\` (\`effective_rating\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话术使用记录表'
    `);
    console.log('✅ script_usages 表创建成功');

    // 添加外键约束（如果不存在）
    try {
      await sequelize.query(`
        ALTER TABLE \`scripts\` 
        ADD CONSTRAINT \`fk_scripts_category_id\` 
        FOREIGN KEY (\`category_id\`) REFERENCES \`script_categories\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ scripts 外键约束添加成功');
    } catch (error: any) {
      if (error.original?.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ scripts 外键约束已存在，跳过');
      } else {
        console.log('⚠️ scripts 外键约束添加失败:', error.message);
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE \`script_usages\` 
        ADD CONSTRAINT \`fk_script_usages_script_id\` 
        FOREIGN KEY (\`script_id\`) REFERENCES \`scripts\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ script_usages script_id 外键约束添加成功');
    } catch (error: any) {
      if (error.original?.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ script_usages script_id 外键约束已存在，跳过');
      } else {
        console.log('⚠️ script_usages script_id 外键约束添加失败:', error.message);
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE \`script_usages\` 
        ADD CONSTRAINT \`fk_script_usages_user_id\` 
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ script_usages user_id 外键约束添加成功');
    } catch (error: any) {
      if (error.original?.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ script_usages user_id 外键约束已存在，跳过');
      } else {
        console.log('⚠️ script_usages user_id 外键约束添加失败:', error.message);
      }
    }

    // 插入示例数据
    await sequelize.query(`
      INSERT IGNORE INTO \`script_categories\` (\`id\`, \`name\`, \`description\`, \`type\`, \`color\`, \`icon\`, \`sort\`) VALUES
      (1, '招生话术', '用于招生咨询的话术模板', 'enrollment', '#1890ff', 'user-add', 1),
      (2, '电话沟通', '电话咨询和回访话术', 'phone', '#52c41a', 'phone', 2),
      (3, '前台接待', '前台接待和咨询话术', 'reception', '#fa8c16', 'customer-service', 3),
      (4, '跟进回访', '客户跟进和回访话术', 'followup', '#722ed1', 'clock-circle', 4),
      (5, '咨询解答', '常见问题咨询解答', 'consultation', '#eb2f96', 'question-circle', 5),
      (6, '异议处理', '处理客户异议的话术', 'objection', '#f5222d', 'exclamation-circle', 6)
    `);
    console.log('✅ 示例分类数据插入成功');

    await sequelize.query(`
      INSERT IGNORE INTO \`scripts\` (\`id\`, \`title\`, \`content\`, \`category_id\`, \`type\`, \`tags\`, \`keywords\`, \`description\`, \`usage_count\`, \`effective_score\`) VALUES
      (1, '欢迎咨询话术', '您好，欢迎咨询我们幼儿园！我是招生老师，很高兴为您介绍我们的教育理念和课程特色。请问您的孩子多大了？', 1, 'enrollment', '["欢迎", "咨询", "介绍"]', '["欢迎", "咨询", "招生", "教育理念"]', '用于初次咨询时的欢迎话术', 15, 4.5),
      (2, '电话回访话术', '您好，我是XX幼儿园的老师，上次您来园参观后，想了解一下您对我们幼儿园还有什么疑问吗？', 2, 'phone', '["回访", "参观", "疑问"]', '["回访", "参观", "疑问", "电话"]', '用于电话回访的话术模板', 8, 4.2),
      (3, '前台接待话术', '您好，欢迎来到XX幼儿园！请问您是来咨询入园事宜的吗？我来为您详细介绍一下。', 3, 'reception', '["接待", "入园", "介绍"]', '["接待", "入园", "咨询", "前台"]', '前台接待客户的标准话术', 12, 4.3)
    `);
    console.log('✅ 示例话术数据插入成功');

    console.log('🎉 所有话术相关表创建完成！');
    
  } catch (error) {
    console.error('❌ 创建表时发生错误:', error);
  } finally {
    await sequelize.close();
  }
}

createScriptTables();
