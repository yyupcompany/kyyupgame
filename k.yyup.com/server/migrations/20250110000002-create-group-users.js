'use strict';

/**
 * 创建集团用户关联表 (group_users)
 * 用于管理集团级用户权限
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '主键ID'
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '集团ID',
        references: {
          model: 'groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '用户ID',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.TINYINT,
        allowNull: false,
        comment: '集团角色: 1-投资人 2-集团管理员 3-财务总监 4-运营总监 5-人力总监'
      },
      
      // 权限配置
      permissions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '权限配置 (JSON格式)'
      },
      can_view_all_kindergartens: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '可查看所有园所: 0-否 1-是'
      },
      can_manage_kindergartens: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '可管理园所: 0-否 1-是'
      },
      can_view_finance: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '可查看财务: 0-否 1-是'
      },
      can_manage_finance: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '可管理财务: 0-否 1-是'
      },
      
      // 备注
      remark: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '备注'
      },
      
      // 状态和审计
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '状态: 0-禁用 1-正常'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: '更新时间'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '软删除时间'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: '集团用户关联表'
    });

    // 创建唯一索引 (group_id + user_id + deleted_at)
    await queryInterface.addIndex('group_users', ['group_id', 'user_id', 'deleted_at'], {
      name: 'uk_group_user',
      unique: true
    });

    // 创建普通索引
    await queryInterface.addIndex('group_users', ['user_id'], {
      name: 'idx_group_users_user'
    });

    await queryInterface.addIndex('group_users', ['role'], {
      name: 'idx_group_users_role'
    });

    await queryInterface.addIndex('group_users', ['status'], {
      name: 'idx_group_users_status'
    });

    console.log('✅ 集团用户关联表 (group_users) 创建成功');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_users');
    console.log('✅ 集团用户关联表 (group_users) 已删除');
  }
};

