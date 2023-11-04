const router = require('express').Router();

const access = require('../middleware/authorize');

const orderController = require('../controllers/order');

const userController = require('../controllers/user');

router.get('/purchase', access.authenticate, orderController.purchase);

router.post('/updateStatus', access.authenticate, orderController.update);

router.get('/leaderboard', userController.showLeaderboard);

module.exports = router;