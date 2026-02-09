const { connectDB, Intermediate } = require('./db');
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

  // GET - public
  if (req.method === 'GET') {
    try {
      const items = await Intermediate.find().sort({ group: 1, name: 1 });
      const grouped = {};
      items.forEach(function (item) {
        if (!grouped[item.group]) grouped[item.group] = [];
        grouped[item.group].push({ _id: item._id, name: item.name, cas: item.cas });
      });
      const result = Object.keys(grouped).map(function (g) {
        return { group: g, items: grouped[g] };
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error('GET intermediates error:', err);
      return res.status(500).json({ error: 'Failed to load intermediates' });
    }
  }

  // Parse body (Vercel does not auto-parse)
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

  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const { group, name, cas } = body;
    if (!group || !name) return res.status(400).json({ error: 'Group and name are required' });
    try {
      const item = await Intermediate.create({ group, name, cas: cas || '' });
      return res.status(201).json(item);
    } catch (err) {
      console.error('POST intermediate error:', err);
      return res.status(500).json({ error: 'Failed to add intermediate' });
    }
  }

  if (req.method === 'PUT') {
    const { id, group, name, cas } = body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const update = {};
    if (group) update.group = group;
    if (name) update.name = name;
    if (cas !== undefined) update.cas = cas;
    try {
      const item = await Intermediate.findByIdAndUpdate(id, update, { new: true });
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(item);
    } catch (err) {
      console.error('PUT intermediate error:', err);
      return res.status(500).json({ error: 'Failed to update intermediate' });
    }
  }

  if (req.method === 'DELETE') {
    const id = body.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    try {
      await Intermediate.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE intermediate error:', err);
      return res.status(500).json({ error: 'Failed to delete intermediate' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
