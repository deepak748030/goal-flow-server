const express = require('express');
const { 
  saveOnboarding, 
  getOnboarding, 
  completeOnboarding 
} = require('../controllers/onboarding.controller');
const { protect } = require('../middleware/auth.middleware');
const { onboardingValidation } = require('../utils/validators');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getOnboarding);
router.post('/', saveOnboarding);
router.post('/complete', onboardingValidation, completeOnboarding);

module.exports = router;