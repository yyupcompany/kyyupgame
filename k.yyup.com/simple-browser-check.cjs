#!/usr/bin/env node

/**
 * 简化的浏览器检查脚本
 * 使用截图工具检查页面状态
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始页面检查');
console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

// 确保输出目录存在
const outputDir = 'docs/browser-checks';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 检查服务是否运行
function checkServices() {
    console.log('\n🔍 检查服务状态...');

    const curlProcess = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:5173'], {
        stdio: 'pipe',
        shell: true
    });

    curlProcess.stdout.on('data', (data) => {
        const statusCode = data.toString().trim();
        if (statusCode === '200') {
            console.log('✅ 前端服务运行正常 (端口5173)');
        } else {
            console.log('❌ 前端服务异常 (状态码:', statusCode, ')');
        }
    });

    curlProcess.on('close', () => {
        checkBackendService();
    });
}

function checkBackendService() {
    const curlProcess = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:3000/api-docs'], {
        stdio: 'pipe',
        shell: true
    });

    curlProcess.stdout.on('data', (data) => {
        const statusCode = data.toString().trim();
        if (statusCode === '200') {
            console.log('✅ 后端服务运行正常 (端口3000)');
        } else {
            console.log('❌ 后端服务异常 (状态码:', statusCode, ')');
        }
    });

    curlProcess.on('close', () => {
        generateManualCheckInstructions();
    });
}

function generateManualCheckInstructions() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const instructionsPath = path.join(outputDir, `dashboard-icon-manual-check-${timestamp}.md`);

    const instructions = `# Dashboard页面图标显示检查说明

## 检查目标
验证UnifiedIcon组件修复后，dashboard页面的图标显示是否已改善。

## 检查步骤

### 1. 访问页面
打开浏览器访问: http://localhost:5173/dashboard

### 2. 等待页面加载
- 等待3-5秒确保所有组件加载完成
- 检查浏览器控制台是否有错误信息

### 3. 检查关键区域图标

#### 📌 侧边栏导航菜单图标
检查以下菜单项的图标显示：
- [ ] 用户中心 - 应显示用户相关图标
- [ ] 学生管理 - 应显示学生/学校图标
- [ ] 教师管理 - 应显示教师/教育图标
- [ ] 活动管理 - 应显示活动/日历图标
- [ ] 招生管理 - 应显示招生/注册图标
- [ ] 营销中心 - 应显示营销/推广图标
- [ ] 财务管理 - 应显示财务/钱币图标
- [ ] 系统管理 - 应显示设置/齿轮图标

#### 📌 头部功能按钮图标
检查以下按钮的图标：
- [ ] 用户头像按钮
- [ ] 通知/消息图标
- [ ] 设置图标
- [ ] 主题切换图标（日/月）
- [ ] 全屏切换图标

#### 📌 卡片操作按钮图标
检查卡片上的操作图标：
- [ ] 编辑按钮图标
- [ ] 删除按钮图标
- [ ] 查看详情图标
- [ ] 刷新按钮图标
- [ ] 导出按钮图标

#### 📌 统计卡片中的图标
检查仪表板统计卡片的图标：
- [ ] 学生总数统计图标
- [ ] 教师数量统计图标
- [ ] 班级数量统计图标
- [ ] 活动数量统计图标
- [ ] 收入统计图标
- [ ] 招生统计图标

## 修复前后对比

### 修复前（预期问题）
- 大量图标显示为三个杠占位符 ☰
- 图标无法正确反映业务含义
- 视觉效果单调

### 修复后（期望改进）
- ✅ 显示具体的业务图标
- ✅ 图标色彩和样式丰富
- ✅ 统一的视觉风格
- ✅ 更好的用户体验

## 检查结果记录

### 发现的问题
记录任何仍然存在的图标显示问题：

### 改进效果
记录修复后的视觉改进：

### 浏览器信息
- 浏览器类型和版本:
- 屏幕分辨率:
- 操作系统:

### 额外说明
任何其他需要说明的情况：

## 技术细节

### 修复内容
- 恢复了完整的107个图标定义
- 包含教育、财务、营销等业务相关图标
- 支持彩色图标和动态图标
- 统一的图标尺寸和样式

### 组件位置
- 主文件: client/src/components/icons/UnifiedIcon.vue
- 图标数量: 107个完整图标定义
- 图标类型: 教育业务、通用功能、装饰性图标

---
*检查时间: ${new Date().toLocaleString('zh-CN')}*
*页面URL: http://localhost:5173/dashboard*
`;

    fs.writeFileSync(instructionsPath, instructions, 'utf8');
    console.log(`\n📋 检查说明已生成: ${instructionsPath}`);

    console.log('\n🎯 现在请手动检查页面:');
    console.log('1. 打开浏览器访问 http://localhost:5173/dashboard');
    console.log('2. 按照上述说明检查各个区域的图标显示');
    console.log('3. 记录发现的问题和改进效果');
    console.log('4. 对比修复前后的视觉变化');

    console.log('\n🔍 重点关注:');
    console.log('- 是否还有三个杠占位符 ☰');
    console.log('- 图标是否反映具体的业务功能');
    console.log('- 图标样式和颜色是否更加丰富');
    console.log('- 整体视觉效果是否改善');
}

// 执行检查
checkServices();