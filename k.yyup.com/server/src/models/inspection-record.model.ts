import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// 检查项状态枚举
export enum InspectionItemStatus {
  PASS = 'pass',       // 通过
  WARNING = 'warning', // 警告
  FAIL = 'fail'        // 不通过
}

// 检查记录属性接口
export interface InspectionRecordAttributes {
  id: number;
  inspectionPlanId: number;
  checkDate: Date;
  checkerId?: number;
  checkerName?: string;
  totalScore?: number;
  grade?: string;
  summary?: string;
  suggestions?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
  checkerSignature?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 检查项目明细属性接口
export interface InspectionRecordItemAttributes {
  id: number;
  recordId: number;
  itemName: string;
  itemCategory?: string;
  status: InspectionItemStatus;
  score?: number;
  maxScore?: number;
  problemDescription?: string;
  photos?: string[];
  notes?: string;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选属性
interface InspectionRecordCreationAttributes extends Optional<InspectionRecordAttributes, 'id'> {}
interface InspectionRecordItemCreationAttributes extends Optional<InspectionRecordItemAttributes, 'id' | 'status' | 'sortOrder'> {}

// 检查记录模型
class InspectionRecord extends Model<InspectionRecordAttributes, InspectionRecordCreationAttributes>
  implements InspectionRecordAttributes {
  
  public id!: number;
  public inspectionPlanId!: number;
  public checkDate!: Date;
  public checkerId?: number;
  public checkerName?: string;
  public totalScore?: number;
  public grade?: string;
  public summary?: string;
  public suggestions?: string;
  public attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
  public checkerSignature?: string;
  public createdBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联
  public readonly inspectionPlan?: any;
  public readonly items?: InspectionRecordItem[];
  public readonly checker?: any;

  // 初始化模型
  static initModel(sequelize: Sequelize): void {
    InspectionRecord.init(
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
        checkDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'check_date',
          comment: '实际检查日期',
        },
        checkerId: {
          type: DataTypes.INTEGER,
          field: 'checker_id',
          comment: '检查人员ID',
        },
        checkerName: {
          type: DataTypes.STRING(100),
          field: 'checker_name',
          comment: '检查人员姓名',
        },
        totalScore: {
          type: DataTypes.DECIMAL(5, 2),
          field: 'total_score',
          defaultValue: 0,
          comment: '总分',
        },
        grade: {
          type: DataTypes.STRING(20),
          comment: '等级',
        },
        summary: {
          type: DataTypes.TEXT,
          comment: '检查总结',
        },
        suggestions: {
          type: DataTypes.TEXT,
          comment: '改进建议',
        },
        attachments: {
          type: DataTypes.JSON,
          comment: '附件列表',
        },
        checkerSignature: {
          type: DataTypes.STRING(500),
          field: 'checker_signature',
          comment: '检查人签名',
        },
        createdBy: {
          type: DataTypes.INTEGER,
          field: 'created_by',
          comment: '创建人ID',
        },
      },
      {
        sequelize,
        tableName: 'inspection_records',
        timestamps: true,
        underscored: true,
        comment: '检查记录表',
      }
    );
  }

  // 设置关联
  static associate(models: any): void {
    InspectionRecord.belongsTo(models.InspectionPlan, {
      foreignKey: 'inspectionPlanId',
      as: 'inspectionPlan',
    });

    InspectionRecord.hasMany(models.InspectionRecordItem, {
      foreignKey: 'recordId',
      as: 'items',
    });
  }
}

// 检查项目明细模型
class InspectionRecordItem extends Model<InspectionRecordItemAttributes, InspectionRecordItemCreationAttributes>
  implements InspectionRecordItemAttributes {
  
  public id!: number;
  public recordId!: number;
  public itemName!: string;
  public itemCategory?: string;
  public status!: InspectionItemStatus;
  public score?: number;
  public maxScore?: number;
  public problemDescription?: string;
  public photos?: string[];
  public notes?: string;
  public sortOrder?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联
  public readonly record?: InspectionRecord;

  // 初始化模型
  static initModel(sequelize: Sequelize): void {
    InspectionRecordItem.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        recordId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'record_id',
          comment: '检查记录ID',
        },
        itemName: {
          type: DataTypes.STRING(200),
          allowNull: false,
          field: 'item_name',
          comment: '检查项名称',
        },
        itemCategory: {
          type: DataTypes.STRING(100),
          field: 'item_category',
          comment: '检查项分类',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(InspectionItemStatus)),
          allowNull: false,
          defaultValue: InspectionItemStatus.PASS,
          comment: '检查状态',
        },
        score: {
          type: DataTypes.DECIMAL(5, 2),
          comment: '得分',
        },
        maxScore: {
          type: DataTypes.DECIMAL(5, 2),
          field: 'max_score',
          comment: '满分',
        },
        problemDescription: {
          type: DataTypes.TEXT,
          field: 'problem_description',
          comment: '问题描述',
        },
        photos: {
          type: DataTypes.JSON,
          comment: '问题照片列表',
        },
        notes: {
          type: DataTypes.TEXT,
          comment: '备注',
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          field: 'sort_order',
          defaultValue: 0,
          comment: '排序',
        },
      },
      {
        sequelize,
        tableName: 'inspection_record_items',
        timestamps: true,
        underscored: true,
        comment: '检查项目明细表',
      }
    );
  }

  // 设置关联
  static associate(models: any): void {
    InspectionRecordItem.belongsTo(models.InspectionRecord, {
      foreignKey: 'recordId',
      as: 'record',
    });
  }
}

export default InspectionRecord;
export { InspectionRecordItem };

