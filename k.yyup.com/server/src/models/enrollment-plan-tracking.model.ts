import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { EnrollmentPlan } from './enrollment-plan.model';
import { User } from './user.model';

export interface EnrollmentPlanTrackingAttributes {
  id: number;
  planId: number;
  date: Date;
  count: number;
  source: string;
  assigneeId: number;
  remark: string | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export type EnrollmentPlanTrackingCreationAttributes = Optional<EnrollmentPlanTrackingAttributes, 'id' | 'count' | 'remark'>;

export class EnrollmentPlanTracking extends Model<EnrollmentPlanTrackingAttributes, EnrollmentPlanTrackingCreationAttributes> implements EnrollmentPlanTrackingAttributes {
  public id!: number;
  public planId!: number;
  public date!: Date;
  public count!: number;
  public source!: string;
  public assigneeId!: number;
  public remark!: string | null;
  public createdBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly plan?: EnrollmentPlan;
  public readonly assignee?: User;
  public readonly creator?: User;

  static initModel(sequelize: Sequelize): void {
    EnrollmentPlanTracking.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: '跟踪ID - 主键'
        },
        planId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'plan_id',
          comment: '招生计划ID - 外键关联招生计划表',
          references: {
            model: 'enrollment_plans',
            key: 'id'
          }
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          comment: '日期'
        },
        count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '当日招生人数'
        },
        source: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '来源渠道'
        },
        assigneeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'assignee_id',
          comment: '负责人ID - 外键关联用户表',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        remark: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '备注'
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'created_by',
          comment: '创建人ID - 外键关联用户表',
          references: {
            model: 'users',
            key: 'id'
          }
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
        tableName: 'enrollment_plan_trackings',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    EnrollmentPlanTracking.belongsTo(EnrollmentPlan, {
      foreignKey: 'planId',
      as: 'plan'
    });
    EnrollmentPlanTracking.belongsTo(User, {
      foreignKey: 'assigneeId',
      as: 'assignee'
    });
    EnrollmentPlanTracking.belongsTo(User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  }
}

export default EnrollmentPlanTracking;
