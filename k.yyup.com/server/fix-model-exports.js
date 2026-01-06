const fs = require('fs');
const path = require('path');

// 需要修复的模型文件列表
const modelFiles = [
  'assessment-record.model.ts',
  'assessment-report.model.ts',
  'student.model.ts',
  'parent-student-relation.model.ts',
  'teacher.model.ts',
  'class.model.ts',
  'class-teacher.model.ts'
];

modelFiles.forEach(fileName => {
  const filePath = path.join(__dirname, 'src/models', fileName);

  if (fs.existsSync(filePath)) {
    console.log(`检查文件: ${fileName}`);

    const content = fs.readFileSync(filePath, 'utf8');

    // 检查是否有default export
    if (!content.includes('export default')) {
      console.log(`文件 ${fileName} 缺少 default export，需要添加`);

      // 尝试找到导出的类名
      const classMatch = content.match(/export class (\w+)/);
      if (classMatch) {
        const className = classMatch[1];
        const defaultExport = `\n\n// 为了兼容旧代码，添加默认导出\nexport default ${className};`;

        // 在文件末尾添加默认导出
        const newContent = content + defaultExport;
        fs.writeFileSync(filePath, newContent);
        console.log(`已为 ${fileName} 添加默认导出: ${className}`);
      }
    } else {
      console.log(`文件 ${fileName} 已有 default export`);
    }
  } else {
    console.log(`文件不存在: ${fileName}`);
  }
});

console.log('修复完成！');