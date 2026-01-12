const express = require('express');
const router = express.Router();
const incomeController = require('../controller/income.controller');
const expenseCtrl = require('../controller/expense.controller');
const budgetCtrl = require('../controller/budget.controller');
const transactionCtrl = require('../controller/transaction.controller');
const dashboardCtrl = require('../controller/dashboard.controller');
const profileCtrl = require('../controller/profile.controller');

// Same routes work perfectly with functions
router.get('/income', incomeController.getAllIncome);
router.get('/income/:id', incomeController.getIncomeById);
router.post('/income', incomeController.createIncome);
router.put('/income/:id', incomeController.updateIncome);
router.delete('/income/:id', incomeController.deleteIncome);

router.get('/expenses', expenseCtrl.getAll);
router.get('/expenses/:id', expenseCtrl.getById);
router.post('/expenses', expenseCtrl.createExpense);
router.put('/expenses/:id', expenseCtrl.updateExpense);
router.delete('/expenses/:id', expenseCtrl.deleteExpense);

router.get('/budgets', budgetCtrl.getAllBudgets);
router.get('/budgets/current', budgetCtrl.getCurrentMonthBudgets);
router.get('/budgets/:id', budgetCtrl.getBudgetById);
router.post('/budgets', budgetCtrl.createOrUpdateBudget);
router.delete('/budgets/:id', budgetCtrl.deleteBudget);

router.get('/transactions', transactionCtrl.getTransactions);

router.get('/dashboard', dashboardCtrl.getDashboard); 



router.get('/profile', profileCtrl.getProfile);
router.put('/profile', profileCtrl.updateProfile);
router.delete('/profile', profileCtrl.deleteProfile);

module.exports = router;
