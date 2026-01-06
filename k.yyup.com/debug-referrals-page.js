// 老带新推广页面调试脚本
// 在浏览器控制台中运行此脚本

console.log('========================================');
console.log('  老带新推广页面调试工具');
console.log('========================================');
console.log('');

// 1. 检查页面是否正确加载
console.log('1. 检查页面加载状态...');
const pageTitle = document.querySelector('.page-header .page-title');
if (pageTitle) {
  console.log('✅ 页面标题:', pageTitle.textContent);
} else {
  console.log('❌ 未找到页面标题');
}
console.log('');

// 2. 检查所有按钮
console.log('2. 检查页面中的所有按钮...');
const allButtons = document.querySelectorAll('button');
console.log(`找到 ${allButtons.length} 个按钮:`);
allButtons.forEach((btn, index) => {
  const text = btn.textContent.trim();
  const classes = btn.className;
  const visible = btn.offsetParent !== null;
  const disabled = btn.disabled;
  console.log(`  [${index}] "${text}" - 可见:${visible}, 禁用:${disabled}, 类名:${classes}`);
});
console.log('');

// 3. 查找特定按钮
console.log('3. 查找推广相关按钮...');
const buttons = Array.from(allButtons);
const posterButton = buttons.find(btn => btn.textContent.includes('生成推广海报'));
const qrcodeButton = buttons.find(btn => btn.textContent.includes('生成推广二维码'));

if (posterButton) {
  console.log('✅ 找到"生成推广海报"按钮');
  console.log('   - 文本:', posterButton.textContent.trim());
  console.log('   - 类名:', posterButton.className);
  console.log('   - 可见:', posterButton.offsetParent !== null);
  console.log('   - 位置:', posterButton.getBoundingClientRect());
} else {
  console.log('❌ 未找到"生成推广海报"按钮');
}

if (qrcodeButton) {
  console.log('✅ 找到"生成推广二维码"按钮');
  console.log('   - 文本:', qrcodeButton.textContent.trim());
  console.log('   - 类名:', qrcodeButton.className);
  console.log('   - 可见:', qrcodeButton.offsetParent !== null);
  console.log('   - 位置:', qrcodeButton.getBoundingClientRect());
} else {
  console.log('❌ 未找到"生成推广二维码"按钮');
}
console.log('');

// 4. 检查对话框元素
console.log('4. 检查对话框元素...');
const dialogs = document.querySelectorAll('.el-dialog');
console.log(`找到 ${dialogs.length} 个对话框:`);
dialogs.forEach((dialog, index) => {
  const title = dialog.querySelector('.el-dialog__title');
  const wrapper = dialog.closest('.el-dialog__wrapper');
  const visible = wrapper && wrapper.style.display !== 'none';
  console.log(`  [${index}] 标题:"${title?.textContent || '无'}", 显示:${visible}`);
});
console.log('');

// 5. 尝试手动触发点击
console.log('5. 尝试手动触发按钮点击...');
if (posterButton) {
  console.log('点击"生成推广海报"按钮...');
  posterButton.click();
  setTimeout(() => {
    const posterDialog = Array.from(dialogs).find(d => 
      d.querySelector('.el-dialog__title')?.textContent.includes('生成推广海报')
    );
    if (posterDialog) {
      const wrapper = posterDialog.closest('.el-dialog__wrapper');
      const visible = wrapper && wrapper.style.display !== 'none';
      console.log(visible ? '✅ 海报对话框已显示' : '❌ 海报对话框未显示');
    }
  }, 500);
}

if (qrcodeButton) {
  setTimeout(() => {
    console.log('点击"生成推广二维码"按钮...');
    qrcodeButton.click();
    setTimeout(() => {
      const qrcodeDialog = Array.from(dialogs).find(d => 
        d.querySelector('.el-dialog__title')?.textContent.includes('生成推广二维码')
      );
      if (qrcodeDialog) {
        const wrapper = qrcodeDialog.closest('.el-dialog__wrapper');
        const visible = wrapper && wrapper.style.display !== 'none';
        console.log(visible ? '✅ 二维码对话框已显示' : '❌ 二维码对话框未显示');
      }
    }, 500);
  }, 1000);
}
console.log('');

// 6. 检查控制台错误
console.log('6. 检查是否有JavaScript错误...');
console.log('请查看控制台中是否有红色错误信息');
console.log('');

// 7. 检查Vue组件
console.log('7. 检查Vue组件状态...');
console.log('请打开Vue DevTools,查看以下内容:');
console.log('  - 找到 marketing/referrals 页面组件');
console.log('  - 查看 showPosterDialog 的值 (应该在点击后变为 true)');
console.log('  - 查看 showQrcodeDialog 的值 (应该在点击后变为 true)');
console.log('  - 查看 handleShowPosterDialog 和 handleShowQrcodeDialog 方法是否存在');
console.log('');

// 8. 提供解决方案
console.log('========================================');
console.log('  可能的问题和解决方案');
console.log('========================================');
console.log('');
console.log('如果按钮不可见:');
console.log('  - 检查CSS是否隐藏了按钮');
console.log('  - 检查是否有其他元素遮挡');
console.log('  - 检查浏览器窗口大小,按钮可能在视口外');
console.log('');
console.log('如果按钮可见但点击无效:');
console.log('  - 检查控制台是否有"点击生成推广"的日志');
console.log('  - 检查Vue组件是否正确挂载');
console.log('  - 检查事件监听器是否正确绑定');
console.log('  - 尝试刷新页面 (Ctrl+Shift+R)');
console.log('');
console.log('如果对话框不显示:');
console.log('  - 检查 showPosterDialog/showQrcodeDialog 的值');
console.log('  - 检查对话框组件是否正确导入');
console.log('  - 检查Element Plus是否正确安装');
console.log('');
console.log('========================================');
console.log('  调试完成');
console.log('========================================');

