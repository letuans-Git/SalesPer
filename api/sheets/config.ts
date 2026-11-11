export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const envUrl = process.env.VITE_GOOGLE_SHEETS_URL || process.env.GOOGLE_SHEETS_URL || '';
    return res.status(200).json({
      publishedUrl: envUrl.trim(),
      autoSyncInterval: 0,
      lastSync: '',
    });
  }

  if (req.method === 'POST') {
    const { publishedUrl, autoSyncInterval } = req.body || {};
    return res.status(200).json({
      success: true,
      config: {
        publishedUrl: publishedUrl || '',
        autoSyncInterval: autoSyncInterval || 0,
        lastSync: new Date().toISOString(),
      },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
