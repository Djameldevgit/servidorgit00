require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const SocketServer = require('./socketServer')
const { ExpressPeerServer } = require('peer')
const path = require('path')

const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
 
 
 

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

const app = express()


app.use(express.json())

 //app.use(cors())
   app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
})); 
 


app.use(cookieParser())
 
// Socket
const http = require('http').createServer(app)
const io = require('socket.io')(http)

io.on('connection', socket => {
    SocketServer(socket)
})

// Create peer server
ExpressPeerServer(http, { path: '/' })
 

 
 app.use('/api', require('./routes/languageRouter'))

app.use('/api', require('./routes/authRouter'))
app.use('/api', require('./routes/userRouter'))
app.use('/api', require('./routes/postRouter'))
app.use('/api', require('./routes/correoRouter'))
app.use('/api', require('./routes/contadorRouter'))
app.use('/api', require('./routes/servicioRouter'))
app.use('/api', require('./routes/postadminRouter'))
app.use('/api', require('./routes/commentRouter'))
app.use('/api', require('./routes/notifyRouter'))
app.use('/api', require('./routes/messageRouter'))
 

const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err;
    console.log('Connected to mongodb')
})


 
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}


const port = process.env.PORT || 5000
http.listen(port, () => {
    console.log('Server is running on port', port)
})
