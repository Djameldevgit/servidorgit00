const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  tipoTransaccion: {
    type: String,
    default: 'servicio',
    required: true,
  },

  contentservicio: {
    type: String,
    required: true,
    maxlength: 50
  },

 

  direccion: { // Corregido: 'direcion' a 'direccion'
    type: String,
    required: false,
    maxlength: 50
  },
  wilaya: {
    type: String,
    required: false,
    maxlength: 50
  },
  commune: {
    type: String,
    required: false,
    maxlength: 50
  },
  
  discripcion: { // Corregido: 'discripcion' a 'descripcion'
    type: String,
    required: false,
    maxlength: 400
  },
  priceservicio: {
    type: String,
    required: false,
  },
  dinero: {
    type: String,
    required: false,
    maxlength: 50
  },
  negociable: {
    type: String,
    required: false
  },
  nomprenom: {
    type: String,
    required: false,
    maxlength: 50
  },
  telefono: {
    type: String,
    required: false,
    maxlength: 50
  },
  email: {
    type: String,
    required: false,
    maxlength: 50
  },
  web: {
    type: String,
    required: false,
    maxlength: 50
  },
  informacion: { // Corregido: 'privacidad_informations' a 'informacion'
    type: Boolean,
    required: false
  },
  images: {
    type: Array, // Corregido: Array de strings
    required: true,
    maxlength: 7
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprovado', 'eliminado'],
    default: 'pendiente'
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Corregido: mongoose.Types.ObjectId a mongoose.Schema.Types.ObjectId
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }], // Corregido: mongoose.Types.ObjectId a mongoose.Schema.Types.ObjectId
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' } // Corregido: mongoose.Types.ObjectId a mongoose.Schema.Types.ObjectId
}, {
  timestamps: true,
});
module.exports = mongoose.model('servicio', servicioSchema);
