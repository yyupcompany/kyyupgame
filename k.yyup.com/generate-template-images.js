/**
 * 使用豆包AI为活动模板生成精美图片
 * 替换现有的SVG图片为AI生成的高质量图片
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const API_BASE_URL = 'http://localhost:3000/api';
const TEMPLATES_DIR = path.join(__dirname, 'client/public/templates');
const UPLOADS_DIR = path.join(__dirname, 'server/public/uploads/activity-templates');

// 认证token（从浏览器获取）
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTY0ODIyODAsImV4cCI6MTc1NjQ4MzcyMH0.bPVfeK0EnvF6pHUMOli80eiYoNwchmiDijHw0sddU7U';

// 活动模板配置
const ACTIVITY_TEMPLATES = [
  {
    name: 'sports',
    title: '亲子运动会',
    description: '增进亲子关系的体育活动模板，包含多种运动项目和亲子互动环节',
    aiPrompt: '幼儿园亲子运动会活动场景，3-6岁可爱的小朋友和家长一起在操场上进行趣味运动比赛，有跑步、跳绳、投篮等项目，彩色运动器材，阳光明媚的户外环境，温馨快乐的氛围，卡通插画风格，色彩鲜艳'
  },
  {
    name: 'science',
    title: '科学实验课',
    description: '培养孩子科学兴趣的实验活动，通过简单有趣的实验激发探索欲',
    aiPrompt: '幼儿园科学实验课堂场景，3-6岁小朋友穿着小白大褂在明亮的实验室里做简单有趣的科学实验，有试管、显微镜、彩色液体等实验器材，小朋友们表情专注好奇，老师在旁边指导，温馨的教育氛围，卡通插画风格'
  },
  {
    name: 'art',
    title: '艺术创作坊',
    description: '发挥创意的艺术创作活动，让孩子在创作中表达自我',
    aiPrompt: '幼儿园艺术创作课堂，3-6岁小朋友在明亮的美术教室里画画和手工制作，桌上有彩色颜料、画笔、彩纸、剪刀等美术用品，小朋友们专注地创作着自己的作品，墙上挂着孩子们的画作，充满创意和色彩的环境，温馨的艺术氛围，卡通插画风格'
  },
  {
    name: 'festival',
    title: '节日庆典',
    description: '传统节日庆祝活动模板，传承文化，增强节日氛围',
    aiPrompt: '幼儿园节日庆典活动场景，3-6岁小朋友穿着节日服装在装饰精美的活动大厅里庆祝传统节日，有彩带、气球、灯笼等节日装饰，小朋友们开心地唱歌跳舞，老师和家长一起参与，热闹欢乐的节日氛围，卡通插画风格，色彩丰富'
  }
];

// 下载图片到本地
async function downloadImage(imageUrl, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https:') ? https : http;
    
    protocol.get(imageUrl, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(filePath);
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filePath, () => {}); // 删除部分下载的文件
          reject(err);
        });
      } else {
        reject(new Error(`下载失败: HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 为单个模板生成图片
async function generateTemplateImage(template) {
  try {
    console.log(`🎨 正在为模板 "${template.title}" 生成AI图片...`);
    
    // 调用豆包AI生成图片
    const response = await axios.post(`${API_BASE_URL}/auto-image/generate`, {
      prompt: template.aiPrompt,
      category: 'template',
      style: 'cartoon',
      size: '1024x768',
      quality: 'hd',
      watermark: false
    }, {
      timeout: 120000, // 2分钟超时
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    if (response.data.success && response.data.data && response.data.data.imageUrl) {
      const imageUrl = response.data.data.imageUrl;
      console.log(`✅ 图片生成成功: ${imageUrl}`);
      
      // 下载并保存图片
      const timestamp = Date.now();
      const jpgFileName = `${template.name}_${timestamp}.jpg`;
      const jpgFilePath = path.join(TEMPLATES_DIR, jpgFileName);
      
      // 确保目录存在
      if (!fs.existsSync(TEMPLATES_DIR)) {
        fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      }
      
      await downloadImage(imageUrl, jpgFilePath);
      console.log(`💾 图片已保存到: ${jpgFilePath}`);
      
      // 同时保存到uploads目录
      const uploadsFileName = `template-${template.name}.jpg`;
      const uploadsFilePath = path.join(UPLOADS_DIR, uploadsFileName);
      
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      
      // 复制文件
      fs.copyFileSync(jpgFilePath, uploadsFilePath);
      console.log(`📁 图片已复制到: ${uploadsFilePath}`);
      
      // 重命名为标准文件名（替换SVG）
      const standardFileName = `${template.name}.jpg`;
      const standardFilePath = path.join(TEMPLATES_DIR, standardFileName);
      
      if (fs.existsSync(standardFilePath)) {
        fs.unlinkSync(standardFilePath); // 删除旧文件
      }
      
      fs.renameSync(jpgFilePath, standardFilePath);
      console.log(`🔄 图片已重命名为: ${standardFileName}`);
      
      return {
        success: true,
        template: template.name,
        localPath: standardFilePath,
        imageUrl: imageUrl,
        usage: response.data.data.usage
      };
      
    } else {
      console.error(`❌ 图片生成失败:`, response.data);
      return {
        success: false,
        template: template.name,
        error: response.data.message || '图片生成失败'
      };
    }
    
  } catch (error) {
    console.error(`❌ 模板 "${template.title}" 图片生成异常:`, error.message);
    return {
      success: false,
      template: template.name,
      error: error.message
    };
  }
}

// 主函数
async function generateAllTemplateImages() {
  console.log('🚀 开始使用豆包AI为活动模板生成精美图片...\n');
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const template of ACTIVITY_TEMPLATES) {
    const result = await generateTemplateImage(template);
    results.push(result);
    
    if (result.success) {
      successCount++;
      console.log(`✅ ${template.title} - 生成成功\n`);
    } else {
      failCount++;
      console.log(`❌ ${template.title} - 生成失败: ${result.error}\n`);
    }
    
    // 添加延迟避免API限制
    if (template !== ACTIVITY_TEMPLATES[ACTIVITY_TEMPLATES.length - 1]) {
      console.log('⏳ 等待3秒后继续...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // 输出总结
  console.log('🎯 图片生成完成！');
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log('\n📊 详细结果:');
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.template}: ${result.localPath}`);
      if (result.usage) {
        console.log(`   📈 使用量: ${JSON.stringify(result.usage)}`);
      }
    } else {
      console.log(`❌ ${result.template}: ${result.error}`);
    }
  });
  
  if (successCount > 0) {
    console.log('\n🎉 请刷新活动中心页面查看新的AI生成图片！');
  }
}

// 运行脚本
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1].endsWith('generate-template-images.js')) {
  generateAllTemplateImages().catch(console.error);
}

export {
  generateAllTemplateImages,
  generateTemplateImage,
  ACTIVITY_TEMPLATES
};
