import { Request, Response } from 'express';
import { TeacherClassCourse, TeacherCourseRecord, CoursePlan, BrainScienceCourse, Class, CourseProgress } from '../models';
import { Op } from 'sequelize';

/**
 * 教师课程管理Controller
 */
export class TeacherCoursesController {
  
  /**
   * 获取教师的所有课程列表
   */
  static async getMyCourses(req: Request, res: Response) {
    try {
      const teacherId = (req as any).user?.id;
      const { status, classId } = req.query;

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const where: any = { teacher_id: teacherId };
      
      if (status) {
        where.status = status;
      }
      
      if (classId) {
        where.class_id = classId;
      }

      const courses = await TeacherClassCourse.findAll({
        where,
        include: [
          {
            association: 'class',
            attributes: ['id', 'class_name', 'grade']
          },
          {
            association: 'coursePlan',
            attributes: ['id', 'plan_name', 'description', 'total_weeks']
          },
          {
            association: 'brainScienceCourse',
            attributes: ['id', 'course_name', 'age_group', 'domain', 'course_cover']
          },
          {
            association: 'assignedByUser',
            attributes: ['id', 'username', 'name']
          },
          {
            association: 'records',
            separate: true,
            limit: 5,
            order: [['lesson_date', 'DESC']]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // 获取课程进度
      const coursesWithProgress = await Promise.all(
        courses.map(async (course: any) => {
          const allProgress = await CourseProgress.findAll({
            where: {
              course_plan_id: course.course_plan_id,
              class_id: course.class_id
            }
          });

          const totalLessons = allProgress.length;
          const completedLessons = allProgress.filter(p => p.completion_status === 'completed').length;
          const lastLesson = allProgress.length > 0 ? allProgress.sort((a, b) => 
            (b.session_date?.getTime() || 0) - (a.session_date?.getTime() || 0))[0] : null;

          return {
            ...course.toJSON(),
            progress: totalLessons > 0 ? {
              completed_lessons: completedLessons,
              total_lessons: totalLessons,
              progress_percentage: Math.round((completedLessons / totalLessons) * 100),
              last_lesson_date: lastLesson?.session_date
            } : null
          };
        })
      );

      res.json({
        success: true,
        data: coursesWithProgress
      });
    } catch (error: any) {
      console.error('获取教师课程列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取课程列表失败',
        error: error.message
      });
    }
  }

  /**
   * 获取课程详情
   */
  static async getCourseDetail(req: Request, res: Response) {
    try {
      const teacherId = (req as any).user?.id;
      const { courseId } = req.params;

      const course = await TeacherClassCourse.findOne({
        where: {
          id: courseId,
          teacher_id: teacherId
        },
        include: [
          {
            association: 'class',
            attributes: ['id', 'class_name', 'grade', 'student_count']
          },
          {
            association: 'coursePlan',
            attributes: ['id', 'plan_name', 'description', 'total_weeks', 'weekly_lessons']
          },
          {
            association: 'brainScienceCourse',
            attributes: ['id', 'course_name', 'age_group', 'domain', 'course_cover', 'course_objectives']
          },
          {
            association: 'records',
            separate: true,
            order: [['lesson_date', 'DESC']]
          }
        ]
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '课程不存在'
        });
      }

      // 获取详细进度
      const progress = await CourseProgress.findOne({
        where: {
          course_plan_id: course.course_plan_id,
          class_id: course.class_id
        }
      });

      res.json({
        success: true,
        data: {
          ...course.toJSON(),
          progress
        }
      });
    } catch (error: any) {
      console.error('获取课程详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取课程详情失败',
        error: error.message
      });
    }
  }

  /**
   * 添加教学记录
   */
  static async addCourseRecord(req: Request, res: Response) {
    try {
      const teacherId = (req as any).user?.id;
      const { courseId } = req.params;
      const recordData = req.body;

      // 验证课程归属
      const course = await TeacherClassCourse.findOne({
        where: {
          id: courseId,
          teacher_id: teacherId
        }
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '课程不存在或无权限'
        });
      }

      // 创建教学记录
      const record = await TeacherCourseRecord.create({
        teacher_class_course_id: Number(courseId),
        teacher_id: teacherId,
        class_id: course.class_id,
        course_plan_id: course.course_plan_id,
        ...recordData
      });

      // 更新课程状态为进行中
      if (course.status === 'assigned') {
        await course.update({ status: 'in_progress' });
      }

      // 更新课程进度
      const progress = await CourseProgress.findOne({
        where: {
          course_plan_id: course.course_plan_id,
          class_id: course.class_id,
          session_number: recordData.session_number || 1
        }
      });

      if (progress) {
        await progress.update({
          completion_status: 'completed',
          session_date: recordData.lesson_date,
          teacher_id: teacherId,
          teacher_confirmed: true,
          confirmed_at: new Date()
        });
      } else {
        await CourseProgress.create({
          course_plan_id: course.course_plan_id,
          class_id: course.class_id,
          session_number: recordData.session_number || 1,
          session_date: recordData.lesson_date,
          completion_status: 'completed',
          teacher_id: teacherId,
          teacher_confirmed: true,
          confirmed_at: new Date()
        });
      }

      res.json({
        success: true,
        message: '教学记录添加成功',
        data: record
      });
    } catch (error: any) {
      console.error('添加教学记录失败:', error);
      res.status(500).json({
        success: false,
        message: '添加教学记录失败',
        error: error.message
      });
    }
  }

  /**
   * 更新教学记录
   */
  static async updateCourseRecord(req: Request, res: Response) {
    try {
      const teacherId = (req as any).user?.id;
      const { courseId, recordId } = req.params;
      const updateData = req.body;

      const record = await TeacherCourseRecord.findOne({
        where: {
          id: recordId,
          teacher_class_course_id: courseId,
          teacher_id: teacherId
        }
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '记录不存在或无权限'
        });
      }

      await record.update(updateData);

      res.json({
        success: true,
        message: '教学记录更新成功',
        data: record
      });
    } catch (error: any) {
      console.error('更新教学记录失败:', error);
      res.status(500).json({
        success: false,
        message: '更新教学记录失败',
        error: error.message
      });
    }
  }

  /**
   * 删除教学记录
   */
  static async deleteCourseRecord(req: Request, res: Response) {
    try {
      const teacherId = (req as any).user?.id;
      const { courseId, recordId } = req.params;

      const record = await TeacherCourseRecord.findOne({
        where: {
          id: recordId,
          teacher_class_course_id: courseId,
          teacher_id: teacherId
        }
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '记录不存在或无权限'
        });
      }

      await record.destroy();

      // 更新课程进度
      const course = await TeacherClassCourse.findByPk(courseId);
      if (course && record.lesson_number) {
        const progress = await CourseProgress.findOne({
          where: {
            course_plan_id: course.course_plan_id,
            class_id: course.class_id,
            session_number: record.lesson_number
          }
        });

        if (progress) {
          await progress.update({
            completion_status: 'not_started',
            teacher_confirmed: false,
            confirmed_at: null
          });
        }
      }

      res.json({
        success: true,
        message: '教学记录删除成功'
      });
    } catch (error: any) {
      console.error('删除教学记录失败:', error);
      res.status(500).json({
        success: false,
        message: '删除教学记录失败',
        error: error.message
      });
    }
  }

  /**
   * 获取课程统计
   */
  static async getCourseStats(req: Request, res: Response) {
    try {
      const teacherId = (req as any).user?.id;

      // 课程状态统计
      const statusStats = await TeacherClassCourse.getCourseStats(teacherId);

      // 本周教学记录数
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const thisWeekRecords = await TeacherCourseRecord.count({
        where: {
          teacher_id: teacherId,
          lesson_date: {
            [Op.gte]: startOfWeek
          }
        }
      });

      // 总课程数
      const totalCourses = await TeacherClassCourse.count({
        where: { teacher_id: teacherId }
      });

      // 总教学记录数
      const totalRecords = await TeacherCourseRecord.count({
        where: { teacher_id: teacherId }
      });

      res.json({
        success: true,
        data: {
          statusStats,
          thisWeekRecords,
          totalCourses,
          totalRecords
        }
      });
    } catch (error: any) {
      console.error('获取课程统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取统计数据失败',
        error: error.message
      });
    }
  }

  /**
   * 更新课程状态
   */
  static async updateCourseStatus(req: Request, res: Response) {
    try {
      const teacherId = (req as any).user?.id;
      const { courseId } = req.params;
      const { status } = req.body;

      const course = await TeacherClassCourse.findOne({
        where: {
          id: courseId,
          teacher_id: teacherId
        }
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '课程不存在或无权限'
        });
      }

      await course.update({ status });

      // 如果标记为完成，记录实际结束日期
      if (status === 'completed') {
        await course.update({
          actual_end_date: new Date()
        });
      }

      res.json({
        success: true,
        message: '课程状态更新成功',
        data: course
      });
    } catch (error: any) {
      console.error('更新课程状态失败:', error);
      res.status(500).json({
        success: false,
        message: '更新课程状态失败',
        error: error.message
      });
    }
  }
}

export default TeacherCoursesController;
