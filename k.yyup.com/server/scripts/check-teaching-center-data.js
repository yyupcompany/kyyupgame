/**
 * 检查教学中心数据脚本
 * 用于验证课程中心的数据是否从数据库真实获取
 */

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

async function checkTeachingCenterData() {
  try {
    console.log('🔍 开始检查教学中心数据...\n');

    // 1. 检查脑科学课程数据
    console.log('📚 检查脑科学课程数据:');
    const [courses] = await sequelize.query(`
      SELECT id, course_name, course_type, difficulty_level, is_active, created_at
      FROM brain_science_courses
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log(`  - 总课程数: ${courses.length}`);
    if (courses.length > 0) {
      console.log('  - 最新课程:');
      courses.forEach(course => {
        console.log(`    * ID: ${course.id}, 名称: ${course.course_name}, 类型: ${course.course_type}, 难度: ${course.difficulty_level}`);
      });
    }
    console.log('');

    // 2. 检查课程计划数据
    console.log('📋 检查课程计划数据:');
    const [coursePlans] = await sequelize.query(`
      SELECT cp.id, cp.semester, cp.academic_year, cp.total_sessions, cp.plan_status,
             bsc.course_name, c.name as class_name
      FROM course_plans cp
      LEFT JOIN brain_science_courses bsc ON cp.course_id = bsc.id
      LEFT JOIN classes c ON cp.class_id = c.id
      ORDER BY cp.created_at DESC
      LIMIT 5
    `);
    console.log(`  - 总计划数: ${coursePlans.length}`);
    if (coursePlans.length > 0) {
      console.log('  - 最新计划:');
      coursePlans.forEach(plan => {
        console.log(`    * ID: ${plan.id}, 课程: ${plan.course_name}, 班级: ${plan.class_name}, 学期: ${plan.semester}, 状态: ${plan.plan_status}`);
      });
    }
    console.log('');

    // 3. 检查课程进度数据
    console.log('📊 检查课程进度数据:');
    const [courseProgress] = await sequelize.query(`
      SELECT cp.id, cp.session_number, cp.completion_status, cp.achievement_rate, 
             cp.teacher_confirmed, cp.session_date
      FROM course_progress cp
      ORDER BY cp.created_at DESC
      LIMIT 5
    `);
    console.log(`  - 总进度记录数: ${courseProgress.length}`);
    if (courseProgress.length > 0) {
      console.log('  - 最新进度:');
      courseProgress.forEach(progress => {
        console.log(`    * ID: ${progress.id}, 课次: ${progress.session_number}, 状态: ${progress.completion_status}, 达标率: ${progress.achievement_rate}%, 教师确认: ${progress.teacher_confirmed ? '是' : '否'}`);
      });
    }
    console.log('');

    // 4. 检查户外训练数据
    console.log('🏃 检查户外训练数据:');
    const [outdoorTraining] = await sequelize.query(`
      SELECT otr.id, otr.training_type, otr.training_date, otr.week_number,
             otr.completion_status, otr.achievement_rate,
             c.name as class_name
      FROM outdoor_training_records otr
      LEFT JOIN classes c ON otr.class_id = c.id
      ORDER BY otr.created_at DESC
      LIMIT 5
    `);
    console.log(`  - 总训练记录数: ${outdoorTraining.length}`);
    if (outdoorTraining.length > 0) {
      console.log('  - 最新训练:');
      outdoorTraining.forEach(training => {
        console.log(`    * ID: ${training.id}, 类型: ${training.training_type}, 班级: ${training.class_name}, 周数: ${training.week_number}, 状态: ${training.completion_status}, 达标率: ${training.achievement_rate}%`);
      });
    }
    console.log('');

    // 5. 检查校外展示数据
    console.log('🎭 检查校外展示数据:');
    const [externalDisplay] = await sequelize.query(`
      SELECT edr.id, edr.display_type, edr.display_date, edr.display_location,
             edr.achievement_rate, edr.achievement_level,
             c.name as class_name
      FROM external_display_records edr
      LEFT JOIN classes c ON edr.class_id = c.id
      ORDER BY edr.created_at DESC
      LIMIT 5
    `);
    console.log(`  - 总展示记录数: ${externalDisplay.length}`);
    if (externalDisplay.length > 0) {
      console.log('  - 最新展示:');
      externalDisplay.forEach(display => {
        console.log(`    * ID: ${display.id}, 类型: ${display.display_type}, 班级: ${display.class_name}, 地点: ${display.display_location}, 等级: ${display.achievement_level || 'N/A'}, 达标率: ${display.achievement_rate}%`);
      });
    }
    console.log('');

    // 6. 检查锦标赛数据
    console.log('🏆 检查锦标赛数据:');
    const [championships] = await sequelize.query(`
      SELECT id, championship_name, championship_type, championship_date,
             completion_status, overall_achievement_rate
      FROM championship_records
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log(`  - 总锦标赛数: ${championships.length}`);
    if (championships.length > 0) {
      console.log('  - 最新锦标赛:');
      championships.forEach(championship => {
        console.log(`    * ID: ${championship.id}, 名称: ${championship.championship_name}, 类型: ${championship.championship_type}, 状态: ${championship.completion_status}, 总达标率: ${championship.overall_achievement_rate}%`);
      });
    }
    console.log('');

    // 7. 统计汇总
    console.log('📈 数据统计汇总:');
    const [stats] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM brain_science_courses WHERE is_active = 1) as active_courses,
        (SELECT COUNT(*) FROM course_plans) as total_plans,
        (SELECT COUNT(*) FROM course_progress) as total_progress,
        (SELECT COUNT(*) FROM outdoor_training_records) as total_outdoor,
        (SELECT COUNT(*) FROM external_display_records) as total_display,
        (SELECT COUNT(*) FROM championship_records) as total_championships
    `);
    
    if (stats.length > 0) {
      const summary = stats[0];
      console.log(`  - 活跃课程数: ${summary.active_courses}`);
      console.log(`  - 课程计划数: ${summary.total_plans}`);
      console.log(`  - 进度记录数: ${summary.total_progress}`);
      console.log(`  - 户外训练数: ${summary.total_outdoor}`);
      console.log(`  - 校外展示数: ${summary.total_display}`);
      console.log(`  - 锦标赛数: ${summary.total_championships}`);
    }
    console.log('');

    // 8. 检查权限配置
    console.log('🔐 检查权限配置:');
    const [permissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path
      FROM permissions
      WHERE code LIKE '%TEACHING%'
      ORDER BY sort
    `);
    console.log(`  - 教学中心相关权限数: ${permissions.length}`);
    if (permissions.length > 0) {
      console.log('  - 权限列表:');
      permissions.forEach(perm => {
        console.log(`    * ${perm.chinese_name} (${perm.code}) - ${perm.type} - ${perm.path || 'N/A'}`);
      });
    }
    console.log('');

    console.log('✅ 数据检查完成！');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// 运行检查
checkTeachingCenterData();

