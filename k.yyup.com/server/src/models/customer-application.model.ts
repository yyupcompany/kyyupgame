import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';
import { Parent } from './parent.model';
import { Kindergarten } from './kindergarten.model';

/**
 * 客户申请状态枚举
 */
export enum CustomerApplicationStatus {
  PENDING = 'pending',      // 待审批
  APPROVED = 'approved',    // 已同意
  REJECTED = 'rejected',    // 已拒绝
}

/**
 * 客户申请记录属性接口
 */
export interface CustomerApplicationAttributes {
  id: number;                           // 申请ID
  customerId: number;                   // 客户ID
  teacherId: number;                    // 申请教师ID
  principalId: number | null;           // 审批园长ID
  kindergartenId: number | null;        // 幼儿园ID
  status: CustomerApplicationStatus;    // 申请状态
  applyReason: string | null;           // 申请理由
  rejectReason: string | null;          // 拒绝理由
  appliedAt: Date;                      // 申请时间
  reviewedAt: Date | null;              // 审批时间
  notificationId: number | null;        // 关联的通知ID
  metadata: Record<string, any> | null; // 扩展数据
  createdAt?: Date;                     // 创建时间
  updatedAt?: Date;                     // 更新时间
  deletedAt?: Date | null;              // 删除时间（软删除）
}

/**
 * 客户申请记录创建属性
 */
export type CustomerApplicationCreationAttributes = Optional<
  CustomerApplicationAttributes,
  'id' | 'principalId' | 'kindergartenId' | 'status' | 'applyReason' | 'rejectReason' | 
  'reviewedAt' | 'notificationId' | 'metadata' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

/**
 * 客户申请记录模型
 */
export class CustomerApplication extends Model<CustomerApplicationAttributes, CustomerApplicationCreationAttributes> 
  implements CustomerApplicationAttributes {
  
  public id!: number;
  public customerId!: number;
  public teacherId!: number;
  public principalId!: number | null;
  public kindergartenId!: number | null;
  public status!: CustomerApplicationStatus;
  public applyReason!: string | null;
  public rejectReason!: string | null;
  public appliedAt!: Date;
  public reviewedAt!: Date | null;
  public notificationId!: number | null;
  public metadata!: Record<string, any> | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // 关联模型
  public readonly customer?: Parent;
  public readonly teacher?: User;
  public readonly principal?: User;
  public readonly kindergarten?: Kindergarten;

  /**
   * 清理undefined值
   */
  static cleanUndefinedValues(data: any): any {
    const cleanedData: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value === undefined) {
        console.warn(`⚠️ CustomerApplication模型清理undefined值: ${key} -> null`);
        cleanedData[key] = null;
      } else {
        cleanedData[key] = value;
      }
    });
    
    console.log('🔍 CustomerApplication模型数据清理完成:', Object.keys(cleanedData).length, '个字段');
    return cleanedData;
  }

  /**
   * 初始化模型
   */
  static initModel(sequelize: Sequelize): void {
    CustomerApplication.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        customerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '客户ID',
          references: {
            model: 'parents',
            key: 'id',
          },
        },
        teacherId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '申请教师ID',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        principalId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '审批园长ID',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        kindergartenId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '幼儿园ID',
          references: {
            model: 'kindergartens',
            key: 'id',
          },
        },
        status: {
          type: DataTypes.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
          comment: '申请状态：pending-待审批，approved-已同意，rejected-已拒绝',
        },
        applyReason: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '申请理由',
        },
        rejectReason: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '拒绝理由',
        },
        appliedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          comment: '申请时间',
        },
        reviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '审批时间',
        },
        notificationId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '关联的通知ID',
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '扩展数据',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '删除时间（软删除）',
        },
      },
      {
        sequelize,
        tableName: 'customer_applications',
        timestamps: true,
        paranoid: true, // 启用软删除
        underscored: false,
        indexes: [
          { fields: ['customerId'] },
          { fields: ['teacherId'] },
          { fields: ['principalId'] },
          { fields: ['kindergartenId'] },
          { fields: ['status'] },
          { fields: ['appliedAt'] },
          { fields: ['reviewedAt'] },
          { fields: ['teacherId', 'status'] },
          { fields: ['customerId', 'status'] },
        ],
      }
    );
  }

  /**
   * 定义模型关联
   */
  static associate(models: any): void {
    // 关联客户
    CustomerApplication.belongsTo(models.Parent, {
      foreignKey: 'customerId',
      as: 'customer',
    });

    // 关联申请教师
    CustomerApplication.belongsTo(models.User, {
      foreignKey: 'teacherId',
      as: 'teacher',
    });

    // 关联审批园长
    CustomerApplication.belongsTo(models.User, {
      foreignKey: 'principalId',
      as: 'principal',
    });

    // 关联幼儿园
    CustomerApplication.belongsTo(models.Kindergarten, {
      foreignKey: 'kindergartenId',
      as: 'kindergarten',
    });
  }
}

export default CustomerApplication;

