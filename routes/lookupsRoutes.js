const express = require('express');
const Horse = require('../models/Horse');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'You do not have access to this resource.' });
  }

  return next();
});

router.get('/horses', async (req, res) => {
  const horses = await Horse.find({ ownerId: req.user._id })
    .select('name ownerId age notes')
    .populate('ownerId', 'name email role')
    .sort({ name: 1 });

  return res.json(horses);
});

router.get('/owners', async (_req, res) => {
  const owners = await User.find({ role: 'owner' })
    .select('name email role')
    .sort({ name: 1 });

  return res.json(owners);
});

module.exports = router;
