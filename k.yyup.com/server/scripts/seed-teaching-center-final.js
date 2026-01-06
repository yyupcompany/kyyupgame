/**
 * 教学中心种子数据生成脚本
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
  process.env.DB_PASSWORD || 'Yyup@2024',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00'
  }
);

// 课程类型
const COURSE_TYPES = ['基础训练', '技能提升', '综合实践', '创新思维'];
const DIFFICULTY_LEVELS = ['初级', '中级', '高级'];

// 当前学期配置
const CURRENT_SEMESTER = '2024-2025-1';
const CURRENT_ACADEMIC_YEAR = '2024-2025';

async function seedTeachingCenterData() {
  try {
    console.log('🌱 开始生成教学中心种子数据...\n');

    // 1. 获取所有班级
    console.log('📋 步骤1: 获取班级数据...');
    const [classes] = await sequelize.query(`
      SELECT id, name FROM classes WHERE deleted_at IS NULL LIMIT 10
    `);
    console.log(`✅ 找到 ${classes.length} 个班级\n`);

    if (classes.length === 0) {
      console.log('⚠️  没有找到班级数据,请先创建班级');
      return;
    }

    // 2. 获取所有教师
    console.log('📋 步骤2: 获取教师数据...');
    const [teachers] = await sequelize.query(`
      SELECT id FROM teachers WHERE deleted_at IS NULL LIMIT 20
    `);
    console.log(`✅ 找到 ${teachers.length} 个教师\n`);

    if (teachers.length === 0) {
      console.log('⚠️  没有找到教师数据,请先创建教师');
      return;
    }

    // 3. 创建16节脑科学课程
    console.log('📚 步骤3: 创建16节脑科学课程...');
    const courseIds = [];
    
    for (let i = 1; i <= 16; i++) {
      const courseType = COURSE_TYPES[(i - 1) % COURSE_TYPES.length];
      const difficulty = DIFFICULTY_LEVELS[Math.floor((i - 1) / 6) % DIFFICULTY_LEVELS.length];
      
      const [result] = await sequelize.query(`
        INSERT INTO brain_science_courses 
        (course_name, course_type, difficulty_level, description, duration_weeks, created_at, updated_at)
        VALUES 
        ('${courseType}第${i}课', '${courseType}', '${difficulty}', 
         '本学期第${i}节课程,主要内容包括${courseType}相关知识和技能训练', 1, NOW(), NOW())
      `);
      
      courseIds.push(result);
      
      if (i % 4 === 0) {
        console.log(`   已创建 ${i}/16 节课程...`);
      }
    }
    console.log(`✅ 成功创建 16 节脑科学课程\n`);

    // 4. 为每个班级创建课程计划和进度
    console.log('📋 步骤4: 为每个班级创建课程计划和进度...');
    let totalPlans = 0;
    let totalProgress = 0;
    
    for (const classItem of classes) {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      // 为每个班级创建16个课程计划
      for (let i = 1; i <= 16; i++) {
        const courseId = i;
        const weekNumber = i;
        const isCompleted = i <= 10; // 前10节课已完成
        
        const [planResult] = await sequelize.query(`
          INSERT INTO course_plans 
          (class_id, course_id, teacher_id, semester, academic_year, week_number, 
           planned_date, status, created_at, updated_at)
          VALUES 
          (${classItem.id}, ${courseId}, ${teacher.id}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}', 
           ${weekNumber}, DATE_ADD(CURDATE(), INTERVAL ${weekNumber - 1} WEEK), 
           '${isCompleted ? 'completed' : 'planned'}', NOW(), NOW())
        `);
        
        totalPlans++;
        
        // 如果课程已完成,创建进度记录
        if (isCompleted) {
          const completionRate = 80 + Math.floor(Math.random() * 20); // 80-100%
          const achievementRate = 75 + Math.floor(Math.random() * 25); // 75-100%
          
          await sequelize.query(`
            INSERT INTO course_progress 
            (plan_id, class_id, course_id, completion_rate, achievement_rate, 
             student_count, completed_count, notes, created_at, updated_at)
            VALUES 
            (${planResult}, ${classItem.id}, ${courseId}, ${completionRate}, ${achievementRate}, 
             30, ${Math.floor(30 * achievementRate / 100)}, 
             '第${i}节课程进度记录', NOW(), NOW())
          `);
          
          totalProgress++;
        }
      }
    }
    console.log(`✅ 成功创建 ${totalPlans} 个课程计划`);
    console.log(`✅ 成功创建 ${totalProgress} 个课程进度记录\n`);

    // 5. 为每个班级创建16次户外训练记录(梨园活动)
    console.log('🏃 步骤5: 创建16次户外训练记录(梨园活动)...');
    let totalOutdoorTraining = 0;
    
    for (const classItem of classes) {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      for (let i = 1; i <= 16; i++) {
        const weekNumber = i;
        const isCompleted = i <= 12; // 前12次已完成
        const completionRate = isCompleted ? (70 + Math.floor(Math.random() * 30)) : 0;
        
        await sequelize.query(`
          INSERT INTO outdoor_training_records 
          (class_id, teacher_id, semester, academic_year, week_number, 
           training_date, training_type, location, participant_count, 
           completion_rate, status, notes, created_at, updated_at)
          VALUES 
          (${classItem.id}, ${teacher.id}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}', 
           ${weekNumber}, DATE_ADD(CURDATE(), INTERVAL ${weekNumber - 1} WEEK), 
           '梨园活动', '校园梨园', 28, ${completionRate}, 
           '${isCompleted ? 'completed' : 'planned'}', 
           '第${i}周户外训练活动', NOW(), NOW())
        `);
        
        totalOutdoorTraining++;
      }
    }
    console.log(`✅ 成功创建 ${totalOutdoorTraining} 条户外训练记录\n`);

    // 6. 为每个班级创建8次校外展示记录(外出表演)
    console.log('🎭 步骤6: 创建8次校外展示记录(外出表演)...');
    let totalExternalDisplay = 0;
    
    for (const classItem of classes) {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      for (let i = 1; i <= 8; i++) {
        const isCompleted = i <= 5; // 前5次已完成
        const achievementRate = isCompleted ? (75 + Math.floor(Math.random() * 25)) : 0;
        
        const displayTypes = ['社区表演', '文化节', '公益活动', '校际交流'];
        const displayType = displayTypes[(i - 1) % displayTypes.length];
        
        await sequelize.query(`
          INSERT INTO external_display_records 
          (class_id, teacher_id, semester, academic_year, display_date, 
           display_type, location, participant_count, achievement_rate, 
           status, notes, created_at, updated_at)
          VALUES 
          (${classItem.id}, ${teacher.id}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}', 
           DATE_ADD(CURDATE(), INTERVAL ${i * 2} WEEK), '${displayType}', 
           '${displayType}场地', 25, ${achievementRate}, 
           '${isCompleted ? 'completed' : 'planned'}', 
           '第${i}次校外展示活动', NOW(), NOW())
        `);
        
        totalExternalDisplay++;
      }
    }
    console.log(`✅ 成功创建 ${totalExternalDisplay} 条校外展示记录\n`);

    // 7. 创建1次全员锦标赛记录
    console.log('🏆 步骤7: 创建全员锦标赛记录...');
    
    await sequelize.query(`
      INSERT INTO championship_records 
      (semester, academic_year, championship_date, championship_type, 
       total_participants, total_classes, brain_science_achievement_rate, 
       course_content_achievement_rate, outdoor_training_achievement_rate, 
       external_display_achievement_rate, overall_achievement_rate, 
       status, notes, created_at, updated_at)
      VALUES 
      ('${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}', 
       DATE_ADD(CURDATE(), INTERVAL 15 WEEK), '全员锦标赛', 
       ${classes.length * 30}, ${classes.length}, 85, 88, 82, 79, 83.5, 
       'completed', '本学期全员锦标赛活动', NOW(), NOW())
    `);
    
    console.log(`✅ 成功创建 1 条锦标赛记录\n`);

    console.log('🎉 教学中心种子数据生成完成!\n');
    console.log('📊 数据统计:');
    console.log(`   - 脑科学课程: 16 节`);
    console.log(`   - 课程计划: ${totalPlans} 个`);
    console.log(`   - 课程进度: ${totalProgress} 个`);
    console.log(`   - 户外训练: ${totalOutdoorTraining} 次`);
    console.log(`   - 校外展示: ${totalExternalDisplay} 次`);
    console.log(`   - 锦标赛: 1 次`);
    
  } catch (error) {
    console.error('❌ 生成种子数据时出错:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行种子数据生成
seedTeachingCenterData()
  .then(() => {
    console.log('\n✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });

