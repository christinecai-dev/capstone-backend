const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      enum: [
        'Board',
        'Training',
        'Lessons',
        'Farrier',
        'Vet',
        'Vaccinations',
        'Show Fees',
        'Transportation',
        'Equipment',
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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

module.exports = mongoose.model('Expense', expenseSchema);
