const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
    validate: {
      validator: function (val) {
        return validator.isAlpha(val, 'en-US', { ignore: /\s/g });
      },
      message: 'Your name must only contains characters and spaces',
    },
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    maxLength: [30, 'Your email must have less or equal than 30 characters'],
    minLength: [10, 'Your email must have more or equal than 10 characters'],
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    trim: true,
    maxLength: [30, 'Your email must have less or equal than 30 characters'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    maxLength: [30, 'Your password must have less or equal than 30 characters'],
    minLength: [8, 'Your password must have al least 5 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on SAVE!
      validator: function (el) {
        return el === this.password;
      },
      message: "The passwords doesn't match",
    },
  },
  passwordChangedAt: { type: Date, required: [true, 'Please'] },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
