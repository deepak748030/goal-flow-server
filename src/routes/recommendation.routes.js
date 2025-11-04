const express = require('express');
const {
  getRecommendations,
  getRecommendation,
  createRecommendation,
  clickRecommendation,
  dismissRecommendation,
  deleteRecommendation,
} = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getRecommendations);
router.get('/:id', getRecommendation);
router.post('/', createRecommendation);
router.patch('/:id/click', clickRecommendation);
router.patch('/:id/dismiss', dismissRecommendation);
router.delete('/:id', deleteRecommendation);

module.exports = router;