// 添加教学中心页面感知配置
// 执行时间：2025-09-25

const mysql = require('mysql2/promise');

async function addTeachingCenterPageGuide() {
  let connection;
  
  try {
    console.log('🚀 开始添加教学中心页面感知配置...');
    
    // 数据库连接配置
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pwk5ls7j',
      database: process.env.DB_NAME || 'kargerdensales',
      charset: 'utf8mb4'
    });

    console.log('✅ 数据库连接成功');

    // 检查是否已存在
    const [existing] = await connection.execute(
      'SELECT id FROM page_guides WHERE page_path = ?',
      ['/centers/teaching']
    );

    let pageGuideId;

    if (existing.length > 0) {
      console.log('📋 教学中心页面记录已存在，更新数据...');
      pageGuideId = existing[0].id;
      
      await connection.execute(`
        UPDATE page_guides SET 
          page_name = ?,
          page_description = ?,
          category = ?,
          importance = ?,
          related_tables = ?,
          context_prompt = ?,
          is_active = ?,
          updated_at = NOW()
        WHERE page_path = ?
      `, [
        '教学中心',
        '欢迎使用婴婴向上智能招生系统！您现在来到的是教学中心页面，这是幼儿园教学管理的核心平台。教学中心整合了脑科学课程计划、户外训练与展示、校外展示活动、全员锦标赛等四大教学模块，为您提供全方位的教学进度管理和质量监控。通过智能化的数据统计和可视化展示，帮助您全面掌握教学质量和学员发展情况，实现科学化的教学管理。',
        '中心页面',
        9,
        JSON.stringify([
          'courses', 'teaching_plans', 'course_progress', 'course_plans',
          'outdoor_training', 'outdoor_activities', 'training_records',
          'external_display', 'external_activities', 'outing_records',
          'championships', 'championship_records', 'achievement_records',
          'students', 'classes', 'teachers', 'class_progress'
        ]),
        '用户正在教学中心页面，这是教学管理的核心平台。用户可能需要查看课程进度、管理教学计划、分析教学质量、监控学员发展等。请根据用户的具体问题，结合教学相关的数据库信息提供专业的教学管理建议。',
        1,
        '/centers/teaching'
      ]);
    } else {
      console.log('📝 创建新的教学中心页面记录...');
      
      const [result] = await connection.execute(`
        INSERT INTO page_guides (
          page_path, page_name, page_description, category, importance,
          related_tables, context_prompt, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        '/centers/teaching',
        '教学中心',
        '欢迎使用婴婴向上智能招生系统！您现在来到的是教学中心页面，这是幼儿园教学管理的核心平台。教学中心整合了脑科学课程计划、户外训练与展示、校外展示活动、全员锦标赛等四大教学模块，为您提供全方位的教学进度管理和质量监控。通过智能化的数据统计和可视化展示，帮助您全面掌握教学质量和学员发展情况，实现科学化的教学管理。',
        '中心页面',
        9,
        JSON.stringify([
          'courses', 'teaching_plans', 'course_progress', 'course_plans',
          'outdoor_training', 'outdoor_activities', 'training_records',
          'external_display', 'external_activities', 'outing_records',
          'championships', 'championship_records', 'achievement_records',
          'students', 'classes', 'teachers', 'class_progress'
        ]),
        '用户正在教学中心页面，这是教学管理的核心平台。用户可能需要查看课程进度、管理教学计划、分析教学质量、监控学员发展等。请根据用户的具体问题，结合教学相关的数据库信息提供专业的教学管理建议。',
        1
      ]);
      
      pageGuideId = result.insertId;
    }

    console.log(`✅ 教学中心页面记录处理完成，ID: ${pageGuideId}`);

    // 删除现有的功能板块
    await connection.execute(
      'DELETE FROM page_guide_sections WHERE page_guide_id = ?',
      [pageGuideId]
    );

    console.log('🗑️ 已清理现有功能板块');

    // 添加功能板块
    const sections = [
      {
        section_name: '脑科学课程计划',
        section_description: '全员普及进度和结果达标率管理，支持班级和学员的详细进度跟踪。提供课程计划制定、进度监控、达标率统计等功能，帮助教师科学安排教学内容，确保每个学员都能达到预期的学习目标。',
        section_path: '/centers/teaching#course-plan',
        features: JSON.stringify([
          '全员普及进度统计',
          '结果达标率分析',
          '班级达标率排行',
          '学员个人进度跟踪',
          '课程计划制定',
          '教学质量评估'
        ]),
        sort_order: 1
      },
      {
        section_name: '户外训练与展示',
        section_description: '16周户外训练和离园展示进度管理，支持切换视图查看不同类型的活动。包括户外训练计划、离园展示安排、班级执行情况监控等，培养学员的实践能力和展示技能。',
        section_path: '/centers/teaching#outdoor-training',
        features: JSON.stringify([
          '16周训练计划管理',
          '户外训练进度跟踪',
          '离园展示安排',
          '班级执行情况监控',
          '训练效果评估',
          '活动媒体管理'
        ]),
        sort_order: 2
      },
      {
        section_name: '校外展示活动',
        section_description: '校外展示活动管理，包括本学期和累计外出统计、班级外出日志。组织学员参与各类校外展示活动，提升学员的社会实践能力和自信心，记录每次外出活动的详细情况。',
        section_path: '/centers/teaching#external-display',
        features: JSON.stringify([
          '校外活动策划',
          '外出统计管理',
          '班级外出日志',
          '活动效果评估',
          '安全管理记录',
          '家长反馈收集'
        ]),
        sort_order: 3
      },
      {
        section_name: '全员锦标赛管理',
        section_description: '每学期锦标赛管理，包括四项达标率统计和赛事记录。组织神童计划、课程内容、户外训练、外出活动等四个维度的综合性锦标赛，激发学员学习积极性，全面评估教学成果。',
        section_path: '/centers/teaching#championship',
        features: JSON.stringify([
          '锦标赛赛事管理',
          '四项达标率统计',
          '参赛学员管理',
          '成绩记录与分析',
          '奖项设置与颁发',
          '赛事媒体记录'
        ]),
        sort_order: 4
      }
    ];

    console.log('📝 开始添加功能板块...');

    for (const section of sections) {
      await connection.execute(`
        INSERT INTO page_guide_sections (
          page_guide_id, section_name, section_description, section_path,
          features, sort_order, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        pageGuideId,
        section.section_name,
        section.section_description,
        section.section_path,
        section.features,
        section.sort_order,
        1
      ]);
      
      console.log(`  ✅ 添加功能板块: ${section.section_name}`);
    }

    // 验证数据
    const [verification] = await connection.execute(`
      SELECT 
        pg.page_path as '页面路径',
        pg.page_name as '页面名称',
        pg.category as '分类',
        pg.importance as '重要性',
        pg.is_active as '是否启用',
        COUNT(pgs.id) as '功能板块数量'
      FROM page_guides pg
      LEFT JOIN page_guide_sections pgs ON pg.id = pgs.page_guide_id
      WHERE pg.page_path = '/centers/teaching'
      GROUP BY pg.id
    `);

    console.log('\n📊 验证结果:');
    console.table(verification);

    console.log('\n🎉 教学中心页面感知配置添加完成！');
    console.log('📋 配置内容:');
    console.log('   - 页面路径: /centers/teaching');
    console.log('   - 页面名称: 教学中心');
    console.log('   - 功能板块: 4个');
    console.log('   - 相关数据表: 16个');
    console.log('   - AI上下文: 已配置');
    console.log('\n💡 现在AI助手可以为教学中心页面提供智能化的指导和建议了！');

  } catch (error) {
    console.error('❌ 添加教学中心页面感知配置失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
if (require.main === module) {
  addTeachingCenterPageGuide()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { addTeachingCenterPageGuide };
