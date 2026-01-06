#!/usr/bin/env node

/**
 * 基础数据种子脚本
 * 用于初始化系统的基础数据
 */

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// 颜色输出函数
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

function log(message, color = 'cyan') {
  console.log(colors[color](`[种子数据] ${message}`));
}

function success(message) {
  console.log(colors.green(`[成功] ${message}`));
}

function error(message) {
  console.error(colors.red(`[错误] ${message}`));
}

// 数据库配置
const dbConfig = {
  database: process.env.DB_NAME || 'kindergarten_management',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false
};

// 基础数据
const basicData = {
  // 用户角色
  roles: [
    { id: 1, name: 'admin', display_name: '系统管理员', description: '拥有系统所有权限' },
    { id: 2, name: 'principal', display_name: '园长', description: '幼儿园管理权限' },
    { id: 3, name: 'teacher', display_name: '教师', description: '教学相关权限' },
    { id: 4, name: 'parent', display_name: '家长', description: '查看孩子信息权限' }
  ],

  // 系统配置
  systemConfigs: [
    { key: 'system_name', value: '幼儿园管理系统', description: '系统名称' },
    { key: 'system_version', value: '1.0.0', description: '系统版本' },
    { key: 'max_students_per_class', value: '30', description: '每班最大学生数' },
    { key: 'school_year_start', value: '2024-09-01', description: '学年开始时间' },
    { key: 'school_year_end', value: '2025-07-31', description: '学年结束时间' }
  ],

  // 班级类型
  classTypes: [
    { name: '小班', age_range: '3-4岁', capacity: 25, description: '适合3-4岁儿童' },
    { name: '中班', age_range: '4-5岁', capacity: 28, description: '适合4-5岁儿童' },
    { name: '大班', age_range: '5-6岁', capacity: 30, description: '适合5-6岁儿童' }
  ],

  // 活动类型
  activityTypes: [
    { name: '户外活动', description: '室外体育和游戏活动' },
    { name: '艺术创作', description: '绘画、手工等创意活动' },
    { name: '音乐舞蹈', description: '音乐欣赏和舞蹈表演' },
    { name: '科学探索', description: '简单的科学实验和观察' },
    { name: '阅读时光', description: '故事阅读和语言发展' }
  ]
};

// 创建数据库连接
async function createConnection() {
  try {
    const sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    await sequelize.authenticate();
    log('数据库连接成功', 'green');
    return sequelize;
  } catch (err) {
    error(`数据库连接失败: ${err.message}`);
    throw err;
  }
}

// 插入基础数据
async function seedBasicData(sequelize) {
  try {
    // 检查并创建角色表数据
    const [rolesResult] = await sequelize.query(`
      INSERT IGNORE INTO roles (id, name, display_name, description, created_at, updated_at) VALUES
      ${basicData.roles.map(role => 
        `(${role.id}, '${role.name}', '${role.display_name}', '${role.description}', NOW(), NOW())`
      ).join(',\n      ')}
    `);
    
    if (rolesResult.affectedRows > 0) {
      success(`插入了 ${rolesResult.affectedRows} 个角色`);
    } else {
      log('角色数据已存在，跳过插入', 'yellow');
    }

    // 检查并创建系统配置数据
    for (const config of basicData.systemConfigs) {
      const [result] = await sequelize.query(`
        INSERT IGNORE INTO system_configs (\`key\`, \`value\`, description, created_at, updated_at) 
        VALUES ('${config.key}', '${config.value}', '${config.description}', NOW(), NOW())
      `);
    }
    success('系统配置数据处理完成');

    // 检查并创建班级类型数据
    for (const classType of basicData.classTypes) {
      const [result] = await sequelize.query(`
        INSERT IGNORE INTO class_types (name, age_range, capacity, description, created_at, updated_at) 
        VALUES ('${classType.name}', '${classType.age_range}', ${classType.capacity}, '${classType.description}', NOW(), NOW())
      `);
    }
    success('班级类型数据处理完成');

    // 检查并创建活动类型数据
    for (const activityType of basicData.activityTypes) {
      const [result] = await sequelize.query(`
        INSERT IGNORE INTO activity_types (name, description, created_at, updated_at) 
        VALUES ('${activityType.name}', '${activityType.description}', NOW(), NOW())
      `);
    }
    success('活动类型数据处理完成');

  } catch (err) {
    error(`插入基础数据失败: ${err.message}`);
    throw err;
  }
}

// 验证数据
async function verifyData(sequelize) {
  try {
    const [roles] = await sequelize.query('SELECT COUNT(*) as count FROM roles');
    const [configs] = await sequelize.query('SELECT COUNT(*) as count FROM system_configs');
    
    log('\n数据验证结果:', 'blue');
    console.log(`  角色数量: ${roles[0].count}`);
    console.log(`  系统配置数量: ${configs[0].count}`);
    
    return true;
  } catch (err) {
    error(`数据验证失败: ${err.message}`);
    return false;
  }
}

// 主函数
async function main() {
  console.log(colors.bold('\n🌱 开始生成基础种子数据...\n'));
  
  let sequelize;
  
  try {
    // 创建数据库连接
    sequelize = await createConnection();
    
    // 插入基础数据
    log('正在插入基础数据...', 'blue');
    await seedBasicData(sequelize);
    
    // 验证数据
    log('正在验证数据...', 'blue');
    const isValid = await verifyData(sequelize);
    
    if (isValid) {
      success('基础种子数据生成完成！');
    } else {
      error('数据验证失败');
      process.exit(1);
    }
    
  } catch (err) {
    error(`脚本执行失败: ${err.message}`);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
      log('数据库连接已关闭', 'yellow');
    }
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  error(`未处理的Promise拒绝: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  error(`未捕获的异常: ${err.message}`);
  process.exit(1);
});

// 运行主函数
main().catch(console.error);
