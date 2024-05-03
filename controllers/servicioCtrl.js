const Servicios = require('../models/servicioModel')
 
 
const Comments = require('../models/commentModel')
const Users = require('../models/userModel')

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

const servicioCtrl = {

    createServicioPendiente: async (req, res) => {
        try {
            const {
                images,   ...servicioData
            } = req.body;

            if (images.length > 3) {
                return res.status(400).json({ msg: "Pas plus de trois images autorisées." });
            }

            if (!images || images.length === 0) {
                return res.status(400).json({ msg: 'Au moins une image est requise' });
            }

            const newServicio = new Servicios({
                estado: 'pendiente', images, user: req.user._id, ...servicioData
            });

            await newServicio.save();

            res.json({
                msg: "Votre publication a été créée et envoyée aux administrateurs en vue d'une validation postérieure.",
                newServicio: {
                    ...newServicio._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getServiciosPendientesss: async (req, res) => {
       
            try {
                const features = new APIfeatures(Servicios.find({ estado: 'pendiente' }), req.query).paginating();
        
                const servicios = await features.query
                    .sort('-createdAt')
                    .populate("user likes", "avatar username followers")
                    .populate({
                        path: "comments",
                        populate: {
                            path: "user likes",
                            select: "-password"
                        }
                    });
        
                res.json({
                    msg: "Votre publication 'Service salle des fêtes' a été créée et envoyée aux administrateurs pour validation ultérieure. Dans tous les cas nous vous envoyons une notification !",
                    result: servicios.length,
                    servicios
                });
            } catch (err) {
                return res.status(500).json({ msg: err.message });
            }
        },
        
        

    aprovarServicioPendiente: async (req, res) => {
        try {


            const servicio = await Servicios.findById(req.params.id);
            if (!servicio) return res.status(404).json({ msg: 'Publicación no encontrada' });

            servicio.estado = 'aprovado';
            await servicio.save();
            // Envia el _id del post aprobado en la respuesta
            res.json({ msg: 'Poste approuvé!', _id: servicio._id });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getServicios: async (req, res) => {
        try {
            const {ventalocation,contentservicio,   marca,modelo,  wilaya, commune, minprecioservicio, maxprecioservicio   } = req.query;
    
            let query = { estado: 'aprovado' };
    
            if (ventalocation) {
                query.salaservicio = ventalocation;
            }
             if (contentservicio) {
                query.contentservicio = contentservicio;
            }
            
    
            if (minprecioservicio && maxprecioservicio) {
                query.priceservicio = { $gte: minprecioservicio, $lte: maxprecioservicio };
            }
    
            if (wilaya) {
                query.wilaya = wilaya;
            }
    
            if (commune) {
                query.commune = commune;
            }
            if (marca) {
                query.marca = marca;
            }

            if (modelo) { 
                query.modelo = modelo;
            }
          
          
          
            const features = new APIfeatures(Servicios.find(query), req.query).paginating();
    
            const servicios = await features.query
                .sort('-createdAt')
                .populate("user likes", "avatar username followers")
                .populate({
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "-password"
                    }
                });
    
            res.json({
                msg: 'Success!',
                result: servicios.length,
                servicios
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    
    updateServicio: async (req, res) => {
        try {
            const {  images, ...servicioData } = req.body;

            const servicio = await Servicios.findOneAndUpdate(
                { _id: req.params.id },
                {
                    images, ...servicioData     }
            )
                .populate("user likes", "avatar username  ")
                .populate({
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "-password",
                    },
                });

                if (servicio) {
                    res.json({
                        msg: "Votre service a été mis à jour",
                        newServicio: {
                            ...servicio._doc,
                            images, ...servicioData
                        
                        },
                    });
                } else {
                    // Manejar el caso en el que servicio es null
                    res.status(404).json({ msg: "Servicio not found" });
                }
                
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    likeServicio: async (req, res) => {
        try {
            const servicio = await Servicios.find({ _id: req.params.id, likes: req.user._id })
            if (servicio.length > 0) return res.status(400).json({ msg: "You liked this servicio." })

            const like = await Servicios.findOneAndUpdate({ _id: req.params.id }, {
                $push: { likes: req.user._id }
            }, { new: true })

            if (!like) return res.status(400).json({ msg: 'This servicio does not exist.' })

            res.json({ msg: 'Liked Servicio!' })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    unLikeServicio: async (req, res) => {
        try {

            const like = await Servicios.findOneAndUpdate({ _id: req.params.id }, {
                $pull: { likes: req.user._id }
            }, { new: true })

            if (!like) return res.status(400).json({ msg: 'This servicio does not exist.' })

            res.json({ msg: 'UnLiked Servicio!' })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getUserServicios: async (req, res) => {
        try {
            const features = new APIfeatures(Servicios.find({ user: req.params.id }), req.query)
                .paginating()
            const servicios = await features.query.sort("-createdAt")

            res.json({
                servicios,
                result: servicios.length
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getServicio: async (req, res) => {
        try {
            const servicio = await Servicios.findById(req.params.id)
                .populate("user likes", "avatar username followers")
                .populate({
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "-password"
                    }
                })

            if (!servicio) return res.status(400).json({ msg: 'This servicio does not exist.' })

            res.json({
                servicio
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    getServiciosDicover: async (req, res) => {
        try {

            const newArr = [...req.user.following, req.user._id]

            const num = req.query.num || 9

            const servicios = await Servicios.aggregate([
                { $match: { user: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
            ])

            return res.json({
                msg: 'Success!',
                result: servicios.length,
                servicios
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    deleteServicio: async (req, res) => {
        try {
            const servicio = await Servicios.findOneAndDelete({ _id: req.params.id, user: req.user._id })
            await Comments.deleteMany({ _id: { $in: servicio.comments } })

            res.json({
                msg: 'Deleted Servicio!',
                newServicio: {
                    ...servicio,
                    user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    deleteServicioPendiente: async (req, res) => {
        try {
            const servicio = await Servicios.findOneAndDelete({ _id: req.params.id, user: req.user._id })
            await Comments.deleteMany({ _id: { $in: servicio.comments } })

            res.json({
                msg: 'Deleted Servicio!',
                newServicio: {
                    ...servicio,
                    user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    saveServicio: async (req, res) => {
        try {
            const user = await Users.find({ _id: req.user._id, saved: req.params.id })
            if (user.length > 0) return res.status(400).json({ msg: "You saved this servicio." })

            const save = await Users.findOneAndUpdate({ _id: req.user._id }, {
                $push: { saved: req.params.id }
            }, { new: true })

            if (!save) return res.status(400).json({ msg: 'This user does not exist.' })

            res.json({ msg: 'Saved Servicio!' })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },


    unSaveServicio: async (req, res) => {
        try {
            const save = await Users.findOneAndUpdate({ _id: req.user._id }, {
                $pull: { saved: req.params.id }
            }, { new: true })

            if (!save) return res.status(400).json({ msg: 'This user does not exist.' })

            res.json({ msg: 'unSaved Post!' })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getSaveServicios: async (req, res) => {
        try {
            const features = new APIfeatures(Servicios.find({
                _id: { $in: req.user.saved }
            }), req.query).paginating()

            const saveServicios = await features.query.sort("-createdAt")

            res.json({
                saveServicios,
                result: saveServicios.length
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },






    

}

module.exports = servicioCtrl