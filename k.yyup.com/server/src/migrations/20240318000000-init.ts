import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init';

/**
 * 初始化基础表结构
 * 创建用户、角色、权限相关表
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  // 创建用户表
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // 创建角色表
  await queryInterface.createTable('roles', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // 创建权限表
  await queryInterface.createTable('permissions', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    path: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    component: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    permission: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // 创建用户-角色关联表
  await queryInterface.createTable('user_roles', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // 创建角色-权限关联表
  await queryInterface.createTable('role_permissions', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'permission_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // 添加外键约束
  await queryInterface.addConstraint('user_roles', {
    fields: ['user_id'],
    type: 'foreign key',
    name: 'fk_user_roles_user_id',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('user_roles', {
    fields: ['role_id'],
    type: 'foreign key',
    name: 'fk_user_roles_role_id',
    references: {
      table: 'roles',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('role_permissions', {
    fields: ['role_id'],
    type: 'foreign key',
    name: 'fk_role_permissions_role_id',
    references: {
      table: 'roles',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('role_permissions', {
    fields: ['permission_id'],
    type: 'foreign key',
    name: 'fk_role_permissions_permission_id',
    references: {
      table: 'permissions',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await queryInterface.addConstraint('permissions', {
    fields: ['parent_id'],
    type: 'foreign key',
    name: 'fk_permissions_parent_id',
    references: {
      table: 'permissions',
      field: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
}

/**
 * 删除初始表结构
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  // 删除外键约束
  await queryInterface.removeConstraint('user_roles', 'fk_user_roles_user_id');
  await queryInterface.removeConstraint('user_roles', 'fk_user_roles_role_id');
  await queryInterface.removeConstraint('role_permissions', 'fk_role_permissions_role_id');
  await queryInterface.removeConstraint('role_permissions', 'fk_role_permissions_permission_id');
  await queryInterface.removeConstraint('permissions', 'fk_permissions_parent_id');

  // 删除表
  await queryInterface.dropTable('user_roles');
  await queryInterface.dropTable('role_permissions');
  await queryInterface.dropTable('permissions');
  await queryInterface.dropTable('roles');
  await queryInterface.dropTable('users');
} 