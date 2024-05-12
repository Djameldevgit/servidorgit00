const Posts = require('../models/postModel')
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

const postCtrl = {
  

    createPostPendiente: async (req, res) => {
        try {
            const {  content,direcion,wilaya,commune,specifications,discripcion,pricesala,dinero,negociable,nomprenom,telefono,email,web,informacion,comentarios , images } = req.body;
            
            if (images.length === 0) {
                return res.status(400).json({ msg: "Veuillez ajouter votre photo." });
            }
    
            const newPost = new Posts({
                 estado: 'pendiente', content,direcion,wilaya,commune,specifications,discripcion,pricesala,dinero,negociable,nomprenom,telefono,email,web,informacion,comentarios , images,user: req.user._id,
            });
    
            // Utilizar el modo de preocupación por escritura 'majority'
            await newPost.save({ writeConcern: { w: "majority" } });  
    
            res.json({
                msg: "Votre publication 'Salle des fêtes' a été créée et envoyée aux administrateurs pour validation ultérieure. Dans tous les cas nous vous envoyons une notification !",
                newPost: {
                    ...newPost._doc,
                    user: req.user,
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    




    getPostsPendientesss: async (req, res) => {

 
            try {
                const features = new APIfeatures(Posts.find({ estado: 'pendiente' }), req.query).paginating();
        
                const posts = await features.query
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
                    msg: "Votre publication a été publiée avec succès.",
                    result: posts.length,
                    posts
                });
            } catch (err) {
                return res.status(500).json({ msg: err.message });
            }
        },
        
        



    aprovarPostPendiente: async (req, res) => {
        try {
            const post = await Posts.findById(req.params.id);
            if (!post) return res.status(404).json({ msg: 'Publicación no encontrada' });

            post.estado = 'aprovado';
            await post.save();
            // Envia el _id del post aprobado en la respuesta
            res.json({ msg: 'Poste approuvé!', _id: post._id });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getPosts: async (req, res) => {
        try {
             
            const {
                ventalocation,content, wilaya, commune,   minpriciosala, maxpriciosala, 
            } = req.query;

            let query = { estado: 'aprovado' }; // Agregar la condición del ID de usuario



            if (ventalocation) {
                query.salaservicio = ventalocation;
            }
            if (content) {
                query.content = { $regex: new RegExp(content, 'i') }; // Expresión regular para buscar contenido
            }
            
            if (minpriciosala && maxpriciosala) {
                query.pricesala = { $gte: minpriciosala, $lte: maxpriciosala };
            }
 
          
            if (wilaya) {
                query.wilaya = wilaya.toUpperCase(); // o toLowerCase()
            }
            
            if (commune) {
                query.commune = commune.toUpperCase(); // o toLowerCase()
            }
            
            

         



            const features = new APIfeatures(Posts.find(query), req.query).paginating()//(user:  req.user._id)

            const posts = await features.query
          
                .sort('-createdAt')
                .populate("user likes", "avatar username   followers")
                .populate({
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "-password"
                    }
                });
            
            res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
 
    updatePost: async (req, res) => {
        try {
            const { images, ...postData} = req.body;
            const post = await Posts.findOneAndUpdate({ _id: req.params.id }, {
                images, ...postData

            }).populate("user likes", "avatar username")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            res.json({
                msg: "Votre publication a été mis à jour!",
                newPost: {
                    ...post._doc,
                    images, ...postData
                }
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },




    likePost: async (req, res) => {
        try {
            const post = await Posts.find({ _id: req.params.id, likes: req.user._id })
            if (post.length > 0) return res.status(400).json({ msg: "You liked this post." })

            const like = await Posts.findOneAndUpdate({ _id: req.params.id }, {
                $push: { likes: req.user._id }
            }, { new: true })

            if (!like) return res.status(400).json({ msg: 'This post does not exist.' })

            res.json({ msg: 'Liked Post!' })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    unLikePost: async (req, res) => {
        try {

            const like = await Posts.findOneAndUpdate({ _id: req.params.id }, {
                $pull: { likes: req.user._id }
            }, { new: true })

            if (!like) return res.status(400).json({ msg: 'This post does not exist.' })

            res.json({ msg: 'UnLiked Post!' })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getUserPosts: async (req, res) => {
        try {
            const features = new APIfeatures(Posts.find({ user: req.params.id }), req.query)
                .paginating()
            const posts = await features.query.sort("-createdAt")

            res.json({
                posts,
                result: posts.length
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getPost: async (req, res) => {
        try {
            const post = await Posts.findById(req.params.id)
                .populate("user likes", "avatar username   followers")
                .populate({
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "-password"
                    }
                })

            if (!post) return res.status(400).json({ msg: 'This post does not exist.' })

            res.json({
                post
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getPostsDicover: async (req, res) => {
        try {

            const newArr = [...req.user.following, req.user._id]

            const num = req.query.num || 9

            const posts = await Posts.aggregate([
                { $match: { user: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
            ])

            return res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    deletePost: async (req, res) => {
        try {
            const post = await Posts.findOneAndDelete({ _id: req.params.id, user: req.user._id })
            await Comments.deleteMany({ _id: { $in: post.comments } })

            res.json({
                msg: 'Publication suprimer!',
                newPost: {
                    ...post,
                    user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },

    deletePostPendiente: async (req, res) => {
        try {
            const post = await Posts.findOneAndDelete({ _id: req.params.id, user: req.user._id })
            await Comments.deleteMany({ _id: { $in: post.comments } })

            res.json({
                msg: 'Publication suprimer!',
                newPost: {
                    ...post,
                    user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },


    savePost: async (req, res) => {
        try {
            const user = await Users.find({ _id: req.user._id, saved: req.params.id })
            if (user.length > 0) return res.status(400).json({ msg: "You saved this post." })

            const save = await Users.findOneAndUpdate({ _id: req.user._id }, {
                $push: { saved: req.params.id }
            }, { new: true })

            if (!save) return res.status(400).json({ msg: 'This user does not exist.' })

            res.json({ msg: 'Saved Post!' })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    unSavePost: async (req, res) => {
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
    getSavePosts: async (req, res) => {
        try {
            const features = new APIfeatures(Posts.find({
                _id: { $in: req.user.saved }
            }), req.query).paginating()

            const savePosts = await features.query.sort("-createdAt")

            res.json({
                savePosts,
                result: savePosts.length
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
}

module.exports = postCtrl