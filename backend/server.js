const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://127.0.0.1:5500',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./config/db');

// ✅ Correct
app.use('/api/auth', require('./routes/auth.route'));

app.get('/api/health', (req, res) => {
  res.json({
    success:   true,
    message:   'NeatNest API is running ✅',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log(`  🚛 NeatNest API Server`);
  console.log(`  🌐 Running: http://localhost:${PORT}`);
  console.log(`  🏥 Health:  http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════');
  console.log('');
});

module.exports = app;