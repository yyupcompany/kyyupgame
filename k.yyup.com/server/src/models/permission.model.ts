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
import { RolePermission } from './role-permission.model';

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
}

export enum PermissionStatus {
  ENABLED = 1,
  DISABLED = 0,
}

export class Permission extends Model<
  InferAttributes<Permission>,
  InferCreationAttributes<Permission>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare chineseName: string | null;
  declare code: string;
  declare type: PermissionType;
  declare parentId: ForeignKey<Permission['id']> | null;
  declare path: string;
  declare component: string | null;
  declare permission: string | null;
  declare icon: string | null;
  declare sort: CreationOptional<number>;
  declare status: CreationOptional<PermissionStatus>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  declare readonly roles?: Role[];
  declare readonly parent?: Permission;
  declare readonly children?: Permission[];

  static initModel(sequelize: Sequelize): void {
    Permission.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '权限名称',
        },
        chineseName: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '中文名称',
          field: 'chinese_name',
        },
        code: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          comment: '权限编码',
        },
        type: {
          type: DataTypes.STRING(20),
          allowNull: false,
          comment: '权限类型(menu, button)',
        },
        parentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '父权限ID',
        },
        path: {
          type: DataTypes.STRING(200),
          allowNull: false,
          comment: '路由路径',
        },
        component: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: '组件路径',
        },
        permission: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: '权限标识',
        },
        icon: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '图标',
        },
        sort: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '排序',
        },
        status: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: PermissionStatus.ENABLED,
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
        tableName: 'permissions',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    Permission.belongsTo(Permission, {
      foreignKey: 'parentId',
      as: 'parent',
    });
    Permission.hasMany(Permission, {
      foreignKey: 'parentId',
      as: 'children',
    });
    Permission.belongsToMany(Role, {
      through: RolePermission,
      foreignKey: 'permissionId',
      otherKey: 'roleId',
      as: 'roles',
    });
  }
}
