
const fs = require('fs');
const path = require('path');

const clientSrcDir = path.join(__dirname, 'client', 'src');

// Function to recursively find all Vue files
function findVueFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findVueFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.vue')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to check imports in a Vue file
function checkImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for UnifiedIcon imports
    const importRegex = /import\s+UnifiedIcon\s+from\s+['"](.+?)['"]\s*;/g;
    const matches = [...content.matchAll(importRegex)];

    if (matches.length > 0) {
      const importPath = matches[0][1];

      // Check if it's the correct path
      const expectedPath = '@/components/icons/UnifiedIcon.vue';
      const isCorrect = importPath === expectedPath;

      return {
        filePath,
        importPath,
        isCorrect
      };
    }

    return null;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

// Main process
const vueFiles = findVueFiles(clientSrcDir);
const importInfo = [];

for (const file of vueFiles) {
  const info = checkImports(file);
  if (info) {
    importInfo.push(info);
  }
}

// Display results
console.log('UnifiedIcon Import Path Check Results:');
console.log('='.repeat(80));

let correctCount = 0;
let incorrectCount = 0;

for (const info of importInfo) {
  if (info.isCorrect) {
    correctCount++;
    console.log(`✓ ${info.filePath.replace(clientSrcDir, '')} - ${info.importPath}`);
  } else {
    incorrectCount++;
    console.log(`✗ ${info.filePath.replace(clientSrcDir, '')} - ${info.importPath}`);
  }
}

console.log('='.repeat(80));
console.log(`Correct imports: ${correctCount}`);
console.log(`Incorrect imports: ${incorrectCount}`);
console.log(`Total files: ${importInfo.length}`);

if (incorrectCount === 0) {
  console.log('\nAll imports are consistent! ✓');
} else {
  console.log('\nSome imports need to be fixed! ✗');
}
