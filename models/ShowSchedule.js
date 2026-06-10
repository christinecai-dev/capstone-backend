const mongoose = require('mongoose');
const { calculateShowPlannerTimes } = require('../utils/showPlanner');

const showScheduleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    horseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      required: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    riderName: {
      type: String,
      trim: true,
      default: '',
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    trainerName: {
      type: String,
      trim: true,
      default: '',
    },
    showName: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    ring: {
      type: String,
      required: true,
      trim: true,
    },
    showTime: {
      type: Date,
      required: true,
    },
    driveTimeMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    tackUpMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    warmupMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    bufferMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    leaveBarnTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    tackUpStartTime: {
      type: Date,
      required: true,
    },
    warmupStartTime: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

showScheduleSchema.pre('validate', function calculateTimeline(next) {
  if (!this.showTime) {
    return next();
  }

  const plannerTimes = calculateShowPlannerTimes({
    showTime: this.showTime,
    driveTimeMinutes: this.driveTimeMinutes,
    tackUpMinutes: this.tackUpMinutes,
    warmupMinutes: this.warmupMinutes,
    bufferMinutes: this.bufferMinutes,
  });

  this.warmupStartTime = plannerTimes.warmupStartTime;
  this.tackUpStartTime = plannerTimes.tackUpStartTime;
  this.arrivalTime = plannerTimes.arrivalTime;
  this.leaveBarnTime = plannerTimes.leaveBarnTime;

  return next();
});

module.exports = mongoose.model('ShowSchedule', showScheduleSchema);
