import { CoursePlan } from '../models/course-plan.model';
import { CourseProgress } from '../models/course-progress.model';
import { OutdoorTrainingRecord } from '../models/outdoor-training-record.model';
import { ExternalDisplayRecord } from '../models/external-display-record.model';
import { ChampionshipRecord } from '../models/championship-record.model';
import { BrainScienceCourse } from '../models/brain-science-course.model';
import { Class } from '../models/class.model';
import { Teacher } from '../models/teacher.model';

/**
 * 教学中心种子数据生成器
 * 
 * 按照一学期的标准:
 * - 16节课程
 * - 16次梨园活动(户外训练)
 * - 8次外出表演(校外展示)
 * - 1次全员锦标赛
 */
export class TeachingCenterSeeder {
  
  /**
   * 生成教学中心完整数据
   */
  public static async seed() {
    try {
      console.log('🌱 开始生成教学中心种子数据...');
      
      // 获取所有班级和教师
      const classes = await Class.findAll();
      const teachers = await Teacher.findAll();
      
      if (classes.length === 0 || teachers.length === 0) {
        console.log('⚠️ 请先创建班级和教师数据');
        return;
      }
      
      // 获取或创建脑科学课程
      const course = await this.getOrCreateCourse();
      
      // 当前学期信息
      const semester = '2024春季';
      const academicYear = '2024-2025';
      
      // 为每个班级生成数据
      for (const classItem of classes) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        
        // 1. 生成课程计划和进度 (16节课)
        await this.seedCoursePlan(classItem, course, teacher, semester, academicYear);
        
        // 2. 生成户外训练记录 (16次梨园活动)
        await this.seedOutdoorTraining(classItem, teacher, semester, academicYear);
        
        // 3. 生成校外展示记录 (8次外出表演)
        await this.seedExternalDisplay(classItem, teacher, semester, academicYear);
      }
      
      // 4. 生成全员锦标赛 (1次)
      await this.seedChampionship(classes, semester, academicYear);
      
      console.log('✅ 教学中心种子数据生成完成!');
    } catch (error) {
      console.error('❌ 生成教学中心种子数据失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取或创建脑科学课程
   */
  private static async getOrCreateCourse() {
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
      } as any);
    }
    
    return course;
  }
  
  /**
   * 生成课程计划和进度 (16节课)
   */
  private static async seedCoursePlan(
    classItem: Class,
    course: BrainScienceCourse,
    teacher: Teacher,
    semester: string,
    academicYear: string
  ) {
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
      console.log(`  ⏭️  班级 ${classItem.name} 的课程计划已存在，跳过`);
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
    } as any);
    
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
      } as any);
    }
    
    // 更新课程计划的完成课时数
    await coursePlan.update({ completed_sessions: completedSessions });
    
    console.log(`  ✅ 班级 ${classItem.name} 的课程计划已创建 (${completedSessions}/16节已完成)`);
  }
  
  /**
   * 生成户外训练记录 (16次梨园活动)
   */
  private static async seedOutdoorTraining(
    classItem: Class,
    teacher: Teacher,
    semester: string,
    academicYear: string
  ) {
    // 检查是否已存在
    const existingCount = await OutdoorTrainingRecord.count({
      where: {
        class_id: classItem.id,
        semester,
        academic_year: academicYear
      }
    });
    
    if (existingCount > 0) {
      console.log(`  ⏭️  班级 ${classItem.name} 的户外训练记录已存在，跳过`);
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
      } as any);
    }
    
    console.log(`  ✅ 班级 ${classItem.name} 的户外训练记录已创建 (${completedWeeks}/16周已完成)`);
  }
  
  /**
   * 生成校外展示记录 (8次外出表演)
   */
  private static async seedExternalDisplay(
    classItem: Class,
    teacher: Teacher,
    semester: string,
    academicYear: string
  ) {
    // 检查是否已存在
    const existingCount = await ExternalDisplayRecord.count({
      where: {
        class_id: classItem.id,
        semester,
        academic_year: academicYear
      }
    });
    
    if (existingCount > 0) {
      console.log(`  ⏭️  班级 ${classItem.name} 的校外展示记录已存在，跳过`);
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
      } as any);
    }
    
    console.log(`  ✅ 班级 ${classItem.name} 的校外展示记录已创建 (${completedCount}/8次已完成)`);
  }
  
  /**
   * 生成全员锦标赛 (1次)
   */
  private static async seedChampionship(
    classes: Class[],
    semester: string,
    academicYear: string
  ) {
    // 检查是否已存在
    const existing = await ChampionshipRecord.findOne({
      where: { semester, academic_year: academicYear }
    });
    
    if (existing) {
      console.log('  ⏭️  全员锦标赛记录已存在，跳过');
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
    } as any);
    
    console.log('  ✅ 全员锦标赛记录已创建');
  }
  
  /**
   * 清空教学中心数据
   */
  public static async clear() {
    try {
      console.log('🗑️  开始清空教学中心数据...');
      
      await CourseProgress.destroy({ where: {}, truncate: true });
      await CoursePlan.destroy({ where: {}, truncate: true });
      await OutdoorTrainingRecord.destroy({ where: {}, truncate: true });
      await ExternalDisplayRecord.destroy({ where: {}, truncate: true });
      await ChampionshipRecord.destroy({ where: {}, truncate: true });
      
      console.log('✅ 教学中心数据已清空');
    } catch (error) {
      console.error('❌ 清空教学中心数据失败:', error);
      throw error;
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  (async () => {
    try {
      const { sequelize } = require('../models');
      await sequelize.authenticate();
      console.log('✅ 数据库连接成功');
      await TeachingCenterSeeder.seed();
      await sequelize.close();
      process.exit(0);
    } catch (error) {
      console.error('❌ 错误:', error);
      process.exit(1);
    }
  })();
}

