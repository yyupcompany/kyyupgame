const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// 使用SQLite数据库
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, 'database.sqlite'),
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  }
});

// 定义基础模型
const Role = sequelize.define('roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: DataTypes.TEXT,
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  underscored: true,
  paranoid: true
});

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true
  },
  password: DataTypes.STRING(128),
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  real_name: DataTypes.STRING(255),
  phone: DataTypes.STRING(255),
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'locked'),
    defaultValue: 'active'
  }
});

const Permission = sequelize.define('permissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  chineseName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'chinese_name'
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('menu', 'button'),
    defaultValue: 'menu'
  },
  parentId: {
    type: DataTypes.INTEGER,
    field: 'parent_id'
  },
  path: DataTypes.STRING(255),
  component: DataTypes.STRING(255),
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'file_path'
  },
  permission: DataTypes.STRING(255),
  icon: DataTypes.STRING(100),
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  underscored: true
});

const RolePermission = sequelize.define('role_permissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'role_id'
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'permission_id'
  },
  grantorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'grantor_id'
  }
}, {
  underscored: true
});

const UserRole = sequelize.define('user_roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'role_id'
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_primary'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_time'
  },
  grantorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'grantor_id'
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  underscored: true,
  paranoid: true
});

async function initDatabase() {
  try {
    console.log('🔄 开始初始化数据库...');
    
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步所有表结构
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表结构同步完成');
    
    // 创建基础角色
    await sequelize.query(`
      INSERT INTO roles (name, code, description, status, created_at, updated_at) VALUES
      ('超级管理员', 'admin', '系统超级管理员', 1, datetime('now'), datetime('now')),
      ('校长', 'principal', '幼儿园校长', 1, datetime('now'), datetime('now')),
      ('教师', 'teacher', '幼儿园教师', 1, datetime('now'), datetime('now')),
      ('家长', 'parent', '学生家长', 1, datetime('now'), datetime('now'))
    `);
    console.log('✅ 基础角色创建完成');
    
    // 创建管理员用户
    await sequelize.query(`
      INSERT INTO users (username, password, email, role, real_name, phone, status, created_at, updated_at) VALUES
      ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'admin', '超级管理员', '13800138000', 'active', datetime('now'), datetime('now'))
    `);
    console.log('✅ 管理员用户创建完成');
    
    // 创建基础权限
    await sequelize.query(`
      INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at) VALUES
      ('招生计划管理', 'ENROLLMENT_PLAN_MANAGE', 'menu', NULL, '/enrollment-plan', 'layouts/default/index.vue', 'enrollment:plan:manage', 'el-icon-s-flag', 30, 1, datetime('now'), datetime('now')),
      ('活动管理', 'ACTIVITY_MANAGE', 'menu', NULL, '/activity', 'layouts/default/index.vue', 'activity:manage', 'el-icon-star-on', 40, 1, datetime('now'), datetime('now'))
    `);
    console.log('✅ 基础权限创建完成');
    
    // 为admin角色分配权限
    await sequelize.query(`
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      SELECT 1, id, datetime('now'), datetime('now') FROM permissions
    `);
    console.log('✅ 权限分配完成');

    // 为admin用户分配admin角色
    await sequelize.query(`
      INSERT OR IGNORE INTO user_roles (user_id, role_id, created_at, updated_at) VALUES
      (1, 1, datetime('now'), datetime('now'))
    `);
    console.log('✅ 用户角色分配完成');
    
    console.log('🎉 数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  } finally {
    await sequelize.close();
  }
}

initDatabase();
