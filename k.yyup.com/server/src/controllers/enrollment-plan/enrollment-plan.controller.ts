/**
 * 招生计划控制器
 */
export const enrollmentPlanController = {
  // 获取招生计划列表
  getAll: async (req, res, next) => {
    try {
      return res.status(200).json({ 
        success: true,
        message: "获取招生计划列表成功",
        data: [] 
      });
    } catch (error) {
      next(error);
    }
  },
  
  // 创建招生计划
  create: async (req, res, next) => {
    try {
      return res.status(201).json({ 
        success: true,
        message: "创建招生计划成功",
        data: {} 
      });
    } catch (error) {
      next(error);
    }
  }
};
