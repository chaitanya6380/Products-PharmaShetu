// Vercel serverless: req.body is not auto-parsed. Read and parse JSON body.
function parseBody(req) {
  return new Promise(function (resolve, reject) {
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      return resolve({});
    }
    var chunks = [];
    req.on('data', function (chunk) { chunks.push(chunk); });
    req.on('end', function () {
      var body = Buffer.concat(chunks).toString('utf8');
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

module.exports = { parseBody };
