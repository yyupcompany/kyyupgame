import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// 问题严重程度枚举
export enum ProblemSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 整改状态枚举
export enum RectificationStatus {
  PENDING = 'pending',           // 待整改
  IN_PROGRESS = 'in_progress',   // 整改中
  COMPLETED = 'completed',       // 已完成
  VERIFIED = 'verified',         // 已验收
  REJECTED = 'rejected'          // 验收不通过
}

// 验收状态枚举
export enum VerificationStatus {
  PASS = 'pass',
  FAIL = 'fail',
  PENDING = 'pending'
}

// 整改任务属性接口
export interface InspectionRectificationAttributes {
  id: number;
  inspectionPlanId: number;
  recordId?: number;
  recordItemId?: number;
  problemDescription: string;
  problemSeverity: ProblemSeverity;
  rectificationMeasures?: string;
  responsiblePersonId?: number;
  responsiblePersonName?: string;
  deadline?: Date;
  status: RectificationStatus;
  progress: number;
  completionDate?: Date;
  completionDescription?: string;
  completionPhotos?: string[];
  verifierId?: number;
  verifierName?: string;
  verificationDate?: Date;
  verificationResult?: string;
  verificationStatus?: VerificationStatus;
  notes?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 整改进度日志属性接口
export interface RectificationProgressLogAttributes {
  id: number;
  rectificationId: number;
  logDate: Date;
  progress: number;
  description?: string;
  photos?: string[];
  operatorId?: number;
  operatorName?: string;
  createdAt?: Date;
}

// 创建时的可选属性
interface InspectionRectificationCreationAttributes extends Optional<InspectionRectificationAttributes, 'id' | 'status' | 'progress'> {}
interface RectificationProgressLogCreationAttributes extends Optional<RectificationProgressLogAttributes, 'id'> {}

// 整改任务模型
class InspectionRectification extends Model<InspectionRectificationAttributes, InspectionRectificationCreationAttributes>
  implements InspectionRectificationAttributes {
  
  public id!: number;
  public inspectionPlanId!: number;
  public recordId?: number;
  public recordItemId?: number;
  public problemDescription!: string;
  public problemSeverity!: ProblemSeverity;
  public rectificationMeasures?: string;
  public responsiblePersonId?: number;
  public responsiblePersonName?: string;
  public deadline?: Date;
  public status!: RectificationStatus;
  public progress!: number;
  public completionDate?: Date;
  public completionDescription?: string;
  public completionPhotos?: string[];
  public verifierId?: number;
  public verifierName?: string;
  public verificationDate?: Date;
  public verificationResult?: string;
  public verificationStatus?: VerificationStatus;
  public notes?: string;
  public createdBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联
  public readonly inspectionPlan?: any;
  public readonly record?: any;
  public readonly recordItem?: any;
  public readonly progressLogs?: RectificationProgressLog[];
  public readonly responsiblePerson?: any;
  public readonly verifier?: any;

  // 初始化模型
  static initModel(sequelize: Sequelize): void {
    InspectionRectification.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        inspectionPlanId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'inspection_plan_id',
          comment: '关联的检查计划ID',
        },
        recordId: {
          type: DataTypes.INTEGER,
          field: 'record_id',
          comment: '关联的检查记录ID',
        },
        recordItemId: {
          type: DataTypes.INTEGER,
          field: 'record_item_id',
          comment: '关联的检查项ID',
        },
        problemDescription: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: 'problem_description',
          comment: '问题描述',
        },
        problemSeverity: {
          type: DataTypes.ENUM(...Object.values(ProblemSeverity)),
          allowNull: false,
          defaultValue: ProblemSeverity.MEDIUM,
          field: 'problem_severity',
          comment: '问题严重程度',
        },
        rectificationMeasures: {
          type: DataTypes.TEXT,
          field: 'rectification_measures',
          comment: '整改措施',
        },
        responsiblePersonId: {
          type: DataTypes.INTEGER,
          field: 'responsible_person_id',
          comment: '责任人ID',
        },
        responsiblePersonName: {
          type: DataTypes.STRING(100),
          field: 'responsible_person_name',
          comment: '责任人姓名',
        },
        deadline: {
          type: DataTypes.DATEONLY,
          comment: '整改截止日期',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(RectificationStatus)),
          allowNull: false,
          defaultValue: RectificationStatus.PENDING,
          comment: '整改状态',
        },
        progress: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '整改进度',
          validate: {
            min: 0,
            max: 100,
          },
        },
        completionDate: {
          type: DataTypes.DATEONLY,
          field: 'completion_date',
          comment: '完成日期',
        },
        completionDescription: {
          type: DataTypes.TEXT,
          field: 'completion_description',
          comment: '完成情况说明',
        },
        completionPhotos: {
          type: DataTypes.JSON,
          field: 'completion_photos',
          comment: '整改完成照片',
        },
        verifierId: {
          type: DataTypes.INTEGER,
          field: 'verifier_id',
          comment: '验收人ID',
        },
        verifierName: {
          type: DataTypes.STRING(100),
          field: 'verifier_name',
          comment: '验收人姓名',
        },
        verificationDate: {
          type: DataTypes.DATEONLY,
          field: 'verification_date',
          comment: '验收日期',
        },
        verificationResult: {
          type: DataTypes.TEXT,
          field: 'verification_result',
          comment: '验收结果',
        },
        verificationStatus: {
          type: DataTypes.ENUM(...Object.values(VerificationStatus)),
          field: 'verification_status',
          comment: '验收状态',
        },
        notes: {
          type: DataTypes.TEXT,
          comment: '备注',
        },
        createdBy: {
          type: DataTypes.INTEGER,
          field: 'created_by',
          comment: '创建人ID',
        },
      },
      {
        sequelize,
        tableName: 'inspection_rectifications',
        timestamps: true,
        underscored: true,
        comment: '整改任务表',
      }
    );
  }

  // 设置关联
  static associate(models: any): void {
    InspectionRectification.belongsTo(models.InspectionPlan, {
      foreignKey: 'inspectionPlanId',
      as: 'inspectionPlan',
    });

    InspectionRectification.belongsTo(models.InspectionRecord, {
      foreignKey: 'recordId',
      as: 'record',
    });

    InspectionRectification.belongsTo(models.InspectionRecordItem, {
      foreignKey: 'recordItemId',
      as: 'recordItem',
    });

    InspectionRectification.hasMany(models.RectificationProgressLog, {
      foreignKey: 'rectificationId',
      as: 'progressLogs',
    });
  }
}

// 整改进度日志模型
class RectificationProgressLog extends Model<RectificationProgressLogAttributes, RectificationProgressLogCreationAttributes>
  implements RectificationProgressLogAttributes {
  
  public id!: number;
  public rectificationId!: number;
  public logDate!: Date;
  public progress!: number;
  public description?: string;
  public photos?: string[];
  public operatorId?: number;
  public operatorName?: string;

  public readonly createdAt!: Date;

  // 关联
  public readonly rectification?: InspectionRectification;

  // 初始化模型
  static initModel(sequelize: Sequelize): void {
    RectificationProgressLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        rectificationId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'rectification_id',
          comment: '整改任务ID',
        },
        logDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'log_date',
          comment: '日志日期',
        },
        progress: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '进度',
          validate: {
            min: 0,
            max: 100,
          },
        },
        description: {
          type: DataTypes.TEXT,
          comment: '进度说明',
        },
        photos: {
          type: DataTypes.JSON,
          comment: '进度照片',
        },
        operatorId: {
          type: DataTypes.INTEGER,
          field: 'operator_id',
          comment: '操作人ID',
        },
        operatorName: {
          type: DataTypes.STRING(100),
          field: 'operator_name',
          comment: '操作人姓名',
        },
      },
      {
        sequelize,
        tableName: 'rectification_progress_logs',
        timestamps: false,
        underscored: true,
        comment: '整改进度跟踪表',
      }
    );
  }

  // 设置关联
  static associate(models: any): void {
    RectificationProgressLog.belongsTo(models.InspectionRectification, {
      foreignKey: 'rectificationId',
      as: 'rectification',
    });
  }
}

export default InspectionRectification;
export { RectificationProgressLog };

