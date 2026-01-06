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

export class EnrollmentQuota extends Model<
  InferAttributes<EnrollmentQuota>,
  InferCreationAttributes<EnrollmentQuota>
> {
  declare id: CreationOptional<number>;
  declare planId: ForeignKey<EnrollmentPlan['id']>;
  declare classId: ForeignKey<Class['id']>;
  declare totalQuota: number;
  declare usedQuota: CreationOptional<number>;
  declare reservedQuota: CreationOptional<number>;
  declare remark: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  public readonly plan?: EnrollmentPlan;
  public readonly class?: Class;
}

export const initEnrollmentQuota = (sequelize: Sequelize) => {
  EnrollmentQuota.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '招生配额ID - 主键',
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
      totalQuota: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '总配额',
      },
      usedQuota: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '已使用配额',
      },
      reservedQuota: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '预留配额',
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
      tableName: 'enrollment_quotas',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return EnrollmentQuota;
};

export const initEnrollmentQuotaAssociations = () => {
  EnrollmentQuota.belongsTo(EnrollmentPlan, {
    foreignKey: 'planId',
    as: 'plan',
  });
  EnrollmentQuota.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
};
