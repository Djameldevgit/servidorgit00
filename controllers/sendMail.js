const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const {OAuth2} = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const {//obtener las credenciales de OAuth2 del desarollador desde las variables de entorno
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    SENDER_EMAIL_ADDRESS
} = process.env

const oauth2Client = new OAuth2( //crear oauth2clietnt para la aplicacion
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    OAUTH_PLAYGROUND
)

// send mail
const sendEmail = (to, url, txt) => {
    oauth2Client.setCredentials({
        refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    })

    const accessToken = oauth2Client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: SENDER_EMAIL_ADDRESS,
            clientId: MAILING_SERVICE_CLIENT_ID,
            clientSecret: MAILING_SERVICE_CLIENT_SECRET,
            refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
            accessToken
        }
    })

    const mailOptions = {
        from: SENDER_EMAIL_ADDRESS,
        to: to,
        subject: "Services et Salles de Fêtes",
        html: `
        <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #fff; padding: 40px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #007bff;">Bienvenue sur notre site web Services et Salles de Fêtes</h2>
            <p style="font-size: 16px;">Merci d'avoir rejoint notre plateforme. Pour commencer à utiliser nos services, veuillez valider votre adresse e-mail en cliquant sur le bouton ci-dessous:</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="${url}" style="text-decoration: none; background-color: #007bff; color: #fff; padding: 15px 30px; border-radius: 5px; font-size: 16px; display: inline-block;">Valider mon adresse e-mail</a>
            </div>
            <p style="font-size: 16px; margin-top: 30px;">Si le bouton ci-dessus ne fonctionne pas, vous pouvez également copier et coller le lien suivant dans votre navigateur:</p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px; word-wrap: break-word;">${url}</div>
            <p style="font-size: 14px; margin-top: 20px; text-align: center;">Merci pour votre inscription! Djamel/2024</p>
        </div>
    </div>
    
        `
    }

    smtpTransport.sendMail(mailOptions, (err, infor) => {
        if(err) return err;
        return infor
    })
}

module.exports = sendEmail