import { Sequelize } from 'sequelize';

// WARNING: Test DB only. This script alters ENUM values safely and verifies results.
// It adds 'search' to ai_model_config.model_type and marks volcano-fusion-search as default.

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function run() {
  try {
    console.log('🔌 Connecting to DB...');
    await sequelize.authenticate();
    console.log('✅ Connected');

    // 1) Inspect current ENUM
    const [cols] = await sequelize.query("SHOW FULL COLUMNS FROM ai_model_config LIKE 'model_type'");
    const col = Array.isArray(cols) && cols[0] ? cols[0] : null;
    const typeStr = col?.Type || col?.type || '';
    console.log('📋 Current model_type:', typeStr);

    const hasSearch = /'search'/.test(typeStr);

    // 2) If missing, alter table to add 'search'
    if (!hasSearch) {
      console.log('🛠️  Adding \"search\" to ENUM...');
      const sql = "ALTER TABLE ai_model_config\n        MODIFY COLUMN model_type ENUM('text','speech','image','video','multimodal','embedding','search') NOT NULL";
      await sequelize.query(sql);
      console.log('✅ ENUM updated');
    } else {
      console.log('ℹ️  ENUM already contains \"search\". Skipping alter.');
    }

    // 3) Mark volcano-fusion-search as active/default and set type to search (idempotent)
    console.log('🔧 Upserting volcano-fusion-search flags...');
    await sequelize.query(`UPDATE ai_model_config
      SET model_type='search', status='active', is_default=1
      WHERE name='volcano-fusion-search'`);

    // 4) Verify
    const [cols2] = await sequelize.query("SHOW FULL COLUMNS FROM ai_model_config LIKE 'model_type'");
    console.log('📋 Updated model_type:', cols2[0]?.Type);

    const [row] = await sequelize.query(`SELECT id,name,model_type,status,is_default FROM ai_model_config
      WHERE name='volcano-fusion-search'`);
    console.table(row);

    console.log('🎉 Migration completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();

