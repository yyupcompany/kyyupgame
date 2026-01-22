import { Op } from 'sequelize';
import { CourseSchedule } from '../models/course-schedule.model';
import { CustomCourse } from '../models/custom-course.model';
import { User } from '../models/user.model';
import { Class } from '../models/class.model';
import { Teacher } from '../models/teacher.model';
import { Notification } from '../models/notification.model';

/**
 * 课程延期告警服务
 * 用于检测和发送课程延期告警
 */
export class CourseAlertService {

  /**
   * 告警触发条件配置
   */
  private static readonly ALERT_CONFIG = {
    // 即将到期提醒天数
    WARNING_DAYS: 3,
    // 进度落后比例阈值
    PROGRESS_BEHIND_THRESHOLD: 0.3,
    // 告警通知间隔天数（避免重复发送）
    NOTIFICATION_INTERVAL_DAYS: 1
  };

  /**
   * 检查所有课程的延期情况
   * 可由定时任务调用
   */
  public static async checkAllDelayedCourses(): Promise<{
    checked: number;
    warned: number;
    critical: number;
    notifications: number;
  }> {
    const now = new Date();
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + this.ALERT_CONFIG.WARNING_DAYS);

    console.log(`[课程告警] 开始检查课程延期情况 - ${now.toISOString()}`);

    // 查找需要告警的排期
    const schedules = await CourseSchedule.findAll({
      where: {
        schedule_status: { [Op.notIn]: ['completed', 'cancelled'] },
        [Op.or]: [
          // 已延期
          { planned_end_date: { [Op.lt]: now } },
          // 即将到期
          { 
            planned_end_date: { 
              [Op.gte]: now,
              [Op.lte]: warningDate
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
      ]
    });

    let warnedCount = 0;
    let criticalCount = 0;
    let notificationCount = 0;

    for (const schedule of schedules) {
      const endDate = new Date(schedule.planned_end_date);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // 确定告警级别
      const alertLevel = daysRemaining < 0 ? 'critical' : 'warning';
      
      if (alertLevel === 'critical') {
        criticalCount++;
      } else {
        warnedCount++;
      }

      // 更新排期的告警级别和延期天数
      const delayDays = daysRemaining < 0 ? Math.abs(daysRemaining) : 0;
      await schedule.update({
        alert_level: alertLevel,
        delay_days: delayDays,
        schedule_status: daysRemaining < 0 ? 'delayed' : schedule.schedule_status
      });

      // 检查是否需要发送通知
      const shouldNotify = await this.shouldSendNotification(schedule);
      if (shouldNotify) {
        await this.sendAlertNotification(schedule, alertLevel, daysRemaining);
        await schedule.update({
          alert_sent: true,
          alert_sent_at: now
        });
        notificationCount++;
      }
    }

    // 检查进度落后的排期
    const progressBehindSchedules = await this.checkProgressBehind();
    
    console.log(`[课程告警] 检查完成 - 检查: ${schedules.length}, 警告: ${warnedCount}, 严重: ${criticalCount}, 通知: ${notificationCount}`);

    return {
      checked: schedules.length,
      warned: warnedCount,
      critical: criticalCount,
      notifications: notificationCount
    };
  }

  /**
   * 检查进度落后的排期
   */
  private static async checkProgressBehind(): Promise<number> {
    const now = new Date();
    
    const schedules = await CourseSchedule.findAll({
      where: {
        schedule_status: 'in_progress'
      }
    });

    let behindCount = 0;

    for (const schedule of schedules) {
      const startDate = new Date(schedule.planned_start_date);
      const endDate = new Date(schedule.planned_end_date);
      
      // 计算理论进度
      const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const elapsedDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const expectedProgress = Math.min(elapsedDays / totalDays, 1);
      
      // 计算实际进度
      const actualProgress = schedule.completed_sessions / schedule.total_sessions;
      
      // 检查是否落后超过阈值
      if (actualProgress < expectedProgress * (1 - this.ALERT_CONFIG.PROGRESS_BEHIND_THRESHOLD)) {
        behindCount++;
        
        // 更新告警级别
        if (schedule.alert_level === 'none') {
          await schedule.update({ alert_level: 'warning' });
        }
      }
    }

    return behindCount;
  }

  /**
   * 判断是否需要发送通知
   * 避免重复发送
   */
  private static async shouldSendNotification(schedule: CourseSchedule): Promise<boolean> {
    if (!schedule.alert_sent) {
      return true;
    }

    if (!schedule.alert_sent_at) {
      return true;
    }

    // 检查距离上次发送是否超过间隔
    const now = new Date();
    const lastSent = new Date(schedule.alert_sent_at);
    const daysSinceLastNotification = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastNotification >= this.ALERT_CONFIG.NOTIFICATION_INTERVAL_DAYS;
  }

  /**
   * 发送告警通知
   */
  private static async sendAlertNotification(
    schedule: CourseSchedule, 
    alertLevel: 'warning' | 'critical',
    daysRemaining: number
  ): Promise<void> {
    const course = schedule.course;
    const className = schedule.class?.class_name || '未知班级';
    const teacherName = schedule.teacher?.name || '未知教师';

    // 构建通知消息
    let message = '';
    if (alertLevel === 'critical') {
      message = `课程【${course?.course_name}】已延期${Math.abs(daysRemaining)}天！班级：${className}，教师：${teacherName}，请及时处理。`;
    } else if (daysRemaining === 0) {
      message = `课程【${course?.course_name}】今日到期！班级：${className}，教师：${teacherName}，请关注完成情况。`;
    } else {
      message = `课程【${course?.course_name}】将在${daysRemaining}天后到期。班级：${className}，教师：${teacherName}。`;
    }

    // 发送站内通知给相关人员
    // 1. 通知教师
    if (schedule.teacher_id) {
      await this.createNotification({
        user_id: schedule.teacher_id,
        title: alertLevel === 'critical' ? '⚠️ 课程延期告警' : '📢 课程即将到期提醒',
        content: message,
        type: 'system',
        priority: alertLevel === 'critical' ? 'high' : 'normal',
        related_type: 'course_schedule',
        related_id: schedule.id
      });
    }

    // 2. 通知创建者（园长）
    if (schedule.created_by && schedule.created_by !== schedule.teacher_id) {
      await this.createNotification({
        user_id: schedule.created_by,
        title: alertLevel === 'critical' ? '⚠️ 课程延期告警' : '📢 课程即将到期提醒',
        content: message,
        type: 'system',
        priority: alertLevel === 'critical' ? 'high' : 'normal',
        related_type: 'course_schedule',
        related_id: schedule.id
      });
    }

    console.log(`[课程告警] 已发送通知 - 课程: ${course?.course_name}, 级别: ${alertLevel}`);
  }

  /**
   * 创建通知记录
   */
  private static async createNotification(data: {
    user_id: number;
    title: string;
    content: string;
    type: string;
    priority: string;
    related_type?: string;
    related_id?: number;
  }): Promise<void> {
    try {
      await Notification.create({
        ...data,
        status: 'unread'
      } as any);
    } catch (error) {
      console.error('[课程告警] 创建通知失败:', error);
    }
  }

  /**
   * 获取告警统计数据
   */
  public static async getAlertStats(): Promise<{
    total_alerts: number;
    critical_count: number;
    warning_count: number;
    today_new: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [criticalCount, warningCount, todayNew] = await Promise.all([
      CourseSchedule.count({
        where: { alert_level: 'critical' }
      }),
      CourseSchedule.count({
        where: { alert_level: 'warning' }
      }),
      CourseSchedule.count({
        where: {
          alert_level: { [Op.ne]: 'none' },
          updated_at: { [Op.gte]: todayStart }
        }
      })
    ]);

    return {
      total_alerts: criticalCount + warningCount,
      critical_count: criticalCount,
      warning_count: warningCount,
      today_new: todayNew
    };
  }

  /**
   * 手动标记告警已处理
   */
  public static async dismissAlert(scheduleId: number, notes?: string): Promise<boolean> {
    const schedule = await CourseSchedule.findByPk(scheduleId);
    if (!schedule) return false;

    await schedule.update({
      alert_level: 'none',
      delay_reason: notes
    });

    return true;
  }

  /**
   * 获取教师的待处理告警数量
   */
  public static async getTeacherAlertCount(teacherId: number): Promise<number> {
    return CourseSchedule.count({
      where: {
        teacher_id: teacherId,
        alert_level: { [Op.ne]: 'none' }
      }
    });
  }
}

export default CourseAlertService;


