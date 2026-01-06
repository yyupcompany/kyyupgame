/**
 * 海报模板种子数据脚本
 * 用于初始化海报模板数据到数据库
 */

import { sequelize } from '../../init';
import { PosterTemplate } from '../../models/poster-template.model';

// 占位图片（1x1 透明 PNG）
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// 海报模板种子数据
const posterTemplates = [
  {
    name: '秋季入学招生海报',
    description: 'AI生成的秋季入学招生海报模板，适用于秋季招生宣传',
    category: 'enrollment',
    width: 750,
    height: 1334,
    background: '#FFE4E1',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '招生宣传专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '春季入学招生海报',
    description: 'AI生成的春季入学招生海报模板，适用于春季招生宣传',
    category: 'enrollment',
    width: 750,
    height: 1334,
    background: '#E8F5E9',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '招生宣传专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '艺术创作坊活动海报',
    description: 'AI生成的艺术创作坊活动海报模板，适用于艺术类活动推广',
    category: 'activity',
    width: 750,
    height: 1334,
    background: '#E6F3FF',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '活动推广专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '科学实验课活动海报',
    description: 'AI生成的科学实验课活动海报模板，适用于科学类活动推广',
    category: 'activity',
    width: 750,
    height: 1334,
    background: '#F0FFF0',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '活动推广专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '亲子运动会活动海报',
    description: 'AI生成的亲子运动会活动海报模板，适用于体育类活动推广',
    category: 'activity',
    width: 750,
    height: 1334,
    background: '#FFF8DC',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '活动推广专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '中秋节庆祝海报',
    description: 'AI生成的中秋节庆祝海报模板，适用于中秋节庆典活动',
    category: 'festival',
    width: 750,
    height: 1334,
    background: '#FFF4E6',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '节日庆典专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '国庆节庆祝海报',
    description: 'AI生成的国庆节庆祝海报模板，适用于国庆节庆典活动',
    category: 'festival',
    width: 750,
    height: 1334,
    background: '#FFEBEE',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '节日庆典专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '春节庆祝海报',
    description: 'AI生成的春节庆祝海报模板，适用于春节庆典活动',
    category: 'festival',
    width: 750,
    height: 1334,
    background: '#FFCDD2',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '节日庆典专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '安全教育通知海报',
    description: 'AI生成的安全教育通知海报模板，适用于安全教育通知',
    category: 'notice',
    width: 750,
    height: 1334,
    background: '#E3F2FD',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '通知公告专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '家长会通知海报',
    description: 'AI生成的家长会通知海报模板，适用于家长会通知',
    category: 'notice',
    width: 750,
    height: 1334,
    background: '#F3E5F5',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '通知公告专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '教学成果展示海报',
    description: 'AI生成的教学成果展示海报模板，适用于教学成果展示',
    category: 'education',
    width: 750,
    height: 1334,
    background: '#E8EAF6',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '教育教学专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '课程介绍海报',
    description: 'AI生成的课程介绍海报模板，适用于课程介绍宣传',
    category: 'education',
    width: 750,
    height: 1334,
    background: '#E0F2F1',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '教育教学专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '健康防疫知识海报',
    description: 'AI生成的健康防疫知识海报模板，适用于健康防疫宣传',
    category: 'safety',
    width: 750,
    height: 1334,
    background: '#E8F5E9',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '安全健康专用模板',
    creatorId: 1,
    updaterId: 1
  },
  {
    name: '消防安全知识海报',
    description: 'AI生成的消防安全知识海报模板，适用于消防安全宣传',
    category: 'safety',
    width: 750,
    height: 1334,
    background: '#FFEBEE',
    thumbnail: placeholderImage,
    kindergartenId: null,
    status: 1,
    usageCount: 0,
    remark: '安全健康专用模板',
    creatorId: 1,
    updaterId: 1
  }
];

async function seedPosterTemplates() {
  try {
    console.log('🌱 开始初始化海报模板数据...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 检查是否已有数据
    const existingCount = await PosterTemplate.count();
    
    if (existingCount > 0) {
      console.log(`ℹ️  数据库中已有 ${existingCount} 个海报模板`);
      console.log('⚠️  跳过初始化，避免重复数据\n');
      
      const answer = await new Promise<string>((resolve) => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question('是否要清空现有数据并重新初始化？(yes/no): ', (ans: string) => {
          readline.close();
          resolve(ans.toLowerCase());
        });
      });
      
      if (answer !== 'yes' && answer !== 'y') {
        console.log('❌ 已取消初始化\n');
        process.exit(0);
      }
      
      // 清空现有数据
      await PosterTemplate.destroy({ where: {}, force: true });
      console.log('🗑️  已清空现有数据\n');
    }

    // 批量创建海报模板
    console.log(`📝 正在创建 ${posterTemplates.length} 个海报模板...`);
    
    const createdTemplates = await PosterTemplate.bulkCreate(posterTemplates);
    
    console.log(`\n✅ 成功创建 ${createdTemplates.length} 个海报模板！\n`);
    
    // 显示创建的模板
    console.log('📋 已创建的模板列表：\n');
    createdTemplates.forEach((template, index) => {
      console.log(`  ${index + 1}. ${template.name} (${template.category})`);
    });
    
    console.log('\n🎉 海报模板数据初始化完成！\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

// 运行种子脚本
seedPosterTemplates();

