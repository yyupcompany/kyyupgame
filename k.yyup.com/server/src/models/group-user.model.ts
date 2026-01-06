import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 集团角色枚举
 */
export enum GroupRole {
  INVESTOR = 1,           // 投资人
  ADMIN = 2,              // 集团管理员
  FINANCE_DIRECTOR = 3,   // 财务总监
  OPERATION_DIRECTOR = 4, // 运营总监
  HR_DIRECTOR = 5         // 人力总监
}

/**
 * 集团用户状态枚举
 */
export enum GroupUserStatus {
  DISABLED = 0,  // 禁用
  ACTIVE = 1     // 正常
}

/**
 * 集团用户属性接口
 */
export interface GroupUserAttributes {
  id: number;
  groupId: number;
  userId: number;
  role: GroupRole;
  
  // 权限配置
  permissions?: any;
  canViewAllKindergartens: number;
  canManageKindergartens: number;
  canViewFinance: number;
  canManageFinance: number;
  
  // 备注
  remark?: string;
  
  // 状态和审计
  status: GroupUserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * 创建集团用户时的可选属性
 */
export interface GroupUserCreationAttributes extends Optional<GroupUserAttributes, 
  'id' | 'canViewAllKindergartens' | 'canManageKindergartens' | 'canViewFinance' | 'canManageFinance' | 'status'
> {}

/**
 * 集团用户模型类
 */
export class GroupUser extends Model<GroupUserAttributes, GroupUserCreationAttributes> implements GroupUserAttributes {
  public id!: number;
  public groupId!: number;
  public userId!: number;
  public role!: GroupRole;
  
  // 权限配置
  public permissions?: any;
  public canViewAllKindergartens!: number;
  public canManageKindergartens!: number;
  public canViewFinance!: number;
  public canManageFinance!: number;
  
  // 备注
  public remark?: string;
  
  // 状态和审计
  public status!: GroupUserStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
  
  // 关联属性
  public readonly group?: any;
  public readonly user?: any;
}

/**
 * 初始化集团用户模型
 */
export function initGroupUser(sequelize: Sequelize): typeof GroupUser {
  GroupUser.init(
    {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '主键ID'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id',
      comment: '集团ID'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      comment: '用户ID'
    },
    role: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '集团角色'
    },
    
    // 权限配置
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '权限配置'
    },
    canViewAllKindergartens: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      field: 'can_view_all_kindergartens',
      comment: '可查看所有园所'
    },
    canManageKindergartens: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'can_manage_kindergartens',
      comment: '可管理园所'
    },
    canViewFinance: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'can_view_finance',
      comment: '可查看财务'
    },
    canManageFinance: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'can_manage_finance',
      comment: '可管理财务'
    },
    
    // 备注
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '备注'
    },
    
    // 状态和审计
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: GroupUserStatus.ACTIVE,
      comment: '状态'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      comment: '创建时间'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      comment: '更新时间'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
      comment: '删除时间'
    }
  },
    {
      sequelize,
      tableName: 'group_users',
      modelName: 'GroupUser',
      timestamps: true,
      paranoid: true,
      underscored: true,
      comment: '集团用户关联表'
    }
  );

  return GroupUser;
}

export default GroupUser;

