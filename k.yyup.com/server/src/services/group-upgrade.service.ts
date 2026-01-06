import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { Group, GroupStatus, GroupType } from '../models/group.model';
import { Kindergarten } from '../models/kindergarten.model';
import { GroupUser, GroupRole } from '../models/group-user.model';
import { User } from '../models/user.model';

/**
 * 升级资格检查结果接口
 */
interface UpgradeEligibility {
  eligible: boolean;
  kindergartenCount: number;
  kindergartens: Array<{
    id: number;
    name: string;
    code: string;
    studentCount: number;
    teacherCount: number;
  }>;
  suggestUpgrade: boolean;
  reason?: string;
}

/**
 * 升级参数接口
 */
interface UpgradeToGroupParams {
  userId: number;
  groupName: string;
  groupCode?: string;
  kindergartenIds: number[];
  headquartersId?: number;
  brandName?: string;
  slogan?: string;
  description?: string;
}

/**
 * 集团升级服务类
 */
export class GroupUpgradeService {
  /**
   * 检测升级资格
   */
  async checkUpgradeEligibility(userId: number): Promise<UpgradeEligibility> {
    // 查找用户创建的所有园所
    const kindergartens = await Kindergarten.findAll({
      where: {
        creatorId: userId,
        status: 1,
        groupId: null // 未加入集团的园所
      },
      attributes: ['id', 'name', 'code', 'studentCount', 'teacherCount']
    });

    const kindergartenCount = kindergartens.length;
    const eligible = kindergartenCount >= 2;

    return {
      eligible,
      kindergartenCount,
      kindergartens: kindergartens.map(k => ({
        id: k.id,
        name: k.name,
        code: k.code,
        studentCount: k.studentCount,
        teacherCount: k.teacherCount
      })),
      suggestUpgrade: eligible,
      reason: eligible 
        ? '您有多个园所，建议升级为集团以便统一管理'
        : kindergartenCount === 1
          ? '您只有1个园所，暂不需要升级为集团'
          : '您还没有创建园所'
    };
  }

  /**
   * 执行升级操作
   */
  async upgradeToGroup(params: UpgradeToGroupParams) {
    const {
      userId,
      groupName,
      groupCode,
      kindergartenIds,
      headquartersId,
      brandName,
      slogan,
      description
    } = params;

    // 开启事务
    const transaction: Transaction = await sequelize.transaction();

    try {
      // 1. 验证园所所有权
      const kindergartens = await Kindergarten.findAll({
        where: {
          id: kindergartenIds,
          creatorId: userId,
          groupId: null
        },
        transaction
      });

      if (kindergartens.length !== kindergartenIds.length) {
        throw new Error('部分园所不存在或已加入其他集团');
      }

      if (kindergartens.length < 2) {
        throw new Error('至少需要2个园所才能升级为集团');
      }

      // 2. 生成集团编码
      const code = groupCode || `GRP${Date.now()}`;

      // 检查编码是否已存在
      const existingGroup = await Group.findOne({
        where: { code },
        transaction
      });

      if (existingGroup) {
        throw new Error('集团编码已存在');
      }

      // 3. 计算统计数据
      const kindergartenCount = kindergartens.length;
      const totalStudents = kindergartens.reduce((sum, k) => sum + k.studentCount, 0);
      const totalTeachers = kindergartens.reduce((sum, k) => sum + k.teacherCount, 0);
      const totalClasses = kindergartens.reduce((sum, k) => sum + k.classCount, 0);
      const totalCapacity = totalClasses * 30; // 假设每班30人

      // 4. 创建集团
      const group = await Group.create({
        name: groupName,
        code,
        type: GroupType.EDUCATION,
        brandName: brandName || groupName,
        slogan,
        description,
        investorId: userId,
        kindergartenCount,
        totalStudents,
        totalTeachers,
        totalClasses,
        totalCapacity,
        status: GroupStatus.ACTIVE,
        creatorId: userId
      }, { transaction });

      // 5. 关联幼儿园到集团
      await Kindergarten.update(
        {
          groupId: group.id,
          joinGroupDate: new Date(),
          groupJoinReason: '升级为集团时加入'
        },
        {
          where: { id: kindergartenIds },
          transaction
        }
      );

      // 6. 设置集团总部
      const hqId = headquartersId || kindergartenIds[0];
      await Kindergarten.update(
        { 
          isGroupHeadquarters: 1,
          groupRole: 1 // 总部
        },
        {
          where: { id: hqId },
          transaction
        }
      );

      // 设置其他园所为标准园
      await Kindergarten.update(
        { 
          groupRole: 3 // 标准园
        },
        {
          where: { 
            id: kindergartenIds.filter(id => id !== hqId)
          },
          transaction
        }
      );

      // 7. 创建集团管理员权限（投资人）
      await GroupUser.create({
        groupId: group.id,
        userId,
        role: GroupRole.INVESTOR,
        canViewAllKindergartens: 1,
        canManageKindergartens: 1,
        canViewFinance: 1,
        canManageFinance: 1,
        status: 1,
        remark: '升级为集团时自动创建'
      }, { transaction });

      // 提交事务
      await transaction.commit();

      return {
        success: true,
        group: {
          id: group.id,
          name: group.name,
          code: group.code,
          kindergartenCount: group.kindergartenCount,
          totalStudents: group.totalStudents,
          totalTeachers: group.totalTeachers
        },
        message: '升级成功！您现在可以在集团管理中心查看和管理所有园所。'
      };

    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 园所加入集团
   */
  async addKindergartenToGroup(
    groupId: number,
    kindergartenId: number,
    userId: number,
    groupRole?: number
  ) {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // 1. 验证集团权限
      const groupUser = await GroupUser.findOne({
        where: {
          groupId,
          userId,
          role: [GroupRole.INVESTOR, GroupRole.ADMIN]
        }
      });

      if (!groupUser) {
        throw new Error('您没有权限管理该集团');
      }

      // 2. 验证园所状态
      const kindergarten = await Kindergarten.findByPk(kindergartenId, { transaction });

      if (!kindergarten) {
        throw new Error('园所不存在');
      }

      if (kindergarten.groupId) {
        throw new Error('该园所已加入其他集团');
      }

      // 3. 更新园所
      await kindergarten.update({
        groupId,
        joinGroupDate: new Date(),
        groupRole: groupRole || 3, // 默认为标准园
        groupJoinReason: '手动加入集团'
      }, { transaction });

      // 4. 更新集团统计
      await Group.increment(
        {
          kindergartenCount: 1,
          totalStudents: kindergarten.studentCount,
          totalTeachers: kindergarten.teacherCount,
          totalClasses: kindergarten.classCount
        },
        { where: { id: groupId }, transaction }
      );

      await transaction.commit();

      return {
        success: true,
        message: '园所加入成功'
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 园所退出集团
   */
  async removeKindergartenFromGroup(
    groupId: number,
    kindergartenId: number,
    userId: number
  ) {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // 1. 验证集团权限
      const groupUser = await GroupUser.findOne({
        where: {
          groupId,
          userId,
          role: [GroupRole.INVESTOR, GroupRole.ADMIN]
        }
      });

      if (!groupUser) {
        throw new Error('您没有权限管理该集团');
      }

      // 2. 验证园所
      const kindergarten = await Kindergarten.findByPk(kindergartenId, { transaction });

      if (!kindergarten) {
        throw new Error('园所不存在');
      }

      if (kindergarten.groupId !== groupId) {
        throw new Error('该园所不属于此集团');
      }

      // 3. 检查是否是集团总部
      if (kindergarten.isGroupHeadquarters === 1) {
        // 检查集团是否还有其他园所
        const otherKindergartens = await Kindergarten.count({
          where: {
            groupId,
            id: { $ne: kindergartenId }
          },
          transaction
        });

        if (otherKindergartens > 0) {
          throw new Error('集团总部不能直接退出，请先设置其他园所为总部');
        }
      }

      // 4. 更新园所
      await kindergarten.update({
        groupId: null,
        isGroupHeadquarters: 0,
        groupRole: null,
        leaveGroupDate: new Date()
      }, { transaction });

      // 5. 更新集团统计
      await Group.decrement(
        {
          kindergartenCount: 1,
          totalStudents: kindergarten.studentCount,
          totalTeachers: kindergarten.teacherCount,
          totalClasses: kindergarten.classCount
        },
        { where: { id: groupId }, transaction }
      );

      await transaction.commit();

      return {
        success: true,
        message: '园所已退出集团'
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new GroupUpgradeService();

