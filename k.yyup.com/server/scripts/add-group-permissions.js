/**
 * 添加集团管理权限到数据库
 * 运行方式: node server/scripts/add-group-permissions.js
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: console.log
  }
);

// 集团管理权限配置
const groupPermissions = [
  // 一级类目：集团管理
  {
    id: 1000,
    name: 'Group Management',
    chinese_name: '集团管理',
    code: 'GROUP_MANAGEMENT',
    type: 'menu',
    parent_id: null,
    path: '/group',
    component: null,
    permission: 'GROUP_MANAGEMENT',
    icon: 'OfficeBuilding',
    sort: 100,
    status: 1
  },

  // 二级页面：集团列表
  {
    id: 1001,
    name: 'Group List',
    chinese_name: '集团列表',
    code: 'GROUP_LIST',
    type: 'menu',
    parent_id: 1000,
    path: '/group/list',
    component: 'pages/group/group-list.vue',
    permission: 'GROUP_LIST',
    icon: 'List',
    sort: 1,
    status: 1
  },

  // 二级页面：集团详情
  {
    id: 1002,
    name: 'Group Detail',
    chinese_name: '集团详情',
    code: 'GROUP_DETAIL',
    type: 'menu',
    parent_id: 1000,
    path: '/group/detail/:id',
    component: 'pages/group/group-detail.vue',
    permission: 'GROUP_DETAIL',
    icon: 'Document',
    sort: 2,
    status: 1
  },

  // 二级页面：创建集团
  {
    id: 1003,
    name: 'Group Create',
    chinese_name: '创建集团',
    code: 'GROUP_CREATE',
    type: 'menu',
    parent_id: 1000,
    path: '/group/create',
    component: 'pages/group/group-form.vue',
    permission: 'GROUP_CREATE',
    icon: 'Plus',
    sort: 3,
    status: 1
  },

  // 二级页面：编辑集团
  {
    id: 1004,
    name: 'Group Edit',
    chinese_name: '编辑集团',
    code: 'GROUP_EDIT',
    type: 'menu',
    parent_id: 1000,
    path: '/group/edit/:id',
    component: 'pages/group/group-form.vue',
    permission: 'GROUP_EDIT',
    icon: 'Edit',
    sort: 4,
    status: 1
  },

  // 二级页面：升级为集团
  {
    id: 1005,
    name: 'Group Upgrade',
    chinese_name: '升级为集团',
    code: 'GROUP_UPGRADE',
    type: 'menu',
    parent_id: 1000,
    path: '/group/upgrade',
    component: 'pages/group/group-upgrade.vue',
    permission: 'GROUP_UPGRADE',
    icon: 'Upload',
    sort: 5,
    status: 1
  },

  // 三级操作：查看权限
  {
    id: 1010,
    name: 'View Group',
    chinese_name: '查看集团',
    code: 'GROUP_VIEW',
    type: 'button',
    parent_id: 1001,
    path: '',
    component: null,
    permission: 'GROUP_VIEW',
    icon: null,
    sort: 1,
    status: 1
  },

  // 三级操作：管理权限
  {
    id: 1011,
    name: 'Manage Group',
    chinese_name: '管理集团',
    code: 'GROUP_MANAGE',
    type: 'button',
    parent_id: 1001,
    path: '',
    component: null,
    permission: 'GROUP_MANAGE',
    icon: null,
    sort: 2,
    status: 1
  },

  // 三级操作：删除权限
  {
    id: 1012,
    name: 'Delete Group',
    chinese_name: '删除集团',
    code: 'GROUP_DELETE',
    type: 'button',
    parent_id: 1001,
    path: '',
    component: null,
    permission: 'GROUP_DELETE',
    icon: null,
    sort: 3,
    status: 1
  },

  // 三级操作：用户管理权限
  {
    id: 1013,
    name: 'Manage Group Users',
    chinese_name: '管理集团用户',
    code: 'GROUP_USER_MANAGE',
    type: 'button',
    parent_id: 1001,
    path: '',
    component: null,
    permission: 'GROUP_USER_MANAGE',
    icon: null,
    sort: 4,
    status: 1
  }
];

async function addGroupPermissions() {
  try {
    console.log('🔄 开始添加集团管理权限...\n');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 检查权限表是否存在
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'permissions'");
    if (tables.length === 0) {
      console.error('❌ 权限表不存在，请先运行数据库迁移');
      process.exit(1);
    }
    
    // 检查是否已存在集团管理权限
    const [existing] = await sequelize.query(
      "SELECT COUNT(*) as count FROM permissions WHERE code = 'GROUP_MANAGEMENT'"
    );
    
    if (existing[0].count > 0) {
      console.log('⚠️  集团管理权限已存在，跳过添加');
      console.log('💡 如需重新添加，请先删除现有权限：');
      console.log('   DELETE FROM permissions WHERE id >= 1000 AND id < 1100;\n');
      process.exit(0);
    }
    
    // 添加权限
    console.log('📝 开始插入权限记录...\n');
    
    for (const permission of groupPermissions) {
      const fields = Object.keys(permission).join(', ');
      const values = Object.values(permission).map(v => 
        v === null ? 'NULL' : typeof v === 'string' ? `'${v}'` : v
      ).join(', ');
      
      const sql = `INSERT INTO permissions (${fields}, created_at, updated_at) 
                   VALUES (${values}, NOW(), NOW())`;
      
      await sequelize.query(sql);
      console.log(`✅ 添加权限: ${permission.name} (${permission.code})`);
    }
    
    console.log('\n🎉 集团管理权限添加成功！\n');
    
    // 显示统计信息
    console.log('📊 权限统计:');
    console.log(`   - 一级类目: 1个`);
    console.log(`   - 二级页面: 5个`);
    console.log(`   - 三级操作: 4个`);
    console.log(`   - 总计: ${groupPermissions.length}个\n`);
    
    // 显示权限树
    console.log('🌳 权限树结构:');
    console.log('   集团管理 (GROUP_MANAGEMENT)');
    console.log('   ├── 集团列表 (GROUP_LIST)');
    console.log('   │   ├── 查看集团 (GROUP_VIEW)');
    console.log('   │   ├── 管理集团 (GROUP_MANAGE)');
    console.log('   │   ├── 删除集团 (GROUP_DELETE)');
    console.log('   │   └── 管理集团用户 (GROUP_USER_MANAGE)');
    console.log('   ├── 集团详情 (GROUP_DETAIL)');
    console.log('   ├── 创建集团 (GROUP_CREATE)');
    console.log('   ├── 编辑集团 (GROUP_EDIT)');
    console.log('   └── 升级为集团 (GROUP_UPGRADE)\n');
    
    console.log('💡 下一步:');
    console.log('   1. 为管理员角色分配集团管理权限');
    console.log('   2. 刷新前端页面，查看集团管理菜单');
    console.log('   3. 测试集团管理功能\n');
    
  } catch (error) {
    console.error('❌ 添加权限失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
addGroupPermissions();

