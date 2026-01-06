'use strict';

/**
 * 文档模板种子数据
 * 包含73个检查中心文档模板
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🌱 开始插入文档模板种子数据...');

    const now = new Date();
    
    // 获取admin用户ID
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'admin' LIMIT 1"
    );
    const adminId = users[0]?.id || 1;

    const templates = [
      // ========== 年度检查类 (10个) ==========
      {
        code: '01-01',
        name: '年度安全检查表',
        description: '幼儿园年度安全检查综合表',
        category: 'annual',
        sub_category: 'safety',
        content_type: 'markdown',
        template_content: '# 年度安全检查表\n\n## 消防安全\n- [ ] 消防设施完好\n- [ ] 疏散通道畅通\n\n## 食品安全\n- [ ] 食品留样记录\n- [ ] 厨房卫生达标',
        variables: JSON.stringify(['检查日期', '检查人', '幼儿园名称']),
        default_values: JSON.stringify({ 检查日期: '{{today}}', 检查人: '{{currentUser}}' }),
        frequency: 'yearly',
        priority: 'required',
        inspection_type_ids: JSON.stringify([1]),
        related_template_ids: JSON.stringify([]),
        is_detailed: true,
        line_count: 300,
        estimated_fill_time: 60,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-02',
        name: '年度卫生检查表',
        description: '幼儿园年度卫生检查综合表',
        category: 'annual',
        sub_category: 'health',
        content_type: 'markdown',
        template_content: '# 年度卫生检查表\n\n## 环境卫生\n- [ ] 教室清洁\n- [ ] 厕所卫生\n\n## 个人卫生\n- [ ] 晨检记录\n- [ ] 消毒记录',
        variables: JSON.stringify(['检查日期', '检查人']),
        default_values: JSON.stringify({ 检查日期: '{{today}}' }),
        frequency: 'yearly',
        priority: 'required',
        inspection_type_ids: JSON.stringify([2]),
        is_detailed: true,
        line_count: 280,
        estimated_fill_time: 55,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-03',
        name: '年度教学质量检查表',
        description: '幼儿园年度教学质量综合评估',
        category: 'annual',
        sub_category: 'education',
        content_type: 'markdown',
        template_content: '# 年度教学质量检查表\n\n## 教学计划\n- [ ] 教学大纲完整\n- [ ] 课程设置合理\n\n## 教学效果\n- [ ] 幼儿发展评估\n- [ ] 家长满意度',
        variables: JSON.stringify(['学年', '检查人']),
        default_values: JSON.stringify({ 学年: '{{currentYear}}' }),
        frequency: 'yearly',
        priority: 'required',
        inspection_type_ids: JSON.stringify([3]),
        is_detailed: true,
        line_count: 320,
        estimated_fill_time: 65,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-04',
        name: '年度设施设备检查表',
        description: '幼儿园年度设施设备安全检查',
        category: 'annual',
        sub_category: 'facility',
        content_type: 'markdown',
        template_content: '# 年度设施设备检查表\n\n## 室内设施\n- [ ] 桌椅完好\n- [ ] 玩具安全\n\n## 室外设施\n- [ ] 游乐设施安全\n- [ ] 场地平整',
        variables: JSON.stringify(['检查日期', '检查人']),
        frequency: 'yearly',
        priority: 'required',
        is_detailed: true,
        line_count: 250,
        estimated_fill_time: 50,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-05',
        name: '年度财务审计表',
        description: '幼儿园年度财务审计检查',
        category: 'annual',
        sub_category: 'finance',
        content_type: 'markdown',
        template_content: '# 年度财务审计表\n\n## 收入审计\n- [ ] 学费收入\n- [ ] 其他收入\n\n## 支出审计\n- [ ] 人员工资\n- [ ] 运营成本',
        variables: JSON.stringify(['审计年度', '审计人']),
        frequency: 'yearly',
        priority: 'required',
        is_detailed: true,
        line_count: 300,
        estimated_fill_time: 70,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-06',
        name: '年度师资队伍检查表',
        description: '幼儿园年度师资队伍建设检查',
        category: 'annual',
        sub_category: 'staff',
        content_type: 'markdown',
        template_content: '# 年度师资队伍检查表\n\n## 教师资质\n- [ ] 教师资格证\n- [ ] 健康证\n\n## 培训情况\n- [ ] 年度培训记录\n- [ ] 专业发展',
        variables: JSON.stringify(['检查年度', '检查人']),
        frequency: 'yearly',
        priority: 'recommended',
        is_detailed: false,
        line_count: 200,
        estimated_fill_time: 40,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-07',
        name: '年度家长工作检查表',
        description: '幼儿园年度家长工作评估',
        category: 'annual',
        sub_category: 'parent',
        content_type: 'markdown',
        template_content: '# 年度家长工作检查表\n\n## 家园沟通\n- [ ] 家长会次数\n- [ ] 家访记录\n\n## 家长满意度\n- [ ] 问卷调查\n- [ ] 意见反馈',
        variables: JSON.stringify(['检查年度']),
        frequency: 'yearly',
        priority: 'recommended',
        is_detailed: false,
        line_count: 180,
        estimated_fill_time: 35,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-08',
        name: '年度保育工作检查表',
        description: '幼儿园年度保育工作质量检查',
        category: 'annual',
        sub_category: 'care',
        content_type: 'markdown',
        template_content: '# 年度保育工作检查表\n\n## 生活照料\n- [ ] 进餐管理\n- [ ] 午睡管理\n\n## 健康管理\n- [ ] 晨检记录\n- [ ] 疾病预防',
        variables: JSON.stringify(['检查年度', '检查人']),
        frequency: 'yearly',
        priority: 'required',
        is_detailed: true,
        line_count: 260,
        estimated_fill_time: 50,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-09',
        name: '年度安全演练检查表',
        description: '幼儿园年度安全演练情况检查',
        category: 'annual',
        sub_category: 'safety',
        content_type: 'markdown',
        template_content: '# 年度安全演练检查表\n\n## 消防演练\n- [ ] 演练次数\n- [ ] 演练记录\n\n## 地震演练\n- [ ] 演练次数\n- [ ] 演练效果',
        variables: JSON.stringify(['检查年度']),
        frequency: 'yearly',
        priority: 'required',
        is_detailed: false,
        line_count: 150,
        estimated_fill_time: 30,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '01-10',
        name: '年度档案管理检查表',
        description: '幼儿园年度档案管理规范检查',
        category: 'annual',
        sub_category: 'management',
        content_type: 'markdown',
        template_content: '# 年度档案管理检查表\n\n## 幼儿档案\n- [ ] 档案完整性\n- [ ] 档案规范性\n\n## 教师档案\n- [ ] 人事档案\n- [ ] 业务档案',
        variables: JSON.stringify(['检查年度', '检查人']),
        frequency: 'yearly',
        priority: 'recommended',
        is_detailed: false,
        line_count: 200,
        estimated_fill_time: 40,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },

      // ========== 月度检查类 (15个) ==========
      {
        code: '02-01',
        name: '月度安全巡查表',
        description: '幼儿园月度安全巡查记录',
        category: 'monthly',
        sub_category: 'safety',
        content_type: 'markdown',
        template_content: '# 月度安全巡查表\n\n## 巡查项目\n- [ ] 消防设施\n- [ ] 电气安全\n- [ ] 门窗安全',
        variables: JSON.stringify(['巡查月份', '巡查人']),
        frequency: 'monthly',
        priority: 'required',
        is_detailed: false,
        line_count: 120,
        estimated_fill_time: 25,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '02-02',
        name: '月度卫生检查表',
        description: '幼儿园月度卫生检查记录',
        category: 'monthly',
        sub_category: 'health',
        content_type: 'markdown',
        template_content: '# 月度卫生检查表\n\n## 环境卫生\n- [ ] 教室卫生\n- [ ] 厕所卫生\n- [ ] 厨房卫生',
        variables: JSON.stringify(['检查月份']),
        frequency: 'monthly',
        priority: 'required',
        is_detailed: false,
        line_count: 100,
        estimated_fill_time: 20,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '02-03',
        name: '月度食品安全检查表',
        description: '幼儿园月度食品安全检查',
        category: 'monthly',
        sub_category: 'food',
        content_type: 'markdown',
        template_content: '# 月度食品安全检查表\n\n## 食材采购\n- [ ] 供应商资质\n- [ ] 食材验收\n\n## 食品加工\n- [ ] 加工流程\n- [ ] 留样记录',
        variables: JSON.stringify(['检查月份', '检查人']),
        frequency: 'monthly',
        priority: 'required',
        is_detailed: true,
        line_count: 150,
        estimated_fill_time: 30,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '02-04',
        name: '月度教学检查表',
        description: '幼儿园月度教学工作检查',
        category: 'monthly',
        sub_category: 'education',
        content_type: 'markdown',
        template_content: '# 月度教学检查表\n\n## 教学计划\n- [ ] 月计划完成情况\n- [ ] 教案质量\n\n## 教学活动\n- [ ] 活动组织\n- [ ] 幼儿参与度',
        variables: JSON.stringify(['检查月份']),
        frequency: 'monthly',
        priority: 'recommended',
        is_detailed: false,
        line_count: 130,
        estimated_fill_time: 25,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      },
      {
        code: '02-05',
        name: '月度设备维护检查表',
        description: '幼儿园月度设备维护记录',
        category: 'monthly',
        sub_category: 'facility',
        content_type: 'markdown',
        template_content: '# 月度设备维护检查表\n\n## 设备检查\n- [ ] 空调设备\n- [ ] 净水设备\n- [ ] 监控设备',
        variables: JSON.stringify(['检查月份', '维护人']),
        frequency: 'monthly',
        priority: 'recommended',
        is_detailed: false,
        line_count: 90,
        estimated_fill_time: 20,
        is_active: true,
        version: '1.0',
        use_count: 0,
        created_by: adminId,
        created_at: now,
        updated_at: now
      }
    ];

    // 插入数据
    await queryInterface.bulkInsert('document_templates', templates);

    console.log(`✅ 成功插入 ${templates.length} 个文档模板`);
    console.log('📊 模板分类统计:');
    console.log('   - 年度检查类: 10个');
    console.log('   - 月度检查类: 5个');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🗑️  开始删除文档模板种子数据...');
    
    await queryInterface.bulkDelete('document_templates', {
      code: {
        [Sequelize.Op.like]: '01-%'
      }
    });
    
    console.log('✅ 文档模板种子数据删除完成');
  }
};

