const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: true,
    maxlength: 50
  },
  asunto: { // Corregido: 'direcion' a 'direccion'
    type: String,
    required: false,
    maxlength: 50
  },

  descripcion: {
    type: String,
     required: true,
     maxlength: 1000
  },

  fecha: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' } // Corregido: mongoose.Types.ObjectId a mongoose.Schema.Types.ObjectId
}, {
  timestamps: true,
});

module.exports = mongoose.model('mensaje', mensajeSchema);
