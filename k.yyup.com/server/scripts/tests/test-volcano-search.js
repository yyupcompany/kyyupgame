import { Sequelize } from 'sequelize';
import axios from 'axios';

// Simple read-only smoke test for Volcano Fusion Search using DB config
// Safe to run on test DB. Does not modify state.

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function main() {
  try {
    console.log('🔌 Connecting DB...');
    await sequelize.authenticate();
    console.log('✅ DB connected');

    const [rows] = await sequelize.query(`
      SELECT id, name, endpoint_url, api_key, status, is_default, model_type
      FROM ai_model_config
      WHERE name='volcano-fusion-search' AND status='active'
      LIMIT 1
    `);

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('volcano-fusion-search config not found or inactive');
    }

    const cfg = rows[0];
    console.log('📋 Using model config:', {
      id: cfg.id,
      name: cfg.name,
      endpoint: cfg.endpoint_url,
      type: cfg.model_type,
      is_default: cfg.is_default
    });

    const body = {
      Query: '2025年 强制社保 幼儿园 影响',
      SearchType: 'web_summary',
      Count: 3,
      NeedSummary: true
    };

    console.log('🌐 POST', cfg.endpoint_url);
    const res = await axios.post(cfg.endpoint_url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.api_key}`,
        'User-Agent': 'YY-AI-Assistant/1.0'
      },
      timeout: 30000,
      validateStatus: s => s < 500
    });

    console.log('📡 Status:', res.status);
    let data = res.data;

    // Handle possible string payload starting with "data:" (gateway quirk)
    if (typeof data === 'string') {
      let s = data.trim();
      if (s.startsWith('data:')) s = s.replace(/^data:/, '').trim();
      try { data = JSON.parse(s); } catch {}
    }

    // Normalize basic fields similar to webSearchTool
    let items = [];
    const webResults = Array.isArray(data?.Result?.WebResults)
      ? data.Result.WebResults
      : (Array.isArray(data?.WebResults) ? data.WebResults : []);

    if (webResults.length) {
      items = webResults.map(it => ({
        title: it.Title || '结果',
        url: it.Url,
        snippet: it.Snippet || it.Summary || ''
      }));
    }

    const aiSummary = Array.isArray(data?.Result?.Choices)
      ? data.Result.Choices.map(c => c?.Delta?.Content).filter(Boolean).join('')
      : (Array.isArray(data?.Choices) ? (data.Choices[0]?.Message?.content || '') : '');

    console.log('🔎 Items:', items.slice(0, 3));
    console.log('🧠 Summary length:', aiSummary?.length || 0);

    const payloadHasWebResultsHint = (typeof data === 'string') && /"WebResults"\s*:\s*\[/.test(data);
    if ((res.status >= 200 && res.status < 300) && (items.length > 0 || aiSummary || payloadHasWebResultsHint)) {
      console.log('✅ Volcano Fusion Search smoke test PASSED');
      process.exit(0);
    } else {
      console.log('⚠️ Volcano API responded but no items/summary parsed. Check payload shape.');
      const preview = typeof data === 'string' ? data : JSON.stringify(data);
      console.log(preview.slice(0, 500) + '...');
      process.exit(2);
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

