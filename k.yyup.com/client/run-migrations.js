// 数据库迁移执行脚本
import { exec } from 'child_process';
import path from 'path';

// 执行数据库迁移
const runMigrations = async () => {
  const serverPath = path.join(process.cwd(), '..', 'server');
  
  console.log('正在执行数据库迁移...');
  
  // 切换到server目录并执行迁移
  exec('cd ../server && npm run db:migrate', (error, stdout, stderr) => {
    if (error) {
      console.error('迁移执行失败:', error);
      return;
    }
    
    console.log('迁移输出:', stdout);
    if (stderr) {
      console.error('迁移错误:', stderr);
    }
    
    console.log('数据库迁移完成！');
  });
};

// 创建测试数据
const createTestData = async () => {
  console.log('正在创建测试数据...');
  
  // 执行测试数据创建脚本
  exec('cd ../server && node create-test-data.js', (error, stdout, stderr) => {
    if (error) {
      console.error('测试数据创建失败:', error);
      return;
    }
    
    console.log('测试数据创建完成:', stdout);
    if (stderr) {
      console.error('测试数据创建错误:', stderr);
    }
  });
};

// 运行所有任务
runMigrations();
setTimeout(createTestData, 5000); // 5秒后创建测试数据