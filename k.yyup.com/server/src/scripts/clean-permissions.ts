import { initDatabase, closeDatabase } from '../config/database';
import { QueryTypes } from 'sequelize';

/**
 * 清理和规范化权限数据
 * 删除测试页面，规范菜单名称，整理菜单结构
 */

// 需要删除的测试页面和开发页面
const TEST_PAGES_TO_DELETE = [
  '403', '404', 'ExamplePage', 'Login', 'StandardTemplate',
  'GlobalStyleTest', 'ImageUploaderDemo', 'TemplateDemo',
  'Application', 'Marketing', 'Enrollment-plan'
];

// 需要删除的技术性页面（包含特殊字符或技术路径）
const TECHNICAL_PATHS_TO_DELETE = [
  '/demo/', '/_id', '/id', '/:id', '/detail/_id', '/analytics/:id',
  '/detail/:id', '/performance/:id', '/smart-management/:id',
  '/students/id', '/teachers/id'
];

// 需要重命名的菜单项（英文改中文）
const MENU_RENAME_MAP = {
  'ActivityCreate': '创建活动',
  'ActivityDetail': '活动详情',
  'ActivityEdit': '编辑活动',
  'ActivityForm': '活动表单',
  'ActivityList': '活动列表',
  'ActivityAnalytics': '活动分析',
  'Intelligent-analysis': '智能分析',
  'ActivityEvaluation': '活动评估',
  'ActivityOptimizer': '活动优化',
  'ActivityPlanner': '活动规划',
  'RegistrationDashboard': '报名管理',
  'Advertisement': '广告管理',
  'AIAssistantPage': 'AI助手',
  'ChatInterface': '聊天界面',
  'ExpertConsultationPage': '专家咨询',
  'MemoryManagementPage': '记忆管理',
  'ModelManagementPage': '模型管理',
  'ReportBuilder': '报表构建',
  'Analytics': '数据分析',
  'ApplicationDetail': '申请详情',
  'ApplicationList': '申请列表',
  'ApplicationInterview': '申请面试',
  'ApplicationReview': '申请审核',
  'Chat': '聊天',
  'ClassAnalytics': '班级分析',
  'ClassDetailDialog': '班级详情',
  'ClassFormDialog': '班级表单',
  'ClassDetail': '班级详情',
  'ClassOptimization': '班级优化',
  'SmartManagement': '智能管理',
  'CustomerAnalytics': '客户分析',
  'CustomerDetail': '客户详情',
  'Customer': '客户管理',
  'TeacherDetail': '教师详情',
  'TeacherEdit': '编辑教师',
  'TeacherList': '教师列表',
  'TeacherDevelopment': '教师发展',
  'TeacherEvaluation': '教师评估',
  'TeacherPerformance': '教师绩效',
  'StudentAnalytics': '学生分析',
  'StudentAssessment': '学生评估',
  'StudentDetail': '学生详情',
  'StudentGrowth': '学生成长'
};

async function cleanPermissions() {
  let sequelize;
  try {
    console.log('🧹 开始清理权限数据...');

    // 初始化数据库连接
    sequelize = await initDatabase();
    console.log('✅ 数据库连接成功');

    // 1. 删除测试页面
    console.log('📝 删除测试页面...');
    for (const testPage of TEST_PAGES_TO_DELETE) {
      await sequelize.query(`
        DELETE FROM permissions 
        WHERE name = :testPage OR path LIKE :pathPattern
      `, {
        replacements: { 
          testPage, 
          pathPattern: `%${testPage}%` 
        },
        type: QueryTypes.DELETE
      });
    }

    // 2. 删除技术性路径页面
    console.log('🔧 删除技术性路径页面...');
    for (const techPath of TECHNICAL_PATHS_TO_DELETE) {
      await sequelize.query(`
        DELETE FROM permissions 
        WHERE path LIKE :pathPattern
      `, {
        replacements: { 
          pathPattern: `%${techPath}%` 
        },
        type: QueryTypes.DELETE
      });
    }

    // 3. 重命名英文菜单为中文
    console.log('🈶 重命名英文菜单为中文...');
    for (const [englishName, chineseName] of Object.entries(MENU_RENAME_MAP)) {
      await sequelize.query(`
        UPDATE permissions 
        SET name = :chineseName 
        WHERE name = :englishName
      `, {
        replacements: { 
          englishName, 
          chineseName 
        },
        type: QueryTypes.UPDATE
      });
    }

    // 4. 删除重复的分类
    console.log('🗂️ 删除重复的分类...');
    
    // 保留主要的分类，删除重复的
    const duplicateCategories = [
      { keep: '仪表板', delete: ['dashboard', 'Dashboard'] },
      { keep: '系统管理', delete: ['system', 'System'] },
      { keep: '活动管理', delete: ['activity', 'Activity'] },
      { keep: '招生管理', delete: ['enrollment', 'Enrollment'] }
    ];

    for (const { keep, delete: toDelete } of duplicateCategories) {
      // 获取要保留的分类ID
      const [keepCategory] = await sequelize.query(`
        SELECT id FROM permissions 
        WHERE name = :keepName AND type = 'category'
        LIMIT 1
      `, {
        replacements: { keepName: keep },
        type: QueryTypes.SELECT
      }) as any[];

      if (keepCategory) {
        const keepId = keepCategory.id;

        // 将重复分类下的子项移动到保留的分类下
        for (const deleteName of toDelete) {
          await sequelize.query(`
            UPDATE permissions 
            SET parentId = :keepId 
            WHERE parentId IN (
              SELECT id FROM (
                SELECT id FROM permissions 
                WHERE name = :deleteName AND type = 'category'
              ) AS temp
            )
          `, {
            replacements: { keepId, deleteName },
            type: QueryTypes.UPDATE
          });

          // 删除重复的分类
          await sequelize.query(`
            DELETE FROM permissions 
            WHERE name = :deleteName AND type = 'category'
          `, {
            replacements: { deleteName },
            type: QueryTypes.DELETE
          });
        }
      }
    }

    // 5. 清理空的分类
    console.log('🗑️ 清理空的分类...');
    await sequelize.query(`
      DELETE FROM permissions 
      WHERE type = 'category' 
      AND id NOT IN (
        SELECT DISTINCT parentId 
        FROM permissions 
        WHERE parentId IS NOT NULL
      )
    `, {
      type: QueryTypes.DELETE
    });

    // 6. 重新整理排序
    console.log('📊 重新整理排序...');
    const mainMenus = [
      { name: '仪表板', sort: 1 },
      { name: '用户管理', sort: 10 },
      { name: '招生管理', sort: 20 },
      { name: '活动管理', sort: 30 },
      { name: 'AI助手', sort: 40 },
      { name: '数据分析', sort: 50 },
      { name: '系统管理', sort: 90 }
    ];

    for (const menu of mainMenus) {
      await sequelize.query(`
        UPDATE permissions 
        SET sort = :sort 
        WHERE name = :name AND parentId IS NULL
      `, {
        replacements: menu,
        type: QueryTypes.UPDATE
      });
    }

    console.log('✅ 权限数据清理完成！');

    // 显示清理后的菜单结构
    const cleanedMenus = await sequelize.query(`
      SELECT id, name, path, type, parentId, sort
      FROM permissions 
      WHERE status = 1 
      ORDER BY sort, id
    `, {
      type: QueryTypes.SELECT
    });

    console.log('📋 清理后的菜单结构:');
    console.log(JSON.stringify(cleanedMenus, null, 2));

  } catch (error) {
    console.error('❌ 清理权限数据失败:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    if (sequelize) {
      await closeDatabase();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanPermissions()
    .then(() => {
      console.log('🎉 权限清理脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 权限清理脚本执行失败:', error);
      process.exit(1);
    });
}

export { cleanPermissions };
