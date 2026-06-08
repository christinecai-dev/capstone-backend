const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./config/db');
const passport = require('./middleware/passport');
const authRoutes = require('./routes/authRoutes');
const horseRoutes = require('./routes/horseRoutes');
const eventRoutes = require('./routes/eventRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const showRoutes = require('./routes/showRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ message: 'EquiSchedule API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/horses', horseRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/shows', showRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set.');
    }

    await connectToDatabase();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
