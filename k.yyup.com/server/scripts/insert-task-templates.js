const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kindergarten_management',
  charset: 'utf8mb4'
};

async function insertTaskTemplates() {
  let connection;
  
  try {
    console.log('🚀 开始插入任务模板数据...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 任务模板数据
    const templates = [
      {
        name: '招生宣传材料制作',
        description: '制作招生相关的宣传材料，包括海报、宣传册、微信图片等',
        type: 'enrollment',
        category: '宣传制作',
        template_content: JSON.stringify({
          subtasks: [
            { title: '收集幼儿园照片和资料', estimated_hours: 2, description: '收集园所环境、师资、课程等相关素材' },
            { title: '设计宣传册初稿', estimated_hours: 4, description: '根据收集的资料设计宣传册版面和内容' },
            { title: '制作招生海报设计稿', estimated_hours: 3, description: '设计A4和A3尺寸的招生海报' },
            { title: '制作微信宣传图片和视频脚本', estimated_hours: 2, description: '制作适合微信传播的图片和视频脚本' }
          ],
          requirements: [
            '宣传册需要突出我园的特色课程和师资力量',
            '海报设计要温馨活泼，符合幼儿园风格',
            '所有材料需要统一视觉风格',
            '完成后需要园长审核确认'
          ],
          acceptance_criteria: [
            '宣传册设计稿完成并获得园长确认',
            '海报设计完成（A4和A3尺寸）',
            '微信宣传图片不少于5张',
            '视频脚本字数800-1200字'
          ]
        }),
        default_priority: 'high',
        default_estimated_hours: 11,
        created_by: 1
      },
      {
        name: '亲子活动策划执行',
        description: '策划和组织亲子互动活动，增进家园联系',
        type: 'activity',
        category: '活动策划',
        template_content: JSON.stringify({
          subtasks: [
            { title: '确定活动主题和形式', estimated_hours: 1, description: '根据季节和教学需要确定活动主题' },
            { title: '制定详细活动方案', estimated_hours: 3, description: '包括活动流程、人员安排、物料准备等' },
            { title: '准备活动物料和场地', estimated_hours: 2, description: '采购或制作活动所需物品，布置场地' },
            { title: '活动现场执行', estimated_hours: 4, description: '组织活动进行，确保安全有序' },
            { title: '活动总结和反馈收集', estimated_hours: 1, description: '整理活动照片，收集家长反馈' }
          ],
          requirements: [
            '活动要有教育意义，适合不同年龄段',
            '确保活动安全，制定应急预案',
            '活动形式要新颖有趣，吸引家长参与',
            '做好活动记录和宣传'
          ],
          acceptance_criteria: [
            '活动顺利进行，无安全事故',
            '家长满意度达到90%以上',
            '活动照片和视频记录完整',
            '活动总结报告完成'
          ]
        }),
        default_priority: 'medium',
        default_estimated_hours: 11,
        created_by: 1
      },
      {
        name: '月度教学计划制定',
        description: '制定月度教学计划，确保教学质量和进度',
        type: 'daily',
        category: '教学管理',
        template_content: JSON.stringify({
          subtasks: [
            { title: '分析上月教学情况', estimated_hours: 1, description: '总结上月教学成果和问题' },
            { title: '制定本月教学目标', estimated_hours: 1, description: '根据教学大纲制定月度目标' },
            { title: '设计教学活动和课程', estimated_hours: 4, description: '设计具体的教学活动和课程安排' },
            { title: '准备教学材料和教具', estimated_hours: 2, description: '准备教学所需的各种材料和教具' },
            { title: '制定评估和考核方案', estimated_hours: 1, description: '设计学生学习效果的评估方法' }
          ],
          requirements: [
            '符合教育大纲要求，适合儿童发展特点',
            '教学内容要丰富多样，寓教于乐',
            '考虑不同能力水平的儿童需求',
            '与家长沟通教学计划和目标'
          ],
          acceptance_criteria: [
            '教学计划完整，可操作性强',
            '教学目标明确，可衡量',
            '教学材料准备充分',
            '获得教学主管审核通过'
          ]
        }),
        default_priority: 'medium',
        default_estimated_hours: 9,
        created_by: 1
      },
      {
        name: '新教师入职培训',
        description: '为新入职教师提供全面的培训，帮助快速适应工作',
        type: 'management',
        category: '人员培训',
        template_content: JSON.stringify({
          subtasks: [
            { title: '制定培训计划', estimated_hours: 2, description: '根据新教师背景制定个性化培训计划' },
            { title: '园所文化和制度培训', estimated_hours: 3, description: '介绍园所文化、规章制度、工作流程' },
            { title: '教学方法和技能培训', estimated_hours: 6, description: '培训教学方法、班级管理、家长沟通等技能' },
            { title: '实习指导和观摩', estimated_hours: 4, description: '安排资深教师指导，观摩优秀课堂' },
            { title: '培训效果评估', estimated_hours: 1, description: '评估培训效果，制定后续发展计划' }
          ],
          requirements: [
            '培训内容要全面系统，循序渐进',
            '理论与实践相结合',
            '安排经验丰富的导师指导',
            '建立培训档案和跟踪机制'
          ],
          acceptance_criteria: [
            '新教师通过培训考核',
            '能够独立承担教学工作',
            '熟悉园所各项制度和流程',
            '获得导师和主管认可'
          ]
        }),
        default_priority: 'high',
        default_estimated_hours: 16,
        created_by: 1
      },
      {
        name: '招生咨询接待培训',
        description: '培训招生咨询接待技巧，提高招生转化率',
        type: 'enrollment',
        category: '技能培训',
        template_content: JSON.stringify({
          subtasks: [
            { title: '制定培训大纲', estimated_hours: 1, description: '制定咨询接待培训的详细大纲' },
            { title: '咨询话术和技巧培训', estimated_hours: 3, description: '培训咨询话术、沟通技巧、异议处理' },
            { title: '园所介绍和卖点培训', estimated_hours: 2, description: '培训如何介绍园所特色和优势' },
            { title: '模拟演练和角色扮演', estimated_hours: 2, description: '通过模拟演练提高实战能力' },
            { title: '培训效果测试', estimated_hours: 1, description: '测试培训效果，查漏补缺' }
          ],
          requirements: [
            '培训内容要贴近实际工作场景',
            '注重实操演练和经验分享',
            '建立标准化的接待流程',
            '定期更新培训内容'
          ],
          acceptance_criteria: [
            '参训人员掌握咨询接待技巧',
            '能够流利介绍园所特色',
            '模拟演练通过考核',
            '实际咨询转化率提升'
          ]
        }),
        default_priority: 'medium',
        default_estimated_hours: 9,
        created_by: 1
      }
    ];
    
    // 插入模板数据
    for (const template of templates) {
      await connection.execute(`
        INSERT INTO task_templates (name, description, type, category, template_content, default_priority, default_estimated_hours, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        template.name,
        template.description,
        template.type,
        template.category,
        template.template_content,
        template.default_priority,
        template.default_estimated_hours,
        template.created_by
      ]);
      
      console.log(`  ✅ 插入模板: ${template.name}`);
    }
    
    // 验证插入结果
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM task_templates');
    console.log(`\n📊 共插入 ${templates.length} 个模板，数据库中现有 ${result[0].count} 个模板`);
    
    console.log('\n🎉 任务模板数据插入完成！');
    
  } catch (error) {
    console.error('❌ 插入模板数据失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  insertTaskTemplates().catch(console.error);
}

module.exports = { insertTaskTemplates };
