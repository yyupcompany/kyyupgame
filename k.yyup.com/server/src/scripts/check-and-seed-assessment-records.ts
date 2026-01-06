import { Sequelize } from 'sequelize';
import { AssessmentRecord } from '../models/assessment-record.model';
import { AssessmentConfig } from '../models/assessment-config.model';
import { Parent } from '../models/parent.model';
import { Student } from '../models/student.model';
import { User } from '../models/user.model';
import { initModels } from '../models';

/**
 * 检查评估数据并生成演示数据
 */
export async function checkAndSeedAssessmentRecords() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'kargerdensales',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      dialect: 'mysql',
      logging: false,
    }
  );

  try {
    // 初始化模型
    initModels(sequelize);
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 1. 检查assessment_configs表数据
    const configCount = await AssessmentConfig.count();
    console.log(`📊 assessment_configs: ${configCount} 条记录`);

    // 2. 检查assessment_records表数据
    const recordCount = await AssessmentRecord.count();
    console.log(`📊 assessment_records: ${recordCount} 条记录`);

    if (recordCount > 0) {
      console.log('✅ 已有评估记录数据，无需生成演示数据');
      await sequelize.close();
      return;
    }

    // 3. 获取现有家长、学生、用户数据
    // Parent模型没有phone字段，phone在User模型中
    const parents = await Parent.findAll({
      attributes: ['id', 'userId', 'studentId', 'relationship'],
      limit: 50,
    });

    const students = await Student.findAll({
      attributes: ['id', 'name', 'gender'],
      limit: 50,
    });

    const users = await User.findAll({
      attributes: ['id', 'username', 'phone'],
      limit: 50,
    });

    console.log(`👪 找到 ${parents.length} 个家长`);
    console.log(`👦 找到 ${students.length} 个学生`);
    console.log(`👤 找到 ${users.length} 个用户`);

    if (configCount === 0) {
      console.log('⚠️  没有评估配置数据，请先运行 assessment config seeder');
      await sequelize.close();
      return;
    }

    // 4. 获取评估配置
    const configs = await AssessmentConfig.findAll();
    console.log(`📋 加载了 ${configs.length} 个评估配置`);

    // 5. 生成演示评估记录
    const demoRecords: any[] = [];
    const now = new Date();
    const statuses: Array<'in_progress' | 'completed'> = ['in_progress', 'completed'];
    const genders: Array<'male' | 'female'> = ['male', 'female'];

    // 生成50条演示记录
    for (let i = 0; i < 50; i++) {
      const config = configs[Math.floor(Math.random() * configs.length)];
      const parent = parents[Math.floor(Math.random() * parents.length)] || parents[0];
      const student = students[Math.floor(Math.random() * students.length)] || students[0];
      const user = users[Math.floor(Math.random() * users.length)] || users[0];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];

      // 计算测评开始时间（过去3个月内）
      const daysAgo = Math.floor(Math.random() * 90);
      const startTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // 结束时间（如果完成了）
      const endTime = status === 'completed'
        ? new Date(startTime.getTime() + Math.floor(Math.random() * 60 + 20) * 60 * 1000) // 20-80分钟后完成
        : null;

      // 生成分数（如果完成了）
      const totalScore = status === 'completed' ? Math.floor(Math.random() * 40 + 60) : null; // 60-100分
      const maxScore = status === 'completed' ? 100 : null;

      // 生成维度分数
      const dimensionScores = status === 'completed' ? {
        attention: Math.floor(Math.random() * 40 + 60),
        memory: Math.floor(Math.random() * 40 + 60),
        logic: Math.floor(Math.random() * 40 + 60),
        language: Math.floor(Math.random() * 40 + 60),
        motor: Math.floor(Math.random() * 40 + 60),
        social: Math.floor(Math.random() * 40 + 60),
      } : null;

      // 计算发育商（仅完成的有）
      const developmentQuotient = status === 'completed' && totalScore
        ? parseFloat((totalScore + Math.random() * 10 - 5).toFixed(2))
        : null;

      // 根据年龄段计算childAge
      const childAge = config.minAge + Math.floor(Math.random() * (config.maxAge - config.minAge));

      // 生成记录号
      const recordNo = `AS${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`;

      // phone从user获取，parent通过userId关联到user
      const parentUser = users.find(u => u.id === parent?.userId) || user;

      demoRecords.push({
        recordNo,
        configId: config.id,
        childName: student?.name || `儿童${i + 1}`,
        childAge,
        childGender: gender,
        parentId: parent?.id,
        studentId: student?.id,
        userId: parent?.userId || user?.id,
        phone: parentUser?.phone,
        status,
        startTime,
        endTime,
        totalScore,
        maxScore,
        dimensionScores,
        developmentQuotient,
        createdAt: startTime,
        updatedAt: endTime || startTime,
      });
    }

    // 6. 批量插入演示数据
    console.log(`📝 正在插入 ${demoRecords.length} 条演示评估记录...`);
    await AssessmentRecord.bulkCreate(demoRecords);
    console.log(`✅ 成功插入 ${demoRecords.length} 条演示评估记录`);

    // 7. 验证数据
    const newRecordCount = await AssessmentRecord.count();
    const completedCount = await AssessmentRecord.count({ where: { status: 'completed' } });
    const inProgressCount = await AssessmentRecord.count({ where: { status: 'in_progress' } });

    console.log('');
    console.log('📊 评估数据统计：');
    console.log(`   总记录数: ${newRecordCount}`);
    console.log(`   已完成: ${completedCount}`);
    console.log(`   进行中: ${inProgressCount}`);
    console.log(`   完成率: ${newRecordCount > 0 ? ((completedCount / newRecordCount) * 100).toFixed(2) : 0}%`);

    await sequelize.close();
    console.log('✅ 脚本执行完成');

  } catch (error) {
    console.error('❌ 错误:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkAndSeedAssessmentRecords()
    .then(() => {
      console.log('✅ 演示数据生成完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 生成失败:', error);
      process.exit(1);
    });
}
