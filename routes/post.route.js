const router = require('express').Router();

const auth = require('../middleware/auth');

const { createPost, deletePost, likePost, unlikePost, commentPost, getPostByID, getAllPosts } = require('../controllers/Posts');

router.post('/posts', auth, createPost);
router.delete('/posts/:id', auth, deletePost);
router.post('/like/:id', auth, likePost);
router.post('/unlike/:id', auth, unlikePost);
router.post('/comment/:id', auth, commentPost);
router.get('/posts/:id', getPostByID);
router.get('/all_posts', auth, getAllPosts);

module.exports = router