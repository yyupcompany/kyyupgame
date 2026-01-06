#!/usr/bin/env node

const dgram = require('dgram');

// 创建UDP socket
const sock = dgram.createSocket('udp4');

// Kamailio服务器信息
const serverIp = '47.94.82.59';
const serverPort = 5060;

// 本地信息
const localIp = '192.168.1.243';
const localPort = 5061; // 使用5061避免与后端服务冲突

// 目标号码
const phoneNumber = '18611141133';

// RTP端口
const rtpPort = 10000;

// 简单的SIP INVITE消息
const callId = `test-call-${phoneNumber}-${Date.now()}@${localIp}`;
const branch = `z9hG4bK-test${Date.now()}`;
const tag = `test${Date.now()}`;
const sessionId = Date.now();

// 生成SDP body
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

const sipInvite = `INVITE sip:${phoneNumber}@${serverIp} SIP/2.0\r
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

console.log(`📞 发送INVITE到 ${phoneNumber}`);
console.log(`🌐 服务器: ${serverIp}:${serverPort}`);
console.log(`📍 本地: ${localIp}:${localPort}`);
console.log(`🎵 RTP端口: ${rtpPort}`);
console.log('\n📤 SDP Body:');
console.log('─'.repeat(60));
console.log(sdpBody);
console.log('─'.repeat(60));

console.log('\n📤 完整SIP消息:');
console.log('─'.repeat(60));
console.log(sipInvite);
console.log('─'.repeat(60));

// 绑定本地端口
sock.bind(localPort, localIp, () => {
  console.log(`\n✅ Socket绑定到 ${localIp}:${localPort}`);
  
  // 发送SIP INVITE
  const message = Buffer.from(sipInvite);
  sock.send(message, 0, message.length, serverPort, serverIp, (err) => {
    if (err) {
      console.error('❌ 发送失败:', err);
      sock.close();
      process.exit(1);
    }
    console.log('✅ SIP INVITE已发送');
    console.log('\n⏳ 等待响应...\n');
  });
});

// 设置超时
const timeout = setTimeout(() => {
  console.log('⏱️  5秒内未收到响应');
  sock.close();
  process.exit(0);
}, 5000);

// 接收响应
sock.on('message', (msg, rinfo) => {
  clearTimeout(timeout);
  console.log(`📥 收到来自 ${rinfo.address}:${rinfo.port} 的响应:\n`);
  console.log('─'.repeat(60));
  console.log(msg.toString());
  console.log('─'.repeat(60));
  
  // 解析响应状态
  const response = msg.toString();
  const statusLine = response.split('\r\n')[0];
  console.log(`\n📊 状态: ${statusLine}`);
  
  if (statusLine.includes('100 Trying') || statusLine.includes('180 Ringing') || statusLine.includes('200 OK')) {
    console.log('✅ 呼叫成功！');
  } else if (statusLine.includes('401') || statusLine.includes('407')) {
    console.log('🔐 需要认证');
  } else if (statusLine.includes('403')) {
    console.log('🚫 禁止访问');
  } else if (statusLine.includes('404')) {
    console.log('❌ 未找到');
  } else {
    console.log('ℹ️  其他响应');
  }
  
  sock.close();
  process.exit(0);
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

