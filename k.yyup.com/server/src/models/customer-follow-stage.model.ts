import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface CustomerFollowStageAttributes {
  id: number;
  stageNumber: number;
  stageName: string;
  stageDescription: string;
  subStages: any; // JSON array of sub-stages
  defaultDuration: number; // 预计完成天数
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerFollowStageCreationAttributes = Optional<CustomerFollowStageAttributes, 'id'>;

export class CustomerFollowStage extends Model<CustomerFollowStageAttributes, CustomerFollowStageCreationAttributes> implements CustomerFollowStageAttributes {
  public id!: number;
  public stageNumber!: number;
  public stageName!: string;
  public stageDescription!: string;
  public subStages!: any;
  public defaultDuration!: number;
  public isRequired!: boolean;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): void {
    CustomerFollowStage.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: '阶段配置ID'
        },
        stageNumber: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'stage_number',
          comment: '阶段编号 (1-8)'
        },
        stageName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'stage_name',
          comment: '阶段名称'
        },
        stageDescription: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: 'stage_description',
          comment: '阶段描述'
        },
        subStages: {
          type: DataTypes.JSON,
          allowNull: false,
          field: 'sub_stages',
          comment: '子阶段配置 JSON格式'
        },
        defaultDuration: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 7,
          field: 'default_duration',
          comment: '预计完成天数'
        },
        isRequired: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'is_required',
          comment: '是否必需阶段'
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'sort_order',
          comment: '排序顺序'
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'is_active',
          comment: '是否启用'
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
        }
      },
      {
        sequelize,
        tableName: 'customer_follow_stages',
        timestamps: true,
        underscored: true,
        comment: '客户跟进阶段配置表'
      }
    );
  }
}

export default CustomerFollowStage;
