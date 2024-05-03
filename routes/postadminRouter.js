const router = require('express').Router()
 
const postadminCtrl = require('../controllers/postaminCtrl')
const auth = require('../middleware/auth')
 
router.route('/postsadmin')
    .post(auth, postadminCtrl.createPostadmin)
    .get(auth, postadminCtrl.getPostsadmin)
 
router.route('/postadmin/:id')
    .patch(auth, postadminCtrl.updatePostadmin)
    .get(auth, postadminCtrl.getPostadmin)
    .delete(auth, postadminCtrl.deletePostadmin)

router.patch('/post/:id/like', auth, postadminCtrl.likePostadmin)

router.patch('/post/:id/unlike', auth, postadminCtrl.unLikePostadmin)

router.get('/user_posts/:id', auth, postadminCtrl.getUserPostsadmin)

 


module.exports = router