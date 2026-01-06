import { Model, DataTypes, Sequelize } from 'sequelize';

export enum ApprovalType {
  LEAVE = 'LEAVE',
  EXPENSE = 'EXPENSE', 
  EVENT = 'EVENT',
  PURCHASE = 'PURCHASE',
  OTHER = 'OTHER'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum ApprovalUrgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

interface ApprovalAttributes {
  id?: number;
  title: string;
  description?: string;
  type: ApprovalType;
  status: ApprovalStatus;
  urgency: ApprovalUrgency;
  requestAmount?: number;
  requestData?: any;
  attachments?: any[];
  requestedBy: number;
  approvedBy?: number;
  kindergartenId?: number;
  comment?: string;
  approvedAt?: Date;
  requestedAt: Date;
  deadline?: Date;
  relatedType?: string;
  relatedId?: number;
  workflow?: any;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Approval extends Model<ApprovalAttributes> implements ApprovalAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public type!: ApprovalType;
  public status!: ApprovalStatus;
  public urgency!: ApprovalUrgency;
  public requestAmount?: number;
  public requestData?: any;
  public attachments?: any[];
  public requestedBy!: number;
  public approvedBy?: number;
  public kindergartenId?: number;
  public comment?: string;
  public approvedAt?: Date;
  public requestedAt!: Date;
  public deadline?: Date;
  public relatedType?: string;
  public relatedId?: number;
  public workflow?: any;
  public metadata?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联属性
  public requester?: any;
  public approver?: any;
  public kindergarten?: any;
}

export default (sequelize: Sequelize) => {
  Approval.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '审批标题'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '申请描述'
      },
      type: {
        type: DataTypes.ENUM(...Object.values(ApprovalType)),
        allowNull: false,
        comment: '审批类型'
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ApprovalStatus)),
        allowNull: false,
        defaultValue: ApprovalStatus.PENDING,
        comment: '审批状态'
      },
      urgency: {
        type: DataTypes.ENUM(...Object.values(ApprovalUrgency)),
        allowNull: false,
        defaultValue: ApprovalUrgency.MEDIUM,
        comment: '紧急程度'
      },
      requestAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '申请金额'
      },
      requestData: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '申请数据'
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '附件列表'
      },
      requestedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: '申请人ID'
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: '审批人ID'
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'kindergartens',
          key: 'id'
        },
        comment: '幼儿园ID'
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '审批意见'
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '审批时间'
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '申请时间'
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '处理截止时间'
      },
      relatedType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '关联对象类型'
      },
      relatedId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '关联对象ID'
      },
      workflow: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '审批流程数据'
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '扩展数据'
      }
    },
    {
      sequelize,
      modelName: 'approvals',
      tableName: 'approvals',
      timestamps: true,
      indexes: [
        {
          fields: ['requestedBy']
        },
        {
          fields: ['approvedBy']
        },
        {
          fields: ['kindergartenId']
        },
        {
          fields: ['status']
        },
        {
          fields: ['type']
        },
        {
          fields: ['urgency']
        },
        {
          fields: ['requestedAt']
        },
        {
          fields: ['deadline']
        },
        {
          fields: ['relatedType', 'relatedId']
        }
      ]
    }
  );

  return Approval;
};