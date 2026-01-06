#!/usr/bin/env node

/**
 * 检查中心种子数据脚本
 * 用于初始化文档模板和文档实例数据
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('  检查中心种子数据初始化');
console.log('='.repeat(60) + '\n');

const serverDir = path.join(__dirname, '../server');

try {
  console.log('📍 工作目录:', serverDir);
  console.log('');

  // 步骤1: 运行文档模板种子数据
  console.log('🌱 步骤1: 插入文档模板种子数据...');
  console.log('-'.repeat(60));
  
  try {
    execSync(
      'npx sequelize-cli db:seed --seed 20251010000001-seed-document-templates.js',
      {
        cwd: serverDir,
        stdio: 'inherit'
      }
    );
    console.log('✅ 文档模板种子数据插入成功\n');
  } catch (error) {
    console.error('❌ 文档模板种子数据插入失败');
    console.error('错误信息:', error.message);
    process.exit(1);
  }

  // 步骤2: 运行文档实例种子数据
  console.log('🌱 步骤2: 插入文档实例种子数据...');
  console.log('-'.repeat(60));
  
  try {
    execSync(
      'npx sequelize-cli db:seed --seed 20251010000002-seed-document-instances.js',
      {
        cwd: serverDir,
        stdio: 'inherit'
      }
    );
    console.log('✅ 文档实例种子数据插入成功\n');
  } catch (error) {
    console.error('❌ 文档实例种子数据插入失败');
    console.error('错误信息:', error.message);
    process.exit(1);
  }

  // 步骤3: 验证数据
  console.log('🔍 步骤3: 验证种子数据...');
  console.log('-'.repeat(60));
  
  const verifyScript = `
    const { Sequelize } = require('sequelize');
    const config = require('./config/config.js');
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = config[env];

    const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: false
    });

    async function verify() {
      try {
        // 查询文档模板数量
        const [templates] = await sequelize.query(
          "SELECT COUNT(*) as count FROM document_templates WHERE code LIKE '01-%' OR code LIKE '02-%'"
        );
        const templateCount = templates[0].count;

        // 查询文档实例数量
        const [instances] = await sequelize.query(
          "SELECT COUNT(*) as count FROM document_instances WHERE document_number LIKE 'DOC-2024-%'"
        );
        const instanceCount = instances[0].count;

        // 查询实例状态分布
        const [statusDist] = await sequelize.query(
          "SELECT status, COUNT(*) as count FROM document_instances WHERE document_number LIKE 'DOC-2024-%' GROUP BY status"
        );

        console.log('📊 数据验证结果:');
        console.log('   - 文档模板数量:', templateCount);
        console.log('   - 文档实例数量:', instanceCount);
        console.log('   - 实例状态分布:');
        statusDist.forEach(item => {
          const statusName = {
            'draft': '草稿',
            'pending_review': '待审核',
            'approved': '已审核',
            'rejected': '已拒绝',
            'archived': '已归档'
          }[item.status] || item.status;
          console.log(\`     * \${statusName}: \${item.count}个\`);
        });

        await sequelize.close();
        
        if (templateCount > 0 && instanceCount > 0) {
          console.log('\\n✅ 数据验证通过！');
          process.exit(0);
        } else {
          console.log('\\n⚠️  数据验证失败：数据量不足');
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ 数据验证失败:', error.message);
        await sequelize.close();
        process.exit(1);
      }
    }

    verify();
  `;

  require('fs').writeFileSync(
    path.join(serverDir, 'verify-seed-data.js'),
    verifyScript
  );

  execSync('node verify-seed-data.js', {
    cwd: serverDir,
    stdio: 'inherit'
  });

  // 清理临时文件
  require('fs').unlinkSync(path.join(serverDir, 'verify-seed-data.js'));

  console.log('\n' + '='.repeat(60));
  console.log('  ✅ 检查中心种子数据初始化完成！');
  console.log('='.repeat(60) + '\n');

  console.log('📝 下一步操作:');
  console.log('   1. 重启后端服务: cd server && npm run dev');
  console.log('   2. 运行API测试: node scripts/test-inspection-api-complete.js');
  console.log('   3. 访问前端页面查看数据\n');

} catch (error) {
  console.error('\n❌ 种子数据初始化失败');
  console.error('错误信息:', error.message);
  console.error('\n请检查:');
  console.error('   1. 数据库连接是否正常');
  console.error('   2. 迁移是否已执行');
  console.error('   3. 种子数据文件是否存在\n');
  process.exit(1);
}

