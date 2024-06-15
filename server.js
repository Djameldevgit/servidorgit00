require('dotenv').config(); // Carga variables de entorno desde un archivo .env
const express = require('express'); // Framework para crear el servidor web
const mongoose = require('mongoose'); // Biblioteca para trabajar con MongoDB
const cors = require('cors'); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
const cookieParser = require('cookie-parser'); // Middleware para manejar cookies
const SocketServer = require('./socketServer'); // Módulo personalizado para manejar WebSocket
const { ExpressPeerServer } = require('peer'); // Biblioteca para habilitar WebRTC
const path = require('path'); // Módulo para trabajar con rutas de archivos

const app = express();
app.use(express.json());
app.use(cookieParser());

// Configuración de CORS
const allowedOrigins = [
    'https://clientegit00.onrender.com',
    'https://clientegit01.onrender.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Habilita el envío de cookies de manera segura a través de CORS
};

app.use(cors(corsOptions));

// Socket.IO
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', socket => {
    SocketServer(socket);
});

// Create peer server
ExpressPeerServer(http, { path: '/' });

// Routes
app.use('/api', require('./routes/languageRouter'));
app.use('/api', require('./routes/servicioRouter'));
app.use('/api', require('./routes/postadminRouter'));
app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/userRouter'));
app.use('/api', require('./routes/postRouter'));
app.use('/api', require('./routes/commentRouter'));
app.use('/api', require('./routes/notifyRouter'));
app.use('/api', require('./routes/messageRouter'));

// MongoDB Connection
const URI = process.env.MONGODB_URL;
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err;
    console.log('Connected to MongoDB');
});

// Servir la aplicación React en producción
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('clientegit01/build')); // Servir archivos estáticos de React
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'clientegit01', 'build', 'index.html'));
    });
}

// Puerto del servidor
const port = process.env.PORT || 5000;
http.listen(port, () => {
    console.log('Server is running on port', port);
});
