const { connectDB, Pellet } = require('./db');
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
      const items = await Pellet.find().sort({ product: 1 });
      return res.status(200).json(items);
    } catch (err) {
      console.error('GET pellets error:', err);
      return res.status(500).json({ error: 'Failed to load pellets' });
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
    const { product, percentage } = body;
    if (!product) return res.status(400).json({ error: 'Product is required' });
    try {
      const item = await Pellet.create({ product, percentage: percentage || '' });
      return res.status(201).json(item);
    } catch (err) {
      console.error('POST pellet error:', err);
      return res.status(500).json({ error: 'Failed to add pellet' });
    }
  }

  if (req.method === 'PUT') {
    const { id, product, percentage } = body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const update = {};
    if (product) update.product = product;
    if (percentage !== undefined) update.percentage = percentage;
    try {
      const item = await Pellet.findByIdAndUpdate(id, update, { new: true });
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(item);
    } catch (err) {
      console.error('PUT pellet error:', err);
      return res.status(500).json({ error: 'Failed to update pellet' });
    }
  }

  if (req.method === 'DELETE') {
    const id = body.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    try {
      await Pellet.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE pellet error:', err);
      return res.status(500).json({ error: 'Failed to delete pellet' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
