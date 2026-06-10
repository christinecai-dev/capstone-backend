const express = require('express');
const ShowSchedule = require('../models/ShowSchedule');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  findOwnedHorse,
  findOwnedShow,
  populateShow,
  validateOptionalUser,
} = require('../utils/scheduleRouteHelpers');

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('owner'));

router.get('/', async (req, res) => {
  const shows = await populateShow(ShowSchedule.find({ ownerId: req.user._id })).sort({ showTime: 1 });
  return res.json(shows);
});

router.post('/', async (req, res) => {
  try {
    const horse = await findOwnedHorse(req.user._id, req.body.horseId);

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    await Promise.all([
      validateOptionalUser(req.body.riderId, 'Rider'),
      validateOptionalUser(req.body.trainerId, 'Trainer'),
    ]);

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
    const showSchedule = await findOwnedShow(req.user._id, req.params.id);

    if (!showSchedule) {
      return res.status(404).json({ message: 'Show schedule not found.' });
    }

    const ownedHorse = req.body.horseId ? await findOwnedHorse(req.user._id, req.body.horseId) : null;

    if (req.body.horseId && !ownedHorse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    if (!req.body.riderId && Object.prototype.hasOwnProperty.call(req.body, 'riderId')) {
      req.body.riderId = null;
    }

    await Promise.all([
      validateOptionalUser(req.body.riderId, 'Rider'),
      validateOptionalUser(req.body.trainerId, 'Trainer'),
    ]);

    Object.assign(showSchedule, req.body);
    await showSchedule.save();

    const populatedShow = await populateShow(ShowSchedule.findById(showSchedule._id));
    return res.json(populatedShow);
  } catch (error) {
    return res.status(error.statusCode || 400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const showSchedule = await findOwnedShow(req.user._id, req.params.id);

  if (!showSchedule) {
    return res.status(403).json({ message: 'You do not have access to this show schedule.' });
  }

  await ShowSchedule.findByIdAndDelete(req.params.id);

  return res.json({ message: 'Show schedule deleted successfully.' });
});

module.exports = router;
