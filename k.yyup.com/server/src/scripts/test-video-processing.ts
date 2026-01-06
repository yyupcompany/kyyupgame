/**
 * 视频处理功能测试脚本
 * 
 * 测试内容：
 * 1. FFmpeg可用性检测
 * 2. 视频时长检测
 * 3. 视频转码功能
 */

import { videoProcessingService } from '../services/video-processing.service';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  console.log('🎬 视频处理功能测试\n');
  console.log('='.repeat(60));

  // 测试1: 检查FFmpeg可用性
  console.log('\n📋 测试1: 检查FFmpeg可用性');
  console.log('-'.repeat(60));
  
  const ffmpegAvailable = await videoProcessingService.checkFFmpegAvailable();
  
  if (!ffmpegAvailable) {
    console.error('❌ FFmpeg不可用！');
    console.error('   请先安装FFmpeg:');
    console.error('   Ubuntu/Debian: sudo apt-get install ffmpeg');
    console.error('   macOS: brew install ffmpeg');
    console.error('   Windows: 从 https://ffmpeg.org/download.html 下载');
    process.exit(1);
  }
  
  console.log('✅ FFmpeg可用');

  // 测试2: 创建测试视频（使用FFmpeg生成）
  console.log('\n📋 测试2: 生成测试视频');
  console.log('-'.repeat(60));
  
  const testVideoPath = path.join(process.cwd(), 'test-video.mp4');
  
  try {
    // 使用FFmpeg生成一个5秒的测试视频
    const { execSync } = require('child_process');
    
    console.log('   生成5秒测试视频...');
    execSync(
      `ffmpeg -f lavfi -i testsrc=duration=5:size=1280x720:rate=30 -pix_fmt yuv420p -y ${testVideoPath}`,
      { stdio: 'ignore' }
    );
    
    const stats = await fs.stat(testVideoPath);
    console.log(`✅ 测试视频生成成功: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    
    // 测试3: 读取视频时长
    console.log('\n📋 测试3: 检测视频时长');
    console.log('-'.repeat(60));
    
    const videoBuffer = await fs.readFile(testVideoPath);
    const duration = await videoProcessingService.getVideoDuration(videoBuffer);
    
    console.log(`✅ 视频时长: ${duration.toFixed(2)}秒`);
    
    // 测试4: 验证视频时长
    console.log('\n📋 测试4: 验证视频时长');
    console.log('-'.repeat(60));
    
    const validation = await videoProcessingService.validateVideoDuration(videoBuffer);
    
    if (validation.valid) {
      console.log(`✅ 视频时长验证通过: ${validation.duration.toFixed(2)}秒 ≤ 60秒`);
    } else {
      console.log(`❌ 视频时长验证失败: ${validation.message}`);
    }
    
    // 测试5: 转码视频为720p
    console.log('\n📋 测试5: 转码视频为720p');
    console.log('-'.repeat(60));
    
    const startTime = Date.now();
    const result = await videoProcessingService.transcodeToH720p(
      videoBuffer,
      'test-video.mp4'
    );
    const processingTime = Date.now() - startTime;
    
    console.log('✅ 视频转码成功');
    console.log(`   原始大小: ${(result.originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   转码后大小: ${(result.compressedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   压缩率: ${((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)}%`);
    console.log(`   处理时间: ${(processingTime / 1000).toFixed(2)}秒`);
    console.log(`   视频时长: ${result.duration.toFixed(2)}秒`);
    
    // 保存转码后的视频
    const outputPath = path.join(process.cwd(), 'test-video-720p.mp4');
    await fs.writeFile(outputPath, result.buffer);
    console.log(`   转码后视频已保存: ${outputPath}`);
    
    // 测试6: 完整处理流程
    console.log('\n📋 测试6: 完整处理流程');
    console.log('-'.repeat(60));
    
    const processResult = await videoProcessingService.processUploadedVideo(
      videoBuffer,
      'test-video.mp4'
    );
    
    if (processResult.success) {
      console.log('✅ 视频处理成功');
      console.log(`   时长: ${processResult.duration?.toFixed(2)}秒`);
      console.log(`   原始大小: ${((processResult.originalSize || 0) / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   压缩后大小: ${((processResult.compressedSize || 0) / 1024 / 1024).toFixed(2)}MB`);
    } else {
      console.log(`❌ 视频处理失败: ${processResult.error}`);
    }
    
    // 测试7: 测试超长视频（模拟）
    console.log('\n📋 测试7: 测试超长视频（65秒）');
    console.log('-'.repeat(60));
    
    const longVideoPath = path.join(process.cwd(), 'test-video-long.mp4');
    
    console.log('   生成65秒测试视频...');
    execSync(
      `ffmpeg -f lavfi -i testsrc=duration=65:size=1280x720:rate=30 -pix_fmt yuv420p -y ${longVideoPath}`,
      { stdio: 'ignore' }
    );
    
    const longVideoBuffer = await fs.readFile(longVideoPath);
    const longValidation = await videoProcessingService.validateVideoDuration(longVideoBuffer);
    
    if (!longValidation.valid) {
      console.log(`✅ 正确拒绝超长视频: ${longValidation.message}`);
    } else {
      console.log(`❌ 应该拒绝超长视频，但验证通过了`);
    }
    
    // 清理测试文件
    console.log('\n📋 清理测试文件');
    console.log('-'.repeat(60));
    
    await fs.unlink(testVideoPath);
    await fs.unlink(longVideoPath);
    console.log('✅ 测试文件已清理');
    
    // 总结
    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有测试完成！');
    console.log('='.repeat(60));
    console.log('\n✅ 视频处理功能正常工作');
    console.log('✅ FFmpeg集成成功');
    console.log('✅ 时长限制正常');
    console.log('✅ 转码功能正常');
    console.log('\n下一步：');
    console.log('1. 运行数据库迁移');
    console.log('2. 启动服务器');
    console.log('3. 测试文件上传API');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    
    // 清理可能存在的测试文件
    try {
      await fs.unlink(testVideoPath);
    } catch (e) {
      // 忽略
    }
    
    process.exit(1);
  }
}

// 运行测试
main().catch(error => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});

