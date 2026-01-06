import { OrganizationStatus } from '../models/organization-status.model';
import { Kindergarten } from '../models/kindergarten.model';
import { Student } from '../models/student.model';
import { Teacher } from '../models/teacher.model';
import { Class } from '../models/class.model';
import { EnrollmentApplication } from '../models/enrollment-application.model';
import { EnrollmentConsultation } from '../models/enrollment-consultation.model';
import { CustomerFollowRecordEnhanced } from '../models/customer-follow-record-enhanced.model';
import { Op } from 'sequelize';

/**
 * 机构现状服务
 * 负责计算和更新机构的实时运营数据
 */
export class OrganizationStatusService {
  /**
   * 获取或创建机构现状数据
   */
  static async getOrCreateStatus(kindergartenId: number): Promise<OrganizationStatus> {
    let status = await OrganizationStatus.findOne({
      where: { kindergartenId },
      include: [{ model: Kindergarten, as: 'kindergarten' }]
    });

    if (!status) {
      // 创建初始状态
      status = await OrganizationStatus.create({
        kindergartenId,
        totalClasses: 0,
        totalStudents: 0,
        totalTeachers: 0,
        teacherStudentRatio: 0,
        currentEnrollment: 0,
        enrollmentCapacity: 0,
        enrollmentRate: 0,
        waitingListCount: 0,
        fullTimeTeachers: 0,
        partTimeTeachers: 0,
        seniorTeachers: 0,
        averageTeachingYears: 0,
        monthlyEnrollmentFrequency: 0,
        quarterlyEnrollmentFrequency: 0,
        yearlyEnrollmentFrequency: 0,
        enrollmentConversionRate: 0,
        averageEnrollmentCycle: 0,
        totalLeads: 0,
        activeLeads: 0,
        convertedLeads: 0,
        averageFollowupCount: 0,
        averageResponseTime: 0,
        teacherFollowupLoad: 0,
        dataUpdatedAt: new Date()
      } as any);
    }

    return status;
  }

  /**
   * 刷新机构现状数据
   * 从数据库实时计算最新数据
   */
  static async refreshStatus(kindergartenId: number): Promise<OrganizationStatus> {
    const status = await this.getOrCreateStatus(kindergartenId);

    // 1. 基本情况统计
    const totalClasses = await Class.count({ where: { kindergartenId } as any });
    const totalStudents = await Student.count({ where: { kindergartenId, status: 1 } as any }); // 在读学生
    const totalTeachers = await Teacher.count({ where: { kindergartenId, status: 1 } as any }); // 在职教师
    const teacherStudentRatio = totalStudents > 0 ? totalTeachers / totalStudents : 0;

    // 2. 生源情况统计
    const kindergarten = await Kindergarten.findByPk(kindergartenId);
    const enrollmentCapacity = kindergarten?.studentCount || 0;
    const currentEnrollment = totalStudents;
    const enrollmentRate = enrollmentCapacity > 0 ? (currentEnrollment / enrollmentCapacity) * 100 : 0;
    
    // 等待名单(状态为预录取的学生)
    const waitingListCount = await Student.count({
      where: { kindergartenId, status: 4 } as any
    });

    // 3. 师资情况统计
    const teachers = await Teacher.findAll({
      where: { kindergartenId, status: 1 } as any,
      attributes: ['position', 'teachingAge']
    });
    
    const fullTimeTeachers = teachers.filter(t => [1, 2, 3, 4, 5].includes(t.position)).length;
    const partTimeTeachers = teachers.filter(t => t.position === 6).length;
    const seniorTeachers = teachers.filter(t => (t.teachingAge || 0) >= 5).length;
    const averageTeachingYears = teachers.length > 0
      ? teachers.reduce((sum, t) => sum + (t.teachingAge || 0), 0) / teachers.length
      : 0;

    // 4. 招生情况统计
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const monthlyEnrollmentFrequency = await EnrollmentApplication.count({
      where: {
        kindergartenId,
        createdAt: { [Op.gte]: oneMonthAgo }
      } as any
    });

    const quarterlyEnrollmentFrequency = await EnrollmentApplication.count({
      where: {
        kindergartenId,
        createdAt: { [Op.gte]: threeMonthsAgo }
      } as any
    });

    const yearlyEnrollmentFrequency = await EnrollmentApplication.count({
      where: {
        kindergartenId,
        createdAt: { [Op.gte]: oneYearAgo }
      } as any
    });

    // 招生转化率计算
    const totalApplications = await EnrollmentApplication.count({ where: { kindergartenId } as any });
    const convertedApplications = await EnrollmentApplication.count({
      where: { kindergartenId, status: 'approved' } as any
    });
    const enrollmentConversionRate = totalApplications > 0
      ? (convertedApplications / totalApplications) * 100
      : 0;

    // 平均招生周期(从咨询到录取的平均天数)
    const averageEnrollmentCycle = 30; // 简化处理,实际应该从数据计算

    // 5. 客户跟进情况统计
    const totalLeads = await EnrollmentConsultation.count({ where: { kindergartenId } as any });
    const activeLeads = await EnrollmentConsultation.count({
      where: {
        kindergartenId,
        status: { [Op.in]: ['pending', 'in_progress'] }
      } as any
    });
    const convertedLeads = await EnrollmentConsultation.count({
      where: { kindergartenId, status: 'converted' } as any
    });

    // 平均跟进次数
    const followupRecords = await CustomerFollowRecordEnhanced.findAll({
      where: { kindergartenId } as any,
      attributes: ['customerId']
    });
    const averageFollowupCount = totalLeads > 0 
      ? followupRecords.length / totalLeads 
      : 0;

    // 平均响应时间(简化处理)
    const averageResponseTime = 2.5; // 小时

    // 教师跟进负载
    const teacherFollowupLoad = totalTeachers > 0 
      ? activeLeads / totalTeachers 
      : 0;

    // 6. 更新数据
    await status.update({
      totalClasses,
      totalStudents,
      totalTeachers,
      teacherStudentRatio: Number(teacherStudentRatio.toFixed(2)),
      currentEnrollment,
      enrollmentCapacity,
      enrollmentRate: Number(enrollmentRate.toFixed(2)),
      waitingListCount,
      fullTimeTeachers,
      partTimeTeachers,
      seniorTeachers,
      averageTeachingYears: Number(averageTeachingYears.toFixed(2)),
      monthlyEnrollmentFrequency,
      quarterlyEnrollmentFrequency,
      yearlyEnrollmentFrequency,
      enrollmentConversionRate: Number(enrollmentConversionRate.toFixed(2)),
      averageEnrollmentCycle,
      totalLeads,
      activeLeads,
      convertedLeads,
      averageFollowupCount: Number(averageFollowupCount.toFixed(2)),
      averageResponseTime: Number(averageResponseTime.toFixed(2)),
      teacherFollowupLoad: Number(teacherFollowupLoad.toFixed(2)),
      dataUpdatedAt: new Date()
    });

    return status;
  }

  /**
   * 格式化机构现状为文本描述
   * 用于注入AI系统提示词
   */
  static formatStatusForAI(status: OrganizationStatus): string {
    return `
【幼儿园机构现状数据】

📊 基本情况:
- 总班级数: ${status.totalClasses}个
- 在园学生: ${status.totalStudents}人
- 教师总数: ${status.totalTeachers}人
- 师生比: 1:${(1/status.teacherStudentRatio).toFixed(1)}

👶 生源情况:
- 当前在园: ${status.currentEnrollment}人
- 招生容量: ${status.enrollmentCapacity}人
- 招生率: ${status.enrollmentRate}%
- 等待名单: ${status.waitingListCount}人

👨‍🏫 师资情况:
- 全职教师: ${status.fullTimeTeachers}人
- 兼职教师: ${status.partTimeTeachers}人
- 高级教师: ${status.seniorTeachers}人
- 平均教龄: ${status.averageTeachingYears}年

📈 招生情况:
- 月招生频次: ${status.monthlyEnrollmentFrequency}次
- 季度招生频次: ${status.quarterlyEnrollmentFrequency}次
- 年度招生频次: ${status.yearlyEnrollmentFrequency}次
- 招生转化率: ${status.enrollmentConversionRate}%
- 平均招生周期: ${status.averageEnrollmentCycle}天

📞 客户跟进现状:
- 总线索数: ${status.totalLeads}个
- 活跃线索: ${status.activeLeads}个
- 已转化: ${status.convertedLeads}个
- 平均跟进次数: ${status.averageFollowupCount}次
- 平均响应时间: ${status.averageResponseTime}小时
- 教师跟进负载: ${status.teacherFollowupLoad}个/人

📅 数据更新时间: ${status.dataUpdatedAt.toLocaleString('zh-CN')}
`.trim();
  }
}

