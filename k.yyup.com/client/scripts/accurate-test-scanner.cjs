const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 重新扫描测试用例覆盖情况...\n');

// 获取所有源文件
const sourceFiles = glob.sync('src/**/*.vue', { cwd: process.cwd() });
console.log(`📁 找到源文件: ${sourceFiles.length} 个`);

// 获取所有测试文件
const testFiles = glob.sync('tests/unit/**/*.test.ts', { cwd: process.cwd() });
console.log(`🧪 找到测试文件: ${testFiles.length} 个\n`);

// 分析测试文件对应的源文件
const testedFiles = new Set();
const testFileDetails = [];

testFiles.forEach(testFile => {
    const testContent = fs.readFileSync(testFile, 'utf-8');
    const testName = path.basename(testFile, '.test.ts');
    
    // 尝试多种匹配策略
    let matchedSourceFiles = [];
    
    // 策略1: 直接文件名匹配
    const directMatch = sourceFiles.find(src => {
        const srcName = path.basename(src, '.vue');
        return srcName === testName || srcName.toLowerCase() === testName.toLowerCase();
    });
    if (directMatch) matchedSourceFiles.push(directMatch);
    
    // 策略2: 从测试内容中查找import语句
    const importMatches = testContent.match(/from\s+['"]([^'"]+\.vue)['"]/g);
    if (importMatches) {
        importMatches.forEach(match => {
            const importPath = match.match(/from\s+['"]([^'"]+\.vue)['"]/)[1];
            const resolvedPath = importPath.startsWith('@/') 
                ? importPath.replace('@/', 'src/')
                : importPath;
            
            const foundFile = sourceFiles.find(src => src.includes(resolvedPath) || src.endsWith(resolvedPath));
            if (foundFile && !matchedSourceFiles.includes(foundFile)) {
                matchedSourceFiles.push(foundFile);
            }
        });
    }
    
    // 策略3: 从测试路径推断源文件路径
    const testDir = path.dirname(testFile).replace('tests/unit/', 'src/');
    const possibleSourcePath = path.join(testDir, testName + '.vue');
    const foundByPath = sourceFiles.find(src => src === possibleSourcePath);
    if (foundByPath && !matchedSourceFiles.includes(foundByPath)) {
        matchedSourceFiles.push(foundByPath);
    }
    
    // 策略4: 模糊匹配（去掉特殊后缀）
    const cleanTestName = testName
        .replace(/\.test$/, '')
        .replace(/\.spec$/, '')
        .replace(/\.integration$/, '')
        .replace(/\.visual$/, '')
        .replace(/-fixed$/, '')
        .replace(/-test$/, '');
    
    const fuzzyMatch = sourceFiles.find(src => {
        const srcName = path.basename(src, '.vue');
        return srcName === cleanTestName || srcName.toLowerCase() === cleanTestName.toLowerCase();
    });
    if (fuzzyMatch && !matchedSourceFiles.includes(fuzzyMatch)) {
        matchedSourceFiles.push(fuzzyMatch);
    }
    
    testFileDetails.push({
        testFile,
        testName,
        matchedSourceFiles,
        hasMatches: matchedSourceFiles.length > 0
    });
    
    matchedSourceFiles.forEach(src => testedFiles.add(src));
});

// 统计结果
const totalSourceFiles = sourceFiles.length;
const totalTestedFiles = testedFiles.size;
const coverageRate = ((totalTestedFiles / totalSourceFiles) * 100).toFixed(1);

console.log('📊 详细扫描结果');
console.log('==================================================');
console.log(`📁 总源文件数: ${totalSourceFiles}`);
console.log(`✅ 已测试文件: ${totalTestedFiles} (${coverageRate}%)`);
console.log(`❌ 未测试文件: ${totalSourceFiles - totalTestedFiles}`);
console.log(`🧪 测试文件数: ${testFiles.length}\n`);

// 按类型分类
const pageFiles = sourceFiles.filter(f => f.startsWith('src/pages/'));
const componentFiles = sourceFiles.filter(f => f.startsWith('src/components/'));
const otherFiles = sourceFiles.filter(f => !f.startsWith('src/pages/') && !f.startsWith('src/components/'));

const testedPageFiles = [...testedFiles].filter(f => f.startsWith('src/pages/'));
const testedComponentFiles = [...testedFiles].filter(f => f.startsWith('src/components/'));
const testedOtherFiles = [...testedFiles].filter(f => !f.startsWith('src/pages/') && !f.startsWith('src/components/'));

console.log('📄 页面文件:');
console.log(`   总数: ${pageFiles.length}`);
console.log(`   已测试: ${testedPageFiles.length} (${((testedPageFiles.length / pageFiles.length) * 100).toFixed(1)}%)`);

console.log('🧩 组件文件:');
console.log(`   总数: ${componentFiles.length}`);
console.log(`   已测试: ${testedComponentFiles.length} (${((testedComponentFiles.length / componentFiles.length) * 100).toFixed(1)}%)`);

if (otherFiles.length > 0) {
    console.log('📦 其他文件:');
    console.log(`   总数: ${otherFiles.length}`);
    console.log(`   已测试: ${testedOtherFiles.length} (${((testedOtherFiles.length / otherFiles.length) * 100).toFixed(1)}%)`);
}

console.log('\n✅ 已测试的文件:');
console.log('==================================================');
[...testedFiles].sort().forEach((file, index) => {
    const type = file.startsWith('src/pages/') ? 'page' :
                 file.startsWith('src/components/') ? 'component' : 'other';
    console.log(`${index + 1}. ${file} (${type})`);
});

console.log('\n🧪 测试文件详情:');
console.log('==================================================');
testFileDetails.forEach(detail => {
    console.log(`📝 ${detail.testFile}`);
    if (detail.matchedSourceFiles.length > 0) {
        detail.matchedSourceFiles.forEach(src => {
            console.log(`   ✅ 测试: ${src}`);
        });
    } else {
        console.log(`   ❌ 未找到对应源文件`);
    }
    console.log('');
});

console.log('\n❌ 未测试的文件 (前20个):');
console.log('==================================================');
const untestedFiles = sourceFiles.filter(f => !testedFiles.has(f));
untestedFiles.slice(0, 20).forEach((file, index) => {
    const type = file.startsWith('src/pages/') ? 'page' :
                 file.startsWith('src/components/') ? 'component' : 'other';
    console.log(`${index + 1}. ${file} (${type})`);
});

if (untestedFiles.length > 20) {
    console.log(`... 还有 ${untestedFiles.length - 20} 个未测试文件`);
}

console.log('\n💡 总结:');
console.log('==================================================');
if (coverageRate >= 80) {
    console.log('🎉 测试覆盖率很高，只需要补充少量测试！');
} else if (coverageRate >= 50) {
    console.log('👍 测试覆盖率中等，需要继续完善测试。');
} else if (coverageRate >= 20) {
    console.log('⚠️  测试覆盖率较低，建议优先为核心功能添加测试。');
} else {
    console.log('🚨 测试覆盖率极低，需要大量补充测试用例。');
}

// 生成详细报告
const report = {
    timestamp: new Date().toISOString(),
    summary: {
        totalSourceFiles,
        totalTestedFiles,
        coverageRate: parseFloat(coverageRate),
        totalTestFiles: testFiles.length
    },
    breakdown: {
        pages: {
            total: pageFiles.length,
            tested: testedPageFiles.length,
            coverage: parseFloat(((testedPageFiles.length / pageFiles.length) * 100).toFixed(1))
        },
        components: {
            total: componentFiles.length,
            tested: testedComponentFiles.length,
            coverage: parseFloat(((testedComponentFiles.length / componentFiles.length) * 100).toFixed(1))
        }
    },
    testedFiles: [...testedFiles].sort(),
    untestedFiles: untestedFiles.sort(),
    testFileDetails
};

// 保存报告
const reportPath = 'test-results/accurate-test-coverage-report.json';
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📄 详细报告已保存到: ${reportPath}`);
