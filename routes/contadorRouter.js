const router = require('express').Router()
const auth = require('../middleware/auth')
 
const contadorCtrl = require('../controllers/contadorCtrl');
 
 
// Ruta para enviar correo electrónico
router.post('/contador',auth, contadorCtrl.Guardarcontadorr);

module.exports = router;