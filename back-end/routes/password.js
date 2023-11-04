const router = require('express').Router();

const controller = require('../controllers/password');

router.post('/forgotpassword', controller.forgot);

router.get('/resetpassword/:id', controller.resetPassword);

router.post('/updatepassword', controller.updatePassword);

module.exports = router;