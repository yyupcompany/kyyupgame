/**
 * TTS → ASR 端到端测试
 * 
 * 流程:
 * 1. 使用TTS生成语音（MP3格式）
 * 2. 转换为PCM格式（ASR需要）
 * 3. 使用ASR识别语音
 * 4. 比较识别结果和原始文本
 */

const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// 测试配置
const TEST_TEXT = '你好，我是智能语音助手，很高兴为您服务。';
const BASE_URL = 'http://localhost:3000';
const LOGIN_API = `${BASE_URL}/api/auth/login`;
const TTS_API = `${BASE_URL}/api/ai/text-to-speech`;
const OUTPUT_MP3 = 'test-tts-output.mp3';
const OUTPUT_PCM = 'test-tts-output.pcm';

// 登录凭证
const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// ASR配置（从数据库获取）
const ASR_CONFIG = {
  appId: '7563592522',
  appKey: '7563592522',
  accessKey: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  resourceId: 'volc.bigasr.sauc.duration',
  endpoint: 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel'
};

console.log('╔════════════════════════════════════════╗');
console.log('║   TTS → ASR 端到端测试                 ║');
console.log('╚════════════════════════════════════════╝\n');

async function main() {
  let authToken = null;

  try {
    // 步骤1: 登录获取token
    console.log('📋 步骤1: 登录获取认证token...');
    try {
      const loginResponse = await axios.post(LOGIN_API, LOGIN_CREDENTIALS);
      if (loginResponse.data.success && loginResponse.data.data.token) {
        authToken = loginResponse.data.data.token;
        console.log('✅ 登录成功\n');
      } else {
        throw new Error('登录失败：未获取到token');
      }
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      console.error('   请确保后端服务正在运行，并且登录凭证正确\n');
      process.exit(1);
    }

    // 步骤2: 检查ffmpeg
    console.log('📋 步骤2: 检查ffmpeg...');
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      console.log('✅ ffmpeg已安装\n');
    } catch (error) {
      console.error('❌ ffmpeg未安装，请先安装ffmpeg:');
      console.error('   Ubuntu/Debian: sudo apt-get install ffmpeg');
      console.error('   macOS: brew install ffmpeg');
      console.error('   Windows: 从 https://ffmpeg.org/download.html 下载\n');
      process.exit(1);
    }

    // 步骤3: 调用TTS生成语音
    console.log('📋 步骤3: 调用TTS生成语音...');
    console.log(`   文本: "${TEST_TEXT}"`);

    const ttsStartTime = Date.now();
    const ttsResponse = await axios.post(TTS_API, {
      text: TEST_TEXT,
      voice: 'nova',
      speed: 1.0,
      format: 'mp3'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const ttsTime = Date.now() - ttsStartTime;

    if (ttsResponse.status !== 200) {
      throw new Error(`TTS API返回错误: ${ttsResponse.status}`);
    }

    // 检查响应数据
    if (!ttsResponse.data || ttsResponse.data.length === 0) {
      console.error('❌ TTS返回空数据');
      console.error('   响应头:', ttsResponse.headers);
      throw new Error('TTS返回空数据');
    }

    // 保存MP3文件
    fs.writeFileSync(OUTPUT_MP3, ttsResponse.data);
    const mp3Size = fs.statSync(OUTPUT_MP3).size;

    if (mp3Size === 0) {
      throw new Error('生成的MP3文件为空');
    }

    console.log(`✅ TTS生成成功: ${mp3Size} bytes, 耗时 ${ttsTime}ms`);
    console.log(`   文件: ${OUTPUT_MP3}\n`);

    // 步骤4: 转换MP3为PCM
    console.log('📋 步骤4: 转换MP3为PCM格式...');
    
    const ffmpegCmd = `ffmpeg -i ${OUTPUT_MP3} -ar 16000 -ac 1 -f s16le -y ${OUTPUT_PCM}`;
    console.log(`   命令: ${ffmpegCmd}`);
    
    try {
      execSync(ffmpegCmd, { stdio: 'ignore' });
      const pcmSize = fs.statSync(OUTPUT_PCM).size;
      console.log(`✅ 转换成功: ${pcmSize} bytes`);
      console.log(`   文件: ${OUTPUT_PCM}\n`);
    } catch (error) {
      throw new Error(`音频转换失败: ${error.message}`);
    }

    // 步骤5: 调用ASR识别
    console.log('📋 步骤5: 调用ASR识别语音...');

    const asrResult = await testASR(OUTPUT_PCM);

    console.log(`✅ ASR识别完成\n`);

    // 步骤6: 比较结果
    console.log('📋 步骤6: 比较识别结果...');
    console.log('─'.repeat(50));
    console.log(`原始文本: ${TEST_TEXT}`);
    console.log(`识别文本: ${asrResult.text}`);
    console.log('─'.repeat(50));
    
    // 计算相似度（简单的字符匹配）
    const similarity = calculateSimilarity(TEST_TEXT, asrResult.text);
    console.log(`\n相似度: ${(similarity * 100).toFixed(2)}%`);
    
    if (similarity >= 0.8) {
      console.log('✅ 测试通过！识别准确率良好\n');
    } else if (similarity >= 0.5) {
      console.log('⚠️  测试部分通过，识别准确率一般\n');
    } else {
      console.log('❌ 测试失败，识别准确率较低\n');
    }

    // 清理临时文件
    console.log('📋 清理临时文件...');
    if (fs.existsSync(OUTPUT_MP3)) {
      console.log(`   保留: ${OUTPUT_MP3}`);
    }
    if (fs.existsSync(OUTPUT_PCM)) {
      console.log(`   保留: ${OUTPUT_PCM}`);
    }
    console.log('   (如需删除，请手动删除)\n');

    console.log('🎉 测试完成！\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

/**
 * 测试ASR识别
 */
async function testASR(pcmFilePath) {
  return new Promise((resolve, reject) => {
    const WebSocket = require('ws');
    const zlib = require('zlib');
    const { v4: uuidv4 } = require('uuid');

    const sessionId = uuidv4();
    let recognizedText = '';
    let isFinal = false;

    console.log('   连接ASR服务...');

    const ws = new WebSocket(ASR_CONFIG.endpoint, {
      headers: {
        'X-Api-App-Key': ASR_CONFIG.appKey,
        'X-Api-Access-Key': ASR_CONFIG.accessKey,
        'X-Api-Resource-Id': ASR_CONFIG.resourceId,
        'X-Api-Connect-Id': sessionId
      }
    });

    ws.on('open', () => {
      console.log('   ✅ WebSocket连接成功');
      
      // 发送Full client request
      sendFullClientRequest(ws, sessionId);
      
      // 读取PCM文件并发送
      setTimeout(() => {
        sendAudioData(ws, pcmFilePath);
      }, 500);
    });

    ws.on('message', (data) => {
      try {
        const result = parseBinaryMessage(data);
        if (result && result.text) {
          recognizedText = result.text;
          isFinal = result.isFinal;
          console.log(`   📝 识别结果: "${result.text}" (${result.isFinal ? '最终' : '临时'})`);
          
          if (result.isFinal) {
            ws.close();
            resolve({ text: recognizedText, isFinal: true });
          }
        }
      } catch (error) {
        console.error('   ❌ 消息解析失败:', error.message);
      }
    });

    ws.on('error', (error) => {
      console.error('   ❌ WebSocket错误:', error.message);
      reject(error);
    });

    ws.on('close', () => {
      console.log('   🔌 WebSocket连接关闭');
      if (!isFinal && recognizedText) {
        resolve({ text: recognizedText, isFinal: false });
      } else if (!recognizedText) {
        reject(new Error('未收到识别结果'));
      }
    });

    // 超时处理
    setTimeout(() => {
      if (!isFinal) {
        ws.close();
        if (recognizedText) {
          resolve({ text: recognizedText, isFinal: false });
        } else {
          reject(new Error('ASR识别超时'));
        }
      }
    }, 30000);
  });
}

/**
 * 发送Full client request
 */
function sendFullClientRequest(ws, sessionId) {
  const zlib = require('zlib');
  
  const payload = {
    user: { uid: sessionId },
    audio: {
      format: 'pcm',
      rate: 16000,
      bits: 16,
      channel: 1,
      language: 'zh-CN'
    },
    request: {
      model_name: 'bigmodel',
      enable_itn: true,
      enable_punc: true,
      enable_ddc: true
    }
  };
  
  const payloadJson = JSON.stringify(payload);
  const payloadCompressed = zlib.gzipSync(Buffer.from(payloadJson, 'utf-8'));
  
  const header = Buffer.alloc(4);
  header[0] = 0x11; // Protocol version 1, Header size 1
  header[1] = 0x10; // Message type: Full client request, No sequence
  header[2] = 0x11; // Serialization: JSON, Compression: Gzip
  header[3] = 0x00; // Reserved
  
  const payloadSize = Buffer.alloc(4);
  payloadSize.writeUInt32BE(payloadCompressed.length, 0);
  
  const message = Buffer.concat([header, payloadSize, payloadCompressed]);
  
  console.log(`   📤 发送Full client request: ${message.length} bytes`);
  ws.send(message);
}

/**
 * 发送音频数据
 */
function sendAudioData(ws, pcmFilePath) {
  const zlib = require('zlib');
  
  const audioData = fs.readFileSync(pcmFilePath);
  console.log(`   📤 发送音频数据: ${audioData.length} bytes`);
  
  // 分包发送（每包8KB）
  const chunkSize = 8192;
  let offset = 0;
  
  const sendInterval = setInterval(() => {
    if (offset >= audioData.length) {
      // 发送最后一包（空包）
      const header = Buffer.alloc(4);
      header[0] = 0x11;
      header[1] = 0x22; // Message type: Audio only, Last package
      header[2] = 0x01; // No serialization, Gzip compression
      header[3] = 0x00;
      
      const emptyCompressed = zlib.gzipSync(Buffer.alloc(0));
      const payloadSize = Buffer.alloc(4);
      payloadSize.writeUInt32BE(emptyCompressed.length, 0);
      
      const message = Buffer.concat([header, payloadSize, emptyCompressed]);
      ws.send(message);
      
      console.log('   🏁 发送结束信号');
      clearInterval(sendInterval);
      return;
    }
    
    const chunk = audioData.slice(offset, offset + chunkSize);
    const audioCompressed = zlib.gzipSync(chunk);
    
    const header = Buffer.alloc(4);
    header[0] = 0x11;
    header[1] = 0x21; // Message type: Audio only, Positive sequence
    header[2] = 0x01; // No serialization, Gzip compression
    header[3] = 0x00;
    
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(audioCompressed.length, 0);
    
    const message = Buffer.concat([header, payloadSize, audioCompressed]);
    ws.send(message);
    
    offset += chunkSize;
    console.log(`   📤 发送音频包: ${offset}/${audioData.length} bytes`);
  }, 100); // 每100ms发送一包
}

/**
 * 解析二进制消息
 */
function parseBinaryMessage(data) {
  const zlib = require('zlib');
  
  if (data.length < 12) {
    return null;
  }
  
  const header = data.slice(0, 4);
  const messageType = (header[1] >> 4) & 0x0F;
  const serialization = (header[2] >> 4) & 0x0F;
  const compression = header[2] & 0x0F;
  
  const payloadSize = data.readUInt32BE(8);
  const payload = data.slice(12, 12 + payloadSize);
  
  if (messageType === 0b1001) { // Full server response
    let decompressed = payload;
    if (compression === 0b0001) { // Gzip
      decompressed = zlib.gunzipSync(payload);
    }
    
    if (serialization === 0b0001) { // JSON
      const response = JSON.parse(decompressed.toString('utf-8'));
      if (response.result) {
        return {
          text: response.result.text || '',
          isFinal: response.result.is_final || false,
          confidence: response.result.confidence
        };
      }
    }
  }
  
  return null;
}

/**
 * 计算文本相似度（简单的字符匹配）
 */
function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // 移除标点符号和空格
  const clean1 = text1.replace(/[，。！？、\s]/g, '');
  const clean2 = text2.replace(/[，。！？、\s]/g, '');
  
  let matches = 0;
  const minLen = Math.min(clean1.length, clean2.length);
  
  for (let i = 0; i < minLen; i++) {
    if (clean1[i] === clean2[i]) {
      matches++;
    }
  }
  
  return matches / Math.max(clean1.length, clean2.length);
}

// 运行测试
main();

