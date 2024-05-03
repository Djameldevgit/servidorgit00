const router = require('express').Router()
 
const mensajeCtrl = require('../controllers/mensajeCtrl')
const auth = require('../middleware/auth')

router.post('/mensajes', auth, mensajeCtrl.crearMensaje)
router.get('/mensajes', auth, mensajeCtrl.getMensaje)

/*
router.get('/conversations', auth, mensajeCtrl.getConversations)

router.get('/message/:id', auth, mensajeCtrl.getMessages)

router.delete('/message/:id', auth, mensajeCtrl.deleteMessages)

router.delete('/conversation/:id', auth, mensajeCtrl.deleteConversation)
*/

module.exports = router