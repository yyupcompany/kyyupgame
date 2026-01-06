/**
 * 添加缺失的页面说明文档：/notifications 和 /centers/supervision
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
    page_path: '/notifications',
    page_name: '通知中心',
    page_description: '通知中心是系统消息和通知的集中管理平台，用户可以查看所有系统通知、待办事项、审批提醒等重要信息。支持消息分类、已读未读管理、消息搜索等功能，确保用户不会错过任何重要信息。',
    category: '功能页面',
    importance: 8,
    related_tables: JSON.stringify(['notifications', 'todos', 'schedules']),
    context_prompt: '用户正在通知中心页面，这里显示所有系统通知和待办事项。用户可能需要查看未读通知、处理待办事项或管理提醒。请提供通知管理相关的帮助，包括如何标记已读、如何处理待办事项、如何设置提醒等。',
    sections: [
      {
        section_name: '系统通知',
        section_description: '查看和管理系统发送的各类通知消息，包括审批提醒、活动通知、系统公告等。支持按类型筛选、标记已读、批量操作等功能。',
        section_path: '/notifications?tab=system',
        features: JSON.stringify(['通知列表', '已读/未读标记', '通知分类', '消息搜索', '批量操作', '通知详情'])
      },
      {
        section_name: '待办事项',
        section_description: '管理个人待办事项，包括任务提醒、审批待办、日程安排等。支持任务状态管理、优先级设置、截止日期提醒等功能。',
        section_path: '/notifications?tab=todos',
        features: JSON.stringify(['待办列表', '任务状态', '优先级管理', '截止日期', '完成标记', '任务分类'])
      },
      {
        section_name: '日程安排',
        section_description: '查看和管理个人日程安排，包括会议、活动、重要事项等。支持日历视图、事件提醒、时间冲突检测等功能。',
        section_path: '/notifications?tab=schedules',
        features: JSON.stringify(['日程日历', '事件提醒', '日程分类', '时间冲突检测', '日程导出', '重复事件'])
      }
    ]
  },
  {
    page_path: '/centers/supervision',
    page_name: '督查中心',
    page_description: '督查中心是幼儿园质量管理和监督检查的核心平台，提供检查计划、检查任务、问题跟踪、整改管理等功能，确保幼儿园各项工作符合标准和规范。支持多种检查类型、问题分类、整改流程管理等专业功能。',
    category: '中心页面',
    importance: 8,
    related_tables: JSON.stringify(['inspection_plans', 'inspection_tasks', 'inspection_types', 'document_templates']),
    context_prompt: '用户正在督查中心页面，这是质量管理和监督检查的核心平台。用户可能需要制定检查计划、执行检查任务、跟踪问题整改等。请提供督查管理相关的专业指导，包括如何制定检查计划、如何记录检查结果、如何跟踪整改进度等。',
    sections: [
      {
        section_name: '检查计划',
        section_description: '制定和管理各类检查计划，包括日常检查、专项检查、定期巡查等。支持计划模板、计划审批、计划执行监控等功能。',
        section_path: '/centers/supervision?tab=plans',
        features: JSON.stringify(['计划制定', '计划审批', '计划执行', '计划统计', '计划模板', '计划提醒'])
      },
      {
        section_name: '检查任务',
        section_description: '管理具体的检查任务，包括任务分配、任务执行、结果记录等。支持检查清单、现场拍照、问题上报等功能。',
        section_path: '/centers/supervision?tab=tasks',
        features: JSON.stringify(['任务列表', '任务分配', '任务执行', '结果记录', '问题上报', '检查清单'])
      },
      {
        section_name: '问题跟踪',
        section_description: '跟踪检查中发现的问题，管理整改措施和整改进度。支持问题分类、责任人分配、整改期限、复查验收等功能。',
        section_path: '/centers/supervision?tab=issues',
        features: JSON.stringify(['问题列表', '整改措施', '整改进度', '复查验收', '问题统计', '责任追溯'])
      },
      {
        section_name: '数据分析',
        section_description: '督查数据的统计分析，包括检查覆盖率、问题分布、整改率等。提供数据可视化、趋势分析、质量评估等功能。',
        section_path: '/centers/supervision?tab=analytics',
        features: JSON.stringify(['检查统计', '问题分析', '整改率', '趋势分析', '质量评估', '报表导出'])
      }
    ]
  }
];

async function addPageGuides() {
  let connection;
  
  try {
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 开始事务
    await connection.beginTransaction();

    let addedCount = 0;
    let skippedCount = 0;

    for (const pageGuide of pageGuidesToAdd) {
      // 检查页面说明文档是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM page_guides WHERE page_path = ?',
        [pageGuide.page_path]
      );

      if (existing.length > 0) {
        console.log(`⏭️  跳过已存在的页面: ${pageGuide.page_name} (${pageGuide.page_path})`);
        skippedCount++;
        continue;
      }

      // 插入页面说明文档
      const [result] = await connection.execute(
        `INSERT INTO page_guides 
        (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          pageGuide.page_path,
          pageGuide.page_name,
          pageGuide.page_description,
          pageGuide.category,
          pageGuide.importance,
          pageGuide.related_tables,
          pageGuide.context_prompt
        ]
      );

      const pageGuideId = result.insertId;
      console.log(`✅ 添加页面说明文档: ${pageGuide.page_name} (ID: ${pageGuideId})`);

      // 插入功能板块
      if (pageGuide.sections && pageGuide.sections.length > 0) {
        for (let i = 0; i < pageGuide.sections.length; i++) {
          const section = pageGuide.sections[i];
          await connection.execute(
            `INSERT INTO page_guide_sections 
            (page_guide_id, section_name, section_description, section_path, features, sort_order, is_active, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
            [
              pageGuideId,
              section.section_name,
              section.section_description,
              section.section_path,
              section.features,
              i + 1
            ]
          );
          console.log(`   ├─ 添加功能板块: ${section.section_name}`);
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

    if (addedCount > 0) {
      console.log('🎉 成功添加以下页面说明文档:');
      pageGuidesToAdd.forEach(guide => {
        console.log(`   ✅ ${guide.page_name} (${guide.page_path})`);
      });
      console.log('');
    }

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
addPageGuides();

