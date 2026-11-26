function healthCheck(req, res) {
  res.json({ status: 'UP' });
}

module.exports = { healthCheck };