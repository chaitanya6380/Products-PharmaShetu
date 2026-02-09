const jwt = require('jsonwebtoken');

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;
  try {
    const token = auth.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return true;
  } catch (e) {
    return false;
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = { verifyToken, setCors };
