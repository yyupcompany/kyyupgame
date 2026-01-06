'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 检查表是否已存在
    const tables = await queryInterface.showAllTables();

    // 创建话术分类表
    if (!tables.includes('script_categories')) {
      await queryInterface.createTable('script_categories', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '分类ID'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '分类名称'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '分类描述'
      },
      type: {
        type: Sequelize.ENUM('enrollment', 'phone', 'reception', 'followup', 'consultation', 'objection'),
        allowNull: false,
        comment: '话术类型'
      },
      color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '分类颜色'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '分类图标'
      },
      sort: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'draft'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态'
      },
      creator_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '创建者ID'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, {
      comment: '话术分类表'
    });
    }

    // 创建话术表
    if (!tables.includes('scripts')) {
      await queryInterface.createTable('scripts', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '话术ID'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '话术标题'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '话术内容'
      },
      category_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '分类ID'
      },
      type: {
        type: Sequelize.ENUM('enrollment', 'phone', 'reception', 'followup', 'consultation', 'objection'),
        allowNull: false,
        comment: '话术类型'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]',
        comment: '标签'
      },
      keywords: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]',
        comment: '关键词'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '话术描述'
      },
      usage_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '使用次数'
      },
      effective_score: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        comment: '效果评分'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'draft'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态'
      },
      is_template: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否为模板'
      },
      variables: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '变量配置'
      },
      creator_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '创建者ID'
      },
      updater_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '更新者ID'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, {
      comment: '话术模板表'
    });
    }

    // 创建话术使用记录表
    if (!tables.includes('script_usages')) {
      await queryInterface.createTable('script_usages', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '使用记录ID'
      },
      script_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '话术ID'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '用户ID'
      },
      usage_context: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: '使用场景'
      },
      effective_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '效果评分 1-5'
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '使用反馈'
      },
      usage_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: '使用时间'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, {
      comment: '话术使用记录表'
    });
    }

    // 添加索引 (先检查是否存在)
    const categoryIndexes = await queryInterface.showIndex('script_categories');
    const categoryIndexNames = categoryIndexes.map(idx => idx.name);

    if (!categoryIndexNames.includes('script_categories_type_idx')) {
      await queryInterface.addIndex('script_categories', ['type'], {
        name: 'script_categories_type_idx'
      });
    }
    if (!categoryIndexNames.includes('script_categories_status_idx')) {
      await queryInterface.addIndex('script_categories', ['status'], {
        name: 'script_categories_status_idx'
      });
    }
    if (!categoryIndexNames.includes('script_categories_sort_idx')) {
      await queryInterface.addIndex('script_categories', ['sort'], {
        name: 'script_categories_sort_idx'
      });
    }

    const scriptIndexes = await queryInterface.showIndex('scripts');
    const scriptIndexNames = scriptIndexes.map(idx => idx.name);

    if (!scriptIndexNames.includes('scripts_category_id_idx')) {
      await queryInterface.addIndex('scripts', ['category_id'], {
        name: 'scripts_category_id_idx'
      });
    }
    if (!scriptIndexNames.includes('scripts_type_idx')) {
      await queryInterface.addIndex('scripts', ['type'], {
        name: 'scripts_type_idx'
      });
    }
    if (!scriptIndexNames.includes('scripts_status_idx')) {
      await queryInterface.addIndex('scripts', ['status'], {
        name: 'scripts_status_idx'
      });
    }
    if (!scriptIndexNames.includes('scripts_usage_count_idx')) {
      await queryInterface.addIndex('scripts', ['usage_count'], {
        name: 'scripts_usage_count_idx'
      });
    }
    if (!scriptIndexNames.includes('scripts_effective_score_idx')) {
      await queryInterface.addIndex('scripts', ['effective_score'], {
        name: 'scripts_effective_score_idx'
      });
    }

    const usageIndexes = await queryInterface.showIndex('script_usages');
    const usageIndexNames = usageIndexes.map(idx => idx.name);

    if (!usageIndexNames.includes('script_usages_script_id_idx')) {
      await queryInterface.addIndex('script_usages', ['script_id'], {
        name: 'script_usages_script_id_idx'
      });
    }
    if (!usageIndexNames.includes('script_usages_user_id_idx')) {
      await queryInterface.addIndex('script_usages', ['user_id'], {
        name: 'script_usages_user_id_idx'
      });
    }
    if (!usageIndexNames.includes('script_usages_usage_date_idx')) {
      await queryInterface.addIndex('script_usages', ['usage_date'], {
        name: 'script_usages_usage_date_idx'
      });
    }
    if (!usageIndexNames.includes('script_usages_effective_rating_idx')) {
      await queryInterface.addIndex('script_usages', ['effective_rating'], {
        name: 'script_usages_effective_rating_idx'
      });
    }

    // 添加外键约束 (先检查是否存在)
    const scriptConstraints = await queryInterface.getForeignKeyReferencesForTable('scripts');
    const scriptConstraintNames = scriptConstraints.map(c => c.constraintName);

    if (!scriptConstraintNames.includes('fk_scripts_category_id')) {
      await queryInterface.addConstraint('scripts', {
        fields: ['category_id'],
        type: 'foreign key',
        name: 'fk_scripts_category_id',
        references: {
          table: 'script_categories',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }

    const usageConstraints = await queryInterface.getForeignKeyReferencesForTable('script_usages');
    const usageConstraintNames = usageConstraints.map(c => c.constraintName);

    if (!usageConstraintNames.includes('fk_script_usages_script_id')) {
      await queryInterface.addConstraint('script_usages', {
        fields: ['script_id'],
        type: 'foreign key',
        name: 'fk_script_usages_script_id',
        references: {
          table: 'scripts',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }

    if (!usageConstraintNames.includes('fk_script_usages_user_id')) {
      await queryInterface.addConstraint('script_usages', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'fk_script_usages_user_id',
        references: {
          table: 'users',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 删除外键约束
    await queryInterface.removeConstraint('script_usages', 'fk_script_usages_user_id');
    await queryInterface.removeConstraint('script_usages', 'fk_script_usages_script_id');
    await queryInterface.removeConstraint('scripts', 'fk_scripts_category_id');

    // 删除表
    await queryInterface.dropTable('script_usages');
    await queryInterface.dropTable('scripts');
    await queryInterface.dropTable('script_categories');
  }
};
