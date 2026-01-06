const express = require('express');
const { getSequelize } = require('./server/dist/models');
const { AIModelConfig } = require('./server/dist/models');

const app = express();
app.use(express.json());

app.get('/debug/ai-models', async (req, res) => {
  try {
    const sequelize = getSequelize();
    const models = sequelize.models;

    if (!models.AIModelConfig) {
      return res.json({ error: 'AIModelConfig model not found' });
    }

    const aiModels = await models.AIModelConfig.findAll({
      attributes: ['id', 'name', 'displayName', 'provider', 'endpointUrl', 'status', 'isDefault', 'apiKey'],
      limit: 10
    });

    const modelConfigs = aiModels.map(model => ({
      id: model.id,
      name: model.name,
      displayName: model.displayName,
      provider: model.provider,
      endpointUrl: model.endpointUrl,
      status: model.status,
      isDefault: model.isDefault,
      hasApiKey: !!model.apiKey,
      apiKeyPrefix: model.apiKey ? model.apiKey.substring(0, 8) + '...' : 'none'
    }));

    res.json({
      total: modelConfigs.length,
      models: modelConfigs
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Debug server running on http://localhost:3001');
});