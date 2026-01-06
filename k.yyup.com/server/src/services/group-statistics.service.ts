import { Op } from 'sequelize';
import { Group } from '../models/group.model';
import { Kindergarten } from '../models/kindergarten.model';
import { Student } from '../models/student.model';
import { Teacher } from '../models/teacher.model';
import { Class } from '../models/class.model';
import { Activity } from '../models/activity.model';
import { EnrollmentApplication } from '../models/enrollment-application.model';

/**
 * 集团统计服务类
 */
export class GroupStatisticsService {
  /**
   * 获取集团统计数据
   */
  async getGroupStatistics(groupId: number) {
    // 获取集团信息
    const group = await Group.findByPk(groupId);
    if (!group) {
      throw new Error('集团不存在');
    }

    // 获取集团下的所有园所
    const kindergartens = await Kindergarten.findAll({
      where: { groupId },
      attributes: [
        'id', 'name', 'code', 'studentCount', 'teacherCount', 
        'classCount', 'area', 'buildingArea', 'isGroupHeadquarters'
      ]
    });

    const kindergartenIds = kindergartens.map(k => k.id);

    // 计算总容量
    const totalCapacity = kindergartens.reduce((sum, k) => sum + (k.classCount * 30), 0); // 假设每班30人

    // 计算入园率
    const enrollmentRate = totalCapacity > 0 
      ? ((group.totalStudents / totalCapacity) * 100).toFixed(2)
      : '0.00';

    // 计算平均值
    const avgStudentsPerKindergarten = kindergartens.length > 0
      ? Math.round(group.totalStudents / kindergartens.length)
      : 0;

    const avgTeachersPerKindergarten = kindergartens.length > 0
      ? Math.round(group.totalTeachers / kindergartens.length)
      : 0;

    // 园所详情
    const kindergartenDetails = kindergartens.map(k => ({
      id: k.id,
      name: k.name,
      code: k.code,
      studentCount: k.studentCount,
      teacherCount: k.teacherCount,
      classCount: k.classCount,
      capacity: k.classCount * 30,
      enrollmentRate: k.classCount > 0 
        ? ((k.studentCount / (k.classCount * 30)) * 100).toFixed(2)
        : '0.00',
      area: k.area,
      buildingArea: k.buildingArea,
      isHeadquarters: k.isGroupHeadquarters === 1
    }));

    return {
      kindergartenCount: group.kindergartenCount,
      totalStudents: group.totalStudents,
      totalTeachers: group.totalTeachers,
      totalClasses: group.totalClasses,
      totalCapacity,
      enrollmentRate: parseFloat(enrollmentRate),
      avgStudentsPerKindergarten,
      avgTeachersPerKindergarten,
      kindergartenDetails
    };
  }

  /**
   * 获取集团活动数据
   */
  async getGroupActivities(groupId: number, startDate?: Date, endDate?: Date) {
    // 获取集团下的所有园所ID
    const kindergartens = await Kindergarten.findAll({
      where: { groupId },
      attributes: ['id', 'name']
    });

    const kindergartenIds = kindergartens.map(k => k.id);

    if (kindergartenIds.length === 0) {
      return {
        totalActivities: 0,
        totalRegistrations: 0,
        totalParticipants: 0,
        byKindergarten: [],
        byType: []
      };
    }

    // 构建查询条件
    const where: any = {
      kindergartenId: { [Op.in]: kindergartenIds }
    };

    if (startDate && endDate) {
      where.startTime = {
        [Op.between]: [startDate, endDate]
      };
    }

    // 查询活动数据
    const activities = await Activity.findAll({
      where,
      attributes: ['id', 'kindergartenId', 'activityType', 'registeredCount', 'checkedInCount']
    });

    // 按园所统计
    const byKindergarten = kindergartens.map(k => {
      const kgActivities = activities.filter(a => a.kindergartenId === k.id);
      return {
        kindergartenId: k.id,
        kindergartenName: k.name,
        activityCount: kgActivities.length,
        registrationCount: kgActivities.reduce((sum, a) => sum + (a.registeredCount || 0), 0),
        participantCount: kgActivities.reduce((sum, a) => sum + (a.checkedInCount || 0), 0)
      };
    });

    // 按类型统计
    const typeMap = new Map<number, { count: number; registrations: number }>();
    activities.forEach(a => {
      const type = a.activityType || 0;
      if (!typeMap.has(type)) {
        typeMap.set(type, { count: 0, registrations: 0 });
      }
      const stat = typeMap.get(type)!;
      stat.count++;
      stat.registrations += a.registeredCount || 0;
    });

    const byType = Array.from(typeMap.entries()).map(([type, stat]) => ({
      activityType: type,
      typeName: this.getActivityTypeName(type),
      count: stat.count,
      registrationCount: stat.registrations
    }));

    return {
      totalActivities: activities.length,
      totalRegistrations: activities.reduce((sum, a) => sum + (a.registeredCount || 0), 0),
      totalParticipants: activities.reduce((sum, a) => sum + (a.checkedInCount || 0), 0),
      byKindergarten,
      byType
    };
  }

  /**
   * 获取集团招生数据
   */
  async getGroupEnrollment(groupId: number, year?: number) {
    // 获取集团下的所有园所ID
    const kindergartens = await Kindergarten.findAll({
      where: { groupId },
      attributes: ['id', 'name']
    });

    const kindergartenIds = kindergartens.map(k => k.id);

    if (kindergartenIds.length === 0) {
      return {
        totalApplications: 0,
        totalAdmissions: 0,
        admissionRate: 0,
        byKindergarten: []
      };
    }

    // 构建查询条件（通过EnrollmentPlan关联）
    const where: any = {};

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      where.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    // 查询招生申请数据（需要通过plan关联到kindergarten）
    const applications = await EnrollmentApplication.findAll({
      where,
      include: [
        {
          model: require('../models/enrollment-plan.model').EnrollmentPlan,
          as: 'plan',
          where: {
            kindergartenId: { [Op.in]: kindergartenIds }
          },
          attributes: ['kindergartenId']
        }
      ],
      attributes: ['id', 'status']
    });

    // 统计录取数量（ApplicationStatus.APPROVED = 1）
    const admissions = applications.filter(a => a.status === 1);

    // 按园所统计
    const byKindergarten = kindergartens.map(k => {
      const kgApplications = applications.filter(a => (a as any).plan?.kindergartenId === k.id);
      const kgAdmissions = kgApplications.filter(a => a.status === 1);

      return {
        kindergartenId: k.id,
        kindergartenName: k.name,
        applicationCount: kgApplications.length,
        admissionCount: kgAdmissions.length,
        admissionRate: kgApplications.length > 0
          ? ((kgAdmissions.length / kgApplications.length) * 100).toFixed(2)
          : '0.00'
      };
    });

    const admissionRate = applications.length > 0
      ? ((admissions.length / applications.length) * 100).toFixed(2)
      : '0.00';

    return {
      totalApplications: applications.length,
      totalAdmissions: admissions.length,
      admissionRate: parseFloat(admissionRate),
      byKindergarten
    };
  }

  /**
   * 更新集团统计数据
   */
  async updateGroupStatistics(groupId: number) {
    const group = await Group.findByPk(groupId);
    if (!group) {
      throw new Error('集团不存在');
    }

    // 获取集团下的所有园所
    const kindergartens = await Kindergarten.findAll({
      where: { groupId }
    });

    // 计算统计数据
    const kindergartenCount = kindergartens.length;
    const totalStudents = kindergartens.reduce((sum, k) => sum + k.studentCount, 0);
    const totalTeachers = kindergartens.reduce((sum, k) => sum + k.teacherCount, 0);
    const totalClasses = kindergartens.reduce((sum, k) => sum + k.classCount, 0);
    const totalCapacity = kindergartens.reduce((sum, k) => sum + (k.classCount * 30), 0);

    // 更新集团统计字段
    await group.update({
      kindergartenCount,
      totalStudents,
      totalTeachers,
      totalClasses,
      totalCapacity
    });

    return {
      kindergartenCount,
      totalStudents,
      totalTeachers,
      totalClasses,
      totalCapacity
    };
  }

  /**
   * 获取活动类型名称
   */
  private getActivityTypeName(type: number): string {
    const typeNames: { [key: number]: string } = {
      1: '开放日',
      2: '体验课',
      3: '家长会',
      4: '节日活动',
      5: '户外活动',
      6: '其他'
    };
    return typeNames[type] || '未知';
  }
}

export default new GroupStatisticsService();

