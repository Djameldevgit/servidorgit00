const mongoose = require('mongoose')

const notifySchema = new mongoose.Schema({
    id: mongoose.Types.ObjectId,// Identificador único de la notificación que Proporciona una identificación única para cada notificación en la base de datos.
    user: {type: mongoose.Types.ObjectId, ref: 'user'},//ID del usuario que generó la notificación Permite identificar qué usuario creó la notificación y relacionarla con el usuario correspondiente en la colección de usuario
    recipients: [mongoose.Types.ObjectId],//Lista de IDs de usuarios a los que se enviará la notificación
    url: String,//URL relacionada con la notificación.un enlace a la página específica dentro de la aplicación relacionada con la notificación, por ejemplo, la publicación que generó la notificación
    text: String,//Texto descriptivo corto de la notificación Proporciona información breve sobre la notificación, como un resumen del evento que la generó
    content: String,//Contenido adicional de la notificación Puede contener información adicional relevante para la notificación, como el cuerpo completo de un comentario o publicación.
    image: String,// URL de la imagen asociada con la notificación (opcional).Permite adjuntar una imagen a la notificación, como la imagen de perfil de alguien que comentó en la publicación
    isRead: {type: Boolean, default: false}// Indica si la notificación ha sido leída por el usuario destinatario.Permite realizar un seguimiento del estado de lectura de la notificación para cada usuario destinatario
}, {
    timestamps: true
})

module.exports = mongoose.model('notify', notifySchema)