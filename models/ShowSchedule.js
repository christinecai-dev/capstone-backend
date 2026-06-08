const mongoose = require('mongoose');

function subtractMinutes(date, minutes) {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

const showScheduleSchema = new mongoose.Schema(
  {
    horseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      required: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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

  this.warmupStartTime = subtractMinutes(this.showTime, this.warmupMinutes);
  this.tackUpStartTime = subtractMinutes(this.warmupStartTime, this.tackUpMinutes);
  this.arrivalTime = subtractMinutes(this.tackUpStartTime, this.bufferMinutes);
  this.leaveBarnTime = subtractMinutes(this.arrivalTime, this.driveTimeMinutes);

  return next();
});

module.exports = mongoose.model('ShowSchedule', showScheduleSchema);
