const { kv } = require('@vercel/kv');

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

module.exports = async function handler(req, res) {
  const secret = process.env.DOWNLOAD_SECRET;

  if (!secret || req.query.secret !== secret) {
    return res.status(401).send('Unauthorized');
  }

  const raw = await kv.lrange('responses', 0, -1);

  const rows = raw.map(function(item) {
    try { return JSON.parse(item); } catch { return null; }
  }).filter(Boolean);

  // Most recent first (lpush stores newest at index 0)
  const header = ['Timestamp', 'Experiment', 'Title', 'Response'];
  const lines = [header.join(',')];

  for (const row of rows) {
    lines.push([
      escapeCSV(row.timestamp),
      escapeCSV(row.experiment),
      escapeCSV(row.title),
      escapeCSV(row.response),
    ].join(','));
  }

  const csv = lines.join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="gemini-responses.csv"');
  return res.status(200).send(csv);
};
