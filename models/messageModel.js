const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Types.ObjectId, ref: 'conversation' },//  ID de la conversación a la que pertenece el mensaje Permite asociar el mensaje a una conversación específica, lo que facilita la agrupación de mensajes relacionados
    sender: { type: mongoose.Types.ObjectId, ref: 'user' },// ID del usuario que envió el mensaje Identifica el remitente del mensaje, lo que facilita la visualización de quién envió el mensaje en la interfaz de usuario
    recipient: { type: mongoose.Types.ObjectId, ref: 'user' },// ID del usuario destinatario del mensaje  Identifica al destinatario del mensaje, lo que facilita la entrega del mensaje al usuario correcto.
    text: String,//Contenido textual del mensaje. Propósito: Almacena el texto del mensaje enviado, que puede ser un mensaje de texto, un comentario, etc
    media: Array,//Lista de medios adjuntos al mensaje. Propósito: Permite adjuntar varios tipos de medios al mensaje, como imágenes, vídeos, 
    call: Object//Detalles de una llamada asociada al mensaje (opcional).Propósito: Si el mensaje está relacionado con una llamada (por ejemplo, una solicitud de llamada o un registro de llamada), esta propiedad puede contener detalles adicionales de la llamada, como la duración, el estado, etc.
}, {
    timestamps: true
})

module.exports = mongoose.model('message', messageSchema)