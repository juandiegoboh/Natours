const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

const { getAllUsers, getUser, createUser, updateUser, deleteUser } =
  userController;

const { signUp, logIn } = authController;

router.post('/signup', signUp);
router.post('/login', logIn);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
