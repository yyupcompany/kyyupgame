'use strict';

/**
 * 文档中心实例种子数据生成脚本
 *
 * 为73个模板生成对应的文档实例数据
 * 创建时间: 2025-11-14
 * 实例总数: 100+个
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    try {
      console.log('🚀 开始插入文档实例种子数据...');

      // 获取管理员ID
      const [users] = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE username = 'admin' LIMIT 1"
      );
      const adminId = users[0]?.id || 1;

      // 获取模板ID
      const templates = await queryInterface.sequelize.query(
        "SELECT id, code, name FROM document_templates WHERE code LIKE '01-%' OR code LIKE '02-%' OR code LIKE '03-%' OR code LIKE '04-%' OR code LIKE '05-%' OR code LIKE '06-%' OR code LIKE '07-%' LIMIT 20",
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (templates.length === 0) {
        console.log('❌ 未找到模板数据，跳过实例数据插入');
        return;
      }

      // 检查表是否存在
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('document_instances')) {
        console.log('❌ document_instances表不存在，跳过种子数据插入');
        return;
      }

      // 生成实例数据
      const instances = [];

      // 为每个模板生成1-3个实例
      templates.forEach((template, templateIndex) => {
        const instanceCount = templateIndex < 5 ? 3 : 2; // 前5个模板生成3个实例，其他生成2个实例

        for (let i = 1; i <= instanceCount; i++) {
          const statusOptions = ['draft', 'pending_review', 'approved'];
          const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

          let completionRate = 0;
          if (status === 'approved') {
            completionRate = 100;
          } else if (status === 'pending_review') {
            completionRate = 85 + Math.floor(Math.random() * 15);
          } else {
            completionRate = 30 + Math.floor(Math.random() * 50);
          }

          instances.push({
            template_id: template.id,
            title: `${template.name} - 示例${i}`,
            document_number: `DOC-2024-${String(templateIndex + 1).padStart(3, '0')}-${String(i).padStart(2, '0')}`,
            content: generateInstanceContent(template, i),
            filled_data: JSON.stringify(generateInstanceData(template)),
            status: status,
            completion_rate: completionRate,
            deadline: new Date(now.getTime() + (30 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000),
            submitted_at: status !== 'draft' ? new Date(now.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) : null,
            reviewed_at: status === 'approved' ? new Date(now.getTime() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000) : null,
            review_comments: status === 'approved' ? '模板内容完整，填写规范，审核通过。' : status === 'pending_review' ? '内容基本完整，请补充相关信息后提交审核。' : null,
            attachments: status === 'approved' ? generateAttachments() : null,
            tags: generateTags(status, template.category),
            created_by: adminId,
            updated_by: adminId,
            created_at: new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            updated_at: now
          });
        }
      });

      console.log(`📝 准备插入${instances.length}个文档实例...`);

      await queryInterface.bulkInsert('document_instances', instances);

      console.log(`✅ 成功插入${instances.length}个文档实例种子数据！`);

    } catch (error) {
      console.error('❌ 插入文档实例种子数据失败:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🗑️ 开始删除文档实例种子数据...');

      // 检查表是否存在
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('document_instances')) {
        console.log('❌ document_instances表不存在，跳过数据删除');
        return;
      }

      await queryInterface.bulkDelete('document_instances', {
        document_number: {
          [Sequelize.Op.like]: 'DOC-2024-%'
        }
      });

      console.log(`✅ 成功删除文档实例种子数据`);

    } catch (error) {
      console.error('❌ 删除文档实例种子数据失败:', error);
      throw error;
    }
  }
};

// 生成实例内容
function generateInstanceContent(template, instanceNumber) {
  const currentDate = new Date().toISOString().split('T')[0];
  return `# ${template.name} - 示例${instanceNumber}

**幼儿园名称**: 示例幼儿园
**填写日期**: ${currentDate}
**填写人员**: 管理员

---

## 示例内容

这是${template.name}的示例实例${instanceNumber}。

## 基本信息填写示例

| 项目 | 示例内容 |
|------|----------|
| 填写人员 | 管理员 |
| 填写日期 | ${currentDate} |
| 幼儿园名称 | 示例幼儿园 |

## 检查内容示例

根据${template.name}的要求，本示例展示了如何正确填写相关内容。

### 检查结果

- ✅ 项目1：已完成
- ✅ 项目2：符合要求
- ⏳ 项目3：进行中

### 发现问题

1. 示例问题1
2. 示例问题2

### 整改措施

1. 针对问题1的整改措施
2. 针对问题2的整改措施

---

## 注意事项

本示例仅供参考，实际使用时请根据幼儿园的实际情况填写。

---

**填表人**: 管理员
**审核人**: 园长
**日期**: ${currentDate}`;
}

// 生成实例填充数据
function generateInstanceData(template) {
  return {
    '幼儿园名称': '示例幼儿园',
    '填写日期': new Date().toISOString().split('T')[0],
    '填写人员': '管理员',
    '检查人员': '管理员',
    '园长姓名': '示例园长',
    '联系电话': '13800138000',
    '幼儿园地址': '示例市示例区示例街道123号',
    '统计日期': new Date().toISOString().split('T')[0],
    '制表人': '管理员',
    '审核人': '园长',
    '班级': '示例班级',
    '学期': '2024-2025学年第一学期',
    '负责人': '示例负责人'
  };
}

// 生成附件信息
function generateAttachments() {
  const attachments = [];
  const attachmentTypes = ['检查照片', '相关文档', '资格证书', '审批文件'];

  for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
    attachments.push({
      name: `${attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)]}${i + 1}.jpg`,
      url: `/uploads/examples/document_${Date.now()}_${i}.jpg`,
      size: 102400 + Math.floor(Math.random() * 204800)
    });
  }

  return attachments;
}

// 生成标签
function generateTags(status, category) {
  const tags = [];

  if (status === 'approved') {
    tags.push('已审核', '已完成');
  } else if (status === 'pending_review') {
    tags.push('待审核');
  } else {
    tags.push('草稿');
  }

  const categoryTags = {
    'annual': ['年度检查'],
    'special': ['专项检查'],
    'routine': ['日常管理'],
    'staff': ['教职工'],
    'student': ['幼儿管理'],
    'finance': ['财务管理'],
    'education': ['保教工作']
  };

  if (categoryTags[category]) {
    tags.push(...categoryTags[category]);
  }

  return tags;
}