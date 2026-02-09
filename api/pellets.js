const { connectDB, Pellet } = require('./db');
const { verifyToken, setCors } = require('./middleware');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // GET - public
  if (req.method === 'GET') {
    const items = await Pellet.find().sort({ product: 1 });
    return res.status(200).json(items);
  }

  // Auth required
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  // POST - add
  if (req.method === 'POST') {
    const { product, percentage } = req.body;
    if (!product) return res.status(400).json({ error: 'Product is required' });
    const item = await Pellet.create({ product, percentage: percentage || '' });
    return res.status(201).json(item);
  }

  // PUT - update
  if (req.method === 'PUT') {
    const { id, product, percentage } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const update = {};
    if (product) update.product = product;
    if (percentage !== undefined) update.percentage = percentage;
    const item = await Pellet.findByIdAndUpdate(id, update, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(item);
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    await Pellet.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
