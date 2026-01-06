#!/usr/bin/env ts-node
/**
 * 补充生成缺失的图片
 */

import { sequelize } from '../init';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';

const multimodalService = new RefactoredMultimodalService();
const SYSTEM_ADMIN_USER_ID = 1;
const UPLOADS_DIR = path.join(__dirname, '../../../uploads/assessment-images');

async function downloadAndCropImage(imageUrl: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempPath = path.join(UPLOADS_DIR, `temp_${filename}`);
    const finalPath = path.join(UPLOADS_DIR, filename);
    const file = fs.createWriteStream(tempPath);
    
    const protocol = imageUrl.startsWith('https:') ? https : http;
    
    protocol.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', async () => {
        file.close();
        try {
          await sharp(tempPath)
            .extract({ left: 37, top: 37, width: 950, height: 950 })
            .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .jpeg({ quality: 85, progressive: true })
            .toFile(finalPath);
          fs.unlinkSync(tempPath);
          resolve(`/uploads/assessment-images/${filename}`);
        } catch (error) {
          fs.renameSync(tempPath, finalPath);
          resolve(`/uploads/assessment-images/${filename}`);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    await sequelize.authenticate();
    AssessmentQuestion.initModel(sequelize);
    console.log('✅ 数据库连接成功\n');
    
    const [missing] = await sequelize.query(
      'SELECT id, title, dimension, ageGroup FROM assessment_questions WHERE status = "active" AND imageUrl IS NULL ORDER BY id'
    );
    
    console.log(`📋 找到 ${(missing as any[]).length} 道缺失图片的题目\n`);
    
    for (const q of (missing as any[])) {
      console.log(`🎨 生成题目 ${q.id}: ${q.title}`);
      
      const prompt = `高质量儿童教育插画，幼儿，逻辑思维训练场景，可爱的孩子正在分类和整理物品，多个物品整齐排列：水果类、交通工具类、动物类，每类3-4个物品，物品大小适中，特征明显，易于区分，背景：浅橙色渐变背景（#FFF3E0到#FFE0B2），干净简洁无杂物。色彩方案：橙色系主题，配色和谐温馨。画面风格：扁平化卡通插画风格，线条圆润流畅，无尖锐边角。光线：柔和均匀的自然光，没有强烈阴影。构图：居中对称构图，主体物清晰突出，视觉焦点明确。细节：物品轮廓清晰，边缘有细微描边，增强识别度。整体氛围：温馨友好、安全可靠、充满童趣、富有教育意义，适合2-6岁幼儿认知发展。图片质量：高清晰度，色彩饱和度适中，符合儿童视觉感知特点。`;
      
      const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
        model: 'doubao-seedream-3-0-t2i-250415',
        prompt,
        size: '1024x1024',
        quality: 'standard',
        responseFormat: 'url'
      });
      
      if (result?.data?.[0]?.url) {
        const filename = `q${q.id}_${q.dimension}_${q.ageGroup}_${Date.now()}.png`;
        const localUrl = await downloadAndCropImage(result.data[0].url, filename);
        await sequelize.query(`UPDATE assessment_questions SET imageUrl = ?, imagePrompt = ? WHERE id = ?`, {
          replacements: [localUrl, prompt, q.id]
        });
        console.log(`✅ 完成: ${localUrl}\n`);
      }
      
      await new Promise(r => setTimeout(r, 4000));
    }
    
    console.log('\n🎉 所有缺失图片已补充完成！');
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
})();





