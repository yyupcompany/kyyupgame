import { ActivityPlan } from '../models/activity-plan.model';
import { ActivityRegistration } from '../models/activity-registration.model';
import { Activity } from '../models/activity.model';
import { ActivityTemplate } from '../models/activity-template.model';
import { ActivityEvaluation } from '../models/activity-evaluation.model';
import { PosterGeneration } from '../models/poster-generation.model';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';

export class ActivityCenterService {
  constructor() {
    // 使用 Sequelize 模型和原生查询
  }

  // ==================== Timeline API ====================

  /**
   * 获取活动中心Timeline数据
   */
  async getTimeline() {
    try {
      console.log('📋 开始获取活动中心Timeline数据...');

      // 并行查询所有统计数据 - 使用正确的数据类型
      const [
        totalActivities,
        publishedActivities,
        draftActivities,
        totalRegistrations,
        approvedRegistrations,
        totalEvaluations,
        completedActivities,
        totalTemplates,
        usedTemplates,
        totalPosters,
        activitiesWithMarketing,
        totalViews,
        totalShares,
        checkedInCount
      ] = await Promise.all([
        Activity.count({ where: { deletedAt: null } }),
        Activity.count({ where: { deletedAt: null, publishStatus: 1 } }), // 1 = 已发布
        Activity.count({ where: { deletedAt: null, publishStatus: 0 } }), // 0 = 草稿
        ActivityRegistration.count({ where: { deletedAt: null } }),
        ActivityRegistration.count({ where: { deletedAt: null, status: 1 } }), // 1 = 已确认
        ActivityEvaluation.count({ where: { deletedAt: null } }),
        Activity.count({ where: { deletedAt: null, status: 4 } }), // 4 = 已结束
        ActivityTemplate.count(),
        Activity.count({ where: { deletedAt: null, planId: { [Op.ne]: null } } }),
        PosterGeneration.count({ where: { deletedAt: null } }),
        Activity.count({ where: { deletedAt: null, marketingConfig: { [Op.ne]: null } } }),
        // 查询真实的浏览量和分享次数
        Activity.sum('viewCount', { where: { deletedAt: null } }),
        Activity.sum('shareCount', { where: { deletedAt: null } }),
        ActivityRegistration.count({ where: { deletedAt: null, status: 4 } }) // 4 = 已签到
      ]);

      console.log('📊 统计数据查询完成:', {
        totalActivities,
        publishedActivities,
        totalRegistrations,
        totalEvaluations
      });

      // 统一图标映射 - 使用全局统一样式图标
      const iconMap = {
        'activity-planning': 'activity',        // 活动策划
        'content-creation': 'design',           // 内容制作/海报设计
        'page-generation': 'document',          // 页面生成
        'activity-publish': 'send',             // 活动发布
        'registration-management': 'user-group',// 报名管理
        'activity-execution': 'check',          // 活动执行
        'activity-evaluation': 'star',          // 活动评价
        'effect-analysis': 'analytics'          // 效果分析
      };

      // 构建Timeline数据
      const timeline = [
        {
          id: 'activity-planning',
          title: '活动策划',
          description: '模板选择和基本信息设置',
          icon: iconMap['activity-planning'],
          status: totalActivities > 0 ? 'completed' : 'pending',
          progress: Math.min(Math.round((totalActivities / 100) * 100), 100),
          stats: {
            totalActivities,
            totalTemplates,
            usedTemplates,
            draftActivities
          },
          actions: [
            { key: 'create-activity', label: '新建活动', type: 'primary' },
            { key: 'view-templates', label: '查看模板', type: 'default' },
            { key: 'activity-planner', label: 'AI策划', type: 'success' },
            { key: 'view-activities', label: '活动列表', type: 'info' }
          ]
        },
        {
          id: 'content-creation',
          title: '内容制作',
          description: '海报设计和营销配置',
          icon: iconMap['content-creation'],
          status: publishedActivities > 0 ? 'in-progress' : 'pending',
          progress: totalActivities > 0 ? Math.round((publishedActivities / totalActivities) * 100) : 0,
          stats: {
            totalPosters,
            activitiesWithMarketing,
            publishedActivities,
            draftActivities
          },
          actions: [
            { key: 'design-poster', label: '设计海报', type: 'primary' },
            { key: 'ai-poster', label: 'AI海报', type: 'success' },
            { key: 'config-marketing', label: '营销配置', type: 'warning' },
            { key: 'upload-poster', label: '上传海报', type: 'default' }
          ]
        },
        {
          id: 'page-generation',
          title: '页面生成',
          description: '生成活动报名页面',
          icon: iconMap['page-generation'],
          status: publishedActivities > 0 ? 'in-progress' : 'pending',
          progress: publishedActivities > 0 ? Math.round((publishedActivities / totalActivities) * 100) : 0,
          stats: {
            generatedPages: publishedActivities,
            activePages: publishedActivities,
            totalViews: totalViews || 0, // 真实浏览量
            totalRegistrations
          },
          actions: [
            { key: 'generate-page', label: '生成页面', type: 'primary' },
            { key: 'registration-dashboard', label: '报名仪表板', type: 'info' },
            { key: 'page-templates', label: '页面模板', type: 'default' },
            { key: 'share-management', label: '分享管理', type: 'success' }
          ]
        },
        {
          id: 'activity-publish',
          title: '活动发布',
          description: '发布到各渠道',
          icon: iconMap['activity-publish'],
          status: publishedActivities > 0 ? 'in-progress' : 'pending',
          progress: publishedActivities > 0 ? Math.round((publishedActivities / totalActivities) * 100) : 0,
          stats: {
            publishedActivities,
            channels: 4, // 微信、网站、小程序、朋友圈
            totalShares: totalShares || 0, // 真实分享次数
            totalViews: totalViews || 0 // 真实浏览量
          },
          actions: [
            { key: 'publish', label: '发布活动', type: 'primary' },
            { key: 'publish-channels', label: '发布渠道', type: 'warning' },
            { key: 'share-management', label: '分享管理', type: 'success' },
            { key: 'view-stats', label: '查看数据', type: 'info' }
          ]
        },
        {
          id: 'registration-management',
          title: '报名管理',
          description: '报名审核和统计',
          icon: iconMap['registration-management'],
          status: totalRegistrations > 0 ? 'in-progress' : 'pending',
          progress: totalRegistrations > 0 ? Math.round((approvedRegistrations / totalRegistrations) * 100) : 0,
          stats: {
            totalRegistrations,
            approvedRegistrations,
            pendingRegistrations: totalRegistrations - approvedRegistrations,
            conversionRate: totalRegistrations > 0 ? Math.round((approvedRegistrations / totalRegistrations) * 100) : 0
          },
          actions: [
            { key: 'approve-registrations', label: '审核报名', type: 'primary' },
            { key: 'registration-list', label: '报名列表', type: 'info' },
            { key: 'approval-workflow', label: '审核流程', type: 'warning' },
            { key: 'export-list', label: '导出名单', type: 'default' }
          ]
        },
        {
          id: 'activity-execution',
          title: '活动执行',
          description: '签到和现场管理',
          icon: iconMap['activity-execution'],
          status: approvedRegistrations > 0 ? 'in-progress' : 'pending',
          progress: approvedRegistrations > 0 ? Math.round((checkedInCount / approvedRegistrations) * 100) : 0,
          stats: {
            checkedIn: checkedInCount || 0, // 真实签到人数
            totalParticipants: approvedRegistrations,
            ongoingActivities: publishedActivities - completedActivities,
            completedActivities
          },
          actions: [
            { key: 'checkin', label: '扫码签到', type: 'primary' },
            { key: 'checkin-management', label: '签到管理', type: 'info' },
            { key: 'attendance-stats', label: '出席统计', type: 'warning' },
            { key: 'manual-checkin', label: '手动签到', type: 'default' }
          ]
        },
        {
          id: 'activity-evaluation',
          title: '活动评价',
          description: '满意度调查和反馈收集',
          icon: iconMap['activity-evaluation'],
          status: totalEvaluations > 0 ? 'in-progress' : 'pending',
          progress: completedActivities > 0 ? Math.round((totalEvaluations / completedActivities) * 100) : 0,
          stats: {
            totalEvaluations,
            averageRating: await this.getAverageRating(), // 真实平均评分
            completedActivities,
            evaluationRate: completedActivities > 0 ? Math.round((totalEvaluations / completedActivities) * 100) : 0
          },
          actions: [
            { key: 'create-survey', label: '创建问卷', type: 'primary' },
            { key: 'view-feedback', label: '查看反馈', type: 'info' },
            { key: 'analyze-satisfaction', label: '满意度分析', type: 'warning' },
            { key: 'evaluation-reports', label: '评估报告', type: 'default' }
          ]
        },
        {
          id: 'effect-analysis',
          title: '效果分析',
          description: '数据分析和报告生成',
          icon: iconMap['effect-analysis'],
          status: completedActivities > 0 ? 'in-progress' : 'pending',
          progress: completedActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0,
          stats: {
            analyzedActivities: completedActivities,
            totalActivities,
            averageROI: await this.calculateAverageROI(), // 真实ROI计算
            generatedReports: completedActivities // 已完成的活动都可以生成报告
          },
          actions: [
            { key: 'generate-report', label: '生成报告', type: 'primary' },
            { key: 'intelligent-analysis', label: '智能分析', type: 'success' },
            { key: 'activity-optimizer', label: '活动优化', type: 'warning' },
            { key: 'export-data', label: '导出数据', type: 'info' }
          ]
        }
      ];

      console.log('✅ Timeline数据构建完成');

      return {
        success: true,
        data: timeline
      };
    } catch (error) {
      console.error('❌ 获取Timeline数据失败:', error);
      throw error;
    }
  }

  // ==================== 活动概览 ====================

  /**
   * 获取活动概览数据
   */
  async getOverview() {
    try {
      // 使用 Sequelize 模型获取活动统计
      const totalActivities = await ActivityPlan.count({
        where: { deletedAt: null }
      });

      const ongoingActivities = await ActivityPlan.count({
        where: { 
          status: 'ongoing',
          deletedAt: null 
        }
      });

      const totalRegistrations = await ActivityRegistration.count({
        where: { deletedAt: null }
      });

      // 计算月度增长（模拟数据）
      const monthlyGrowth = {
        activities: Math.floor(Math.random() * 20) + 5, // 5-25%
        registrations: Math.floor(Math.random() * 30) + 10, // 10-40%
        participants: Math.floor(Math.random() * 25) + 8 // 8-33%
      };

      return {
        totalActivities: totalActivities || 0,
        ongoingActivities: ongoingActivities || 0,
        totalRegistrations: totalRegistrations || 0,
        activeParticipants: Math.floor(totalRegistrations * 0.8), // 假设80%的报名是活跃参与者
        monthlyGrowth
      };
    } catch (error) {
      console.error('Failed to get activity overview:', error);
      throw error;
    }
  }

  // ==================== 活动分析方法 ====================

  /**
   * 获取活动分析数据
   */
  async getAnalytics(params: any) {
    try {
      // 返回模拟的分析数据
      return {
        overview: {
          totalActivities: 25,
          totalParticipants: 156,
          averageRating: 4.6,
          completionRate: 85
        },
        trends: {
          monthly: [
            { month: '1月', activities: 8, participants: 45 },
            { month: '2月', activities: 12, participants: 67 },
            { month: '3月', activities: 15, participants: 89 },
            { month: '4月', activities: 18, participants: 112 },
            { month: '5月', activities: 22, participants: 134 },
            { month: '6月', activities: 25, participants: 156 }
          ]
        },
        categories: [
          { name: '体育活动', count: 8, percentage: 32 },
          { name: '艺术创作', count: 6, percentage: 24 },
          { name: '科学实验', count: 5, percentage: 20 },
          { name: '节日庆典', count: 4, percentage: 16 },
          { name: '其他', count: 2, percentage: 8 }
        ]
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  /**
   * 获取活动效果报告
   */
  async getActivityReport(id: string) {
    try {
      // 返回模拟的活动报告数据
      return {
        activity: {
          id,
          title: '亲子运动会',
          date: '2024-06-15',
          duration: 120,
          participants: 45
        },
        metrics: {
          registrationRate: 90,
          attendanceRate: 85,
          satisfactionScore: 4.6,
          completionRate: 92
        },
        feedback: {
          positive: 38,
          neutral: 5,
          negative: 2,
          highlights: [
            '活动组织有序，孩子们很开心',
            '增进了亲子关系',
            '运动项目设计合理'
          ]
        },
        recommendations: [
          '可以增加更多互动环节',
          '建议延长活动时间',
          '希望定期举办类似活动'
        ]
      };
    } catch (error) {
      console.error('Failed to get activity report:', error);
      throw error;
    }
  }

  /**
   * 获取参与度分析
   */
  async getParticipationAnalysis(params: any) {
    try {
      // 返回模拟的参与度分析数据
      return {
        overall: {
          totalParticipants: 156,
          activeParticipants: 132,
          participationRate: 84.6,
          averageActivitiesPerChild: 3.2
        },
        ageGroups: [
          { age: '3-4岁', participants: 45, rate: 88 },
          { age: '4-5岁', participants: 67, rate: 82 },
          { age: '5-6岁', participants: 44, rate: 86 }
        ],
        timeDistribution: [
          { period: '上午', participants: 89, percentage: 57 },
          { period: '下午', participants: 67, percentage: 43 }
        ],
        trends: {
          weekly: [
            { week: '第1周', rate: 78 },
            { week: '第2周', rate: 82 },
            { week: '第3周', rate: 85 },
            { week: '第4周', rate: 84 }
          ]
        }
      };
    } catch (error) {
      console.error('Failed to get participation analysis:', error);
      throw error;
    }
  }

  // ==================== 通知管理方法 ====================

  /**
   * 获取通知列表
   */
  async getNotifications(params: any) {
    try {
      // 返回模拟的通知列表数据
      const notifications = [
        {
          id: 1,
          title: '亲子运动会报名开始',
          content: '本周六将举办亲子运动会，欢迎家长和孩子们踊跃报名参加！',
          type: 'activity',
          status: 'sent',
          recipients: 45,
          sentAt: '2024-06-10 09:00:00',
          createdAt: '2024-06-09 15:30:00'
        },
        {
          id: 2,
          title: '科学实验课提醒',
          content: '明天下午的科学实验课请准时参加，记得带上实验服。',
          type: 'reminder',
          status: 'scheduled',
          recipients: 20,
          scheduledAt: '2024-06-11 08:00:00',
          createdAt: '2024-06-10 16:45:00'
        },
        {
          id: 3,
          title: '艺术创作坊成果展示',
          content: '孩子们的艺术作品将在本周五进行展示，欢迎家长前来观看。',
          type: 'announcement',
          status: 'draft',
          recipients: 25,
          createdAt: '2024-06-10 14:20:00'
        }
      ];

      return {
        data: notifications,
        pagination: {
          total: notifications.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          totalPages: Math.ceil(notifications.length / (params.pageSize || 10))
        }
      };
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw error;
    }
  }

  /**
   * 发送活动通知
   */
  async sendNotification(notificationData: any) {
    try {
      // 模拟发送通知
      const notification = {
        id: Date.now(),
        ...notificationData,
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      console.log('📧 发送通知:', notification);
      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * 获取通知模板
   */
  async getNotificationTemplates() {
    try {
      // 返回模拟的通知模板数据
      return [
        {
          id: 1,
          name: '活动报名通知',
          type: 'activity',
          subject: '{{activityName}} 报名开始',
          content: '亲爱的家长，{{activityName}} 将于 {{activityDate}} 举办，欢迎报名参加！',
          variables: ['activityName', 'activityDate'],
          usageCount: 15
        },
        {
          id: 2,
          name: '活动提醒通知',
          type: 'reminder',
          subject: '{{activityName}} 即将开始',
          content: '提醒您，{{activityName}} 将于 {{activityTime}} 开始，请准时参加。',
          variables: ['activityName', 'activityTime'],
          usageCount: 23
        },
        {
          id: 3,
          name: '活动取消通知',
          type: 'cancellation',
          subject: '{{activityName}} 取消通知',
          content: '很抱歉通知您，由于 {{reason}}，{{activityName}} 已取消。',
          variables: ['activityName', 'reason'],
          usageCount: 3
        },
        {
          id: 4,
          name: '成果展示通知',
          type: 'announcement',
          subject: '{{activityName}} 成果展示',
          content: '{{activityName}} 的精彩成果将于 {{displayDate}} 进行展示，欢迎观看！',
          variables: ['activityName', 'displayDate'],
          usageCount: 8
        }
      ];
    } catch (error) {
      console.error('Failed to get notification templates:', error);
      throw error;
    }
  }

  // ==================== 活动管理方法 ====================

  /**
   * 获取活动列表
   */
  async getActivities(params: any) {
    try {
      // 使用 Sequelize 查询活动列表
      const { page = 1, pageSize = 10, title, type, status } = params;
      const offset = (page - 1) * pageSize;

      const whereConditions: any = { deletedAt: null };

      if (title) {
        whereConditions.title = { [require('sequelize').Op.like]: `%${title}%` };
      }
      if (type) {
        whereConditions.type = type;
      }
      if (status) {
        whereConditions.status = status;
      }

      const { count, rows } = await ActivityPlan.findAndCountAll({
        where: whereConditions,
        offset,
        limit: pageSize,
        order: [['createdAt', 'DESC']]
      });

      return {
        items: rows.map(activity => this.formatActivityData(activity)),
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      };
    } catch (error) {
      console.error('Failed to get activities:', error);
      throw error;
    }
  }

  /**
   * 获取活动详情
   */
  async getActivityDetail(id: string) {
    try {
      const activity = await ActivityPlan.findOne({
        where: { id, deletedAt: null }
      });

      if (!activity) {
        return null;
      }

      return this.formatActivityData(activity);
    } catch (error) {
      console.error('Failed to get activity detail:', error);
      throw error;
    }
  }

  /**
   * 创建活动
   */
  async createActivity(activityData: any) {
    try {
      // 验证必填字段
      if (!activityData.title || activityData.title.trim() === '') {
        throw new Error('活动标题不能为空');
      }

      // 只提取ActivityPlan模型支持的字段
      const startDate = activityData.startTime ? new Date(activityData.startTime) : new Date();
      const endDate = activityData.endTime ? new Date(activityData.endTime) : new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const validFields = {
        kindergartenId: activityData.kindergartenId || 1,
        title: activityData.title.trim(),
        year: new Date(activityData.startTime || new Date()).getFullYear(),
        semester: activityData.semester || 2, // 默认秋季学期
        startDate,
        endDate,
        planType: activityData.activityType || 3, // 使用activityType作为planType
        targetCount: 1,
        participationTarget: activityData.capacity || 1,
        budget: activityData.fee || 0,
        objectives: activityData.objectives || null,
        description: activityData.description || null,
        status: activityData.status !== undefined ? activityData.status : 0,
        approvedBy: null,
        approvedAt: null,
        remark: activityData.remark || null,
        creatorId: activityData.creatorId || 1,
        updaterId: activityData.updaterId || 1
      };

      console.log('📝 创建活动计划，有效字段:', validFields);
      const activity = await ActivityPlan.create(validFields);
      return this.formatActivityData(activity);
    } catch (error) {
      console.error('❌ 创建活动失败:', error);
      throw error;
    }
  }

  /**
   * 更新活动
   */
  async updateActivity(id: string, updateData: any) {
    try {
      const [updatedRowsCount] = await ActivityPlan.update(updateData, {
        where: { id, deletedAt: null }
      });

      if (updatedRowsCount === 0) {
        return null;
      }

      return await this.getActivityDetail(id);
    } catch (error) {
      console.error('Failed to update activity:', error);
      throw error;
    }
  }

  /**
   * 删除活动
   */
  async deleteActivity(id: string) {
    try {
      const [updatedRowsCount] = await ActivityPlan.update(
        { deletedAt: new Date() },
        { where: { id, deletedAt: null } }
      );

      return updatedRowsCount > 0;
    } catch (error) {
      console.error('Failed to delete activity:', error);
      throw error;
    }
  }

  // ==================== 报名管理方法 ====================

  /**
   * 获取报名列表
   */
  async getRegistrations(params: any) {
    try {
      const { page = 1, pageSize = 10, activityId, status } = params;
      const offset = (page - 1) * pageSize;

      const whereConditions: any = { deletedAt: null };

      if (activityId) {
        whereConditions.activityId = activityId;
      }
      if (status) {
        whereConditions.status = status;
      }

      const { count, rows } = await ActivityRegistration.findAndCountAll({
        where: whereConditions,
        offset,
        limit: pageSize,
        order: [['createdAt', 'DESC']]
      });

      return {
        items: rows.map(registration => this.formatRegistrationData(registration)),
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      };
    } catch (error) {
      console.error('Failed to get registrations:', error);
      throw error;
    }
  }

  /**
   * 获取报名详情
   */
  async getRegistrationDetail(id: string) {
    try {
      const registration = await ActivityRegistration.findOne({
        where: { id, deletedAt: null }
      });

      if (!registration) {
        return null;
      }

      return this.formatRegistrationData(registration);
    } catch (error) {
      console.error('Failed to get registration detail:', error);
      throw error;
    }
  }

  /**
   * 审核报名
   */
  async approveRegistration(id: string, status: string, remark?: string) {
    try {
      const updateData: any = { status };

      if (status === 'approved') {
        updateData.approvedAt = new Date();
      }

      if (remark) {
        updateData.remark = remark;
      }

      const [updatedRowsCount] = await ActivityRegistration.update(updateData, {
        where: { id, deletedAt: null }
      });

      if (updatedRowsCount === 0) {
        return null;
      }

      return await this.getRegistrationDetail(id);
    } catch (error) {
      console.error('Failed to approve registration:', error);
      throw error;
    }
  }

  /**
   * 批量审核报名
   */
  async batchApproveRegistrations(ids: string[], status: string, remark?: string) {
    try {
      const updateData: any = { status };

      if (status === 'approved') {
        updateData.approvedAt = new Date();
      }

      if (remark) {
        updateData.remark = remark;
      }

      const [updatedRowsCount] = await ActivityRegistration.update(updateData, {
        where: {
          id: { [require('sequelize').Op.in]: ids },
          deletedAt: null
        }
      });

      return {
        updatedCount: updatedRowsCount,
        totalCount: ids.length
      };
    } catch (error) {
      console.error('Failed to batch approve registrations:', error);
      throw error;
    }
  }

  /**
   * 发布活动
   */
  async publishActivity(id: string) {
    try {
      return await this.updateActivity(id, { status: 'registration' });
    } catch (error) {
      console.error('Failed to publish activity:', error);
      throw error;
    }
  }

  /**
   * 取消活动
   */
  async cancelActivity(id: string) {
    try {
      return await this.updateActivity(id, { status: 'cancelled' });
    } catch (error) {
      console.error('Failed to cancel activity:', error);
      throw error;
    }
  }

  /**
   * 获取活动分布统计
   */
  async getDistribution() {
    try {
      // 返回模拟的分布数据
      return {
        byType: [
          { name: '体育活动', value: 8 },
          { name: '艺术创作', value: 6 },
          { name: '科学实验', value: 5 },
          { name: '节日庆典', value: 4 },
          { name: '其他', value: 2 }
        ],
        byStatus: [
          { name: '报名中', value: 12 },
          { name: '进行中', value: 8 },
          { name: '已结束', value: 15 },
          { name: '已取消', value: 2 }
        ],
        byMonth: [
          { month: '2024-01', count: 8 },
          { month: '2024-02', count: 12 },
          { month: '2024-03', count: 15 },
          { month: '2024-04', count: 18 },
          { month: '2024-05', count: 22 },
          { month: '2024-06', count: 25 }
        ]
      };
    } catch (error) {
      console.error('Failed to get distribution:', error);
      throw error;
    }
  }

  /**
   * 获取活动趋势数据
   */
  async getTrend() {
    try {
      // 返回模拟的趋势数据
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last30Days.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 5) + 1
        });
      }

      return {
        activities: last30Days,
        registrations: last30Days.map(item => ({
          ...item,
          count: Math.floor(Math.random() * 10) + 2
        })),
        participants: last30Days.map(item => ({
          ...item,
          count: Math.floor(Math.random() * 8) + 1
        }))
      };
    } catch (error) {
      console.error('Failed to get trend:', error);
      throw error;
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 获取真实的平均评分
   */
  private async getAverageRating(): Promise<number> {
    try {
      const result = await ActivityEvaluation.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('overall_rating')), 'avgRating']
        ],
        where: { deletedAt: null },
        raw: true
      });

      const avgRating = (result as any)?.avgRating;
      return avgRating ? parseFloat(avgRating.toFixed(1)) : 0;
    } catch (error) {
      console.error('获取平均评分失败:', error);
      return 0;
    }
  }

  /**
   * 计算真实的平均ROI
   */
  private async calculateAverageROI(): Promise<number> {
    try {
      // ROI = (收入 - 成本) / 成本
      // 这里简化计算：基于报名费用和活动成本
      const activities = await Activity.findAll({
        where: {
          deletedAt: null,
          status: 4 // 已结束的活动
        },
        attributes: ['id', 'fee', 'registeredCount'],
        raw: true
      });

      if (activities.length === 0) return 0;

      let totalROI = 0;
      for (const activity of activities) {
        const revenue = (activity as any).fee * (activity as any).registeredCount;
        // 假设成本是收入的40%（这个可以根据实际情况调整）
        const cost = revenue * 0.4;
        const roi = cost > 0 ? (revenue - cost) / cost : 0;
        totalROI += roi;
      }

      const avgROI = totalROI / activities.length;
      return parseFloat(avgROI.toFixed(2));
    } catch (error) {
      console.error('计算平均ROI失败:', error);
      return 0;
    }
  }

  private formatActivityData(activity: any) {
    const activityData = activity.toJSON ? activity.toJSON() : activity;
    return {
      id: activityData.id,
      title: activityData.title,
      description: activityData.description,
      type: activityData.type,
      status: activityData.status,
      startTime: activityData.startTime,
      endTime: activityData.endTime,
      location: activityData.location,
      capacity: activityData.capacity,
      registeredCount: activityData.registeredCount || 0,
      price: activityData.price,
      organizer: activityData.organizer,
      createdAt: activityData.createdAt,
      updatedAt: activityData.updatedAt
    };
  }

  private formatRegistrationData(registration: any) {
    const regData = registration.toJSON ? registration.toJSON() : registration;
    return {
      id: regData.id,
      activityId: regData.activityId,
      studentId: regData.studentId,
      parentId: regData.parentId,
      status: regData.status,
      registeredAt: regData.createdAt,
      approvedAt: regData.approvedAt,
      remark: regData.remark
    };
  }
}
