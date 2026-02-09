const mongoose = require('mongoose');

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    }).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// --- Schemas ---
const apiSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true });

const intermediateSchema = new mongoose.Schema({
  group: { type: String, required: true },
  name: { type: String, required: true },
  cas: { type: String, default: '' }
}, { timestamps: true });

const pelletSchema = new mongoose.Schema({
  product: { type: String, required: true },
  percentage: { type: String, default: '' }
}, { timestamps: true });

// --- Models ---
const Api = mongoose.models.Api || mongoose.model('Api', apiSchema);
const Intermediate = mongoose.models.Intermediate || mongoose.model('Intermediate', intermediateSchema);
const Pellet = mongoose.models.Pellet || mongoose.model('Pellet', pelletSchema);

module.exports = { connectDB, Api, Intermediate, Pellet };
