// 招生计划模块模拟数据

// 本地定义类型，避免导入错误
enum EnrollmentPlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

interface EnrollmentPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: EnrollmentPlanStatus;
  type: string;
  targetCount: number;
  appliedCount: number;
  admittedCount: number;
  enrolledCount: number;
  quotaDetails: Array<{
    classType: string;
    ageRange: string;
    quota: number;
    applied: number;
    admitted: number;
    enrolled: number;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface EnrollmentPlanQueryParams {
  keyword?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

interface EnrollmentAnalytics {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  totalTarget: number;
  totalEnrolled: number;
  enrollmentRate: number;
  plansByType: Record<string, number>;
  monthlyEnrollment: Array<{
    month: string;
    count: number;
  }>;
}

// 生成模拟招生计划数据
const generateMockEnrollmentPlans = (count: number): EnrollmentPlan[] => {
  const statusValues = Object.values(EnrollmentPlanStatus);
  
  return Array.from({ length: count }, (_, index) => {
    const id = `EPL${String(index + 1).padStart(4, '0')}`;
    const status = statusValues[Math.floor(Math.random() * statusValues.length)];
    
    // 生成随机日期
    const now = new Date();
    const startDate = new Date(now);
    
    // 大部分计划设置为当前时间前后的日期
    if (index % 3 === 0) {
      // 过去的计划
      startDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6) - 1);
    } else if (index % 3 === 1) {
      // 当前进行中的计划
      startDate.setDate(now.getDate() - Math.floor(Math.random() * 15));
    } else {
      // 未来的计划
      startDate.setMonth(now.getMonth() + Math.floor(Math.random() * 3) + 1);
    }
    
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + Math.floor(Math.random() * 2) + 1);
    
    const createdDate = new Date(startDate);
    createdDate.setMonth(startDate.getMonth() - 1);
    
    // 根据状态生成合理的报名/录取/入学数量
    const targetCount = Math.floor(Math.random() * 100) + 50;
    let appliedCount = 0;
    let admittedCount = 0;
    let enrolledCount = 0;
    
    switch (status) {
      case EnrollmentPlanStatus.DRAFT:
        appliedCount = 0;
        admittedCount = 0;
        enrolledCount = 0;
        break;
      case EnrollmentPlanStatus.ACTIVE:
        appliedCount = Math.floor(targetCount * (Math.random() * 0.8 + 0.1));
        admittedCount = Math.floor(appliedCount * (Math.random() * 0.5 + 0.2));
        enrolledCount = Math.floor(admittedCount * (Math.random() * 0.5 + 0.3));
        break;
      case EnrollmentPlanStatus.PAUSED:
        appliedCount = Math.floor(targetCount * (Math.random() * 0.6 + 0.2));
        admittedCount = Math.floor(appliedCount * (Math.random() * 0.6 + 0.3));
        enrolledCount = Math.floor(admittedCount * (Math.random() * 0.7 + 0.2));
        break;
      case EnrollmentPlanStatus.COMPLETED:
        appliedCount = Math.floor(targetCount * (Math.random() * 0.4 + 0.6));
        admittedCount = Math.floor(appliedCount * (Math.random() * 0.3 + 0.7));
        enrolledCount = Math.floor(admittedCount * (Math.random() * 0.2 + 0.8));
        break;
      case EnrollmentPlanStatus.CANCELLED:
        appliedCount = Math.floor(targetCount * (Math.random() * 0.5));
        admittedCount = Math.floor(appliedCount * (Math.random() * 0.4));
        enrolledCount = Math.floor(admittedCount * (Math.random() * 0.3));
        break;
      default:
        appliedCount = Math.floor(targetCount * (Math.random() * 0.3 + 0.7));
        admittedCount = Math.floor(appliedCount * (Math.random() * 0.2 + 0.8));
        enrolledCount = Math.floor(admittedCount * (Math.random() * 0.1 + 0.9));
        break;
    }
    
    // 生成招生计划的班级配额详情
    const classTypes = ['小班', '中班', '大班'];
    const ageRanges = ['3-4岁', '4-5岁', '5-6岁'];
    
    const quotaDetails = classTypes.map((classType, idx) => {
      const quota = Math.floor(targetCount / classTypes.length);
      const applied = Math.floor(appliedCount / classTypes.length);
      const admitted = Math.floor(admittedCount / classTypes.length);
      const enrolled = Math.floor(enrolledCount / classTypes.length);
      
      return {
        classType,
        ageRange: ageRanges[idx],
        quota,
        applied,
        admitted,
        enrolled
      };
    });
    
    return {
      id,
      title: `${startDate.getFullYear() - 2000}-${startDate.getFullYear() - 1999}学年${['春季', '秋季'][index % 2]}招生计划`,
      description: `本计划针对${startDate.getFullYear() - 2000}-${startDate.getFullYear() - 1999}学年${['春季', '秋季'][index % 2]}入学的适龄幼儿，提供优质的幼儿教育服务。`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status,
      type: ['STANDARD', 'SUMMER', 'WINTER', 'SPECIAL'][index % 4],
      targetCount,
      appliedCount,
      admittedCount,
      enrolledCount,
      quotaDetails,
      createdBy: 'principal1',
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + 86400000 * 3).toISOString()
    };
  });
};

// 模拟招生计划数据
const mockEnrollmentPlans = generateMockEnrollmentPlans(30);

/**
 * 模拟获取招生计划列表API
 * @param params 查询参数
 * @returns Promise<{items: EnrollmentPlan[], total: number}>
 */
export const mockGetEnrollmentPlanList = (params: EnrollmentPlanQueryParams) => {
  return new Promise<{items: EnrollmentPlan[], total: number}>((resolve) => {
    // 延迟响应，模拟网络请求
    setTimeout(() => {
      let result = [...mockEnrollmentPlans];
      
      // 关键词过滤
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        result = result.filter(
          item => item.title.toLowerCase().includes(keyword) || 
                 item.description.toLowerCase().includes(keyword)
        );
      }
      
      // 状态过滤
      if (params.status) {
        result = result.filter(item => item.status === params.status);
      }
      
      // 日期范围过滤
      if (params.startDate && params.startDate.trim() !== '') {
        const startDate = params.startDate;
        result = result.filter(item => item.startDate >= startDate);
      }
      
      if (params.endDate && params.endDate.trim() !== '') {
        const endDate = params.endDate;
        result = result.filter(item => item.endDate <= endDate);
      }
      
      // 总数
      const total = result.length;
      
      // 分页
      const pageSize = params.pageSize || 10;
      const page = params.page || 1;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      result = result.slice(start, end);
      
      resolve({
        items: result,
        total
      });
    }, 500);
  });
};

/**
 * 模拟获取招生计划详情API
 * @param id 招生计划ID
 * @returns Promise<EnrollmentPlan>
 */
export const mockGetEnrollmentPlanDetail = (id: string) => {
  return new Promise<EnrollmentPlan>((resolve, reject) => {
    setTimeout(() => {
      const plan = mockEnrollmentPlans.find(item => item.id === id);
      
      if (plan) {
        resolve(plan);
      } else {
        reject(new Error('招生计划未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟创建招生计划API
 * @param data 招生计划创建参数
 * @returns Promise<EnrollmentPlan>
 */
export const mockCreateEnrollmentPlan = (data: any) => {
  return new Promise<EnrollmentPlan>((resolve) => {
    setTimeout(() => {
      const id = `EPL${String(mockEnrollmentPlans.length + 1).padStart(4, '0')}`;
      const now = new Date().toISOString();
      
      const newPlan: EnrollmentPlan = {
        id,
        ...data,
        appliedCount: 0,
        admittedCount: 0,
        enrolledCount: 0,
        quotaDetails: data.quotaDetails.map((item: any) => ({
          ...item,
          applied: 0,
          admitted: 0,
          enrolled: 0
        })),
        createdBy: 'principal1',
        createdAt: now,
        updatedAt: now
      };
      
      mockEnrollmentPlans.unshift(newPlan);
      
      resolve(newPlan);
    }, 500);
  });
};

/**
 * 模拟更新招生计划API
 * @param id 招生计划ID
 * @param data 招生计划更新参数
 * @returns Promise<EnrollmentPlan>
 */
export const mockUpdateEnrollmentPlan = (id: string, data: any) => {
  return new Promise<EnrollmentPlan>((resolve, reject) => {
    setTimeout(() => {
      const index = mockEnrollmentPlans.findIndex(item => item.id === id);
      
      if (index !== -1) {
        const plan = mockEnrollmentPlans[index];
        const updatedPlan = {
          ...plan,
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        mockEnrollmentPlans[index] = updatedPlan;
        
        resolve(updatedPlan);
      } else {
        reject(new Error('招生计划未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟删除招生计划API
 * @param id 招生计划ID
 * @returns Promise<void>
 */
export const mockDeleteEnrollmentPlan = (id: string) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      const index = mockEnrollmentPlans.findIndex(item => item.id === id);
      
      if (index !== -1) {
        mockEnrollmentPlans.splice(index, 1);
        resolve();
      } else {
        reject(new Error('招生计划未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟更改招生计划状态API
 * @param id 招生计划ID
 * @param status 招生计划状态
 * @returns Promise<EnrollmentPlan>
 */
export const mockUpdateEnrollmentPlanStatus = (id: string, status: EnrollmentPlanStatus) => {
  return new Promise<EnrollmentPlan>((resolve, reject) => {
    setTimeout(() => {
      const plan = mockEnrollmentPlans.find(item => item.id === id);
      
      if (plan) {
        plan.status = status;
        plan.updatedAt = new Date().toISOString();
        resolve(plan);
      } else {
        reject(new Error('招生计划未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟获取招生数据分析API
 * @param params 查询参数
 * @returns Promise<EnrollmentAnalytics>
 */
export const mockGetEnrollmentAnalytics = (params: { startDate?: string; endDate?: string; planId?: string } = {}) => {
  return new Promise<EnrollmentAnalytics>((resolve) => {
    setTimeout(() => {
      // 过滤数据
      let filteredPlans = [...mockEnrollmentPlans];
      
      if (params.startDate && params.startDate.trim() !== '') {
        const startDate = params.startDate;
        filteredPlans = filteredPlans.filter(plan => plan.startDate >= startDate);
      }
      
      if (params.endDate && params.endDate.trim() !== '') {
        const endDate = params.endDate;
        filteredPlans = filteredPlans.filter(plan => plan.endDate <= endDate);
      }
      
      if (params.planId) {
        filteredPlans = filteredPlans.filter(plan => plan.id === params.planId);
      }
      
      // 计算统计数据
      const totalPlans = filteredPlans.length;
      const activePlans = filteredPlans.filter(plan => plan.status === EnrollmentPlanStatus.ACTIVE).length;
      const totalAdmissions = filteredPlans.reduce((sum, plan) => sum + plan.admittedCount, 0);
      const totalEnrollments = filteredPlans.reduce((sum, plan) => sum + plan.enrolledCount, 0);
      
      // 计算转化率（暂时不使用）
      // const applicationToAdmission = totalApplications > 0 ? totalAdmissions / totalApplications : 0;
      // const admissionToEnrollment = totalAdmissions > 0 ? totalEnrollments / totalAdmissions : 0;
      // const applicationToEnrollment = totalApplications > 0 ? totalEnrollments / totalApplications : 0;
      
      // 生成趋势数据（暂时不使用）
      // const uniquePeriods = [...new Set(filteredPlans.map(plan => plan.startDate.substring(0, 7)))].sort();
      // const trendsData = uniquePeriods.map(period => {
      //   const periodPlans = filteredPlans.filter(plan => plan.startDate.startsWith(period));
      //   return {
      //     period,
      //     applications: periodPlans.reduce((sum, plan) => sum + plan.appliedCount, 0),
      //     admissions: periodPlans.reduce((sum, plan) => sum + plan.admittedCount, 0),
      //     enrollments: periodPlans.reduce((sum, plan) => sum + plan.enrolledCount, 0)
      //   };
      // });
      
      // 生成渠道分布数据
      const channels = ['线上申请', '现场咨询', '电话咨询', '转介绍', '其他'];
      const totalApplied = filteredPlans.reduce((sum, plan) => sum + plan.appliedCount, 0);
      const channelDistribution = channels.map(channel => {
        const count = Math.floor(Math.random() * totalApplied * 0.4) + Math.floor(totalApplied * 0.05);
        return {
          channel,
          count,
          percentage: totalApplied > 0 ? count / totalApplied : 0
        };
      });
      
      // 确保渠道分布数据的总和等于总申请数
      let sumChannelCount = channelDistribution.reduce((sum, item) => sum + item.count, 0);
      if (sumChannelCount !== totalApplied) {
        const diff = totalApplied - sumChannelCount;
        channelDistribution[0].count += diff;
        channelDistribution[0].percentage = totalApplied > 0 ? channelDistribution[0].count / totalApplied : 0;
      }
      
      // 生成班级类型分布数据（暂时不使用）
      // const classTypes = ['小班', '中班', '大班'];
      // const classTypeDistribution = classTypes.map(classType => {
      //   const plansQuotaDetails = filteredPlans.flatMap(plan => plan.quotaDetails.filter(detail => detail.classType === classType));
      //   const quota = plansQuotaDetails.reduce((sum, detail) => sum + detail.quota, 0);
      //   const applied = plansQuotaDetails.reduce((sum, detail) => sum + detail.applied, 0);
      //   const admitted = plansQuotaDetails.reduce((sum, detail) => sum + detail.admitted, 0);
      //   const enrolled = plansQuotaDetails.reduce((sum, detail) => sum + detail.enrolled, 0);
      //
      //   return {
      //     classType,
      //     quota,
      //     applied,
      //     admitted,
      //     enrolled
      //   };
      // });
      
      resolve({
        totalPlans,
        activePlans,
        completedPlans: filteredPlans.filter(plan => plan.status === EnrollmentPlanStatus.COMPLETED).length,
        totalTarget: filteredPlans.reduce((sum, plan) => sum + plan.targetCount, 0),
        totalEnrolled: filteredPlans.reduce((sum, plan) => sum + plan.enrolledCount, 0),
        enrollmentRate: totalEnrollments > 0 ? (totalEnrollments / totalAdmissions) * 100 : 0,
        plansByType: {
          'STANDARD': filteredPlans.filter(plan => plan.type === 'STANDARD').length,
          'SUMMER': filteredPlans.filter(plan => plan.type === 'SUMMER').length,
          'WINTER': filteredPlans.filter(plan => plan.type === 'WINTER').length,
          'SPECIAL': filteredPlans.filter(plan => plan.type === 'SPECIAL').length
        } as any,
        monthlyEnrollment: [
          { month: '2024-01', count: 50 },
          { month: '2024-02', count: 45 },
          { month: '2024-03', count: 60 }
        ]
      });
    }, 700);
  });
}; 