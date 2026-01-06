import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 集团类型枚举
 */
export enum GroupType {
  EDUCATION = 1,      // 教育集团
  CHAIN_BRAND = 2,    // 连锁品牌
  INVESTMENT = 3      // 投资集团
}

/**
 * 集团状态枚举
 */
export enum GroupStatus {
  DISABLED = 0,       // 禁用
  ACTIVE = 1,         // 正常
  PENDING = 2         // 审核中
}

/**
 * 集团属性接口
 */
export interface GroupAttributes {
  id: number;
  name: string;
  code: string;
  type: GroupType;
  
  // 法人信息
  legalPerson?: string;
  registeredCapital?: number;
  businessLicense?: string;
  establishedDate?: Date;
  
  // 联系信息
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  
  // 品牌信息
  logoUrl?: string;
  brandName?: string;
  slogan?: string;
  description?: string;
  vision?: string;
  culture?: string;
  
  // 管理信息
  chairman?: string;
  ceo?: string;
  investorId?: number;
  
  // 统计字段
  kindergartenCount: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCapacity: number;
  
  // 财务统计
  annualRevenue?: number;
  annualProfit?: number;
  
  // 状态和审计
  status: GroupStatus;
  creatorId?: number;
  updaterId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * 创建集团时的可选属性
 */
export interface GroupCreationAttributes extends Optional<GroupAttributes, 
  'id' | 'kindergartenCount' | 'totalStudents' | 'totalTeachers' | 'totalClasses' | 'totalCapacity' | 'status'
> {}

/**
 * 集团模型类
 */
export class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: GroupType;
  
  // 法人信息
  public legalPerson?: string;
  public registeredCapital?: number;
  public businessLicense?: string;
  public establishedDate?: Date;
  
  // 联系信息
  public address?: string;
  public phone?: string;
  public email?: string;
  public website?: string;
  
  // 品牌信息
  public logoUrl?: string;
  public brandName?: string;
  public slogan?: string;
  public description?: string;
  public vision?: string;
  public culture?: string;
  
  // 管理信息
  public chairman?: string;
  public ceo?: string;
  public investorId?: number;
  
  // 统计字段
  public kindergartenCount!: number;
  public totalStudents!: number;
  public totalTeachers!: number;
  public totalClasses!: number;
  public totalCapacity!: number;
  
  // 财务统计
  public annualRevenue?: number;
  public annualProfit?: number;
  
  // 状态和审计
  public status!: GroupStatus;
  public creatorId?: number;
  public updaterId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
  
  // 关联属性
  public readonly kindergartens?: any[];
  public readonly investor?: any;
  public readonly groupUsers?: any[];
}

/**
 * 初始化集团模型
 */
export function initGroup(sequelize: Sequelize): typeof Group {
  Group.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '集团ID'
      },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '集团名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '集团编码'
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: GroupType.EDUCATION,
      comment: '集团类型'
    },
    
    // 法人信息
    legalPerson: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'legal_person',
      comment: '法人代表'
    },
    registeredCapital: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'registered_capital',
      comment: '注册资本'
    },
    businessLicense: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'business_license',
      comment: '营业执照号'
    },
    establishedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'established_date',
      comment: '成立日期'
    },
    
    // 联系信息
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '总部地址'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '联系电话'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '联系邮箱'
    },
    website: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '官方网站'
    },
    
    // 品牌信息
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'logo_url',
      comment: 'Logo URL'
    },
    brandName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'brand_name',
      comment: '品牌名称'
    },
    slogan: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '品牌口号'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '集团简介'
    },
    vision: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '愿景使命'
    },
    culture: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '企业文化'
    },
    
    // 管理信息
    chairman: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '董事长'
    },
    ceo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'CEO'
    },
    investorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'investor_id',
      comment: '投资人ID'
    },
    
    // 统计字段
    kindergartenCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'kindergarten_count',
      comment: '园所数量'
    },
    totalStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_students',
      comment: '总学生数'
    },
    totalTeachers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_teachers',
      comment: '总教师数'
    },
    totalClasses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_classes',
      comment: '总班级数'
    },
    totalCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_capacity',
      comment: '总容量'
    },
    
    // 财务统计
    annualRevenue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'annual_revenue',
      comment: '年度收入'
    },
    annualProfit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'annual_profit',
      comment: '年度利润'
    },
    
    // 状态和审计
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: GroupStatus.ACTIVE,
      comment: '状态'
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'creator_id',
      comment: '创建人ID'
    },
    updaterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'updater_id',
      comment: '更新人ID'
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
      tableName: 'groups',
      modelName: 'Group',
      timestamps: true,
      paranoid: true,
      underscored: true,
      comment: '集团表'
    }
  );

  return Group;
}

export default Group;

