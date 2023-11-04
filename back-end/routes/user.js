const router = require('express').Router();

const userController = require('../controllers/user');

const access = require('../middleware/authorize');

const expenseController = require('../controllers/expense');

router.post('/signup', userController.addUser);

router.post('/login', userController.getUser);

router.get('/downloadfile', access.authenticate, expenseController.downloadExpense);

router.get('/downloads', access.authenticate, userController.getDownloads);

router.get('/dailyReport', access.authenticate, userController.getDailyReport);
router.get('/monthlyReport', access.authenticate, userController.getMonthlyReport);
router.get('/weeklyReport', access.authenticate, userController.getWeeklyReport);
router.get('/annualReport', access.authenticate, userController.getAnnualReport);

module.exports = router;