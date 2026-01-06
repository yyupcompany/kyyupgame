import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { Role } from './role.model';
import { Permission } from './permission.model';
import { User } from './user.model';

export class RolePermission extends Model<
  InferAttributes<RolePermission>,
  InferCreationAttributes<RolePermission>
> {
  declare id: CreationOptional<number>;
  declare roleId: ForeignKey<Role['id']>;
  declare permissionId: ForeignKey<Permission['id']>;
  declare grantorId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  declare readonly role?: Role;
  declare readonly permission?: Permission;

  static initModel(sequelize: Sequelize): void {
    RolePermission.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键ID',
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
        permissionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '权限ID',
          references: {
            model: 'permissions',
            key: 'id',
          },
        },
        grantorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '授权人ID'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'role_permissions',
        timestamps: true,
        paranoid: false, // Junction table should not be paranoid
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    RolePermission.belongsTo(Role, {
      foreignKey: 'roleId',
      as: 'role',
    });
    RolePermission.belongsTo(Permission, {
      foreignKey: 'permissionId',
      as: 'permission',
    });
     RolePermission.belongsTo(User, {
      foreignKey: 'grantorId',
      as: 'grantor'
    });
  }
}
