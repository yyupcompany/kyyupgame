/**
 * 教学中心种子数据生成脚本
 * 
 * 按照一学期的标准:
 * - 16节课程
 * - 16次梨园活动(户外训练)
 * - 8次外出表演(校外展示)
 * - 1次全员锦标赛
 */

const { Sequelize, DataTypes } = require('sequelize');
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

// 定义模型
const BrainScienceCourse = sequelize.define('BrainScienceCourse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_name: DataTypes.STRING,
  course_code: DataTypes.STRING,
  course_type: DataTypes.STRING,
  difficulty_level: DataTypes.STRING,
  target_age_group: DataTypes.STRING,
  course_description: DataTypes.TEXT,
  learning_objectives: DataTypes.TEXT,
  total_sessions: DataTypes.INTEGER,
  session_duration: DataTypes.INTEGER,
  is_active: DataTypes.BOOLEAN
}, { tableName: 'brain_science_courses', underscored: true });

const CoursePlan = sequelize.define('CoursePlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_id: DataTypes.INTEGER,
  class_id: DataTypes.INTEGER,
  semester: DataTypes.STRING,
  academic_year: DataTypes.STRING,
  teacher_id: DataTypes.INTEGER,
  total_sessions: DataTypes.INTEGER,
  completed_sessions: DataTypes.INTEGER,
  target_achievement_rate: DataTypes.INTEGER,
  plan_status: DataTypes.STRING,
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE
}, { tableName: 'course_plans', underscored: true });

const CourseProgress = sequelize.define('CourseProgress', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_plan_id: DataTypes.INTEGER,
  class_id: DataTypes.INTEGER,
  session_number: DataTypes.INTEGER,
  session_date: DataTypes.DATE,
  completion_status: DataTypes.STRING,
  teacher_confirmed: DataTypes.BOOLEAN,
  teacher_id: DataTypes.INTEGER,
  attendance_count: DataTypes.INTEGER,
  target_achieved_count: DataTypes.INTEGER,
  achievement_rate: DataTypes.INTEGER,
  session_content: DataTypes.TEXT,
  notes: DataTypes.TEXT,
  confirmed_at: DataTypes.DATE
}, { tableName: 'course_progress', underscored: true });

const OutdoorTrainingRecord = sequelize.define('OutdoorTrainingRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: DataTypes.INTEGER,
  semester: DataTypes.STRING,
  academic_year: DataTypes.STRING,
  week_number: DataTypes.INTEGER,
  training_date: DataTypes.DATE,
  training_type: DataTypes.STRING,
  activity_name: DataTypes.STRING,
  location: DataTypes.STRING,
  completion_status: DataTypes.STRING,
  participant_count: DataTypes.INTEGER,
  achievement_level: DataTypes.STRING,
  achievement_rate: DataTypes.INTEGER,
  weather_condition: DataTypes.STRING,
  activity_description: DataTypes.TEXT,
  teacher_id: DataTypes.INTEGER,
  confirmed_at: DataTypes.DATE
}, { tableName: 'outdoor_training_records', underscored: true });

const ExternalDisplayRecord = sequelize.define('ExternalDisplayRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: DataTypes.INTEGER,
  semester: DataTypes.STRING,
  academic_year: DataTypes.STRING,
  display_date: DataTypes.DATE,
  activity_type: DataTypes.STRING,
  activity_name: DataTypes.STRING,
  location: DataTypes.STRING,
  completion_status: DataTypes.STRING,
  participation_count: DataTypes.INTEGER,
  achievement_level: DataTypes.STRING,
  achievement_rate: DataTypes.INTEGER,
  budget_amount: DataTypes.DECIMAL,
  actual_cost: DataTypes.DECIMAL,
  transportation_method: DataTypes.STRING,
  safety_measures: DataTypes.TEXT,
  activity_description: DataTypes.TEXT,
  results_summary: DataTypes.TEXT,
  teacher_id: DataTypes.INTEGER,
  confirmed_at: DataTypes.DATE
}, { tableName: 'external_display_records', underscored: true });

const ChampionshipRecord = sequelize.define('ChampionshipRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  semester: DataTypes.STRING,
  academic_year: DataTypes.STRING,
  championship_date: DataTypes.DATE,
  championship_type: DataTypes.STRING,
  championship_name: DataTypes.STRING,
  description: DataTypes.TEXT,
  total_classes: DataTypes.INTEGER,
  total_participants: DataTypes.INTEGER,
  completion_status: DataTypes.STRING,
  brain_science_achievement_rate: DataTypes.INTEGER,
  course_content_achievement_rate: DataTypes.INTEGER,
  outdoor_training_achievement_rate: DataTypes.INTEGER,
  external_display_achievement_rate: DataTypes.INTEGER,
  overall_achievement_rate: DataTypes.INTEGER,
  awards_summary: DataTypes.TEXT,
  photos_count: DataTypes.INTEGER,
  videos_count: DataTypes.INTEGER,
  organizer_id: DataTypes.INTEGER,
  notes: DataTypes.TEXT
}, { tableName: 'championship_records', underscored: true });

const Class = sequelize.define('Class', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  currentStudentCount: { type: DataTypes.INTEGER, field: 'current_student_count' }
}, { tableName: 'classes', underscored: true });

const Teacher = sequelize.define('Teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: DataTypes.INTEGER
}, { tableName: 'teachers', underscored: true });

async function seedTeachingCenter() {
  try {
    console.log('🌱 开始生成教学中心种子数据...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 获取所有班级和教师
    const classes = await Class.findAll();
    const teachers = await Teacher.findAll();
    
    if (classes.length === 0 || teachers.length === 0) {
      console.log('⚠️  请先创建班级和教师数据');
      return;
    }
    
    console.log(`📚 找到 ${classes.length} 个班级和 ${teachers.length} 个教师`);
    
    // 获取或创建脑科学课程
    let course = await BrainScienceCourse.findOne({
      where: { course_name: '脑科学基础课程' }
    });
    
    if (!course) {
      course = await BrainScienceCourse.create({
        course_name: '脑科学基础课程',
        course_code: 'BSC001',
        course_type: '认知发展',
        difficulty_level: '中级',
        target_age_group: '3-6岁',
        course_description: '通过科学的方法培养儿童的认知能力和思维能力',
        learning_objectives: '提升儿童的观察力、记忆力、思维力',
        total_sessions: 16,
        session_duration: 45,
        is_active: true
      });
      console.log('✅ 创建脑科学课程');
    }
    
    // 当前学期信息
    const semester = '2024春季';
    const academicYear = '2024-2025';
    
    // 为每个班级生成数据
    for (const classItem of classes) {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      console.log(`\n📝 处理班级: ${classItem.name}`);
      
      // 1. 生成课程计划和进度 (16节课)
      await seedCoursePlan(classItem, course, teacher, semester, academicYear);
      
      // 2. 生成户外训练记录 (16次梨园活动)
      await seedOutdoorTraining(classItem, teacher, semester, academicYear);
      
      // 3. 生成校外展示记录 (8次外出表演)
      await seedExternalDisplay(classItem, teacher, semester, academicYear);
    }
    
    // 4. 生成全员锦标赛 (1次)
    await seedChampionship(classes, semester, academicYear);
    
    console.log('\n✅ 教学中心种子数据生成完成!');
  } catch (error) {
    console.error('❌ 生成教学中心种子数据失败:', error);
    throw error;
  }
}

async function seedCoursePlan(classItem, course, teacher, semester, academicYear) {
  // 检查是否已存在
  const existing = await CoursePlan.findOne({
    where: {
      class_id: classItem.id,
      course_id: course.id,
      semester,
      academic_year: academicYear
    }
  });
  
  if (existing) {
    console.log(`  ⏭️  课程计划已存在，跳过`);
    return;
  }
  
  // 创建课程计划
  const coursePlan = await CoursePlan.create({
    course_id: course.id,
    class_id: classItem.id,
    semester,
    academic_year: academicYear,
    teacher_id: teacher.id,
    total_sessions: 16,
    completed_sessions: 0,
    target_achievement_rate: 80,
    plan_status: 'active',
    start_date: new Date('2024-03-01'),
    end_date: new Date('2024-06-30')
  });
  
  // 生成16节课的进度记录
  const completedSessions = Math.floor(Math.random() * 5) + 12; // 12-16节已完成
  
  for (let i = 1; i <= 16; i++) {
    const isCompleted = i <= completedSessions;
    const attendanceCount = isCompleted ? Math.floor(Math.random() * 3) + (classItem.currentStudentCount || 20) - 2 : 0;
    const targetAchievedCount = isCompleted ? Math.floor(attendanceCount * (0.75 + Math.random() * 0.2)) : 0;
    const achievementRate = attendanceCount > 0 ? Math.round((targetAchievedCount / attendanceCount) * 100) : 0;
    
    await CourseProgress.create({
      course_plan_id: coursePlan.id,
      class_id: classItem.id,
      session_number: i,
      session_date: new Date(`2024-03-${String(i).padStart(2, '0')}`),
      completion_status: isCompleted ? 'completed' : 'pending',
      teacher_confirmed: isCompleted,
      teacher_id: isCompleted ? teacher.id : null,
      attendance_count: attendanceCount,
      target_achieved_count: targetAchievedCount,
      achievement_rate: achievementRate,
      session_content: isCompleted ? `第${i}节课程内容` : null,
      notes: isCompleted ? `课程进展顺利` : null,
      confirmed_at: isCompleted ? new Date() : null
    });
  }
  
  // 更新课程计划的完成课时数
  await coursePlan.update({ completed_sessions: completedSessions });
  
  console.log(`  ✅ 课程计划已创建 (${completedSessions}/16节已完成)`);
}

async function seedOutdoorTraining(classItem, teacher, semester, academicYear) {
  // 检查是否已存在
  const existingCount = await OutdoorTrainingRecord.count({
    where: {
      class_id: classItem.id,
      semester,
      academic_year: academicYear
    }
  });
  
  if (existingCount > 0) {
    console.log(`  ⏭️  户外训练记录已存在，跳过`);
    return;
  }
  
  const completedWeeks = Math.floor(Math.random() * 3) + 12; // 12-14周已完成
  
  for (let week = 1; week <= 16; week++) {
    const isCompleted = week <= completedWeeks;
    const participantCount = isCompleted ? Math.floor(Math.random() * 3) + (classItem.currentStudentCount || 20) - 2 : 0;
    const achievementRate = isCompleted ? Math.floor(Math.random() * 20) + 75 : 0; // 75-95%
    
    await OutdoorTrainingRecord.create({
      class_id: classItem.id,
      semester,
      academic_year: academicYear,
      week_number: week,
      training_date: new Date(`2024-03-${String(week).padStart(2, '0')}`),
      training_type: week % 2 === 0 ? 'outdoor_training' : 'departure_display',
      activity_name: `第${week}周${week % 2 === 0 ? '户外训练' : '离园展示'}`,
      location: '幼儿园梨园',
      completion_status: isCompleted ? 'completed' : 'pending',
      participant_count: participantCount,
      achievement_level: isCompleted ? (achievementRate >= 85 ? 'excellent' : achievementRate >= 75 ? 'good' : 'average') : null,
      achievement_rate: achievementRate,
      weather_condition: isCompleted ? (Math.random() > 0.2 ? 'sunny' : 'cloudy') : null,
      activity_description: isCompleted ? `本周活动内容丰富，学生表现积极` : null,
      teacher_id: isCompleted ? teacher.id : null,
      confirmed_at: isCompleted ? new Date() : null
    });
  }
  
  console.log(`  ✅ 户外训练记录已创建 (${completedWeeks}/16周已完成)`);
}

async function seedExternalDisplay(classItem, teacher, semester, academicYear) {
  // 检查是否已存在
  const existingCount = await ExternalDisplayRecord.count({
    where: {
      class_id: classItem.id,
      semester,
      academic_year: academicYear
    }
  });
  
  if (existingCount > 0) {
    console.log(`  ⏭️  校外展示记录已存在，跳过`);
    return;
  }
  
  const locations = ['市文化中心', '社区广场', '公园', '博物馆', '图书馆', '科技馆', '艺术中心', '体育馆'];
  const activityTypes = ['performance', 'exhibition', 'competition', 'visit'];
  const completedCount = Math.floor(Math.random() * 2) + 6; // 6-7次已完成
  
  for (let i = 1; i <= 8; i++) {
    const isCompleted = i <= completedCount;
    const participantCount = isCompleted ? Math.floor(Math.random() * 5) + (classItem.currentStudentCount || 20) - 3 : 0;
    const achievementRate = isCompleted ? Math.floor(Math.random() * 15) + 80 : 0; // 80-95%
    
    await ExternalDisplayRecord.create({
      class_id: classItem.id,
      semester,
      academic_year: academicYear,
      display_date: new Date(`2024-0${Math.floor(i / 2) + 3}-${(i % 2) * 15 + 5}`),
      activity_type: activityTypes[i % activityTypes.length],
      activity_name: `第${i}次校外展示活动`,
      location: locations[i - 1],
      completion_status: isCompleted ? 'completed' : 'pending',
      participation_count: participantCount,
      achievement_level: isCompleted ? (achievementRate >= 90 ? 'excellent' : achievementRate >= 80 ? 'good' : 'average') : null,
      achievement_rate: achievementRate,
      budget_amount: 2000 + Math.floor(Math.random() * 3000),
      actual_cost: isCompleted ? 1800 + Math.floor(Math.random() * 2500) : null,
      transportation_method: '校车',
      safety_measures: '配备安全员，购买保险',
      activity_description: isCompleted ? `活动圆满成功，学生表现优秀` : null,
      results_summary: isCompleted ? `获得了良好的社会反响` : null,
      teacher_id: isCompleted ? teacher.id : null,
      confirmed_at: isCompleted ? new Date() : null
    });
  }
  
  console.log(`  ✅ 校外展示记录已创建 (${completedCount}/8次已完成)`);
}

async function seedChampionship(classes, semester, academicYear) {
  // 检查是否已存在
  const existing = await ChampionshipRecord.findOne({
    where: { semester, academic_year: academicYear }
  });
  
  if (existing) {
    console.log('\n  ⏭️  全员锦标赛记录已存在，跳过');
    return;
  }
  
  const totalParticipants = classes.reduce((sum, c) => sum + (c.currentStudentCount || 20), 0);
  
  await ChampionshipRecord.create({
    semester,
    academic_year: academicYear,
    championship_date: new Date('2024-06-15'),
    championship_type: 'comprehensive',
    championship_name: '2024春季全员锦标赛',
    description: '本学期综合能力展示锦标赛',
    total_classes: classes.length,
    total_participants: totalParticipants,
    completion_status: 'completed',
    brain_science_achievement_rate: 85,
    course_content_achievement_rate: 88,
    outdoor_training_achievement_rate: 82,
    external_display_achievement_rate: 86,
    overall_achievement_rate: 85,
    awards_summary: '优秀班级3个，优秀学生50名',
    photos_count: 120,
    videos_count: 15,
    organizer_id: null,
    notes: '活动圆满成功'
  });
  
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

