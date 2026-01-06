const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql'
});

(async () => {
  try {
    console.log('🔧 开始添加缺失的字段...\n');
    
    // 添加 media 字段
    try {
      await sequelize.query('ALTER TABLE creative_curriculums ADD COLUMN media JSON NULL COMMENT "媒体数据（图片和视频）"');
      console.log('✅ media 字段添加成功');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('⚠️ media 字段已存在');
      } else {
        throw e;
      }
    }
    
    // 添加 metadata 字段
    try {
      await sequelize.query('ALTER TABLE creative_curriculums ADD COLUMN metadata JSON NULL COMMENT "元数据"');
      console.log('✅ metadata 字段添加成功');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('⚠️ metadata 字段已存在');
      } else {
        throw e;
      }
    }
    
    // 添加 curriculum_type 字段
    try {
      await sequelize.query('ALTER TABLE creative_curriculums ADD COLUMN curriculum_type VARCHAR(50) DEFAULT "standard" COMMENT "课程类型"');
      console.log('✅ curriculum_type 字段添加成功');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('⚠️ curriculum_type 字段已存在');
      } else {
        throw e;
      }
    }
    
    console.log('\n✅ 所有字段添加完成！');
    
    // 验证字段
    console.log('\n🔍 验证字段...');
    const [results] = await sequelize.query('DESCRIBE creative_curriculums');
    const fields = results.map(r => r.Field);
    
    const requiredFields = ['media', 'metadata', 'course_analysis', 'curriculum_type'];
    requiredFields.forEach(field => {
      if (fields.includes(field)) {
        console.log(`✅ ${field} 字段存在`);
      } else {
        console.log(`❌ ${field} 字段缺失`);
      }
    });
    
  } catch (error) {
    console.error('❌ 添加字段失败:', error.message);
  } finally {
    await sequelize.close();
  }
})();

