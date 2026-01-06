// 检查 /centers/marketing 下四个子页面的页面感知说明状态
// 仅查询，不执行任何增删改操作

const mysql = require('mysql2/promise');

async function run() {
  let connection;
  try {
    console.log('🔗 连接远程数据库...');
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });
    console.log('✅ 数据库连接成功');

    // 定义四个子页面
    const pages = [
      {
        page_path: '/centers/marketing/channels',
        page_name: '渠道管理',
        page_description:
          '渠道管理是营销中心的核心功能之一。在这里可以统一管理线上线下渠道，维护联系人与标签，监控渠道效果，进行成本与ROI分析，并支持多维度报表。',
        category: '营销页面',
        importance: 9,
        related_tables: ['channel_trackings', 'conversion_trackings', 'marketing_campaigns', 'users', 'teachers', 'parents'],
        context_prompt:
          '用户正在“渠道管理”页面，关注渠道配置与效果分析。可能需要查看渠道数据、分析ROI、维护联系人/标签、优化推广策略等。'
      },
      {
        page_path: '/centers/marketing/referrals',
        page_name: '老带新',
        page_description:
          '老带新推荐体系用于通过现有家长期待带来新线索并提升转化。提供推荐关系管理、奖励机制设置、效果跟踪与数据分析等功能。',
        category: '营销页面',
        importance: 8,
        related_tables: ['referral_relationships', 'parents', 'students', 'users', 'marketing_campaigns', 'enrollment_applications'],
        context_prompt:
          '用户正在“老带新”页面，关注推荐关系与奖励机制。可能需要查看推荐数据、管理关系、设置奖励并分析推荐效果等。'
      },
      {
        page_path: '/centers/marketing/conversions',
        page_name: '转换统计',
        page_description:
          '转换统计页面提供从线索到报名的完整转换分析，支持按渠道、活动、时间等维度查看转换指标，识别瓶颈并优化策略。',
        category: '营销页面',
        importance: 9,
        related_tables: ['conversion_trackings', 'channel_trackings', 'marketing_campaigns', 'enrollment_applications', 'admission_results'],
        context_prompt:
          '用户正在“转换统计”页面，关注转化率与漏斗数据。可能需要查看各维度转换、定位瓶颈并获得优化建议。'
      },
      {
        page_path: '/centers/marketing/funnel',
        page_name: '销售漏斗',
        page_description:
          '销售漏斗页面可视化展示客户旅程各阶段的转化情况，帮助识别流失点并指导优化销售流程，提升整体转化效率。',
        category: '营销页面',
        importance: 9,
        related_tables: ['channel_trackings', 'conversion_trackings', 'enrollment_applications', 'admission_results', 'marketing_campaigns'],
        context_prompt:
          '用户正在“销售漏斗”页面，关注各阶段转化与流失。可能需要查看漏斗指标、阶段对比、瓶颈诊断与优化建议。'
      }
    ];

    // 每个页面对应的 section 设计
    const sections = {
      '/centers/marketing/channels': [
        { section_name: '渠道概览', section_description: '全渠道效果概览与关键指标', section_path: '/centers/marketing/channels', features: ['渠道统计', '效果对比', '成本分析', 'ROI计算'], sort_order: 1 },
        { section_name: '渠道管理', section_description: '渠道信息配置与状态管理', section_path: '/centers/marketing/channels', features: ['新建/编辑', '状态管理', '分类设置', '批量操作'], sort_order: 2 },
        { section_name: '联系人管理', section_description: '渠道联系人维护与关系管理', section_path: '/centers/marketing/channels', features: ['添加/维护', '批量导入', '联系记录'], sort_order: 3 },
        { section_name: '标签管理', section_description: '标签创建与分类、筛选', section_path: '/centers/marketing/channels', features: ['标签创建', '批量标记', '智能推荐'], sort_order: 4 },
        { section_name: '数据分析', section_description: '多维度可视化与报表', section_path: '/centers/marketing/channels', features: ['图表展示', '对比分析', '数据导出'], sort_order: 5 }
      ],
      '/centers/marketing/referrals': [
        { section_name: '推荐概览', section_description: '推荐数量、成功率、奖励发放', section_path: '/centers/marketing/referrals', features: ['推荐统计', '成功率分析', '奖励统计'], sort_order: 1 },
        { section_name: '推荐关系', section_description: '推荐人与被推荐人关系管理', section_path: '/centers/marketing/referrals', features: ['关系建立', '状态跟踪', '关系图谱'], sort_order: 2 },
        { section_name: '奖励机制', section_description: '奖励规则与发放记录管理', section_path: '/centers/marketing/referrals', features: ['规则配置', '发放管理', '记录查询'], sort_order: 3 },
        { section_name: '效果分析', section_description: '转化与成本效益分析', section_path: '/centers/marketing/referrals', features: ['转化分析', '趋势预测', '报表导出'], sort_order: 4 }
      ],
      '/centers/marketing/conversions': [
        { section_name: '转换概览', section_description: '核心转换指标与趋势', section_path: '/centers/marketing/conversions', features: ['总体转化率', '阶段转化', '趋势分析'], sort_order: 1 },
        { section_name: '维度分析', section_description: '按渠道/活动/时间等维度查看', section_path: '/centers/marketing/conversions', features: ['按渠道', '按活动', '按时间'], sort_order: 2 },
        { section_name: '漏斗分析', section_description: '从线索到报名的漏斗转换', section_path: '/centers/marketing/conversions', features: ['阶段转化', '流失点识别'], sort_order: 3 },
        { section_name: '报表导出', section_description: '导出报表与分享', section_path: '/centers/marketing/conversions', features: ['表格导出', '图表导出'], sort_order: 4 }
      ],
      '/centers/marketing/funnel': [
        { section_name: '漏斗概览', section_description: '各阶段人数与转化率', section_path: '/centers/marketing/funnel', features: ['阶段人数', '阶段转化率'], sort_order: 1 },
        { section_name: '阶段分析', section_description: '阶段对比与关键因素', section_path: '/centers/marketing/funnel', features: ['阶段对比', '关键因素'], sort_order: 2 },
        { section_name: '瓶颈诊断', section_description: '识别流失节点与原因', section_path: '/centers/marketing/funnel', features: ['流失分析', '原因诊断'], sort_order: 3 },
        { section_name: '优化建议', section_description: '可执行的优化方案', section_path: '/centers/marketing/funnel', features: ['策略建议', '方案评估'], sort_order: 4 }
      ]
    };

    // 定义需要检查的四个子页面路径
    const targetPaths = [
      '/centers/marketing/channels',
      '/centers/marketing/referrals',
      '/centers/marketing/conversions',
      '/centers/marketing/funnel'
    ];

    console.log('\n📋 检查营销中心四个子页面的页面感知状态...\n');

    const results = {
      existing: [],
      missing: []
    };

    for (const path of targetPaths) {
      console.log(`🔍 检查: ${path}`);

      // 查询 page_guides
      const [pageRows] = await connection.execute(
        'SELECT id, page_name, page_description, category, importance, related_tables, context_prompt, is_active FROM page_guides WHERE page_path = ?',
        [path]
      );

      if (pageRows.length > 0) {
        const page = pageRows[0];
        console.log(`   ✅ 已存在: ${page.page_name} (ID: ${page.id})`);
        console.log(`      分类: ${page.category}, 重要性: ${page.importance}, 状态: ${page.is_active ? '启用' : '禁用'}`);

        // 查询对应的 sections
        const [sectionRows] = await connection.execute(
          'SELECT section_name, section_description, sort_order FROM page_guide_sections WHERE page_guide_id = ? AND is_active = 1 ORDER BY sort_order',
          [page.id]
        );

        if (sectionRows.length > 0) {
          console.log(`      功能区块 (${sectionRows.length}个):`);
          sectionRows.forEach(section => {
            console.log(`        ${section.sort_order}. ${section.section_name}: ${section.section_description}`);
          });
        } else {
          console.log(`      ⚠️  无功能区块`);
        }

        results.existing.push({
          path,
          page,
          sections: sectionRows
        });
      } else {
        console.log(`   ❌ 缺失页面感知记录`);
        results.missing.push(path);
      }
      console.log('');
    }

    // 汇总报告
    console.log('📊 检查结果汇总:');
    console.log(`   ✅ 已配置页面感知: ${results.existing.length}/${targetPaths.length}`);
    console.log(`   ❌ 缺失页面感知: ${results.missing.length}/${targetPaths.length}`);

    if (results.missing.length > 0) {
      console.log('\n🚨 缺失的页面:');
      results.missing.forEach(path => {
        console.log(`   - ${path}`);
      });
      console.log('\n💡 建议: 需要通过MCP浏览器实际访问这些页面，了解功能后创建准确的页面感知说明');
    }

    if (results.existing.length > 0) {
      console.log('\n✅ 已配置的页面:');
      results.existing.forEach(item => {
        console.log(`   - ${item.path}: ${item.page.page_name} (${item.sections.length}个功能区块)`);
      });
    }
  } catch (err) {
    console.error('❌ 检查失败:', err.message || err);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔗 数据库连接已关闭');
    }
  }
}

checkPageGuides();

