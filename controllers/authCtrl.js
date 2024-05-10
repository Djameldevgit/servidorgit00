const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require('./sendMail')
const { validPhone, validateAccount } = require('../middleware/vaild')


const { sendSms, smsOTP, smsVerify } = require('../config/sendSMS'); // Requiere las funciones de Twilio

const { google } = require('googleapis')
const { OAuth2 } = google.auth
const fetch = require('node-fetch')
const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID)
const { CLIENT_URL } = process.env

const authCtrl = {

  register: async (req, res) => {
    try {
        const { username, account, password } = req.body;

        // Vérifier si le nom d'utilisateur ou l'adresse e-mail existent déjà dans la base de données
        const existingUser = await Users.findOne({ $or: [{ username }, { account }] });
        if (existingUser) {
            const field = existingUser.username === username ? 'nom d\'utilisateur' : 'adresse e-mail';
            return res.status(400).json({ msg: `Ce ${field} existe déjà.` });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: "Le mot de passe doit contenir au moins 6 caractères." });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = { username, account, password: passwordHash };
        const activation_token = createActivationToken(newUser);
        const url = `${CLIENT_URL}/activate/${activation_token}`;
     sendMail(account, url, "Vérifiez votre adresse e-mail");

     res.json({msg: `Inscription réussie, Nous avons envoyé un lien de vérification à ${account}, Veuillez vérifier votre courrier électronique pour la prochaine étape.`})      } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
},



 
activateEmail: async (req, res) => {
  try {
      const {activation_token} = req.body
      const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)

      const {username, account, password} = user

      const check = await Users.findOne({account})
      if(check) return res.status(400).json({msg:"This account already exists."})

      const newUser = new Users({
          username, account, password
      })

      await newUser.save()

      res.json({msg: "Account has been activated!"})

  } catch (err) {
      return res.status(500).json({msg: err.message})
  }
},

 login : async (req, res) => {
  try {
    const { account, password } = req.body;

    // Encuentra el usuario por su cuenta
    const user = await Users.findOne({ account });
    if (!user) {
      return res.status(400).json({ msg: "Esta cuenta no existe." });
    }

    // Compara la contraseña proporcionada con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Contraseña incorrecta." });
    }

    // Crea el access token y refresh token
    const access_token = createAccessToken({id: user._id})
    const refresh_token = createRefreshToken({id: user._id})


    // Envía el refresh token como cookie
    res.cookie('refreshtoken', refresh_token, {
      httpOnly: true,
      path: '/api/refresh_token',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // Devuelve el access token y el usuario en la respuesta JSON
    res.json({
      msg: "Inicio de sesión exitoso.",
      access_token,
      user,
    });

  } catch (err) {
    // Maneja errores y devuelve una respuesta adecuada
    res.status(500).json({ msg: err.message || "Error del servidor." });
  }
},
  googleLogin: async (req, res) => {
    try {
      const { id_token } = req.body;

      // Verificar el token de Google
      const verify = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.MAIL_CLIENT_ID,
      });

      const {
        email,
        email_verified,
        name,
        picture
      } = verify.getPayload(); // obtener la información del usuario

      // Comprobar si el correo electrónico está verificado
      if (!email_verified) {
        return res.status(500).json({ msg: "Email verification failed." });
      }

      // Crea una contraseña predeterminada para el usuario
      const password = email + 'FS%rjJX992grZ3MyFz$3%EP$&yuPkjtUR';
      const passwordHash = await bcrypt.hash(password, 12);

      // Verificar si el usuario ya existe
      const user = await Users.findOne({ account: email });

      if (user) {
        // Si el usuario ya existe, inicia sesión
        await loginUser(user, password, res);
      } else {
        // Si el usuario no existe, regístralo
        const newUser = {
          name,
          account: email,
          password: passwordHash,
          avatar: picture,
          type: 'google',
        };
        await registerUser(newUser, res);
      }

    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },



  loginSMS: async (req, res) => {
    try {
      const { phone } = req.body;

      // Generar y enviar OTP (One Time Password) por SMS
      const data = await smsOTP(phone, 'sms');
      res.json(data); // Retornar la respuesta de SMS
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  smsVerify: async (req, res) => {
    try {
      const { phone, code } = req.body;

      // Verificar el código recibido por SMS
      const data = await smsVerify(phone, code);
      if (!data || !data.valid) {
        return res.status(400).json({ msg: "Invalid Authentication." });
      }

      const password = phone + 'your phone secret password';
      const passwordHash = await bcrypt.hash(password, 12);

      // Buscar el usuario por el número de teléfono
      const user = await Users.findOne({ account: phone });

      if (user) {
        // Si el usuario existe, inicia sesión
        await loginUser(user, password, res);
      } else {
        // Si el usuario no existe, regístralo
        const newUser = {
          name: phone,
          account: phone,
          password: passwordHash,
          type: 'sms',
        };
        await registerUser(newUser, res);
      }

    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
 
  registerUser: async (user, res) => {
    const newUser = new Users(user);

    // Generar tokens de acceso y actualización
    const access_token = createAccessToken({id: user._id})
    const refresh_token = createRefreshToken({id: user._id})

    // Guardar el token de actualización en el nuevo usuario
    newUser.rf_token = refresh_token;
    await newUser.save();

    // Respuesta de éxito
    res.json({
      msg: 'Login Success!',
      access_token,
      user: { ...newUser.toObject(), password: '' },
    });
  },



 
  forgotPassword: async (req, res) => {
    try {
      const { account } = req.body;

      const user = await Users.findOne({ account });
      if (!user) {
        return res.status(400).json({ msg: 'This account does not exist.' });
      }

      if (user.type !== 'register') {
        return res.status(400).json({
          msg: `Quick login account with ${user.type} can't use this function.`,
        });
      }

      const access_token = generateAccessToken({ id: user._id });

      const url = `${process.env.CLIENT_URL}/reset_password/${access_token}`;

      if (validPhone(account)) {
        sendSms(account, url, "Forgot password?");
        return res.json({ msg: "Success! Please check your phone." });
      } else if (validateAccount(account)) {
        sendMail(account, url, "Forgot password?");
        return res.json({ msg: "Success! Please check your email." });
      }

    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { password } = req.body

      const passwordHash = await bcrypt.hash(password, 12)

      await Users.findOneAndUpdate({ _id: req.user.id }, {
        password: passwordHash
      })

      res.json({ msg: "Mot de passe changé avec succès!" })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
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
      if (!rf_token) return res.status(400).json({ msg: "Veuillez vous connecter maintenant." })  //si no se envuentra el rf_token es porque el usuario no ha iniciado sesion y por eso el navigador no ha guardado el ccokies

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {//aqui se toma trea parametros el ultmo paramentro el la funcion asincrona el cual se usa mucho en  operaciones asincronas
        if (err) return res.status(400).json({ msg: "Veuillez vous connecter maintenant." })

        const user = await Users.findById(result.id).select("-password")//la busqueda del usuario por id es igual como usamos _id
          .populate('followers following', 'avatar username fullname followers following')

        if (!user) return res.status(400).json({})

        const access_token = createAccessToken({ id: result.id })// reslt.id para referirse al identificador único del usuario en el contexto de Mongoose. Luego, este identificador único se utiliza para crear un nuevo token de acceso mediante la función createAccessToken, que probablemente incluya este identificador en el token.

        res.json({//Después de generar el token de acceso, se devuelve una respuesta JSON al cliente que contiene tanto el token de acceso como los datos del usuario encontrado en la base de datos. Esto permite que el cliente pueda utilizar el token de acceso para autenticar las solicitudes futuras y acceder a recursos protegidos en la aplicación, y también tenga acceso a los datos del usuario para mostrar la información correspondiente en la interfaz de usuario.
          access_token,
          user
        })
      })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '20m' })
}

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
}

module.exports = authCtrl