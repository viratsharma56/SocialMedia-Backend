const router = require('express').Router();

const auth = require('../middleware/auth');
const { addUser, authenticate, followPerson, unfollowPerson, getUser } = require('../controllers/Users');

router.post('/adduser', addUser);
router.post('/authenticate', authenticate);
router.post('/follow/:id', auth, followPerson);
router.post('/unfollow/:id', auth, unfollowPerson);
router.get('/user', auth, getUser);

module.exports = router