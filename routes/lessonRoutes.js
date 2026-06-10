const express = require('express');
const Lesson = require('../models/Lesson');
const Horse = require('../models/Horse');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

function populateLesson(query) {
  return query
    .populate('horseId', 'name')
    .populate('trainerId', 'name email role')
    .populate('studentId', 'name email role');
}

router.use(authMiddleware);
router.use(authorizeRoles('owner'));

router.get('/', async (req, res) => {
  const lessons = await populateLesson(Lesson.find({ ownerId: req.user._id })).sort({ date: 1, time: 1 });
  return res.json(lessons);
});

router.post('/', async (req, res) => {
  try {
    const horse = await Horse.findOne({ _id: req.body.horseId, ownerId: req.user._id });

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    let trainer = null;
    let student = null;

    if (req.body.trainerId) {
      trainer = await User.findById(req.body.trainerId);

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found.' });
      }
    }

    if (req.body.studentId) {
      student = await User.findById(req.body.studentId);

      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }
    }

    const lesson = await Lesson.create({
      ...req.body,
      ownerId: req.user._id,
    });

    const populatedLesson = await populateLesson(Lesson.findById(lesson._id));
    return res.status(201).json(populatedLesson);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson || lesson.ownerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    if (req.body.studentId) {
      const student = await User.findById(req.body.studentId);

      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }
    }

    if (req.body.horseId) {
      const horse = await Horse.findOne({ _id: req.body.horseId, ownerId: req.user._id });

      if (!horse) {
        return res.status(404).json({ message: 'Horse not found.' });
      }
    }

    if (req.body.trainerId) {
      const trainer = await User.findById(req.body.trainerId);

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found.' });
      }
    }

    Object.assign(lesson, req.body);
    await lesson.save();

    const populatedLesson = await populateLesson(Lesson.findById(lesson._id));
    return res.json(populatedLesson);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const lesson = await Lesson.findOneAndDelete({
    _id: req.params.id,
    ownerId: req.user._id,
  });

  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found.' });
  }

  return res.json({ message: 'Lesson deleted successfully.' });
});

module.exports = router;
