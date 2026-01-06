/**
 * 数据加密迁移脚本
 * 将数据库中现有的明文敏感数据加密
 * 
 * 执行：npm run migrate:encrypt
 */
import { Sequelize } from 'sequelize';
import { encryptField } from '../src/utils/encryption.util';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库连接
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kargerdensales',
  logging: false,
  dialectOptions: {
    ssl: false // 跳过SSL验证
  }
});

/**
 * 检查字段是否已加密
 * 加密格式：iv:authTag:encrypted（96+字符）
 */
function isEncrypted(value: string | null): boolean {
  if (!value) return true;
  // 加密后格式：32位hex(iv) + : + 32位hex(authTag) + : + N位hex(encrypted)
  // 最短也要70+字符
  return value.length > 70 && value.includes(':');
}

/**
 * 加密users表的phone字段
 */
async function encryptUsersPhone() {
  console.log('\n📱 加密 users.phone 字段...');
  
  const [users] = await sequelize.query('SELECT id, phone FROM users WHERE phone IS NOT NULL');
  
  let encryptedCount = 0;
  let skippedCount = 0;
  
  for (const user of users as any[]) {
    if (isEncrypted(user.phone)) {
      skippedCount++;
      continue;
    }
    
    const encryptedPhone = encryptField(user.phone);
    await sequelize.query(
      'UPDATE users SET phone = ? WHERE id = ?',
      { replacements: [encryptedPhone, user.id] }
    );
    
    encryptedCount++;
    if (encryptedCount % 100 === 0) {
      console.log(`  ✅ 已加密 ${encryptedCount} 条记录...`);
    }
  }
  
  console.log(`  ✅ users.phone 完成: 加密 ${encryptedCount} 条，跳过 ${skippedCount} 条`);
}

/**
 * 加密students表的敏感字段
 */
async function encryptStudentsFields() {
  console.log('\n👶 加密 students 表敏感字段...');
  
  // 检查表是否存在
  const [tables] = await sequelize.query("SHOW TABLES LIKE 'students'");
  if ((tables as any[]).length === 0) {
    console.log('  ⚠️ students表不存在，跳过');
    return;
  }
  
  // 检查字段是否存在
  const [columns] = await sequelize.query("SHOW COLUMNS FROM students");
  const columnNames = (columns as any[]).map(c => c.Field);
  
  const fieldsToEncrypt = ['id_card_no', 'health_condition'].filter(f => 
    columnNames.includes(f)
  );
  
  if (fieldsToEncrypt.length === 0) {
    console.log('  ⚠️ 没有需要加密的字段，跳过');
    return;
  }
  
  for (const field of fieldsToEncrypt) {
    const [students] = await sequelize.query(
      `SELECT id, ${field} FROM students WHERE ${field} IS NOT NULL`
    );
    
    let encryptedCount = 0;
    let skippedCount = 0;
    
    for (const student of students as any[]) {
      const value = student[field];
      if (isEncrypted(value)) {
        skippedCount++;
        continue;
      }
      
      const encryptedValue = encryptField(value);
      await sequelize.query(
        `UPDATE students SET ${field} = ? WHERE id = ?`,
        { replacements: [encryptedValue, student.id] }
      );
      
      encryptedCount++;
    }
    
    console.log(`  ✅ students.${field}: 加密 ${encryptedCount} 条，跳过 ${skippedCount} 条`);
  }
}

/**
 * 加密teachers表的敏感字段
 */
async function encryptTeachersFields() {
  console.log('\n👨‍🏫 加密 teachers 表敏感字段...');
  
  const [tables] = await sequelize.query("SHOW TABLES LIKE 'teachers'");
  if ((tables as any[]).length === 0) {
    console.log('  ⚠️ teachers表不存在，跳过');
    return;
  }
  
  const [columns] = await sequelize.query("SHOW COLUMNS FROM teachers");
  const columnNames = (columns as any[]).map(c => c.Field);
  
  const fieldsToEncrypt = ['emergency_phone'].filter(f => 
    columnNames.includes(f)
  );
  
  if (fieldsToEncrypt.length === 0) {
    console.log('  ⚠️ 没有需要加密的字段，跳过');
    return;
  }
  
  for (const field of fieldsToEncrypt) {
    const [teachers] = await sequelize.query(
      `SELECT id, ${field} FROM teachers WHERE ${field} IS NOT NULL`
    );
    
    let encryptedCount = 0;
    let skippedCount = 0;
    
    for (const teacher of teachers as any[]) {
      const value = teacher[field];
      if (isEncrypted(value)) {
        skippedCount++;
        continue;
      }
      
      const encryptedValue = encryptField(value);
      await sequelize.query(
        `UPDATE teachers SET ${field} = ? WHERE id = ?`,
        { replacements: [encryptedValue, teacher.id] }
      );
      
      encryptedCount++;
    }
    
    console.log(`  ✅ teachers.${field}: 加密 ${encryptedCount} 条，跳过 ${skippedCount} 条`);
  }
}

/**
 * 加密parents表的敏感字段
 */
async function encryptParentsFields() {
  console.log('\n👪 加密 parents 表敏感字段...');
  
  const [tables] = await sequelize.query("SHOW TABLES LIKE 'parents'");
  if ((tables as any[]).length === 0) {
    console.log('  ⚠️ parents表不存在，跳过');
    return;
  }
  
  const [columns] = await sequelize.query("SHOW COLUMNS FROM parents");
  const columnNames = (columns as any[]).map(c => c.Field);
  
  const fieldsToEncrypt = ['idCardNo'].filter(f => 
    columnNames.includes(f)
  );
  
  // parent表的idCardNo是JS属性名，数据库字段名可能是下划线格式
  if (fieldsToEncrypt.length === 0 && columnNames.includes('id_card_no')) {
    fieldsToEncrypt.push('id_card_no');
  }
  
  if (fieldsToEncrypt.length === 0) {
    console.log('  ⚠️ 没有需要加密的字段，跳过');
    return;
  }
  
  for (const field of fieldsToEncrypt) {
    const [parents] = await sequelize.query(
      `SELECT id, ${field} FROM parents WHERE ${field} IS NOT NULL`
    );
    
    let encryptedCount = 0;
    let skippedCount = 0;
    
    for (const parent of parents as any[]) {
      const value = parent[field];
      if (isEncrypted(value)) {
        skippedCount++;
        continue;
      }
      
      const encryptedValue = encryptField(value);
      await sequelize.query(
        `UPDATE parents SET ${field} = ? WHERE id = ?`,
        { replacements: [encryptedValue, parent.id] }
      );
      
      encryptedCount++;
    }
    
    console.log(`  ✅ parents.${field}: 加密 ${encryptedCount} 条，跳过 ${skippedCount} 条`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🔐 数据加密迁移开始');
  console.log('='.repeat(60));
  
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 检查加密密钥
    if (!process.env.DB_ENCRYPTION_KEY) {
      throw new Error('❌ 未配置加密密钥 DB_ENCRYPTION_KEY');
    }
    console.log('✅ 加密密钥已配置');
    
    // 创建备份提示
    console.log('\n⚠️  重要提示：');
    console.log('   1. 数据迁移前请先备份数据库！');
    console.log('   2. 迁移过程不可逆！');
    console.log('   3. 建议在测试环境先验证！');
    console.log('\n   继续执行将在 5 秒后开始...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 开始迁移
    const startTime = Date.now();
    
    await encryptUsersPhone();
    await encryptStudentsFields();
    await encryptTeachersFields();
    await encryptParentsFields();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 数据加密迁移完成！');
    console.log('='.repeat(60));
    console.log(`⏱️  耗时: ${duration} 秒`);
    console.log('\n💡 后续步骤:');
    console.log('1. 验证加密数据能否正常解密');
    console.log('2. 测试应用功能是否正常');
    console.log('3. 确认无误后，更新其他表的模型加密钩子');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行迁移
main();
