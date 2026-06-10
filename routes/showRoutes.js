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

  const horse = await ownerCanAccessHorse(ownerId, showSchedule.horseId);
  return Boolean(horse);
}

router.use(authMiddleware);
router.use(authorizeRoles('owner', 'trainer', 'student'));

router.get('/', async (req, res) => {
  let filter;

  if (req.user.role === 'trainer') {
    filter = { trainerId: req.user._id };
  } else if (req.user.role === 'student') {
    filter = { riderId: req.user._id };
  } else {
    const ownedHorseIds = await Horse.find({ ownerId: req.user._id }).distinct('_id');
    filter = { horseId: { $in: ownedHorseIds } };
  }

  const shows = await populateShow(ShowSchedule.find(filter)).sort({ showTime: 1 });
  return res.json(shows);
});

router.post('/', authorizeRoles('owner', 'trainer'), async (req, res) => {
  try {
    const [horse, rider, trainer] = await Promise.all([
      req.user.role === 'owner'
        ? ownerCanAccessHorse(req.user._id, req.body.horseId)
        : Horse.findById(req.body.horseId),
      User.findOne({ _id: req.body.riderId, role: 'student' }),
      User.findOne({
        _id: req.user.role === 'trainer' ? req.user._id : req.body.trainerId,
        role: 'trainer',
      }),
    ]);

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found.' });
    }

    if (!trainer) {
      return res.status(403).json({ message: 'Trainer account not found.' });
    }

    const showSchedule = await ShowSchedule.create({
      ...req.body,
      trainerId: req.user.role === 'trainer' ? req.user._id : req.body.trainerId,
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

    if (!showSchedule) {
      return res.status(404).json({ message: 'Show schedule not found.' });
    }

    let hasAccess = false;

    if (req.user.role === 'trainer') {
      hasAccess = showSchedule.trainerId.toString() === req.user._id.toString();
    } else if (req.user.role === 'student') {
      hasAccess = showSchedule.riderId.toString() === req.user._id.toString();
    } else {
      hasAccess = await ownerCanAccessShow(req.user._id, showSchedule);
    }

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
      const rider = await User.findOne({ _id: req.body.riderId, role: 'student' });

      if (!rider) {
        return res.status(404).json({ message: 'Rider not found.' });
      }
    }

    if (req.user.role === 'owner' && req.body.trainerId) {
      const trainer = await User.findOne({ _id: req.body.trainerId, role: 'trainer' });

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

router.delete('/:id', authorizeRoles('owner', 'trainer'), async (req, res) => {
  let showSchedule;

  if (req.user.role === 'trainer') {
    showSchedule = await ShowSchedule.findOneAndDelete({
      _id: req.params.id,
      trainerId: req.user._id,
    });
  } else {
    const existingShow = await ShowSchedule.findById(req.params.id);

    if (!(await ownerCanAccessShow(req.user._id, existingShow))) {
      return res.status(403).json({ message: 'You do not have access to this show schedule.' });
    }

    showSchedule = await ShowSchedule.findByIdAndDelete(req.params.id);
  }

  if (!showSchedule) {
    return res.status(404).json({ message: 'Show schedule not found.' });
  }

  return res.json({ message: 'Show schedule deleted successfully.' });
});

module.exports = router;
