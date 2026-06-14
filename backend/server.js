require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server / Postman requests
      if (!origin) return callback(null, true);

      // Allow exact matches and Vercel preview domains
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.options('*', cors());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    storage: process.env.USE_MEMORY_DB === 'true' ? 'memory' : 'mongodb',
  });
});

app.use('/api/transactions', transactionRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const start = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;
module.exports.start = start;