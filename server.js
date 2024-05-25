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

// Configurar JSON middleware
app.use(express.json());

// Configuración de i18next
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

app.use(i18nextMiddleware.handle(i18next));

// Configuración de CORS
const corsOptions = {
  origin: process.env.CLIENT_API,
  credentials: true, // Para permitir el uso de credenciales
  optionsSuccessStatus: 200 // Algunos navegadores requieren este status
};
app.use(cors(corsOptions));

// Configuración de cookie parser
app.use(cookieParser());

// Configuración de Sockets
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: process.env.CLIENT_API,
    credentials: true
  }
});

io.on('connection', (socket) => {
  SocketServer(socket);
});

// Crear servidor Peer
ExpressPeerServer(http, { path: '/' });

// Rutas de tu aplicación
 
app.use('/api/language', require('./routes/languageRouter'));
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/user', require('./routes/userRouter'));
app.use('/api/post', require('./routes/postRouter'));
 
app.use('/api/contador', require('./routes/contadorRouter'));
app.use('/api/servicio', require('./routes/servicioRouter'));
app.use('/api/postadmin', require('./routes/postadminRouter'));
app.use('/api/comment', require('./routes/commentRouter'));
app.use('/api/notify', require('./routes/notifyRouter'));
app.use('/api/message', require('./routes/messageRouter'));

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
