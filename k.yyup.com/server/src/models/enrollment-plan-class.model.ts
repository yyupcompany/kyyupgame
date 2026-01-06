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
import { Class } from './class.model';

export class EnrollmentPlanClass extends Model<
  InferAttributes<EnrollmentPlanClass>,
  InferCreationAttributes<EnrollmentPlanClass>
> {
  declare id: CreationOptional<number>;
  declare planId: ForeignKey<EnrollmentPlan['id']>;
  declare classId: ForeignKey<Class['id']>;
  declare quota: CreationOptional<number>;
  declare remark: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

export const initEnrollmentPlanClass = (sequelize: Sequelize) => {
  EnrollmentPlanClass.init(
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
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '班级ID - 外键关联班级表',
        references: {
          model: 'classes',
          key: 'id',
        },
      },
      quota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '招生名额',
      },
      remark: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '备注',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '更新时间',
      },
    },
    {
      sequelize,
      tableName: 'enrollment_plan_classes',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return EnrollmentPlanClass;
};

export const initEnrollmentPlanClassAssociations = () => {
  EnrollmentPlan.belongsToMany(Class, {
    through: EnrollmentPlanClass,
    foreignKey: 'planId',
    otherKey: 'classId',
    as: 'classes',
  });
  Class.belongsToMany(EnrollmentPlan, {
    through: EnrollmentPlanClass,
    foreignKey: 'classId',
    otherKey: 'planId',
    as: 'enrollmentPlans',
  });
  EnrollmentPlanClass.belongsTo(EnrollmentPlan, {
    foreignKey: 'planId',
    as: 'plan',
  });
  EnrollmentPlanClass.belongsTo(Class, {
    foreignKey: 'classId',
    as: 'class',
  });
};
