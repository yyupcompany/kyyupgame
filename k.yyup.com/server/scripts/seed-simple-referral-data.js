/**
 * 简化版转介绍演示数据种子脚本
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// 颜色输出函数
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

class SimpleReferralDataSeeder {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
      }
    );
  }

  async seed() {
    console.log(colors.cyan('🚀 开始生成简化版转介绍演示数据...'));

    try {
      await this.sequelize.authenticate();
      console.log(colors.green('✅ 数据库连接成功'));

      // 获取现有数据
      const [teachers] = await this.sequelize.query('SELECT id FROM teachers LIMIT 10');
      const [parents] = await this.sequelize.query('SELECT id FROM parents LIMIT 50');
      const [activities] = await this.sequelize.query('SELECT id FROM activities LIMIT 10');
      const [students] = await this.sequelize.query('SELECT id FROM students LIMIT 20');

      console.log(colors.blue(`📊 基础数据: 老师${teachers.length}人, 家长${parents.length}人, 活动${activities.length}个, 学生${students.length}人`));

      if (teachers.length === 0 || parents.length === 0) {
        throw new Error('基础数据不足，请先运行基础数据种子脚本');
      }

      // 生成转介绍数据
      await this.generateSimpleReferralData(teachers, parents, activities, students);

      console.log(colors.green('🎉 转介绍演示数据生成完成！'));

    } catch (error) {
      console.error(colors.red('❌ 数据生成失败:'), error);
      throw error;
    } finally {
      await this.sequelize.close();
    }
  }

  async generateSimpleReferralData(teachers, parents, activities, students) {
    console.log(colors.yellow('📋 开始生成转介绍数据...'));

    let referralCount = 0;
    let rewardCount = 0;

    // 生成30个转介绍案例
    for (let i = 0; i < 30; i++) {
      const isTeacherReferral = Math.random() < 0.5;
      const referrer = isTeacherReferral
        ? teachers[Math.floor(Math.random() * teachers.length)]
        : parents[Math.floor(Math.random() * parents.length)];

      const activity = activities[Math.floor(Math.random() * activities.length)];
      const student = students[Math.floor(Math.random() * students.length)];

      const referralId = `ref_${Date.now()}_${i}`;
      const referralCode = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const rewardAmount = isTeacherReferral
        ? (Math.random() < 0.5 ? 500 : 200)
        : 300;

      try {
        // 插入转介绍关系
        await this.sequelize.query(`
          INSERT INTO referral_relationships
          (id, activity_id, referrer_id, referee_id, referral_code, status, reward_amount, created_at, completed_at, rewarded_at)
          VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW(), NOW(), NOW())
        `, {
          replacements: [referralId, activity.id, referrer.id, student.id, referralCode, rewardAmount]
        });

        referralCount++;

        // 插入奖励记录
        const rewardType = isTeacherReferral
          ? (rewardAmount === 500 ? 'direct_deal' : 'referral_teacher')
          : 'referral_parent';

        await this.sequelize.query(`
          INSERT INTO referral_rewards
          (id, referral_id, reward_type, reward_amount, status, issued_at, created_at, description)
          VALUES (?, ?, 'cash', ?, 'issued', NOW(), NOW(), ?)
        `, {
          replacements: [`reward_${referralId}`, referralId, rewardAmount, `${isTeacherReferral ? '老师' : '家长'}转介绍奖励`]
        });

        rewardCount++;

        if ((i + 1) % 5 === 0) {
          console.log(colors.cyan(`   已生成 ${i + 1}/30 条数据`));
        }

      } catch (error) {
        console.log(colors.red(`❌ 第${i + 1}条数据插入失败: ${error.message}`));
      }
    }

    console.log(colors.green(`✅ 数据插入完成: 转介绍关系${referralCount}条, 奖励记录${rewardCount}条`));

    // 查询最终统计
    const [finalReferralCount] = await this.sequelize.query('SELECT COUNT(*) as count FROM referral_relationships');
    const [finalRewardCount] = await this.sequelize.query('SELECT COUNT(*) as count FROM referral_rewards');

    console.log(colors.blue('\n📊 最终数据统计:'));
    console.log(`   - 转介绍关系总数: ${finalReferralCount[0].count} 条`);
    console.log(`   - 转介绍奖励总数: ${finalRewardCount[0].count} 条`);
  }
}

// 执行数据生成
async function main() {
  const seeder = new SimpleReferralDataSeeder();
  await seeder.seed();
}

if (require.main === module) {
  main().catch(console.error);
}