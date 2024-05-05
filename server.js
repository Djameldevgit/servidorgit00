require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { ExpressPeerServer } = require('peer');
const SocketServer = require('./socketServer');
const path = require('path');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');

const app = express();

// 1. Configuración de CORS y otros Middleware básicos
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
}));

app.use(express.json());
app.use(cookieParser()); // Para manejar cookies

// 2. Configuración de i18next para internacionalización
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

// 3. Conexión a MongoDB
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

// 4. Configuración de Sockets y PeerServer
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  SocketServer(socket);
});

// Crear servidor Peer
ExpressPeerServer(http, { path: '/' });

// 5. Rutas de la aplicación
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

// 6. Configuración para producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// 7. Inicio del servidor
const port = process.env.PORT || 5000;
http.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
