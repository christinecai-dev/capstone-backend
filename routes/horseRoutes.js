const express = require('express');
const Horse = require('../models/Horse');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('owner'));

router.get('/', async (req, res) => {
  const horses = await Horse.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  return res.json(horses);
});

router.post('/', async (req, res) => {
  try {
    delete req.body.ownerId;

    const horse = await Horse.create({
      ...req.body,
      ownerId: req.user._id,
    });

    return res.status(201).json(horse);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    delete req.body.ownerId;

    const horse = await Horse.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    return res.json(horse);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const horse = await Horse.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });

  if (!horse) {
    return res.status(404).json({ message: 'Horse not found.' });
  }

  return res.json({ message: 'Horse deleted successfully.' });
});

module.exports = router;
