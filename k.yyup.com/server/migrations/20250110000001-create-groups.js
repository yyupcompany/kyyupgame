'use strict';

/**
 * 创建集团表 (groups)
 * 用于存储集团基本信息
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('groups', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '集团ID'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '集团名称'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '集团编码'
      },
      type: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '集团类型: 1-教育集团 2-连锁品牌 3-投资集团'
      },
      
      // 法人信息
      legal_person: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '法人代表'
      },
      registered_capital: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: '注册资本(元)'
      },
      business_license: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '营业执照号'
      },
      established_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: '成立日期'
      },
      
      // 联系信息
      address: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: '总部地址'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '联系电话'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '联系邮箱'
      },
      website: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: '官方网站'
      },
      
      // 品牌信息
      logo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '集团Logo URL'
      },
      brand_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '品牌名称'
      },
      slogan: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: '品牌口号'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '集团简介'
      },
      vision: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '愿景使命'
      },
      culture: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '企业文化'
      },
      
      // 管理信息
      chairman: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '董事长'
      },
      ceo: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'CEO/总经理'
      },
      investor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '主要投资人用户ID',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      
      // 统计字段 (冗余字段,提升查询性能)
      kindergarten_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '园所数量'
      },
      total_students: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '总学生数'
      },
      total_teachers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '总教师数'
      },
      total_classes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '总班级数'
      },
      total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '总容量'
      },
      
      // 财务统计 (可选)
      annual_revenue: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: '年度收入(元)'
      },
      annual_profit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: '年度利润(元)'
      },
      
      // 状态和审计
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '状态: 0-禁用 1-正常 2-审核中'
      },
      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '创建人ID',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updater_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '更新人ID',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      comment: '集团表'
    });

    // 创建索引
    await queryInterface.addIndex('groups', ['code'], {
      name: 'idx_groups_code',
      unique: true
    });

    await queryInterface.addIndex('groups', ['investor_id'], {
      name: 'idx_groups_investor'
    });

    await queryInterface.addIndex('groups', ['status'], {
      name: 'idx_groups_status'
    });

    await queryInterface.addIndex('groups', ['created_at'], {
      name: 'idx_groups_created_at'
    });

    console.log('✅ 集团表 (groups) 创建成功');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('groups');
    console.log('✅ 集团表 (groups) 已删除');
  }
};

