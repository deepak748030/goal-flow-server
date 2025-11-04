const express = require('express');
const {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  toggleResumePublic,
} = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');
const { resumeValidation } = require('../utils/validators');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getResumes);
router.get('/:id', getResume);
router.post('/', resumeValidation, createResume);
router.put('/:id', updateResume);
router.patch('/:id/toggle-public', toggleResumePublic);
router.delete('/:id', deleteResume);

module.exports = router;