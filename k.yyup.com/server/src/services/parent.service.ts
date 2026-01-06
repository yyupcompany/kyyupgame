import { Op } from 'sequelize';
import {  Parent  } from '../models/index';
import {  Student  } from '../models/index';
import {  User, UserRoleModel, UserStatus  } from '../models/index';
import { UserRole } from '../models/user.model';
import { CreateParentDto, UpdateParentDto } from '../types/parent';

/**
 * 家长服务类
 * 提供家长信息的增删改查服务
 */
export class ParentService {
  /**
   * 创建家长
   * @param parentData 家长数据
   * @returns 创建的家长对象
   */
  async createParent(parentData: CreateParentDto): Promise<Parent> {
    try {
      console.log('🔍 开始创建家长，接收到的数据:', JSON.stringify(parentData, null, 2));
      
      // 如果没有提供userId，则需要创建用户
      let userId = parentData.userId;
      if (!userId) {
        console.log('📝 没有提供userId，开始创建用户...');
        
        // 检查是否已存在相同手机号的用户
        const existingUser = await User.findOne({
          where: { phone: parentData.phone }
        });
        
        if (existingUser) {
          console.log('👤 找到已存在的用户:', existingUser.id);
          userId = existingUser.id;
        } else {
          console.log('🆕 创建新用户...');
          
          // 创建用户逻辑，确保email唯一性
          const timestamp = Date.now();
          const email = parentData.email || `parent_${parentData.phone}_${timestamp}@kindergarten.com`;
          
          // 检查email是否已存在
          const existingEmailUser = await User.findOne({
            where: { email: email }
          });
          
          const finalEmail = existingEmailUser ? `parent_${parentData.phone}_${timestamp}_${Math.random().toString(36).substr(2, 9)}@kindergarten.com` : email;
          
          // 确保username唯一性
          const username = `parent_${parentData.phone}`;
          const existingUsernameUser = await User.findOne({
            where: { username: username }
          });
          
          const finalUsername = existingUsernameUser ? `parent_${parentData.phone}_${timestamp}` : username;
          
          console.log('📋 准备创建用户，数据:', {
            username: finalUsername,
            email: finalEmail,
            realName: parentData.name,
            phone: parentData.phone,
            role: UserRole.USER,
            status: UserStatus.ACTIVE
          });
          
          const user = await User.create({
            username: finalUsername,
            email: finalEmail,
            realName: parentData.name,
            phone: parentData.phone,
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            password: null // 家长用户可能不需要密码，通过其他方式认证
          });
          
          console.log('✅ 用户创建成功:', user.id);
          userId = user.id;
        }
      }

      console.log('👨‍👩‍👧‍👦 开始创建家长记录，userId:', userId);
      
             // 验证studentId是否存在
       if (parentData.studentId) {
         const student = await Student.findByPk(parentData.studentId);
         if (!student) {
           throw new Error(`学生ID ${parentData.studentId} 不存在`);
         }
         console.log('✅ 学生验证通过:', student.id);
       }

       // 检查是否已存在相同的user_id和student_id组合
       const existingParent = await Parent.findOne({
         where: {
           userId: userId,
           studentId: parentData.studentId
         }
       });
       
       if (existingParent) {
         console.log('⚠️ 已存在相同的家长-学生关系:', existingParent.id);
         throw new Error(`该用户已经是学生ID ${parentData.studentId} 的家长`);
       }

      const parentCreateData = {
        userId,
        studentId: parentData.studentId,
        relationship: parentData.relationship,
        isPrimaryContact: parentData.isPrimaryContact ? 1 : 0,
        isLegalGuardian: parentData.isLegalGuardian ? 1 : 0,
        idCardNo: parentData.idCardNo || null,
        workUnit: parentData.workUnit || null,
        occupation: parentData.occupation || null,
        education: parentData.education || null,
        address: parentData.address || null,
        remark: parentData.remark || null,
        creatorId: parentData.creatorId || null,
        updaterId: parentData.updaterId || null
      };
      
      console.log('📋 准备创建家长，数据:', JSON.stringify(parentCreateData, null, 2));

      const parent = await Parent.create(parentCreateData);
      
      console.log('✅ 家长创建成功:', parent.id);
      return parent;
    } catch (error) {
      console.error('❌ 创建家长失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
      }
      throw error;
    }
  }

  /**
   * 查找所有家长
   * @returns 所有家长列表
   */
  async findAllParent(): Promise<Parent[]> {
    const sequelize = Parent.sequelize;
    if (!sequelize) {
      throw new Error('数据库连接不可用');
    }

    const query = `
      SELECT 
        p.*,
        u.id as user_id,
        u.username,
        u.email,
        u.real_name,
        u.phone as user_phone,
        u.role,
        u.status as user_status
      FROM parents p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `;

    const results = await sequelize.query(query, {
      type: 'SELECT'
    });

    const resultList = Array.isArray(results) ? results : [];
    const parents = resultList.map((item: any) => ({
      ...item,
      user: item.user_id ? {
        id: item.user_id,
        username: item.username,
        email: item.email,
        realName: item.real_name,
        phone: item.user_phone,
        role: item.role,
        status: item.user_status
      } : null
    }));

    return parents as Parent[];
  }

  /**
   * 根据ID查找家长
   * @param parentId 家长ID
   * @returns 家长对象
   */
  async findParentById(parentId: number): Promise<Parent> {
    const sequelize = Parent.sequelize;
    if (!sequelize) {
      throw new Error('数据库连接不可用');
    }

    const query = `
      SELECT 
        p.*,
        u.id as user_id,
        u.username,
        u.email,
        u.real_name,
        u.phone as user_phone,
        u.role,
        u.status as user_status
      FROM parents p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = :parentId AND p.deleted_at IS NULL
    `;

    const results = await sequelize.query(query, {
      replacements: { parentId },
      type: 'SELECT'
    });

    const resultList = Array.isArray(results) ? results : [];
    const parentData = resultList.length > 0 ? resultList[0] as Record<string, any> : null;
    
    if (!parentData) {
      throw new Error(`ID为${parentId}的家长不存在`);
    }

    // 构造返回对象
    const parent = {
      ...parentData,
      user: parentData.user_id ? {
        id: parentData.user_id,
        username: parentData.username,
        email: parentData.email,
        realName: parentData.real_name,
        phone: parentData.user_phone,
        role: parentData.role,
        status: parentData.user_status
      } : null
    };

    return parent as Parent;
  }

  /**
   * 根据条件查找家长
   * @param condition: any 查询条件
   * @returns 符合条件的家长列表
   */
  async findParentByCondition(condition: any): Promise<Parent[]> {
    const sequelize = Parent.sequelize;
    if (!sequelize) {
      throw new Error('数据库连接不可用');
    }

    // 构建WHERE条件
    const conditions: string[] = ['p.deleted_at IS NULL'];
    const replacements: Record<string, any> = {};

    if (condition.userId) {
      conditions.push('p.user_id = :userId');
      replacements.userId = condition.userId;
    }
    if (condition.studentId) {
      conditions.push('p.student_id = :studentId');
      replacements.studentId = condition.studentId;
    }
    if (condition.relationship) {
      conditions.push('p.relationship = :relationship');
      replacements.relationship = condition.relationship;
    }
    if (condition.isPrimaryContact !== undefined) {
      conditions.push('p.is_primary_contact = :isPrimaryContact');
      replacements.isPrimaryContact = condition.isPrimaryContact ? 1 : 0;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        p.*,
        u.id as user_id,
        u.username,
        u.email,
        u.real_name,
        u.phone as user_phone,
        u.role,
        u.status as user_status
      FROM parents p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: 'SELECT'
    });

    const resultList = Array.isArray(results) ? results : [];
    const parents = resultList.map((item: any) => ({
      ...item,
      user: item.user_id ? {
        id: item.user_id,
        username: item.username,
        email: item.email,
        realName: item.real_name,
        phone: item.user_phone,
        role: item.role,
        status: item.user_status
      } : null
    }));

    return parents as Parent[];
  }

  /**
   * 更新家长信息
   * @param parentId 家长ID
   * @param parentData 更新的家长数据
   * @returns 更新后的家长对象
   */
  async updateParent(parentId: number, parentData: UpdateParentDto): Promise<Parent> {
    // 先检查家长是否存在
    const existingParent = await this.findParentById(parentId);
    if (!existingParent) {
      throw new Error(`ID为${parentId}的家长不存在`);
    }

    // 使用Sequelize模型的update方法
    const updateData: any = {
      relationship: parentData.relationship,
      isPrimaryContact: parentData.isPrimaryContact !== undefined ? (parentData.isPrimaryContact ? 1 : 0) : undefined,
      isLegalGuardian: parentData.isLegalGuardian !== undefined ? (parentData.isLegalGuardian ? 1 : 0) : undefined,
      idCardNo: parentData.idCardNo,
      occupation: parentData.occupation,
      education: parentData.education,
      address: parentData.address,
      workUnit: parentData.workUnit
    };
    
    // 过滤掉undefined值
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // 使用模型的静态update方法
    await Parent.update(updateData, {
      where: { id: parentId }
    });
    
    // 更新关联的用户信息
    if (existingParent.user && (parentData.name || parentData.phone || parentData.email || parentData.gender)) {
      const userUpdateData: any = {
        realName: parentData.name,
        phone: parentData.phone,
        email: parentData.email
      };
      
      // 过滤掉undefined值
      Object.keys(userUpdateData).forEach(key => {
        if (userUpdateData[key] === undefined) {
          delete userUpdateData[key];
        }
      });
      
      if (Object.keys(userUpdateData).length > 0) {
        await User.update(userUpdateData, { where: { id: (existingParent as any).user_id } });
      }
    }
    
    return this.findParentById(parentId); // 重新查询以获取更新后的完整信息
  }

  /**
   * 删除家长
   * @param parentId 家长ID
   * @returns 删除的家长对象
   */
  async deleteParent(parentId: number): Promise<Parent> {
    const existingParent = await this.findParentById(parentId);
    if (!existingParent) {
      throw new Error(`ID为${parentId}的家长不存在`);
    }
    
    // 使用模型的静态destroy方法
    await Parent.destroy({
      where: { id: parentId }
    });
    
    return existingParent;
  }

  /**
   * 根据电话号码查找家长
   * @param phone 电话号码
   * @returns 家长对象
   */
  async findParentByPhone(phone: string): Promise<Parent | null> {
    // 电话号码在用户表中，所以需要通过关联查询
    const parent = await Parent.findOne({
      include: [
        {
          model: User,
          as: 'user',
          where: { phone }
        }
      ]
    });
    return parent;
  }
}

// 导出服务实例
export default new ParentService();