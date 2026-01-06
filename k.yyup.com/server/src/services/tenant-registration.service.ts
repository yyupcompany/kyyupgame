/**
 * 租户注册服务
 * 处理租户注册并创建主园区和总园长账号
 */

import { Kindergarten } from '../models/kindergarten.model';
import { User, UserRole, UserStatus } from '../models/user.model';
import { Role } from '../models/role.model';
import { UserRole as UserRoleModel } from '../models/user-role.model';
import { DataScope } from '../middlewares/data-scope.middleware';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';
import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * 租户注册请求接口
 */
export interface TenantRegistrationRequest {
  tenantPhoneNumber: string;  // 租户手机号
  tenantName: string;          // 租户名称
  tenantId?: string;           // 租户ID（可选）
}

/**
 * 租户注册响应接口
 */
export interface TenantRegistrationResponse {
  kindergartenId: number;      // 园区ID
  kindergartenCode: string;    // 园区编码
  kindergartenName: string;    // 园区名称
  principalUserId: number;     // 总园长用户ID
  principalUsername: string;   // 总园长用户名
  principalPhone: string;      // 总园长手机号
  initialPassword: string;     // 初始密码
  tenantPhoneNumber: string;   // 租户手机号
  tenantId?: string;           // 租户ID
}

class TenantRegistrationService {
  /**
   * 生成园区编码
   * 基于租户手机号生成唯一编码
   */
  private generateKindergartenCode(tenantPhoneNumber: string): string {
    // 使用手机号后6位作为园区编码
    const suffix = tenantPhoneNumber.slice(-6);
    return `K${suffix}`;
  }

  /**
   * 生成总园长用户名
   * 基于园区编码生成唯一用户名
   */
  private generatePrincipalUsername(kindergartenCode: string): string {
    return `principal_${kindergartenCode.toLowerCase()}`;
  }

  /**
   * 生成初始密码
   * 生成8位随机密码（包含大小写字母和数字）
   */
  private generateInitialPassword(): string {
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = upperChars + lowerChars + numbers;
    
    let password = '';
    // 确保至少包含一个大写字母、一个小写字母和一个数字
    password += upperChars[Math.floor(Math.random() * upperChars.length)];
    password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    
    // 生成剩余5位
    for (let i = 0; i < 5; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // 打乱密码字符顺序
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * 验证手机号格式
   */
  private validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 检查租户手机号是否已注册
   */
  private async isTenantPhoneRegistered(tenantPhoneNumber: string): Promise<boolean> {
    const existingKindergarten = await Kindergarten.findOne({
      where: { tenantPhoneNumber }
    });
    return !!existingKindergarten;
  }

  /**
   * 租户注册并创建主园区和总园长
   * 
   * @param request 租户注册请求
   * @returns 租户注册响应
   */
  async registerTenant(request: TenantRegistrationRequest): Promise<TenantRegistrationResponse> {
    const { tenantPhoneNumber, tenantName, tenantId } = request;

    logger.info('开始租户注册流程', {
      tenantPhoneNumber: this.maskPhoneNumber(tenantPhoneNumber),
      tenantName,
      tenantId
    });

    // 1. 验证手机号格式
    if (!this.validatePhoneNumber(tenantPhoneNumber)) {
      throw new Error('手机号格式不正确');
    }

    // 2. 检查租户手机号是否已注册
    const isRegistered = await this.isTenantPhoneRegistered(tenantPhoneNumber);
    if (isRegistered) {
      throw new Error('该租户手机号已注册');
    }

    // 3. 生成园区编码和用户名
    const kindergartenCode = this.generateKindergartenCode(tenantPhoneNumber);
    const principalUsername = this.generatePrincipalUsername(kindergartenCode);
    const initialPassword = this.generateInitialPassword();
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // 4. 使用事务创建园区和用户
    const transaction: Transaction = await sequelize.transaction();

    try {
      // 4.1 创建主园区记录
      const kindergarten = await Kindergarten.create({
        name: tenantName,
        code: kindergartenCode,
        tenantPhoneNumber,
        tenantId: tenantId || null,
        isPrimaryBranch: 1, // 标记为主园区
        type: 2, // 默认为民办园
        level: 2, // 默认为二级园
        address: '待完善',
        longitude: 0,
        latitude: 0,
        phone: tenantPhoneNumber,
        email: `${kindergartenCode}@k.yyup.cc`,
        principal: '待分配',
        establishedDate: new Date(),
        area: 0,
        buildingArea: 0,
        status: 1 // 正常状态
      }, { transaction });

      logger.info('主园区创建成功', {
        kindergartenId: kindergarten.id,
        kindergartenCode: kindergarten.code
      });

      // 4.2 获取chief_principal角色
      const chiefPrincipalRole = await Role.findOne({
        where: { code: 'chief_principal' },
        transaction
      });

      if (!chiefPrincipalRole) {
        throw new Error('chief_principal角色不存在，请先执行数据库迁移');
      }

      // 4.3 创建总园长用户
      const principalUser = await User.create({
        username: principalUsername,
        password: hashedPassword,
        email: `${principalUsername}@k.yyup.cc`,
        role: UserRole.PRINCIPAL, // User表的role字段
        realName: '总园长',
        phone: tenantPhoneNumber,
        status: UserStatus.ACTIVE,
        primaryKindergartenId: kindergarten.id,
        allowedKindergartenIds: JSON.stringify([kindergarten.id]),
        dataScope: DataScope.ALL,
        auth_source: 'local'
      }, { transaction });

      logger.info('总园长用户创建成功', {
        userId: principalUser.id,
        username: principalUser.username
      });

      // 4.4 创建用户角色关联（关联到chief_principal角色）
      await UserRoleModel.create({
        userId: principalUser.id,
        roleId: chiefPrincipalRole.id
      }, { transaction });

      logger.info('总园长角色分配成功', {
        userId: principalUser.id,
        roleId: chiefPrincipalRole.id,
        roleCode: chiefPrincipalRole.code
      });

      // 4.5 更新园区的principal字段
      await kindergarten.update({
        principal: principalUser.realName
      }, { transaction });

      // 提交事务
      await transaction.commit();

      logger.info('租户注册成功', {
        kindergartenId: kindergarten.id,
        principalUserId: principalUser.id,
        tenantPhoneNumber: this.maskPhoneNumber(tenantPhoneNumber)
      });

      // 5. 返回注册结果
      return {
        kindergartenId: kindergarten.id,
        kindergartenCode: kindergarten.code,
        kindergartenName: kindergarten.name,
        principalUserId: principalUser.id,
        principalUsername: principalUser.username,
        principalPhone: principalUser.phone,
        initialPassword, // 注意：这是明文密码，仅在注册时返回一次
        tenantPhoneNumber: kindergarten.tenantPhoneNumber!,
        tenantId: kindergarten.tenantId || undefined
      };

    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      
      logger.error('租户注册失败', {
        error: error instanceof Error ? error.message : String(error),
        tenantPhoneNumber: this.maskPhoneNumber(tenantPhoneNumber)
      });

      throw error;
    }
  }

  /**
   * 屏蔽手机号中间部分
   * 用于日志输出
   */
  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 11) {
      return '***';
    }
    return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
  }
}

export const tenantRegistrationService = new TenantRegistrationService();
