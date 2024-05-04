require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
 const cors = require('cors');
const cookieParser = require('cookie-parser');
const SocketServer = require('./socketServer');
const { ExpressPeerServer } = require('peer');
const path = require('path');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const app = express();
app.use(cors({
  origin : process.env.CLIENT_URL,
  credentials : true
}))
 
app.use(express.json());

i18next
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'fr',
    resources: {
      en: {
        translation: require(path.join(__dirname, 'locales', 'en.json')),
      },

      fr: {
        translation: require(path.join(__dirname, 'locales', 'fr.json')),
      },

      ar: {
        translation: require(path.join(__dirname, 'locales', 'ar.json')),
      },


    },
  });

 
//app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
 
 


app.use(cookieParser());

// Configuración de Sockets
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  SocketServer(socket);
});

// Crear servidor Peer
ExpressPeerServer(http, { path: '/' });

// Rutas de tu aplicación
app.use('/api', require('./routes/mensajesRouter'));
app.use('/api', require('./routes/languageRouter'));
app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/userRouter'));
app.use('/api', require('./routes/postRouter'));
app.use('/api', require('./routes/correoRouter'));
app.use('/api', require('./routes/contadorRouter'));
app.use('/api', require('./routes/servicioRouter'));
app.use('/api', require('./routes/postadminRouter'));
app.use('/api', require('./routes/commentRouter'));
app.use('/api', require('./routes/notifyRouter'));
app.use('/api', require('./routes/messageRouter'));

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'El servidor está en línea y funcionando correctamente.' });
});


// Conexión a MongoDB
const URI = process.env.MONGODB_URL;
mongoose.connect(URI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) throw err;
  console.log('Conexión exitosa a MongoDB');
});

// Configuración para producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}
 
// Inicio del servidor
const port = process.env.PORT || 5000;
http.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
