/**
 * 更新权限的中文名称
 */

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

// 权限代码到中文名称的映射
const chineseNameMap: { [key: string]: string } = {
  'PARENT_CENTER': '家长中心',
  'PARENT_CENTER_DIRECTORY': '家长中心目录',
  'ACTIVITY_CENTER': '活动中心',
  'ANALYTICS_CENTER': '数据分析中心',
  'ASSESSMENT_CENTER': '能力测评中心',
  'ATTENDANCE_CENTER': '考勤中心',
  'BUSINESS_CENTER': '业务中心',
  'BUSINESS_MANAGEMENT_CATEGORY': '业务管理',
  'CALL_CENTER': '呼叫中心',
  'CUSTOMER_POOL_CENTER': '客户池中心',
  'DOCUMENT_TEMPLATE_CENTER': '文档模板中心',
  'ENROLLMENT_CENTER': '招生中心',
  'FEEDBACK_CENTER': '反馈中心',
  'FINANCE_CENTER': '财务中心',
  'FINANCE_MANAGEMENT_CATEGORY': '财务管理',
  'INSPECTION_CENTER': '督查中心',
  'MARKETING_CENTER': '营销中心',
  'MARKETING_MANAGEMENT_CATEGORY': '营销管理',
  'PERFORMANCE_CENTER': '绩效中心',
  'PERSONNEL_CENTER': '人员中心',
  'PERSONNEL_MANAGEMENT_CATEGORY': '人员管理',
  'PHOTO_ALBUM_CENTER': '相册中心',
  'SCRIPT_CENTER': '话术中心',
  'TASK_CENTER': '任务中心',
  'TEACHING_CENTER': '教学中心',
  'TEACHING_MANAGEMENT_CATEGORY': '教学管理',
  'USAGE_CENTER': '使用中心',
};

async function updateChineseNames() {
  try {
    console.log('🔄 开始更新权限中文名称...\n');

    let updateCount = 0;

    for (const [code, chineseName] of Object.entries(chineseNameMap)) {
      const [result] = await sequelize.query(`
        UPDATE permissions
        SET chinese_name = ?
        WHERE code = ? AND (chinese_name IS NULL OR chinese_name = '')
      `, { replacements: [chineseName, code] }) as any[];

      if (result.affectedRows > 0) {
        console.log(`✅ 更新: ${code} -> ${chineseName}`);
        updateCount++;
      }
    }

    console.log(`\n📊 更新完成:`);
    console.log(`  ✅ 更新了 ${updateCount} 个权限的中文名称`);

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

updateChineseNames();

