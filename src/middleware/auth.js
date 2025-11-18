const auth = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ erro: 'Acesso negado. API Key inválida.' });
  }
  next();
};

module.exports = auth;