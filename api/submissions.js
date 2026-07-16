import { kv } from './_lib/kv.js';

function isAuthed(req) {
  const pw = req.headers['x-admin-password'];
  return Boolean(pw) && Boolean(process.env.ADMIN_PASSWORD) && pw === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const raw = await kv(['HGETALL', 'brand_briefs']); // [field, value, field, value, ...]
      const list = [];
      for (let i = 0; i < raw.length; i += 2) {
        try { list.push(JSON.parse(raw[i + 1])); } catch {}
      }
      list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      return res.status(200).json(list);
    }

    if (req.method === 'PATCH') {
      const { id, viewed } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const raw = await kv(['HGET', 'brand_briefs', id]);
      if (!raw) return res.status(404).json({ error: 'Not found' });
      const sub = JSON.parse(raw);
      sub.viewed = viewed;
      await kv(['HSET', 'brand_briefs', id, JSON.stringify(sub)]);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query || {};
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await kv(['HDEL', 'brand_briefs', id]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
