const { Sequelize, DataTypes } = require('sequelize');

async function checkUserPermissions() {
    // 连接远程数据库
    const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
        host: 'dbconn.sealoshzh.site',
        port: 43906,
        dialect: 'mysql',
        logging: console.log
    });

    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');

        const userId = 8; // test_parent用户ID

        // 查看所有表
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('\n📋 数据库表列表:');
        tables.forEach(table => {
            console.log('  -', Object.values(table)[0]);
        });

        // 查看用户表结构
        console.log('\n👤 用户表结构:');
        const [userTableDesc] = await sequelize.query('DESCRIBE users');
        userTableDesc.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} (${col.Key})`);
        });

        // 查看test_parent用户的信息
        console.log('\n👤 test_parent用户信息:');
        const [userInfo] = await sequelize.query(`
            SELECT * FROM users WHERE id = ?
        `, {
            replacements: [userId]
        });
        console.log(userInfo);

        // 检查用户角色关联表
        console.log('\n🔍 检查用户角色关联...');

        // 尝试不同的表名
        const possibleTables = [
            'user_roles',
            'userrole',
            'role_user',
            'user_role'
        ];

        let userRolesTable = null;
        for (const tableName of possibleTables) {
            try {
                const [tableCheck] = await sequelize.query(`
                    SELECT COUNT(*) as count FROM ${tableName} WHERE user_id = ?
                `, {
                    replacements: [userId]
                });
                if (tableCheck[0].count > 0) {
                    userRolesTable = tableName;
                    console.log(`✅ 找到用户角色表: ${tableName}`);
                    break;
                }
            } catch (error) {
                // 表不存在，继续尝试下一个
            }
        }

        if (userRolesTable) {
            const [userRoles] = await sequelize.query(`
                SELECT * FROM ${userRolesTable} WHERE user_id = ?
            `, {
                replacements: [userId]
            });
            console.log('用户角色关联:', userRoles);

            // 验证权限查询
            console.log('\n🔍 验证权限查询SQL...');
            const [permissionCheck] = await sequelize.query(`
                SELECT COUNT(*) as count
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                INNER JOIN ${userRolesTable} ur ON rp.role_id = ur.role_id
                WHERE p.code = 'KINDERGARTEN_VIEW' AND ur.user_id = ?
            `, {
                replacements: [userId]
            });
            console.log('权限检查结果:', permissionCheck);
        }

    } catch (error) {
        console.error('❌ 检查失败:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkUserPermissions();