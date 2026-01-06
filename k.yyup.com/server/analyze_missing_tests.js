const fs = require('fs');
const path = require('path');

// Get all controller files
const controllerFiles = [];
function findControllers(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findControllers(fullPath);
    } else if (file.endsWith('.controller.ts')) {
      const relativePath = path.relative('src/controllers', fullPath);
      controllerFiles.push(relativePath.replace('.ts', ''));
    }
  }
}

findControllers('src/controllers');

// Get all test files
const testFiles = [];
function findTests(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findTests(fullPath);
    } else if (file.endsWith('.test.ts')) {
      const relativePath = path.relative('tests/unit/controllers', fullPath);
      testFiles.push(relativePath.replace('.test.ts', ''));
    }
  }
}

if (fs.existsSync('tests/unit/controllers')) {
  findTests('tests/unit/controllers');
}

console.log('=== All Controller Files ===');
controllerFiles.sort().forEach(file => console.log(file));

console.log('\n=== Existing Test Files ===');
testFiles.sort().forEach(file => console.log(file));

console.log('\n=== Missing Test Files ===');
const missingTests = controllerFiles.filter(controller => {
  return !testFiles.some(test => test === controller || test === controller.replace(/\//g, '-'));
});

missingTests.sort().forEach(file => console.log(file));

console.log(`\nSummary:`);
console.log(`Total controllers: ${controllerFiles.length}`);
console.log(`Existing tests: ${testFiles.length}`);
console.log(`Missing tests: ${missingTests.length}`);