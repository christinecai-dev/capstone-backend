const express = require('express');
const Horse = require('../models/Horse');
const ShowSchedule = require('../models/ShowSchedule');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('trainer', 'student'));

router.get('/', async (req, res) => {
  const filter =
    req.user.role === 'trainer'
      ? { trainerId: req.user._id }
      : { riderId: req.user._id };

  const shows = await ShowSchedule.find(filter).sort({ showTime: 1 });
  return res.json(shows);
});

router.post('/', authorizeRoles('trainer'), async (req, res) => {
  try {
    const [horse, rider] = await Promise.all([
      Horse.findById(req.body.horseId),
      User.findOne({ _id: req.body.riderId, role: 'student' }),
    ]);

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found.' });
    }

    const showSchedule = await ShowSchedule.create({
      ...req.body,
      trainerId: req.user._id,
    });

    return res.status(201).json(showSchedule);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const showSchedule = await ShowSchedule.findById(req.params.id);

    if (!showSchedule) {
      return res.status(404).json({ message: 'Show schedule not found.' });
    }

    const hasAccess =
      req.user.role === 'trainer'
        ? showSchedule.trainerId.toString() === req.user._id.toString()
        : showSchedule.riderId.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this show schedule.' });
    }

    if (req.user.role === 'student') {
      delete req.body.riderId;
      delete req.body.trainerId;
    }

    if (req.user.role === 'trainer') {
      delete req.body.trainerId;
    }

    if (req.body.horseId) {
      const horse = await Horse.findById(req.body.horseId);

      if (!horse) {
        return res.status(404).json({ message: 'Horse not found.' });
      }
    }

    if (req.body.riderId) {
      const rider = await User.findOne({ _id: req.body.riderId, role: 'student' });

      if (!rider) {
        return res.status(404).json({ message: 'Rider not found.' });
      }
    }

    Object.assign(showSchedule, req.body);
    await showSchedule.save();

    return res.json(showSchedule);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authorizeRoles('trainer'), async (req, res) => {
  const showSchedule = await ShowSchedule.findOneAndDelete({
    _id: req.params.id,
    trainerId: req.user._id,
  });

  if (!showSchedule) {
    return res.status(404).json({ message: 'Show schedule not found.' });
  }

  return res.json({ message: 'Show schedule deleted successfully.' });
});

module.exports = router;
