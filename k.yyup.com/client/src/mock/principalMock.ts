// 园长模块模拟数据
import {
  PrincipalDashboardStats,
  CampusOverview,
  ApprovalItem,
  PrincipalNotice
} from '../api/modules/principal';

// 生成园长仪表盘模拟统计数据
export const mockPrincipalDashboardStats = (): PrincipalDashboardStats => {
  return {
    totalStudents: 587,
    totalClasses: 24,
    totalTeachers: 43,
    totalActivities: 15,
    pendingApplications: 32,
    enrollmentRate: 0.85,
    teacherAttendanceRate: 0.96,
    studentAttendanceRate: 0.92
  };
};

// 生成园区概览模拟数据
export const mockCampusOverview = (): CampusOverview => {
  return {
    id: "CAMPUS001",
    name: "阳光幼儿园总园",
    address: "北京市海淀区中关村大街1号",
    area: 5000,
    classroomCount: 30,
    occupiedClassroomCount: 24,
    outdoorPlaygroundArea: 2000,
    indoorPlaygroundArea: 1000,
    establishedYear: 2010,
    principalName: "张明",
    contactPhone: "010-12345678",
    email: "principal@example.com",
    description: "阳光幼儿园是一所现代化的幼儿教育机构",
    images: ["img1.jpg", "img2.jpg"],
    facilities: [
      {
        id: 'FAC001',
        name: '多功能教室',
        status: 'NORMAL',
        lastMaintenance: '2023-11-15'
      },
      {
        id: 'FAC002',
        name: '室内体育馆',
        status: 'NORMAL',
        lastMaintenance: '2023-11-10'
      },
      {
        id: 'FAC003',
        name: '室外操场',
        status: 'NORMAL'
      },
      {
        id: 'FAC004',
        name: '音乐教室',
        status: 'MAINTENANCE',
        lastMaintenance: '2023-12-01'
      },
      {
        id: 'FAC005',
        name: '美术教室',
        status: 'NORMAL',
        lastMaintenance: '2023-11-20'
      }
    ],
    events: [
      {
        id: 'EVENT001',
        title: '教师培训会议',
        startTime: '2023-12-25T09:00:00',
        endTime: '2023-12-25T11:30:00',
        location: '会议室A'
      },
      {
        id: 'EVENT002',
        title: '家长开放日',
        startTime: '2023-12-27T14:00:00',
        endTime: '2023-12-27T17:00:00',
        location: '多功能厅'
      },
      {
        id: 'EVENT003',
        title: '期末考核',
        startTime: '2024-01-10T09:00:00',
        endTime: '2024-01-12T17:00:00',
        location: '各班教室'
      }
    ]
  };
};

// 生成模拟审批项目数据
const generateMockApprovals = (count: number): ApprovalItem[] => {
  const types: ApprovalItem['type'][] = ['LEAVE', 'EXPENSE', 'EVENT', 'OTHER'];
  const statuses: ApprovalItem['status'][] = ['PENDING', 'APPROVED', 'REJECTED'];
  const urgencies: ApprovalItem['urgency'][] = ['HIGH', 'MEDIUM', 'LOW'];
  
  return Array.from({ length: count }, (_, index) => {
    const id = `APV${String(index + 1).padStart(4, '0')}`;
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
    
    // 生成随机日期
    const now = new Date();
    const applyDate = new Date(now);
    applyDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
    
    // 根据类型生成标题和内容
    let title = '';
    let description = '';
    const requestBy = `USER${Math.floor(Math.random() * 100) + 1}`;
    let applicantName = `教师${Math.floor(Math.random() * 20) + 1}`;
    
    switch (type) {
      case 'LEAVE':
        title = `请假申请 - ${applicantName}`;
        description = `请假原因：${['生病', '家庭事务', '个人事务'][Math.floor(Math.random() * 3)]}\n请假时间：${Math.floor(Math.random() * 5) + 1}天`;
        break;
      case 'EXPENSE':
        title = `报销申请 - ${applicantName}`;
        description = `报销项目：${['教学用品', '办公用品', '活动经费'][Math.floor(Math.random() * 3)]}\n报销金额：${Math.floor(Math.random() * 1000) + 100}元`;
        break;
      case 'EVENT':
        title = `活动申请 - ${applicantName}`;
        description = `活动名称：${['春游', '艺术节', '体育比赛', '家长会'][Math.floor(Math.random() * 4)]}\n活动时间：${Math.floor(Math.random() * 5) + 1}天\n活动预算：${Math.floor(Math.random() * 5000) + 1000}元`;
        break;
      default:
        title = `其他申请 - ${applicantName}`;
        description = `申请事项：${['设备维修', '课程调整', '教室调整'][Math.floor(Math.random() * 3)]}\n申请原因：工作需要`;
    }
    
    return {
      id,
      title,
      type,
      requestBy,
      requestTime: applyDate.toISOString(),
      status,
      urgency,
      description
    };
  });
};

// 模拟审批项目数据
const mockApprovals = generateMockApprovals(50);

// 生成模拟通知数据
const generateMockNotices = (count: number): PrincipalNotice[] => {
  const importances = ['HIGH', 'MEDIUM', 'LOW'];
  
  return Array.from({ length: count }, (_, index) => {
    const id = `NOT${String(index + 1).padStart(4, '0')}`;
    const importance = importances[Math.floor(Math.random() * importances.length)] as 'HIGH' | 'MEDIUM' | 'LOW';
    
    // 生成随机日期
    const now = new Date();
    const publishDate = new Date(now);
    publishDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
    
    // 可能的过期日期
    let expireDate = null;
    if (Math.random() > 0.3) {
      expireDate = new Date(publishDate);
      expireDate.setDate(publishDate.getDate() + Math.floor(Math.random() * 30) + 7);
    }
    
    const totalCount = Math.floor(Math.random() * 80) + 20;
    const readCount = Math.floor(Math.random() * totalCount);
    
    return {
      id,
      title: `通知${index + 1}：${['关于期末考核安排', '教师培训通知', '校园安全提醒', '家长会通知', '活动通知'][index % 5]}`,
      content: `这是一则${importance === 'HIGH' ? '重要' : importance === 'MEDIUM' ? '一般' : '普通'}通知，请相关人员注意查看并及时处理。`,
      publishTime: publishDate.toISOString(),
      expireTime: expireDate ? expireDate.toISOString() : undefined,
      importance,
      readCount,
      totalCount
    };
  });
};

// 模拟通知数据
const mockNotices = generateMockNotices(20);

/**
 * 模拟获取园长仪表盘统计数据API
 * @returns Promise<PrincipalDashboardStats>
 */
export const mockGetPrincipalDashboardStats = () => {
  return new Promise<PrincipalDashboardStats>((resolve) => {
    setTimeout(() => {
      resolve(mockPrincipalDashboardStats());
    }, 300);
  });
};

/**
 * 模拟获取园区概览数据API
 * @returns Promise<CampusOverview>
 */
export const mockGetCampusOverview = () => {
  return new Promise<CampusOverview>((resolve) => {
    setTimeout(() => {
      resolve(mockCampusOverview());
    }, 300);
  });
};

/**
 * 模拟获取园长待审批列表API
 * @param params 查询参数
 * @returns Promise<{items: ApprovalItem[], total: number}>
 */
export const mockGetApprovalList = (params: { status?: string; type?: string; page?: number; pageSize?: number } = {}) => {
  return new Promise<{items: ApprovalItem[], total: number}>((resolve) => {
    setTimeout(() => {
      let result = [...mockApprovals];
      
      // 状态过滤
      if (params.status) {
        result = result.filter(item => item.status === params.status);
      }
      
      // 类型过滤
      if (params.type) {
        result = result.filter(item => item.type === params.type);
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
 * 模拟处理审批项目API
 * @param id 审批项目ID
 * @param data 审批结果
 * @returns Promise<ApprovalItem>
 */
export const mockProcessApproval = (id: string, data: { status: 'APPROVED' | 'REJECTED'; comment?: string }) => {
  return new Promise<ApprovalItem>((resolve, reject) => {
    setTimeout(() => {
      const approval = mockApprovals.find(item => item.id === id);
      
      if (approval) {
        approval.status = data.status;
        resolve(approval);
      } else {
        reject(new Error('审批项目未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟获取重要通知列表API
 * @param params 查询参数
 * @returns Promise<{items: PrincipalNotice[], total: number}>
 */
export const mockGetImportantNotices = (params: { importance?: string; page?: number; pageSize?: number } = {}) => {
  return new Promise<{items: PrincipalNotice[], total: number}>((resolve) => {
    setTimeout(() => {
      let result = [...mockNotices];
      
      // 重要性过滤
      if (params.importance) {
        result = result.filter(item => item.importance === params.importance);
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
    }, 300);
  });
};

/**
 * 模拟发布园长通知API
 * @param data 通知数据
 * @returns Promise<PrincipalNotice>
 */
export const mockPublishNotice = (data: {
  title: string;
  content: string;
  expireTime?: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  recipientType: 'ALL' | 'TEACHERS' | 'PARENTS' | 'SPECIFIC';
  recipientIds?: string[];
}) => {
  return new Promise<PrincipalNotice>((resolve) => {
    setTimeout(() => {
      const newNotice: PrincipalNotice = {
        id: `NOT${String(mockNotices.length + 1).padStart(4, '0')}`,
        title: data.title,
        content: data.content,
        publishTime: new Date().toISOString(),
        expireTime: data.expireTime,
        importance: data.importance,
        readCount: 0,
        totalCount: data.recipientType === 'ALL' ? 100 : data.recipientType === 'TEACHERS' ? 43 : data.recipientType === 'PARENTS' ? 587 : (data.recipientIds?.length || 0)
      };
      
      mockNotices.unshift(newNotice);
      
      resolve(newNotice);
    }, 500);
  });
}; 