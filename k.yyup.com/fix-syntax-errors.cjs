#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * TypeScript Syntax Error Fixer
 * Automatically fixes common TypeScript syntax errors
 */
class TSFixer {
  constructor() {
    this.fixes = [];
    this.errorsFixed = 0;
  }

  /**
   * Fix syntax errors in a single file
   */
  fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return 0;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesInFile = 0;

    // Fix pattern 1: Missing newlines after class declarations
    content = content.replace(/export class ([^{]+)\{(\s*\S)/g, 'export class $1 {\n  $2');

    // Fix pattern 2: Missing semicolons in function parameters
    content = content.replace(/page = 1,pageSize = 10,/g, 'page = 1,\n      pageSize = 10,');
    content = content.replace(/const userId = req\.user\?\.idconst/g, 'const userId = req.user?.id;\n    const');
    content = content.replace(/const file = req\.fileif/g, 'const file = req.file;\n      if');

    // Fix pattern 3: Missing newlines after try blocks
    content = content.replace(/\{try {/g, '{\n    try {');

    // Fix pattern 4: Missing semicolons after variable declarations
    content = content.replace(/const ([^;]+)res\.json/g, 'const $1;\n      res.json');
    content = content.replace(/const ([^;]+)if/g, 'const $1;\n      if');

    // Fix pattern 5: Duplicate imports
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
    const seenImports = new Set();
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
      if (line.trim().startsWith('import ')) {
        if (seenImports.has(line.trim())) {
          return false;
        }
        seenImports.add(line.trim());
        return true;
      }
      return true;
    });
    content = filteredLines.join('\n');

    // Fix pattern 6: Missing semicolons after await calls
    content = content.replace(/await ([^;]+)\)(\s*if)/g, 'await $1);$2');

    // Fix pattern 7: Missing semicolons after const/let declarations
    content = content.replace(/const ([a-zA-Z_$][a-zA-Z0-9_$]*) = ([^;]+)} catch/g, 'const $1 = $2;\n    } catch');

    // Fix pattern 8: Missing newlines in function parameters
    content = content.replace(/= ProblemSeverity\.MEDIUM,rectificationMeasures/g, '= ProblemSeverity.MEDIUM,\n      rectificationMeasures');
    content = content.replace(/const files = req\.files as Express\.Multer\.File\[\]if/g, 'const files = req.files as Express.Multer.File[];\n      if');

    // Write the fixed content back
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixesInFile++;
      console.log(`✅ Fixed: ${filePath}`);
      this.fixes.push({
        file: filePath,
        originalLength: originalContent.length,
        fixedLength: content.length
      });
    }

    return fixesInFile;
  }

  /**
   * Fix multiple files
   */
  fixFiles(filePaths) {
    let totalFixed = 0;

    console.log('🔧 Starting TypeScript syntax fixes...\n');

    for (const filePath of filePaths) {
      const fixed = this.fixFile(filePath);
      totalFixed += fixed;
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Files processed: ${filePaths.length}`);
    console.log(`- Files fixed: ${this.fixes.length}`);
    console.log(`- Total fixes applied: ${totalFixed}`);

    if (this.fixes.length > 0) {
      console.log(`\n📋 Fixed files:`);
      this.fixes.forEach(fix => {
        const sizeDiff = fix.fixedLength - fix.originalLength;
        console.log(`  - ${path.basename(fix.file)} (${sizeDiff > 0 ? '+' : ''}${sizeDiff} chars)`);
      });
    }

    return this.fixes.length;
  }

  /**
   * Get list of controller files to fix
   */
  getControllerFiles() {
    const controllersDir = path.join(__dirname, 'server/src/controllers');

    // Files mentioned in the task
    const targetFiles = [
      'ai/quota.controller.ts',
      'assessment-share.controller.ts',
      'auto-image.controller.ts',
      'kindergarten-completeness.controller.ts',
      'kindergarten.controller.ts',
      'marketing-campaign.controller.ts',
      'marketing-campaign/marketing-campaign.controller.ts',
      'marketing-center.controller.ts',
      'marketing/collect-activity.controller.ts',
      'marketing.controller.ts',
      'marketing/group-buy.controller.ts',
      'marketing/tiered-reward.controller.ts'
    ];

    const filePaths = [];
    for (const file of targetFiles) {
      const fullPath = path.join(controllersDir, file);
      if (fs.existsSync(fullPath)) {
        filePaths.push(fullPath);
      }
    }

    return filePaths;
  }
}

// Run the fixer if this script is executed directly
if (require.main === module) {
  const fixer = new TSFixer();
  const filesToFix = fixer.getControllerFiles();

  if (filesToFix.length === 0) {
    console.log('❌ No files found to fix');
    process.exit(1);
  }

  console.log(`📁 Found ${filesToFix.length} files to fix:`);
  filesToFix.forEach(file => {
    console.log(`  - ${path.relative(process.cwd(), file)}`);
  });
  console.log();

  const fixedCount = fixer.fixFiles(filesToFix);

  if (fixedCount > 0) {
    console.log(`\n✅ Successfully fixed ${fixedCount} files!`);
    console.log('💡 Run "npx tsc --noEmit" to verify fixes');
  } else {
    console.log('\n✅ No fixes needed');
  }
}

module.exports = TSFixer;