/**
 * 创意课程 Repository
 * 封装数据库操作，绕过 Sequelize v6.12.0-beta.3 的 Model.create() 问题
 */

import { getSequelize } from '../config/database';
import { CreativeCurriculum } from '../models/creative-curriculum.model';

/**
 * 课程创建数据接口
 */
export interface CurriculumCreateData {
  creatorId: number;
  kindergartenId: number | null;
  name: string;
  description: string;
  domain: string;
  ageGroup: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  status: string;
  curriculumType: string;
  viewCount: number;
  useCount: number;
  isPublic: boolean;
  schedule: any;
  tags: any;
  thumbnail: string | null;
  remark: string | null;
  media: any;
  metadata: any;
  courseAnalysis: any;
}

/**
 * 创建课程（使用 raw SQL 绕过 Sequelize 模型层问题）
 * 
 * @param data 课程数据
 * @returns 创建的课程 ID
 */
export async function createCurriculumWithRawSQL(data: CurriculumCreateData): Promise<number> {
  const sequelizeDb = getSequelize();
  
  // 执行 INSERT
  const [insertResult] = await sequelizeDb.query(`
    INSERT INTO creative_curriculums 
    (kindergarten_id, creator_id, name, description, domain, age_group, html_code, css_code, js_code, 
     status, curriculum_type, view_count, use_count, is_public, schedule, tags, thumbnail, remark, 
     media, metadata, course_analysis, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, {
    replacements: [
      data.kindergartenId,
      data.creatorId,
      data.name,
      data.description,
      data.domain,
      data.ageGroup,
      data.htmlCode,
      data.cssCode,
      data.jsCode,
      data.status,
      data.curriculumType,
      data.viewCount,
      data.useCount,
      data.isPublic,
      data.schedule ? JSON.stringify(data.schedule) : null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.thumbnail,
      data.remark,
      JSON.stringify(data.media),
      JSON.stringify(data.metadata),
      JSON.stringify(data.courseAnalysis)
    ]
  });

  // 尝试获取 insertId
  const resultData = insertResult as any;
  let curriculumId = resultData.insertId || resultData[0]?.insertId;

  // 备用方案：查询最新插入的记录
  if (!curriculumId) {
    const [lastRecord] = await sequelizeDb.query(
      `SELECT id FROM creative_curriculums WHERE creator_id = ? ORDER BY id DESC LIMIT 1`,
      { replacements: [data.creatorId] }
    );
    curriculumId = (lastRecord as any)?.[0]?.id;
  }

  if (!curriculumId) {
    throw new Error('无法获取新创建的课程ID');
  }

  return curriculumId;
}

/**
 * 根据 ID 获取课程（使用 raw SQL 避免 Sequelize 模型问题）
 * 
 * @param id 课程 ID
 * @returns 课程数据对象或 null
 */
export async function findCurriculumById(id: number): Promise<any | null> {
  const sequelizeDb = getSequelize();
  const [results] = await sequelizeDb.query(
    `SELECT * FROM creative_curriculums WHERE id = ? LIMIT 1`,
    { replacements: [id] }
  );
  const row = (results as any)?.[0];
  if (!row) return null;
  
  // 转换 snake_case 到 camelCase
  return {
    id: row.id,
    kindergartenId: row.kindergarten_id,
    creatorId: row.creator_id,
    name: row.name,
    description: row.description,
    domain: row.domain,
    ageGroup: row.age_group,
    htmlCode: row.html_code,
    cssCode: row.css_code,
    jsCode: row.js_code,
    status: row.status,
    curriculumType: row.curriculum_type,
    viewCount: row.view_count,
    useCount: row.use_count,
    isPublic: !!row.is_public,
    schedule: row.schedule ? JSON.parse(row.schedule) : null,
    tags: row.tags ? JSON.parse(row.tags) : null,
    thumbnail: row.thumbnail,
    remark: row.remark,
    media: row.media ? (typeof row.media === 'string' ? JSON.parse(row.media) : row.media) : null,
    metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : null,
    courseAnalysis: row.course_analysis ? (typeof row.course_analysis === 'string' ? JSON.parse(row.course_analysis) : row.course_analysis) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * 更新课程
 * 
 * @param id 课程 ID
 * @param data 更新数据
 */
export async function updateCurriculumById(id: number, data: Partial<CurriculumCreateData>): Promise<void> {
  const sequelizeDb = getSequelize();
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
  if (data.domain !== undefined) { updates.push('domain = ?'); values.push(data.domain); }
  if (data.ageGroup !== undefined) { updates.push('age_group = ?'); values.push(data.ageGroup); }
  if (data.htmlCode !== undefined) { updates.push('html_code = ?'); values.push(data.htmlCode); }
  if (data.cssCode !== undefined) { updates.push('css_code = ?'); values.push(data.cssCode); }
  if (data.jsCode !== undefined) { updates.push('js_code = ?'); values.push(data.jsCode); }
  if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
  if (data.isPublic !== undefined) { updates.push('is_public = ?'); values.push(data.isPublic); }
  
  updates.push('updated_at = NOW()');
  values.push(id);
  
  await sequelizeDb.query(
    `UPDATE creative_curriculums SET ${updates.join(', ')} WHERE id = ?`,
    { replacements: values }
  );
}

/**
 * 增加课程浏览次数
 * 
 * @param id 课程 ID
 */
export async function incrementViewCount(id: number): Promise<void> {
  const sequelizeDb = getSequelize();
  await sequelizeDb.query(
    `UPDATE creative_curriculums SET view_count = view_count + 1, updated_at = NOW() WHERE id = ?`,
    { replacements: [id] }
  );
}
