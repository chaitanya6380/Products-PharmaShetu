const { connectDB, Intermediate } = require('./db');
const { verifyToken, setCors } = require('./middleware');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // GET - public
  if (req.method === 'GET') {
    const items = await Intermediate.find().sort({ group: 1, name: 1 });
    // Group them for frontend
    const grouped = {};
    items.forEach(function (item) {
      if (!grouped[item.group]) grouped[item.group] = [];
      grouped[item.group].push({ _id: item._id, name: item.name, cas: item.cas });
    });
    const result = Object.keys(grouped).map(function (g) {
      return { group: g, items: grouped[g] };
    });
    return res.status(200).json(result);
  }

  // Auth required
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });

  // POST - add
  if (req.method === 'POST') {
    const { group, name, cas } = req.body;
    if (!group || !name) return res.status(400).json({ error: 'Group and name are required' });
    const item = await Intermediate.create({ group, name, cas: cas || '' });
    return res.status(201).json(item);
  }

  // PUT - update
  if (req.method === 'PUT') {
    const { id, group, name, cas } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const update = {};
    if (group) update.group = group;
    if (name) update.name = name;
    if (cas !== undefined) update.cas = cas;
    const item = await Intermediate.findByIdAndUpdate(id, update, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(item);
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    await Intermediate.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
