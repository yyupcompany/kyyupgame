import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';
import { Role } from './role.model';

export enum IsPrimaryRole {
  NO = 0,
  YES = 1,
}

export class UserRole extends Model<
  InferAttributes<UserRole>,
  InferCreationAttributes<UserRole>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare roleId: ForeignKey<Role['id']>;
  declare isPrimary: CreationOptional<IsPrimaryRole>;
  declare startTime: Date | null;
  declare endTime: Date | null;
  declare grantorId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  declare readonly user?: User;
  declare readonly role?: Role;
  declare readonly grantor?: User;

  static initModel(sequelize: Sequelize): void {
    UserRole.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键ID',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '用户ID',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '角色ID',
          references: {
            model: 'roles',
            key: 'id',
          },
        },
        isPrimary: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: IsPrimaryRole.NO,
          comment: '是否主角色：0-否，1-是',
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '授权开始时间',
        },
        endTime: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '授权结束时间',
        },
        grantorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '授权人ID',
          references: {
            model: 'users',
            key: 'id',
          }
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
        tableName: 'user_roles',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    UserRole.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user',
    });
    UserRole.belongsTo(Role, {
      foreignKey: 'roleId',
      as: 'role',
    });
    UserRole.belongsTo(User, {
      foreignKey: 'grantorId',
      as: 'grantor'
    });
  }
}
