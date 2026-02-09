const { connectDB, Api } = require('./db');
const { verifyToken, setCors } = require('./middleware');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // GET - public (no auth needed)
  if (req.method === 'GET') {
    const items = await Api.find().sort({ name: 1 });
    return res.status(200).json(items);
  }

  // All other methods need auth
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  // POST - add new
  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const item = await Api.create({ name });
    return res.status(201).json(item);
  }

  // PUT - update
  if (req.method === 'PUT') {
    const { id, name } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'ID and name are required' });
    const item = await Api.findByIdAndUpdate(id, { name }, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(item);
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    await Api.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
