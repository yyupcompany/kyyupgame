/**
 * 教学中心种子数据生成脚本 V3
 * 使用正确的字段名
 * 
 * 数据规格:
 * - 一学期16节课程
 * - 16次梨园活动(户外训练)
 * - 8次外出表演(校外展示)
 * - 1次全员锦标赛
 */

const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 导入初始化模块
const { sequelize } = require('../dist/init');

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

    // 获取一个有效的用户ID用于created_by字段
    const [users] = await sequelize.query('SELECT id FROM users LIMIT 1');
    const createdBy = users.length > 0 ? users[0].id : 1;

    // 3. 创建16节脑科学课程
    console.log('📚 步骤3: 创建16节脑科学课程...');
    const courseTypes = ['core', 'extended', 'special'];

    for (let i = 1; i <= 16; i++) {
      const courseType = courseTypes[(i - 1) % courseTypes.length];
      const difficultyLevel = Math.min(5, Math.floor((i - 1) / 4) + 1);

      await sequelize.query(`
        INSERT INTO brain_science_courses
        (course_name, course_description, course_type, difficulty_level, frequency_per_week, is_active, created_at, updated_at)
        VALUES
        ('脑科学课程第${i}课', '本学期第${i}节课程', '${courseType}', ${difficultyLevel}, 1, 1, NOW(), NOW())
      `);

      if (i % 4 === 0) {
        console.log(`   已创建 ${i}/16 节课程...`);
      }
    }
    console.log(`✅ 成功创建 16 节脑科学课程\n`);

    // 获取刚创建的课程ID
    const [courses] = await sequelize.query(`
      SELECT id FROM brain_science_courses ORDER BY id DESC LIMIT 16
    `);
    const courseIds = courses.map(c => c.id).reverse(); // 反转以获得正确的顺序

    // 4. 为每个班级创建课程计划和进度
    console.log('📋 步骤4: 为每个班级创建课程计划和进度...');
    let totalPlans = 0;
    let totalProgress = 0;
    
    for (const classItem of classes) {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      // 为每个班级创建16个课程计划
      for (let i = 1; i <= 16; i++) {
        const courseId = courseIds[i - 1]; // 使用实际的课程ID
        const isCompleted = i <= 10; // 前10节课已完成
        
        // 创建课程计划
        await sequelize.query(`
          INSERT INTO course_plans
          (course_id, class_id, semester, academic_year,
           planned_start_date, planned_end_date, total_sessions, completed_sessions,
           plan_status, target_achievement_rate, actual_achievement_rate,
           created_by, created_at, updated_at)
          VALUES
          (${courseId}, ${classItem.id}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}',
           DATE_ADD(CURDATE(), INTERVAL ${i - 1} WEEK), DATE_ADD(CURDATE(), INTERVAL ${i} WEEK),
           1, ${isCompleted ? 1 : 0}, '${isCompleted ? 'completed' : 'active'}',
           85, ${isCompleted ? (75 + Math.floor(Math.random() * 25)) : 0},
           ${teacher.id}, NOW(), NOW())
        `);

        totalPlans++;

        // 如果课程已完成,创建进度记录
        if (isCompleted) {
          // 获取刚插入的课程计划ID
          const [[lastPlan]] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`);
          const planId = lastPlan.id;

          const achievementRate = 75 + Math.floor(Math.random() * 25); // 75-100%
          const attendanceCount = 28 + Math.floor(Math.random() * 3); // 28-30人
          const targetAchievedCount = Math.floor(attendanceCount * achievementRate / 100);

          await sequelize.query(`
            INSERT INTO course_progress
            (course_plan_id, class_id, session_number, session_date,
             completion_status, teacher_confirmed, attendance_count, target_achieved_count,
             achievement_rate, has_class_media, class_media_count, has_student_media,
             student_media_count, media_upload_required, teacher_id, confirmed_at,
             created_at, updated_at)
            VALUES
            (${planId}, ${classItem.id}, 1, DATE_ADD(CURDATE(), INTERVAL ${i - 1} WEEK),
             'completed', 1, ${attendanceCount}, ${targetAchievedCount},
             ${achievementRate}, 1, 2, 1, 5, 1, ${teacher.id}, NOW(), NOW(), NOW())
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
        const achievementRate = isCompleted ? (70 + Math.floor(Math.random() * 30)) : 0;
        const attendanceCount = isCompleted ? (26 + Math.floor(Math.random() * 4)) : 0;
        const targetAchievedCount = isCompleted ? Math.floor(attendanceCount * achievementRate / 100) : 0;
        
        await sequelize.query(`
          INSERT INTO outdoor_training_records
          (class_id, semester, academic_year, week_number, training_type,
           training_date, completion_status, participation_count, achievement_count,
           achievement_rate, weather_condition, training_content, teacher_id, confirmed_at, created_at, updated_at)
          VALUES
          (${classItem.id}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}',
           ${weekNumber}, 'outdoor_training', DATE_ADD(CURDATE(), INTERVAL ${weekNumber - 1} WEEK),
           '${isCompleted ? 'completed' : 'not_started'}', ${attendanceCount}, ${targetAchievedCount},
           ${achievementRate}, '晴天', '校园梨园户外训练活动', ${teacher.id}, ${isCompleted ? 'NOW()' : 'NULL'}, NOW(), NOW())
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
        
        const displayTypes = ['performance', 'exhibition', 'competition', 'visit'];
        const displayType = displayTypes[(i - 1) % displayTypes.length];
        const eventNames = ['社区表演', '文化节', '公益活动', '校际交流'];
        const eventName = eventNames[(i - 1) % eventNames.length];
        const achievementLevels = ['excellent', 'good', 'average'];
        const achievementLevel = isCompleted ? achievementLevels[Math.floor(Math.random() * achievementLevels.length)] : null;
        
        const achievementRate = isCompleted ? (75 + Math.floor(Math.random() * 20)) : 0;

        await sequelize.query(`
          INSERT INTO external_display_records
          (class_id, semester, academic_year, display_date, display_type,
           display_location, participation_count, achievement_level, achievement_rate,
           has_media, media_count, display_content, teacher_id, organizer, created_by, created_at, updated_at)
          VALUES
          (${classItem.id}, '${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}',
           DATE_ADD(CURDATE(), INTERVAL ${i * 2} WEEK), '${displayType}',
           '${eventName}场地', ${24 + Math.floor(Math.random() * 4)},
           ${achievementLevel ? `'${achievementLevel}'` : 'NULL'}, ${achievementRate},
           ${isCompleted ? 1 : 0}, ${isCompleted ? (3 + Math.floor(Math.random() * 5)) : 0},
           '${eventName}活动内容', ${teacher.id}, '幼儿园', ${createdBy}, NOW(), NOW())
        `);
        
        totalExternalDisplay++;
      }
    }
    console.log(`✅ 成功创建 ${totalExternalDisplay} 条校外展示记录\n`);

    // 7. 创建1次全员锦标赛记录
    console.log('🏆 步骤7: 创建全员锦标赛记录...');
    
    await sequelize.query(`
      INSERT INTO championship_records
      (semester, academic_year, championship_date, championship_type, championship_name,
       total_participants, completion_status,
       brain_science_achievement_rate, course_content_achievement_rate,
       outdoor_training_achievement_rate, external_display_achievement_rate,
       overall_achievement_rate, has_media, media_count, summary, created_by,
       created_at, updated_at)
      VALUES
      ('${CURRENT_SEMESTER}', '${CURRENT_ACADEMIC_YEAR}',
       DATE_ADD(CURDATE(), INTERVAL 15 WEEK), 'semester', '本学期全员锦标赛',
       ${classes.length * 30}, 'completed',
       85, 88, 82, 79, 83.5, 1, 25, '本学期全员锦标赛圆满结束', ${createdBy}, NOW(), NOW())
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

