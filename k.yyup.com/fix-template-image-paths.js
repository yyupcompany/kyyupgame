const { ActivityTemplate } = require('./server/dist/models');
const { sequelize } = require('./server/dist/database/connection');
const fs = require('fs');
const path = require('path');

async function fixTemplateImagePaths() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 获取所有模板
    const templates = await ActivityTemplate.findAll({
      attributes: ['id', 'name', 'coverImage'],
      order: [['id', 'ASC']]
    });
    
    console.log(`\n📋 找到 ${templates.length} 个活动模板`);
    console.log('='.repeat(80));
    
    // 检查uploads目录中的实际文件
    const uploadsDir = path.join(__dirname, 'server/uploads/activity-templates');
    let actualFiles = [];
    
    if (fs.existsSync(uploadsDir)) {
      actualFiles = fs.readdirSync(uploadsDir).filter(file => 
        file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
      );
      console.log(`\n📁 uploads目录中找到 ${actualFiles.length} 个图片文件:`);
      actualFiles.forEach(file => console.log(`  - ${file}`));
    } else {
      console.log('❌ uploads目录不存在');
      return;
    }
    
    console.log('\n🔍 检查模板图片路径:');
    console.log('='.repeat(80));
    
    let fixedCount = 0;
    
    for (const template of templates) {
      console.log(`\n模板: ${template.name} (ID: ${template.id})`);
      console.log(`当前路径: ${template.coverImage || '(无)'}`);
      
      // 查找匹配的文件
      const matchingFile = actualFiles.find(file => 
        file.includes(template.name) || file.includes(`template-${template.name}`)
      );
      
      if (matchingFile) {
        const correctPath = `/uploads/activity-templates/${matchingFile}`;
        
        if (template.coverImage !== correctPath) {
          console.log(`🔧 需要修复: ${correctPath}`);
          
          // 更新数据库
          await template.update({ coverImage: correctPath });
          console.log(`✅ 已更新数据库`);
          fixedCount++;
        } else {
          console.log(`✅ 路径正确，无需修复`);
        }
      } else {
        console.log(`⚠️  未找到匹配的图片文件`);
      }
    }
    
    console.log('\n📊 修复结果:');
    console.log('='.repeat(80));
    console.log(`✅ 成功修复: ${fixedCount} 个模板`);
    console.log(`📁 可用文件: ${actualFiles.length} 个`);
    console.log(`📋 总模板数: ${templates.length} 个`);
    
    // 验证修复结果
    console.log('\n🔍 验证修复结果:');
    console.log('='.repeat(80));
    
    const updatedTemplates = await ActivityTemplate.findAll({
      attributes: ['id', 'name', 'coverImage'],
      where: {
        coverImage: {
          [require('sequelize').Op.like]: '/uploads/activity-templates/%'
        }
      },
      order: [['id', 'ASC']]
    });
    
    updatedTemplates.forEach(template => {
      console.log(`✅ ${template.name}: ${template.coverImage}`);
    });
    
    console.log('\n🎉 图片路径修复完成！');
    console.log('💡 提示: 现在刷新前端页面应该可以看到正确的图片了');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    process.exit(1);
  }
}

fixTemplateImagePaths();
