const router = require('express').Router();
const authCtrl = require('../controllers/authCtrl');
const auth = require('../middleware/auth');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.post('/refresh_token', authCtrl.generateAccessToken)
router.post('/login_sms', authCtrl.loginSMS);
router.post('/sms_verify', authCtrl.smsVerify);
router.post('/activation', authCtrl.activateEmail);
router.post('/forgot', authCtrl.forgotPassword);
router.post('/reset', auth, authCtrl.resetPassword);

 
module.exports = router;
