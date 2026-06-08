const express = require('express');
const Event = require('../models/Event');
const Horse = require('../models/Horse');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('owner'));

router.get('/', async (req, res) => {
  const events = await Event.find({ ownerId: req.user._id }).sort({ date: 1 });
  return res.json(events);
});

router.post('/', async (req, res) => {
  try {
    delete req.body.ownerId;

    const horse = await Horse.findOne({ _id: req.body.horseId, ownerId: req.user._id });

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    const event = await Event.create({
      ...req.body,
      ownerId: req.user._id,
    });

    return res.status(201).json(event);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    delete req.body.ownerId;

    if (req.body.horseId) {
      const horse = await Horse.findOne({ _id: req.body.horseId, ownerId: req.user._id });

      if (!horse) {
        return res.status(404).json({ message: 'Horse not found.' });
      }
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.json(event);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const event = await Event.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });

  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  return res.json({ message: 'Event deleted successfully.' });
});

module.exports = router;
