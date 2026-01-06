// AI助手文件上传功能浏览器测试脚本
// 在浏览器控制台中运行此脚本来测试文件上传功能

console.log('🚀 开始AI助手文件上传功能浏览器测试\n');

// 1. 查找文件上传相关的DOM元素
console.log('🔍 步骤1: 查找文件上传相关元素...');

// 查找隐藏的文件输入框
const fileInputs = document.querySelectorAll('input[type="file"]');
console.log('📄 找到的文件输入框数量:', fileInputs.length);

fileInputs.forEach((input, index) => {
  console.log(`📄 文件输入框 ${index + 1}:`, {
    accept: input.accept,
    style: input.style.cssText,
    ref: input.getAttribute('ref'),
    display: window.getComputedStyle(input).display
  });
});

// 查找上传按钮（通过不同的可能选择器）
const uploadSelectors = [
  'button[title*="上传"]',
  '.icon-btn',
  '[class*="upload"]',
  '[onclick*="upload"]',
  '[data-*="upload"]'
];

let foundButtons = [];
uploadSelectors.forEach(selector => {
  const buttons = document.querySelectorAll(selector);
  if (buttons.length > 0) {
    console.log(`🔘 通过选择器 "${selector}" 找到 ${buttons.length} 个按钮`);
    buttons.forEach((btn, index) => {
      if (btn.title.includes('上传') || btn.textContent.includes('上传')) {
        foundButtons.push({
          selector,
          index,
          title: btn.title,
          text: btn.textContent,
          element: btn
        });
      }
    });
  }
});

console.log('🔘 找到的上传按钮:', foundButtons.length);
foundButtons.forEach((btn, index) => {
  console.log(`🔘 上传按钮 ${index + 1}:`, {
    title: btn.title,
    text: btn.text,
    disabled: btn.element.disabled,
    visible: window.getComputedStyle(btn.element).display !== 'none'
  });
});

// 2. 查找Vue组件实例
console.log('\n🔍 步骤2: 查找Vue组件实例...');

// 查找输入区域组件
const inputContainers = document.querySelectorAll('.claude-input-container, [class*="input"], [class*="chat"]');
console.log('📱 找到的输入容器数量:', inputContainers.length);

// 尝试访问Vue应用实例
if (window.__VUE__) {
  console.log('✅ 检测到Vue应用实例');
} else {
  console.log('❌ 未检测到Vue应用实例');
}

// 3. 创建测试函数
console.log('\n🛠️ 步骤3: 创建测试函数...');

window.testFileUpload = {
  // 直接触发文件输入框
  triggerFileInput: function(index = 0) {
    const fileInputs = document.querySelectorAll('input[type="file"][accept*="document"], input[type="file"][accept*="pdf"], input[type="file"][accept*="txt"]');
    if (fileInputs.length > index) {
      console.log(`📄 触发文档文件输入框 ${index}`);
      fileInputs[index].click();
      return true;
    } else {
      console.log('❌ 未找到文档文件输入框');
      return false;
    }
  },

  triggerImageInput: function(index = 0) {
    const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    if (fileInputs.length > index) {
      console.log(`🖼️ 触发图片文件输入框 ${index}`);
      fileInputs[index].click();
      return true;
    } else {
      console.log('❌ 未找到图片文件输入框');
      return false;
    }
  },

  // 创建虚拟文件并触发上传
  createAndUploadFile: function(type = 'document') {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    let targetInput = null;

    if (type === 'document') {
      targetInput = Array.from(fileInputs).find(input =>
        input.accept.includes('pdf') || input.accept.includes('txt') || input.accept.includes('doc')
      );
    } else if (type === 'image') {
      targetInput = Array.from(fileInputs).find(input =>
        input.accept.includes('image')
      );
    }

    if (!targetInput) {
      console.log(`❌ 未找到 ${type} 文件输入框`);
      return false;
    }

    // 创建虚拟文件
    let file;
    if (type === 'document') {
      const content = '这是一个测试文档内容，用于验证AI文档分析功能。\n\n包含信息：\n1. 幼儿园招生政策\n2. 收费标准\n3. 报名流程';
      file = new File([content], 'test-document.txt', { type: 'text/plain' });
    } else if (type === 'image') {
      const svgContent = `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="150" fill="#E3F2FD"/>
        <text x="100" y="75" text-anchor="middle" font-family="Arial" font-size="16" fill="#1976D2">测试图片</text>
      </svg>`;
      file = new File([svgContent], 'test-image.svg', { type: 'image/svg+xml' });
    }

    // 创建DataTransfer对象来模拟文件选择
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    targetInput.files = dataTransfer.files;

    console.log(`📄 创建了 ${type} 测试文件:`, file.name);

    // 触发change事件
    const event = new Event('change', { bubbles: true });
    targetInput.dispatchEvent(event);

    return true;
  },

  // 查找并点击上传按钮
  clickUploadButton: function(type = 'document') {
    const buttons = document.querySelectorAll('button[title*="上传"], button[class*="upload"]');

    for (let button of buttons) {
      if (type === 'document' && button.title.includes('文件')) {
        console.log('📄 点击文档上传按钮');
        button.click();
        return true;
      } else if (type === 'image' && button.title.includes('图片')) {
        console.log('🖼️ 点击图片上传按钮');
        button.click();
        return true;
      }
    }

    console.log(`❌ 未找到 ${type} 上传按钮`);
    return false;
  },

  // 综合测试
  runFullTest: function() {
    console.log('🧪 开始完整测试...');

    this.testFileInput();
    this.testImageInput();
    this.testUploadButtons();
  },

  // 测试文件输入框
  testFileInput: function() {
    console.log('\n📄 测试文档文件输入框...');
    return this.triggerFileInput();
  },

  // 测试图片输入框
  testImageInput: function() {
    console.log('\n🖼️ 测试图片文件输入框...');
    return this.triggerImageInput();
  },

  // 测试上传按钮
  testUploadButtons: function() {
    console.log('\n🔘 测试上传按钮...');
    const docResult = this.clickUploadButton('document');
    const imgResult = this.clickUploadButton('image');
    return { docResult, imgResult };
  }
};

console.log('\n✅ 测试函数已创建！');
console.log('📋 使用方法:');
console.log('  testFileUpload.triggerFileInput() - 触发文档文件输入');
console.log('  testFileUpload.triggerImageInput() - 触发图片文件输入');
console.log('  testFileUpload.createAndUploadFile("document") - 创建并上传文档');
console.log('  testFileUpload.createAndUploadFile("image") - 创建并上传图片');
console.log('  testFileUpload.clickUploadButton("document") - 点击文档上传按钮');
console.log('  testFileUpload.clickUploadButton("image") - 点击图片上传按钮');
console.log('  testFileUpload.runFullTest() - 运行完整测试\n');

// 自动运行基础检测
testFileUpload.testFileInput();
testFileUpload.testImageInput();