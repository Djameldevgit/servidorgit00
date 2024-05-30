const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require('./sendMail')

const {google} = require('googleapis')
const {OAuth2} = google.auth
 
const {CLIENT_API} = process.env
const authCtrl = {


    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;
    
            // Vérifier si le nom d'utilisateur ou l'adresse e-mail existent déjà dans la base de données
            const existingUser = await Users.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                const field = existingUser.username === username ? 'nom d\'utilisateur' : 'adresse e-mail';
                return res.status(400).json({ msg: `Ce ${field} existe déjà.` });
            }
    
            if (password.length < 6) {
                return res.status(400).json({ msg: "Le mot de passe doit contenir au moins 6 caractères." });
            }
    
            const passwordHash = await bcrypt.hash(password, 12);
    
            const newUser = { username, email, password: passwordHash };
            const activation_token = createActivationToken(newUser);
            const url = `${CLIENT_API}/activate/${activation_token}`;
         sendMail(email, url, "Vérifiez votre adresse e-mail");
    
         res.json({msg: `Inscription réussie, Nous avons envoyé un lien de vérification à ${email}, Veuillez vérifier votre courrier électronique pour la prochaine étape.`})      } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    
    activateEmail: async (req, res) => {
        try {
            const { activation_token } = req.body
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)
    
            const { username, email, password } = user
    
            const check = await Users.findOne({ email })
            if (check) return res.status(400).json({ msg: "Cet e-mail existe déjà." })
    
            const newUser = new Users({
                username, email, password
            })
    
            await newUser.save()
    
            res.json({ msg: "Votre compte a été activé !" })
    
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    

    login: async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await Users.findOne({email})
            .populate("followers following", "avatar username fullname followers following")

            if(!user) return res.status(400).json({msg: "Cet email n'existe pas."})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: "Le mot de passe est incorrect."})

            const access_token = createAccessToken({id: user._id})
            const refresh_token = createRefreshToken({id: user._id})

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30*24*60*60*1000 // 30days
            })
 
            res.json({
                msg: 'Login Success!',
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "Cet email n'existe pas."})
    
            const access_token = createAccessToken({id: user._id})
            const url = `${CLIENT_URL}/reset/${access_token}`
    
            sendMail(email, url, `Réinitialisez votre mot de passe - ${email}`)
            res.json({msg: `Nous avons envoyé un lien de vérification à ${email}, Veuillez vérifier votre courrier électronique pour la prochaine étape.`})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
   resetPassword: async (req, res) => {
        try {
            const {password} = req.body
           
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({_id: req.user.id}, {
                password: passwordHash
            })

            res.json({msg: "Mot de passe changé avec succès!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }, 
    
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/api/refresh_token'})
            return res.json({msg: "Vous êtes déconnecté!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
        
    },



    generateAccessToken: async (req, res) => {//ciuando se ejecuta este controladror desde la accion clinete que ejecuta el refrechtocken
        try {
            const rf_token = req.cookies.refreshtoken  //se obtiene rf_token desde res.cookies.refreshtoken
            if(!rf_token) return res.status(400).json({msg: "Veuillez vous connecter maintenant."})  //si no se envuentra el rf_token es porque el usuario no ha iniciado sesion y por eso el navigador no ha guardado el ccokies

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async(err, result) => {//aqui se toma trea parametros el ultmo paramentro el la funcion asincrona el cual se usa mucho en  operaciones asincronas
                if(err) return res.status(400).json({msg: "Veuillez vous connecter maintenant."})

                const user = await Users.findById(result.id).select("-password")//la busqueda del usuario por id es igual como usamos _id
                .populate('followers following', 'avatar username fullname followers following')

                if(!user) return res.status(400).json({})

                const access_token = createAccessToken({id: result.id})// reslt.id para referirse al identificador único del usuario en el contexto de Mongoose. Luego, este identificador único se utiliza para crear un nuevo token de acceso mediante la función createAccessToken, que probablemente incluya este identificador en el token.

                res.json({//Después de generar el token de acceso, se devuelve una respuesta JSON al cliente que contiene tanto el token de acceso como los datos del usuario encontrado en la base de datos. Esto permite que el cliente pueda utilizar el token de acceso para autenticar las solicitudes futuras y acceder a recursos protegidos en la aplicación, y también tenga acceso a los datos del usuario para mostrar la información correspondiente en la interfaz de usuario.
                    access_token,
                    user
                })
            })
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn: '20m'})
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'})
}

module.exports = authCtrl