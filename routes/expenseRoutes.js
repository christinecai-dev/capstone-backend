const express = require('express');
const Expense = require('../models/Expense');
const Horse = require('../models/Horse');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('owner'));

function getDateRangeFromQuery(query, fallbackUnit) {
  const year = Number(query.year) || new Date().getFullYear();

  if (fallbackUnit === 'month') {
    const month = Number(query.month) || new Date().getMonth() + 1;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { start, end };
  }

  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

async function buildExpenseSummary(ownerId, start, end) {
  return Expense.aggregate([
    {
      $match: {
        ownerId,
        date: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $lookup: {
        from: 'horses',
        localField: 'horseId',
        foreignField: '_id',
        as: 'horse',
      },
    },
    {
      $unwind: '$horse',
    },
    {
      $group: {
        _id: '$horseId',
        horseName: { $first: '$horse.name' },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        horseId: '$_id',
        horseName: 1,
        totalAmount: 1,
      },
    },
    {
      $sort: {
        horseName: 1,
      },
    },
  ]);
}

router.get('/monthly', async (req, res) => {
  const { start, end } = getDateRangeFromQuery(req.query, 'month');
  const summary = await buildExpenseSummary(req.user._id, start, end);

  return res.json({
    period: 'monthly',
    start,
    end,
    totalsByHorse: summary,
  });
});

router.get('/yearly', async (req, res) => {
  const { start, end } = getDateRangeFromQuery(req.query, 'year');
  const summary = await buildExpenseSummary(req.user._id, start, end);

  return res.json({
    period: 'yearly',
    start,
    end,
    totalsByHorse: summary,
  });
});

router.get('/', async (req, res) => {
  const expenses = await Expense.find({ ownerId: req.user._id }).sort({ date: -1 });
  return res.json(expenses);
});

router.post('/', async (req, res) => {
  try {
    delete req.body.ownerId;

    const horse = await Horse.findOne({ _id: req.body.horseId, ownerId: req.user._id });

    if (!horse) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    const expense = await Expense.create({
      ...req.body,
      ownerId: req.user._id,
    });

    return res.status(201).json(expense);
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

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    return res.json(expense);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  return res.json({ message: 'Expense deleted successfully.' });
});

module.exports = router;
