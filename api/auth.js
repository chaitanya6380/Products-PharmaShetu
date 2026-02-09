const jwt = require('jsonwebtoken');
const { parseBody } = require('./parseBody');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

  const password = body.password;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  try {
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    return res.status(200).json({ token });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};
