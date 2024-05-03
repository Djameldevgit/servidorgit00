// routes.js
const express = require('express');
const { enviarCorreo } = require('../controllers/correoCtrl');
const router = express.Router();
//const { enviarCorreo } = require('./correoCtrl');
 
// Ruta para enviar correo electrónico
router.post('/enviar-correo', enviarCorreo);

module.exports = router;

