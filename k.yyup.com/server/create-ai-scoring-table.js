const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kindergarten_management', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 创建document_ai_scores表
    await sequelize.getQueryInterface().createTable('document_ai_scores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      document_instance_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      document_template_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      template_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      template_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      prompt_version: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'v1.0'
      },
      ai_model: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'doubao-1.6-flash'
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      grade: {
        type: Sequelize.ENUM('excellent', 'good', 'average', 'poor', 'unqualified'),
        allowNull: true
      },
      analysis_result: {
        type: Sequelize.JSON,
        allowNull: false
      },
      category_scores: {
        type: Sequelize.JSON,
        allowNull: true
      },
      suggestions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      risks: {
        type: Sequelize.JSON,
        allowNull: true
      },
      highlights: {
        type: Sequelize.JSON,
        allowNull: true
      },
      processing_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('completed', 'failed'),
        allowNull: false,
        defaultValue: 'completed'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
    
    console.log('✅ document_ai_scores 表创建成功');
    
    // 添加索引
    await sequelize.getQueryInterface().addIndex('document_ai_scores', ['document_instance_id', 'created_at'], {
      name: 'idx_document_instance'
    });
    
    await sequelize.getQueryInterface().addIndex('document_ai_scores', ['document_template_id', 'created_at'], {
      name: 'idx_document_template'
    });
    
    await sequelize.getQueryInterface().addIndex('document_ai_scores', ['created_by', 'created_at'], {
      name: 'idx_created_by'
    });
    
    await sequelize.getQueryInterface().addIndex('document_ai_scores', ['template_type'], {
      name: 'idx_template_type'
    });
    
    console.log('✅ 索引创建成功');
    
    // 验证表是否创建成功
    const tables = await sequelize.getQueryInterface().showAllTables();
    if (tables.includes('document_ai_scores')) {
      console.log('✅ 验证成功：document_ai_scores 表已存在');
    }
    
    console.log('🎉 AI评分表创建完成！');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
})();

