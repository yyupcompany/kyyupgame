#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 读取Swagger文档
const swaggerPath = '/home/zhgue/localhost:5173/server/swagger.json';
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

console.log('='.repeat(80));
console.log('Swagger文档命名规范一致性分析报告');
console.log('='.repeat(80));

// 1. 分析组件(Schemas)命名规范
console.log('\n1. 组件(Schemas)命名规范分析');
console.log('-'.repeat(50));

const schemas = Object.keys(swagger.components.schemas);
console.log(`总组件数量: ${schemas.length}`);

// 分析命名模式
const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
const snakeCaseRegex = /^[a-z][a-z0-9_]*$/;

let pascalCaseCount = 0;
let camelCaseCount = 0;
let snakeCaseCount = 0;
let otherNamingCount = 0;

const namingIssues = [];

schemas.forEach(schema => {
  if (pascalCaseRegex.test(schema)) {
    pascalCaseCount++;
  } else if (camelCaseRegex.test(schema)) {
    camelCaseCount++;
    namingIssues.push(`CamelCase命名: ${schema}`);
  } else if (snakeCaseRegex.test(schema)) {
    snakeCaseCount++;
    namingIssues.push(`snake_case命名: ${schema}`);
  } else {
    otherNamingCount++;
    namingIssues.push(`不规范命名: ${schema}`);
  }
});

console.log(`PascalCase: ${pascalCaseCount} (${(pascalCaseCount/schemas.length*100).toFixed(1)}%)`);
console.log(`camelCase: ${camelCaseCount} (${(camelCaseCount/schemas.length*100).toFixed(1)}%)`);
console.log(`snake_case: ${snakeCaseCount} (${(snakeCaseCount/schemas.length*100).toFixed(1)}%)`);
console.log(`其他命名: ${otherNamingCount} (${(otherNamingCount/schemas.length*100).toFixed(1)}%)`);

if (namingIssues.length > 0) {
  console.log('\n命名不一致的组件:');
  namingIssues.forEach(issue => console.log(`  - ${issue}`));
}

// 分析组件后缀模式
console.log('\n组件后缀模式分析:');
const suffixPatterns = {};
schemas.forEach(schema => {
  const suffixMatch = schema.match(/(Request|Response|Input|Update|Create|Statistics|Stats|List|Report|Tracking|Config|Metrics|Overview)$/);
  if (suffixMatch) {
    const suffix = suffixMatch[1];
    suffixPatterns[suffix] = (suffixPatterns[suffix] || 0) + 1;
  }
});

Object.entries(suffixPatterns).sort((a, b) => b[1] - a[1]).forEach(([suffix, count]) => {
  console.log(`  ${suffix}: ${count}个`);
});

// 2. 分析API路径命名规范
console.log('\n\n2. API路径命名规范分析');
console.log('-'.repeat(50));

const paths = Object.keys(swagger.paths);
console.log(`总API路径数量: ${paths.length}`);

// 分析路径命名模式
const kebabCasePaths = [];
const camelCasePaths = [];
const snakeCasePaths = [];
const mixedPaths = [];

paths.forEach(path => {
  const pathWithoutParams = path.replace(/\{[^}]+\}/g, '').replace(/^\//, '');
  const segments = pathWithoutParams.split('/').filter(seg => seg.length > 0);
  
  segments.forEach(segment => {
    if (segment.includes('-')) {
      if (!kebabCasePaths.includes(path)) kebabCasePaths.push(path);
    } else if (segment.includes('_')) {
      if (!snakeCasePaths.includes(path)) snakeCasePaths.push(path);
    } else if (/[a-z][A-Z]/.test(segment)) {
      if (!camelCasePaths.includes(path)) camelCasePaths.push(path);
    }
  });
});

console.log(`kebab-case路径: ${kebabCasePaths.length} (${(kebabCasePaths.length/paths.length*100).toFixed(1)}%)`);
console.log(`snake_case路径: ${snakeCasePaths.length} (${(snakeCasePaths.length/paths.length*100).toFixed(1)}%)`);
console.log(`camelCase路径: ${camelCasePaths.length} (${(camelCasePaths.length/paths.length*100).toFixed(1)}%)`);

// 显示不一致的路径示例
if (kebabCasePaths.length > 0) {
  console.log('\nkebab-case路径示例:');
  kebabCasePaths.slice(0, 5).forEach(path => console.log(`  - ${path}`));
}

if (snakeCasePaths.length > 0) {
  console.log('\nsnake_case路径示例:');
  snakeCasePaths.slice(0, 5).forEach(path => console.log(`  - ${path}`));
}

// 3. 分析参数命名规范
console.log('\n\n3. 参数命名规范分析');
console.log('-'.repeat(50));

const parameterNames = new Set();
const camelCaseParams = new Set();
const snakeCaseParams = new Set();
const otherParams = new Set();

Object.values(swagger.paths).forEach(pathItem => {
  Object.values(pathItem).forEach(operation => {
    if (operation.parameters) {
      operation.parameters.forEach(param => {
        if (param.name) {
          parameterNames.add(param.name);
          if (camelCaseRegex.test(param.name)) {
            camelCaseParams.add(param.name);
          } else if (snakeCaseRegex.test(param.name)) {
            snakeCaseParams.add(param.name);
          } else {
            otherParams.add(param.name);
          }
        }
      });
    }
  });
});

console.log(`总参数数量: ${parameterNames.size}`);
console.log(`camelCase参数: ${camelCaseParams.size} (${(camelCaseParams.size/parameterNames.size*100).toFixed(1)}%)`);
console.log(`snake_case参数: ${snakeCaseParams.size} (${(snakeCaseParams.size/parameterNames.size*100).toFixed(1)}%)`);
console.log(`其他命名参数: ${otherParams.size} (${(otherParams.size/parameterNames.size*100).toFixed(1)}%)`);

if (snakeCaseParams.size > 0) {
  console.log('\nsnake_case参数示例:');
  Array.from(snakeCaseParams).slice(0, 10).forEach(param => console.log(`  - ${param}`));
}

if (otherParams.size > 0) {
  console.log('\n其他命名参数示例:');
  Array.from(otherParams).slice(0, 10).forEach(param => console.log(`  - ${param}`));
}

// 4. 分析响应模型命名规范
console.log('\n\n4. 响应模型命名规范分析');
console.log('-'.repeat(50));

const responseModels = schemas.filter(schema => 
  schema.endsWith('Response') || 
  schema.endsWith('List') || 
  schema.endsWith('Statistics') ||
  schema.endsWith('Report')
);

console.log(`响应相关模型数量: ${responseModels.length}`);

const responsePatterns = {};
responseModels.forEach(model => {
  if (model.endsWith('Response')) {
    responsePatterns.Response = (responsePatterns.Response || 0) + 1;
  } else if (model.endsWith('List')) {
    responsePatterns.List = (responsePatterns.List || 0) + 1;
  } else if (model.endsWith('Statistics')) {
    responsePatterns.Statistics = (responsePatterns.Statistics || 0) + 1;
  } else if (model.endsWith('Report')) {
    responsePatterns.Report = (responsePatterns.Report || 0) + 1;
  }
});

Object.entries(responsePatterns).forEach(([pattern, count]) => {
  console.log(`  ${pattern}后缀: ${count}个`);
});

// 5. 分析标签(Tags)命名规范
console.log('\n\n5. 标签(Tags)命名规范分析');
console.log('-'.repeat(50));

const allTags = new Set();
Object.values(swagger.paths).forEach(pathItem => {
  Object.values(pathItem).forEach(operation => {
    if (operation.tags) {
      operation.tags.forEach(tag => allTags.add(tag));
    }
  });
});

const tagsArray = Array.from(allTags);
console.log(`总标签数量: ${tagsArray.length}`);

// 分析标签命名模式
const kebabCaseTags = [];
const camelCaseTags = [];
const snakeCaseTags = [];
const spaceTags = [];

tagsArray.forEach(tag => {
  if (tag.includes('-')) {
    kebabCaseTags.push(tag);
  } else if (tag.includes('_')) {
    snakeCaseTags.push(tag);
  } else if (tag.includes(' ')) {
    spaceTags.push(tag);
  } else if (/[a-z][A-Z]/.test(tag)) {
    camelCaseTags.push(tag);
  }
});

console.log(`kebab-case标签: ${kebabCaseTags.length}`);
console.log(`camelCase标签: ${camelCaseTags.length}`);
console.log(`snake_case标签: ${snakeCaseTags.length}`);
console.log(`包含空格标签: ${spaceTags.length}`);

console.log('\n所有标签列表:');
tagsArray.sort().forEach(tag => console.log(`  - ${tag}`));

// 6. 安全配置命名
console.log('\n\n6. 安全配置命名规范分析');
console.log('-'.repeat(50));

const securitySchemes = Object.keys(swagger.components.securitySchemes);
console.log(`安全配置: ${securitySchemes.join(', ')}`);
if (securitySchemes.includes('bearerAuth') && securitySchemes.includes('BearerAuth')) {
  console.log('⚠️  发现重复但命名不一致的安全配置: bearerAuth 和 BearerAuth');
}

// 7. 总结建议
console.log('\n\n7. 命名规范建议总结');
console.log('-'.repeat(50));

console.log('发现的主要问题:');
console.log('1. 组件命名不统一: 混用PascalCase、camelCase和snake_case');
console.log('2. API路径命名不统一: 混用kebab-case、snake_case和camelCase');
console.log('3. 参数命名不统一: 混用camelCase和snake_case');
console.log('4. 安全配置命名重复且不一致');

console.log('\n建议的统一命名规范:');
console.log('1. 组件(Schemas): 使用PascalCase (如: User, CreateUserRequest)');
console.log('2. API路径: 使用kebab-case (如: /api/users, /api/enrollment-plans)');
console.log('3. 参数: 使用camelCase (如: userId, pageNumber)');
console.log('4. 标签: 使用kebab-case (如: user-management, enrollment-center)');
console.log('5. 安全配置: 统一使用小写 (如: bearerAuth)');

console.log('\n分析完成!');