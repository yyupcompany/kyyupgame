const path = require('path');
const fs = require('fs');

// 简化版的文件安全检查器（从TypeScript版本移植）
class FileSecurityChecker {
  static DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh', '.bash', '.zsh',
    '.ps1', '.psm1', '.dll', '.so', '.dylib', '.sys', '.drv'
  ];

  static ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'
  ];

  static DANGEROUS_SIGNATURES = [
    { signature: Buffer.from([0x4D, 0x5A]), description: 'PE/EXE' },
    { signature: Buffer.from([0x7F, 0x45, 0x4C, 0x46]), description: 'ELF' },
    { signature: Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), description: 'Mach-O' },
    { signature: Buffer.from([0x23, 0x21]), description: 'Script' },
  ];

  static isFileNameSafe(filename) {
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return { safe: false, reason: '文件名包含非法路径字符' };
    }

    if (filename.includes('\0')) {
      return { safe: false, reason: '文件名包含空字节' };
    }

    if (filename.length > 255) {
      return { safe: false, reason: '文件名过长' };
    }

    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(filename)) {
      return { safe: false, reason: '文件名包含非法字符' };
    }

    const parts = filename.split('.');
    if (parts.length > 2) {
      const secondExt = '.' + parts[parts.length - 2].toLowerCase();
      if (this.DANGEROUS_EXTENSIONS.includes(secondExt)) {
        return { safe: false, reason: '检测到双重扩展名攻击' };
      }
    }

    const ext = path.extname(filename).toLowerCase();
    if (this.DANGEROUS_EXTENSIONS.includes(ext)) {
      return { safe: false, reason: `不允许上传 ${ext} 类型的文件` };
    }

    return { safe: true };
  }

  static isFileContentSafe(filePath) {
    try {
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      for (const { signature, description } of this.DANGEROUS_SIGNATURES) {
        if (buffer.slice(0, signature.length).equals(signature)) {
          return { safe: false, reason: `检测到可执行文件签名: ${description}` };
        }
      }

      return { safe: true };
    } catch (error) {
      return { safe: false, reason: '无法读取文件内容' };
    }
  }

  static scanForMaliciousContent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      const maliciousPatterns = [
        /<script[^>]*>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=\s*["'][^"']*["']/gi,
        /eval\s*\(/gi,
        /exec\s*\(/gi,
        /system\s*\(/gi,
        /<iframe[^>]*>/gi,
        /<embed[^>]*>/gi,
        /<object[^>]*>/gi,
      ];

      for (const pattern of maliciousPatterns) {
        if (pattern.test(content)) {
          return { safe: false, reason: '检测到潜在的恶意代码' };
        }
      }

      return { safe: true };
    } catch (error) {
      return { safe: true };
    }
  }
}

// 测试函数
function testFile(filename, description) {
  const filePath = path.join(__dirname, 'server/test-files', filename);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 测试文件: ${filename}`);
  console.log(`📝 描述: ${description}`);
  console.log(`${'='.repeat(60)}`);
  
  // 1. 文件名检查
  const nameCheck = FileSecurityChecker.isFileNameSafe(filename);
  console.log(`\n1️⃣  文件名检查: ${nameCheck.safe ? '✅ 通过' : '❌ 失败'}`);
  if (!nameCheck.safe) {
    console.log(`   原因: ${nameCheck.reason}`);
  }
  
  // 2. 文件内容检查
  if (fs.existsSync(filePath)) {
    const contentCheck = FileSecurityChecker.isFileContentSafe(filePath);
    console.log(`2️⃣  文件签名检查: ${contentCheck.safe ? '✅ 通过' : '❌ 失败'}`);
    if (!contentCheck.safe) {
      console.log(`   原因: ${contentCheck.reason}`);
    }
    
    // 3. 恶意代码扫描
    const maliciousCheck = FileSecurityChecker.scanForMaliciousContent(filePath);
    console.log(`3️⃣  恶意代码扫描: ${maliciousCheck.safe ? '✅ 通过' : '❌ 失败'}`);
    if (!maliciousCheck.safe) {
      console.log(`   原因: ${maliciousCheck.reason}`);
    }
    
    // 综合结果
    const allPassed = nameCheck.safe && contentCheck.safe && maliciousCheck.safe;
    console.log(`\n🎯 综合结果: ${allPassed ? '✅ 文件安全' : '❌ 文件不安全'}`);
  } else {
    console.log(`❌ 文件不存在: ${filePath}`);
  }
}

// 运行测试
console.log('\n' + '='.repeat(60));
console.log('🔒 文件安全检测系统测试');
console.log('='.repeat(60));

testFile('test-image.jpg', '正常的图片文件');
testFile('test-document.pdf', '正常的PDF文档');
testFile('test-video.mp4', '正常的视频文件');
testFile('test-document.txt', '正常的文本文件');
testFile('malicious.exe', '恶意可执行文件（应被拒绝）');
testFile('malicious.html', '包含脚本的HTML文件（应被拒绝）');

// 测试文件名攻击
console.log(`\n${'='.repeat(60)}`);
console.log('🚨 文件名攻击测试');
console.log(`${'='.repeat(60)}`);

const attackFilenames = [
  '../../../etc/passwd',
  'test.jpg.exe',
  'test<script>.jpg',
  'test\0.jpg',
  'a'.repeat(300) + '.jpg'
];

attackFilenames.forEach(filename => {
  const check = FileSecurityChecker.isFileNameSafe(filename);
  console.log(`\n📛 ${filename}`);
  console.log(`   结果: ${check.safe ? '❌ 未检测到' : '✅ 已拦截'}`);
  if (!check.safe) {
    console.log(`   原因: ${check.reason}`);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log('✅ 文件安全检测测试完成');
console.log(`${'='.repeat(60)}\n`);

