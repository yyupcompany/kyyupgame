#!/usr/bin/env node

/**
 * 撤销检查中心种子数据脚本
 * 用于删除文档模板和文档实例的种子数据
 */

const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n' + '='.repeat(60));
console.log('  撤销检查中心种子数据');
console.log('='.repeat(60) + '\n');

console.log('⚠️  警告: 此操作将删除以下数据:');
console.log('   - 所有文档模板种子数据 (code: 01-*, 02-*)');
console.log('   - 所有文档实例种子数据 (document_number: DOC-2024-*)');
console.log('');

rl.question('❓ 确定要继续吗? (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ 操作已取消\n');
    rl.close();
    process.exit(0);
  }

  rl.close();

  const serverDir = path.join(__dirname, '../server');

  try {
    console.log('\n📍 工作目录:', serverDir);
    console.log('');

    // 步骤1: 撤销文档实例种子数据
    console.log('🗑️  步骤1: 删除文档实例种子数据...');
    console.log('-'.repeat(60));
    
    try {
      execSync(
        'npx sequelize-cli db:seed:undo --seed 20251010000002-seed-document-instances.js',
        {
          cwd: serverDir,
          stdio: 'inherit'
        }
      );
      console.log('✅ 文档实例种子数据删除成功\n');
    } catch (error) {
      console.error('❌ 文档实例种子数据删除失败');
      console.error('错误信息:', error.message);
      console.log('⚠️  继续删除文档模板数据...\n');
    }

    // 步骤2: 撤销文档模板种子数据
    console.log('🗑️  步骤2: 删除文档模板种子数据...');
    console.log('-'.repeat(60));
    
    try {
      execSync(
        'npx sequelize-cli db:seed:undo --seed 20251010000001-seed-document-templates.js',
        {
          cwd: serverDir,
          stdio: 'inherit'
        }
      );
      console.log('✅ 文档模板种子数据删除成功\n');
    } catch (error) {
      console.error('❌ 文档模板种子数据删除失败');
      console.error('错误信息:', error.message);
    }

    // 步骤3: 验证删除
    console.log('🔍 步骤3: 验证数据删除...');
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

          console.log('📊 验证结果:');
          console.log('   - 剩余文档模板:', templateCount);
          console.log('   - 剩余文档实例:', instanceCount);

          await sequelize.close();
          
          if (templateCount === 0 && instanceCount === 0) {
            console.log('\\n✅ 种子数据已完全删除！');
            process.exit(0);
          } else {
            console.log('\\n⚠️  部分数据未删除，请手动检查');
            process.exit(1);
          }
        } catch (error) {
          console.error('❌ 验证失败:', error.message);
          await sequelize.close();
          process.exit(1);
        }
      }

      verify();
    `;

    require('fs').writeFileSync(
      path.join(serverDir, 'verify-undo-seed.js'),
      verifyScript
    );

    execSync('node verify-undo-seed.js', {
      cwd: serverDir,
      stdio: 'inherit'
    });

    // 清理临时文件
    require('fs').unlinkSync(path.join(serverDir, 'verify-undo-seed.js'));

    console.log('\n' + '='.repeat(60));
    console.log('  ✅ 检查中心种子数据删除完成！');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ 种子数据删除失败');
    console.error('错误信息:', error.message);
    console.error('\n请检查:');
    console.error('   1. 数据库连接是否正常');
    console.error('   2. 种子数据文件是否存在\n');
    process.exit(1);
  }
});

