const express = require('express');
const Horse = require('../models/Horse');
const ShowSchedule = require('../models/ShowSchedule');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

function populateShow(query) {
  return query
    .populate('horseId', 'name')
    .populate('trainerId', 'name email role')
    .populate('riderId', 'name email role');
}

async function ownerCanAccessHorse(ownerId, horseId) {
  const horse = await Horse.findOne({ _id: horseId, ownerId });
  return horse;
}

async function ownerCanAccessShow(ownerId, showSchedule) {
  if (!showSchedule) {
    return false;
  }

  return showSchedule.ownerId.toString() === ownerId.toString();
}

router.use(authMiddleware);
router.use(authorizeRoles('owner'));

router.get('/', async (req, res) => {
  const shows = await populateShow(ShowSchedule.find({ ownerId: req.user._id })).sort({ showTime: 1 });
  return res.json(shows);
});

router.post('/', async (req, res) => {
  try {
    const [horse, rider, trainer] = await Promise.all([
      ownerCanAccessHorse(req.user._id, req.body.horseId),
      req.body.riderId ? User.findById(req.body.riderId) : null,
      req.body.trainerId ? User.findById(req.body.trainerId) : null,
    ]);

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    if (req.body.riderId && !rider) {
      return res.status(404).json({ message: 'Rider not found.' });
    }

    if (req.body.trainerId && !trainer) {
      return res.status(404).json({ message: 'Trainer not found.' });
    }

    const showSchedule = await ShowSchedule.create({
      ...req.body,
      ownerId: req.user._id,
    });

    const populatedShow = await populateShow(ShowSchedule.findById(showSchedule._id));
    return res.status(201).json(populatedShow);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const showSchedule = await ShowSchedule.findById(req.params.id);

    if (!showSchedule || !(await ownerCanAccessShow(req.user._id, showSchedule))) {
      return res.status(404).json({ message: 'Show schedule not found.' });
    }

    if (req.user.role === 'owner' && req.body.horseId) {
      const ownedHorse = await ownerCanAccessHorse(req.user._id, req.body.horseId);

      if (!ownedHorse) {
        return res.status(404).json({ message: 'Horse not found.' });
      }
    }

    if (req.body.horseId) {
      const horse = await Horse.findById(req.body.horseId);

      if (!horse) {
        return res.status(404).json({ message: 'Horse not found.' });
      }
    }

    if (req.body.riderId) {
      const rider = await User.findById(req.body.riderId);

      if (!rider) {
        return res.status(404).json({ message: 'Rider not found.' });
      }
    }

    if (!req.body.riderId && Object.prototype.hasOwnProperty.call(req.body, 'riderId')) {
      req.body.riderId = null;
    }

    if (req.body.trainerId) {
      const trainer = await User.findById(req.body.trainerId);

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found.' });
      }
    }

    Object.assign(showSchedule, req.body);
    await showSchedule.save();

    const populatedShow = await populateShow(ShowSchedule.findById(showSchedule._id));
    return res.json(populatedShow);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const existingShow = await ShowSchedule.findById(req.params.id);

  if (!(await ownerCanAccessShow(req.user._id, existingShow))) {
    return res.status(403).json({ message: 'You do not have access to this show schedule.' });
  }

  const showSchedule = await ShowSchedule.findByIdAndDelete(req.params.id);

  if (!showSchedule) {
    return res.status(404).json({ message: 'Show schedule not found.' });
  }

  return res.json({ message: 'Show schedule deleted successfully.' });
});

module.exports = router;
