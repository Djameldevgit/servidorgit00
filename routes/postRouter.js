const router = require('express').Router();
const postCtrl = require('../controllers/postCtrl');
const auth = require('../middleware/auth');

 router.get('/posts',   postCtrl.getPosts);
//router.get('/posts',  postCtrl.searchPosts)
router.post('/crearpostpendiente', auth, postCtrl.createPostPendiente);

router.get('/getpostspendientes', auth, postCtrl.getPostsPendientesss);

router.patch('/aprovarpost/:id/aprovado', auth, postCtrl.aprovarPostPendiente);

router.delete('/post/:id', auth, postCtrl.deletePostPendiente);

router.patch('/post/:id', auth, postCtrl.updatePost);

router.get('/post/:id',   postCtrl.getPost);

router.delete('/post/:id', auth, postCtrl.deletePost);

router.patch('/post/:id/like', auth, postCtrl.likePost);

router.patch('/post/:id/unlike', auth, postCtrl.unLikePost);

router.get('/user_posts/:id', auth, postCtrl.getUserPosts);

router.get('/post_discover', auth, postCtrl.getPostsDicover);

router.patch('/savePost/:id', auth, postCtrl.savePost);

router.patch('/unSavePost/:id', auth, postCtrl.unSavePost);

router.get('/getSavePosts', auth, postCtrl.getSavePosts);

module.exports = router;
