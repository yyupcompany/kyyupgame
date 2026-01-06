const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

async function quickAddDashboardGuide() {
  let sequelize;
  
  try {
    console.log('🔗 连接远程数据库...');
    
    // 创建Sequelize实例
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 定义PageGuide模型
    const PageGuide = sequelize.define('page_guides', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      pagePath: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'page_path'
      },
      pageName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'page_name'
      },
      pageDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'page_description'
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      importance: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5
      },
      relatedTables: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'related_tables'
      },
      contextPrompt: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'context_prompt'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      }
    }, {
      tableName: 'page_guides',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    console.log('📝 添加仪表板中心页面说明文档...');

    // 检查是否已存在
    const existing = await PageGuide.findOne({
      where: { pagePath: '/centers/dashboard' }
    });

    if (existing) {
      console.log('📋 记录已存在，更新数据...');
      await existing.update({
        pageName: '仪表板中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        category: '中心页面',
        importance: 9,
        relatedTables: ['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics'],
        contextPrompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
        isActive: true
      });
      console.log('✅ 记录更新成功');
    } else {
      console.log('📋 创建新记录...');
      await PageGuide.create({
        pagePath: '/centers/dashboard',
        pageName: '仪表板中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        category: '中心页面',
        importance: 9,
        relatedTables: ['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics'],
        contextPrompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
        isActive: true
      });
      console.log('✅ 记录创建成功');
    }

    // 验证数据
    const result = await PageGuide.findOne({
      where: { pagePath: '/centers/dashboard' }
    });

    if (result) {
      console.log('🔍 验证结果:');
      console.log(`  - 路径: ${result.pagePath}`);
      console.log(`  - 名称: ${result.pageName}`);
      console.log(`  - 分类: ${result.category}`);
      console.log(`  - 重要性: ${result.importance}`);
      console.log(`  - 是否启用: ${result.isActive}`);
      console.log('✅ 仪表板中心页面说明文档添加完成！');
    } else {
      console.log('❌ 验证失败，数据未找到');
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    if (error.original) {
      console.error('原始错误:', error.original.message);
    }
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('🔗 数据库连接已关闭');
    }
  }
}

// 执行脚本
quickAddDashboardGuide();
