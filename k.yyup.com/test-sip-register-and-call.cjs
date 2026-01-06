#!/usr/bin/env node

const dgram = require('dgram');

// 创建UDP socket
const sock = dgram.createSocket('udp4');

// Kamailio服务器信息
const serverIp = '47.94.82.59';
const serverPort = 5060;

// 本地信息
const localIp = '192.168.1.243';
const localPort = 5062; // 使用5062避免与后端服务冲突

// 目标号码
const phoneNumber = '18611141133';

// RTP端口
const rtpPort = 10000;

let registered = false;

console.log('🚀 SIP注册和呼叫测试');
console.log('─'.repeat(60));
console.log(`📍 本地: ${localIp}:${localPort}`);
console.log(`🌐 服务器: ${serverIp}:${serverPort}`);
console.log(`📞 目标号码: ${phoneNumber}`);
console.log(`🎵 RTP端口: ${rtpPort}`);
console.log('─'.repeat(60));

// 步骤1: 发送REGISTER
function sendRegister() {
  const timestamp = Date.now();
  const branch = `z9hG4bK-reg${timestamp}`;
  const tag = `tag-reg${timestamp}`;
  const callId = `register-${timestamp}@${localIp}`;

  const registerMessage = `REGISTER sip:${serverIp} SIP/2.0\r
Via: SIP/2.0/UDP ${localIp}:${localPort};branch=${branch}\r
Max-Forwards: 70\r
From: <sip:test@${serverIp}>;tag=${tag}\r
To: <sip:test@${serverIp}>\r
Call-ID: ${callId}\r
CSeq: 1 REGISTER\r
Contact: <sip:test@${localIp}:${localPort}>\r
Expires: 3600\r
Content-Length: 0\r
\r
`;

  console.log('\n📝 步骤1: 发送SIP REGISTER');
  console.log('─'.repeat(60));
  console.log(registerMessage);
  console.log('─'.repeat(60));

  const message = Buffer.from(registerMessage);
  sock.send(message, 0, message.length, serverPort, serverIp, (err) => {
    if (err) {
      console.error('❌ 发送REGISTER失败:', err);
      sock.close();
      process.exit(1);
    }
    console.log('✅ REGISTER已发送，等待响应...\n');
  });
}

// 步骤2: 发送INVITE
function sendInvite() {
  const timestamp = Date.now();
  const branch = `z9hG4bK-inv${timestamp}`;
  const tag = `tag-inv${timestamp}`;
  const callId = `call-${phoneNumber}-${timestamp}@${localIp}`;
  const sessionId = timestamp;

  // 生成SDP
  const sdpBody = `v=0\r
o=- ${sessionId} ${sessionId} IN IP4 ${localIp}\r
s=Call\r
c=IN IP4 ${localIp}\r
t=0 0\r
m=audio ${rtpPort} RTP/AVP 0 8 101\r
a=rtpmap:0 PCMU/8000\r
a=rtpmap:8 PCMA/8000\r
a=rtpmap:101 telephone-event/8000\r
a=fmtp:101 0-15\r
a=sendrecv\r
a=ptime:20\r
`;

  const contentLength = Buffer.byteLength(sdpBody);

  const inviteMessage = `INVITE sip:${phoneNumber}@${serverIp} SIP/2.0\r
Via: SIP/2.0/UDP ${localIp}:${localPort};branch=${branch}\r
Max-Forwards: 70\r
From: "Test Caller" <sip:test@${localIp}>;tag=${tag}\r
To: <sip:${phoneNumber}@${serverIp}>\r
Call-ID: ${callId}\r
CSeq: 100 INVITE\r
Contact: <sip:test@${localIp}:${localPort}>\r
Content-Type: application/sdp\r
Content-Length: ${contentLength}\r
\r
${sdpBody}`;

  console.log('\n📝 步骤2: 发送SIP INVITE');
  console.log('─'.repeat(60));
  console.log(inviteMessage);
  console.log('─'.repeat(60));

  const message = Buffer.from(inviteMessage);
  sock.send(message, 0, message.length, serverPort, serverIp, (err) => {
    if (err) {
      console.error('❌ 发送INVITE失败:', err);
      sock.close();
      process.exit(1);
    }
    console.log('✅ INVITE已发送，等待响应...\n');
  });
}

// 绑定本地端口
sock.bind(localPort, localIp, () => {
  console.log(`\n✅ Socket绑定到 ${localIp}:${localPort}\n`);
  
  // 发送REGISTER
  sendRegister();
});

// 设置超时
const timeout = setTimeout(() => {
  console.log('\n⏱️  30秒内未完成测试');
  sock.close();
  process.exit(0);
}, 30000);

// 接收响应
sock.on('message', (msg, rinfo) => {
  console.log(`📥 收到来自 ${rinfo.address}:${rinfo.port} 的响应:\n`);
  console.log('─'.repeat(60));
  console.log(msg.toString());
  console.log('─'.repeat(60));
  
  const response = msg.toString();
  const statusLine = response.split('\r\n')[0];
  console.log(`\n📊 状态: ${statusLine}`);
  
  // 检查是否是REGISTER响应
  if (response.includes('CSeq: 1 REGISTER')) {
    if (statusLine.includes('200 OK')) {
      console.log('✅ SIP注册成功！服务器已记录我们的NAT映射地址');
      registered = true;
      
      // 等待1秒后发送INVITE
      setTimeout(() => {
        sendInvite();
      }, 1000);
    } else if (statusLine.includes('401') || statusLine.includes('407')) {
      console.log('🔐 需要认证（当前测试无认证模式）');
      // 即使需要认证，也尝试发送INVITE
      setTimeout(() => {
        sendInvite();
      }, 1000);
    } else {
      console.log(`⚠️  注册响应: ${statusLine}`);
      // 继续尝试INVITE
      setTimeout(() => {
        sendInvite();
      }, 1000);
    }
  }
  
  // 检查是否是INVITE响应
  if (response.includes('CSeq: 100 INVITE')) {
    if (statusLine.includes('100 Trying')) {
      console.log('📞 呼叫尝试中...');
    } else if (statusLine.includes('180 Ringing')) {
      console.log('📞 对方振铃中...');
    } else if (statusLine.includes('200 OK')) {
      console.log('✅ 呼叫接通！');
      
      // 解析SDP获取RTP信息
      const rtpMatch = response.match(/m=audio\s+(\d+)/);
      const ipMatch = response.match(/c=IN\s+IP4\s+([\d.]+)/);
      
      if (rtpMatch && ipMatch) {
        console.log(`\n🎵 RTP信息:`);
        console.log(`   远程IP: ${ipMatch[1]}`);
        console.log(`   远程端口: ${rtpMatch[1]}`);
        console.log(`   本地端口: ${rtpPort}`);
        console.log('\n✅ 测试成功！可以开始RTP音频传输了！');
      }
      
      clearTimeout(timeout);
      setTimeout(() => {
        sock.close();
        process.exit(0);
      }, 2000);
    } else if (statusLine.includes('401') || statusLine.includes('407')) {
      console.log('🔐 需要认证');
    } else if (statusLine.includes('403')) {
      console.log('🚫 禁止访问');
    } else if (statusLine.includes('404')) {
      console.log('❌ 未找到');
    } else {
      console.log('ℹ️  其他响应');
    }
  }
});

// 错误处理
sock.on('error', (err) => {
  console.error('❌ Socket错误:', err);
  sock.close();
  process.exit(1);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n\n👋 退出测试');
  sock.close();
  process.exit(0);
});

