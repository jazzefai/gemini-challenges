const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { experiment_num, experiment_title, response, timestamp } = req.body;

  if (!experiment_num || !response) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const entry = {
    timestamp: timestamp || new Date().toISOString(),
    experiment: `Experiment ${experiment_num}`,
    title: experiment_title || '',
    response,
  };

  await kv.lpush('responses', JSON.stringify(entry));

  return res.status(200).json({ ok: true });
};
