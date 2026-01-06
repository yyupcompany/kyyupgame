const fs = require('fs');
const filePath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/teacher-assessment.routes.ts';

let content = fs.readFileSync(filePath, 'utf8');

// 替换所有的ClassStudent引用为Student查询
const replacements = [
  {
    from: 'const classStudents = await ClassStudent.findAll({\n      where: {',
    to: 'const classStudents = await Student.findAll({\n      where: {'
  },
  {
    from: 'const classStudent = await ClassStudent.findOne({',
    to: 'const student = await Student.findOne({'
  },
  {
    from: 'const studentCount = await ClassStudent.count({',
    to: 'const studentCount = await Student.count({'
  },
  {
    from: 'classId: { [Op.in]: teacherClassIds },',
    to: 'classId: { [Op.in]: teacherClassIds },'
  },
  {
    from: 'return !!classStudent;',
    to: 'return !!student;'
  }
];

replacements.forEach(({ from, to }) => {
  content = content.replace(new RegExp(from, 'g'), to);
});

// 特殊处理：需要在查询条件中添加适当的字段
content = content.replace(
  /const classStudents = await Student\.findAll\(\{[\s\S]*?where: \{[\s\S]*?\},[\s\S]*?\}\);/g,
  (match) => {
    // 如果查询中没有包含id字段，添加它
    if (!match.includes('id:') && !match.includes('attributes:')) {
      return match.replace(
        'where: {',
        'attributes: ["id", "name", "classId"],\n      where: {'
      );
    }
    return match;
  }
);

fs.writeFileSync(filePath, content);
console.log('已修复所有ClassStudent引用');