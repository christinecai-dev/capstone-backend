const express = require('express');
const Lesson = require('../models/Lesson');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  findOwnedHorse,
  findOwnedLesson,
  populateLesson,
  validateOptionalUser,
} = require('../utils/scheduleRouteHelpers');

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('owner'));

router.get('/', async (req, res) => {
  const lessons = await populateLesson(Lesson.find({ ownerId: req.user._id })).sort({ date: 1, time: 1 });
  return res.json(lessons);
});

router.post('/', async (req, res) => {
  try {
    const horse = await findOwnedHorse(req.user._id, req.body.horseId);

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    await Promise.all([
      validateOptionalUser(req.body.trainerId, 'Trainer'),
      validateOptionalUser(req.body.studentId, 'Student'),
    ]);

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
    const lesson = await findOwnedLesson(req.user._id, req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    if (req.body.studentId) {
      await validateOptionalUser(req.body.studentId, 'Student');
    }

    if (req.body.horseId) {
      const horse = await findOwnedHorse(req.user._id, req.body.horseId);

      if (!horse) {
        return res.status(404).json({ message: 'Horse not found.' });
      }
    }

    if (req.body.trainerId) {
      await validateOptionalUser(req.body.trainerId, 'Trainer');
    }

    Object.assign(lesson, req.body);
    await lesson.save();

    const populatedLesson = await populateLesson(Lesson.findById(lesson._id));
    return res.json(populatedLesson);
  } catch (error) {
    return res.status(error.statusCode || 400).json({ message: error.message });
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
