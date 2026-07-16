import { kv } from './_lib/kv.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formData, formatted } = req.body || {};
  if (!formData || !formatted) {
    return res.status(400).json({ error: 'Missing form data' });
  }

  const id = crypto.randomUUID();
  const submission = {
    id,
    submittedAt: new Date().toISOString(),
    companyName: formData.companyName || 'Unnamed',
    contactEmail: formData.contactEmail || '',
    data: formData,
    formatted,
    viewed: false,
  };

  try {
    await kv(['HSET', 'brand_briefs', id, JSON.stringify(submission)]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save submission', detail: err.message });
  }

  return res.status(200).json({ ok: true, id });
}
