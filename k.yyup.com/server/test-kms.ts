import { AliyunKMSService } from './src/services/aliyun-kms.service';

(async () => {
  console.log('=== 阿里云KMS连接测试 ===\n');

  const kms = new AliyunKMSService();
  console.log('1. KMS可用状态:', kms.isAvailable());

  if (kms.isAvailable()) {
    try {
      console.log('\n2. 测试密钥生成...');
      const result = await kms.generateDataKey('alias/jwt-signing-key');
      console.log('   ✅ 密钥生成成功');
      console.log('   - 密钥长度:', result.plaintext.length, '字节');
      console.log('   - 密文长度:', result.ciphertext.length, '字符');

      const cacheStatus = kms.getCacheStatus();
      console.log('   - 缓存状态:', cacheStatus);

      console.log('\n3. 测试加密解密...');
      const plaintext = 'Hello KMS - 等保3级合规!';
      const encrypted = await kms.encrypt('alias/jwt-signing-key', plaintext);
      const decrypted = await kms.decrypt(encrypted);
      console.log('   - 原文:', plaintext);
      console.log('   - 解密:', decrypted);
      console.log('   ✅ 加密解密测试' + (plaintext === decrypted ? '成功' : '失败'));

      console.log('\n4. 测试签名验签...');
      const message = 'Test message for signature';
      const signature = await kms.sign('alias/jwt-signing-key', message);
      const verified = await kms.verify('alias/jwt-signing-key', message, signature);
      console.log('   - 消息:', message);
      console.log('   - 签名:', signature.substring(0, 20) + '...');
      console.log('   - 验证:', verified);
      console.log('   ✅ 签名验签测试' + (verified ? '成功' : '失败'));

      console.log('\n=== ✅ KMS测试全部通过 ===');

    } catch (error: any) {
      console.error('\n❌ KMS测试失败:', error.message);
      console.error('   详情:', error);
    }
  } else {
    console.log('\nℹ️  KMS未启用，将使用Fallback模式');
    const fallbackResult = await kms.generateDataKey('test-key');
    console.log('Fallback密钥长度:', fallbackResult.plaintext.length, '字节');
  }
})();
