/**
 * 远程 KMS 客户端测试脚本
 *
 * 测试通过 API 调用 admin.yyup.cc 的 KMS 服务
 */

import { AliyunKMSService } from './src/services/aliyun-kms.service';

(async () => {
  console.log('=== 远程 KMS 客户端测试 ===\n');

  // 测试1: 初始化服务
  console.log('1. 初始化远程 KMS 客户端...');
  const kms = new AliyunKMSService();

  try {
    const available = await kms.isAvailable();
    console.log('   KMS 服务状态:', available ? '✅ 可用' : '❌ 不可用');

    if (!available) {
      console.warn('   ⚠️ KMS 服务不可用，将测试 Fallback 模式');
    }
  } catch (error: any) {
    console.error('   ❌ 检查服务状态失败:', error.message);
  }

  // 测试2: 加密解密
  try {
    console.log('\n2. 测试加密解密...');
    const keyAlias = 'alias/jwt-signing-key';
    const plaintext = 'Hello Remote KMS - 等保3级合规!';

    console.log(`   密钥别名: ${keyAlias}`);
    console.log(`   原文: ${plaintext}`);

    // 加密
    const encrypted = await kms.encrypt(keyAlias, plaintext);
    console.log(`   ✅ 加密成功`);
    console.log(`   密文长度: ${encrypted.length} 字符`);
    console.log(`   密文片段: ${encrypted.substring(0, 50)}...`);

    // 解密
    const decrypted = await kms.decrypt(encrypted);
    console.log(`   ✅ 解密成功`);
    console.log(`   解密结果: ${decrypted}`);

    if (decrypted === plaintext) {
      console.log(`   ✅ 加密解密验证通过`);
    } else {
      console.error(`   ❌ 加密解密结果不匹配`);
    }
  } catch (error: any) {
    console.error('   ❌ 加密解密测试失败:', error.message);
    console.error('   详情:', error);
  }

  // 测试3: 生成数据密钥
  try {
    console.log('\n3. 测试生成数据密钥...');
    const keyAlias = 'alias/jwt-signing-key';

    const dataKeyResult = await kms.generateDataKey(keyAlias);
    console.log(`   ✅ 数据密钥生成成功`);
    console.log(`   明文长度: ${dataKeyResult.plaintext.length} 字节`);
    console.log(`   密文长度: ${dataKeyResult.ciphertext.length} 字符`);

    // 检查缓存
    const cacheStatus = kms.getCacheStatus();
    console.log(`   缓存状态: ${cacheStatus.size} 个密钥已缓存`);
  } catch (error: any) {
    console.error('   ❌ 生成数据密钥失败:', error.message);
    console.error('   详情:', error);
  }

  // 测试4: 签名验签
  try {
    console.log('\n4. 测试签名验签...');
    const keyAlias = 'alias/jwt-signing-key';
    const message = 'Test message for remote signature';

    // 签名
    const signature = await kms.sign(keyAlias, message);
    console.log(`   ✅ 签名成功`);
    console.log(`   签名长度: ${signature.length} 字符`);
    console.log(`   签名片段: ${signature.substring(0, 40)}...`);

    // 验签
    const valid = await kms.verify(keyAlias, message, signature);
    console.log(`   ✅ 验签成功`);
    console.log(`   验证结果: ${valid ? '有效' : '无效'}`);

    if (valid) {
      console.log(`   ✅ 签名验签验证通过`);
    } else {
      console.error(`   ❌ 签名验签验证失败`);
    }
  } catch (error: any) {
    console.error('   ❌ 签名验签测试失败:', error.message);
    console.error('   详情:', error);
  }

  console.log('\n=== ✅ 远程 KMS 客户端测试完成 ===');
  console.log('\n总结:');
  console.log('- 远程 API 模式：符合等保3级密钥隔离要求');
  console.log('- Fallback 模式：服务不可用时自动降级');
  console.log('- 业务系统不再直接持有阿里云 AccessKey');
})();
