/**
 * 直接创建幼儿园海报模板数据（不生成图片）
 * 先创建基础模板数据，后续可以通过海报编辑器生成图片
 */

import axios from 'axios';

// 配置
const API_BASE_URL = 'http://localhost:3000/api';

// 幼儿园活动海报模板数据
const kindergartenTemplates = [
  {
    name: '春季运动会海报',
    description: '充满活力的春季运动会活动海报，展现孩子们的运动精神',
    category: 'sports',
    width: 1024,
    height: 1024,
    thumbnail: '/uploads/templates/spring-sports.jpg',
    background: '#FFE4E1',
    status: 1,
    usageCount: 0,
    remark: '适合春季户外运动活动使用'
  },
  {
    name: '六一儿童节庆典',
    description: '欢乐的六一儿童节庆祝活动海报，充满童趣和欢乐',
    category: 'festival',
    width: 1024,
    height: 1024,
    thumbnail: '/uploads/templates/childrens-day.jpg',
    background: '#FFD700',
    status: 1,
    usageCount: 0,
    remark: '适合儿童节庆祝活动使用'
  },
  {
    name: '亲子手工制作',
    description: '温馨的亲子手工活动海报，促进家长与孩子的互动',
    category: 'parent-child',
    width: 1024,
    height: 1024,
    thumbnail: '/uploads/templates/parent-child-craft.jpg',
    background: '#F0E68C',
    status: 1,
    usageCount: 0,
    remark: '适合亲子互动活动使用'
  },
  {
    name: '秋季采摘活动',
    description: '秋季户外采摘活动海报，体验大自然的美好',
    category: 'outdoor',
    width: 1024,
    height: 1024,
    thumbnail: '/uploads/templates/autumn-picking.jpg',
    background: '#DEB887',
    status: 1,
    usageCount: 0,
    remark: '适合秋季户外采摘活动使用'
  },
  {
    name: '科学实验课',
    description: '有趣的科学实验课程海报，激发孩子的探索精神',
    category: 'education',
    width: 1024,
    height: 1024,
    thumbnail: '/uploads/templates/science-experiment.jpg',
    background: '#87CEEB',
    status: 1,
    usageCount: 0,
    remark: '适合科学教育活动使用'
  },
  {
    name: '音乐舞蹈表演',
    description: '精彩的音乐舞蹈表演海报，展现孩子们的艺术才华',
    category: 'performance',
    width: 1024,
    height: 1024,
    thumbnail: '/uploads/templates/music-dance.jpg',
    background: '#DDA0DD',
    status: 1,
    usageCount: 0,
    remark: '适合音乐舞蹈表演活动使用'
  },
  {
    name: '新生入园欢迎',
    description: '温馨的新生入园欢迎海报，缓解入园焦虑',
    category: 'enrollment',
    width: 1024,
    height: 1024,
    thumbnail: '/uploads/templates/new-student-welcome.jpg',
    background: '#98FB98',
    status: 1,
    usageCount: 0,
    remark: '适合新生入园欢迎活动使用'
  },
  {
    name: '生日庆祝派对',
    description: '欢乐的生日庆祝派对海报，为小朋友庆生',
    category: 'celebration',
    width: 1024,
    height: 1024,
    thumbnail: '/uploads/templates/birthday-party.jpg',
    background: '#FFB6C1',
    status: 1,
    usageCount: 0,
    remark: '适合生日庆祝活动使用'
  }
];

// 创建海报模板
async function createPosterTemplate(templateData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/poster-templates`, {
      ...templateData,
      kindergartenId: 1, // 默认幼儿园ID
      creatorId: 1, // 默认创建者ID
      updaterId: 1
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log(`✅ 模板 "${templateData.name}" 创建成功 (ID: ${response.data.data.id})`);
      return response.data.data;
    } else {
      console.error(`❌ 模板 "${templateData.name}" 创建失败:`, response.data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ 创建模板 "${templateData.name}" 时出错:`, error.response?.data || error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始创建幼儿园海报模板...\n');
  
  const results = [];
  
  for (let i = 0; i < kindergartenTemplates.length; i++) {
    const template = kindergartenTemplates[i];
    console.log(`📋 创建模板 ${i + 1}/${kindergartenTemplates.length}: ${template.name}`);
    
    try {
      const createdTemplate = await createPosterTemplate(template);
      
      if (createdTemplate) {
        results.push({
          success: true,
          template: template.name,
          id: createdTemplate.id,
          category: template.category
        });
      } else {
        results.push({
          success: false,
          template: template.name,
          error: '模板创建失败'
        });
      }
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ 处理模板 "${template.name}" 时出错:`, error);
      results.push({
        success: false,
        template: template.name,
        error: error.message
      });
    }
  }
  
  // 输出结果统计
  console.log('\n📊 创建结果统计:');
  console.log('='.repeat(50));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ 成功创建: ${successCount} 个模板`);
  console.log(`❌ 创建失败: ${failCount} 个模板`);
  
  console.log('\n📋 详细结果:');
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`${index + 1}. ✅ ${result.template} (ID: ${result.id}, 分类: ${result.category})`);
    } else {
      console.log(`${index + 1}. ❌ ${result.template} - ${result.error}`);
    }
  });
  
  console.log('\n🎉 海报模板创建完成！');
  console.log('💡 提示：现在可以通过海报编辑器为每个模板生成对应的图片');
}

// 运行脚本
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
