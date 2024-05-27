// Importa Twilio para usar su cliente
const { Twilio } = require('twilio'); // Cambia a require para usar en JavaScript puro

// Variables de entorno para obtener las credenciales de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
const serviceID = process.env.TWILIO_SERVICE_ID;

// Crea el cliente de Twilio con las credenciales
const client = new Twilio(accountSid, authToken);

// Función para enviar SMS
const sendSms = (to, body, txt) => {
  try {
    client.messages
      .create({
        body: `BlogDev ${txt} - ${body}`, // Formato del mensaje
        from,
        to, // Número de destino
      })
      .then((message) => console.log('SMS sent with SID:', message.sid)); // Confirma el envío
  } catch (err) {
    console.error('Error sending SMS:', err); // Manejo de errores
  }
};

// Función para generar OTP a través de SMS
const smsOTP = async (to, channel) => {
  try {
    const data = await client
      .verify
      .services(serviceID)
      .verifications
      .create({
        to,
        channel,
      });

    return data; // Devuelve la respuesta si se crea con éxito
  } catch (err) {
    console.error('Error generating OTP:', err); // Muestra el error si ocurre
    return null; // O cualquier valor por defecto o manejo de errores adicional
  }
};

// Función para verificar OTP
const smsVerify = async (to, code) => {
  try {
    const data = await client.verify.services(serviceID).verificationChecks.create({
      to,
      code,
    });

    return data; // Devuelve la respuesta del servicio de verificación
  } catch (err) {
    console.error('Error verifying OTP:', err); // Manejo de errores
    throw err; // Relanza la excepción para que el llamante lo maneje
  }
};

module.exports = {
  sendSms,
  smsOTP,
  smsVerify,
};
