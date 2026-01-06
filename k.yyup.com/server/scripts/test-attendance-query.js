const { Sequelize, DataTypes, Op } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log,
});

// 定义 Attendance 模型
const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id',
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'class_id',
  },
  kindergartenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'kindergarten_id',
  },
  attendanceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'attendance_date',
  },
  status: {
    type: DataTypes.ENUM(
      'present',
      'absent',
      'late',
      'early_leave',
      'sick_leave',
      'personal_leave',
      'excused'
    ),
    allowNull: false,
    defaultValue: 'present',
  },
}, {
  tableName: 'attendances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

async function testQuery() {
  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 测试1: 基本查询（无日期过滤）
    console.log('=== 测试1: 基本查询（无日期过滤） ===');
    const where1 = { kindergartenId: 1 };
    console.log('where:', JSON.stringify(where1));
    
    try {
      const result1 = await Attendance.findAndCountAll({
        where: where1,
        limit: 10,
        offset: 0,
      });
      console.log('✅ 查询成功，返回', result1.count, '条记录\n');
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
      console.error('错误堆栈:', error.stack);
      console.log('');
    }

    // 测试2: 带日期过滤（使用 Op.between）
    console.log('=== 测试2: 带日期过滤（使用 Op.between） ===');
    const where2 = {
      kindergartenId: 1,
      attendanceDate: {
        [Op.between]: ['2025-10-11', '2025-10-11'],
      },
    };
    console.log('where:', JSON.stringify(where2, null, 2));
    
    try {
      const result2 = await Attendance.findAndCountAll({
        where: where2,
        limit: 10,
        offset: 0,
      });
      console.log('✅ 查询成功，返回', result2.count, '条记录\n');
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
      console.error('错误堆栈:', error.stack);
      console.log('');
    }

    // 测试3: 带日期过滤（使用 Op.gte）
    console.log('=== 测试3: 带日期过滤（使用 Op.gte） ===');
    const where3 = {
      kindergartenId: 1,
      attendanceDate: {
        [Op.gte]: '2025-10-11',
      },
    };
    console.log('where:', JSON.stringify(where3, null, 2));
    
    try {
      const result3 = await Attendance.findAndCountAll({
        where: where3,
        limit: 10,
        offset: 0,
      });
      console.log('✅ 查询成功，返回', result3.count, '条记录\n');
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
      console.error('错误堆栈:', error.stack);
      console.log('');
    }

    // 测试4: 带空对象的日期过滤（模拟错误情况）
    console.log('=== 测试4: 带空对象的日期过滤（模拟错误情况） ===');
    const where4 = {
      kindergartenId: 1,
      attendanceDate: {},
    };
    console.log('where:', JSON.stringify(where4, null, 2));
    
    try {
      const result4 = await Attendance.findAndCountAll({
        where: where4,
        limit: 10,
        offset: 0,
      });
      console.log('✅ 查询成功，返回', result4.count, '条记录\n');
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
      console.error('错误类型:', error.constructor.name);
      console.log('');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

testQuery();

