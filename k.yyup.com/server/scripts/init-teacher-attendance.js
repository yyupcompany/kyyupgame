/**
 * 初始化教师考勤表
 * 这个脚本会创建teacher_attendances表并插入一些测试数据
 */

const { sequelize } = require('../dist/init');
const { TeacherAttendance } = require('../dist/models');

async function initTeacherAttendance() {
  try {
    console.log('🔄 开始初始化教师考勤表...');
    
    // 1. 同步表结构（创建表）
    console.log('📋 正在创建teacher_attendances表...');
    await TeacherAttendance.sync({ force: false }); // force: false 表示不删除已有数据
    console.log('✅ teacher_attendances表创建成功');
    
    // 2. 检查表是否存在
    const tableExists = await sequelize.query(
      "SHOW TABLES LIKE 'teacher_attendances'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (tableExists.length > 0) {
      console.log('✅ 表已存在，验证表结构...');
      
      // 查看表结构
      const [results] = await sequelize.query('DESCRIBE teacher_attendances');
      console.log('📊 表结构:');
      console.table(results);
      
      // 3. 插入测试数据（可选）
      const count = await TeacherAttendance.count();
      console.log(`📊 当前记录数: ${count}`);
      
      if (count === 0) {
        console.log('📝 插入测试数据...');
        
        // 获取第一个教师
        const { Teacher } = require('../dist/models');
        const teacher = await Teacher.findOne();
        
        if (teacher) {
          // 创建今天的考勤记录
          const today = new Date().toISOString().split('T')[0];
          await TeacherAttendance.create({
            teacherId: teacher.id,
            userId: teacher.userId,
            kindergartenId: teacher.kindergartenId,
            attendanceDate: today,
            status: 'present',
            checkInTime: '08:30:00',
            isApproved: true,
          });
          
          console.log('✅ 测试数据插入成功');
        } else {
          console.log('⚠️  没有找到教师数据，跳过测试数据插入');
        }
      }
    } else {
      console.log('❌ 表创建失败');
    }
    
    console.log('✅ 教师考勤表初始化完成');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('✅ 数据库连接已关闭');
  }
}

// 执行初始化
initTeacherAttendance()
  .then(() => {
    console.log('🎉 初始化成功完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 初始化失败:', error);
    process.exit(1);
  });

