const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array(),
    });
  }
  next();
};

const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

const onboardingValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('profession').trim().notEmpty().withMessage('Profession is required'),
  body('experience').trim().notEmpty().withMessage('Experience is required'),
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('goals').trim().notEmpty().withMessage('Goals are required'),
  body('timeline').trim().notEmpty().withMessage('Timeline is required'),
  body('currentSkills').trim().notEmpty().withMessage('Current skills are required'),
  body('learningStyle').trim().notEmpty().withMessage('Learning style is required'),
  body('weeklyHours').trim().notEmpty().withMessage('Weekly hours are required'),
  body('motivation').trim().notEmpty().withMessage('Motivation is required'),
  validate,
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').trim().notEmpty().withMessage('Task description is required'),
  body('priority').isIn(['high', 'medium', 'low']).withMessage('Invalid priority'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  validate,
];

const resumeValidation = [
  body('personalInfo.name').trim().notEmpty().withMessage('Name is required'),
  body('personalInfo.email').isEmail().withMessage('Valid email is required'),
  body('experiences').optional().isArray(),
  body('education').optional().isArray(),
  validate,
];

module.exports = {
  signupValidation,
  loginValidation,
  onboardingValidation,
  taskValidation,
  resumeValidation,
  validate,
};