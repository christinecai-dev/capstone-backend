const express = require('express');
const Lesson = require('../models/Lesson');
const Horse = require('../models/Horse');
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
      : { studentId: req.user._id };

  const lessons = await Lesson.find(filter).sort({ date: 1, time: 1 });
  return res.json(lessons);
});

router.post('/', authorizeRoles('trainer'), async (req, res) => {
  try {
    const [horse, student] = await Promise.all([
      Horse.findById(req.body.horseId),
      User.findOne({ _id: req.body.studentId, role: 'student' }),
    ]);

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const lesson = await Lesson.create({
      ...req.body,
      trainerId: req.user._id,
    });

    return res.status(201).json(lesson);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    const hasAccess =
      req.user.role === 'trainer'
        ? lesson.trainerId.toString() === req.user._id.toString()
        : lesson.studentId.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this lesson.' });
    }

    if (req.user.role === 'student') {
      delete req.body.studentId;
      delete req.body.trainerId;
    }

    if (req.user.role === 'trainer') {
      delete req.body.trainerId;
    }

    if (req.body.studentId) {
      const student = await User.findOne({ _id: req.body.studentId, role: 'student' });

      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }
    }

    if (req.body.horseId) {
      const horse = await Horse.findById(req.body.horseId);

      if (!horse) {
        return res.status(404).json({ message: 'Horse not found.' });
      }
    }

    Object.assign(lesson, req.body);
    await lesson.save();

    return res.json(lesson);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authorizeRoles('trainer'), async (req, res) => {
  const lesson = await Lesson.findOneAndDelete({
    _id: req.params.id,
    trainerId: req.user._id,
  });

  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found.' });
  }

  return res.json({ message: 'Lesson deleted successfully.' });
});

module.exports = router;
