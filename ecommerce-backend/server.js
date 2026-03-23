require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => res.json({ message: 'E-Commerce API Running' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler - must have 4 params for Express to recognize it
app.use((err, req, res, next) => {
  console.error(err.stack);
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  res.status(statusCode).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
