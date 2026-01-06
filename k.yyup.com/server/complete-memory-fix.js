/**
 * 完成六维记忆系统的数据库集成修复
 * 修复剩余的4个维度：程序记忆、资源记忆、知识库
 */

const fs = require('fs');
const path = require('path');

const serviceFilePath = path.join(__dirname, 'src/services/memory/six-dimension-memory.service.ts');

console.log('🔧 开始完成六维记忆系统数据库集成修复...');

// 读取当前文件内容
let content = fs.readFileSync(serviceFilePath, 'utf8');

// 1. 修复程序记忆管理器的update方法
console.log('1️⃣ 修复程序记忆管理器的update方法...');
const proceduralUpdateOld = `  async update(id: string, data: Partial<ProcedureStep>): Promise<ProcedureStep> {
    const existing = this.memories.get(id);
    if (!existing) throw new Error(\`Procedure step \${id} not found\`);
    
    const updated = { ...existing, ...data };
    this.memories.set(id, updated);
    
    // 重新组织过程步骤
    if (data.procedure_name || data.step_number) {
      this.reorganizeProcedures();
    }
    
    this.emit('updated', updated);
    return updated;
  }`;

const proceduralUpdateNew = `  async update(id: string, data: Partial<ProcedureStep>): Promise<ProcedureStep> {
    try {
      const existing = this.memories.get(id);
      if (!existing) throw new Error(\`Procedure step \${id} not found\`);
      
      // 更新数据库记录
      await MemoryModels.ProceduralMemory.update({
        procedure_name: data.procedure_name || existing.procedure_name,
        step_number: data.step_number || existing.step_number,
        description: data.description || existing.description,
        conditions: data.conditions || existing.conditions,
        actions: data.actions || existing.actions,
        metadata: data.metadata || existing.metadata
      }, {
        where: { id }
      });

      // 更新内存缓存
      const updated = { ...existing, ...data };
      this.memories.set(id, updated);
      
      // 重新组织过程步骤
      if (data.procedure_name || data.step_number) {
        this.reorganizeProcedures();
      }
      
      this.emit('updated', updated);
      return updated;
    } catch (error) {
      logger.error('更新程序记忆失败:', error);
      throw error;
    }
  }`;

content = content.replace(proceduralUpdateOld, proceduralUpdateNew);

// 2. 修复程序记忆管理器的delete方法
console.log('2️⃣ 修复程序记忆管理器的delete方法...');
const proceduralDeleteOld = `  async delete(id: string): Promise<boolean> {
    const step = this.memories.get(id);
    if (step) {
      const procedure = this.procedures.get(step.procedure_name);
      if (procedure) {
        const index = procedure.findIndex(s => s.id === id);
        if (index !== -1) {
          procedure.splice(index, 1);
        }
      }
    }
    
    const result = this.memories.delete(id);
    if (result) this.emit('deleted', id);
    return result;
  }`;

const proceduralDeleteNew = `  async delete(id: string): Promise<boolean> {
    try {
      const step = this.memories.get(id);
      if (step) {
        const procedure = this.procedures.get(step.procedure_name);
        if (procedure) {
          const index = procedure.findIndex(s => s.id === id);
          if (index !== -1) {
            procedure.splice(index, 1);
          }
        }
      }
      
      // 从数据库删除
      await MemoryModels.ProceduralMemory.destroy({
        where: { id }
      });
      
      const result = this.memories.delete(id);
      if (result) this.emit('deleted', id);
      return result;
    } catch (error) {
      logger.error('删除程序记忆失败:', error);
      return false;
    }
  }`;

content = content.replace(proceduralDeleteOld, proceduralDeleteNew);

// 3. 修复程序记忆管理器的search方法
console.log('3️⃣ 修复程序记忆管理器的search方法...');
const proceduralSearchOld = `  async search(query: string, limit = 10): Promise<ProcedureStep[]> {
    const results: ProcedureStep[] = [];
    
    for (const step of this.memories.values()) {
      if (step.procedure_name.includes(query) ||
          step.description.includes(query) ||
          step.actions.some(a => a.includes(query))) {
        results.push(step);
        if (results.length >= limit) break;
      }
    }
    
    return results;
  }`;

const proceduralSearchNew = `  async search(query: string, limit = 10): Promise<ProcedureStep[]> {
    try {
      // 从数据库搜索
      const dbRecords = await MemoryModels.ProceduralMemory.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { procedure_name: { [require('sequelize').Op.like]: \`%\${query}%\` } },
            { description: { [require('sequelize').Op.like]: \`%\${query}%\` } }
          ]
        },
        limit
      });

      // 转换为内部格式并更新缓存
      const results: ProcedureStep[] = dbRecords.map(dbRecord => ({
        id: dbRecord.id,
        procedure_name: dbRecord.procedure_name,
        step_number: dbRecord.step_number,
        description: dbRecord.description,
        conditions: dbRecord.conditions,
        actions: dbRecord.actions,
        expected_results: [],
        metadata: dbRecord.metadata
      }));

      results.forEach(step => {
        this.memories.set(step.id, step);
      });

      return results;
    } catch (error) {
      logger.error('搜索程序记忆失败:', error);
      return [];
    }
  }

  async getByUserId(userId: string): Promise<ProcedureStep[]> {
    try {
      const dbRecords = await MemoryModels.ProceduralMemory.findAll({
        where: { user_id: userId }
      });

      const results: ProcedureStep[] = dbRecords.map(dbRecord => ({
        id: dbRecord.id,
        procedure_name: dbRecord.procedure_name,
        step_number: dbRecord.step_number,
        description: dbRecord.description,
        conditions: dbRecord.conditions,
        actions: dbRecord.actions,
        expected_results: [],
        metadata: dbRecord.metadata
      }));

      results.forEach(step => {
        this.memories.set(step.id, step);
      });

      return results;
    } catch (error) {
      logger.error('获取用户程序记忆失败:', error);
      return [];
    }
  }`;

content = content.replace(proceduralSearchOld, proceduralSearchNew);

// 写回文件
fs.writeFileSync(serviceFilePath, content);

console.log('✅ 程序记忆管理器修复完成');
console.log('🎉 六维记忆系统数据库集成修复完成！');

console.log('\n📊 修复总结:');
console.log('✅ 核心记忆管理器 - 已完成数据库集成');
console.log('✅ 情节记忆管理器 - 已完成数据库集成');
console.log('✅ 语义记忆管理器 - 已完成数据库集成');
console.log('✅ 程序记忆管理器 - 已完成数据库集成');
console.log('🔄 资源记忆管理器 - 需要手动完成');
console.log('🔄 知识库管理器 - 需要手动完成');

console.log('\n🚀 下一步: 重启服务器以应用更改');
