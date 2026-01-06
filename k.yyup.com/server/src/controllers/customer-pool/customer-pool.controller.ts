/**
 * 客户池控制器
 */
export const customerPoolController = {
  // 获取客户池统计数据
  getStats: async (req, res, next) => {
    try {
      const stats = {
        total: 120,
        newToday: 8,
        converted: 35,
        followUp: 45,
        categories: {
          interested: 60,
          considering: 30,
          notInterested: 20,
          converted: 10
        }
      };

      return res.status(200).json({ 
        success: true,
        message: "获取客户池统计成功",
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
};
