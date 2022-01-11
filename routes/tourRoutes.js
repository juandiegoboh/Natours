const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTour,
} = tourController;

// Defnine parameter middleware
// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTour, getAllTours);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
