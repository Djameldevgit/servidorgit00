const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    tag: Object,//Descripción: Objeto que puede contener información adicional sobre el comentario (opcional). Propósito: Permite etiquetar el comentario con información adicional, como la ubicación, el estado de ánimo, etc
    reply: mongoose.Types.ObjectId,//este campo almacena el ID del comentario al que responde
    likes: [{type: mongoose.Types.ObjectId, ref: 'user'}],// Lista de IDs de usuarios que han dado "me gusta" al comentario.
    user: {type: mongoose.Types.ObjectId, ref: 'user'},//ID del usuario que ha publicado el comentario.
    postId: mongoose.Types.ObjectId,// ID del post al que pertenece el comentario
    postUserId: mongoose.Types.ObjectId//ID del usuario que ha publicado el post al que pertenece el comentario
}, {
    timestamps: true
})

module.exports = mongoose.model('comment', commentSchema)