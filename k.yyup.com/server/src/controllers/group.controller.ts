import { Request, Response } from 'express';
import groupService from '../services/group.service';
import groupUserService from '../services/group-user.service';
import groupStatisticsService from '../services/group-statistics.service';
import groupUpgradeService from '../services/group-upgrade.service';

/**
 * 集团控制器类
 */
export class GroupController {
  /**
   * 获取集团列表
   */
  async getGroupList(req: Request, res: Response) {
    try {
      console.log('🔍 GroupController.getGroupList 被调用');
      console.log('🔍 用户信息:', (req as any).user);

      const {
        page = 1,
        pageSize = 10,
        keyword,
        status,
        type,
        investorId
      } = req.query;

      console.log('🔍 查询参数:', { page, pageSize, keyword, status, type, investorId });

      const result = await groupService.getGroupList({
        page: Number(page),
        pageSize: Number(pageSize),
        keyword: keyword as string,
        status: status ? Number(status) : undefined,
        type: type ? Number(type) : undefined,
        investorId: investorId ? Number(investorId) : undefined
      });

      console.log('🔍 查询结果:', result);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('❌ GroupController.getGroupList 错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取集团列表失败'
      });
    }
  }

  /**
   * 获取集团详情
   */
  async getGroupDetail(req: Request, res: Response) {
    try {
      console.log('🔍 GroupController.getGroupDetail 被调用');
      console.log('🔍 用户信息:', (req as any).user);
      console.log('🔍 请求参数:', req.params);

      const { id } = req.params;
      const group = await groupService.getGroupDetail(Number(id));

      console.log('🔍 查询结果:', group);
      res.json({
        success: true,
        data: group
      });
    } catch (error: any) {
      console.error('❌ GroupController.getGroupDetail 错误:', error);
      res.status(404).json({
        success: false,
        message: error.message || '集团不存在'
      });
    }
  }

  /**
   * 创建集团
   */
  async createGroup(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const group = await groupService.createGroup({
        ...req.body,
        creatorId: userId
      });

      res.json({
        success: true,
        data: group,
        message: '创建成功'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '创建失败'
      });
    }
  }

  /**
   * 更新集团信息
   */
  async updateGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const group = await groupService.updateGroup(Number(id), {
        ...req.body,
        updaterId: userId
      });

      res.json({
        success: true,
        data: group,
        message: '更新成功'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '更新失败'
      });
    }
  }

  /**
   * 删除集团
   */
  async deleteGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const result = await groupService.deleteGroup(Number(id), userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '删除失败'
      });
    }
  }

  /**
   * 获取用户的集团列表
   */
  async getUserGroups(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const groups = await groupService.getUserGroups(userId);

      res.json({
        success: true,
        data: groups
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '获取失败'
      });
    }
  }

  /**
   * 获取集团用户列表
   */
  async getGroupUsers(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const users = await groupUserService.getGroupUsers(Number(groupId));

      res.json({
        success: true,
        data: users
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '获取失败'
      });
    }
  }

  /**
   * 添加集团用户
   */
  async addGroupUser(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const groupUser = await groupUserService.addGroupUser({
        groupId: Number(groupId),
        ...req.body
      });

      res.json({
        success: true,
        data: groupUser,
        message: '添加成功'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '添加失败'
      });
    }
  }

  /**
   * 更新集团用户权限
   */
  async updateGroupUser(req: Request, res: Response) {
    try {
      const { groupId, userId } = req.params;
      const groupUser = await groupUserService.updateGroupUser(
        Number(groupId),
        Number(userId),
        req.body
      );

      res.json({
        success: true,
        data: groupUser,
        message: '更新成功'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '更新失败'
      });
    }
  }

  /**
   * 移除集团用户
   */
  async removeGroupUser(req: Request, res: Response) {
    try {
      const { groupId, userId } = req.params;
      const result = await groupUserService.removeGroupUser(
        Number(groupId),
        Number(userId)
      );

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '移除失败'
      });
    }
  }

  /**
   * 获取集团统计数据
   */
  async getGroupStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statistics = await groupStatisticsService.getGroupStatistics(Number(id));

      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '获取统计数据失败'
      });
    }
  }

  /**
   * 获取集团活动数据
   */
  async getGroupActivities(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const activities = await groupStatisticsService.getGroupActivities(
        Number(id),
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: activities
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '获取活动数据失败'
      });
    }
  }

  /**
   * 获取集团招生数据
   */
  async getGroupEnrollment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { year } = req.query;

      const enrollment = await groupStatisticsService.getGroupEnrollment(
        Number(id),
        year ? Number(year) : undefined
      );

      res.json({
        success: true,
        data: enrollment
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '获取招生数据失败'
      });
    }
  }

  /**
   * 检测升级资格
   */
  async checkUpgradeEligibility(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const eligibility = await groupUpgradeService.checkUpgradeEligibility(userId);

      res.json({
        success: true,
        data: eligibility
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '检测失败'
      });
    }
  }

  /**
   * 升级为集团
   */
  async upgradeToGroup(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const result = await groupUpgradeService.upgradeToGroup({
        userId,
        ...req.body
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '升级失败'
      });
    }
  }

  /**
   * 园所加入集团
   */
  async addKindergartenToGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const result = await groupUpgradeService.addKindergartenToGroup(
        Number(id),
        req.body.kindergartenId,
        userId,
        req.body.groupRole
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '添加失败'
      });
    }
  }

  /**
   * 园所退出集团
   */
  async removeKindergartenFromGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const result = await groupUpgradeService.removeKindergartenFromGroup(
        Number(id),
        req.body.kindergartenId,
        userId
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '移除失败'
      });
    }
  }
}

export default new GroupController();

