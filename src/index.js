const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./lib/db');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);


// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', chatRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
