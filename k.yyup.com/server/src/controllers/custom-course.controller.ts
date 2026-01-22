import { Request, Response } from 'express';
import { CustomCourseService } from '../services/custom-course.service';

/**
 * 自定义课程控制器
 */
export class CustomCourseController {

  /**
   * 获取课程列表
   */
  public static async getCourses(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 10,
        course_type,
        status,
        age_group,
        semester,
        academic_year,
        search
      } = req.query;

      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;

      const result = await CustomCourseService.getCourses({
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        course_type: course_type as string,
        status: status as string,
        age_group: age_group as string,
        semester: semester as string,
        academic_year: academic_year as string,
        search: search as string,
        userId,
        userRole
      });

      res.json({
        success: true,
        message: '获取课程列表成功',
        data: result
      });
    } catch (error) {
      console.error('获取课程列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取课程列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取单个课程详情
   */
  public static async getCourseById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const course = await CustomCourseService.getCourseById(parseInt(id));

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '课程不存在'
        });
      }

      res.json({
        success: true,
        message: '获取课程详情成功',
        data: course
      });
    } catch (error) {
      console.error('获取课程详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取课程详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 创建课程
   */
  public static async createCourse(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const courseData = {
        ...req.body,
        created_by: userId
      };

      const course = await CustomCourseService.createCourse(courseData);

      res.status(201).json({
        success: true,
        message: '创建课程成功',
        data: course
      });
    } catch (error) {
      console.error('创建课程失败:', error);
      res.status(500).json({
        success: false,
        message: '创建课程失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新课程
   */
  public static async updateCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const courseData = req.body;

      const course = await CustomCourseService.updateCourse(parseInt(id), courseData);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '课程不存在'
        });
      }

      res.json({
        success: true,
        message: '更新课程成功',
        data: course
      });
    } catch (error) {
      console.error('更新课程失败:', error);
      res.status(500).json({
        success: false,
        message: '更新课程失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 删除课程
   */
  public static async deleteCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await CustomCourseService.deleteCourse(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: '课程不存在'
        });
      }

      res.json({
        success: true,
        message: '删除课程成功'
      });
    } catch (error) {
      console.error('删除课程失败:', error);
      res.status(500).json({
        success: false,
        message: '删除课程失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 发布课程
   */
  public static async publishCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const course = await CustomCourseService.publishCourse(parseInt(id));

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '课程不存在'
        });
      }

      res.json({
        success: true,
        message: '发布课程成功',
        data: course
      });
    } catch (error) {
      console.error('发布课程失败:', error);
      res.status(500).json({
        success: false,
        message: '发布课程失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 归档课程
   */
  public static async archiveCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const course = await CustomCourseService.archiveCourse(parseInt(id));

      if (!course) {
        return res.status(404).json({
          success: false,
          message: '课程不存在'
        });
      }

      res.json({
        success: true,
        message: '归档课程成功',
        data: course
      });
    } catch (error) {
      console.error('归档课程失败:', error);
      res.status(500).json({
        success: false,
        message: '归档课程失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 课程内容管理 ====================

  /**
   * 获取课程内容列表
   */
  public static async getCourseContents(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const contents = await CustomCourseService.getCourseContents(parseInt(courseId));

      res.json({
        success: true,
        message: '获取课程内容成功',
        data: contents
      });
    } catch (error) {
      console.error('获取课程内容失败:', error);
      res.status(500).json({
        success: false,
        message: '获取课程内容失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 添加课程内容
   */
  public static async addCourseContent(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const contentData = {
        ...req.body,
        course_id: parseInt(courseId)
      };

      const content = await CustomCourseService.addCourseContent(contentData);

      res.status(201).json({
        success: true,
        message: '添加课程内容成功',
        data: content
      });
    } catch (error) {
      console.error('添加课程内容失败:', error);
      res.status(500).json({
        success: false,
        message: '添加课程内容失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新课程内容
   */
  public static async updateCourseContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const contentData = req.body;

      const content = await CustomCourseService.updateCourseContent(parseInt(contentId), contentData);

      if (!content) {
        return res.status(404).json({
          success: false,
          message: '课程内容不存在'
        });
      }

      res.json({
        success: true,
        message: '更新课程内容成功',
        data: content
      });
    } catch (error) {
      console.error('更新课程内容失败:', error);
      res.status(500).json({
        success: false,
        message: '更新课程内容失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 删除课程内容
   */
  public static async deleteCourseContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;

      const result = await CustomCourseService.deleteCourseContent(parseInt(contentId));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: '课程内容不存在'
        });
      }

      res.json({
        success: true,
        message: '删除课程内容成功'
      });
    } catch (error) {
      console.error('删除课程内容失败:', error);
      res.status(500).json({
        success: false,
        message: '删除课程内容失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新课程内容排序
   */
  public static async reorderCourseContents(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { contentIds } = req.body;  // 按顺序排列的内容ID数组

      await CustomCourseService.reorderCourseContents(parseInt(courseId), contentIds);

      res.json({
        success: true,
        message: '更新排序成功'
      });
    } catch (error) {
      console.error('更新排序失败:', error);
      res.status(500).json({
        success: false,
        message: '更新排序失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 课程排期管理 ====================

  /**
   * 获取课程排期列表
   */
  public static async getCourseSchedules(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { class_id, teacher_id, status } = req.query;

      const schedules = await CustomCourseService.getCourseSchedules({
        course_id: parseInt(courseId),
        class_id: class_id ? parseInt(class_id as string) : undefined,
        teacher_id: teacher_id ? parseInt(teacher_id as string) : undefined,
        status: status as string
      });

      res.json({
        success: true,
        message: '获取课程排期成功',
        data: schedules
      });
    } catch (error) {
      console.error('获取课程排期失败:', error);
      res.status(500).json({
        success: false,
        message: '获取课程排期失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 创建课程排期
   */
  public static async createCourseSchedule(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const scheduleData = {
        ...req.body,
        course_id: parseInt(courseId),
        created_by: userId
      };

      const schedule = await CustomCourseService.createCourseSchedule(scheduleData);

      res.status(201).json({
        success: true,
        message: '创建课程排期成功',
        data: schedule
      });
    } catch (error) {
      console.error('创建课程排期失败:', error);
      res.status(500).json({
        success: false,
        message: '创建课程排期失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新课程排期
   */
  public static async updateCourseSchedule(req: Request, res: Response) {
    try {
      const { scheduleId } = req.params;
      const scheduleData = req.body;

      const schedule = await CustomCourseService.updateCourseSchedule(parseInt(scheduleId), scheduleData);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: '课程排期不存在'
        });
      }

      res.json({
        success: true,
        message: '更新课程排期成功',
        data: schedule
      });
    } catch (error) {
      console.error('更新课程排期失败:', error);
      res.status(500).json({
        success: false,
        message: '更新课程排期失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 删除课程排期
   */
  public static async deleteCourseSchedule(req: Request, res: Response) {
    try {
      const { scheduleId } = req.params;

      const result = await CustomCourseService.deleteCourseSchedule(parseInt(scheduleId));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: '课程排期不存在'
        });
      }

      res.json({
        success: true,
        message: '删除课程排期成功'
      });
    } catch (error) {
      console.error('删除课程排期失败:', error);
      res.status(500).json({
        success: false,
        message: '删除课程排期失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 教师确认课程排期
   */
  public static async confirmSchedule(req: Request, res: Response) {
    try {
      const { scheduleId } = req.params;
      const teacherId = req.user?.id;

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const schedule = await CustomCourseService.confirmSchedule(parseInt(scheduleId), teacherId);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: '课程排期不存在'
        });
      }

      res.json({
        success: true,
        message: '确认课程排期成功',
        data: schedule
      });
    } catch (error) {
      console.error('确认课程排期失败:', error);
      res.status(500).json({
        success: false,
        message: '确认课程排期失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 教师端课程查看 ====================

  /**
   * 获取教师的课程列表
   */
  public static async getTeacherCourses(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      const { status, class_id } = req.query;

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const courses = await CustomCourseService.getTeacherCourses({
        teacher_id: teacherId,
        status: status as string,
        class_id: class_id ? parseInt(class_id as string) : undefined
      });

      res.json({
        success: true,
        message: '获取教师课程列表成功',
        data: courses
      });
    } catch (error) {
      console.error('获取教师课程列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取教师课程列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== AI互动课程关联 ====================

  /**
   * 关联AI互动课程
   */
  public static async linkInteractiveCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { creative_curriculum_id, course_content_id, link_type } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const link = await CustomCourseService.linkInteractiveCourse({
        course_id: parseInt(courseId),
        creative_curriculum_id,
        course_content_id,
        link_type: link_type || 'reference',
        added_by: userId
      });

      res.status(201).json({
        success: true,
        message: '关联互动课程成功',
        data: link
      });
    } catch (error) {
      console.error('关联互动课程失败:', error);
      res.status(500).json({
        success: false,
        message: '关联互动课程失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 取消关联AI互动课程
   */
  public static async unlinkInteractiveCourse(req: Request, res: Response) {
    try {
      const { linkId } = req.params;

      const result = await CustomCourseService.unlinkInteractiveCourse(parseInt(linkId));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: '关联记录不存在'
        });
      }

      res.json({
        success: true,
        message: '取消关联成功'
      });
    } catch (error) {
      console.error('取消关联失败:', error);
      res.status(500).json({
        success: false,
        message: '取消关联失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取课程的互动课程关联列表
   */
  public static async getCourseInteractiveLinks(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const links = await CustomCourseService.getCourseInteractiveLinks(parseInt(courseId));

      res.json({
        success: true,
        message: '获取互动课程关联列表成功',
        data: links
      });
    } catch (error) {
      console.error('获取互动课程关联列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取互动课程关联列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 审核互动课程关联
   */
  public static async approveInteractiveLink(req: Request, res: Response) {
    try {
      const { linkId } = req.params;
      const { approval_status, approval_notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const link = await CustomCourseService.approveInteractiveLink(parseInt(linkId), {
        approved_by: userId,
        approval_status,
        approval_notes
      });

      if (!link) {
        return res.status(404).json({
          success: false,
          message: '关联记录不存在'
        });
      }

      res.json({
        success: true,
        message: '审核完成',
        data: link
      });
    } catch (error) {
      console.error('审核失败:', error);
      res.status(500).json({
        success: false,
        message: '审核失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 统计数据 ====================

  /**
   * 获取课程统计数据
   */
  public static async getCourseStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;

      const stats = await CustomCourseService.getCourseStats(userId, userRole);

      res.json({
        success: true,
        message: '获取统计数据成功',
        data: stats
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取延期告警列表
   */
  public static async getDelayedSchedules(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;

      const schedules = await CustomCourseService.getDelayedSchedules(userId, userRole);

      res.json({
        success: true,
        message: '获取延期告警列表成功',
        data: schedules
      });
    } catch (error) {
      console.error('获取延期告警列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取延期告警列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 课程分配管理 ====================

  /**
   * 获取课程的分配列表
   */
  public static async getCourseAssignments(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const assignments = await CustomCourseService.getCourseAssignments(parseInt(courseId));

      res.json({
        success: true,
        message: '获取课程分配列表成功',
        data: assignments
      });
    } catch (error) {
      console.error('获取课程分配列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取课程分配列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取教师的课程分配列表
   */
  public static async getTeacherAssignments(req: Request, res: Response) {
    try {
      const teacherId = (req as any).user?.id;

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const assignments = await CustomCourseService.getTeacherAssignments(teacherId);

      res.json({
        success: true,
        message: '获取教师课程分配列表成功',
        data: assignments
      });
    } catch (error) {
      console.error('获取教师课程分配列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取教师课程分配列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 创建课程分配
   */
  public static async createAssignment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { course_id, teacher_id, class_id, start_date, expected_end_date, notes } = req.body;

      const assignment = await CustomCourseService.createAssignment({
        course_id,
        teacher_id,
        class_id,
        assigned_by: userId,
        start_date,
        expected_end_date,
        notes
      });

      res.status(201).json({
        success: true,
        message: '课程分配成功',
        data: assignment
      });
    } catch (error) {
      console.error('课程分配失败:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '课程分配失败'
      });
    }
  }

  /**
   * 更新课程分配
   */
  public static async updateAssignment(req: Request, res: Response) {
    try {
      const { assignmentId } = req.params;
      const { status, start_date, expected_end_date, actual_end_date, notes } = req.body;

      const assignment = await CustomCourseService.updateAssignment(parseInt(assignmentId), {
        status,
        start_date,
        expected_end_date,
        actual_end_date,
        notes
      });

      res.json({
        success: true,
        message: '更新分配成功',
        data: assignment
      });
    } catch (error) {
      console.error('更新分配失败:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '更新分配失败'
      });
    }
  }

  /**
   * 取消课程分配
   */
  public static async cancelAssignment(req: Request, res: Response) {
    try {
      const { assignmentId } = req.params;

      await CustomCourseService.cancelAssignment(parseInt(assignmentId));

      res.json({
        success: true,
        message: '取消分配成功'
      });
    } catch (error) {
      console.error('取消分配失败:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '取消分配失败'
      });
    }
  }

  /**
   * 获取分配统计数据
   */
  public static async getAssignmentStats(req: Request, res: Response) {
    try {
      const stats = await CustomCourseService.getAssignmentStats();

      res.json({
        success: true,
        message: '获取分配统计数据成功',
        data: stats
      });
    } catch (error) {
      console.error('获取分配统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取分配统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}


