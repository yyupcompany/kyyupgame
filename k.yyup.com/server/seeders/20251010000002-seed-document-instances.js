'use strict';

/**
 * 文档实例种子数据
 * 创建示例文档实例用于测试
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🌱 开始插入文档实例种子数据...');

    const now = new Date();
    
    // 获取admin用户ID
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'admin' LIMIT 1"
    );
    const adminId = users[0]?.id || 1;

    // 获取文档模板
    const [templates] = await queryInterface.sequelize.query(
      "SELECT id, code, name FROM document_templates WHERE code LIKE '01-%' OR code LIKE '02-%' LIMIT 10"
    );

    if (templates.length === 0) {
      console.log('⚠️  没有找到文档模板，跳过文档实例创建');
      return;
    }

    const instances = [];
    const statuses = ['draft', 'pending_review', 'approved', 'rejected', 'archived'];
    
    // 为每个模板创建2-3个实例
    templates.forEach((template, index) => {
      // 实例1: 已完成并审核通过
      instances.push({
        template_id: template.id,
        inspection_task_id: null,
        title: `${template.name} - 2024年10月`,
        document_number: `DOC-2024-10-${String(index * 3 + 1).padStart(3, '0')}`,
        content: `# ${template.name}\n\n这是一个示例文档实例。\n\n## 检查内容\n\n已完成所有检查项目。`,
        filled_data: JSON.stringify({
          检查日期: '2024-10-01',
          检查人: 'admin',
          检查结果: '合格',
          备注: '所有项目检查完毕，符合要求'
        }),
        status: 'approved',
        completion_rate: 100.00,
        deadline: new Date('2024-10-31'),
        submitted_at: new Date('2024-10-05'),
        reviewed_at: new Date('2024-10-06'),
        created_by: adminId,
        assigned_to: adminId,
        reviewed_by: adminId,
        review_comments: '检查详细，符合标准，审核通过。',
        attachments: JSON.stringify([
          { name: '检查照片1.jpg', url: '/uploads/check1.jpg', size: 102400 },
          { name: '检查照片2.jpg', url: '/uploads/check2.jpg', size: 98304 }
        ]),
        version: 1,
        parent_version_id: null,
        tags: JSON.stringify(['已完成', '已审核', '2024年10月']),
        metadata: JSON.stringify({
          检查类型: template.code.startsWith('01-') ? '年度检查' : '月度检查',
          检查周期: '2024年10月',
          重要程度: '高'
        }),
        created_at: new Date('2024-10-01'),
        updated_at: new Date('2024-10-06'),
        deleted_at: null
      });

      // 实例2: 待审核
      instances.push({
        template_id: template.id,
        inspection_task_id: null,
        title: `${template.name} - 2024年11月`,
        document_number: `DOC-2024-11-${String(index * 3 + 2).padStart(3, '0')}`,
        content: `# ${template.name}\n\n这是一个待审核的文档实例。\n\n## 检查内容\n\n检查工作已完成，等待审核。`,
        filled_data: JSON.stringify({
          检查日期: '2024-11-01',
          检查人: 'admin',
          检查结果: '待审核'
        }),
        status: 'pending_review',
        completion_rate: 100.00,
        deadline: new Date('2024-11-30'),
        submitted_at: new Date('2024-11-05'),
        reviewed_at: null,
        created_by: adminId,
        assigned_to: adminId,
        reviewed_by: null,
        review_comments: null,
        attachments: JSON.stringify([]),
        version: 1,
        parent_version_id: null,
        tags: JSON.stringify(['待审核', '2024年11月']),
        metadata: JSON.stringify({
          检查类型: template.code.startsWith('01-') ? '年度检查' : '月度检查',
          检查周期: '2024年11月'
        }),
        created_at: new Date('2024-11-01'),
        updated_at: new Date('2024-11-05'),
        deleted_at: null
      });

      // 实例3: 草稿（仅为前5个模板创建）
      if (index < 5) {
        instances.push({
          template_id: template.id,
          inspection_task_id: null,
          title: `${template.name} - 2024年12月`,
          document_number: `DOC-2024-12-${String(index * 3 + 3).padStart(3, '0')}`,
          content: `# ${template.name}\n\n这是一个草稿文档。\n\n## 检查内容\n\n正在填写中...`,
          filled_data: JSON.stringify({
            检查日期: '2024-12-01',
            检查人: 'admin'
          }),
          status: 'draft',
          completion_rate: 35.50,
          deadline: new Date('2024-12-31'),
          submitted_at: null,
          reviewed_at: null,
          created_by: adminId,
          assigned_to: adminId,
          reviewed_by: null,
          review_comments: null,
          attachments: JSON.stringify([]),
          version: 1,
          parent_version_id: null,
          tags: JSON.stringify(['草稿', '2024年12月']),
          metadata: JSON.stringify({
            检查类型: template.code.startsWith('01-') ? '年度检查' : '月度检查',
            检查周期: '2024年12月',
            进度: '35%'
          }),
          created_at: new Date('2024-12-01'),
          updated_at: new Date('2024-12-01'),
          deleted_at: null
        });
      }
    });

    // 插入数据
    await queryInterface.bulkInsert('document_instances', instances);
    
    console.log(`✅ 成功插入 ${instances.length} 个文档实例`);
    console.log('📊 实例状态统计:');
    
    const statusCount = {};
    instances.forEach(inst => {
      statusCount[inst.status] = (statusCount[inst.status] || 0) + 1;
    });
    
    Object.entries(statusCount).forEach(([status, count]) => {
      const statusName = {
        'draft': '草稿',
        'pending_review': '待审核',
        'approved': '已审核',
        'rejected': '已拒绝',
        'archived': '已归档'
      }[status] || status;
      console.log(`   - ${statusName}: ${count}个`);
    });
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🗑️  开始删除文档实例种子数据...');
    
    await queryInterface.bulkDelete('document_instances', {
      document_number: {
        [Sequelize.Op.like]: 'DOC-2024-%'
      }
    });
    
    console.log('✅ 文档实例种子数据删除完成');
  }
};

