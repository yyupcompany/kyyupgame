import { Request, Response } from 'express';
import { TeachingCenterService } from '../services/teaching-center.service';
import { getCurrentSemester } from '../utils/semester-helper';
import RoleCacheService from '../services/role-cache.service';

/**
 * 教学中心控制器
 */
export class TeachingCenterController {

  /**
   * 获取课程进度统计数据
   */
  public static async getCourseProgressStats(req: Request, res: Response) {
    try {
      const { semester, academic_year, class_id } = req.query;
      const userId = req.user?.id;

      const filters = {
        semester: semester as string,
        academic_year: academic_year as string,
        class_id: class_id ? parseInt(class_id as string) : undefined
      };

      // 尝试从缓存获取
      const cacheKey = `course_progress:${JSON.stringify(filters)}`;
      const cachedData = await RoleCacheService.getTeacherData(userId, cacheKey);

      if (cachedData) {
        console.log('✅ 从缓存获取课程进度统计数据');
        return res.json({
          success: true,
          data: cachedData,
          cached: true
        });
      }

      const data = await TeachingCenterService.getCourseProgressStats(filters);

      // 缓存数据（5分钟）
      await RoleCacheService.setTeacherData(userId, cacheKey, data, 300);

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.error('获取课程进度统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取课程进度统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取班级详细达标情况
   */
  public static async getClassDetailedProgress(req: Request, res: Response) {
    try {
      const { classId, coursePlanId } = req.params;

      const data = await TeachingCenterService.getClassDetailedProgress(
        parseInt(classId),
        parseInt(coursePlanId)
      );

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.error('获取班级详细进度失败:', error);
      const statusCode = error instanceof Error && error.message.includes('不存在') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: '获取班级详细进度失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 教师确认完成课程
   */
  public static async confirmCourseCompletion(req: Request, res: Response) {
    try {
      const { progressId } = req.params;
      const {
        attendance_count,
        target_achieved_count,
        session_content,
        notes
      } = req.body;
      const teacherId = req.user?.id; // 从认证中间件获取

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const data = await TeachingCenterService.confirmCourseCompletion(
        parseInt(progressId),
        teacherId,
        {
          attendance_count,
          target_achieved_count,
          session_content,
          notes
        }
      );

      res.json({
        success: true,
        message: '课程完成确认成功',
        data
      });

    } catch (error) {
      console.error('确认课程完成失败:', error);
      const statusCode = error instanceof Error && error.message.includes('不存在') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: '确认课程完成失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 户外训练相关API ====================

  /**
   * 获取户外训练统计数据
   */
  public static async getOutdoorTrainingStats(req: Request, res: Response) {
    try {
      // 动态获取当前学期，而不是硬编码
      const currentSemester = getCurrentSemester();
      const { semester = currentSemester.semester, academicYear = currentSemester.academicYear } = req.query;

      // 获取用户信息
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;

      const stats = await TeachingCenterService.getOutdoorTrainingStats(
        semester as string,
        academicYear as string,
        userId,
        userRole
      );

      res.json({
        success: true,
        message: '获取户外训练统计成功',
        data: stats
      });
    } catch (error) {
      console.error('获取户外训练统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取户外训练统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取班级户外训练详情
   */
  public static async getClassOutdoorTrainingDetails(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { semester = '2024春季', academicYear = '2024-2025' } = req.query;

      const details = await TeachingCenterService.getClassOutdoorTrainingDetails(
        parseInt(classId),
        semester as string,
        academicYear as string
      );

      res.json({
        success: true,
        message: '获取班级户外训练详情成功',
        data: details
      });
    } catch (error) {
      console.error('获取班级户外训练详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取班级户外训练详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 记录户外训练活动
   */
  public static async recordOutdoorTraining(req: Request, res: Response) {
    try {
      const trainingData = req.body;
      const teacherId = req.user?.id;

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const result = await TeachingCenterService.recordOutdoorTraining({
        ...trainingData,
        teacher_id: teacherId
      });

      res.json({
        success: true,
        message: '户外训练记录成功',
        data: result
      });
    } catch (error) {
      console.error('记录户外训练失败:', error);
      res.status(500).json({
        success: false,
        message: '记录户外训练失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 校外展示相关API ====================

  /**
   * 获取校外展示统计数据
   */
  public static async getExternalDisplayStats(req: Request, res: Response) {
    try {
      // 动态获取当前学期，而不是硬编码
      const currentSemester = getCurrentSemester();
      const { semester = currentSemester.semester, academicYear = currentSemester.academicYear } = req.query;

      // 获取用户信息
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;

      const stats = await TeachingCenterService.getExternalDisplayStats(
        semester as string,
        academicYear as string,
        userId,
        userRole
      );

      res.json({
        success: true,
        message: '获取校外展示统计成功',
        data: stats
      });
    } catch (error) {
      console.error('获取校外展示统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取校外展示统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取班级校外展示详情
   */
  public static async getClassExternalDisplayDetails(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { semester = '2024春季', academicYear = '2024-2025' } = req.query;

      const details = await TeachingCenterService.getClassExternalDisplayDetails(
        parseInt(classId),
        semester as string,
        academicYear as string
      );

      res.json({
        success: true,
        message: '获取班级校外展示详情成功',
        data: details
      });
    } catch (error) {
      console.error('获取班级校外展示详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取班级校外展示详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 记录校外展示活动
   */
  public static async recordExternalDisplay(req: Request, res: Response) {
    try {
      const displayData = req.body;
      const teacherId = req.user?.id;

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const result = await TeachingCenterService.recordExternalDisplay({
        ...displayData,
        teacher_id: teacherId
      });

      res.json({
        success: true,
        message: '校外展示记录成功',
        data: result
      });
    } catch (error) {
      console.error('记录校外展示失败:', error);
      res.status(500).json({
        success: false,
        message: '记录校外展示失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 全员锦标赛相关API ====================

  /**
   * 获取锦标赛统计数据
   */
  public static async getChampionshipStats(req: Request, res: Response) {
    try {
      // 动态获取当前学期，而不是硬编码
      const currentSemester = getCurrentSemester();
      const { semester = currentSemester.semester, academicYear = currentSemester.academicYear } = req.query;

      // 获取用户信息
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;

      const stats = await TeachingCenterService.getChampionshipStats(
        semester as string,
        academicYear as string,
        userId,
        userRole
      );

      res.json({
        success: true,
        message: '获取锦标赛统计成功',
        data: stats
      });
    } catch (error) {
      console.error('获取锦标赛统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取锦标赛统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取锦标赛详情
   */
  public static async getChampionshipDetails(req: Request, res: Response) {
    try {
      const { championshipId } = req.params;

      const details = await TeachingCenterService.getChampionshipDetails(
        parseInt(championshipId)
      );

      if (!details) {
        return res.status(404).json({
          success: false,
          message: '锦标赛记录不存在'
        });
      }

      res.json({
        success: true,
        message: '获取锦标赛详情成功',
        data: details
      });
    } catch (error) {
      console.error('获取锦标赛详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取锦标赛详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 创建锦标赛
   */
  public static async createChampionship(req: Request, res: Response) {
    try {
      const championshipData = req.body;
      const organizerId = req.user?.id;

      if (!organizerId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const result = await TeachingCenterService.createChampionship({
        ...championshipData,
        organizer_id: organizerId
      });

      res.json({
        success: true,
        message: '锦标赛创建成功',
        data: result
      });
    } catch (error) {
      console.error('创建锦标赛失败:', error);
      res.status(500).json({
        success: false,
        message: '创建锦标赛失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新锦标赛状态
   */
  public static async updateChampionshipStatus(req: Request, res: Response) {
    try {
      const { championshipId } = req.params;
      const { status, achievementRates } = req.body;

      const result = await TeachingCenterService.updateChampionshipStatus(
        parseInt(championshipId),
        status,
        achievementRates
      );

      res.json({
        success: true,
        message: '锦标赛状态更新成功',
        data: result
      });
    } catch (error) {
      console.error('更新锦标赛状态失败:', error);
      res.status(500).json({
        success: false,
        message: '更新锦标赛状态失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // ==================== 媒体管理相关API ====================

  /**
   * 上传教学媒体文件
   */
  public static async uploadTeachingMedia(req: Request, res: Response) {
    try {
      const { recordType, recordId, mediaType, description } = req.body;
      const teacherId = req.user?.id;

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 这里应该处理文件上传逻辑
      // 暂时返回成功响应
      const result = await TeachingCenterService.uploadTeachingMedia({
        record_type: recordType,
        record_id: recordId,
        media_type: mediaType,
        description,
        uploader_id: teacherId
      });

      res.json({
        success: true,
        message: '媒体文件上传成功',
        data: result
      });
    } catch (error) {
      console.error('上传媒体文件失败:', error);
      res.status(500).json({
        success: false,
        message: '上传媒体文件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取教学媒体列表
   */
  public static async getTeachingMediaList(req: Request, res: Response) {
    try {
      const { recordType, recordId, mediaType } = req.query;

      const mediaList = await TeachingCenterService.getTeachingMediaList({
        record_type: recordType as string,
        record_id: recordId ? parseInt(recordId as string) : undefined,
        media_type: mediaType as string
      });

      res.json({
        success: true,
        message: '获取媒体列表成功',
        data: mediaList
      });
    } catch (error) {
      console.error('获取媒体列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取媒体列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}
