const { connectDB, Api } = require('./db');
const { verifyToken, setCors } = require('./middleware');
const { parseBody } = require('./parseBody');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect error:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  // GET - public (no auth needed)
  if (req.method === 'GET') {
    try {
      const items = await Api.find().sort({ name: 1 });
      return res.status(200).json(items);
    } catch (err) {
      console.error('GET apis error:', err);
      return res.status(500).json({ error: 'Failed to load APIs' });
    }
  }

  // Parse body for POST, PUT, DELETE (Vercel does not auto-parse body)
  let body = {};
  if (req.body && typeof req.body === 'object') {
    body = req.body;
  } else {
    try {
      body = await parseBody(req);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  // All other methods need auth
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  // POST - add new
  if (req.method === 'POST') {
    const name = body.name;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
      const item = await Api.create({ name });
      return res.status(201).json(item);
    } catch (err) {
      console.error('POST api error:', err);
      return res.status(500).json({ error: 'Failed to add API' });
    }
  }

  // PUT - update
  if (req.method === 'PUT') {
    const { id, name } = body;
    if (!id || !name) return res.status(400).json({ error: 'ID and name are required' });
    try {
      const item = await Api.findByIdAndUpdate(id, { name }, { new: true });
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(item);
    } catch (err) {
      console.error('PUT api error:', err);
      return res.status(500).json({ error: 'Failed to update API' });
    }
  }

  // DELETE
  if (req.method === 'DELETE') {
    const id = body.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    try {
      await Api.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE api error:', err);
      return res.status(500).json({ error: 'Failed to delete API' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
