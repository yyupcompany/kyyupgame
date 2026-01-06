/**
 * 营销活动控制器
 */
export const marketingCampaignController = {
  // 获取营销活动列表
  getAll: async (req, res, next) => {
    try {
      return res.status(200).json({ 
        success: true,
        message: "获取营销活动列表成功",
        data: [] 
      });
    } catch (error) {
      next(error);
    }
  },
  
  // 创建营销活动
  create: async (req, res, next) => {
    try {
      return res.status(201).json({ 
        success: true,
        message: "创建营销活动成功",
        data: {} 
      });
    } catch (error) {
      next(error);
    }
  }
};
