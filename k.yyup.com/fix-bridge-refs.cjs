#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// 恢复所有修改的文件
console.log('🔄 恢复所有修改的文件...\n');

execSync('git checkout .', { stdio: 'inherit' });

console.log('\n✅ 所有文件已恢复');
console.log('💡 现在服务器应该能够正常启动了！');
