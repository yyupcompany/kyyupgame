// 快速修复仪表板中心页面说明文档
import { initDatabase } from '../src/config/database';
import { PageGuide } from '../src/models/page-guide.model';

async function quickFix() {
  try {
    console.log('🔗 初始化数据库连接...');
    
    const sequelize = await initDatabase();
    console.log('✅ 数据库连接成功');

    console.log('📝 添加仪表板中心页面说明文档...');

    // 检查是否已存在
    const existing = await PageGuide.findOne({
      where: { pagePath: '/centers/dashboard' }
    });

    if (existing) {
      console.log('📋 记录已存在，更新数据...');
      await existing.update({
        pageName: '仪表板中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        category: '中心页面',
        importance: 9,
        relatedTables: ['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics'],
        contextPrompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
        isActive: true
      });
      console.log('✅ 记录更新成功');
    } else {
      console.log('📋 创建新记录...');
      await PageGuide.create({
        pagePath: '/centers/dashboard',
        pageName: '仪表板中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        category: '中心页面',
        importance: 9,
        relatedTables: ['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics'],
        contextPrompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
        isActive: true
      });
      console.log('✅ 记录创建成功');
    }

    // 验证数据
    const result = await PageGuide.findOne({
      where: { pagePath: '/centers/dashboard' }
    });

    if (result) {
      console.log('🔍 验证结果:');
      console.log(`  ✓ 路径: ${result.pagePath}`);
      console.log(`  ✓ 名称: ${result.pageName}`);
      console.log(`  ✓ 分类: ${result.category}`);
      console.log(`  ✓ 重要性: ${result.importance}`);
      console.log(`  ✓ 是否启用: ${result.isActive}`);
      console.log('');
      console.log('🎉 仪表板中心页面说明文档修复完成！');
      console.log('💡 现在刷新前端页面，404错误应该消失了！');
    } else {
      console.log('❌ 验证失败，未找到记录');
    }

    await sequelize.close();
    console.log('🔗 数据库连接已关闭');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error('详细错误:', error);
  }
}

quickFix();
