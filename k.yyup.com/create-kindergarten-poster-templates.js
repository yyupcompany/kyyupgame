/**
 * 为幼儿园招生系统创建海报模板
 * 使用豆包AI生成图片并插入到数据库
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const API_BASE_URL = 'http://localhost:3000/api';
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'poster-templates');

// 确保上传目录存在
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 幼儿园活动海报模板数据
const kindergartenTemplates = [
  {
    name: '春季运动会海报',
    description: '充满活力的春季运动会活动海报，展现孩子们的运动精神',
    category: 'sports',
    width: 750,
    height: 1334,
    aiPrompt: '幼儿园春季运动会海报，可爱的卡通儿童在操场上跑步跳跃，彩色气球装饰，阳光明媚的春天背景，温馨可爱的插画风格',
    templateData: {
      title: '春季运动会',
      subtitle: '快乐运动，健康成长',
      mainText: '让我们一起在春天里挥洒汗水，享受运动的快乐！',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    }
  },
  {
    name: '六一儿童节庆典',
    description: '欢乐的六一儿童节庆祝活动海报，充满童趣和欢乐',
    category: 'festival',
    width: 750,
    height: 1334,
    aiPrompt: '六一儿童节庆典海报，快乐的卡通儿童戴着彩色帽子，手持气球和彩带，彩虹背景，星星装饰，梦幻可爱的插画风格',
    templateData: {
      title: '六一儿童节快乐',
      subtitle: '童心飞扬，快乐成长',
      mainText: '让我们一起庆祝属于孩子们的节日！',
      colors: ['#FFD93D', '#6BCF7F', '#4D96FF', '#FF6B9D']
    }
  },
  {
    name: '亲子手工制作',
    description: '温馨的亲子手工活动海报，促进家长与孩子的互动',
    category: 'parent-child',
    width: 750,
    height: 1334,
    aiPrompt: '亲子手工制作活动海报，温馨的家庭场景，父母和孩子一起制作手工艺品，桌上有彩纸、剪刀、胶水等工具，温暖的室内光线，温馨可爱的插画风格',
    templateData: {
      title: '亲子手工时光',
      subtitle: '创意无限，爱意满满',
      mainText: '和宝贝一起动手创造美好回忆！',
      colors: ['#F7B731', '#5F27CD', '#00D2D3', '#FF9FF3']
    }
  },
  {
    name: '秋季采摘活动',
    description: '秋季户外采摘活动海报，体验大自然的美好',
    category: 'outdoor',
    width: 750,
    height: 1334,
    aiPrompt: '秋季采摘活动海报，金黄的果园里，可爱的儿童在采摘苹果和橘子，篮子里装满水果，秋叶飘落，温暖的秋日阳光，温馨自然的插画风格',
    templateData: {
      title: '秋季采摘乐',
      subtitle: '体验自然，收获快乐',
      mainText: '走进果园，感受秋天的丰收喜悦！',
      colors: ['#F39C12', '#E67E22', '#D35400', '#27AE60']
    }
  },
  {
    name: '科学实验课',
    description: '有趣的科学实验课程海报，激发孩子的探索精神',
    category: 'education',
    width: 750,
    height: 1334,
    aiPrompt: '幼儿园科学实验课海报，可爱的小朋友戴着护目镜在做实验，试管里冒着彩色泡泡，显微镜和实验器材，神奇的科学世界，卡通教育风格',
    templateData: {
      title: '小小科学家',
      subtitle: '探索奥秘，启发智慧',
      mainText: '让我们一起探索科学的神奇世界！',
      colors: ['#3498DB', '#9B59B6', '#1ABC9C', '#F1C40F']
    }
  },
  {
    name: '音乐舞蹈表演',
    description: '精彩的音乐舞蹈表演海报，展现孩子们的艺术才华',
    category: 'performance',
    width: 750,
    height: 1334,
    aiPrompt: '音乐舞蹈表演海报，可爱的儿童在舞台上唱歌跳舞，穿着漂亮的演出服装，舞台灯光闪烁，音符和彩带装饰，梦幻舞台风格',
    templateData: {
      title: '音乐舞蹈秀',
      subtitle: '展现才华，绽放光彩',
      mainText: '小小艺术家们的精彩演出即将开始！',
      colors: ['#E74C3C', '#8E44AD', '#3498DB', '#F39C12']
    }
  },
  {
    name: '新生入园欢迎',
    description: '温馨的新生入园欢迎海报，缓解入园焦虑',
    category: 'enrollment',
    width: 750,
    height: 1334,
    aiPrompt: '新生入园欢迎海报，温馨的幼儿园大门，老师和小朋友们挥手欢迎，彩色气球和欢迎横幅，阳光明媚的校园环境，温暖友好的插画风格',
    templateData: {
      title: '欢迎新朋友',
      subtitle: '温馨家园，快乐成长',
      mainText: '欢迎来到我们的大家庭！',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
    }
  },
  {
    name: '生日庆祝派对',
    description: '欢乐的生日庆祝派对海报，为小朋友庆生',
    category: 'celebration',
    width: 750,
    height: 1334,
    aiPrompt: '生日庆祝派对海报，可爱的生日蛋糕和彩色气球，小朋友们围成圆圈庆祝，生日帽和彩带装饰，欢乐的派对氛围，温馨庆祝风格',
    templateData: {
      title: '生日快乐',
      subtitle: '共同庆祝，分享快乐',
      mainText: '让我们一起为小寿星庆祝生日！',
      colors: ['#FF69B4', '#FFD700', '#98FB98', '#87CEEB']
    }
  }
];

// 生成图片并保存
async function generateAndSaveImage(template, index) {
  try {
    console.log(`🎨 正在为模板 "${template.name}" 生成图片...`);
    
    // 调用豆包AI生成图片
    const imageResponse = await axios.post(`${API_BASE_URL}/auto-image/generate`, {
      prompt: template.aiPrompt,
      category: 'poster',
      style: 'cartoon',
      size: '1024x1024',
      quality: 'hd',
      watermark: false
    }, {
      timeout: 60000 // 60秒超时
    });

    if (imageResponse.data.success && imageResponse.data.data.imageUrl) {
      const imageUrl = imageResponse.data.data.imageUrl;
      console.log(`✅ 图片生成成功: ${imageUrl}`);
      
      // 下载图片到本地
      const imageFileName = `template_${index + 1}_${Date.now()}.jpg`;
      const localImagePath = path.join(UPLOADS_DIR, imageFileName);
      
      try {
        const imageDownload = await axios.get(imageUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(localImagePath);
        imageDownload.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        console.log(`💾 图片已保存到: ${localImagePath}`);
        
        // 返回本地图片路径
        return `/uploads/poster-templates/${imageFileName}`;
      } catch (downloadError) {
        console.error(`❌ 图片下载失败:`, downloadError);
        // 如果下载失败，直接使用远程URL
        return imageUrl;
      }
    } else {
      console.error(`❌ 图片生成失败:`, imageResponse.data);
      // 使用默认图片
      return '/uploads/default-poster.jpg';
    }
  } catch (error) {
    console.error(`❌ 生成图片时出错:`, error.message);
    // 使用默认图片
    return '/uploads/default-poster.jpg';
  }
}

// 创建海报模板
async function createPosterTemplate(templateData, imageUrl) {
  try {
    const posterTemplate = {
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      width: templateData.width,
      height: templateData.height,
      thumbnail: imageUrl,
      background: imageUrl,
      status: 1, // 启用状态
      usageCount: 0,
      kindergartenId: 1, // 默认幼儿园ID
      remark: `AI生成的${templateData.name}模板`
    };

    const response = await axios.post(`${API_BASE_URL}/poster-templates`, posterTemplate, {
      headers: {
        'Content-Type': 'application/json',
        // 这里可能需要添加认证token
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // 需要实际的token
      }
    });

    if (response.data.success) {
      console.log(`✅ 模板 "${templateData.name}" 创建成功`);
      return response.data.data;
    } else {
      console.error(`❌ 模板创建失败:`, response.data);
      return null;
    }
  } catch (error) {
    console.error(`❌ 创建模板时出错:`, error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始创建幼儿园海报模板...\n');
  
  const results = [];
  
  for (let i = 0; i < kindergartenTemplates.length; i++) {
    const template = kindergartenTemplates[i];
    console.log(`\n📋 处理模板 ${i + 1}/${kindergartenTemplates.length}: ${template.name}`);
    
    try {
      // 生成图片
      const imageUrl = await generateAndSaveImage(template, i);
      
      // 创建模板
      const createdTemplate = await createPosterTemplate(template, imageUrl);
      
      if (createdTemplate) {
        results.push({
          success: true,
          template: template.name,
          id: createdTemplate.id,
          imageUrl
        });
      } else {
        results.push({
          success: false,
          template: template.name,
          error: '模板创建失败'
        });
      }
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      console.log(`${index + 1}. ✅ ${result.template} (ID: ${result.id})`);
    } else {
      console.log(`${index + 1}. ❌ ${result.template} - ${result.error}`);
    }
  });
  
  // 保存结果到文件
  const resultFile = path.join(__dirname, `poster_templates_result_${Date.now()}.json`);
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 结果已保存到: ${resultFile}`);
  
  console.log('\n🎉 海报模板创建完成！');
}

// 运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { kindergartenTemplates, generateAndSaveImage, createPosterTemplate };
