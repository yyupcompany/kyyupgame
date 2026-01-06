/**
 * 教学中心种子数据生成脚本 (简化版 - 使用SQL)
 * 
 * 按照一学期的标准:
 * - 16节课程
 * - 16次梨园活动(户外训练)
 * - 8次外出表演(校外展示)
 * - 1次全员锦标赛
 */

const { Sequelize } = require('sequelize');
const { getDatabaseConfig } = require('../dist/config/database-unified');

// 创建数据库连接
const dbConfig = getDatabaseConfig();
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  timezone: dbConfig.timezone,
  logging: false
});

async function seedTeachingCenter() {
  try {
    console.log('🌱 开始生成教学中心种子数据...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 当前学期信息
    const semester = '2024春季';
    const academicYear = '2024-2025';
    
    // 获取所有班级
    const [classes] = await sequelize.query('SELECT id, name, current_student_count FROM classes WHERE deleted_at IS NULL LIMIT 10');
    
    // 获取所有教师
    const [teachers] = await sequelize.query('SELECT id FROM teachers WHERE deleted_at IS NULL LIMIT 10');
    
    if (classes.length === 0 || teachers.length === 0) {
      console.log('⚠️  请先创建班级和教师数据');
      return;
    }
    
    console.log(`📚 找到 ${classes.length} 个班级和 ${teachers.length} 个教师`);
    
    // 获取或创建脑科学课程
    let [courses] = await sequelize.query(`SELECT id FROM brain_science_courses WHERE course_name = '脑科学基础课程' LIMIT 1`);
    
    let courseId;
    if (courses.length === 0) {
      await sequelize.query(`
        INSERT INTO brain_science_courses (course_name, course_description, course_type, target_age_min, target_age_max, duration_minutes, difficulty_level, is_active)
        VALUES ('脑科学基础课程', '通过科学的方法培养儿童的认知能力和思维能力', 'core', 3, 6, 45, 2, 1)
      `);
      [courses] = await sequelize.query(`SELECT id FROM brain_science_courses WHERE course_name = '脑科学基础课程' LIMIT 1`);
      console.log('✅ 创建脑科学课程');
    }
    courseId = courses[0].id;
    
    // 为每个班级生成数据
    for (const classItem of classes) {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      console.log(`\n📝 处理班级: ${classItem.name}`);
      
      // 1. 生成课程计划和进度 (16节课)
      await seedCoursePlan(classItem, courseId, teacher.id, semester, academicYear);
      
      // 2. 生成户外训练记录 (16次梨园活动)
      await seedOutdoorTraining(classItem, teacher.id, semester, academicYear);
      
      // 3. 生成校外展示记录 (8次外出表演)
      await seedExternalDisplay(classItem, teacher.id, semester, academicYear);
    }
    
    // 4. 生成全员锦标赛 (1次)
    await seedChampionship(classes.length, classes.reduce((sum, c) => sum + (c.current_student_count || 20), 0), semester, academicYear);
    
    console.log('\n✅ 教学中心种子数据生成完成!');
  } catch (error) {
    console.error('❌ 生成教学中心种子数据失败:', error);
    throw error;
  }
}

async function seedCoursePlan(classItem, courseId, teacherId, semester, academicYear) {
  // 检查是否已存在
  const [existing] = await sequelize.query(`
    SELECT id FROM course_plans 
    WHERE class_id = ${classItem.id} AND course_id = ${courseId} AND semester = '${semester}' AND academic_year = '${academicYear}'
    LIMIT 1
  `);
  
  if (existing.length > 0) {
    console.log(`  ⏭️  课程计划已存在，跳过`);
    return;
  }
  
  // 创建课程计划
  await sequelize.query(`
    INSERT INTO course_plans (course_id, class_id, semester, academic_year, teacher_id, total_sessions, completed_sessions, target_achievement_rate, plan_status, start_date, end_date)
    VALUES (${courseId}, ${classItem.id}, '${semester}', '${academicYear}', ${teacherId}, 16, 0, 80, 'active', '2024-03-01', '2024-06-30')
  `);
  
  const [plans] = await sequelize.query(`SELECT id FROM course_plans WHERE class_id = ${classItem.id} AND course_id = ${courseId} AND semester = '${semester}' ORDER BY id DESC LIMIT 1`);
  const planId = plans[0].id;
  
  // 生成16节课的进度记录
  const completedSessions = Math.floor(Math.random() * 5) + 12; // 12-16节已完成
  
  for (let i = 1; i <= 16; i++) {
    const isCompleted = i <= completedSessions;
    const attendanceCount = isCompleted ? Math.floor(Math.random() * 3) + (classItem.current_student_count || 20) - 2 : 0;
    const targetAchievedCount = isCompleted ? Math.floor(attendanceCount * (0.75 + Math.random() * 0.2)) : 0;
    const achievementRate = attendanceCount > 0 ? Math.round((targetAchievedCount / attendanceCount) * 100) : 0;
    
    await sequelize.query(`
      INSERT INTO course_progress (course_plan_id, class_id, session_number, session_date, completion_status, teacher_confirmed, teacher_id, attendance_count, target_achieved_count, achievement_rate, session_content, notes, confirmed_at)
      VALUES (${planId}, ${classItem.id}, ${i}, '2024-03-${String(i).padStart(2, '0')}', '${isCompleted ? 'completed' : 'pending'}', ${isCompleted ? 1 : 0}, ${isCompleted ? teacherId : 'NULL'}, ${attendanceCount}, ${targetAchievedCount}, ${achievementRate}, ${isCompleted ? `'第${i}节课程内容'` : 'NULL'}, ${isCompleted ? `'课程进展顺利'` : 'NULL'}, ${isCompleted ? 'NOW()' : 'NULL'})
    `);
  }
  
  // 更新课程计划的完成课时数
  await sequelize.query(`UPDATE course_plans SET completed_sessions = ${completedSessions} WHERE id = ${planId}`);
  
  console.log(`  ✅ 课程计划已创建 (${completedSessions}/16节已完成)`);
}

async function seedOutdoorTraining(classItem, teacherId, semester, academicYear) {
  // 检查是否已存在
  const [existing] = await sequelize.query(`
    SELECT COUNT(*) as count FROM outdoor_training_records 
    WHERE class_id = ${classItem.id} AND semester = '${semester}' AND academic_year = '${academicYear}'
  `);
  
  if (existing[0].count > 0) {
    console.log(`  ⏭️  户外训练记录已存在，跳过`);
    return;
  }
  
  const completedWeeks = Math.floor(Math.random() * 3) + 12; // 12-14周已完成
  
  for (let week = 1; week <= 16; week++) {
    const isCompleted = week <= completedWeeks;
    const participantCount = isCompleted ? Math.floor(Math.random() * 3) + (classItem.current_student_count || 20) - 2 : 0;
    const achievementRate = isCompleted ? Math.floor(Math.random() * 20) + 75 : 0; // 75-95%
    const achievementLevel = isCompleted ? (achievementRate >= 85 ? 'excellent' : achievementRate >= 75 ? 'good' : 'average') : 'NULL';
    
    await sequelize.query(`
      INSERT INTO outdoor_training_records (class_id, semester, academic_year, week_number, training_date, training_type, activity_name, location, completion_status, participant_count, achievement_level, achievement_rate, weather_condition, activity_description, teacher_id, confirmed_at)
      VALUES (${classItem.id}, '${semester}', '${academicYear}', ${week}, '2024-03-${String(week).padStart(2, '0')}', '${week % 2 === 0 ? 'outdoor_training' : 'departure_display'}', '第${week}周${week % 2 === 0 ? '户外训练' : '离园展示'}', '幼儿园梨园', '${isCompleted ? 'completed' : 'pending'}', ${participantCount}, ${isCompleted ? `'${achievementLevel}'` : 'NULL'}, ${achievementRate}, ${isCompleted ? (Math.random() > 0.2 ? "'sunny'" : "'cloudy'") : 'NULL'}, ${isCompleted ? "'本周活动内容丰富，学生表现积极'" : 'NULL'}, ${isCompleted ? teacherId : 'NULL'}, ${isCompleted ? 'NOW()' : 'NULL'})
    `);
  }
  
  console.log(`  ✅ 户外训练记录已创建 (${completedWeeks}/16周已完成)`);
}

async function seedExternalDisplay(classItem, teacherId, semester, academicYear) {
  // 检查是否已存在
  const [existing] = await sequelize.query(`
    SELECT COUNT(*) as count FROM external_display_records 
    WHERE class_id = ${classItem.id} AND semester = '${semester}' AND academic_year = '${academicYear}'
  `);
  
  if (existing[0].count > 0) {
    console.log(`  ⏭️  校外展示记录已存在，跳过`);
    return;
  }
  
  const locations = ['市文化中心', '社区广场', '公园', '博物馆', '图书馆', '科技馆', '艺术中心', '体育馆'];
  const activityTypes = ['performance', 'exhibition', 'competition', 'visit'];
  const completedCount = Math.floor(Math.random() * 2) + 6; // 6-7次已完成
  
  for (let i = 1; i <= 8; i++) {
    const isCompleted = i <= completedCount;
    const participantCount = isCompleted ? Math.floor(Math.random() * 5) + (classItem.current_student_count || 20) - 3 : 0;
    const achievementRate = isCompleted ? Math.floor(Math.random() * 15) + 80 : 0; // 80-95%
    const achievementLevel = isCompleted ? (achievementRate >= 90 ? 'excellent' : achievementRate >= 80 ? 'good' : 'average') : 'NULL';
    const budgetAmount = 2000 + Math.floor(Math.random() * 3000);
    const actualCost = isCompleted ? 1800 + Math.floor(Math.random() * 2500) : 'NULL';
    
    await sequelize.query(`
      INSERT INTO external_display_records (class_id, semester, academic_year, display_date, activity_type, activity_name, location, completion_status, participation_count, achievement_level, achievement_rate, budget_amount, actual_cost, transportation_method, safety_measures, activity_description, results_summary, teacher_id, confirmed_at)
      VALUES (${classItem.id}, '${semester}', '${academicYear}', '2024-0${Math.floor(i / 2) + 3}-${(i % 2) * 15 + 5}', '${activityTypes[i % activityTypes.length]}', '第${i}次校外展示活动', '${locations[i - 1]}', '${isCompleted ? 'completed' : 'pending'}', ${participantCount}, ${isCompleted ? `'${achievementLevel}'` : 'NULL'}, ${achievementRate}, ${budgetAmount}, ${actualCost}, '校车', '配备安全员，购买保险', ${isCompleted ? "'活动圆满成功，学生表现优秀'" : 'NULL'}, ${isCompleted ? "'获得了良好的社会反响'" : 'NULL'}, ${isCompleted ? teacherId : 'NULL'}, ${isCompleted ? 'NOW()' : 'NULL'})
    `);
  }
  
  console.log(`  ✅ 校外展示记录已创建 (${completedCount}/8次已完成)`);
}

async function seedChampionship(totalClasses, totalParticipants, semester, academicYear) {
  // 检查是否已存在
  const [existing] = await sequelize.query(`
    SELECT id FROM championship_records 
    WHERE semester = '${semester}' AND academic_year = '${academicYear}'
    LIMIT 1
  `);
  
  if (existing.length > 0) {
    console.log('\n  ⏭️  全员锦标赛记录已存在，跳过');
    return;
  }
  
  await sequelize.query(`
    INSERT INTO championship_records (semester, academic_year, championship_date, championship_type, championship_name, description, total_classes, total_participants, completion_status, brain_science_achievement_rate, course_content_achievement_rate, outdoor_training_achievement_rate, external_display_achievement_rate, overall_achievement_rate, awards_summary, photos_count, videos_count, notes)
    VALUES ('${semester}', '${academicYear}', '2024-06-15', 'comprehensive', '2024春季全员锦标赛', '本学期综合能力展示锦标赛', ${totalClasses}, ${totalParticipants}, 'completed', 85, 88, 82, 86, 85, '优秀班级3个，优秀学生50名', 120, 15, '活动圆满成功')
  `);
  
  console.log('\n  ✅ 全员锦标赛记录已创建');
}

// 运行脚本
seedTeachingCenter()
  .then(() => {
    console.log('\n🎉 所有数据生成完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  });

