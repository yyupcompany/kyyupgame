import { Op, QueryTypes } from 'sequelize';
import { Group, GroupStatus, GroupType } from '../models/group.model';
import { GroupUser, GroupRole } from '../models/group-user.model';
import { Kindergarten } from '../models/kindergarten.model';
import { User } from '../models/user.model';
import { sequelize } from '../init';

/**
 * 集团查询参数接口
 */
interface GroupQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: GroupStatus;
  type?: GroupType;
  investorId?: number;
}

/**
 * 集团创建参数接口
 */
interface CreateGroupParams {
  name: string;
  code?: string;
  type?: GroupType;
  legalPerson?: string;
  registeredCapital?: number;
  businessLicense?: string;
  establishedDate?: Date;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  brandName?: string;
  slogan?: string;
  description?: string;
  vision?: string;
  culture?: string;
  chairman?: string;
  ceo?: string;
  investorId?: number;
  creatorId: number;
}

/**
 * 集团更新参数接口
 */
interface UpdateGroupParams {
  name?: string;
  legalPerson?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  brandName?: string;
  slogan?: string;
  description?: string;
  vision?: string;
  culture?: string;
  chairman?: string;
  ceo?: string;
  status?: GroupStatus;
  updaterId: number;
}

/**
 * 集团服务类
 */
export class GroupService {
  /**
   * 获取集团列表
   */
  async getGroupList(params: GroupQueryParams) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      status,
      type,
      investorId
    } = params;

    // 构建WHERE条件
    let whereConditions = ['g.deleted_at IS NULL'];
    const replacements: any = {
      limit: pageSize,
      offset: (page - 1) * pageSize
    };

    // 关键词搜索
    if (keyword) {
      whereConditions.push(`(
        g.name LIKE :keyword OR
        g.code LIKE :keyword OR
        g.brand_name LIKE :keyword
      )`);
      replacements.keyword = `%${keyword}%`;
    }

    // 状态筛选
    if (status !== undefined) {
      whereConditions.push('g.status = :status');
      replacements.status = status;
    }

    // 类型筛选
    if (type !== undefined) {
      whereConditions.push('g.type = :type');
      replacements.type = type;
    }

    // 投资人筛选
    if (investorId) {
      whereConditions.push('g.investor_id = :investorId');
      replacements.investorId = investorId;
    }

    const whereClause = whereConditions.join(' AND ');

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM \`groups\` g
      WHERE ${whereClause}
    `;

    const [countResult] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    }) as any[];

    const total = countResult.total;

    // 查询数据
    const dataQuery = `
      SELECT
        g.id, g.name, g.code, g.type, g.brand_name, g.status,
        g.kindergarten_count, g.total_students, g.total_teachers,
        g.total_classes, g.created_at, g.updated_at,
        u.id as investor_id, u.username as investor_username,
        u.real_name as investor_real_name, u.email as investor_email
      FROM \`groups\` g
      LEFT JOIN users u ON g.investor_id = u.id
      WHERE ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    const rows = await sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT
    }) as any[];

    // 格式化数据
    const items = rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      type: row.type,
      brandName: row.brand_name,
      status: row.status,
      kindergartenCount: row.kindergarten_count,
      totalStudents: row.total_students,
      totalTeachers: row.total_teachers,
      totalClasses: row.total_classes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      investor: row.investor_id ? {
        id: row.investor_id,
        username: row.investor_username,
        realName: row.investor_real_name,
        email: row.investor_email
      } : null
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 获取集团详情
   */
  async getGroupDetail(groupId: number) {
    console.log('🔍 GroupService.getGroupDetail 被调用，groupId:', groupId);

    // 使用原生SQL查询集团详情
    const groupQuery = `
      SELECT
        g.id, g.name, g.code, g.type, g.brand_name, g.status,
        g.kindergarten_count, g.total_students, g.total_teachers,
        g.total_classes, g.created_at, g.updated_at,
        g.investor_id, g.description, g.chairman, g.ceo, g.phone,
        g.email, g.address, g.website, g.logo_url,
        u.id as investor_user_id, u.username as investor_username,
        u.real_name as investor_real_name, u.email as investor_email,
        u.phone as investor_phone
      FROM \`groups\` g
      LEFT JOIN users u ON g.investor_id = u.id
      WHERE g.id = :groupId AND g.deleted_at IS NULL
    `;

    const groupResult = await sequelize.query(groupQuery, {
      replacements: { groupId },
      type: QueryTypes.SELECT
    }) as any[];

    if (!groupResult || groupResult.length === 0) {
      throw new Error('集团不存在');
    }

    const groupData = groupResult[0];

    // 查询关联的幼儿园
    const kindergartensQuery = `
      SELECT
        k.id, k.name, k.code, k.address, k.phone,
        k.student_count as studentCount, k.teacher_count as teacherCount,
        k.class_count as classCount, k.is_group_headquarters as isGroupHeadquarters,
        k.group_role as groupRole, k.join_group_date as joinGroupDate, k.status
      FROM kindergartens k
      WHERE k.group_id = :groupId AND k.deleted_at IS NULL
      ORDER BY k.is_group_headquarters DESC, k.created_at ASC
    `;

    const kindergartens = await sequelize.query(kindergartensQuery, {
      replacements: { groupId },
      type: QueryTypes.SELECT
    }) as any[];

    // 格式化返回数据
    const result = {
      id: groupData.id,
      name: groupData.name,
      code: groupData.code,
      type: groupData.type,
      brandName: groupData.brand_name,
      status: groupData.status,
      kindergartenCount: groupData.kindergarten_count,
      totalStudents: groupData.total_students,
      totalTeachers: groupData.total_teachers,
      totalClasses: groupData.total_classes,
      description: groupData.description,
      chairman: groupData.chairman,
      ceo: groupData.ceo,
      phone: groupData.phone,
      email: groupData.email,
      address: groupData.address,
      website: groupData.website,
      logoUrl: groupData.logo_url,
      createdAt: groupData.created_at,
      updatedAt: groupData.updated_at,
      investor: groupData.investor_user_id ? {
        id: groupData.investor_user_id,
        username: groupData.investor_username,
        realName: groupData.investor_real_name,
        email: groupData.investor_email,
        phone: groupData.investor_phone
      } : null,
      kindergartens: kindergartens
    };

    console.log('🔍 GroupService.getGroupDetail 查询结果:', result);
    return result;
  }

  /**
   * 创建集团
   */
  async createGroup(params: CreateGroupParams) {
    // 生成集团编码（如果未提供）
    if (!params.code) {
      params.code = `GRP${Date.now()}`;
    }

    // 检查编码是否已存在
    const existingGroup = await Group.findOne({
      where: { code: params.code }
    });

    if (existingGroup) {
      throw new Error('集团编码已存在');
    }

    // 创建集团
    const group = await Group.create({
      ...params,
      status: GroupStatus.ACTIVE,
      kindergartenCount: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalCapacity: 0
    });

    // 如果指定了投资人，自动创建集团用户关联
    if (params.investorId) {
      await GroupUser.create({
        groupId: group.id,
        userId: params.investorId,
        role: GroupRole.INVESTOR,
        canViewAllKindergartens: 1,
        canManageKindergartens: 1,
        canViewFinance: 1,
        canManageFinance: 1,
        status: 1
      });
    }

    return group;
  }

  /**
   * 更新集团信息
   */
  async updateGroup(groupId: number, params: UpdateGroupParams) {
    const group = await Group.findByPk(groupId);

    if (!group) {
      throw new Error('集团不存在');
    }

    await group.update(params);

    return group;
  }

  /**
   * 删除集团（软删除）
   */
  async deleteGroup(groupId: number, userId: number) {
    const group = await Group.findByPk(groupId);

    if (!group) {
      throw new Error('集团不存在');
    }

    // 检查是否有园所关联
    const kindergartenCount = await Kindergarten.count({
      where: { groupId }
    });

    if (kindergartenCount > 0) {
      // 将所有园所的 groupId 设置为 NULL
      await Kindergarten.update(
        { 
          groupId: null,
          isGroupHeadquarters: 0,
          leaveGroupDate: new Date()
        },
        { where: { groupId } }
      );
    }

    // 删除集团用户关联
    await GroupUser.destroy({
      where: { groupId }
    });

    // 软删除集团
    await group.destroy();

    return { success: true, message: '集团已删除' };
  }

  /**
   * 获取用户的集团列表
   */
  async getUserGroups(userId: number) {
    const groupUsers = await GroupUser.findAll({
      where: { userId, status: 1 },
      include: [
        {
          model: Group,
          as: 'group',
          where: { status: GroupStatus.ACTIVE }
        }
      ]
    });

    return groupUsers.map(gu => ({
      ...gu.group?.toJSON(),
      userRole: gu.role,
      permissions: {
        canViewAllKindergartens: gu.canViewAllKindergartens,
        canManageKindergartens: gu.canManageKindergartens,
        canViewFinance: gu.canViewFinance,
        canManageFinance: gu.canManageFinance
      }
    }));
  }

  /**
   * 检查用户是否有集团权限
   */
  async checkUserGroupPermission(userId: number, groupId: number, requiredRole?: GroupRole) {
    const groupUser = await GroupUser.findOne({
      where: {
        userId,
        groupId,
        status: 1
      }
    });

    if (!groupUser) {
      return false;
    }

    // 如果指定了所需角色，检查角色
    if (requiredRole !== undefined) {
      // 投资人拥有所有权限
      if (groupUser.role === GroupRole.INVESTOR) {
        return true;
      }
      // 检查角色是否匹配
      return groupUser.role === requiredRole;
    }

    return true;
  }
}

export default new GroupService();

