const router = require('express').Router();

const access = require('../middleware/authorize');

const expenseController = require('../controllers/expense');

router.post('/addexpense', access.authenticate, expenseController.addExpense);

router.get('/getexpenses', access.authenticate, expenseController.getExpenses);

router.get('/getexpense/:id', access.authenticate, expenseController.getExpense);

router.put('/editexpense/:id', access.authenticate, expenseController.updateExpense);

router.delete('/delete-expense/:id', access.authenticate, expenseController.deleteExpense);

module.exports = router;