const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc   Get financial summary
// @route  GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // All time
    const allTransactions = await Transaction.find({ userId });
    const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // This month
    const thisMonthTx = await Transaction.find({ userId, date: { $gte: startOfMonth } });
    const monthIncome = thisMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthExpense = thisMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Last month
    const lastMonthTx = await Transaction.find({ userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
    const lastMonthExpense = lastMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const lastMonthIncome = lastMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    // Recent transactions
    const recentTransactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(5);

    res.json({
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
      monthIncome,
      monthExpense,
      monthSavings: monthIncome - monthExpense,
      lastMonthExpense,
      lastMonthIncome,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get chart data
// @route  GET /api/analytics/charts
const getCharts = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Category-wise expenses (this month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const categoryData = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // Monthly spending for last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyData = await Transaction.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build monthly chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyChartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const incomeEntry = monthlyData.find(x => x._id.month === m && x._id.year === y && x._id.type === 'income');
      const expenseEntry = monthlyData.find(x => x._id.month === m && x._id.year === y && x._id.type === 'expense');
      monthlyChartData.push({
        month: months[m - 1],
        income: incomeEntry ? incomeEntry.total : 0,
        expense: expenseEntry ? expenseEntry.total : 0,
        savings: (incomeEntry ? incomeEntry.total : 0) - (expenseEntry ? expenseEntry.total : 0)
      });
    }

    res.json({
      categoryData: categoryData.map(c => ({ name: c._id, value: c.total })),
      monthlyData: monthlyChartData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get AI-generated financial insights
// @route  GET /api/analytics/insights
const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthTx = await Transaction.find({ userId, date: { $gte: startOfMonth } });
    const lastMonthTx = await Transaction.find({ userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } });

    const insights = [];

    // Category comparison
    const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education'];
    for (const cat of categories) {
      const thisMont = thisMonthTx.filter(t => t.category === cat && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const lastMont = lastMonthTx.filter(t => t.category === cat && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      if (lastMont > 0 && thisMont > 0) {
        const change = ((thisMont - lastMont) / lastMont) * 100;
        if (change > 15) {
          insights.push({
            type: 'warning',
            icon: '📈',
            message: `Your ${cat.toLowerCase()} expenses increased by ${Math.round(change)}% this month compared to last month.`
          });
        } else if (change < -15) {
          insights.push({
            type: 'success',
            icon: '📉',
            message: `Great job! Your ${cat.toLowerCase()} expenses decreased by ${Math.round(Math.abs(change))}% this month.`
          });
        }
      }
    }

    // Savings insight
    const thisIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const thisExpense = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastIncome = lastMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastExpense = lastMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const thisSavings = thisIncome - thisExpense;
    const lastSavings = lastIncome - lastExpense;

    if (lastSavings > 0 && thisSavings > lastSavings) {
      const savingsPct = Math.round(((thisSavings - lastSavings) / lastSavings) * 100);
      insights.push({
        type: 'success',
        icon: '💰',
        message: `Excellent! You saved ${savingsPct}% more than last month. Keep it up!`
      });
    } else if (lastSavings > 0 && thisSavings < lastSavings * 0.8) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        message: `Your savings this month are lower than last month. Review your expenses.`
      });
    }

    // Budget check
    const budget = await Budget.findOne({ userId, month: now.getMonth() + 1, year: now.getFullYear() });
    if (budget && budget.totalBudget > 0) {
      const usagePct = (thisExpense / budget.totalBudget) * 100;
      if (usagePct >= 90) {
        insights.push({
          type: 'danger',
          icon: '🚨',
          message: `Alert! You've used ${Math.round(usagePct)}% of your monthly budget. You're close to exceeding it!`
        });
      } else if (usagePct >= 70) {
        insights.push({
          type: 'warning',
          icon: '⚠️',
          message: `You've used ${Math.round(usagePct)}% of your monthly budget. Monitor your spending.`
        });
      }
    }

    // Spending pattern
    if (thisExpense > 0 && thisIncome > 0) {
      const spendingRatio = (thisExpense / thisIncome) * 100;
      if (spendingRatio < 50) {
        insights.push({
          type: 'success',
          icon: '🌟',
          message: `You're spending only ${Math.round(spendingRatio)}% of your income. Excellent financial discipline!`
        });
      } else if (spendingRatio > 80) {
        insights.push({
          type: 'warning',
          icon: '💸',
          message: `You're spending ${Math.round(spendingRatio)}% of your income. Consider reducing non-essential expenses.`
        });
      }
    }

    // Top spending category
    const catSpending = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      catSpending[t.category] = (catSpending[t.category] || 0) + t.amount;
    });
    const topCat = Object.entries(catSpending).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      insights.push({
        type: 'info',
        icon: '📊',
        message: `Your highest spending category this month is ${topCat[0]} (₹${topCat[1].toLocaleString()}).`
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        icon: '💡',
        message: 'Add more transactions to get personalized AI financial insights!'
      });
    }

    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSummary, getCharts, getInsights };
