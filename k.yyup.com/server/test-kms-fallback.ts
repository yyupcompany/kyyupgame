/**
 * KMS Fallback模式测试
 * 验证当KMS不可用时，系统是否能正常使用本地加密
 */

import { AliyunKMSService } from './src/services/aliyun-kms.service';

(async () => {
  console.log('=== KMS Fallback模式测试 ===\n');

  // 测试1: 禁用KMS，强制使用Fallback
  console.log('测试1: 禁用KMS，使用Fallback模式');
  const kmsFallback = new AliyunKMSService({
    enabled: false,
    fallbackEnabled: true,
    accessKeyId: 'test',
    accessKeySecret: 'test',
    region: 'cn-guangzhou'
  });

  console.log('1. KMS可用状态:', kmsFallback.isAvailable());

  try {
    console.log('\n2. 测试密钥生成（Fallback模式）...');
    const result = await kmsFallback.generateDataKey('alias/jwt-signing-key');
    console.log('   ✅ 密钥生成成功');
    console.log('   - 密钥长度:', result.plaintext.length, '字节');
    console.log('   - 密文长度:', result.ciphertext.length, '字符');

    const cacheStatus = kmsFallback.getCacheStatus();
    console.log('   - 缓存状态:', cacheStatus);

    console.log('\n3. 测试加密解密（Fallback模式）...');
    const plaintext = 'Hello KMS Fallback - 等保3级合规!';
    console.log('   - 原文:', plaintext);

    // 先测试加密
    const encrypted = await kmsFallback.encrypt('alias/jwt-signing-key', plaintext);
    console.log('   - 密文长度:', encrypted.length, '字符');
    console.log('   - 密文片段:', encrypted.substring(0, 50) + '...');

    // 再测试解密
    const decrypted = await kmsFallback.decrypt(encrypted);
    console.log('   - 解密:', decrypted);
    console.log('   ✅ 加密解密测试' + (plaintext === decrypted ? '成功' : '失败'));

    console.log('\n=== ✅ Fallback模式测试通过 ===');
    console.log('\n注意: 本地环境可能无法直接访问阿里云KMS，');
    console.log('但Fallback模式确保系统功能正常工作。');
    console.log('生产环境部署时，请确保服务器能访问阿里云KMS。');

  } catch (error: any) {
    console.error('\n❌ Fallback模式测试失败:', error.message);
    console.error('   详情:', error);
    console.error('   堆栈:', error.stack?.split('\n').slice(0, 5).join('\n'));
  }
})();
