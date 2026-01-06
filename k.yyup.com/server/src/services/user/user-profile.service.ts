import { sequelize } from '../../init';
import { User } from '../../models/user.model';
import { UserProfile, Gender } from '../../models/user-profile.model';
import { 
  IUserProfileService, 
  ProfileCreateParams, 
  ProfileUpdateParams 
} from './interfaces/user-profile-service.interface';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fn, col, literal } from 'sequelize';

// 定义扩展后的用户资料接口，用于类型转换
interface ExtendedUserProfile extends Omit<UserProfile, 'tags' | 'contactInfo' | 'extendedInfo'> {
  tags: string[] | null;
  contactInfo: Record<string, string> | null;
  extendedInfo: Record<string, any> | null;
}

/**
 * 用户资料服务实现
 * @description 实现用户个人资料管理相关的业务逻辑
 */
export class UserProfileService implements IUserProfileService {
  // 头像存储目录
  private readonly AVATAR_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');

  /**
   * 确保头像存储目录存在
   */
  private ensureAvatarDir(): void {
    if (!fs.existsSync(this.AVATAR_DIR)) {
      fs.mkdirSync(this.AVATAR_DIR, { recursive: true });
    }
  }

  /**
   * 创建用户资料
   * @param data 用户资料创建数据
   * @returns 创建结果
   */
  async create(data: ProfileCreateParams): Promise<any> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查用户是否存在
      const user = await User.findByPk(data.userId, { transaction });
      if (!user) {
        throw new Error('用户不存在');
      }

      // 检查是否已存在资料
      const existingProfile = await UserProfile.findOne({
        where: { userId: data.userId },
        transaction
      });

      if (existingProfile) {
        throw new Error('用户资料已存在');
      }

      // 创建用户资料
      const profile = await UserProfile.create({
        userId: data.userId,
        avatar: data.avatar || null,
        gender: data.gender !== undefined ? data.gender : null,
        birthday: data.birthday || null,
        address: data.address || null,
        education: data.education || null,
        introduction: data.introduction || null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        contactInfo: data.contactInfo ? JSON.stringify(data.contactInfo) : null,
        extendedInfo: data.extendedInfo ? JSON.stringify(data.extendedInfo) : null
      }, { transaction });

      await transaction.commit();
      return profile;
    } catch (error) {
      await transaction.rollback();
      console.error('创建用户资料失败:', error);
      throw error;
    }
  }

  /**
   * 根据用户ID获取用户资料
   * @param userId 用户ID
   * @returns 用户资料信息
   */
  async findByUserId(userId: number): Promise<ExtendedUserProfile | null> {
    try {
      // 查询用户资料
      const profile = await UserProfile.findOne({
        where: { userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'realName', 'phone', 'status']
          }
        ]
      });

      if (!profile) {
        return null;
      }

      // 获取原始数据
      const plainProfile = profile.get({ plain: true });
      
      // 创建转换后的结果对象
      const result = { ...plainProfile } as unknown as ExtendedUserProfile;
      
      // 处理标签
      if (plainProfile.tags) {
        try {
          // Sequelize automatically parses JSON string fields
          result.tags = Array.isArray(plainProfile.tags) ? plainProfile.tags : JSON.parse(plainProfile.tags as unknown as string);
        } catch (e) {
          result.tags = [];
        }
      } else {
        result.tags = [];
      }

      // 处理联系信息
      if (plainProfile.contactInfo) {
        try {
          result.contactInfo = typeof plainProfile.contactInfo === 'object' ? plainProfile.contactInfo : JSON.parse(plainProfile.contactInfo as unknown as string);
        } catch (e) {
          result.contactInfo = {};
        }
      } else {
        result.contactInfo = {};
      }

      // 处理扩展信息
      if (plainProfile.extendedInfo) {
        try {
          result.extendedInfo = typeof plainProfile.extendedInfo === 'object' ? plainProfile.extendedInfo : JSON.parse(plainProfile.extendedInfo as unknown as string);
        } catch (e) {
          result.extendedInfo = {};
        }
      } else {
        result.extendedInfo = {};
      }

      return result as ExtendedUserProfile;
    } catch (error) {
      console.error('获取用户资料失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户资料
   * @param userId 用户ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  async update(userId: number, data: ProfileUpdateParams): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 查询用户资料
      const profile = await UserProfile.findOne({
        where: { userId },
        transaction
      });

      // 如果不存在则创建
      if (!profile) {
        await this.create({ userId, ...data });
        await transaction.commit();
        return true;
      }

      // 准备更新数据
      const updateData: any = {};
      
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.birthday !== undefined) updateData.birthday = data.birthday;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.education !== undefined) updateData.education = data.education;
      if (data.introduction !== undefined) updateData.introduction = data.introduction;
      
      // 处理标签
      if (data.tags !== undefined) {
        updateData.tags = JSON.stringify(data.tags);
      }
      
      // 处理联系信息
      if (data.contactInfo !== undefined) {
        updateData.contactInfo = JSON.stringify(data.contactInfo);
      }
      
      // 处理扩展信息
      if (data.extendedInfo !== undefined) {
        // 如果提供了新的扩展信息，需要与原有信息合并
        let currentExtendedInfo = {};
        if (profile.extendedInfo) {
          try {
            currentExtendedInfo = JSON.parse(profile.extendedInfo);
          } catch (e) {
            // 如果解析失败，使用空对象
          }
        }
        const newExtendedInfo = { ...currentExtendedInfo, ...data.extendedInfo };
        updateData.extendedInfo = JSON.stringify(newExtendedInfo);
      }

      // 更新资料
      await profile.update(updateData, { transaction });
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('更新用户资料失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户资料
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  async delete(userId: number): Promise<boolean> {
    try {
      const result = await UserProfile.destroy({
        where: { userId }
      });
      
      return result > 0;
    } catch (error) {
      console.error('删除用户资料失败:', error);
      throw error;
    }
  }

  /**
   * 上传用户头像
   * @param userId 用户ID
   * @param file 头像文件
   * @returns 头像URL
   */
  async uploadAvatar(userId: number, file: any): Promise<string> {
    try {
      // 确保目录存在
      this.ensureAvatarDir();
      
      // 获取文件扩展名
      const fileExt = path.extname(file.originalname);
      
      // 生成唯一文件名
      const fileName = `${userId}_${uuidv4()}${fileExt}`;
      const filePath = path.join(this.AVATAR_DIR, fileName);
      
      // 写入文件
      fs.writeFileSync(filePath, file.buffer);
      
      // 构建访问URL
      const avatarUrl = `/uploads/avatars/${fileName}`;
      
      // 更新用户资料的头像字段
      await this.update(userId, { avatar: avatarUrl });
      
      return avatarUrl;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户标签列表
   * @param userId 用户ID
   * @returns 标签列表
   */
  async getUserTags(userId: number): Promise<string[]> {
    const profile = await this.assertProfileExists(userId);
    if (!profile.tags) return [];
    
    try {
      return JSON.parse(profile.tags) as string[];
    } catch (e) {
      return [];
    }
  }

  /**
   * 添加用户标签
   * @param userId 用户ID
   * @param tags 标签列表
   * @returns 是否添加成功
   */
  async addUserTags(userId: number, tags: string[]): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      const profile = await this.assertProfileExists(userId, transaction);
      let currentTags: string[] = [];
      if (profile.tags) {
        try {
          currentTags = JSON.parse(profile.tags) as string[];
        } catch (e) {
          // 如果解析失败，使用空数组
        }
      }
      const newTags = [...new Set([...currentTags, ...tags])];
      await profile.update({ tags: JSON.stringify(newTags) }, { transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('添加用户标签失败:', error);
      throw error;
    }
  }

  /**
   * 移除用户标签
   * @param userId 用户ID
   * @param tags 标签列表
   * @returns 是否移除成功
   */
  async removeUserTags(userId: number, tags: string[]): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      const profile = await this.assertProfileExists(userId, transaction);
      let currentTags: string[] = [];
      if (profile.tags) {
        try {
          currentTags = JSON.parse(profile.tags) as string[];
        } catch (e) {
          // 如果解析失败，使用空数组
        }
      }
      const newTags = currentTags.filter(tag => !tags.includes(tag));
      await profile.update({ tags: JSON.stringify(newTags) }, { transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('移除用户标签失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户扩展信息
   * @param userId 用户ID
   * @param key 键名
   * @param value 键值
   * @returns 是否更新成功
   */
  async updateExtendedInfo(userId: number, key: string, value: any): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      const profile = await this.assertProfileExists(userId, transaction);
      let extendedInfo: Record<string, any> = {};
      if (profile.extendedInfo) {
        try {
          extendedInfo = JSON.parse(profile.extendedInfo) as Record<string, any>;
        } catch (e) {
          // 如果解析失败，使用空对象
        }
      }
      extendedInfo[key] = value;
      await profile.update({ extendedInfo: JSON.stringify(extendedInfo) }, { transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('更新扩展信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户扩展信息
   * @param userId 用户ID
   * @param key 键名，不提供则获取所有
   * @returns 扩展信息值
   */
  async getExtendedInfo(userId: number, key?: string): Promise<any> {
    try {
      const profile = await this.assertProfileExists(userId);
      let extendedInfo: Record<string, any> = {};
      if (profile.extendedInfo) {
        try {
          extendedInfo = JSON.parse(profile.extendedInfo) as Record<string, any>;
        } catch (e) {
          // 如果解析失败，使用空对象
        }
      }
      if (key) {
        return extendedInfo[key];
      }
      return extendedInfo;
    } catch (error) {
      console.error('获取扩展信息失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户扩展信息
   * @param userId 用户ID
   * @param key 键名
   * @returns 是否删除成功
   */
  async deleteExtendedInfo(userId: number, key: string): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      const profile = await this.assertProfileExists(userId, transaction);
      let extendedInfo: Record<string, any> = {};
      if (profile.extendedInfo) {
        try {
          extendedInfo = JSON.parse(profile.extendedInfo) as Record<string, any>;
        } catch (e) {
          // 如果解析失败，使用空对象
        }
      }
      if (key in extendedInfo) {
        delete extendedInfo[key];
        await profile.update({ extendedInfo: JSON.stringify(extendedInfo) }, { transaction });
      }
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('删除扩展信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户联系信息
   * @param userId 用户ID
   * @returns 联系信息对象
   */
  async getContactInfo(userId: number): Promise<Record<string, string>> {
    const profile = await this.assertProfileExists(userId);
    if (!profile.contactInfo) return {};
    
    try {
      return JSON.parse(profile.contactInfo) as Record<string, string>;
    } catch (e) {
      return {};
    }
  }

  /**
   * 更新用户联系信息
   * @param userId 用户ID
   * @param contactInfo 联系信息
   * @returns 是否更新成功
   */
  async updateContactInfo(userId: number, contactInfo: Record<string, string>): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      const profile = await this.assertProfileExists(userId, transaction);
      await profile.update({ contactInfo: JSON.stringify(contactInfo) }, { transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('更新联系信息失败:', error);
      throw error;
    }
  }
  
  /**
   * 辅助函数：断言用户资料存在
   * @param userId 用户ID
   * @param transaction 事务对象
   * @returns 用户资料实例
   */
  private async assertProfileExists(userId: number, transaction?: any): Promise<UserProfile> {
    const profile = await UserProfile.findOne({ where: { userId }, transaction });
    if (!profile) {
      throw new Error('用户资料不存在');
    }
    return profile;
  }
}

export default new UserProfileService(); 