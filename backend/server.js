require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ---- Middleware ----
app.use(express.json());

const allowedOrigins = (process.env.CLIENT_URL || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  })
);

// ---- Routes ----
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    storage: process.env.USE_MEMORY_DB === 'true' ? 'memory' : 'mongodb',
  });
});

app.use('/api/transactions', transactionRoutes);

// ---- Error handling (must come after routes) ----
app.use(notFound);
app.use(errorHandler);

// ---- Start server ----
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
