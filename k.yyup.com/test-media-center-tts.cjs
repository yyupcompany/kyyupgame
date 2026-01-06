#!/usr/bin/env node

/**
 * 测试媒体中心的TTS API调用
 * 使用与媒体中心相同的参数
 */

const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3000/api';

async function testMediaCenterTTS() {
  console.log('🎯 测试媒体中心TTS API\n');
  
  // 步骤1: 登录获取token
  console.log('📝 步骤1: 登录获取token...');
  const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
    username: 'admin',
    password: 'admin123'
  });
  
  const token = loginResponse.data.data.token;
  console.log('✅ 登录成功\n');
  
  // 步骤2: 调用TTS API（使用媒体中心的参数）
  console.log('📝 步骤2: 调用TTS API（媒体中心参数）...');
  console.log('   端点: /api/ai/text-to-speech');
  console.log('   文本: "欢迎来到我们的幼儿园，这里充满了欢声笑语。"');
  console.log('   音色: zh_female_cancan_mars_bigtts （媒体中心默认音色）');
  console.log('   语速: 1.0');
  console.log('   格式: mp3\n');
  
  try {
    const ttsResponse = await axios.post(
      `${API_BASE}/ai/text-to-speech`,
      {
        text: '欢迎来到我们的幼儿园，这里充满了欢声笑语。',
        voice: 'zh_female_cancan_mars_bigtts',  // 媒体中心使用的音色
        speed: 1.0,
        format: 'mp3'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );
    
    console.log('✅ TTS API调用成功');
    console.log(`   HTTP状态: ${ttsResponse.status}`);
    console.log(`   Content-Type: ${ttsResponse.headers['content-type']}`);
    console.log(`   Content-Length: ${ttsResponse.headers['content-length']}`);
    console.log(`   实际数据长度: ${ttsResponse.data.byteLength} bytes\n`);
    
    if (ttsResponse.data.byteLength === 0) {
      console.log('❌ 错误: 返回的音频数据为空（0字节）');
      return;
    }
    
    // 保存音频文件
    const outputFile = 'test-media-center-tts-output.mp3';
    fs.writeFileSync(outputFile, Buffer.from(ttsResponse.data));
    console.log(`✅ 音频已保存: ${outputFile}`);
    console.log(`   文件大小: ${fs.statSync(outputFile).size} bytes\n`);
    
    console.log('🎉 测试成功！');
    console.log('\n📋 下一步:');
    console.log(`   1. 播放音频: ffplay ${outputFile}`);
    console.log('   2. 或使用任何音频播放器打开文件');
    
  } catch (error) {
    console.error('❌ TTS API调用失败:');
    if (error.response) {
      console.error(`   HTTP状态: ${error.response.status}`);
      console.error(`   响应数据:`, error.response.data);
    } else {
      console.error(`   错误信息: ${error.message}`);
    }
  }
}

testMediaCenterTTS().catch(console.error);

