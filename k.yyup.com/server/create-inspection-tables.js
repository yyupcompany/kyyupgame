/**
 * 临时脚本：创建督查中心相关的数据表
 * 使用Sequelize Sync功能自动创建表
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5l57j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    timezone: '+08:00',
    logging: console.log
  }
);

// 定义检查记录表
const InspectionRecord = sequelize.define('inspection_records', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  inspectionPlanId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'inspection_plan_id',
  },
  checkDate: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    field: 'check_date',
  },
  checkerId: {
    type: Sequelize.INTEGER,
    field: 'checker_id',
  },
  checkerName: {
    type: Sequelize.STRING(100),
    field: 'checker_name',
  },
  totalScore: {
    type: Sequelize.DECIMAL(5, 2),
    field: 'total_score',
    defaultValue: 0,
  },
  grade: {
    type: Sequelize.STRING(20),
  },
  summary: {
    type: Sequelize.TEXT,
  },
  suggestions: {
    type: Sequelize.TEXT,
  },
  attachments: {
    type: Sequelize.JSON,
  },
  checkerSignature: {
    type: Sequelize.STRING(500),
    field: 'checker_signature',
  },
  createdBy: {
    type: Sequelize.INTEGER,
    field: 'created_by',
  },
}, {
  tableName: 'inspection_records',
  timestamps: true,
  underscored: true,
});

// 定义检查项明细表
const InspectionRecordItem = sequelize.define('inspection_record_items', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  recordId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'record_id',
  },
  itemName: {
    type: Sequelize.STRING(200),
    allowNull: false,
    field: 'item_name',
  },
  itemCategory: {
    type: Sequelize.STRING(100),
    field: 'item_category',
  },
  status: {
    type: Sequelize.ENUM('pass', 'warning', 'fail'),
    allowNull: false,
    defaultValue: 'pass',
  },
  score: {
    type: Sequelize.DECIMAL(5, 2),
  },
  maxScore: {
    type: Sequelize.DECIMAL(5, 2),
    field: 'max_score',
  },
  problemDescription: {
    type: Sequelize.TEXT,
    field: 'problem_description',
  },
  photos: {
    type: Sequelize.JSON,
  },
  notes: {
    type: Sequelize.TEXT,
  },
  sortOrder: {
    type: Sequelize.INTEGER,
    field: 'sort_order',
    defaultValue: 0,
  },
}, {
  tableName: 'inspection_record_items',
  timestamps: true,
  underscored: true,
});

// 定义整改任务表
const InspectionRectification = sequelize.define('inspection_rectifications', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  inspectionPlanId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'inspection_plan_id',
  },
  recordId: {
    type: Sequelize.INTEGER,
    field: 'record_id',
  },
  recordItemId: {
    type: Sequelize.INTEGER,
    field: 'record_item_id',
  },
  problemDescription: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'problem_description',
  },
  problemSeverity: {
    type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium',
    field: 'problem_severity',
  },
  rectificationMeasures: {
    type: Sequelize.TEXT,
    field: 'rectification_measures',
  },
  responsiblePersonId: {
    type: Sequelize.INTEGER,
    field: 'responsible_person_id',
  },
  responsiblePersonName: {
    type: Sequelize.STRING(100),
    field: 'responsible_person_name',
  },
  deadline: {
    type: Sequelize.DATEONLY,
  },
  status: {
    type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'verified', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  progress: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  completionDate: {
    type: Sequelize.DATEONLY,
    field: 'completion_date',
  },
  completionDescription: {
    type: Sequelize.TEXT,
    field: 'completion_description',
  },
  completionPhotos: {
    type: Sequelize.JSON,
    field: 'completion_photos',
  },
  verifierId: {
    type: Sequelize.INTEGER,
    field: 'verifier_id',
  },
  verifierName: {
    type: Sequelize.STRING(100),
    field: 'verifier_name',
  },
  verificationDate: {
    type: Sequelize.DATEONLY,
    field: 'verification_date',
  },
  verificationResult: {
    type: Sequelize.TEXT,
    field: 'verification_result',
  },
  verificationStatus: {
    type: Sequelize.ENUM('pass', 'fail', 'pending'),
    field: 'verification_status',
  },
  notes: {
    type: Sequelize.TEXT,
  },
  createdBy: {
    type: Sequelize.INTEGER,
    field: 'created_by',
  },
}, {
  tableName: 'inspection_rectifications',
  timestamps: true,
  underscored: true,
});

// 定义整改进度日志表
const RectificationProgressLog = sequelize.define('rectification_progress_logs', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rectificationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'rectification_id',
  },
  logDate: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    field: 'log_date',
  },
  progress: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
  },
  photos: {
    type: Sequelize.JSON,
  },
  operatorId: {
    type: Sequelize.INTEGER,
    field: 'operator_id',
  },
  operatorName: {
    type: Sequelize.STRING(100),
    field: 'operator_name',
  },
}, {
  tableName: 'rectification_progress_logs',
  timestamps: false,
  underscored: true,
});

// 执行同步
async function createTables() {
  try {
    console.log('🔌 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('\n📋 开始创建表...');
    
    // 按顺序创建表（考虑外键依赖）
    console.log('\n1️⃣ 创建 inspection_records 表...');
    await InspectionRecord.sync({ force: false });
    console.log('✅ inspection_records 表创建成功');

    console.log('\n2️⃣ 创建 inspection_record_items 表...');
    await InspectionRecordItem.sync({ force: false });
    console.log('✅ inspection_record_items 表创建成功');

    console.log('\n3️⃣ 创建 inspection_rectifications 表...');
    await InspectionRectification.sync({ force: false });
    console.log('✅ inspection_rectifications 表创建成功');

    console.log('\n4️⃣ 创建 rectification_progress_logs 表...');
    await RectificationProgressLog.sync({ force: false });
    console.log('✅ rectification_progress_logs 表创建成功');

    console.log('\n🎉 所有表创建完成！');

    // 验证表创建
    console.log('\n📊 验证表结构...');
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_COMMENT, CREATE_TIME
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (
          'inspection_records',
          'inspection_record_items', 
          'inspection_rectifications',
          'rectification_progress_logs'
        )
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n✅ 表验证结果:');
    console.table(results);

  } catch (error) {
    console.error('❌ 创建表失败:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 执行
createTables()
  .then(() => {
    console.log('\n✅ 脚本执行成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });

