/**
 * 教学中心完整种子数据生成脚本
 * 
 * 数据规格:
 * - 一学期16节课程
 * - 16次梨园活动(户外训练)
 * - 8次外出表演(校外展示)
 * - 1次全员锦标赛
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 当前学期配置
const CURRENT_SEMESTER = '2024春季';
const CURRENT_ACADEMIC_YEAR = '2024-2025';

// 课程类型
const COURSE_TYPES = ['脑科学课程', '体能训练', '艺术课程', '语言课程'];
const DIFFICULTY_LEVELS = ['初级', '中级', '高级'];

// 活动类型
const ACTIVITY_TYPES = ['梨园活动', '户外训练', '校外展示', '锦标赛'];

async function main() {
  try {
    console.log('🚀 开始生成教学中心种子数据...\n');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 获取现有数据
    const [classes] = await sequelize.query('SELECT id, name FROM classes WHERE deleted_at IS NULL LIMIT 5');
    const [teachers] = await sequelize.query('SELECT id FROM teachers WHERE deleted_at IS NULL LIMIT 3');
    
    if (classes.length === 0) {
      console.log('⚠️  警告: 数据库中没有班级数据,请先运行基础数据种子脚本');
      process.exit(1);
    }

    if (teachers.length === 0) {
      console.log('⚠️  警告: 数据库中没有教师数据,请先运行基础数据种子脚本');
      process.exit(1);
    }

    console.log(`📊 找到 ${classes.length} 个班级, ${teachers.length} 个教师\n`);

    // 1. 创建脑科学课程 (16门课程)
    console.log('📚 步骤 1/5: 创建16门脑科学课程...');
    const courseIds = [];
    for (let i = 1; i <= 16; i++) {
      const courseType = COURSE_TYPES[i % COURSE_TYPES.length];
      const difficulty = DIFFICULTY_LEVELS[Math.floor(i / 6) % DIFFICULTY_LEVELS.length];
      
      const [result] = await sequelize.query(`
        INSERT INTO brain_science_courses 
        (course_name, course_code, course_type, difficulty_level, description, created_at, updated_at)
        VALUES 
        ('${courseType}第${i}课', 'BSC${String(i).padStart(3, '0')}', '${courseType}', '${difficulty}', 
         '本学期第${i}节课程,主要内容包括${courseType}相关知识和技能训练', NOW(), NOW())
      `);
      courseIds.push(result);
    }
    console.log(`✅ 成功创建 ${courseIds.length} 门课程\n`);

    // 2. 为每个班级创建课程计划
    console.log('📋 步骤 2/5: 为每个班级创建课程计划...');
    let planCount = 0;
    const planIds = [];
    
    for (const classInfo of classes) {
      for (let i = 0; i < 16; i++) {
        const weekNumber = i + 1;
        const teacherId = teachers[i % teachers.length].id;
        
        const [result] = await sequelize.query(`
          INSERT INTO course_plans 
          (course_id, class_id, teacher_id, semester, academic_year, week_number, 
           planned_date, status, created_at, updated_at)
          VALUES 
          (${i + 1}, ${classInfo.id}, ${teacherId}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}', 
           ${weekNumber}, DATE_ADD(CURDATE(), INTERVAL ${weekNumber} WEEK), 'in_progress', NOW(), NOW())
        `);
        planIds.push(result);
        planCount++;
      }
    }
    console.log(`✅ 成功创建 ${planCount} 个课程计划\n`);

    // 3. 创建课程进度记录 (部分已完成)
    console.log('📈 步骤 3/5: 创建课程进度记录...');
    let progressCount = 0;
    
    for (let i = 0; i < planIds.length; i++) {
      // 前60%的课程标记为已完成
      const isCompleted = i < planIds.length * 0.6;
      const completionRate = isCompleted ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50);
      const achievementRate = isCompleted ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 40) + 50;
      
      await sequelize.query(`
        INSERT INTO course_progress 
        (course_plan_id, completion_status, completion_rate, achievement_rate, 
         actual_completion_date, notes, created_at, updated_at)
        VALUES 
        (${planIds[i]}, '${isCompleted ? 'completed' : 'in_progress'}', ${completionRate}, ${achievementRate},
         ${isCompleted ? 'NOW()' : 'NULL'}, '课程进展${isCompleted ? '顺利' : '正常'}', NOW(), NOW())
      `);
      progressCount++;
    }
    console.log(`✅ 成功创建 ${progressCount} 条课程进度记录\n`);

    // 4. 创建户外训练记录 (16次梨园活动)
    console.log('🏃 步骤 4/5: 创建16次户外训练记录...');
    let outdoorCount = 0;
    
    for (const classInfo of classes) {
      for (let i = 1; i <= 16; i++) {
        const weekNumber = i;
        const participantCount = Math.floor(Math.random() * 10) + 20;
        const achievementRate = Math.floor(Math.random() * 20) + 75;
        const isCompleted = i <= 12; // 前12周已完成
        
        await sequelize.query(`
          INSERT INTO outdoor_training_records 
          (class_id, semester, academic_year, week_number, training_date, activity_name,
           location, participant_count, achievement_rate, completion_status, notes, created_at, updated_at)
          VALUES 
          (${classInfo.id}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}', ${weekNumber},
           DATE_ADD(CURDATE(), INTERVAL ${weekNumber} WEEK), '梨园活动第${i}期',
           '幼儿园梨园', ${participantCount}, ${achievementRate}, '${isCompleted ? 'completed' : 'planned'}',
           '${classInfo.name}第${i}次户外训练活动', NOW(), NOW())
        `);
        outdoorCount++;
      }
    }
    console.log(`✅ 成功创建 ${outdoorCount} 条户外训练记录\n`);

    // 5. 创建校外展示记录 (8次外出表演)
    console.log('🎭 步骤 5/5: 创建8次校外展示记录...');
    let displayCount = 0;
    
    const displayLocations = ['市文化中心', '区图书馆', '社区活动中心', '公园广场'];
    const displayTypes = ['文艺演出', '成果展示', '互动表演', '才艺展示'];
    
    for (const classInfo of classes) {
      for (let i = 1; i <= 8; i++) {
        const location = displayLocations[i % displayLocations.length];
        const displayType = displayTypes[i % displayTypes.length];
        const participantCount = Math.floor(Math.random() * 15) + 15;
        const achievementRate = Math.floor(Math.random() * 15) + 80;
        const isCompleted = i <= 5; // 前5次已完成
        
        await sequelize.query(`
          INSERT INTO external_display_records 
          (class_id, semester, academic_year, display_date, activity_name, display_type,
           location, participant_count, achievement_rate, completion_status, 
           audience_count, media_coverage, notes, created_at, updated_at)
          VALUES 
          (${classInfo.id}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}',
           DATE_ADD(CURDATE(), INTERVAL ${i * 2} WEEK), '${displayType}活动${i}',
           '${displayType}', '${location}', ${participantCount}, ${achievementRate},
           '${isCompleted ? 'completed' : 'planned'}', ${Math.floor(Math.random() * 100) + 50},
           ${isCompleted ? 1 : 0}, '${classInfo.name}第${i}次校外展示', NOW(), NOW())
        `);
        displayCount++;
      }
    }
    console.log(`✅ 成功创建 ${displayCount} 条校外展示记录\n`);

    // 6. 创建锦标赛记录 (1次全员锦标赛)
    console.log('🏆 步骤 6/6: 创建全员锦标赛记录...');
    
    const [championshipResult] = await sequelize.query(`
      INSERT INTO championship_records 
      (semester, academic_year, championship_name, championship_date, location,
       total_participants, completion_status, brain_science_achievement_rate,
       course_content_achievement_rate, outdoor_training_achievement_rate,
       external_display_achievement_rate, overall_achievement_rate,
       awards_summary, notes, created_at, updated_at)
      VALUES 
      ('${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}', '${CURRENT_SEMESTER}全员锦标赛',
       DATE_ADD(CURDATE(), INTERVAL 15 WEEK), '幼儿园大礼堂',
       ${classes.length * 25}, 'planned', 85, 88, 82, 79, 83.5,
       '本学期全员参与的综合能力锦标赛', '涵盖脑科学、课程内容、户外训练和校外展示四个维度', NOW(), NOW())
    `);
    console.log(`✅ 成功创建锦标赛记录\n`);

    // 统计总结
    console.log('📊 数据生成完成统计:');
    console.log(`   - 脑科学课程: ${courseIds.length} 门`);
    console.log(`   - 课程计划: ${planCount} 个`);
    console.log(`   - 课程进度: ${progressCount} 条`);
    console.log(`   - 户外训练: ${outdoorCount} 次`);
    console.log(`   - 校外展示: ${displayCount} 次`);
    console.log(`   - 锦标赛: 1 次`);
    console.log('\n✅ 教学中心种子数据生成完成!\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

