const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = userController;

const {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  protectRoute,
} = authController;

router.post('/signup', signUp);
router.post('/login', logIn);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protectRoute, updatePassword);

router.patch('/updateMe', protectRoute, updateMe);
router.delete('/deleteMe', protectRoute, deleteMe);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
