const { Sequelize, DataTypes } = require('sequelize');

async function fixParentPermission() {
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

        // 查找家长角色
        const [roleResults] = await sequelize.query(`
            SELECT id, name, code FROM roles WHERE code = 'parent'
        `);

        if (roleResults.length === 0) {
            console.log('❌ 未找到家长角色');
            return;
        }

        const parentRole = roleResults[0];
        console.log(`✅ 找到家长角色: ${parentRole.name} (ID: ${parentRole.id})`);

        // 查找KINDERGARTEN_VIEW权限，如果不存在则创建
        let [permissionResults] = await sequelize.query(`
            SELECT id, name, code FROM permissions WHERE code = 'KINDERGARTEN_VIEW'
        `);

        let kindergartenViewPermission;
        if (permissionResults.length === 0) {
            console.log('🔧 创建KINDERGARTEN_VIEW权限');
            const insertResult = await sequelize.query(`
                INSERT INTO permissions (name, code, description, created_at, updated_at)
                VALUES ('查看幼儿园信息', 'KINDERGARTEN_VIEW', '查看幼儿园基本信息', NOW(), NOW())
            `, {
                type: Sequelize.QueryTypes.INSERT
            });
            // 重新查询获取插入的ID
            const [newPermission] = await sequelize.query(`
                SELECT id, name, code FROM permissions WHERE code = 'KINDERGARTEN_VIEW'
            `);
            kindergartenViewPermission = newPermission[0];
            console.log(`✅ 创建权限成功，ID: ${kindergartenViewPermission.id}`);
        } else {
            kindergartenViewPermission = permissionResults[0];
            console.log(`✅ 找到KINDERGARTEN_VIEW权限，ID: ${kindergartenViewPermission.id}`);
        }

        // 为家长角色添加权限
        const [existingPermission] = await sequelize.query(`
            SELECT * FROM role_permissions
            WHERE role_id = ? AND permission_id = ?
        `, {
            replacements: [parentRole.id, kindergartenViewPermission.id]
        });

        if (existingPermission.length === 0) {
            console.log('🔧 为家长角色添加KINDERGARTEN_VIEW权限');
            await sequelize.query(`
                INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
                VALUES (?, ?, NOW(), NOW())
            `, {
                replacements: [parentRole.id, kindergartenViewPermission.id]
            });
            console.log('✅ 权限添加成功');
        } else {
            console.log('✅ 家长角色已有KINDERGARTEN_VIEW权限');
        }

        console.log('🎉 家长权限修复完成！');

        // 验证权限设置
        console.log('\n🔍 验证权限设置...');
        const [verifyPermissions] = await sequelize.query(`
            SELECT p.code as permission_code, r.code as role_code, ur.user_id
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            INNER JOIN roles r ON rp.role_id = r.id
            LEFT JOIN user_roles ur ON rp.role_id = ur.role_id AND ur.user_id = ?
            WHERE p.code = 'KINDERGARTEN_VIEW' AND r.code = 'parent'
        `, {
            replacements: [8] // test_parent用户ID
        });

        console.log('权限验证结果:', verifyPermissions);

    } catch (error) {
        console.error('❌ 修复失败:', error.message);
    } finally {
        await sequelize.close();
    }
}

fixParentPermission();