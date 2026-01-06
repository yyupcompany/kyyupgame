// 添加业务中心页面感知配置
// 执行时间：2025-09-24

const mysql = require('mysql2/promise');

async function addBusinessCenterPageGuide() {
  let connection;
  
  try {
    console.log('🚀 开始添加业务中心页面感知配置...');
    
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
      ['/centers/business']
    );

    let pageGuideId;

    if (existing.length > 0) {
      console.log('📋 业务中心页面记录已存在，更新数据...');
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
        '业务中心',
        '欢迎使用婴婴向上智能招生系统！您现在来到的是业务中心页面，这是系统的全流程业务管理与监控中心。在这里您可以通过Timeline时间线方式查看8个核心业务流程的进展情况，包括基础中心、人员基础信息、招生计划、活动计划、媒体计划、任务分配、教学中心、财务收入等。页面右侧显示招生进度条和详细信息，帮助您全面掌握业务运营状况。',
        '中心页面',
        9,
        JSON.stringify([
          'students', 'teachers', 'parents', 'classes',
          'enrollment_applications', 'enrollment_plans', 
          'activities', 'activity_plans',
          'marketing_campaigns', 'advertisements',
          'tasks', 'task_assignments',
          'courses', 'teaching_plans',
          'finance_records', 'tuition_fees'
        ]),
        '用户正在业务中心页面，这是一个全流程业务管理平台。用户可以查看8个业务流程的Timeline进展、监控招生进度、查看详细业务数据。用户可能需要了解各业务流程状态、招生完成情况、业务流程优化建议等。',
        1,
        '/centers/business'
      ]);
      
      console.log('✅ 业务中心页面记录更新成功');
    } else {
      console.log('📝 创建新的业务中心页面记录...');
      
      const [result] = await connection.execute(`
        INSERT INTO page_guides (
          page_path, page_name, page_description, category, importance,
          related_tables, context_prompt, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        '/centers/business',
        '业务中心',
        '欢迎使用婴婴向上智能招生系统！您现在来到的是业务中心页面，这是系统的全流程业务管理与监控中心。在这里您可以通过Timeline时间线方式查看8个核心业务流程的进展情况，包括基础中心、人员基础信息、招生计划、活动计划、媒体计划、任务分配、教学中心、财务收入等。页面右侧显示招生进度条和详细信息，帮助您全面掌握业务运营状况。',
        '中心页面',
        9,
        JSON.stringify([
          'students', 'teachers', 'parents', 'classes',
          'enrollment_applications', 'enrollment_plans', 
          'activities', 'activity_plans',
          'marketing_campaigns', 'advertisements',
          'tasks', 'task_assignments',
          'courses', 'teaching_plans',
          'finance_records', 'tuition_fees'
        ]),
        '用户正在业务中心页面，这是一个全流程业务管理平台。用户可以查看8个业务流程的Timeline进展、监控招生进度、查看详细业务数据。用户可能需要了解各业务流程状态、招生完成情况、业务流程优化建议等。',
        1
      ]);
      
      pageGuideId = result.insertId;
      console.log('✅ 业务中心页面记录创建成功，ID:', pageGuideId);
    }

    // 删除旧的功能板块记录
    await connection.execute(
      'DELETE FROM page_guide_sections WHERE page_guide_id = ?',
      [pageGuideId]
    );

    console.log('🗑️ 清理旧的功能板块记录');

    // 添加功能板块配置
    const sections = [
      {
        section_name: '业务流程Timeline',
        section_description: '8个核心业务流程的时间线展示，包括完成状态和进度百分比',
        section_path: '/centers/business#timeline',
        features: [
          '基础中心 - 系统基础配置与环境设置',
          '人员基础信息 - 教师、学生、家长信息管理',
          '招生计划 - 年度招生目标与策略制定',
          '活动计划 - 教学活动与课外活动安排',
          '媒体计划 - 宣传推广与品牌建设',
          '任务分配 - 工作任务分配与进度跟踪',
          '教学中心 - 课程管理与教学质量监控',
          '财务收入 - 学费收缴与财务管理'
        ],
        sort_order: 1
      },
      {
        section_name: '招生进度监控',
        section_description: '实时显示招生目标完成情况和关键指标',
        section_path: '/centers/business#enrollment-progress',
        features: [
          '年度招生目标设定',
          '当前招生完成数量',
          '招生完成率统计',
          '里程碑进度展示',
          '招生趋势分析'
        ],
        sort_order: 2
      },
      {
        section_name: '业务详情展示',
        section_description: '点击Timeline项目后显示的详细业务信息面板',
        section_path: '/centers/business#detail-panel',
        features: [
          '业务流程基础信息',
          '详细描述和说明',
          '关键业务指标',
          '操作历史记录',
          '编辑和查看操作'
        ],
        sort_order: 3
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
        JSON.stringify(section.features),
        section.sort_order,
        1
      ]);
      
      console.log(`✅ 添加功能板块: ${section.section_name}`);
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
      WHERE pg.page_path = '/centers/business'
      GROUP BY pg.id
    `);

    console.log('\n📊 验证结果:');
    console.table(verification);

    console.log('\n🎉 业务中心页面感知配置添加完成！');
    console.log('📋 配置内容:');
    console.log('   - 页面路径: /centers/business');
    console.log('   - 页面名称: 业务中心');
    console.log('   - 功能板块: 3个');
    console.log('   - 相关数据表: 14个');
    console.log('   - AI上下文: 已配置');

  } catch (error) {
    console.error('❌ 添加业务中心页面感知配置失败:', error.message);
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
  addBusinessCenterPageGuide()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { addBusinessCenterPageGuide };
