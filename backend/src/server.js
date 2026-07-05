require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

console.log('Starting LifeLink API Server...');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'LifeLink API Server',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Load routes with error handling
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes loaded');
} catch (error) {
  console.error('Failed to load auth routes:', error.message);
}

try {
  const donorRoutes = require('./routes/donorRoutes');
  app.use('/api/donors', donorRoutes);
  console.log('Donor routes loaded');
} catch (error) {
  console.error('Failed to load donor routes:', error.message);
}

try {
  const requestRoutes = require('./routes/requestRoutes');
  app.use('/api/requests', requestRoutes);
  console.log('Request routes loaded');
} catch (error) {
  console.error('Failed to load request routes:', error.message);
}

try {
  const hospitalRoutes = require('./routes/hospitalRoutes');
  app.use('/api/hospitals', hospitalRoutes);
  console.log('Hospital routes loaded');
} catch (error) {
  console.error('Failed to load hospital routes:', error.message);
}

try {
  const bloodBankRoutes = require('./routes/bloodBankRoutes');
  app.use('/api/blood-banks', bloodBankRoutes);
  console.log('Blood bank routes loaded');
} catch (error) {
  console.error('Failed to load blood bank routes:', error.message);
}

try {
  const doctorRoutes = require('./routes/doctorRoutes');
  app.use('/api/doctors', doctorRoutes);
  console.log('Doctor routes loaded');
} catch (error) {
  console.error('Failed to load doctor routes:', error.message);
}

try {
  const appointmentRoutes = require('./routes/appointmentRoutes');
  app.use('/api/appointments', appointmentRoutes);
  console.log('Appointment routes loaded');
} catch (error) {
  console.error('Failed to load appointment routes:', error.message);
}

try {
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use('/api/notifications', notificationRoutes);
  console.log('Notification routes loaded');
} catch (error) {
  console.error('Failed to load notification routes:', error.message);
}

try {
  const articleRoutes = require('./routes/articleRoutes');
  app.use('/api/articles', articleRoutes);
  console.log('Article routes loaded');
} catch (error) {
  console.error('Failed to load article routes:', error.message);
}

try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
  console.log('Admin routes loaded');
} catch (error) {
  console.error('Failed to load admin routes:', error.message);
}

try {
  const aiRoutes = require('./routes/aiRoutes');
  app.use('/api/ai', aiRoutes);
  console.log('AI routes loaded');
} catch (error) {
  console.error('Failed to load AI routes:', error.message);
}

try {
  const chatbotRoutes = require('./routes/chatbotRoutes');
  app.use('/api/chatbot', chatbotRoutes);
  console.log('Chatbot routes loaded');
} catch (error) {
  console.error('Failed to load chatbot routes:', error.message);
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`LifeLink server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
