import { BaseService } from './base.service';
import db from '../database';

interface ApprovalListParams {
  status?: string;
  type?: string;
  page: number;
  pageSize: number;
}

interface NoticeData {
  title: string;
  content: string;
  expireTime?: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  recipientType: 'ALL' | 'TEACHERS' | 'PARENTS' | 'SPECIFIC';
  recipientIds?: string[];
  publisherId: number;
}

interface ScheduleData {
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  userId: number;
}

interface ActivitiesParams {
  page: number;
  pageSize: number;
  status?: string;
}

export class PrincipalService extends BaseService {
  constructor() {
    super();
  }

  /**
   * 获取园区概览
   */
  async getCampusOverview() {
    try {
      // 获取基础统计数据
      const [
        classroomCount,
        occupiedClassroomCount,
        totalStudents,
        totalTeachers,
        recentActivities
      ] = await Promise.all([
        db.classes.count(),
        db.classes.count({ where: { status: 'active' } }),
        db.students.count(),
        db.teachers.count(),
        db.activities.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'startTime', 'endTime', 'location', 'description']
        })
      ]);

      return {
        id: "1",
        name: "阳光幼儿园",
        address: "北京市海淀区中关村大街1号",
        area: 5000,
        classroomCount,
        occupiedClassroomCount,
        outdoorPlaygroundArea: 2000,
        indoorPlaygroundArea: 800,
        establishedYear: 2010,
        principalName: "王园长",
        contactPhone: "010-88888888",
        email: "principal@example.com",
        description: "阳光幼儿园是一所综合性幼儿园，致力于为3-6岁儿童提供优质的学前教育。",
        images: [
          "/images/campus/1.jpg",
          "/images/campus/2.jpg",
          "/images/campus/3.jpg"
        ],
        facilities: [
          {
            id: "1",
            name: "室内游泳池",
            status: "正常"
          },
          {
            id: "2", 
            name: "多功能厅",
            status: "正常"
          },
          {
            id: "3",
            name: "图书室",
            status: "正常"
          }
        ],
        events: recentActivities.map((activity: any) => ({
          id: activity.id.toString(),
          title: activity.title,
          startTime: activity.startTime,
          endTime: activity.endTime,
          location: activity.location || '待定',
          description: activity.description
        }))
      };
    } catch (error) {
      this.logger.error('获取园区概览失败:', error);
      throw error;
    }
  }

  /**
   * 获取待审批列表
   */
  async getApprovalList(params: ApprovalListParams) {
    try {
      const where: any = {};
      
      if (params.status) {
        where.status = params.status;
      }
      if (params.type) {
        where.type = params.type;
      }

      const approvals = await db.approvals.findAndCountAll({
        where,
        include: [
          {
            model: db.users,
            as: 'requester',
            attributes: ['id', 'username', 'realName']
          },
          {
            model: db.users,
            as: 'approver',
            attributes: ['id', 'username', 'realName']
          }
        ],
        order: [['requestedAt', 'DESC']],
        limit: params.pageSize,
        offset: (params.page - 1) * params.pageSize
      });

      const items = approvals.rows.map((approval: any) => ({
        id: approval.id.toString(),
        title: approval.title,
        type: approval.type,
        requestBy: approval.requester?.realName || approval.requester?.username || '未知用户',
        requestTime: approval.requestedAt,
        status: approval.status,
        urgency: approval.urgency,
        description: approval.description || '',
        deadline: approval.deadline,
        requestAmount: approval.requestAmount
      }));

      return {
        items,
        total: approvals.count
      };
    } catch (error) {
      this.logger.error('获取待审批列表失败:', error);
      throw error;
    }
  }

  /**
   * 处理审批
   */
  async handleApproval(id: string, action: 'approve' | 'reject', userId: number, comment?: string) {
    try {
      const approval = await db.approvals.findByPk(id, {
        include: [
          {
            model: db.users,
            as: 'requester',
            attributes: ['id', 'username', 'realName']
          }
        ]
      });

      if (!approval) {
        throw new Error('审批记录不存在');
      }

      if (approval.status !== 'PENDING') {
        throw new Error('该审批已经处理过了');
      }

      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      
      await approval.update({
        status: newStatus as any, // Type assertion to handle enum mismatch
        approvedBy: userId,
        approvedAt: new Date(),
        comment: comment || null
      });

      return {
        id: approval.id.toString(),
        title: approval.title,
        type: approval.type,
        requestBy: approval.requester?.realName || approval.requester?.username || '未知用户',
        requestTime: approval.requestedAt,
        status: newStatus,
        urgency: approval.urgency,
        description: approval.description || '',
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
        comment
      };
    } catch (error) {
      this.logger.error('处理审批失败:', error);
      throw error;
    }
  }

  /**
   * 获取重要通知
   */
  async getImportantNotices() {
    try {
      const notices = await db.notifications.findAll({
        where: {
          status: 'published' as any
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['id', 'title', 'content', 'createdAt']
      });

      return notices.map((notice: any) => ({
        id: notice.id.toString(),
        title: notice.title,
        content: notice.content,
        publishTime: notice.createdAt,
        expireTime: null, // Field not in model
        importance: 'HIGH', // Default value
        readCount: 0, // 可以后续实现阅读统计
        totalCount: 24 // 可以后续实现总人数统计
      }));
    } catch (error) {
      this.logger.error('获取重要通知失败:', error);
      throw error;
    }
  }

  /**
   * 发布通知
   */
  async publishNotice(data: NoticeData) {
    try {
      const notice = await db.notifications.create({
        title: data.title,
        content: data.content,
        senderId: data.publisherId, // Changed from publisherId to senderId
        status: 'published' as any,
        type: 'system' as any,
        userId: 0 // Required field, using placeholder
      });

      return {
        id: notice.id.toString(),
        title: notice.title,
        content: notice.content,
        publishTime: notice.createdAt,
        expireTime: null, // Field not in model
        importance: 'HIGH', // Default value
        readCount: 0,
        totalCount: 24 // 可以根据recipientType计算
      };
    } catch (error) {
      this.logger.error('发布通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取园长工作安排
   */
  async getPrincipalSchedule(userId: number) {
    try {
      const schedules = await db.schedules.findAll({
        where: {
          userId,
          startTime: {
            [db.Sequelize.Op.gte]: new Date()
          }
        },
        order: [['startTime', 'ASC']],
        limit: 20
      });

      return schedules.map((schedule: any) => ({
        id: schedule.id.toString(),
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
        description: schedule.description
      }));
    } catch (error) {
      this.logger.error('获取园长工作安排失败:', error);
      throw error;
    }
  }

  /**
   * 创建园长日程安排
   */
  async createPrincipalSchedule(data: ScheduleData) {
    try {
      const schedule = await db.schedules.create({
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        location: data.location,
        description: data.description,
        userId: data.userId,
        type: 'task' as any,
        status: 'pending' as any
      });

      return {
        id: schedule.id.toString(),
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
        description: schedule.description
      };
    } catch (error) {
      this.logger.error('创建园长日程安排失败:', error);
      throw error;
    }
  }

  /**
   * 获取仪表板统计
   */
  async getDashboardStats() {
    try {
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        activeActivities
      ] = await Promise.all([
        db.students.count(),
        db.teachers.count(),
        db.classes.count(),
        db.activities.count({ where: { status: 1 } })
      ]);

      return {
        totalStudents,
        totalTeachers,
        totalClasses,
        activeActivities,
        statistics: {
          attendance: 95.2,
          satisfaction: 4.8,
          enrollment: 89.3
        }
      };
    } catch (error) {
      this.logger.error('获取仪表板统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取活动列表
   */
  async getActivities(params: ActivitiesParams) {
    try {
      const where: any = {};
      
      if (params.status) {
        where.status = params.status === 'active' ? 1 : 0;
      }

      const { count, rows } = await db.activities.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        offset: (params.page - 1) * params.pageSize,
        limit: params.pageSize,
        attributes: ['id', 'title', 'description', 'startTime', 'endTime', 'location', 'capacity', 'registeredCount', 'status', 'createdAt']
      });

      return {
        total: count,
        list: rows.map((activity: any) => ({
          id: activity.id.toString(),
          title: activity.title,
          description: activity.description,
          startTime: activity.startTime,
          endTime: activity.endTime,
          location: activity.location,
          capacity: activity.capacity,
          registeredCount: activity.registeredCount,
          status: activity.status === 1 ? 'active' : 'inactive',
          createdAt: activity.createdAt
        })),
        page: params.page,
        pageSize: params.pageSize
      };
    } catch (error) {
      this.logger.error('获取活动列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取招生趋势数据
   */
  async getEnrollmentTrend(period: string) {
    try {
      // 模拟数据，实际应该从数据库查询
      const trendData = {
        week: [
          { period: '2024-01-01', value: 12 },
          { period: '2024-01-08', value: 15 },
          { period: '2024-01-15', value: 18 },
          { period: '2024-01-22', value: 14 },
          { period: '2024-01-29', value: 20 }
        ],
        month: [
          { period: '2024-01', value: 65 },
          { period: '2024-02', value: 72 },
          { period: '2024-03', value: 58 },
          { period: '2024-04', value: 80 },
          { period: '2024-05', value: 75 }
        ],
        year: [
          { period: '2021', value: 450 },
          { period: '2022', value: 520 },
          { period: '2023', value: 680 },
          { period: '2024', value: 750 }
        ]
      };

      return trendData[period as keyof typeof trendData] || trendData.month;
    } catch (error) {
      this.logger.error('获取招生趋势数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取客户池统计数据
   */
  async getCustomerPoolStats() {
    try {
      // 模拟数据，实际应该从数据库查询
      return {
        totalCustomers: 1250,
        newCustomersThisMonth: 85,
        unassignedCustomers: 28,
        convertedCustomersThisMonth: 42
      };
    } catch (error) {
      this.logger.error('获取客户池统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取客户池列表
   */
  async getCustomerPoolList(params: any) {
    try {
      // 模拟数据，实际应该从数据库查询
      const items = [
        {
          id: 1,
          name: '王小明',
          phone: '13800138001',
          source: '网络推广',
          status: 'new',
          teacher: '李老师',
          createdAt: '2024-01-15',
          lastFollowUp: '2024-01-20'
        },
        {
          id: 2,
          name: '张小红',
          phone: '13800138002',
          source: '朋友推荐',
          status: 'contacted',
          teacher: '王老师',
          createdAt: '2024-01-12',
          lastFollowUp: '2024-01-18'
        }
      ];

      return {
        items,
        total: 2,
        page: parseInt(params.page || '1'),
        pageSize: parseInt(params.pageSize || '10')
      };
    } catch (error) {
      this.logger.error('获取客户池列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取绩效统计数据
   */
  async getPerformanceStats(params: any) {
    try {
      // 模拟数据，实际应该从数据库查询
      return {
        totalEnrollments: 156,
        monthlyEnrollments: 28,
        avgConversionRate: 18.5,
        totalCommission: 45600,
        enrollmentTrend: [
          { period: '2024-01', value: 25 },
          { period: '2024-02', value: 30 },
          { period: '2024-03', value: 28 },
          { period: '2024-04', value: 35 },
          { period: '2024-05', value: 32 }
        ]
      };
    } catch (error) {
      this.logger.error('获取绩效统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取绩效排名数据
   */
  async getPerformanceRankings(params: any) {
    try {
      // 模拟数据，实际应该从数据库查询
      return [
        { id: 1, name: '李老师', value: 45 },
        { id: 2, name: '王老师', value: 38 },
        { id: 3, name: '张老师', value: 32 },
        { id: 4, name: '陈老师', value: 28 },
        { id: 5, name: '刘老师', value: 25 }
      ];
    } catch (error) {
      this.logger.error('获取绩效排名数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取绩效详情数据
   */
  async getPerformanceDetails(params: any) {
    try {
      // 模拟数据，实际应该从数据库查询
      const items = [
        {
          id: 1,
          name: '李老师',
          leads: 120,
          followups: 85,
          visits: 45,
          applications: 28,
          enrollments: 18,
          commission: 8500
        },
        {
          id: 2,
          name: '王老师',
          leads: 98,
          followups: 72,
          visits: 38,
          applications: 22,
          enrollments: 15,
          commission: 7200
        }
      ];

      return {
        items,
        total: 2,
        page: parseInt(params.page || '1'),
        pageSize: parseInt(params.pageSize || '10')
      };
    } catch (error) {
      this.logger.error('获取绩效详情数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取客户详情
   */
  async getCustomerDetail(id: number) {
    try {
      // 模拟数据，实际应该从数据库查询
      return {
        id,
        name: '王小明',
        phone: '13800138001',
        email: 'wangxiaoming@example.com',
        source: '网络推广',
        status: 'contacted',
        teacher: '李老师',
        createdAt: '2024-01-15',
        lastFollowUp: '2024-01-20',
        followUps: [
          {
            id: 1,
            content: '已电话联系，家长有意向',
            type: 'phone',
            createdAt: '2024-01-20'
          }
        ]
      };
    } catch (error) {
      this.logger.error('获取客户详情失败:', error);
      throw error;
    }
  }

  /**
   * 分配客户给教师
   */
  async assignCustomerTeacher(data: any) {
    try {
      // 模拟处理，实际应该更新数据库
      return {
        id: data.customerId,
        teacherId: data.teacherId,
        remark: data.remark,
        assignedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('分配客户给教师失败:', error);
      throw error;
    }
  }

  /**
   * 批量分配客户给教师
   */
  async batchAssignCustomerTeacher(data: any) {
    try {
      // 模拟处理，实际应该批量更新数据库
      return {
        customerIds: data.customerIds,
        teacherId: data.teacherId,
        remark: data.remark,
        assignedCount: data.customerIds.length,
        assignedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('批量分配客户给教师失败:', error);
      throw error;
    }
  }

  /**
   * 删除客户
   */
  async deleteCustomer(id: number) {
    try {
      // 模拟处理，实际应该删除数据库记录
      return {
        id,
        deletedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('删除客户失败:', error);
      throw error;
    }
  }

  /**
   * 添加客户跟进记录
   */
  async addCustomerFollowUp(id: number, data: any) {
    try {
      // 模拟处理，实际应该添加到数据库
      return {
        id: Math.floor(Math.random() * 1000),
        customerId: id,
        content: data.content,
        type: data.type,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('添加客户跟进记录失败:', error);
      throw error;
    }
  }
}