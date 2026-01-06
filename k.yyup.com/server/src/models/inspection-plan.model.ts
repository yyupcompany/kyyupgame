import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 检查计划状态枚举
export enum InspectionPlanStatus {
  PENDING = 'pending',           // 未开始
  PREPARING = 'preparing',       // 准备中
  IN_PROGRESS = 'in_progress',   // 进行中
  COMPLETED = 'completed',       // 已完成
  OVERDUE = 'overdue'           // 已逾期
}

// 检查计划属性接口
export interface InspectionPlanAttributes {
  id: number;
  kindergartenId: number;
  inspectionTypeId: number;
  planYear: number;
  planDate: Date;
  actualDate?: Date;
  status: InspectionPlanStatus;
  responsibleUserId?: number;
  notes?: string;
  result?: string;
  score?: number;
  grade?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选属性
interface InspectionPlanCreationAttributes extends Optional<InspectionPlanAttributes, 'id' | 'status'> {}

// 检查计划模型
class InspectionPlan extends Model<InspectionPlanAttributes, InspectionPlanCreationAttributes>
  implements InspectionPlanAttributes {
  public id!: number;
  public kindergartenId!: number;
  public inspectionTypeId!: number;
  public planYear!: number;
  public planDate!: Date;
  public actualDate?: Date;
  public status!: InspectionPlanStatus;
  public responsibleUserId?: number;
  public notes?: string;
  public result?: string;
  public score?: number;
  public grade?: string;
  public createdBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联
  public readonly inspectionType?: any;
  public readonly kindergarten?: any;
  public readonly responsibleUser?: any;

  // 初始化模型
  static initModel(sequelize: Sequelize): void {
    InspectionPlan.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        kindergartenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'kindergarten_id',
          comment: '幼儿园ID',
        },
        inspectionTypeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'inspection_type_id',
          comment: '检查类型ID',
        },
        planYear: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'plan_year',
          comment: '计划年份',
        },
        planDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'plan_date',
          comment: '计划日期',
        },
        actualDate: {
          type: DataTypes.DATEONLY,
          field: 'actual_date',
          comment: '实际日期',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(InspectionPlanStatus)),
          defaultValue: InspectionPlanStatus.PENDING,
          comment: '状态',
        },
        responsibleUserId: {
          type: DataTypes.INTEGER,
          field: 'responsible_user_id',
          comment: '负责人ID',
        },
        notes: {
          type: DataTypes.TEXT,
          comment: '备注',
        },
        result: {
          type: DataTypes.TEXT,
          comment: '检查结果',
        },
        score: {
          type: DataTypes.DECIMAL(5, 2),
          comment: '检查得分',
        },
        grade: {
          type: DataTypes.STRING(20),
          comment: '检查等级',
        },
        createdBy: {
          type: DataTypes.INTEGER,
          field: 'created_by',
          comment: '创建人ID',
        },
      },
      {
        sequelize,
        tableName: 'inspection_plans',
        underscored: true,
        timestamps: true,
        indexes: [
          { fields: ['kindergarten_id'] },
          { fields: ['inspection_type_id'] },
          { fields: ['plan_year'] },
          { fields: ['status'] },
          { fields: ['plan_date'] },
        ],
      }
    );
  }
}

export default InspectionPlan;

