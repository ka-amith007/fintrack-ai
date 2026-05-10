const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc   Set budget
// @route  POST /api/budget
const setBudget = async (req, res) => {
  try {
    const { totalBudget, categoryBudgets, month, year } = req.body;
    const now = new Date();
    const targetMonth = month || (now.getMonth() + 1);
    const targetYear = year || now.getFullYear();

    let budget = await Budget.findOne({ userId: req.user._id, month: targetMonth, year: targetYear });

    if (budget) {
      budget.totalBudget = totalBudget;
      if (categoryBudgets) budget.categoryBudgets = { ...budget.categoryBudgets, ...categoryBudgets };
      await budget.save();
    } else {
      budget = await Budget.create({
        userId: req.user._id,
        month: targetMonth,
        year: targetYear,
        totalBudget,
        categoryBudgets: categoryBudgets || {}
      });
    }

    // Also update user's monthlyBudget
    await User.findByIdAndUpdate(req.user._id, { monthlyBudget: totalBudget });

    res.json({ budget });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get budget with usage
// @route  GET /api/budget
const getBudget = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);
    const year = parseInt(req.query.year) || now.getFullYear();

    const budget = await Budget.findOne({ userId: req.user._id, month, year });
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const transactions = await Transaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    const categorySpent = {};
    transactions.forEach(t => {
      categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
    });

    res.json({
      budget: budget || null,
      totalSpent,
      categorySpent,
      remainingBudget: budget ? budget.totalBudget - totalSpent : null,
      usagePercentage: budget && budget.totalBudget > 0 ? Math.round((totalSpent / budget.totalBudget) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { setBudget, getBudget };
