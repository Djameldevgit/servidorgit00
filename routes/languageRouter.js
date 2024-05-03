 
 
const router = require('express').Router()
const langCtrl = require('../controllers/langCtrl')
const auth = require('../middleware/auth');

router.put('/language/:language', auth, langCtrl.updateUserLanguage);

router.put('/language/ingles', auth, langCtrl.updateUserLanguageToEnglish);
router.put('/language/frances', auth, langCtrl.updateUserLanguageToFrench);
 
router.put('/language/arabe', auth, langCtrl.updateUserLanguageToArabic);

module.exports = router;