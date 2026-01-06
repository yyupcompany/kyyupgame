/**
 * 更新活动模板数据库中的图片路径
 * 将SVG路径更新为AI生成的JPG路径
 */

import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  username: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales',
  logging: console.log,
  timezone: '+08:00'
});

// 模板名称映射
const TEMPLATE_MAPPING = {
  '亲子运动会': 'sports',
  '科学实验课': 'science', 
  '艺术创作坊': 'art',
  '节日庆典': 'festival'
};

async function updateTemplateImagePaths() {
  try {
    console.log('🔄 开始更新活动模板图片路径...\n');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 检查生成的JPG文件是否存在
    const templatesDir = path.join(__dirname, 'client/public/templates');
    console.log(`\n📁 检查模板图片目录: ${templatesDir}`);
    
    const jpgFiles = [];
    for (const [templateName, fileName] of Object.entries(TEMPLATE_MAPPING)) {
      const jpgPath = path.join(templatesDir, `${fileName}.jpg`);
      if (fs.existsSync(jpgPath)) {
        jpgFiles.push({ templateName, fileName, exists: true });
        console.log(`✅ 找到图片: ${fileName}.jpg`);
      } else {
        jpgFiles.push({ templateName, fileName, exists: false });
        console.log(`❌ 缺少图片: ${fileName}.jpg`);
      }
    }
    
    // 查询当前模板数据
    console.log('\n🔍 查询当前模板数据...');
    const [templates] = await sequelize.query(`
      SELECT id, name, coverImage 
      FROM activity_templates 
      WHERE name IN ('亲子运动会', '科学实验课', '艺术创作坊', '节日庆典')
      ORDER BY id
    `);
    
    console.log(`📋 找到 ${templates.length} 个模板:`);
    templates.forEach(template => {
      console.log(`  - ${template.name} (ID: ${template.id}): ${template.coverImage}`);
    });
    
    // 更新图片路径
    console.log('\n🔄 开始更新图片路径...');
    let updatedCount = 0;
    
    for (const template of templates) {
      const fileName = TEMPLATE_MAPPING[template.name];
      if (!fileName) {
        console.log(`⚠️  跳过未映射的模板: ${template.name}`);
        continue;
      }
      
      const jpgFile = jpgFiles.find(f => f.fileName === fileName);
      if (!jpgFile || !jpgFile.exists) {
        console.log(`⚠️  跳过缺少图片的模板: ${template.name}`);
        continue;
      }
      
      const newPath = `/templates/${fileName}.jpg`;
      
      if (template.coverImage === newPath) {
        console.log(`✅ ${template.name}: 路径已是最新，无需更新`);
        continue;
      }
      
      console.log(`🔧 更新 ${template.name}:`);
      console.log(`   旧路径: ${template.coverImage}`);
      console.log(`   新路径: ${newPath}`);
      
      // 执行更新
      const [result] = await sequelize.query(`
        UPDATE activity_templates 
        SET coverImage = :newPath, updatedAt = NOW()
        WHERE id = :id
      `, {
        replacements: { newPath, id: template.id }
      });
      
      if (result.affectedRows > 0) {
        console.log(`   ✅ 更新成功`);
        updatedCount++;
      } else {
        console.log(`   ❌ 更新失败`);
      }
    }
    
    // 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const [updatedTemplates] = await sequelize.query(`
      SELECT id, name, coverImage 
      FROM activity_templates 
      WHERE name IN ('亲子运动会', '科学实验课', '艺术创作坊', '节日庆典')
      ORDER BY id
    `);
    
    console.log('📋 更新后的模板路径:');
    updatedTemplates.forEach(template => {
      const isJpg = template.coverImage.endsWith('.jpg');
      const status = isJpg ? '✅' : '❌';
      console.log(`  ${status} ${template.name}: ${template.coverImage}`);
    });
    
    console.log(`\n🎉 更新完成！`);
    console.log(`✅ 成功更新: ${updatedCount} 个模板`);
    console.log(`📊 总模板数: ${templates.length} 个`);
    
    if (updatedCount === templates.length) {
      console.log('🎯 所有模板路径已更新为JPG格式！');
    } else {
      console.log('⚠️  部分模板未能更新，请检查上述日志');
    }
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 运行脚本
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1].endsWith('update-template-image-paths.js')) {
  updateTemplateImagePaths().catch(console.error);
}

export { updateTemplateImagePaths };
