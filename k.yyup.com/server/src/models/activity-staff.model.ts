import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Activity } from './activity.model';
import { User } from './user.model';

export class ActivityStaff extends Model<
  InferAttributes<ActivityStaff>,
  InferCreationAttributes<ActivityStaff>
> {
  declare id: CreationOptional<number>;
  declare activityId: number;
  declare userId: number;
  declare roleType: number;
  declare responsibilities: string | null;
  declare comment: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}

export const initActivityStaff = (sequelize: Sequelize) => {
  ActivityStaff.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动ID - 外键关联活动表',
        references: {
          model: 'activities',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID - 外键关联用户表',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      roleType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '角色类型 - 1:负责人 2:协助者 3:嘉宾 4:主持人 5:其他',
      },
      responsibilities: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '职责描述',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注',
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
      },
    },
    {
      sequelize,
      tableName: 'activity_staffs',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ActivityStaff;
}

export const initActivityStaffAssociations = () => {
    ActivityStaff.belongsTo(Activity, {
        foreignKey: 'activityId',
        as: 'activity'
    });
    ActivityStaff.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
}
