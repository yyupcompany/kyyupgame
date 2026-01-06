import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { User } from './user.model';
import { Permission } from './permission.model';
import { UserRole } from './user-role.model';
import { RolePermission } from './role-permission.model';

export enum RoleStatus {
  ENABLED = 1,
  DISABLED = 0,
}

export class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare status: CreationOptional<RoleStatus>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  declare readonly users?: User[];
  declare readonly permissions?: Permission[];

  static initModel(sequelize: Sequelize): void {
    Role.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          comment: '角色名称',
        },
        code: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          comment: '角色编码',
        },
        description: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: '角色描述',
        },
        status: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: RoleStatus.ENABLED,
          comment: '状态(1:启用 0:禁用)',
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
        tableName: 'roles',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    Role.belongsToMany(User, {
      through: UserRole,
      foreignKey: 'roleId',
      otherKey: 'userId',
      as: 'users',
    });
    Role.belongsToMany(Permission, {
      through: RolePermission,
      foreignKey: 'roleId',
      otherKey: 'permissionId',
      as: 'permissions',
    });
  }
}
