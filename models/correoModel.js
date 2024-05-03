// models/CorreoEnviado.js
const mongoose = require('mongoose');

const CorreoEnviadoSchema = new mongoose.Schema({
  destinatario: { type: String, required: true },
  asunto: { type: String, required: true },
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CorreoEnviado', CorreoEnviadoSchema);
