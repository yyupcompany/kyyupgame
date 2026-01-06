import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { EnrollmentPlan } from './enrollment-plan.model';
import { User } from './user.model';

export enum AssigneeRole {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export class EnrollmentPlanAssignee extends Model<
  InferAttributes<EnrollmentPlanAssignee>,
  InferCreationAttributes<EnrollmentPlanAssignee>
> {
  declare id: CreationOptional<number>;
  declare planId: ForeignKey<EnrollmentPlan['id']>;
  declare assigneeId: ForeignKey<User['id']>;
  declare role: CreationOptional<AssigneeRole>;
  declare remark: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}

export const initEnrollmentPlanAssignee = (sequelize: Sequelize) => {
  EnrollmentPlanAssignee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '关联ID - 主键',
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '招生计划ID - 外键关联招生计划表',
        references: {
          model: 'enrollment_plans',
          key: 'id',
        },
      },
      assigneeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '负责人ID - 外键关联用户表',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.ENUM(...Object.values(AssigneeRole)),
        allowNull: false,
        defaultValue: AssigneeRole.SECONDARY,
        comment: '负责类型：primary-主负责人, secondary-协助负责人',
      },
      remark: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '备注',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'enrollment_plan_assignees',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return EnrollmentPlanAssignee;
};

export const initEnrollmentPlanAssigneeAssociations = () => {
  EnrollmentPlanAssignee.belongsTo(EnrollmentPlan, {
    foreignKey: 'planId',
    as: 'plan',
  });
  EnrollmentPlanAssignee.belongsTo(User, {
    foreignKey: 'assigneeId',
    as: 'assignee',
  });
};
