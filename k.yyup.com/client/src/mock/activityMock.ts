// 活动模块模拟数据
import { Activity, ActivityQueryParams } from '../api/modules/activity';

// 扩展查询参数接口
interface ExtendedActivityQueryParams extends ActivityQueryParams {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  pageSize?: number;
}

// 活动状态枚举
enum ActivityStatus {
  DRAFT = 0,      // 草稿
  PUBLISHED = 1,  // 已发布
  ONGOING = 2,    // 进行中
  COMPLETED = 3,  // 已完成
  CANCELLED = 4   // 已取消
}

// 生成模拟活动数据
const generateMockActivities = (count: number): any[] => {
  return Array.from({ length: count }, (_, index) => {
    const id = `ACT${String(index + 1).padStart(4, '0')}`;
    const statusValues = Object.values(ActivityStatus);
    const randomStatus = statusValues[Math.floor(Math.random() * statusValues.length)];
    
    // 生成随机日期
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14) + 1);
    
    const createdDate = new Date(startDate);
    createdDate.setDate(startDate.getDate() - Math.floor(Math.random() * 10) - 5);
    
    return {
      id,
      title: `活动${index + 1}：${['春游', '夏令营', '科学实验', '艺术展览', '体育比赛', '阅读日', '音乐会', '亲子活动'][index % 8]}`,
      description: `这是一个${['有趣的', '精彩的', '令人兴奋的', '具有教育意义的', '创新的'][index % 5]}活动，所有的孩子都会喜欢。`,
      startTime: startDate.toISOString().split('T')[0],
      endTime: endDate.toISOString().split('T')[0],
      location: `${['多功能厅', '操场', '教室', '艺术室', '音乐室', '户外草坪', '图书馆'][index % 7]}`,
      coverImage: index % 3 === 0 ? `https://example.com/images/activity${index + 1}.jpg` : undefined,
      status: randomStatus as any,
      createdBy: 'teacher1',
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + 86400000).toISOString()
    };
  });
};

// 模拟活动数据
const mockActivities = generateMockActivities(50);

/**
 * 模拟获取活动列表API
 * @param params 查询参数
 * @returns Promise<{items: Activity[], total: number}>
 */
export const mockGetActivityList = (params: ExtendedActivityQueryParams) => {
  return new Promise<{items: Activity[], total: number}>((resolve) => {
    // 延迟响应，模拟网络请求
    setTimeout(() => {
      let result = [...mockActivities];
      
      // 关键词过滤
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        result = result.filter(
          item => item.title.toLowerCase().includes(keyword) || 
                 item.description.toLowerCase().includes(keyword) ||
                 item.location.toLowerCase().includes(keyword)
        );
      }
      
      // 状态过滤
      if (params.status) {
        result = result.filter(item => item.status === params.status);
      }
      
      // 日期范围过滤
      const startDate = params.startDate as string | undefined;
      if (startDate && startDate.trim() !== '') {
        result = result.filter(item => item.startTime >= startDate);
      }
      
      const endDate = params.endDate as string | undefined;
      if (endDate && endDate.trim() !== '') {
        result = result.filter(item => item.endTime <= endDate);
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
    }, 500); // 模拟500ms网络延迟
  });
};

/**
 * 模拟获取活动详情API
 * @param id 活动ID
 * @returns Promise<Activity>
 */
export const mockGetActivityDetail = (id: string) => {
  return new Promise<Activity>((resolve, reject) => {
    setTimeout(() => {
      const activity = mockActivities.find(item => item.id === id);
      
      if (activity) {
        resolve(activity);
      } else {
        reject(new Error('活动未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟删除活动API
 * @param id 活动ID
 * @returns Promise<void>
 */
export const mockDeleteActivity = (id: string) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      const index = mockActivities.findIndex(item => item.id === id);
      
      if (index !== -1) {
        mockActivities.splice(index, 1);
        resolve();
      } else {
        reject(new Error('活动未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟批量删除活动API
 * @param ids 活动ID数组
 * @returns Promise<void>
 */
export const mockBatchDeleteActivities = (ids: string[]) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      ids.forEach(id => {
        const index = mockActivities.findIndex(item => item.id === id);
        if (index !== -1) {
          mockActivities.splice(index, 1);
        }
      });
      resolve();
    }, 500);
  });
};

/**
 * 模拟更新活动状态API
 * @param id 活动ID
 * @param status 新状态
 * @returns Promise<Activity>
 */
export const mockUpdateActivityStatus = (id: string, status: ActivityStatus) => {
  return new Promise<Activity>((resolve, reject) => {
    setTimeout(() => {
      const activity = mockActivities.find(item => item.id === id);
      
      if (activity) {
        activity.status = status as any;
        activity.updatedAt = new Date().toISOString();
        resolve(activity);
      } else {
        reject(new Error('活动未找到'));
      }
    }, 300);
  });
}; 