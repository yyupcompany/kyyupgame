/**
 * 添加缺失的页面说明文档
 *
 * 这个脚本会检查常用页面，并为缺少说明文档的页面添加文档
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yyup2024',
  database: process.env.DB_NAME || 'kargerdensales',
  charset: 'utf8mb4'
};

// 需要添加的页面说明文档
const pageGuidesToAdd = [
  {
    pagePath: '/notifications',
    pageName: '通知中心',
    pageDescription: '通知中心是系统消息和通知的集中管理平台，用户可以查看所有系统通知、待办事项、审批提醒等重要信息。支持消息分类、已读未读管理、消息搜索等功能。',
    category: '功能页面',
    importance: 7,
    relatedTables: JSON.stringify(['notifications', 'todos', 'schedules']),
    contextPrompt: '用户正在通知中心页面，这里显示所有系统通知和待办事项。用户可能需要查看未读通知、处理待办事项或管理提醒。请提供通知管理相关的帮助。',
    sections: [
      {
        sectionName: '系统通知',
        sectionDescription: '查看和管理系统发送的各类通知消息，包括审批提醒、活动通知、系统公告等',
        sectionPath: '/notifications?tab=system',
        features: JSON.stringify(['通知列表', '已读/未读标记', '通知分类', '消息搜索', '批量操作'])
      },
      {
        sectionName: '待办事项',
        sectionDescription: '管理个人待办事项，包括任务提醒、审批待办、日程安排等',
        sectionPath: '/notifications?tab=todos',
        features: JSON.stringify(['待办列表', '任务状态', '优先级管理', '截止日期', '完成标记'])
      },
      {
        sectionName: '日程安排',
        sectionDescription: '查看和管理个人日程安排，包括会议、活动、重要事项等',
        sectionPath: '/notifications?tab=schedules',
        features: JSON.stringify(['日程日历', '事件提醒', '日程分类', '时间冲突检测', '日程导出'])
      }
    ]
  },
  {
    pagePath: '/centers/customer-pool',
    pageName: '客户池中心',
    pageDescription: '客户池中心是客户资源管理的核心平台，整合了客户信息管理、客户分配、跟进记录、数据分析等功能，为招生和营销工作提供强大的客户管理支持。',
    category: '中心页面',
    importance: 9,
    relatedTables: JSON.stringify(['customers', 'customer_followups', 'customer_applications', 'customer_pool_analytics']),
    contextPrompt: '用户正在客户池中心页面，这是客户资源管理的核心平台。用户可能需要查看客户信息、管理客户分配、分析客户数据等。请提供客户管理相关的专业建议。',
    sections: [
      {
        sectionName: '客户概览',
        sectionDescription: '客户资源的整体数据概览，包括客户总数、客户来源、转化率等关键指标',
        sectionPath: '/centers/customer-pool?tab=overview',
        features: JSON.stringify(['客户统计', '来源分析', '转化漏斗', '客户分布', '趋势图表'])
      },
      {
        sectionName: '客户管理',
        sectionDescription: '客户信息的详细管理，包括客户列表、客户详情、客户分配等功能',
        sectionPath: '/centers/customer-pool?tab=management',
        features: JSON.stringify(['客户列表', '客户搜索', '客户分配', '批量操作', '客户导入导出'])
      },
      {
        sectionName: '跟进记录',
        sectionDescription: '客户跟进记录管理，记录每次与客户的沟通情况和跟进进度',
        sectionPath: '/centers/customer-pool?tab=followup',
        features: JSON.stringify(['跟进列表', '跟进详情', '跟进提醒', '跟进统计', '跟进模板'])
      },
      {
        sectionName: '数据分析',
        sectionDescription: '客户数据的深度分析，包括客户画像、转化分析、ROI分析等',
        sectionPath: '/centers/customer-pool?tab=analytics',
        features: JSON.stringify(['客户画像', '转化分析', 'ROI分析', '渠道效果', '预测模型'])
      }
    ]
  },
  {
    pagePath: '/centers/supervision',
    pageName: '督查中心',
    pageDescription: '督查中心是幼儿园质量管理和监督检查的核心平台，提供检查计划、检查任务、问题跟踪、整改管理等功能，确保幼儿园各项工作符合标准和规范。',
    category: '中心页面',
    importance: 8,
    relatedTables: JSON.stringify(['inspection_plans', 'inspection_tasks', 'inspection_types', 'document_templates']),
    contextPrompt: '用户正在督查中心页面，这是质量管理和监督检查的核心平台。用户可能需要制定检查计划、执行检查任务、跟踪问题整改等。请提供督查管理相关的专业指导。',
    sections: [
      {
        sectionName: '检查计划',
        sectionDescription: '制定和管理各类检查计划，包括日常检查、专项检查、定期巡查等',
        sectionPath: '/centers/supervision?tab=plans',
        features: JSON.stringify(['计划制定', '计划审批', '计划执行', '计划统计', '计划模板'])
      },
      {
        sectionName: '检查任务',
        sectionDescription: '管理具体的检查任务，包括任务分配、任务执行、结果记录等',
        sectionPath: '/centers/supervision?tab=tasks',
        features: JSON.stringify(['任务列表', '任务分配', '任务执行', '结果记录', '问题上报'])
      },
      {
        sectionName: '问题跟踪',
        sectionDescription: '跟踪检查中发现的问题，管理整改措施和整改进度',
        sectionPath: '/centers/supervision?tab=issues',
        features: JSON.stringify(['问题列表', '整改措施', '整改进度', '复查验收', '问题统计'])
      },
      {
        sectionName: '数据分析',
        sectionDescription: '督查数据的统计分析，包括检查覆盖率、问题分布、整改率等',
        sectionPath: '/centers/supervision?tab=analytics',
        features: JSON.stringify(['检查统计', '问题分析', '整改率', '趋势分析', '质量评估'])
      }
    ]
  },
  {
    pagePath: '/dashboard',
    pageName: '工作台',
    pageDescription: '工作台是系统的首页和数据总览页面，展示用户最关心的核心数据和快捷操作入口，包括待办事项、数据统计、快捷功能等，帮助用户快速了解工作状态。',
    category: '功能页面',
    importance: 10,
    relatedTables: JSON.stringify(['dashboard_stats', 'todos', 'notifications', 'schedules']),
    contextPrompt: '用户正在工作台页面，这是系统的首页和数据总览。用户可能需要查看整体数据、处理待办事项或快速访问常用功能。请提供工作台相关的帮助。',
    sections: [
      {
        sectionName: '数据概览',
        sectionDescription: '展示幼儿园核心业务数据的整体概览，包括学生数、教师数、活动数等关键指标',
        sectionPath: '/dashboard?section=overview',
        features: JSON.stringify(['核心指标', '数据卡片', '趋势图表', '对比分析', '数据刷新'])
      },
      {
        sectionName: '待办事项',
        sectionDescription: '显示当前用户的待办事项和任务提醒，帮助用户及时处理重要工作',
        sectionPath: '/dashboard?section=todos',
        features: JSON.stringify(['待办列表', '任务提醒', '快速处理', '任务分类', '优先级排序'])
      },
      {
        sectionName: '快捷功能',
        sectionDescription: '提供常用功能的快捷入口，方便用户快速访问常用页面和操作',
        sectionPath: '/dashboard?section=shortcuts',
        features: JSON.stringify(['功能入口', '自定义快捷方式', '最近访问', '收藏功能', '搜索功能'])
      }
    ]
  }
];

async function addMissingPageGuides() {
  let connection;

  try {
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 检查表是否存在，如果不存在则创建
    console.log('🔍 检查表是否存在...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'page_guides'"
    );

    if (tables.length === 0) {
      console.log('📝 表不存在，开始创建表...');

      // 创建 page_guides 表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS \`page_guides\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`pagePath\` varchar(255) NOT NULL COMMENT '页面路径，如 /centers/activity',
          \`pageName\` varchar(100) NOT NULL COMMENT '页面名称，如 活动中心',
          \`pageDescription\` text NOT NULL COMMENT '页面详细描述',
          \`category\` varchar(50) NOT NULL COMMENT '页面分类，如 中心页面、管理页面等',
          \`importance\` int(11) NOT NULL DEFAULT 5 COMMENT '页面重要性，1-10，影响AI介绍的详细程度',
          \`relatedTables\` json NOT NULL COMMENT '页面相关的数据库表名列表',
          \`contextPrompt\` text DEFAULT NULL COMMENT '发送给AI的上下文提示词',
          \`isActive\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
          \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`pagePath\` (\`pagePath\`),
          KEY \`category\` (\`category\`),
          KEY \`isActive\` (\`isActive\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面说明文档表'
      `);
      console.log('✅ page_guides 表创建成功');

      // 创建 page_guide_sections 表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS \`page_guide_sections\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`pageGuideId\` int(11) NOT NULL COMMENT '关联的页面说明文档ID',
          \`sectionName\` varchar(100) NOT NULL COMMENT '功能板块名称',
          \`sectionDescription\` text NOT NULL COMMENT '功能板块描述',
          \`sectionPath\` varchar(255) DEFAULT NULL COMMENT '功能板块对应的路径（如果有）',
          \`features\` json NOT NULL COMMENT '功能特性列表',
          \`sortOrder\` int(11) NOT NULL DEFAULT 0 COMMENT '排序顺序',
          \`isActive\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
          \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`pageGuideId\` (\`pageGuideId\`),
          KEY \`sortOrder\` (\`sortOrder\`),
          KEY \`isActive\` (\`isActive\`),
          CONSTRAINT \`page_guide_sections_ibfk_1\` FOREIGN KEY (\`pageGuideId\`) REFERENCES \`page_guides\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面功能板块表'
      `);
      console.log('✅ page_guide_sections 表创建成功\n');
    } else {
      console.log('✅ 表已存在\n');
    }

    // 开始事务
    await connection.beginTransaction();

    let addedCount = 0;
    let skippedCount = 0;

    for (const pageGuide of pageGuidesToAdd) {
      // 检查页面说明文档是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM page_guides WHERE pagePath = ?',
        [pageGuide.pagePath]
      );

      if (existing.length > 0) {
        console.log(`⏭️  跳过已存在的页面: ${pageGuide.pageName} (${pageGuide.pagePath})`);
        skippedCount++;
        continue;
      }

      // 插入页面说明文档
      const [result] = await connection.execute(
        `INSERT INTO page_guides 
        (pagePath, pageName, pageDescription, category, importance, relatedTables, contextPrompt, isActive, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          pageGuide.pagePath,
          pageGuide.pageName,
          pageGuide.pageDescription,
          pageGuide.category,
          pageGuide.importance,
          pageGuide.relatedTables,
          pageGuide.contextPrompt
        ]
      );

      const pageGuideId = result.insertId;
      console.log(`✅ 添加页面说明文档: ${pageGuide.pageName} (ID: ${pageGuideId})`);

      // 插入功能板块
      if (pageGuide.sections && pageGuide.sections.length > 0) {
        for (let i = 0; i < pageGuide.sections.length; i++) {
          const section = pageGuide.sections[i];
          await connection.execute(
            `INSERT INTO page_guide_sections 
            (pageGuideId, sectionName, sectionDescription, sectionPath, features, sortOrder, isActive, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
            [
              pageGuideId,
              section.sectionName,
              section.sectionDescription,
              section.sectionPath,
              section.features,
              i + 1
            ]
          );
          console.log(`   ├─ 添加功能板块: ${section.sectionName}`);
        }
      }

      addedCount++;
      console.log('');
    }

    // 提交事务
    await connection.commit();

    console.log('================================================================================');
    console.log('📊 页面说明文档添加完成');
    console.log('================================================================================');
    console.log(`✅ 新增页面: ${addedCount} 个`);
    console.log(`⏭️  跳过页面: ${skippedCount} 个`);
    console.log(`📄 总计处理: ${addedCount + skippedCount} 个页面`);
    console.log('================================================================================\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (connection) {
      await connection.rollback();
      console.log('🔄 事务已回滚');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
addMissingPageGuides();

