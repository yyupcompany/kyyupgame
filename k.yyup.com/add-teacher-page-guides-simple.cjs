const { Sequelize, QueryTypes } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function addTeacherPageGuides() {
  try {
    console.log('📖 开始为教师中心页面添加页面感知服务...');
    
    // 定义教师中心页面的说明文档（适配现有表结构）
    const teacherPageGuides = [
      {
        page_path: '/teacher-center',
        page_name: '教师中心',
        page_description: '教师专用工作中心，提供教学管理、任务跟踪、活动组织等功能',
        context_prompt: '教师中心是教师专用工作空间，提供教学管理、任务跟踪、活动组织等功能。包含工作台、通知中心、任务中心、活动中心、招生中心、教学中心、客户跟踪等模块。',
        category: 'teacher',
        importance: 9,
        is_active: 1
      },
      
      {
        page_path: '/teacher-center/dashboard',
        page_name: '教师工作台',
        page_description: '教师日常工作的主控制面板，显示任务、课程、通知等关键信息',
        context_prompt: '教师工作台是个人工作控制中心，显示任务统计、课程信息、活动提醒、通知中心等关键信息。提供快捷操作如上传教学媒体、创建任务、查看课程表等功能。',
        category: 'teacher',
        importance: 10,
        is_active: 1
      },
      
      {
        page_path: '/teacher-center/tasks',
        page_name: '任务中心',
        page_description: '管理教学任务，跟踪工作进度，提高工作效率',
        context_prompt: '任务中心用于高效管理教学任务，包括创建任务、设置优先级、跟踪进度、批量操作等功能。支持教学任务、管理任务、个人任务分类管理。',
        category: 'teacher',
        importance: 8,
        is_active: 1
      },
      
      {
        page_path: '/teacher-center/notifications',
        page_name: '通知中心',
        page_description: '接收和管理学校通知、系统消息和重要提醒',
        context_prompt: '通知中心用于接收重要信息，包括系统通知、学校通知、个人消息等。支持消息管理、通知设置、移动端访问等功能。',
        category: 'teacher',
        importance: 7,
        is_active: 1
      },
      
      {
        page_path: '/teacher-center/activities',
        page_name: '活动中心',
        page_description: '参与学校活动组织，管理活动相关事务',
        context_prompt: '活动中心用于参与学校活动，包括教学活动、文体活动、节日活动、社会实践等。支持活动管理、日程安排、统计分析、规划申请等功能。',
        category: 'teacher',
        importance: 8,
        is_active: 1
      },
      
      {
        page_path: '/teacher-center/enrollment',
        page_name: '招生中心',
        page_description: '协助学校招生工作，管理潜在学生信息',
        context_prompt: '招生中心用于协助学校招生工作，包括咨询接待、信息收集、学生管理、沟通跟进等功能。支持招生数据统计和分析。',
        category: 'teacher',
        importance: 6,
        is_active: 1
      },
      
      {
        page_path: '/teacher-center/teaching',
        page_name: '教学中心',
        page_description: '管理教学资源，制定教学计划，记录教学成果',
        context_prompt: '教学中心是教学管理中心，包括教学资源管理、教学计划制定、学生管理、教学评估等功能。支持教学改进和专业发展。',
        category: 'teacher',
        importance: 9,
        is_active: 1
      },
      
      {
        page_path: '/teacher-center/customer-tracking',
        page_name: '客户跟踪',
        page_description: '跟踪家长沟通记录，维护良好的家校关系',
        context_prompt: '客户跟踪用于建立和维护家校关系，包括家长管理、沟通管理、跟踪记录、关系维护等功能。促进家校合作，共同关注学生成长。',
        category: 'teacher',
        importance: 7,
        is_active: 1
      }
    ];
    
    console.log(`\n📝 准备添加 ${teacherPageGuides.length} 个页面说明文档...`);
    
    let addedCount = 0;
    let updatedCount = 0;
    
    // 添加页面说明文档到数据库
    for (const guide of teacherPageGuides) {
      // 检查是否已存在
      const existing = await sequelize.query(`
        SELECT id FROM page_guides WHERE page_path = ?
      `, { 
        replacements: [guide.page_path],
        type: QueryTypes.SELECT 
      });
      
      if (existing.length > 0) {
        // 更新现有记录
        await sequelize.query(`
          UPDATE page_guides 
          SET page_name = ?, page_description = ?, context_prompt = ?, 
              category = ?, importance = ?, is_active = ?, updated_at = NOW()
          WHERE page_path = ?
        `, { 
          replacements: [
            guide.page_name, guide.page_description, guide.context_prompt,
            guide.category, guide.importance, guide.is_active, guide.page_path
          ]
        });
        console.log(`🔄 更新页面说明: ${guide.page_name}`);
        updatedCount++;
      } else {
        // 插入新记录
        await sequelize.query(`
          INSERT INTO page_guides (page_path, page_name, page_description, context_prompt, category, importance, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, { 
          replacements: [
            guide.page_path, guide.page_name, guide.page_description, guide.context_prompt,
            guide.category, guide.importance, guide.is_active
          ]
        });
        console.log(`✅ 新增页面说明: ${guide.page_name}`);
        addedCount++;
      }
    }
    
    console.log(`\n📊 页面说明文档统计:`);
    console.log(`- 新增文档: ${addedCount}`);
    console.log(`- 更新文档: ${updatedCount}`);
    console.log(`- 总计文档: ${addedCount + updatedCount}`);
    
    // 验证结果
    console.log('\n🔍 验证添加结果...');
    const teacherGuides = await sequelize.query(`
      SELECT id, page_path, page_name, category, importance, is_active
      FROM page_guides
      WHERE category = 'teacher'
      ORDER BY page_path
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📋 教师中心页面说明文档:');
    console.table(teacherGuides);
    
    console.log('\n🎉 教师中心页面感知服务添加完成！');
    console.log('📝 现在教师用户可以通过AI助手的"查看页面帮助"功能查看页面说明');
    
  } catch (error) {
    console.error('❌ 添加页面说明文档失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 运行添加
addTeacherPageGuides();
