/**
 * 测试数据清理脚本
 * 用于在测试后清理测试数据和资源
 */

const { Sequelize } = require('sequelize');
const ApiClient = require('../utils/api-client');
const config = require('../config/test-config');

class TestDataCleanup {
  constructor() {
    this.apiClient = new ApiClient();
    this.sequelize = null;
    this.cleanupStats = {
      deleted: {
        users: 0,
        activities: 0,
        groupBuys: 0,
        collectActivities: 0,
        tieredRewards: 0,
        orders: 0,
        payments: 0,
        registrations: 0
      },
      errors: []
    };
  }

  /**
   * 初始化数据库连接
   */
  async initializeDatabase() {
    console.log('🔧 初始化数据库连接...');

    try {
      this.sequelize = new Sequelize(
        process.env.TEST_DATABASE_URL || 'mysql://root:password@localhost:3306/kindergarten_test',
        {
          logging: false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
          }
        }
      );

      await this.sequelize.authenticate();
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 管理员登录
   */
  async adminLogin() {
    console.log('🔐 管理员登录...');

    try {
      const response = await this.apiClient.login(
        config.users.admin.email,
        config.users.admin.password
      );

      if (response.success) {
        this.apiClient.setToken(response.token);
        console.log('✅ 管理员登录成功');
        return response.token;
      } else {
        throw new Error('管理员登录失败');
      }
    } catch (error) {
      console.error('❌ 管理员登录失败:', error.message);
      throw error;
    }
  }

  /**
   * 清理营销相关数据
   */
  async cleanupMarketingData() {
    console.log('📈 清理营销相关数据...');

    const marketingTables = [
      { name: 'tiered_reward_records', id: 'id' },
      { name: 'tiered_rewards', id: 'id' },
      { name: 'collect_help_records', id: 'id' },
      { name: 'collect_activities', id: 'id' },
      { name: 'group_buy_participants', id: 'id' },
      { name: 'group_buys', id: 'id' },
      { name: 'activity_registrations', id: 'id' }
    ];

    for (const table of marketingTables) {
      try {
        // 删除最近24小时内创建的测试数据
        const [result] = await this.sequelize.query(`
          DELETE FROM ${table.name}
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          OR title LIKE '%测试%'
          OR description LIKE '%测试%'
          OR collect_code LIKE 'TEST%'
        `);

        const deletedCount = result.affectedRows || 0;
        this.cleanupStats.deleted[table.name.replace(/_/g, '')] = deletedCount;

        if (deletedCount > 0) {
          console.log(`✅ 清理 ${table.name}: ${deletedCount} 条记录`);
        }
      } catch (error) {
        const errorMsg = `清理 ${table.name} 失败: ${error.message}`;
        console.log(`⚠️  ${errorMsg}`);
        this.cleanupStats.errors.push(errorMsg);
      }
    }

    console.log('✅ 营销数据清理完成');
  }

  /**
   * 清理订单和支付数据
   */
  async cleanupOrderAndPaymentData() {
    console.log('💳 清理订单和支付数据...');

    const orderTables = [
      { name: 'payments', id: 'id' },
      { name: 'orders', id: 'id' }
    ];

    for (const table of orderTables) {
      try {
        const [result] = await this.sequelize.query(`
          DELETE FROM ${table.name}
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          OR order_no LIKE 'TEST%'
          OR transaction_id LIKE 'TEST%'
          OR remarks LIKE '%测试%'
        `);

        const deletedCount = result.affectedRows || 0;
        this.cleanupStats.deleted[table.name] = deletedCount;

        if (deletedCount > 0) {
          console.log(`✅ 清理 ${table.name}: ${deletedCount} 条记录`);
        }
      } catch (error) {
        const errorMsg = `清理 ${table.name} 失败: ${error.message}`;
        console.log(`⚠️  ${errorMsg}`);
        this.cleanupStats.errors.push(errorMsg);
      }
    }

    console.log('✅ 订单和支付数据清理完成');
  }

  /**
   * 清理活动数据
   */
  async cleanupActivityData() {
    console.log('🎯 清理活动数据...');

    try {
      // 先删除活动相关的依赖数据
      const dependencyTables = [
        'activity_registrations',
        'activity_evaluations',
        'activity_materials',
        'activity_schedules'
      ];

      for (const table of dependencyTables) {
        try {
          await this.sequelize.query(`
            DELETE FROM ${table}
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          `);
        } catch (error) {
          console.log(`⚠️  清理依赖表 ${table} 失败: ${error.message}`);
        }
      }

      // 删除测试活动
      const [result] = await this.sequelize.query(`
        DELETE FROM activities
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        OR title LIKE '%测试%'
        OR description LIKE '%测试%'
        OR title LIKE 'Test%'
        OR description LIKE 'Test%'
      `);

      const deletedCount = result.affectedRows || 0;
      this.cleanupStats.deleted.activities = deletedCount;

      if (deletedCount > 0) {
        console.log(`✅ 清理活动: ${deletedCount} 条记录`);
      }

      console.log('✅ 活动数据清理完成');
    } catch (error) {
      const errorMsg = `清理活动数据失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      this.cleanupStats.errors.push(errorMsg);
    }
  }

  /**
   * 清理测试用户数据
   */
  async cleanupUserData() {
    console.log('👥 清理测试用户数据...');

    try {
      // 注意：这里只清理明确标记为测试的用户，避免误删真实用户
      const [result] = await this.sequelize.query(`
        DELETE FROM users
        WHERE email LIKE '%test%@example.com'
        OR email LIKE 'test_%@test.com'
        OR username LIKE 'test_%'
        OR name LIKE '%测试%'
        OR created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND (email LIKE '%test%' OR username LIKE '%test%')
      `);

      const deletedCount = result.affectedRows || 0;
      this.cleanupStats.deleted.users = deletedCount;

      if (deletedCount > 0) {
        console.log(`✅ 清理测试用户: ${deletedCount} 条记录`);
      }

      console.log('✅ 测试用户数据清理完成');
    } catch (error) {
      const errorMsg = `清理用户数据失败: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      this.cleanupStats.errors.push(errorMsg);
    }
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles() {
    console.log('📁 清理临时文件...');

    const fs = require('fs');
    const path = require('path');

    const tempDirs = [
      path.join(__dirname, '../temp'),
      path.join(__dirname, '../logs'),
      path.join(__dirname, '../screenshots')
    ];

    let deletedFiles = 0;

    for (const tempDir of tempDirs) {
      try {
        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);

          for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);

            // 删除24小时前的文件
            if (Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
              if (stats.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
              } else {
                fs.unlinkSync(filePath);
              }
              deletedFiles++;
            }
          }

          console.log(`✅ 清理临时目录 ${tempDir}: ${deletedFiles} 个文件`);
        }
      } catch (error) {
        const errorMsg = `清理临时目录失败: ${error.message}`;
        console.log(`⚠️  ${errorMsg}`);
        this.cleanupStats.errors.push(errorMsg);
      }
    }

    console.log('✅ 临时文件清理完成');
  }

  /**
   * 清理上传的测试文件
   */
  async cleanupUploadedFiles() {
    console.log('🖼️ 清理上传的测试文件...');

    const fs = require('fs');
    const path = require('path');

    // 这里需要根据实际的文件存储路径进行调整
    const uploadDirs = [
      process.env.UPLOAD_PATH || './uploads',
      './uploads/activities',
      './uploads/avatars',
      './uploads/documents'
    ];

    let deletedFiles = 0;

    for (const uploadDir of uploadDirs) {
      try {
        if (fs.existsSync(uploadDir)) {
          const files = fs.readdirSync(uploadDir);

          for (const file of files) {
            // 清理测试相关的上传文件
            if (file.includes('test') || file.includes('TEST') || file.includes('测试')) {
              const filePath = path.join(uploadDir, file);
              fs.unlinkSync(filePath);
              deletedFiles++;
            }
          }

          console.log(`✅ 清理上传目录 ${uploadDir}: ${deletedFiles} 个测试文件`);
        }
      } catch (error) {
        const errorMsg = `清理上传文件失败: ${error.message}`;
        console.log(`⚠️  ${errorMsg}`);
        this.cleanupStats.errors.push(errorMsg);
      }
    }

    console.log('✅ 上传文件清理完成');
  }

  /**
   * 优化数据库表
   */
  async optimizeDatabase() {
    console.log('⚡ 优化数据库表...');

    const tables = [
      'users', 'activities', 'group_buys', 'collect_activities',
      'tiered_rewards', 'orders', 'payments', 'activity_registrations'
    ];

    for (const table of tables) {
      try {
        await this.sequelize.query(`OPTIMIZE TABLE ${table}`);
        console.log(`✅ 优化表: ${table}`);
      } catch (error) {
        console.log(`⚠️  优化表 ${table} 失败: ${error.message}`);
      }
    }

    console.log('✅ 数据库优化完成');
  }

  /**
   * 生成清理报告
   */
  generateCleanupReport() {
    console.log('\n📊 清理统计报告:');
    console.log('=' .repeat(50));

    let totalDeleted = 0;
    Object.entries(this.cleanupStats.deleted).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`${table.padEnd(20)}: ${count} 条记录`);
        totalDeleted += count;
      }
    });

    console.log('-'.repeat(50));
    console.log(`总计删除: ${totalDeleted} 条记录`);

    if (this.cleanupStats.errors.length > 0) {
      console.log('\n⚠️  清理过程中的错误:');
      this.cleanupStats.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    console.log('\n✅ 数据清理完成!');
    return {
      deleted: this.cleanupStats.deleted,
      errors: this.cleanupStats.errors,
      totalDeleted
    };
  }

  /**
   * 完整的清理流程
   */
  async cleanup(options = {}) {
    console.log('🧹 开始清理测试数据...');
    const startTime = Date.now();

    const {
      cleanupMarketing = true,
      cleanupOrders = true,
      cleanupActivities = true,
      cleanupUsers = false, // 默认不清理用户，更安全
      cleanupFiles = true,
      optimizeDB = true
    } = options;

    try {
      await this.initializeDatabase();
      await this.adminLogin();

      if (cleanupOrders) {
        await this.cleanupOrderAndPaymentData();
      }

      if (cleanupMarketing) {
        await this.cleanupMarketingData();
      }

      if (cleanupActivities) {
        await this.cleanupActivityData();
      }

      if (cleanupUsers) {
        await this.cleanupUserData();
      }

      if (cleanupFiles) {
        await this.cleanupTempFiles();
        await this.cleanupUploadedFiles();
      }

      if (optimizeDB) {
        await this.optimizeDatabase();
      }

      const duration = Date.now() - startTime;
      console.log(`\n🎉 清理完成! 耗时: ${duration}ms`);

      return this.generateCleanupReport();
    } catch (error) {
      console.error('❌ 数据清理失败:', error.message);
      throw error;
    }
  }

  /**
   * 快速清理（仅清理最近的数据）
   */
  async quickCleanup() {
    return this.cleanup({
      cleanupMarketing: true,
      cleanupOrders: true,
      cleanupActivities: false,
      cleanupUsers: false,
      cleanupFiles: false,
      optimizeDB: false
    });
  }

  /**
   * 完整清理（清理所有测试数据）
   */
  async fullCleanup() {
    return this.cleanup({
      cleanupMarketing: true,
      cleanupOrders: true,
      cleanupActivities: true,
      cleanupUsers: true,
      cleanupFiles: true,
      optimizeDB: true
    });
  }

  /**
   * 关闭连接
   */
  async close() {
    if (this.sequelize) {
      await this.sequelize.close();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

/**
 * 命令行执行
 */
async function main() {
  const args = process.argv.slice(2);
  const cleanup = new TestDataCleanup();

  try {
    let result;

    if (args.includes('--full')) {
      result = await cleanup.fullCleanup();
    } else if (args.includes('--quick')) {
      result = await cleanup.quickCleanup();
    } else {
      result = await cleanup.cleanup();
    }

    // 保存清理报告
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../temp/cleanup-report.json');

    try {
      if (!fs.existsSync(path.dirname(reportPath))) {
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      }

      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        ...result
      }, null, 2));

      console.log(`\n📄 清理报告已保存到: ${reportPath}`);
    } catch (error) {
      console.warn('⚠️  保存清理报告失败:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n💥 清理失败:', error.message);
    process.exit(1);
  } finally {
    await cleanup.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = TestDataCleanup;