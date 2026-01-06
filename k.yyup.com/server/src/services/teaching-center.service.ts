import { Op, fn, col } from 'sequelize';
import CoursePlan from '../models/course-plan.model';
import BrainScienceCourse from '../models/brain-science-course.model';
import CourseProgress from '../models/course-progress.model';
import TeachingMediaRecord from '../models/teaching-media-record.model';
import OutdoorTrainingRecord from '../models/outdoor-training-record.model';
import ExternalDisplayRecord from '../models/external-display-record.model';
import ChampionshipRecord from '../models/championship-record.model';
import { Class } from '../models/class.model';
import { Student } from '../models/student.model';
import { Teacher } from '../models/teacher.model';
import { FileStorage } from '../models/file-storage.model';

/**
 * 教学中心服务类
 */
export class TeachingCenterService {

  /**
   * 获取课程进度统计数据
   */
  public static async getCourseProgressStats(filters: {
    semester?: string;
    academic_year?: string;
    class_id?: number;
  }) {
    try {
      // 检查输入参数
      if (!filters || typeof filters !== 'object') {
        filters = {};
      }

      const whereCondition: any = {};
      if (filters.semester) whereCondition.semester = filters.semester;
      if (filters.academic_year) whereCondition.academic_year = filters.academic_year;
      if (filters.class_id) whereCondition.class_id = filters.class_id;

      console.log('📚 获取课程进度统计数据，过滤条件:', filters);

      // 查询课程计划
      const coursePlans = await CoursePlan.findAll({
        where: whereCondition
      });

      // 计算总体统计
      let totalSessions = 0;
      let completedSessions = 0;
      let confirmedSessions = 0;
      let totalAchievementRate = 0;
      let plansWithMedia = 0;

      const coursePlanStats = await Promise.all(
        coursePlans.map(async (plan) => {
          // 获取该计划的所有进度记录
          const progressRecords = await CourseProgress.findAll({
            where: { course_plan_id: plan.id }
          });

          const completed = progressRecords.filter(p => p.completion_status === 'completed').length;
          const confirmed = progressRecords.filter(p => p.teacher_confirmed).length;
          const avgAchievement = progressRecords.length > 0
            ? Math.round(progressRecords.reduce((sum, p) => sum + (p.achievement_rate || 0), 0) / progressRecords.length)
            : 0;

          totalSessions += plan.total_sessions || 0;
          completedSessions += completed;
          confirmedSessions += confirmed;
          totalAchievementRate += avgAchievement;

          // 检查是否有媒体记录
          const hasMedia = progressRecords.some(p => p.has_class_media || p.has_student_media);
          if (hasMedia) plansWithMedia++;

          return {
            plan_id: plan.id,
            course_id: plan.course_id,
            class_id: plan.class_id,
            semester: plan.semester,
            academic_year: plan.academic_year,
            total_sessions: plan.total_sessions,
            completed_sessions: completed,
            confirmed_sessions: confirmed,
            completion_rate: plan.total_sessions > 0 ? Math.round((completed / plan.total_sessions) * 100) : 0,
            confirmation_rate: plan.total_sessions > 0 ? Math.round((confirmed / plan.total_sessions) * 100) : 0,
            avg_achievement_rate: avgAchievement,
            plan_status: plan.plan_status,
            has_media: hasMedia,
            media_stats: {
              class_photo: progressRecords.reduce((sum, p) => sum + (p.class_media_count || 0), 0),
              class_video: 0, // 需要从媒体记录表统计
              student_photo: progressRecords.reduce((sum, p) => sum + (p.student_media_count || 0), 0),
              student_video: 0
            }
          };
        })
      );

      const activePlans = coursePlans.filter(p => p.plan_status === 'active').length;
      const completedPlans = coursePlans.filter(p => p.plan_status === 'completed').length;
      const overallCompletionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
      const overallConfirmationRate = totalSessions > 0 ? Math.round((confirmedSessions / totalSessions) * 100) : 0;
      const overallAchievementRate = coursePlans.length > 0 ? Math.round(totalAchievementRate / coursePlans.length) : 0;

      return {
        overall_stats: {
          total_plans: coursePlans.length,
          active_plans: activePlans,
          completed_plans: completedPlans,
          total_sessions: totalSessions,
          completed_sessions: completedSessions,
          confirmed_sessions: confirmedSessions,
          overall_completion_rate: overallCompletionRate,
          overall_confirmation_rate: overallConfirmationRate,
          overall_achievement_rate: overallAchievementRate,
          plans_with_media: plansWithMedia
        },
        course_plans: coursePlanStats
      };
    } catch (error) {
      console.error('Error in getCourseProgressStats:', error);
      throw error;
    }
  }

  /**
   * 获取单个课程计划的进度统计
   */
  private static async getCoursePlanProgress(plan: any) {
    // 检查输入参数
    if (!plan || !plan.id) {
      throw new Error('Invalid course plan provided');
    }

    // 获取该计划的所有进度记录
    const progressRecords = await CourseProgress.findAll({
      where: { course_plan_id: plan.id },
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'name']
        }
      ]
    });

    // 计算统计数据，添加null/undefined检查
    const totalSessions = plan.total_sessions || 0;
    const completedSessions = progressRecords.filter(p => p.completion_status === 'completed').length;
    const confirmedSessions = progressRecords.filter(p => p.teacher_confirmed).length;
    const totalAttendance = progressRecords.reduce((sum, p) => sum + (p.attendance_count || 0), 0);
    const totalAchieved = progressRecords.reduce((sum, p) => sum + (p.target_achieved_count || 0), 0);
    const avgAchievementRate = totalAttendance > 0 ? (totalAchieved / totalAttendance) * 100 : 0;

    // 媒体统计
    const mediaStats = await this.getMediaStats(progressRecords.map(p => p.id));

    return {
      plan_id: plan.id,
      course: plan.course,
      class: plan.class,
      semester: plan.semester,
      academic_year: plan.academic_year,
      total_sessions: totalSessions,
      completed_sessions: completedSessions,
      confirmed_sessions: confirmedSessions,
      completion_rate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      confirmation_rate: totalSessions > 0 ? Math.round((confirmedSessions / totalSessions) * 100) : 0,
      avg_achievement_rate: Math.round(avgAchievementRate * 100) / 100,
      target_achievement_rate: plan.target_achievement_rate,
      actual_achievement_rate: plan.actual_achievement_rate,
      media_count: mediaStats || { class_photo: 0, class_video: 0, student_photo: 0, student_video: 0 },
      has_media: mediaStats ? Object.values(mediaStats).some((count: number) => count > 0) : false,
      plan_status: plan.plan_status,
      progress_records: progressRecords.map(record => ({
        id: record.id,
        session_number: record.session_number,
        session_date: record.session_date,
        completion_status: record.completion_status,
        teacher_confirmed: record.teacher_confirmed,
        attendance_count: record.attendance_count,
        target_achieved_count: record.target_achieved_count,
        achievement_rate: record.achievement_rate,
        has_class_media: record.has_class_media,
        class_media_count: record.class_media_count,
        has_student_media: record.has_student_media,
        student_media_count: record.student_media_count,
        teacher: record.teacher,
        confirmed_at: record.confirmed_at
      }))
    };
  }

  /**
   * 获取媒体统计数据
   */
  private static async getMediaStats(progressIds: number[]) {
    if (progressIds.length === 0) {
      return {
        class_photo: 0,
        class_video: 0,
        student_photo: 0,
        student_video: 0
      };
    }

    const mediaStats = await TeachingMediaRecord.findAll({
      where: {
        course_progress_id: { [Op.in]: progressIds },
        status: 'active'
      },
      attributes: [
        'media_type',
        [TeachingMediaRecord.sequelize!.fn('COUNT', TeachingMediaRecord.sequelize!.col('id')), 'count']
      ],
      group: ['media_type'],
      raw: true
    });

    const mediaCount = {
      class_photo: 0,
      class_video: 0,
      student_photo: 0,
      student_video: 0
    };

    mediaStats.forEach((stat: any) => {
      mediaCount[stat.media_type as keyof typeof mediaCount] = parseInt(stat.count);
    });

    return mediaCount;
  }

  /**
   * 计算整体统计数据
   */
  private static calculateOverallStats(progressStats: any[]) {
    // 检查输入参数
    if (!Array.isArray(progressStats)) {
      progressStats = [];
    }

    const overallStats = {
      total_plans: progressStats.length,
      active_plans: progressStats.filter(p => p && p.plan_status === 'active').length,
      completed_plans: progressStats.filter(p => p && p.plan_status === 'completed').length,
      total_sessions: progressStats.reduce((sum, p) => sum + (p?.total_sessions || 0), 0),
      completed_sessions: progressStats.reduce((sum, p) => sum + (p?.completed_sessions || 0), 0),
      confirmed_sessions: progressStats.reduce((sum, p) => sum + (p?.confirmed_sessions || 0), 0),
      overall_completion_rate: 0,
      overall_confirmation_rate: 0,
      overall_achievement_rate: 0,
      plans_with_media: progressStats.filter(p => p && p.has_media).length
    };

    if (overallStats.total_sessions > 0) {
      overallStats.overall_completion_rate = Math.round((overallStats.completed_sessions / overallStats.total_sessions) * 100);
      overallStats.overall_confirmation_rate = Math.round((overallStats.confirmed_sessions / overallStats.total_sessions) * 100);
    }

    if (progressStats.length > 0) {
      overallStats.overall_achievement_rate = Math.round(
        progressStats.reduce((sum, p) => sum + (p?.avg_achievement_rate || 0), 0) / progressStats.length
      );
    }

    return overallStats;
  }

  /**
   * 获取班级详细达标情况
   */
  public static async getClassDetailedProgress(classId: number, coursePlanId: number) {
    // 获取班级信息
    const classInfo = await Class.findByPk(classId, {
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id', 'name', 'student_no', 'photo_url']
        }
      ]
    });

    if (!classInfo) {
      throw new Error('班级不存在');
    }

    // 获取课程计划信息
    const coursePlan = await CoursePlan.findByPk(coursePlanId, {
      include: [
        {
          model: BrainScienceCourse,
          as: 'course',
          attributes: ['id', 'course_name', 'course_description']
        }
      ]
    });

    if (!coursePlan) {
      throw new Error('课程计划不存在');
    }

    // 获取课程进度记录
    const progressRecords = await CourseProgress.findAll({
      where: {
        course_plan_id: coursePlanId,
        class_id: classId
      },
      order: [['session_number', 'ASC']]
    });

    // 计算学生的详细达标情况
    const studentProgress = this.calculateStudentProgress(classInfo.students || [], progressRecords, coursePlan);

    return {
      class_info: {
        id: classInfo.id,
        name: classInfo.name,
        student_count: classInfo.currentStudentCount
      },
      course_plan: {
        id: coursePlan.id,
        course: coursePlan.course,
        semester: coursePlan.semester,
        academic_year: coursePlan.academic_year,
        target_achievement_rate: coursePlan.target_achievement_rate,
        total_sessions: coursePlan.total_sessions,
        completed_sessions: coursePlan.completed_sessions
      },
      student_progress: studentProgress,
      summary: {
        total_students: studentProgress.length,
        achieved_students: studentProgress.filter(s => s.is_target_achieved).length,
        class_achievement_rate: studentProgress.length > 0 
          ? Math.round((studentProgress.filter(s => s.is_target_achieved).length / studentProgress.length) * 100)
          : 0
      }
    };
  }

  /**
   * 计算学生进度
   */
  private static calculateStudentProgress(students: any[], progressRecords: any[], coursePlan: any) {
    return students.map(student => {
      // 计算该学生的总体达标情况
      const attendedSessions = progressRecords.filter(record => 
        record.attendance_count > 0 // 简化逻辑，实际需要更详细的学生出勤记录
      ).length;
      
      const achievedSessions = Math.floor(attendedSessions * 0.8); // 假设80%的出勤课时达标
      const achievementRate = attendedSessions > 0 ? (achievedSessions / attendedSessions) * 100 : 0;

      return {
        student_id: student.id,
        student_name: student.name,
        student_no: student.studentNo,
        photo_url: student.photoUrl,
        attended_sessions: attendedSessions,
        achieved_sessions: achievedSessions,
        achievement_rate: Math.round(achievementRate),
        is_target_achieved: achievementRate >= coursePlan.target_achievement_rate
      };
    });
  }

  /**
   * 教师确认完成课程
   */
  public static async confirmCourseCompletion(
    progressId: number,
    teacherId: number,
    data: {
      attendance_count: number;
      target_achieved_count: number;
      session_content?: string;
      notes?: string;
    }
  ) {
    // 获取课程进度记录
    const progress = await CourseProgress.findByPk(progressId);
    if (!progress) {
      throw new Error('课程进度记录不存在');
    }

    // 计算达标率
    const achievementRate = data.attendance_count > 0
      ? Math.round((data.target_achieved_count / data.attendance_count) * 100)
      : 0;

    // 更新进度记录
    await progress.update({
      completion_status: 'completed',
      teacher_confirmed: true,
      teacher_id: teacherId,
      attendance_count: data.attendance_count,
      target_achieved_count: data.target_achieved_count,
      achievement_rate: achievementRate,
      session_content: data.session_content,
      notes: data.notes,
      confirmed_at: new Date()
    });

    // 更新课程计划的完成课时数
    const coursePlan = await CoursePlan.findByPk(progress.course_plan_id);
    if (coursePlan) {
      const completedCount = await CourseProgress.count({
        where: {
          course_plan_id: coursePlan.id,
          completion_status: 'completed'
        }
      });

      await coursePlan.update({
        completed_sessions: completedCount
      });
    }

    return {
      progress_id: progress.id,
      completion_status: progress.completion_status,
      achievement_rate: achievementRate,
      confirmed_at: progress.confirmed_at
    };
  }

  /**
   * 更新媒体统计缓存
   */
  public static async updateMediaCache(courseProgressId: number) {
    const mediaCount = await TeachingMediaRecord.countByMediaType(0, courseProgressId);

    const progress = await CourseProgress.findByPk(courseProgressId);
    if (progress) {
      await progress.update({
        has_class_media: (mediaCount.class_photo + mediaCount.class_video) > 0,
        class_media_count: mediaCount.class_photo + mediaCount.class_video,
        has_student_media: (mediaCount.student_photo + mediaCount.student_video) > 0,
        student_media_count: mediaCount.student_photo + mediaCount.student_video
      });
    }
  }

  // ==================== 户外训练相关方法 ====================

  /**
   * 获取户外训练统计数据
   */
  public static async getOutdoorTrainingStats(
    semester: string,
    academicYear: string,
    userId?: number,
    userRole?: string
  ) {
    try {
      console.log('🏃 获取户外训练统计数据，参数:', { semester, academicYear, userId, userRole });

      // 构建查询条件
      const whereClause: any = { semester, academic_year: academicYear };

      // 查询所有户外训练记录
      const records = await OutdoorTrainingRecord.findAll({
        where: whereClause,
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'name', 'current_student_count', 'head_teacher_id', 'assistant_teacher_id']
          }
        ]
      });

      // 按班级分组统计
      const classStatsMap = new Map();

      records.forEach((record: any) => {
        const classId = record.class_id;
        if (!classStatsMap.has(classId)) {
          classStatsMap.set(classId, {
            class_id: classId,
            class_name: record.class?.name || '未知班级',
            outdoor_training_completed: 0,
            departure_display_completed: 0,
            outdoor_training_total_rate: 0,
            departure_display_total_rate: 0,
            outdoor_training_count: 0,
            departure_display_count: 0
          });
        }

        const stats = classStatsMap.get(classId);

        if (record.completion_status === 'completed') {
          if (record.training_type === 'outdoor_training') {
            stats.outdoor_training_completed++;
            stats.outdoor_training_total_rate += record.achievement_rate || 0;
            stats.outdoor_training_count++;
          } else if (record.training_type === 'departure_display') {
            stats.departure_display_completed++;
            stats.departure_display_total_rate += record.achievement_rate || 0;
            stats.departure_display_count++;
          }
        }
      });

      // 计算平均达标率
      let classStatistics = Array.from(classStatsMap.values()).map(stats => ({
        class_id: stats.class_id,
        class_name: stats.class_name,
        outdoor_training_completed: stats.outdoor_training_completed,
        departure_display_completed: stats.departure_display_completed,
        outdoor_training_rate: stats.outdoor_training_count > 0
          ? Math.round(stats.outdoor_training_total_rate / stats.outdoor_training_count)
          : 0,
        departure_display_rate: stats.departure_display_count > 0
          ? Math.round(stats.departure_display_total_rate / stats.departure_display_count)
          : 0,
        total_completed: stats.outdoor_training_completed + stats.departure_display_completed,
        total_rate: (stats.outdoor_training_count + stats.departure_display_count) > 0
          ? Math.round((stats.outdoor_training_total_rate + stats.departure_display_total_rate) /
              (stats.outdoor_training_count + stats.departure_display_count))
          : 0,
        has_media: false, // TODO: 从媒体记录表统计
        media_count: 0
      }));

      // 🔒 角色过滤：教师只能看到自己负责的班级
      if (userRole === 'teacher' && userId) {
        console.log(`🔒 教师角色过滤，教师ID: ${userId}`);
        classStatistics = classStatistics.filter((classItem: any) => {
          const classData = records.find((r: any) => r.class_id === classItem.class_id)?.class;
          if (!classData) return false;

          const isHeadTeacher = (classData as any).head_teacher_id === userId;
          const isAssistantTeacher = (classData as any).assistant_teacher_id === userId;

          return isHeadTeacher || isAssistantTeacher;
        });
        console.log(`🔒 过滤后班级数量: ${classStatistics.length}`);
      } else {
        console.log(`👑 园长/管理员角色，显示所有班级: ${classStatistics.length}`);
      }

      // 计算总体统计
      const totalOutdoorCompleted = classStatistics.reduce((sum, s) => sum + s.outdoor_training_completed, 0);
      const totalDepartureCompleted = classStatistics.reduce((sum, s) => sum + s.departure_display_completed, 0);
      const avgOutdoorRate = classStatistics.length > 0
        ? Math.round(classStatistics.reduce((sum, s) => sum + s.outdoor_training_rate, 0) / classStatistics.length)
        : 0;
      const avgDepartureRate = classStatistics.length > 0
        ? Math.round(classStatistics.reduce((sum, s) => sum + s.departure_display_rate, 0) / classStatistics.length)
        : 0;

      return {
        overview: {
          total_weeks: 16,
          outdoor_training: {
            completed_weeks: Math.round(totalOutdoorCompleted / Math.max(classStatistics.length, 1)),
            average_rate: avgOutdoorRate
          },
          departure_display: {
            completed_weeks: Math.round(totalDepartureCompleted / Math.max(classStatistics.length, 1)),
            average_rate: avgDepartureRate
          }
        },
        class_statistics: classStatistics
      };
    } catch (error) {
      console.error('Error in getOutdoorTrainingStats:', error);
      throw error;
    }
  }

  /**
   * 获取班级户外训练详情
   */
  public static async getClassOutdoorTrainingDetails(classId: number, semester: string, academicYear: string) {
    const classInfo = await Class.findByPk(classId);
    if (!classInfo) {
      throw new Error('班级不存在');
    }

    const records = await OutdoorTrainingRecord.findAll({
      where: {
        class_id: classId,
        semester,
        academic_year: academicYear
      },
      include: [{
        model: Teacher,
        as: 'teacher',
        attributes: ['id', 'name']
      }],
      order: [['week_number', 'ASC']]
    });

    return {
      class_info: {
        id: classInfo.id,
        name: classInfo.name
      },
      training_records: records.map((record: any) => ({
        id: record.id,
        week_number: record.week_number,
        training_type: record.training_type,
        training_date: record.training_date,
        completion_status: record.completion_status,
        attendance_count: record.attendance_count,
        target_achieved_count: record.target_achieved_count,
        achievement_rate: record.achievement_rate,
        location: record.location,
        weather_condition: record.weather_condition,
        duration_minutes: record.duration_minutes,
        activities_content: record.activities_content,
        notes: record.notes,
        teacher: record.teacher ? {
          id: record.teacher.id,
          name: record.teacher.name
        } : null,
        confirmed_at: record.confirmed_at
      }))
    };
  }

  /**
   * 记录户外训练活动
   */
  public static async recordOutdoorTraining(trainingData: any) {
    // 计算达标率
    const achievementRate = trainingData.attendance_count > 0
      ? Math.round((trainingData.target_achieved_count / trainingData.attendance_count) * 100)
      : 0;

    const record = await OutdoorTrainingRecord.create({
      ...trainingData,
      achievement_rate: achievementRate,
      confirmed_at: new Date()
    });

    return {
      id: record.id,
      training_type: record.training_type,
      completion_status: record.completion_status,
      achievement_rate: record.achievement_rate,
      created_at: record.created_at
    };
  }

  // ==================== 校外展示相关方法 ====================

  /**
   * 获取校外展示统计数据
   */
  public static async getExternalDisplayStats(
    semester: string,
    academicYear: string,
    userId?: number,
    userRole?: string
  ) {
    try {
      console.log('🎭 获取校外展示统计数据，参数:', { semester, academicYear, userId, userRole });

      // 查询本学期的校外展示记录
      let semesterRecords;
      try {
        semesterRecords = await ExternalDisplayRecord.findAll({
          where: { semester, academic_year: academicYear },
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name', 'head_teacher_id', 'assistant_teacher_id']
            }
          ]
        });
        console.log('✅ semesterRecords查询成功, 数量:', semesterRecords?.length || 0);
      } catch (dbError) {
        console.error('❌ semesterRecords查询失败:', dbError);
        semesterRecords = [];
      }

      const safeSemesterRecords = semesterRecords || [];

      // 查询所有历史记录（用于累计统计）
      let allRecords;
      try {
        allRecords = await ExternalDisplayRecord.findAll({
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name', 'head_teacher_id', 'assistant_teacher_id']
            }
          ]
        });
        console.log('✅ allRecords查询成功, 数量:', allRecords?.length || 0);
      } catch (dbError) {
        console.error('❌ allRecords查询失败:', dbError);
        allRecords = [];
      }

      const safeAllRecords = allRecords || [];

      // 按班级分组统计
      const classStatsMap = new Map();

      // 统计本学期数据
      (safeSemesterRecords || []).forEach((record: any) => {
        const classId = record.class_id;
        if (!classStatsMap.has(classId)) {
          classStatsMap.set(classId, {
            class_id: classId,
            class_name: record.class?.name || '未知班级',
            semester_outings: 0,
            total_outings: 0,
            total_achievement_rate: 0,
            achievement_count: 0
          });
        }

        const stats = classStatsMap.get(classId);
        if (record.completion_status === 'completed') {
          stats.semester_outings++;
          stats.total_achievement_rate += record.achievement_rate || 0;
          stats.achievement_count++;
        }
      });

      // 统计累计数据
      (safeAllRecords || []).forEach((record: any) => {
        const classId = record.class_id;
        if (classStatsMap.has(classId)) {
          const stats = classStatsMap.get(classId);
          if (record.completion_status === 'completed') {
            stats.total_outings++;
          }
        }
      });

      // 计算平均达标率
      let classStatistics = Array.from(classStatsMap.values()).map(stats => ({
        class_id: stats.class_id,
        class_name: stats.class_name,
        semester_outings: stats.semester_outings,
        total_outings: stats.total_outings,
        achievement_rate: stats.achievement_count > 0
          ? Math.round(stats.total_achievement_rate / stats.achievement_count)
          : 0,
        has_media: false, // TODO: 从媒体记录表统计
        media_count: 0
      }));

      // 🔒 角色过滤：教师只能看到自己负责的班级
      if (userRole === 'teacher' && userId) {
        console.log(`🔒 教师角色过滤，教师ID: ${userId}`);
        classStatistics = classStatistics.filter((classItem: any) => {
          const classData = semesterRecords.find((r: any) => r.class_id === classItem.class_id)?.class;
          if (!classData) return false;

          const isHeadTeacher = (classData as any).head_teacher_id === userId;
          const isAssistantTeacher = (classData as any).assistant_teacher_id === userId;

          return isHeadTeacher || isAssistantTeacher;
        });
        console.log(`🔒 过滤后班级数量: ${classStatistics.length}`);
      } else {
        console.log(`👑 园长/管理员角色，显示所有班级: ${classStatistics.length}`);
      }

      // 计算总体统计
      const completedActivities = (semesterRecords || []).filter((r: any) => r.completion_status === 'completed').length;
      const totalActivities = (semesterRecords || []).length;
      const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
      const avgAchievementRate = classStatistics.length > 0
        ? Math.round(classStatistics.reduce((sum, s) => sum + s.achievement_rate, 0) / classStatistics.length)
        : 0;
      const semesterTotalOutings = classStatistics.reduce((sum, s) => sum + s.semester_outings, 0);
      const allTimeTotalOutings = classStatistics.reduce((sum, s) => sum + s.total_outings, 0);

      return {
        overview: {
          total_activities: totalActivities,
          completed_activities: completedActivities,
          completion_rate: completionRate,
          average_achievement_rate: avgAchievementRate,
          semester_total_outings: semesterTotalOutings,
          all_time_total_outings: allTimeTotalOutings
        },
        class_statistics: classStatistics
      };
    } catch (error) {
      console.error('Error in getExternalDisplayStats:', error);
      throw error;
    }
  }

  /**
   * 获取班级校外展示详情
   */
  public static async getClassExternalDisplayDetails(classId: number, semester: string, academicYear: string) {
    const classInfo = await Class.findByPk(classId);
    if (!classInfo) {
      throw new Error('班级不存在');
    }

    const records = await ExternalDisplayRecord.findAll({
      where: {
        class_id: classId,
        semester,
        academic_year: academicYear
      },
      include: [{
        model: Teacher,
        as: 'teacher',
        attributes: ['id', 'name']
      }],
      order: [['activity_date', 'DESC']]
    });

    return {
      class_info: {
        id: classInfo.id,
        name: classInfo.name
      },
      display_records: records.map((record: any) => ({
        id: record.id,
        activity_name: record.activity_name,
        activity_type: record.activity_type,
        activity_date: record.activity_date,
        location: record.location,
        completion_status: record.completion_status,
        participant_count: record.participant_count,
        achievement_level: record.achievement_level,
        achievement_rate: record.achievement_rate,
        budget_amount: record.budget_amount,
        actual_cost: record.actual_cost,
        transportation_method: record.transportation_method,
        safety_measures: record.safety_measures,
        activity_description: record.activity_description,
        results_summary: record.results_summary,
        notes: record.notes,
        teacher: record.teacher ? {
          id: record.teacher.id,
          name: record.teacher.name
        } : null,
        confirmed_at: record.confirmed_at
      }))
    };
  }

  /**
   * 记录校外展示活动
   */
  public static async recordExternalDisplay(displayData: any) {
    const record = await ExternalDisplayRecord.create({
      ...displayData,
      confirmed_at: new Date()
    });

    return {
      id: record.id,
      display_location: record.display_location,
      display_type: record.display_type,
      display_date: record.display_date,
      achievement_level: record.achievement_level,
      created_at: record.created_at
    };
  }

  // ==================== 全员锦标赛相关方法 ====================

  /**
   * 获取锦标赛统计数据
   * 参照TeacherDashboardService的错误处理模式，返回安全默认数据
   */
  public static async getChampionshipStats(
    semester: string,
    academicYear: string,
    userId?: number,
    userRole?: string
  ) {
    try {
      console.log('🏆 获取锦标赛统计数据，参数:', { semester, academicYear, userId, userRole });

      // 参照TeacherDashboardService的try-catch模式，返回安全默认数据
      let semesterRecords: any[] = [];
      let allRecords: any[] = [];
      let totalClasses = 0;
      let totalStudents = 0;

      try {
        // 查询本学期的锦标赛记录
        semesterRecords = await ChampionshipRecord.findAll({
          where: { semester, academic_year: academicYear }
        }) || [];

        // 查询所有历史记录
        allRecords = await ChampionshipRecord.findAll() || [];

        // 获取总班级数和总学生数（用于计算参与比例）
        totalClasses = await Class.count().catch(() => 0);
        totalStudents = await Student.count().catch(() => 0);
      } catch (dbError) {
        console.warn('⚠️ 锦标赛数据查询失败，返回空数据:', dbError);
        // 返回空数据结构，与TeacherDashboardService保持一致
        return {
          overview: {
            semester_championships: 0,
            total_championships: 0,
            completed_championships: 0,
            completion_rate: 0,
            total_classes: totalClasses || 0,
            total_students: totalStudents || 0,
            avg_participating_class_count: 0,
            avg_participant_count: 0,
            avg_class_participation_rate: 0,
            avg_student_participation_rate: 0
          },
          achievement_rates: {
            brain_science_plan: 0,
            course_content: 0,
            outdoor_training_display: 0,
            external_display: 0
          },
          championship_list: []
        };
      }

      // 计算统计数据
      const completedRecords = (semesterRecords || []).filter((r: any) => r.completion_status === 'completed');
      const completionRate = (semesterRecords || []).length > 0
        ? Math.round((completedRecords.length / (semesterRecords || []).length) * 100)
        : 0;

      // 计算平均达标率
      const avgBrainScience = completedRecords.length > 0
        ? Math.round(completedRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.brain_science_achievement_rate?.toString() || '0') || 0), 0) / completedRecords.length)
        : 0;
      const avgCourseContent = completedRecords.length > 0
        ? Math.round(completedRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.course_content_achievement_rate?.toString() || '0') || 0), 0) / completedRecords.length)
        : 0;
      const avgOutdoorTraining = completedRecords.length > 0
        ? Math.round(completedRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.outdoor_training_achievement_rate?.toString() || '0') || 0), 0) / completedRecords.length)
        : 0;
      const avgExternalDisplay = completedRecords.length > 0
        ? Math.round(completedRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.external_display_achievement_rate?.toString() || '0') || 0), 0) / completedRecords.length)
        : 0;

      // 计算平均参与比例
      const avgClassParticipationRate = completedRecords.length > 0
        ? Math.round(completedRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.class_participation_rate?.toString() || '0') || 0), 0) / completedRecords.length)
        : 0;
      const avgStudentParticipationRate = completedRecords.length > 0
        ? Math.round(completedRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.student_participation_rate?.toString() || '0') || 0), 0) / completedRecords.length)
        : 0;
      const avgParticipatingClassCount = completedRecords.length > 0
        ? Math.round(completedRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.participating_class_count?.toString() || '0') || 0), 0) / completedRecords.length)
        : 0;
      const avgParticipantCount = completedRecords.length > 0
        ? Math.round(completedRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.total_participants?.toString() || '0') || 0), 0) / completedRecords.length)
        : 0;

      // 格式化锦标赛列表
      let championshipList = (semesterRecords || []).map((record: any) => ({
        id: record.id,
        championship_name: record.championship_name,
        championship_date: record.championship_date,
        completion_status: record.completion_status,
        participant_count: record.total_participants,
        participating_class_count: record.participating_class_count,
        class_participation_rate: record.class_participation_rate,
        student_participation_rate: record.student_participation_rate,
        brain_science_achievement_rate: record.brain_science_achievement_rate,
        course_content_achievement_rate: record.course_content_achievement_rate,
        outdoor_training_achievement_rate: record.outdoor_training_achievement_rate,
        external_display_achievement_rate: record.external_display_achievement_rate,
        overall_achievement_rate: record.overall_achievement_rate,
        has_media: record.has_media,
        media_count: record.media_count
      }));

      // 🔒 角色过滤：锦标赛是全园性活动，教师可以查看但不能修改
      // 园长和教师都可以看到锦标赛数据，因为这是全员参与的活动
      if (userRole === 'teacher' && userId) {
        console.log(`👨‍🏫 教师角色，可以查看锦标赛数据（全员活动）`);
      } else {
        console.log(`👑 园长/管理员角色，可以查看和管理锦标赛数据`);
      }

      return {
        overview: {
          semester_championships: (semesterRecords || []).length,
          total_championships: (allRecords || []).length,
          completed_championships: completedRecords.length,
          completion_rate: completionRate,
          total_classes: totalClasses || 0,
          total_students: totalStudents || 0,
          avg_participating_class_count: avgParticipatingClassCount,
          avg_participant_count: avgParticipantCount,
          avg_class_participation_rate: avgClassParticipationRate,
          avg_student_participation_rate: avgStudentParticipationRate
        },
        achievement_rates: {
          brain_science_plan: avgBrainScience,
          course_content: avgCourseContent,
          outdoor_training_display: avgOutdoorTraining,
          external_display: avgExternalDisplay
        },
        championship_list: championshipList
      };
    } catch (error) {
      console.error('Error in getChampionshipStats:', error);
      // 返回安全的空数据，避免500错误
      return {
        overview: {
          semester_championships: 0,
          total_championships: 0,
          completed_championships: 0,
          completion_rate: 0,
          total_classes: 0,
          total_students: 0,
          avg_participating_class_count: 0,
          avg_participant_count: 0,
          avg_class_participation_rate: 0,
          avg_student_participation_rate: 0
        },
        achievement_rates: {
          brain_science_plan: 0,
          course_content: 0,
          outdoor_training_display: 0,
          external_display: 0
        },
        championship_list: []
      };
    }
  }

  /**
   * 获取锦标赛详情
   * 参照TeacherDashboardService的错误处理模式
   */
  public static async getChampionshipDetails(championshipId: number) {
    try {
      const championship = await ChampionshipRecord.findByPk(championshipId, {
        include: [{
          model: Teacher,
          as: 'organizer',
          attributes: ['id', 'name']
        }]
      });

      if (!championship) {
        return null; // 返回null而不是抛出错误
      }

      return {
        id: championship.id,
        championship_name: championship.championship_name,
        championship_type: championship.championship_type,
        championship_date: championship.championship_date,
        completion_status: championship.completion_status,
        total_participants: championship.total_participants,
        brain_science_achievement_rate: championship.brain_science_achievement_rate,
        course_content_achievement_rate: championship.course_content_achievement_rate,
        outdoor_training_achievement_rate: championship.outdoor_training_achievement_rate,
        external_display_achievement_rate: championship.external_display_achievement_rate,
        overall_achievement_rate: championship.overall_achievement_rate,
        has_media: championship.has_media,
        media_count: championship.media_count,
        awards: championship.awards,
        winners: championship.winners,
        summary: championship.summary,
        notes: championship.notes,
        organizer: championship.organizer ? {
          id: championship.organizer.id,
          name: championship.organizer.name
        } : null,
        created_at: championship.created_at,
        updated_at: championship.updated_at
      };
    } catch (error) {
      console.error('获取锦标赛详情失败:', error);
      return null; // 返回null而不是抛出错误
    }
  }

  /**
   * 创建锦标赛
   */
  public static async createChampionship(championshipData: any) {
    const championship = await ChampionshipRecord.create(championshipData);

    return {
      id: championship.id,
      championship_name: championship.championship_name,
      championship_type: championship.championship_type,
      championship_date: championship.championship_date,
      completion_status: championship.completion_status,
      created_at: championship.created_at
    };
  }

  /**
   * 更新锦标赛状态
   */
  public static async updateChampionshipStatus(championshipId: number, status: 'planned' | 'in_progress' | 'completed' | 'cancelled', achievementRates: any) {
    const championship = await ChampionshipRecord.findByPk(championshipId);
    if (!championship) {
      throw new Error('锦标赛记录不存在');
    }

    await championship.update({
      completion_status: status,
      brain_science_achievement_rate: achievementRates.brain_science || championship.brain_science_achievement_rate,
      course_content_achievement_rate: achievementRates.course_content || championship.course_content_achievement_rate,
      outdoor_training_achievement_rate: achievementRates.outdoor_training || championship.outdoor_training_achievement_rate,
      external_display_achievement_rate: achievementRates.external_display || championship.external_display_achievement_rate,
      updated_at: new Date()
    });

    return {
      id: championship.id,
      completion_status: championship.completion_status,
      updated_at: championship.updated_at
    };
  }

  // ==================== 媒体管理相关方法 ====================

  /**
   * 上传教学媒体文件
   */
  public static async uploadTeachingMedia(mediaData: any) {
    const media = await TeachingMediaRecord.create({
      ...mediaData,
      upload_time: new Date(),
      status: 'active'
    });

    return {
      id: media.id,
      media_type: media.media_type,
      status: media.status,
      upload_time: media.upload_time
    };
  }

  /**
   * 获取教学媒体列表
   */
  public static async getTeachingMediaList(filters: any) {
    const whereClause: any = {
      status: 'active'
    };

    if (filters.record_type) {
      whereClause.record_type = filters.record_type;
    }
    if (filters.record_id) {
      whereClause.record_id = filters.record_id;
    }
    if (filters.media_type) {
      whereClause.media_type = filters.media_type;
    }

    const mediaList = await TeachingMediaRecord.findAll({
      where: whereClause,
      include: [{
        model: FileStorage,
        as: 'file',
        attributes: ['id', 'filename', 'originalName', 'mimeType', 'size', 'url']
      }],
      order: [['upload_date', 'DESC']]
    });

    return mediaList.map((media: any) => ({
      id: media.id,
      record_type: media.record_type,
      record_id: media.record_id,
      media_type: media.media_type,
      description: media.description,
      upload_date: media.upload_date,
      file: media.file ? {
        id: media.file.id,
        filename: media.file.filename,
        original_name: media.file.originalName,
        mime_type: media.file.mimeType,
        size: media.file.size,
        url: media.file.url
      } : null
    }));
  }

  /**
   * 删除教学媒体文件
   */
  public static async deleteTeachingMedia(mediaId: number) {
    const media = await TeachingMediaRecord.findByPk(mediaId);
    if (!media) {
      throw new Error('媒体文件不存在');
    }

    await media.update({
      status: 'deleted',
      updated_at: new Date()
    });

    return {
      id: media.id,
      status: media.status,
      updated_at: media.updated_at
    };
  }

  /**
   * 获取媒体统计信息
   */
  public static async getMediaStatistics(recordType: string, recordId?: number) {
    const whereClause: any = {
      record_type: recordType,
      status: 'active'
    };

    if (recordId) {
      whereClause.record_id = recordId;
    }

    const stats = await TeachingMediaRecord.findAll({
      where: whereClause,
      attributes: [
        'media_type',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['media_type'],
      raw: true
    });

    const result: any = {
      class_photo: 0,
      class_video: 0,
      student_photo: 0,
      student_video: 0,
      total: 0
    };

    stats.forEach((stat: any) => {
      result[stat.media_type] = parseInt(stat.count);
      result.total += parseInt(stat.count);
    });

    return result;
  }
}
