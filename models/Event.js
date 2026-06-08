const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    horseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['farrier', 'deworming', 'vaccination', 'vet', 'board'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    date: {
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

module.exports = mongoose.model('Event', eventSchema);
