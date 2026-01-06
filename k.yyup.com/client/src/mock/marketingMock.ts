// 营销管理模块模拟数据
import {
  MarketingActivity,
  MarketingActivityStatus,
  MarketingActivityType,
  MarketingActivityQueryParams,
  MarketingChannel,
  MarketingAnalytics
} from '../api/modules/marketing';

// 生成模拟营销活动数据
const generateMockMarketingActivities = (count: number): MarketingActivity[] => {
  const statusValues = Object.values(MarketingActivityStatus);
  const typeValues = Object.values(MarketingActivityType);
  
  return Array.from({ length: count }, (_, index) => {
    const id = `MAR${String(index + 1).padStart(4, '0')}`;
    const status = statusValues[Math.floor(Math.random() * statusValues.length)];
    const type = typeValues[Math.floor(Math.random() * typeValues.length)];
    
    // 生成随机日期
    const now = new Date();
    const startDate = new Date(now);
    
    // 根据状态设置不同的日期范围
    if (status === MarketingActivityStatus.COMPLETED) {
      startDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6) - 1);
    } else if (status === MarketingActivityStatus.ONGOING) {
      startDate.setDate(now.getDate() - Math.floor(Math.random() * 15));
    } else if (status === MarketingActivityStatus.PLANNED) {
      startDate.setDate(now.getDate() + Math.floor(Math.random() * 30) + 1);
    } else {
      startDate.setDate(now.getDate() - Math.floor(Math.random() * 30) + Math.floor(Math.random() * 60));
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 1);
    
    const createdDate = new Date(startDate);
    createdDate.setMonth(startDate.getMonth() - 1);
    
    // 预算和支出
    const budget = Math.floor(Math.random() * 10000) + 1000;
    let expenditure = 0;
    
    // 根据状态设置不同的参与人数和转化数
    const estimatedParticipants = Math.floor(Math.random() * 100) + 20;
    let actualParticipants = 0;
    let leadCount = 0;
    let conversionCount = 0;
    
    switch (status) {
      case MarketingActivityStatus.DRAFT:
        expenditure = 0;
        actualParticipants = 0;
        leadCount = 0;
        conversionCount = 0;
        break;
      case MarketingActivityStatus.PLANNED:
        expenditure = Math.floor(budget * 0.1);
        actualParticipants = 0;
        leadCount = 0;
        conversionCount = 0;
        break;
      case MarketingActivityStatus.ONGOING:
        expenditure = Math.floor(budget * (Math.random() * 0.5 + 0.2));
        actualParticipants = Math.floor(estimatedParticipants * (Math.random() * 0.5 + 0.3));
        leadCount = Math.floor(actualParticipants * (Math.random() * 0.4 + 0.3));
        conversionCount = Math.floor(leadCount * (Math.random() * 0.3 + 0.1));
        break;
      case MarketingActivityStatus.COMPLETED:
        expenditure = Math.floor(budget * (Math.random() * 0.3 + 0.7));
        actualParticipants = Math.floor(estimatedParticipants * (Math.random() * 0.4 + 0.6));
        leadCount = Math.floor(actualParticipants * (Math.random() * 0.3 + 0.4));
        conversionCount = Math.floor(leadCount * (Math.random() * 0.3 + 0.2));
        break;
      case MarketingActivityStatus.CANCELLED:
        expenditure = Math.floor(budget * (Math.random() * 0.3));
        actualParticipants = 0;
        leadCount = 0;
        conversionCount = 0;
        break;
    }
    
    // 根据活动类型生成不同的标题和描述
    let title = '';
    let description = '';
    let location = '';
    let targetAudience = '';
    
    switch (type) {
      case MarketingActivityType.OPEN_DAY:
        title = `幼儿园开放日活动${index + 1}`;
        description = '邀请家长和孩子参观幼儿园，了解园区环境、教学理念和课程设置，体验幼儿园生活。';
        location = '幼儿园主园区';
        targetAudience = '有3-6岁适龄儿童的家庭';
        break;
      case MarketingActivityType.WORKSHOP:
        title = `亲子工作坊${index + 1}`;
        description = '组织亲子互动工作坊，通过游戏和手工活动，促进家长和孩子的互动，同时展示幼儿园的教育理念。';
        location = '幼儿园多功能厅';
        targetAudience = '3-6岁儿童及其家长';
        break;
      case MarketingActivityType.SEMINAR:
        title = `育儿讲座${index + 1}`;
        description = '邀请知名儿童教育专家，为家长分享科学育儿知识，解答育儿困惑，同时宣传幼儿园特色教育方法。';
        location = '社区文化中心';
        targetAudience = '婴幼儿家长';
        break;
      case MarketingActivityType.EXHIBITION:
        title = `幼儿作品展${index + 1}`;
        description = '展示幼儿园孩子们的优秀作品，包括绘画、手工、表演等，吸引家长关注幼儿园的教育成果。';
        location = '市少年宫展览厅';
        targetAudience = '对幼儿教育感兴趣的家长';
        break;
      case MarketingActivityType.ONLINE:
        title = `线上育儿分享会${index + 1}`;
        description = '通过线上直播平台，分享育儿经验和幼儿园特色课程，扩大幼儿园知名度和影响力。';
        location = '线上平台';
        targetAudience = '全市范围内的适龄儿童家长';
        break;
      case MarketingActivityType.COMMUNITY:
        title = `社区亲子活动${index + 1}`;
        description = '走进社区，组织亲子游戏和互动活动，增强幼儿园与社区的联系，提升品牌认知度。';
        location = '城市社区广场';
        targetAudience = '社区内的适龄儿童家庭';
        break;
      case MarketingActivityType.OTHER:
        title = `特色活动${index + 1}`;
        description = '根据季节和节日特点，组织特色主题活动，吸引家长和孩子参与，体验幼儿园文化。';
        location = '幼儿园或市区公共场所';
        targetAudience = '全市适龄儿童家庭';
        break;
    }
    
    // 可能的附件
    const attachments = Math.random() > 0.5 ? [
      {
        id: `ATT${String(index * 2 + 1).padStart(4, '0')}`,
        name: '活动策划书.docx',
        url: 'https://example.com/files/plan.docx',
        type: 'document'
      },
      {
        id: `ATT${String(index * 2 + 2).padStart(4, '0')}`,
        name: '活动海报.jpg',
        url: 'https://example.com/files/poster.jpg',
        type: 'image'
      }
    ] : undefined;
    
    return {
      id,
      title,
      description,
      type,
      status,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      location,
      budget,
      expenditure,
      targetAudience,
      estimatedParticipants,
      actualParticipants,
      leadCount,
      conversionCount,
      attachments,
      organizer: '市场部',
      createdBy: 'user1',
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + 86400000 * (Math.random() * 5)).toISOString()
    };
  });
};

// 生成模拟营销渠道数据
const generateMockMarketingChannels = (count: number): MarketingChannel[] => {
  const channelTypes = ['ONLINE', 'OFFLINE', 'SOCIAL', 'PARTNERSHIP', 'OTHER'];
  
  return Array.from({ length: count }, (_, index) => {
    const id = `CHN${String(index + 1).padStart(4, '0')}`;
    const type = channelTypes[Math.floor(Math.random() * channelTypes.length)] as 'ONLINE' | 'OFFLINE' | 'SOCIAL' | 'PARTNERSHIP' | 'OTHER';
    
    // 根据渠道类型设置名称和描述
    let name = '';
    let description = '';
    
    switch (type) {
      case 'ONLINE':
        name = ['官方网站', '搜索引擎推广', '在线教育平台', '电子邮件营销'][index % 4];
        description = '通过互联网渠道吸引目标家长关注，提供幼儿园信息和咨询服务。';
        break;
      case 'OFFLINE':
        name = ['社区宣传', '户外广告', '传单派发', '育儿杂志广告'][index % 4];
        description = '通过线下渠道增加幼儿园曝光度，直接触达目标家长群体。';
        break;
      case 'SOCIAL':
        name = ['微信公众号', '微博', '抖音', '小红书'][index % 4];
        description = '利用社交媒体平台分享幼儿园动态和育儿知识，扩大影响力。';
        break;
      case 'PARTNERSHIP':
        name = ['社区合作', '儿童品牌联合', '早教机构合作', '医院合作'][index % 4];
        description = '与相关机构建立合作关系，共同开展活动，实现资源共享。';
        break;
      case 'OTHER':
        name = ['口碑推荐', '家长推荐计划', '员工推荐', '其他渠道'][index % 4];
        description = '通过口碑和推荐机制，扩大幼儿园影响力，获取优质生源。';
        break;
    }
    
    // 渠道成本和效果数据
    const cost = Math.floor(Math.random() * 5000) + 500;
    const leadCount = Math.floor(Math.random() * 100) + 10;
    const conversionCount = Math.floor(leadCount * (Math.random() * 0.5 + 0.1));
    const conversionRate = conversionCount / leadCount;
    
    const createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - Math.floor(Math.random() * 12));
    
    return {
      id,
      name,
      type,
      description,
      cost,
      leadCount,
      conversionCount,
      conversionRate,
      active: Math.random() > 0.2,
      createdAt: createdDate.toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
};

// 模拟营销活动数据
const mockMarketingActivities = generateMockMarketingActivities(30);

// 模拟营销渠道数据
const mockMarketingChannels = generateMockMarketingChannels(10);

/**
 * 模拟获取营销活动列表API
 * @param params 查询参数
 * @returns Promise<{items: MarketingActivity[], total: number}>
 */
export const mockGetMarketingActivityList = (params: MarketingActivityQueryParams) => {
  return new Promise<{items: MarketingActivity[], total: number}>((resolve) => {
    setTimeout(() => {
      let result = [...mockMarketingActivities];
      
      // 关键词过滤
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        result = result.filter(
          item => item.title.toLowerCase().includes(keyword) || 
                 item.description.toLowerCase().includes(keyword)
        );
      }
      
      // 类型过滤
      if (params.type) {
        result = result.filter(item => item.type === params.type);
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
 * 模拟获取营销活动详情API
 * @param id 营销活动ID
 * @returns Promise<MarketingActivity>
 */
export const mockGetMarketingActivityDetail = (id: string) => {
  return new Promise<MarketingActivity>((resolve, reject) => {
    setTimeout(() => {
      const activity = mockMarketingActivities.find(item => item.id === id);
      
      if (activity) {
        resolve(activity);
      } else {
        reject(new Error('营销活动未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟创建营销活动API
 * @param data 营销活动创建参数
 * @returns Promise<MarketingActivity>
 */
export const mockCreateMarketingActivity = (data: any) => {
  return new Promise<MarketingActivity>((resolve) => {
    setTimeout(() => {
      const id = `MAR${String(mockMarketingActivities.length + 1).padStart(4, '0')}`;
      const now = new Date().toISOString();
      
      const newActivity: MarketingActivity = {
        id,
        ...data,
        expenditure: 0,
        actualParticipants: 0,
        leadCount: 0,
        conversionCount: 0,
        createdBy: 'user1',
        createdAt: now,
        updatedAt: now
      };
      
      mockMarketingActivities.unshift(newActivity);
      
      resolve(newActivity);
    }, 500);
  });
};

/**
 * 模拟更新营销活动API
 * @param id 营销活动ID
 * @param data 营销活动更新参数
 * @returns Promise<MarketingActivity>
 */
export const mockUpdateMarketingActivity = (id: string, data: any) => {
  return new Promise<MarketingActivity>((resolve, reject) => {
    setTimeout(() => {
      const index = mockMarketingActivities.findIndex(item => item.id === id);
      
      if (index !== -1) {
        const activity = mockMarketingActivities[index];
        const updatedActivity = {
          ...activity,
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        mockMarketingActivities[index] = updatedActivity;
        
        resolve(updatedActivity);
      } else {
        reject(new Error('营销活动未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟删除营销活动API
 * @param id 营销活动ID
 * @returns Promise<void>
 */
export const mockDeleteMarketingActivity = (id: string) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      const index = mockMarketingActivities.findIndex(item => item.id === id);
      
      if (index !== -1) {
        mockMarketingActivities.splice(index, 1);
        resolve();
      } else {
        reject(new Error('营销活动未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟更新营销活动状态API
 * @param id 营销活动ID
 * @param status 营销活动状态
 * @returns Promise<MarketingActivity>
 */
export const mockUpdateMarketingActivityStatus = (id: string, status: MarketingActivityStatus) => {
  return new Promise<MarketingActivity>((resolve, reject) => {
    setTimeout(() => {
      const activity = mockMarketingActivities.find(item => item.id === id);
      
      if (activity) {
        activity.status = status;
        activity.updatedAt = new Date().toISOString();
        resolve(activity);
      } else {
        reject(new Error('营销活动未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟更新营销活动结果数据API
 * @param id 营销活动ID
 * @param data 结果数据
 * @returns Promise<MarketingActivity>
 */
export const mockUpdateMarketingActivityResults = (id: string, data: {
  actualParticipants: number;
  leadCount: number;
  conversionCount: number;
  expenditure: number;
}) => {
  return new Promise<MarketingActivity>((resolve, reject) => {
    setTimeout(() => {
      const activity = mockMarketingActivities.find(item => item.id === id);
      
      if (activity) {
        activity.actualParticipants = data.actualParticipants;
        activity.leadCount = data.leadCount;
        activity.conversionCount = data.conversionCount;
        activity.expenditure = data.expenditure;
        activity.updatedAt = new Date().toISOString();
        resolve(activity);
      } else {
        reject(new Error('营销活动未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟获取营销渠道列表API
 * @returns Promise<MarketingChannel[]>
 */
export const mockGetMarketingChannelList = () => {
  return new Promise<MarketingChannel[]>((resolve) => {
    setTimeout(() => {
      resolve(mockMarketingChannels);
    }, 300);
  });
};

/**
 * 模拟创建营销渠道API
 * @param data 渠道数据
 * @returns Promise<MarketingChannel>
 */
export const mockCreateMarketingChannel = (data: {
  name: string;
  type: 'ONLINE' | 'OFFLINE' | 'SOCIAL' | 'PARTNERSHIP' | 'OTHER';
  description: string;
  cost: number;
}) => {
  return new Promise<MarketingChannel>((resolve) => {
    setTimeout(() => {
      const id = `CHN${String(mockMarketingChannels.length + 1).padStart(4, '0')}`;
      const now = new Date().toISOString();
      
      const newChannel: MarketingChannel = {
        id,
        ...data,
        leadCount: 0,
        conversionCount: 0,
        conversionRate: 0,
        active: true,
        createdAt: now,
        updatedAt: now
      };
      
      mockMarketingChannels.push(newChannel);
      
      resolve(newChannel);
    }, 300);
  });
};

/**
 * 模拟更新营销渠道API
 * @param id 渠道ID
 * @param data 渠道更新数据
 * @returns Promise<MarketingChannel>
 */
export const mockUpdateMarketingChannel = (id: string, data: Partial<{
  name: string;
  type: 'ONLINE' | 'OFFLINE' | 'SOCIAL' | 'PARTNERSHIP' | 'OTHER';
  description: string;
  cost: number;
  active: boolean;
}>) => {
  return new Promise<MarketingChannel>((resolve, reject) => {
    setTimeout(() => {
      const channel = mockMarketingChannels.find(item => item.id === id);
      
      if (channel) {
        Object.assign(channel, data);
        channel.updatedAt = new Date().toISOString();
        resolve(channel);
      } else {
        reject(new Error('营销渠道未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟删除营销渠道API
 * @param id 渠道ID
 * @returns Promise<void>
 */
export const mockDeleteMarketingChannel = (id: string) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      const index = mockMarketingChannels.findIndex(item => item.id === id);
      
      if (index !== -1) {
        mockMarketingChannels.splice(index, 1);
        resolve();
      } else {
        reject(new Error('营销渠道未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟获取营销分析数据API
 * @param params 查询参数
 * @returns Promise<MarketingAnalytics>
 */
export const mockGetMarketingAnalytics = (params: {
  startDate?: string;
  endDate?: string;
  channelId?: string;
  activityType?: MarketingActivityType;
} = {}) => {
  return new Promise<MarketingAnalytics>((resolve) => {
    setTimeout(() => {
      // 过滤数据
      let filteredActivities = [...mockMarketingActivities];
      
      if (params.startDate && params.startDate.trim() !== '') {
        const startDate = params.startDate;
        filteredActivities = filteredActivities.filter(activity => activity.startDate >= startDate);
      }
      
      if (params.endDate && params.endDate.trim() !== '') {
        const endDate = params.endDate;
        filteredActivities = filteredActivities.filter(activity => activity.endDate <= endDate);
      }
      
      if (params.activityType) {
        filteredActivities = filteredActivities.filter(activity => activity.type === params.activityType);
      }
      
      // 计算统计数据
      const totalActivities = filteredActivities.length;
      const ongoingActivities = filteredActivities.filter(activity => activity.status === MarketingActivityStatus.ONGOING).length;
      const totalLeads = filteredActivities.reduce((sum, activity) => sum + activity.leadCount, 0);
      const totalConversions = filteredActivities.reduce((sum, activity) => sum + activity.conversionCount, 0);
      const conversionRate = totalLeads > 0 ? totalConversions / totalLeads : 0;
      const totalExpenditure = filteredActivities.reduce((sum, activity) => sum + activity.expenditure, 0);
      const totalBudget = filteredActivities.reduce((sum, activity) => sum + activity.budget, 0);
      const budgetUtilization = totalBudget > 0 ? totalExpenditure / totalBudget : 0;
      const costPerLead = totalLeads > 0 ? totalExpenditure / totalLeads : 0;
      const costPerConversion = totalConversions > 0 ? totalExpenditure / totalConversions : 0;
      
      // 生成渠道绩效数据
      let channelPerformance: Array<{
        channel: string;
        leadCount: number;
        conversionCount: number;
        conversionRate: number;
        cost: number;
        costPerLead: number;
        costPerConversion: number;
      }> = [];
      
      if (params.channelId) {
        // 如果指定了渠道ID，只返回该渠道的数据
        const channel = mockMarketingChannels.find(channel => channel.id === params.channelId);
        if (channel) {
          channelPerformance = [{
            channel: channel.name,
            leadCount: channel.leadCount,
            conversionCount: channel.conversionCount,
            conversionRate: channel.conversionRate,
            cost: channel.cost,
            costPerLead: channel.leadCount > 0 ? channel.cost / channel.leadCount : 0,
            costPerConversion: channel.conversionCount > 0 ? channel.cost / channel.conversionCount : 0
          }];
        }
      } else {
        // 否则返回所有渠道的数据
        channelPerformance = mockMarketingChannels.map(channel => ({
          channel: channel.name,
          leadCount: channel.leadCount,
          conversionCount: channel.conversionCount,
          conversionRate: channel.conversionRate,
          cost: channel.cost,
          costPerLead: channel.leadCount > 0 ? channel.cost / channel.leadCount : 0,
          costPerConversion: channel.conversionCount > 0 ? channel.cost / channel.conversionCount : 0
        }));
      }
      
      // 生成活动绩效数据
      const activityPerformance = filteredActivities
        .filter(activity => activity.status === MarketingActivityStatus.COMPLETED)
        .map(activity => ({
          activityId: activity.id,
          activityTitle: activity.title,
          leadCount: activity.leadCount,
          conversionCount: activity.conversionCount,
          conversionRate: activity.leadCount > 0 ? activity.conversionCount / activity.leadCount : 0,
          expenditure: activity.expenditure,
          costPerLead: activity.leadCount > 0 ? activity.expenditure / activity.leadCount : 0,
          costPerConversion: activity.conversionCount > 0 ? activity.expenditure / activity.conversionCount : 0
        }));
      
      // 生成趋势数据
      const uniquePeriods = Array.from(new Set(filteredActivities.map(activity => activity.startDate.substring(0, 7)))).sort();
      const trendsData = uniquePeriods.map(period => {
        const periodActivities = filteredActivities.filter(activity => activity.startDate.startsWith(period));
        return {
          period,
          leads: periodActivities.reduce((sum, activity) => sum + activity.leadCount, 0),
          conversions: periodActivities.reduce((sum, activity) => sum + activity.conversionCount, 0),
          expenditure: periodActivities.reduce((sum, activity) => sum + activity.expenditure, 0)
        };
      });
      
      resolve({
        totalActivities,
        ongoingActivities,
        totalLeads,
        totalConversions,
        conversionRate,
        totalExpenditure,
        budgetUtilization,
        costPerLead,
        costPerConversion,
        channelPerformance,
        activityPerformance,
        trendsData
      });
    }, 700);
  });
}; 