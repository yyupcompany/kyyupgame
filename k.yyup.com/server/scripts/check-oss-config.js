#!/usr/bin/env node

/**
 * OSS配置检查脚本
 * 用于验证OSS配置是否正确
 */

require('dotenv').config();

console.log('='.repeat(60));
console.log('📋 OSS配置检查');
console.log('='.repeat(60));

const configs = [
  {
    name: 'OSS上海（人脸识别相册）',
    checks: [
      { key: 'OSS_ACCESS_KEY_ID', desc: 'AccessKey ID' },
      { key: 'OSS_ACCESS_KEY_SECRET', desc: 'AccessKey Secret' },
      { key: 'OSS_BUCKET', desc: 'Bucket名称' },
      { key: 'OSS_REGION', desc: '区域' },
      { key: 'OSS_PATH_PREFIX', desc: '路径前缀', optional: true },
    ]
  },
  {
    name: 'OSS广州（系统存储）',
    checks: [
      { key: 'SYSTEM_OSS_ACCESS_KEY_ID', desc: 'AccessKey ID' },
      { key: 'SYSTEM_OSS_ACCESS_KEY_SECRET', desc: 'AccessKey Secret' },
      { key: 'SYSTEM_OSS_BUCKET', desc: 'Bucket名称' },
      { key: 'SYSTEM_OSS_REGION', desc: '区域' },
      { key: 'SYSTEM_OSS_PATH_PREFIX', desc: '路径前缀', optional: true },
    ]
  }
];

let allConfigured = true;
let hasWarnings = false;

configs.forEach(config => {
  console.log('\n' + '─'.repeat(60));
  console.log(`📦 ${config.name}`);
  console.log('─'.repeat(60));

  let configComplete = true;

  config.checks.forEach(check => {
    const value = process.env[check.key];
    const hasValue = value && value.trim() !== '';
    const status = hasValue ? '✅' : (check.optional ? '⚠️' : '❌');
    const label = check.optional ? '(可选)' : '(必需)';

    if (!hasValue && !check.optional) {
      configComplete = false;
      allConfigured = false;
    }

    if (!hasValue && check.optional) {
      hasWarnings = true;
    }

    const displayValue = hasValue
      ? (check.key.includes('SECRET') ? '********' : value.substring(0, 20) + (value.length > 20 ? '...' : ''))
      : '未配置';

    console.log(`${status} ${check.desc} ${label}`);
    console.log(`   ${check.key}=${displayValue}`);
  });

  if (configComplete) {
    console.log('\n✅ 此配置完整，OSS服务可用');
  } else {
    console.log('\n❌ 此配置不完整，OSS服务不可用');
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 总结');
console.log('='.repeat(60));

if (allConfigured) {
  console.log('✅ 所有必需的OSS配置都已完成');
  if (hasWarnings) {
    console.log('⚠️  有一些可选配置未设置，建议补充');
  }
} else {
  console.log('❌ OSS配置不完整，需要补充以下信息：');
  console.log('');
  console.log('📝 配置步骤：');
  console.log('1. 登录阿里云控制台：https://ram.console.aliyun.com/');
  console.log('2. 访问：RAM访问控制 → 用户 → AccessKey管理');
  console.log('3. 创建或查看现有的AccessKey');
  console.log('4. 编辑 server/.env 文件，填入以下变量：');
  console.log('');
  console.log('   OSS_ACCESS_KEY_ID=<你的AccessKey ID>');
  console.log('   OSS_ACCESS_KEY_SECRET=<你的AccessKey Secret>');
  console.log('   OSS_BUCKET=faceshanghaikarden');
  console.log('   OSS_REGION=oss-cn-shanghai');
  console.log('');
  console.log('5. 重启后端服务：npm run dev');
  console.log('');
  console.log('⚠️  注意：AccessKey Secret只在创建时显示一次，请妥善保管！');
}

console.log('='.repeat(60));

// 退出码：0=成功，1=配置不完整
process.exit(allConfigured ? 0 : 1);



