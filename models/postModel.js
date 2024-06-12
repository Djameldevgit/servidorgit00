const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  tipoTransaccion: {
    type: String,
    default: 'sala',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 50
  },
  direccion: {
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
  specifications: {
    type: [String], 
    required: false,
    maxlength: 50
  },
  discripcion: {
    type: String,
    required: false,
    maxlength: 400
  },
  pricesala: {
    type: Number,
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
  informacion: {
    type: Boolean,
    required: false
  },
  comentarios: {
    type: Boolean,
    required: false
  },
  images: {
    type: Array,
    required: true,
    maxlength: 7
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprovado', 'eliminado'],
    default: 'pendiente'
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  lat: {    
    type: String,
    required: false,
  },
  lng: {
    type: String,
    required: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('post', postSchema);
