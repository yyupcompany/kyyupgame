const mysql = require('mysql2/promise');

// 数据库连接配置（使用与其他修复脚本相同的远程数据库配置）
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

// 营销中心三个缺失子页面的页面感知数据（基于实际页面检查结果）
const pages = [
  {
    page_path: '/centers/marketing/referrals',
    page_name: '老带新',
    page_description: '老带新推荐管理系统，用于管理和分析推荐关系、跟踪转化效果、管理奖励机制，支持推荐关系可视化和效果分析',
    category: 'marketing',
    importance: 8,
    related_tables: ["referrals","customers","activities","rewards","referral_statistics"],
    context_prompt: '这是营销中心的老带新管理页面，用户可以在这里管理推荐关系，查看推荐效果统计，包括推荐人数、转化情况、奖励发放等。页面支持推荐关系图谱、趋势分析、排行榜等功能。当前显示本期新增0人、完成转化0人、转化率0.0%。',
    sections: [
      {
        section_name: '推荐概览',
        section_description: '展示推荐活动总体统计信息',
        features: ["本期新增推荐","完成转化数","转化率统计","TOP推荐人展示"],
        sort_order: 1
      },
      {
        section_name: '推荐记录管理',
        section_description: '推荐关系记录的增删改查',
        features: ["推荐人管理","被推荐人管理","推荐状态跟踪","关联活动管理","推荐时间记录","转化时间跟踪"],
        sort_order: 2
      },
      {
        section_name: '奖励管理',
        section_description: '推荐奖励机制和发放管理',
        features: ["奖励规则设置","奖励发放记录","奖励统计分析","奖励类型管理"],
        sort_order: 3
      },
      {
        section_name: '关系图谱分析',
        section_description: '推荐关系可视化分析工具',
        features: ["关系图展示","全屏查看模式","关系链分析","推荐网络可视化"],
        sort_order: 4
      },
      {
        section_name: '趋势分析',
        section_description: '推荐效果趋势和排行分析',
        features: ["推荐趋势图","转化趋势分析","TOP推荐人排行榜","数据导出功能"],
        sort_order: 5
      }
    ]
  },
  {
    page_path: '/centers/marketing/conversions',
    page_name: '转换统计',
    page_description: '营销转换统计分析系统，用于分析各渠道的转换效果和ROI，提供详细的转换数据分析和渠道效果对比',
    category: 'marketing',
    importance: 9,
    related_tables: ["marketing_channels","conversions","leads","customers","channel_statistics"],
    context_prompt: '这是营销中心的转换统计页面，用户可以在这里查看各营销渠道的转换效果，包括线索数、转化数、转化率、ROI等关键指标。当前显示总线索2273个、总转化3160个、平均转化率38.5%、最佳渠道为微信朋友圈广告。页面包含多个渠道的详细数据分析。',
    sections: [
      {
        section_name: '转换概览',
        section_description: '展示转换统计总体数据概况',
        features: ["总线索数统计","总转化数统计","平均转化率计算","最佳渠道识别"],
        sort_order: 1
      },
      {
        section_name: '渠道转换分析',
        section_description: '各营销渠道转换效果详细分析',
        features: ["渠道投入成本分析","线索数统计","转化数分析","转化率计算","渠道效果对比"],
        sort_order: 2
      },
      {
        section_name: 'ROI投资回报分析',
        section_description: '投资回报率和成本效益分析',
        features: ["ROI计算","成本效益分析","盈利能力评估","投入产出比分析"],
        sort_order: 3
      },
      {
        section_name: '效果排行榜',
        section_description: '各渠道效果排行和TOP榜单',
        features: ["线索数TOP10排行","转化数TOP10排行","转化率TOP10排行","综合效果排名"],
        sort_order: 4
      },
      {
        section_name: '数据管理',
        section_description: '转换数据的筛选导出和报表功能',
        features: ["时间范围筛选","渠道筛选","数据导出","定制化报表生成"],
        sort_order: 5
      }
    ]
  },
  {
    page_path: '/centers/marketing/funnel',
    page_name: '销售漏斗',
    page_description: '销售漏斗分析系统，用于可视化和分析销售流程各阶段的转化情况，支持多种图表展示和阶段详情分析',
    category: 'marketing',
    importance: 9,
    related_tables: ["sales_funnel","leads","customers","conversions","funnel_stages"],
    context_prompt: '这是营销中心的销售漏斗页面，用户可以在这里查看销售流程各阶段的转化情况。当前显示总转化率0%（2373人→0人），包含采集单(2373人)、进店(51240人)、了解园区(3550人)、预报名(0人)、尾款(0人)五个阶段。页面支持漏斗图、柱状图、折线图等多种可视化方式。',
    sections: [
      {
        section_name: '漏斗可视化',
        section_description: '销售漏斗的多种图表展示方式',
        features: ["漏斗图展示","柱状图切换","折线图分析","图表交互操作"],
        sort_order: 1
      },
      {
        section_name: '转化率统计',
        section_description: '各阶段转化率和统计数据',
        features: ["总转化率计算","阶段转化率分析","转化人数统计","环比数据分析"],
        sort_order: 2
      },
      {
        section_name: '阶段详情分析',
        section_description: '销售流程各阶段的详细数据',
        features: ["采集单阶段分析","进店阶段统计","了解园区阶段","预报名阶段跟踪","尾款阶段管理"],
        sort_order: 3
      },
      {
        section_name: '流失分析',
        section_description: '各阶段客户流失情况分析',
        features: ["流失率统计","流失原因分析","改进建议提供","流失预警机制"],
        sort_order: 4
      },
      {
        section_name: '时间维度分析',
        section_description: '基于时间维度的漏斗数据分析',
        features: ["时间范围筛选","趋势对比分析","周期性分析","维度切换功能"],
        sort_order: 5
      }
    ]
  }
];

async function insertMarketingPageGuides() {
  let connection;
  
  try {
    console.log('🔗 连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    console.log('\n📋 准备添加营销中心页面感知数据...');
    console.log(`📊 待处理页面数量: ${pages.length}`);

    for (const page of pages) {
      console.log(`\n📄 处理页面: ${page.page_name} (${page.page_path})`);
      
      // 插入或更新 page_guides 记录
      const [result] = await connection.execute(`
        INSERT INTO page_guides (page_path, page_name, page_description, category, importance, related_tables, context_prompt, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          page_name=VALUES(page_name),
          page_description=VALUES(page_description),
          category=VALUES(category),
          importance=VALUES(importance),
          related_tables=VALUES(related_tables),
          context_prompt=VALUES(context_prompt),
          is_active=1,
          updated_at=NOW()
      `, [
        page.page_path,
        page.page_name,
        page.page_description,
        page.category,
        page.importance,
        JSON.stringify(page.related_tables),
        page.context_prompt
      ]);

      // 获取 page_guide_id
      const [pageGuideRows] = await connection.execute(
        'SELECT id FROM page_guides WHERE page_path = ? LIMIT 1',
        [page.page_path]
      );
      
      if (!pageGuideRows.length) {
        console.log(`❌ 无法找到页面记录: ${page.page_path}`);
        continue;
      }
      
      const pageGuideId = pageGuideRows[0].id;
      console.log(`✅ 页面记录处理完成，ID: ${pageGuideId}`);

      // 处理 sections
      let sectionsAdded = 0;
      let sectionsSkipped = 0;
      
      for (const section of page.sections) {
        // 检查 section 是否已存在
        const [existingSections] = await connection.execute(
          'SELECT id FROM page_guide_sections WHERE page_guide_id = ? AND section_name = ? LIMIT 1',
          [pageGuideId, section.section_name]
        );

        if (existingSections.length === 0) {
          // 插入新的 section
          await connection.execute(`
            INSERT INTO page_guide_sections (page_guide_id, section_name, section_description, features, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            pageGuideId,
            section.section_name,
            section.section_description,
            JSON.stringify(section.features),
            section.sort_order
          ]);
          console.log(`  ✅ 新增功能分区: ${section.section_name}`);
          sectionsAdded++;
        } else {
          console.log(`  ↩️ 功能分区已存在，跳过: ${section.section_name}`);
          sectionsSkipped++;
        }
      }
      
      console.log(`📊 页面 ${page.page_name} 处理完成: 新增${sectionsAdded}个分区, 跳过${sectionsSkipped}个分区`);
    }

    console.log('\n🎉 营销中心页面感知数据添加完成！');
    console.log('📝 已添加的页面:');
    pages.forEach(page => {
      console.log(`  - ${page.page_name} (${page.page_path})`);
    });
    
  } catch (error) {
    console.error('❌ 执行过程中出现错误:', error);
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
  insertMarketingPageGuides()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { insertMarketingPageGuides };
