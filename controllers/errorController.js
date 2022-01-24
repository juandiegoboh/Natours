const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  if (errors.length > 1) {
    const errorsMany = errors;

    errorsMany.forEach((el, id, arr) => {
      arr[id] = `${id + 1}: ${el}`;
    });

    const message = `Invalid input data. There have been some errors: ${errorsMany.join(
      '. '
    )}`;
    return new AppError(message, 400);
  }

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Plase log in again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operation, trusted error: Send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error message
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    const errorName = err.name;
    let error = { ...err };

    if (errorName === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (errorName === 'ValidationError') error = handleValidationErrorDB(error);
    if (errorName === 'JsonWebTokenError') error = handleJWTError();
    if (errorName === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

exports.handleRejectionException = (err, errorType, server) => {
  const errPlaceholder = errorType.toUpperCase();
  console.log(err.name, err.message);
  console.log(`UNHANDLED ${errPlaceholder}! 💥 Shutting down...`);

  if (errorType === 'rejection') {
    server.close(() => {
      process.exit(1);
    });
  } else if (errorType === 'exception') {
    process.exit(1);
  }
};
