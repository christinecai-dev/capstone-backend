const express = require('express');
const Horse = require('../models/Horse');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/horses', async (req, res) => {
  const filter = req.user.role === 'owner' ? { ownerId: req.user._id } : {};

  const horses = await Horse.find(filter)
    .select('name ownerId age notes')
    .populate('ownerId', 'name email role')
    .sort({ name: 1 });

  return res.json(horses);
});

router.get('/trainers', async (_req, res) => {
  const trainers = await User.find({ role: 'trainer' })
    .select('name email role')
    .sort({ name: 1 });

  return res.json(trainers);
});

router.get('/students', async (_req, res) => {
  const students = await User.find({ role: 'student' })
    .select('name email role')
    .sort({ name: 1 });

  return res.json(students);
});

router.get('/riders', async (_req, res) => {
  const riders = await User.find({ role: 'student' })
    .select('name email role')
    .sort({ name: 1 });

  return res.json(riders);
});

module.exports = router;
