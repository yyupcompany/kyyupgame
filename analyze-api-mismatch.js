#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Loading scan reports...');

// Load the JSON files
const frontendReport = JSON.parse(fs.readFileSync('/persistent/home/zhgue/kyyupgame/frontend-api-scan-report.json', 'utf8'));
const backendReport = JSON.parse(fs.readFileSync('/persistent/home/zhgue/kyyupgame/backend-routes-scan-report.json', 'utf8'));

console.log('Frontend endpoints:', Object.keys(frontendReport.endpoints || {}).length);
console.log('Backend routes:', backendReport.routesByFile?.length || 0);

// Extract unique API paths from frontend
const frontendPaths = new Map();
if (frontendReport.endpoints) {
  Object.entries(frontendReport.endpoints).forEach(([endpoint, data]) => {
    const key = endpoint.toLowerCase();
    frontendPaths.set(key, {
      endpoint,
      urlType: data.urlType,
      methods: data.methods || {},
      callCount: data.callCount || 0,
      files: data.files || []
    });
  });
}

// Extract unique routes from backend
const backendPaths = new Map();
if (backendReport.routesByFile) {
  backendReport.routesByFile.forEach(fileData => {
    (fileData.routes || []).forEach(route => {
      const fullPath = (route.fullPath || route.path).toLowerCase();
      if (!backendPaths.has(fullPath)) {
        backendPaths.set(fullPath, {
          path: route.fullPath || route.path,
          method: route.method,
          file: fileData.file,
          fullPath: route.fullPath,
          mountPoint: route.mountPoint
        });
      }
    });
  });
}

console.log('\nUnique frontend paths:', frontendPaths.size);
console.log('Unique backend paths:', backendPaths.size);

// Find mismatches
const frontendOnly = [];
const backendOnly = [];
const potentialMatches = [];

// Check frontend calls that don't exist in backend
frontendPaths.forEach((data, path) => {
  if (!backendPaths.has(path)) {
    frontendOnly.push({ path, data });
  }
});

// Check backend routes not called by frontend
backendPaths.forEach((data, path) => {
  if (!frontendPaths.has(path)) {
    backendOnly.push({ path, data });
  }
});

// Find potential matches (with /api prefix differences)
frontendPaths.forEach((data, fPath) => {
  if (!backendPaths.has(fPath)) {
    // Check if adding /api helps
    const withApiPrefix = fPath.startsWith('/api/') ? fPath : '/api' + (fPath.startsWith('/') ? '' : '/') + fPath;
    if (backendPaths.has(withApiPrefix)) {
      potentialMatches.push({
        frontendPath: fPath,
        backendPath: withApiPrefix,
        issue: 'Missing /api prefix in frontend',
        data
      });
    }

    // Check if removing /api helps
    const withoutApiPrefix = fPath.startsWith('/api/') ? fPath.substring(4) : fPath;
    if (backendPaths.has(withoutApiPrefix) && withoutApiPrefix !== fPath) {
      potentialMatches.push({
        frontendPath: fPath,
        backendPath: withoutApiPrefix,
        issue: 'Extra /api prefix in frontend',
        data
      });
    }

    // Check for template variable differences (${id} vs :id)
    const fPathColon = fPath.replace(/\$\{[^}]+\}/g, ':x');
    backendPaths.forEach((bData, bPath) => {
      const bPathColon = bPath.replace(/:[^/]+/g, ':x');
      if (fPathColon === bPathColon && fPath !== bPath) {
        potentialMatches.push({
          frontendPath: fPath,
          backendPath: bPath,
          issue: 'Template variable format mismatch (${id} vs :id)',
          data
        });
      }
    });
  }
});

// Special focus: /api/ai/unified/* endpoints
const aiUnifiedEndpoints = [];
frontendPaths.forEach((data, path) => {
  if (path.includes('/ai/unified')) {
    aiUnifiedEndpoints.push({
      path,
      data,
      existsInBackend: backendPaths.has(path)
    });
  }
});

// Check for localhost:3000 hardcoding (from summary stats)
const localhostCalls = [];
if (frontendReport.endpoints) {
  Object.entries(frontendReport.endpoints).forEach(([endpoint, data]) => {
    if (data.urlType === 'absolute' && data.files) {
      data.files.forEach(file => {
        localhostCalls.push({
          endpoint,
          urlType: data.urlType,
          file
        });
      });
    }
  });
}

// Count missing /api prefix issues
const missingApiPrefix = Object.values(frontendReport.endpoints || {}).filter(e => e.urlType === 'relative-no-prefix').length;

// Generate report
let report = '# API Path Mismatch Analysis Report\n\n';
report += `Generated: ${new Date().toISOString()}\n\n`;
report += '## Summary\n\n';
report += `- **Total Frontend Endpoints**: ${Object.keys(frontendReport.endpoints || {}).length}\n`;
report += `- **Unique Frontend Paths**: ${frontendPaths.size}\n`;
report += `- **Total Backend Routes**: ${backendReport.totalRoutes || 0}\n`;
report += `- **Unique Backend Paths**: ${backendPaths.size}\n`;
report += `- **Missing /api Prefix**: ${missingApiPrefix}\n`;
report += `- **Potential 404 Risks**: ${frontendOnly.length - potentialMatches.length}\n`;
report += `- **Path Format Issues**: ${potentialMatches.length}\n\n`;

// Critical Issues Section
report += '## 1. Critical Issues - Frontend Calls Without Backend Routes (404 Risk)\n\n';
report += 'The following API calls will result in 404 errors:\n\n';

const criticalIssues = frontendOnly.filter(f => {
  const key = f.path;
  return !potentialMatches.some(p => p.frontendPath === key);
});

if (criticalIssues.length === 0) {
  report += '*No critical 404 risks found.*\n\n';
} else {
  report += `**Found ${criticalIssues.length} critical issues.** Showing first 50:\n\n`;
  criticalIssues.slice(0, 50).forEach((item, idx) => {
    report += `### ${idx + 1}. ${item.path}\n\n`;
    report += `- **URL Type**: ${item.data.urlType}\n`;
    report += `- **Call Count**: ${item.data.callCount}\n`;
    report += `- **Files**: \n`;
    item.data.files.forEach(file => {
      report += `  - \`${file}\`\n`;
    });
    report += '\n';
  });

  if (criticalIssues.length > 50) {
    report += `\n_*... and ${criticalIssues.length - 50} more critical issues*_\n\n`;
  }
}

// Prefix Issues Section
report += '## 2. Path Format Issues (Potential Mismatches)\n\n';
report += 'These calls have format differences that may cause issues:\n\n';

if (potentialMatches.length === 0) {
  report += '*No path format issues found.*\n\n';
} else {
  report += `**Found ${potentialMatches.length} potential mismatches.** Grouped by issue type:\n\n`;

  // Group by issue type
  const grouped = new Map();
  potentialMatches.forEach(item => {
    if (!grouped.has(item.issue)) {
      grouped.set(item.issue, []);
    }
    grouped.get(item.issue).push(item);
  });

  grouped.forEach((items, issue) => {
    report += `### ${issue} (${items.length} cases)\n\n`;
    items.slice(0, 10).forEach((item, idx) => {
      report += `${idx + 1}. Frontend: \`${item.frontendPath}\` → Backend: \`${item.backendPath}\`\n`;
    });
    if (items.length > 10) {
      report += `   ... and ${items.length - 10} more\n`;
    }
    report += '\n';
  });
}

// Missing API Prefix Section
report += '## 3. Missing /api Prefix Analysis\n\n';
report += `**Total endpoints missing /api prefix**: ${missingApiPrefix}\n\n`;
report += 'These endpoints use relative URLs without the /api prefix:\n\n';

const missingPrefixList = Object.values(frontendReport.endpoints || {})
  .filter(e => e.urlType === 'relative-no-prefix')
  .slice(0, 30);

missingPrefixList.forEach((item, idx) => {
  report += `${idx + 1}. \`${item.endpoint}\`\n`;
  report += `   - Files: ${item.files.length}\n`;
  report += `   - Calls: ${item.callCount}\n`;
});

if (missingApiPrefix > 30) {
  report += `\n... and ${missingApiPrefix - 30} more\n`;
}
report += '\n';

// AI Unified Endpoints Section
report += '## 4. AI Unified Endpoints (/api/ai/unified/*)\n\n';
report += 'Special focus on AI-related endpoints:\n\n';

if (aiUnifiedEndpoints.length === 0) {
  report += '*No AI unified endpoints found in frontend.*\n\n';
} else {
  aiUnifiedEndpoints.forEach((item, idx) => {
    const status = item.existsInBackend ? '✅ OK' : '❌ MISSING';
    report += `### ${idx + 1}. ${status} ${item.path}\n\n`;
    report += `- **URL Type**: ${item.data.urlType}\n`;
    report += `- **Call Count**: ${item.data.callCount}\n`;
    report += `- **Files**: \n`;
    item.data.files.forEach(file => {
      report += `  - \`${file}\`\n`;
    });
    report += '\n';
  });
}

// Absolute URLs Section
report += '## 5. Hardcoded Absolute URLs (Production Risk)\n\n';
report += `**Total absolute URLs found**: ${frontendReport.summary?.absoluteUrls || 0}\n\n`;

if (localhostCalls.length === 0) {
  report += '*No absolute URLs found.*\n\n';
} else {
  localhostCalls.forEach((call, idx) => {
    report += `### ${idx + 1}. ${call.endpoint}\n\n`;
    report += `- **URL Type**: ${call.urlType}\n`;
    report += `- **File**: \`${call.file}\`\n\n`;
  });
}

// Backend Unused Routes
report += '## 6. Backend Routes Not Used by Frontend\n\n';
report += `**Total backend-only routes**: ${backendOnly.length}\n\n`;
report += 'These backend routes may be unused or only used by other clients (e.g., mobile, external APIs):\n\n';

if (backendOnly.length === 0) {
  report += '*All backend routes are used by frontend.*\n\n';
} else {
  report += 'Showing first 30:\n\n';
  backendOnly.slice(0, 30).forEach((item, idx) => {
    report += `${idx + 1}. \`${item.path}\`\n`;
    report += `   - Method: ${item.data.method}\n`;
    report += `   - File: \`${item.data.file}\`\n`;
    report += `   - Full path: \`${item.data.fullPath}\`\n`;
  });

  if (backendOnly.length > 30) {
    report += `\n... and ${backendOnly.length - 30} more\n`;
  }
  report += '\n';
}

// Recommendations Section
report += '## 7. Recommendations\n\n';

const recommendations = [];

if (criticalIssues.length > 0) {
  recommendations.push({
    priority: 'HIGH',
    title: 'Fix Critical 404 Risks',
    description: `${criticalIssues.length} frontend API calls have no matching backend route. These will cause runtime errors.`,
    action: 'Review and implement missing backend routes or fix frontend endpoint paths.'
  });
}

if (missingApiPrefix > 0) {
  recommendations.push({
    priority: 'HIGH',
    title: 'Standardize API Prefix',
    description: `${missingApiPrefix} endpoints are missing the /api prefix. This will cause calls to fail in production.`,
    action: 'Ensure all frontend API calls use consistent /api prefix or configure axios baseURL properly.'
  });
}

if (potentialMatches.length > 0) {
  recommendations.push({
    priority: 'MEDIUM',
    title: 'Fix Template Variable Format',
    description: `${potentialMatches.filter(p => p.issue.includes('template')).length} endpoints have template variable format mismatches.`,
    action: 'Standardize on either ${id} (frontend) or :id (backend) format across the codebase.'
  });
}

if (localhostCalls.length > 0 || (frontendReport.summary?.absoluteUrls || 0) > 0) {
  recommendations.push({
    priority: 'HIGH',
    title: 'Remove Absolute URLs',
    description: `${frontendReport.summary?.absoluteUrls || 0} endpoints use absolute URLs. These will break in production.`,
    action: 'Replace hardcoded URLs with relative paths and use environment variables for API base URL.'
  });
}

if (aiUnifiedEndpoints.some(e => !e.existsInBackend)) {
  const missingAi = aiUnifiedEndpoints.filter(e => !e.existsInBackend).length;
  recommendations.push({
    priority: 'HIGH',
    title: 'Implement Missing AI Endpoints',
    description: `${missingAi} /api/ai/unified/* endpoints called by frontend are not implemented in backend.`,
    action: 'Implement the missing AI unified endpoints in the backend router.'
  });
}

recommendations.push({
  priority: 'LOW',
  title: 'Review Unused Backend Routes',
  description: `${backendOnly.length} backend routes are not called by frontend.`,
  action: 'Determine if these are deprecated, used by other clients, or genuinely unused.'
});

recommendations.push({
  priority: 'MEDIUM',
  title: 'Enable API Path Validation',
  description: 'Implement automated tests to catch API path mismatches during development.',
  action: 'Add integration tests that verify frontend API calls match backend routes.'
});

recommendations.forEach((rec, idx) => {
  const emoji = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
  report += `### ${emoji} Priority ${idx + 1}: ${rec.title}\n\n`;
  report += `**Problem**: ${rec.description}\n\n`;
  report += `**Action**: ${rec.action}\n\n`;
});

// Quick Reference Section
report += '## 8. Quick Reference Statistics\n\n';
report += '| Metric | Count |\n';
report += '|--------|-------|\n';
report += `| Total Frontend API Calls | ${frontendReport.summary?.totalApiCalls || 0} |\n`;
report += `| Unique Frontend Endpoints | ${Object.keys(frontendReport.endpoints || {}).length} |\n`;
report += `| Missing /api Prefix | ${missingApiPrefix} |\n`;
report += `| Absolute URLs | ${frontendReport.summary?.absoluteUrls || 0} |\n`;
report += `| Total Backend Routes | ${backendReport.totalRoutes || 0} |\n`;
report += `| Critical 404 Risks | ${criticalIssues.length} |\n`;
report += `| Path Format Issues | ${potentialMatches.length} |\n`;
report += `| Backend-Only Routes | ${backendOnly.length} |\n`;
report += '\n';

// Appendix: Sample Details
report += '## Appendix A: Sample Frontend Endpoints by Type\n\n';
report += '### Endpoints WITH /api prefix (Correct)\n';
const withPrefix = Object.values(frontendReport.endpoints || {})
  .filter(e => e.urlType === 'relative-with-prefix')
  .slice(0, 20);
withPrefix.forEach((item, idx) => {
  report += `${idx + 1}. \`${item.endpoint}\`\n`;
});

report += '\n### Endpoints WITHOUT /api prefix (Issue)\n';
const withoutPrefix = Object.values(frontendReport.endpoints || {})
  .filter(e => e.urlType === 'relative-no-prefix')
  .slice(0, 20);
withoutPrefix.forEach((item, idx) => {
  report += `${idx + 1}. \`${item.endpoint}\`\n`;
});

// Write report
const outputPath = '/persistent/home/zhgue/kyyupgame/api-path-mismatch-report.md';
fs.writeFileSync(outputPath, report);

console.log('\n✅ Report generated:', outputPath);
console.log('\n📊 Summary:');
console.log(`   Critical issues: ${criticalIssues.length}`);
console.log(`   Prefix issues: ${missingApiPrefix}`);
console.log(`   Path format issues: ${potentialMatches.length}`);
console.log(`   AI endpoints: ${aiUnifiedEndpoints.length}`);
console.log(`   Absolute URLs: ${frontendReport.summary?.absoluteUrls || 0}`);
console.log(`   Unused backend routes: ${backendOnly.length}`);
