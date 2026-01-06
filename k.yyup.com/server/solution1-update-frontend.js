// 修复方案1：更新前端代码使用有效的学生ID
// 将前端代码中的学生ID从1改为2（或其他有效ID）

// 示例：如果前端代码是这样的：
// fetch('/api/students/1') 

// 应该改为：
// fetch('/api/students/2')

// 或者动态获取有效学生ID：
async function getValidStudentId() {
  const response = await fetch('/api/students?page=1&pageSize=1', {
    headers: {
      'Authorization': 'Bearer mock-jwt-token-for-testing-purposes-only'
    }
  });
  const data = await response.json();
  return data.data.rows[0].id; // 返回第一个有效学生ID
}

// 使用示例：
// const validId = await getValidStudentId();
// fetch(`/api/students/${validId}`)

console.log('✅ 方案1：建议前端使用学生ID=2，该学生姓名为"逢涛"');