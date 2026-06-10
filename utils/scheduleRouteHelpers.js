const Horse = require('../models/Horse');
const Lesson = require('../models/Lesson');
const ShowSchedule = require('../models/ShowSchedule');
const User = require('../models/User');

function populateLesson(query) {
  return query
    .populate('horseId', 'name')
    .populate('trainerId', 'name email role')
    .populate('studentId', 'name email role');
}

function populateShow(query) {
  return query
    .populate('horseId', 'name')
    .populate('trainerId', 'name email role')
    .populate('riderId', 'name email role');
}

async function findOwnedHorse(ownerId, horseId) {
  if (!horseId) {
    return null;
  }

  return Horse.findOne({ _id: horseId, ownerId });
}

async function validateOptionalUser(userId, label) {
  if (!userId) {
    return null;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error(`${label} not found.`);
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function findOwnedLesson(ownerId, lessonId) {
  return Lesson.findOne({ _id: lessonId, ownerId });
}

async function findOwnedShow(ownerId, showId) {
  return ShowSchedule.findOne({ _id: showId, ownerId });
}

module.exports = {
  findOwnedHorse,
  findOwnedLesson,
  findOwnedShow,
  populateLesson,
  populateShow,
  validateOptionalUser,
};
