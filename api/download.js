const { list } = require('@vercel/blob');

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

  const blobs = [];
  let cursor;

  do {
    const page = await list({ prefix: 'response-', cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor);

  const rows = await Promise.all(
    blobs.map(async (blob) => {
      try {
        const r = await fetch(blob.downloadUrl);
        return await r.json();
      } catch {
        return null;
      }
    })
  );

  const valid = rows.filter(Boolean).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const header = ['Timestamp', 'Experiment', 'Title', 'Response'];
  const lines = [header.join(',')];

  for (const row of valid) {
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
