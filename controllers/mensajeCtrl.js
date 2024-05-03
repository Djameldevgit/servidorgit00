const Mensajes = require('../models/mensajesModel');

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}
const mensajeCtrl = {
    crearMensaje: async (req, res) => {
        try {
            
            const { descripcion, email, asunto } = req.body;
    
            if (!descripcion || !email || !asunto) {
                return res.status(400).json({ msg: "Ajouter votre message." });
            }
            
            const newMensaje = new Mensajes({
                descripcion, email, asunto, user: req.user._id
            });
            await newMensaje.save();
    
            res.json({
                msg: 'Votre message a été créé!',
                newMensaje: {
                    ...newMensaje._doc,
                    user: req.user
                }
            });
        } catch (err) {
            console.error("Error al guardar el mensaje:", err);
            return res.status(500).json({ msg: "Erreur lors de la création du message." });
        }
    },
    

    getMensaje: async (req, res) => {
        try {
            const features =  new APIfeatures(Mensajes.find({
                user: req.user._id 
            }), req.query).paginating()

            const mensajes = await features.query.sort('-createdAt')
            .populate("user likes", "avatar username   followers")
            .populate({
                path: "",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            res.json({
                msg: 'Success!',
                result: mensajes.length,
                mensajes
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },


};

module.exports = mensajeCtrl;
