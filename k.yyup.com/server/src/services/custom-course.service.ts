import { Op, fn } from 'sequelize';
import {
  CourseAssignment, CustomCourse, Class, CourseContent, CourseSchedule, CourseInteractiveLink,
  User, Teacher, CreativeCurriculum
} from '../models';

/**
 * 自定义课程服务
 * 注意：使用静态导入模式，模型必须在init.ts中先初始化
 */
export class CustomCourseService {

  // ==================== 课程CRUD ====================

  /**
   * 获取课程列表
   */
  public static async getCourses(params: {
    page: number;
    pageSize: number;
    course_type?: string;
    status?: string;
    age_group?: string;
    semester?: string;
    academic_year?: string;
    search?: string;
    userId?: number;
    userRole?: string;
  }) {
    const {
      page,
      pageSize,
      course_type,
      status,
      age_group,
      semester,
      academic_year,
      search
    } = params;

    const where: any = {
      is_active: true
    };

    if (course_type) {
      where.course_type = course_type;
    }

    if (status) {
      where.status = status;
    }

    if (age_group) {
      where.age_group = age_group;
    }

    if (semester) {
      where.semester = semester;
    }

    if (academic_year) {
      where.academic_year = academic_year;
    }

    if (search) {
      where[Op.or] = [
        { course_name: { [Op.like]: `%${search}%` } },
        { course_description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await CustomCourse.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  /**
   * 获取单个课程详情
   */
  public static async getCourseById(id: number) {
    const course = await CustomCourse.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: CourseContent,
          as: 'contents',
          order: [['sort_order', 'ASC']]
        }
      ]
    });

    return course;
  }

  /**
   * 创建课程
   */
  public static async createCourse(data: any) {
    const course = await CustomCourse.create(data);
    return course;
  }

  /**
   * 更新课程
   */
  public static async updateCourse(id: number, data: any) {
    const course = await CustomCourse.findByPk(id);
    if (!course) return null;

    await course.update(data);
    return course;
  }

  /**
   * 删除课程（软删除）
   */
  public static async deleteCourse(id: number) {
    const course = await CustomCourse.findByPk(id);
    if (!course) return false;

    await course.update({ is_active: false });
    return true;
  }

  /**
   * 发布课程
   */
  public static async publishCourse(id: number) {
    const course = await CustomCourse.findByPk(id);
    if (!course) return null;

    await course.update({ status: 'published' });
    return course;
  }

  /**
   * 归档课程
   */
  public static async archiveCourse(id: number) {
    const course = await CustomCourse.findByPk(id);
    if (!course) return null;

    await course.update({ status: 'archived' });
    return course;
  }

  // ==================== 课程内容管理 ====================

  /**
   * 获取课程内容列表
   */
  public static async getCourseContents(courseId: number) {
    const contents = await CourseContent.findAll({
      where: { course_id: courseId },
      order: [['sort_order', 'ASC']]
    });

    return contents;
  }

  /**
   * 添加课程内容
   */
  public static async addCourseContent(data: any) {
    // 获取当前最大排序号
    const maxOrder = await CourseContent.max('sort_order', {
      where: { course_id: data.course_id }
    }) as number || 0;

    const content = await CourseContent.create({
      ...data,
      sort_order: data.sort_order ?? (maxOrder + 1)
    });

    return content;
  }

  /**
   * 更新课程内容
   */
  public static async updateCourseContent(id: number, data: any) {
    const content = await CourseContent.findByPk(id);
    if (!content) return null;

    await content.update(data);
    return content;
  }

  /**
   * 删除课程内容
   */
  public static async deleteCourseContent(id: number) {
    const content = await CourseContent.findByPk(id);
    if (!content) return false;

    await content.destroy();
    return true;
  }

  /**
   * 更新课程内容排序
   */
  public static async reorderCourseContents(courseId: number, contentIds: number[]) {
    const updates = contentIds.map((id, index) =>
      CourseContent.update(
        { sort_order: index + 1 },
        { where: { id, course_id: courseId } }
      )
    );

    await Promise.all(updates);
  }

  // ==================== 课程排期管理 ====================

  /**
   * 获取课程排期列表
   */
  public static async getCourseSchedules(params: {
    course_id: number;
    class_id?: number;
    teacher_id?: number;
    status?: string;
  }) {
    const where: any = {
      course_id: params.course_id
    };

    if (params.class_id) {
      where.class_id = params.class_id;
    }

    if (params.teacher_id) {
      where.teacher_id = params.teacher_id;
    }

    if (params.status) {
      where.schedule_status = params.status;
    }

    const schedules = await CourseSchedule.findAll({
      where,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'class_name']
        },
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'name']
        }
      ],
      order: [['planned_start_date', 'ASC']]
    });

    return schedules;
  }

  /**
   * 创建课程排期
   */
  public static async createCourseSchedule(data: any) {
    // 获取课程总课时
    const course = await CustomCourse.findByPk(data.course_id);
    if (course) {
      data.total_sessions = course.total_sessions || 16;
    }

    const schedule = await CourseSchedule.create(data);
    return schedule;
  }

  /**
   * 更新课程排期
   */
  public static async updateCourseSchedule(id: number, data: any) {
    const schedule = await CourseSchedule.findByPk(id);
    if (!schedule) return null;

    await schedule.update(data);
    return schedule;
  }

  /**
   * 删除课程排期
   */
  public static async deleteCourseSchedule(id: number) {
    const schedule = await CourseSchedule.findByPk(id);
    if (!schedule) return false;

    await schedule.destroy();
    return true;
  }

  /**
   * 教师确认课程排期
   */
  public static async confirmSchedule(id: number, teacherId: number) {
    const schedule = await CourseSchedule.findByPk(id);
    if (!schedule) return null;

    // 验证是否是分配给该教师的排期
    if (schedule.teacher_id !== teacherId) {
      throw new Error('无权确认此排期');
    }

    await schedule.update({
      teacher_confirmed: true,
      teacher_confirmed_at: new Date(),
      schedule_status: 'in_progress',
      actual_start_date: new Date()
    });

    return schedule;
  }

  // ==================== 教师端课程查看 ====================

  /**
   * 获取教师的课程列表
   */
  public static async getTeacherCourses(params: {
    teacher_id: number;
    status?: string;
    class_id?: number;
  }) {
    const where: any = {
      teacher_id: params.teacher_id
    };

    if (params.status) {
      where.schedule_status = params.status;
    }

    if (params.class_id) {
      where.class_id = params.class_id;
    }

    const schedules = await CourseSchedule.findAll({
      where,
      include: [
        {
          model: CustomCourse,
          as: 'course',
          include: [
            {
              model: CourseContent,
              as: 'contents',
              order: [['sort_order', 'ASC']]
            }
          ]
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'class_name']
        }
      ],
      order: [['planned_start_date', 'ASC']]
    });

    return schedules;
  }

  // ==================== AI互动课程关联 ====================

  /**
   * 关联AI互动课程
   */
  public static async linkInteractiveCourse(data: {
    course_id: number;
    creative_curriculum_id: number;
    course_content_id?: number;
    link_type: string;
    added_by: number;
  }) {
    // 检查是否已存在关联
    const existing = await CourseInteractiveLink.findOne({
      where: {
        course_id: data.course_id,
        creative_curriculum_id: data.creative_curriculum_id,
        is_active: true
      }
    });

    if (existing) {
      throw new Error('该互动课程已关联到此课程');
    }

    const link = await CourseInteractiveLink.create({
      ...data,
      approval_status: 'pending'
    } as any);

    return link;
  }

  /**
   * 取消关联AI互动课程
   */
  public static async unlinkInteractiveCourse(linkId: number) {
    const link = await CourseInteractiveLink.findByPk(linkId);
    if (!link) return false;

    await link.update({ is_active: false });
    return true;
  }

  /**
   * 获取课程的互动课程关联列表
   */
  public static async getCourseInteractiveLinks(courseId: number) {
    const links = await CourseInteractiveLink.findAll({
      where: {
        course_id: courseId,
        is_active: true
      },
      include: [
        {
          model: CreativeCurriculum,
          as: 'creativeCurriculum',
          attributes: ['id', 'name', 'description', 'domain', 'thumbnail']
        },
        {
          model: User,
          as: 'addedByUser',
          attributes: ['id', 'username', 'realName']
        }
      ]
    });

    return links;
  }

  /**
   * 审核互动课程关联
   */
  public static async approveInteractiveLink(linkId: number, data: {
    approved_by: number;
    approval_status: string;
    approval_notes?: string;
  }) {
    const link = await CourseInteractiveLink.findByPk(linkId);
    if (!link) return null;

    await link.update({
      ...data,
      approval_status: data.approval_status as any,
      approved_at: new Date()
    });

    return link;
  }

  // ==================== 统计数据 ====================

  /**
   * 获取课程统计数据
   */
  public static async getCourseStats(userId?: number, userRole?: string) {
    const totalCourses = await CustomCourse.count({
      where: { is_active: true }
    });

    const publishedCourses = await CustomCourse.count({
      where: { is_active: true, status: 'published' }
    });

    const draftCourses = await CustomCourse.count({
      where: { is_active: true, status: 'draft' }
    });

    const brainScienceCourses = await CustomCourse.count({
      where: { is_active: true, course_type: 'brain_science' }
    });

    const customCourses = await CustomCourse.count({
      where: { is_active: true, course_type: 'custom' }
    });

    // 排期统计
    const totalSchedules = await CourseSchedule.count();
    const inProgressSchedules = await CourseSchedule.count({
      where: { schedule_status: 'in_progress' }
    });
    const completedSchedules = await CourseSchedule.count({
      where: { schedule_status: 'completed' }
    });
    const delayedSchedules = await CourseSchedule.count({
      where: {
        schedule_status: { [Op.notIn]: ['completed', 'cancelled'] },
        planned_end_date: { [Op.lt]: new Date() }
      }
    });

    return {
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses,
        brain_science: brainScienceCourses,
        custom: customCourses
      },
      schedules: {
        total: totalSchedules,
        in_progress: inProgressSchedules,
        completed: completedSchedules,
        delayed: delayedSchedules
      }
    };
  }

  /**
   * 获取延期告警列表
   */
  public static async getDelayedSchedules(userId?: number, userRole?: string) {
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    // 查找即将到期或已延期的排期
    const schedules = await CourseSchedule.findAll({
      where: {
        schedule_status: { [Op.notIn]: ['completed', 'cancelled'] },
        [Op.or]: [
          // 已延期
          { planned_end_date: { [Op.lt]: now } },
          // 3天内到期
          {
            planned_end_date: {
              [Op.gte]: now,
              [Op.lte]: threeDaysLater
            }
          }
        ]
      },
      include: [
        {
          model: CustomCourse,
          as: 'course',
          attributes: ['id', 'course_name', 'course_type']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'class_name']
        },
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'name']
        }
      ],
      order: [['planned_end_date', 'ASC']]
    });

    // 计算延期天数和告警级别
    return schedules.map(schedule => {
      const endDate = new Date(schedule.planned_end_date);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...schedule.toJSON(),
        delay_days: diffDays < 0 ? Math.abs(diffDays) : 0,
        remaining_days: diffDays >= 0 ? diffDays : 0,
        alert_level: diffDays < 0 ? 'critical' : 'warning',
        alert_message: diffDays < 0
          ? `已延期${Math.abs(diffDays)}天`
          : (diffDays === 0 ? '今日到期' : `还剩${diffDays}天`)
      };
    });
  }

  // ==================== 课程分配管理 ====================

  /**
   * 获取课程的分配列表
   */
  public static async getCourseAssignments(courseId: number) {
    const assignments = await CourseAssignment.findAll({
      where: { course_id: courseId, is_active: true },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'class_name']
        }
      ],
      order: [['assigned_at', 'DESC']]
    });
    return assignments;
  }

  /**
   * 获取教师的课程分配列表
   */
  public static async getTeacherAssignments(teacherId: number) {
    console.log('[CustomCourseService] getTeacherAssignments called, teacherId:', teacherId);
    console.log('[CustomCourseService] CourseAssignment:', typeof CourseAssignment);
    console.log('[CustomCourseService] CourseAssignment.modelName:', (CourseAssignment as any)?.modelName);
    console.log('[CustomCourseService] CourseAssignment.tableName:', (CourseAssignment as any)?.tableName);

    try {
      // 先尝试简单查询，不使用 include
      console.log('[CustomCourseService] 开始执行 findAll...');
      const assignments = await CourseAssignment.findAll({
        attributes: ['id', 'course_id', 'teacher_id', 'class_id', 'assigned_by', 'assigned_at', 'status', 'start_date', 'expected_end_date', 'is_active'],
        where: { teacher_id: teacherId, is_active: true }
      });
      console.log('[CustomCourseService] findAll 完成, assignments:', assignments?.length);

      return assignments;
    } catch (error: any) {
      console.error('[CustomCourseService] 查询失败:', error.message);
      console.error('[CustomCourseService] 错误堆栈:', error.stack);
      throw error;
    }
  }

  /**
   * 创建课程分配
   */
  public static async createAssignment(data: {
    course_id: number;
    teacher_id: number;
    class_id: number;
    assigned_by: number;
    start_date?: string;
    expected_end_date?: string;
    notes?: string;
  }) {
    // 检查是否已存在相同的分配
    const existing = await CourseAssignment.findOne({
      where: {
        course_id: data.course_id,
        teacher_id: data.teacher_id,
        class_id: data.class_id,
        is_active: true
      }
    });

    if (existing) {
      throw new Error('该课程已分配给此教师和班级');
    }

    const assignment = await CourseAssignment.create({
      ...data,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      expected_end_date: data.expected_end_date ? new Date(data.expected_end_date) : undefined,
      assigned_at: new Date(),
      status: 'assigned'
    });

    return assignment;
  }

  /**
   * 更新课程分配
   */
  public static async updateAssignment(assignmentId: number, data: Partial<{
    status: string;
    start_date: string;
    expected_end_date: string;
    actual_end_date: string;
    notes: string;
  }>) {
    const assignment = await CourseAssignment.findByPk(assignmentId);
    if (!assignment) {
      throw new Error('分配记录不存在');
    }

    const updateData = {
      ...data,
      status: data.status as any,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      expected_end_date: data.expected_end_date ? new Date(data.expected_end_date) : undefined,
      actual_end_date: data.actual_end_date ? new Date(data.actual_end_date) : undefined
    };
    await assignment.update(updateData);
    return assignment;
  }

  /**
   * 取消课程分配（软删除）
   */
  public static async cancelAssignment(assignmentId: number) {
    const assignment = await CourseAssignment.findByPk(assignmentId);
    if (!assignment) {
      throw new Error('分配记录不存在');
    }

    await assignment.update({ is_active: false });
    return assignment;
  }

  /**
   * 获取分配统计数据
   */
  public static async getAssignmentStats() {
    const totalAssignments = await CourseAssignment.count({ where: { is_active: true } });

    const statusCounts = await CourseAssignment.findAll({
      where: { is_active: true },
      attributes: [
        'status',
        [fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const stats: any = {
      total: totalAssignments,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      paused: 0
    };

    statusCounts.forEach((item: any) => {
      stats[item.status] = parseInt(item.count);
    });

    return stats;
  }
}


