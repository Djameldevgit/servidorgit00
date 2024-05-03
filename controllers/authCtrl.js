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
    
          // Validación para el campo `account` (puede ser email o teléfono)
          if (!account) {
            return res.status(400).json({ msg: "Please add your email or phone." });
          }
    
          const isEmail = validateAccount(account);
          const isPhone = validPhone(account);
    
          if (!isEmail && !isPhone) {
            return res.status(400).json({ msg: "The email or phone number format is incorrect." });
          }
    
          // Verificar si `account` ya existe
          const existingUser = await Users.findOne({ account });
          if (existingUser) {
            return res.status(400).json({ msg: `This account already exists.` });
          }
    
          if (password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 chars." });
          }
    
          const passwordHash = await bcrypt.hash(password, 12);
    
          const newUser = {
            username,
            account,
            password: passwordHash,
          };
    
          const activation_token = createActivationToken(newUser);
          const url = `${CLIENT_URL}/activate/${activation_token}`;
    
          if (isEmail) {
            sendMail(account, url, "Verify your email address");
          } else if (isPhone) {
            sendSms(account, url, "Verify your phone number");
          }
    
          res.json({ msg: "Success! Check your email or phone for verification." });
        } catch (err) {
          return res.status(500).json({ msg: err.message });
        }
      },
 
  activeAccount: async (req, res) => {
    try {
      const { active_token } = req.body;

      // Verificar el token y obtener los datos decodificados
      const decoded = jwt.verify(active_token, process.env.ACTIVE_TOKEN_SECRET);

      if (!decoded || !decoded.newUser) {
        return res.status(400).json({ msg: "Invalid authentication." });
      }

      const { newUser } = decoded;

      // Verificar si la cuenta ya existe
      const existingUser = await Users.findOne({ account: newUser.account });
      if (existingUser) {
        return res.status(400).json({ msg: "Account already exists." });
      }

      // Crear y guardar el nuevo usuario
      const user = new Users(newUser);
      await user.save();

      res.json({ msg: "Account has been activated!" });

    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { account, password } = req.body;

      // Buscar usuario por cuenta (correo electrónico o número de teléfono)
      const user = await Users.findOne({ account });

      // Si el usuario no existe, devuelve un error
      if (!user) {
        return res.status(400).json({ msg: 'This account does not exist.' });
      }

      // Si el usuario existe, verifica la contraseña y genera el token de sesión
      await loginUser(user, password, res);

    } catch (err) {
      // En caso de error, devuelve una respuesta con el mensaje del error
      return res.status(500).json({ msg: err.message });
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
        username,
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
          username,
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


  loginUser: async (user, password, res) => {
    // Comprobar si la contraseña es correcta
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const msgError =
        user.type === 'register'
          ? 'Password is incorrect.'
          : `Password is incorrect. This account login with ${user.type}.`;

      return res.status(400).json({ msg: msgError });
    }

    // Generar tokens de acceso y actualización
    const access_token = generateAccessToken({ id: user._id });
    const refresh_token = generateRefreshToken({ id: user._id }, res);

    // Guardar el token de actualización en la base de datos
    await Users.findByIdAndUpdate(user._id, {
      rf_token: refresh_token,
    });

    // Respuesta de éxito
    res.json({
      msg: 'Login Success!',
      access_token,
      user: { ...user.toObject(), password: '' },
    });
  },

  // Función para registrar un nuevo usuario
  registerUser: async (user, res) => {
    const newUser = new Users(user);

    // Generar tokens de acceso y actualización
    const access_token = generateAccessToken({ id: newUser._id });
    const refresh_token = generateRefreshToken({ id: newUser._id }, res);

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
      res.clearCookie('refreshtoken', { path: '/api/refresh_token' })
      return res.json({ msg: "Vous êtes déconnecté!" })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
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