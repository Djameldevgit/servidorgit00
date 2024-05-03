const nodemailer = require('nodemailer');

const correoCtrl = {
  enviarCorreo: async (req, res) => {
    const { destinatario, asunto, mensaje } = req.body;
 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'artealger2020argelia@gmail.com', // Cuenta de remitente (suponemos que es tuya)
    pass: 'lygluglgcugDDFdiull665yguyg654654fy6565' // Contraseña de la cuenta de remitente
  }
});

// Opciones del correo electrónico
const mailOptions = {
  from: 'artealger2020argelia@gmail.com', // Dirección de correo electrónico del remitente
  to: 'djamelarte7@gmail.com', // Dirección de correo electrónico del destinatario (suponemos que es del usuario autenticado)
  subject: 'Prueba de correo electrónico', // Asunto del correo electrónico
  text: 'Este es un correo de prueba enviado con nodemailer.' // Cuerpo del correo electrónico
};


    // Envía el correo electrónico
    try {
      await transporter.sendMail(mailOptions);
      // Guardar la información del correo electrónico enviado en la base de datos
      const nuevoCorreoEnviado = new CorreoEnviado({ destinatario, asunto, mensaje });
      await nuevoCorreoEnviado.save();
      res.status(200).send('Correo electrónico enviado correctamente y registrado en la base de datos.');
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      res.status(500).send('Error al enviar el correo electrónico.');
    }
  }
};
module.exports = correoCtrl;

