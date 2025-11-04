const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskProgress,
  toggleTaskCompletion,
  deleteTask,
  enhanceTask,
  getTaskCategories,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const { taskValidation } = require('../utils/validators');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getTasks);
router.get('/categories', getTaskCategories);
router.get('/:id', getTask);
router.post('/', taskValidation, createTask);
router.put('/:id', updateTask);
router.patch('/:id/progress', updateTaskProgress);
router.patch('/:id/toggle', toggleTaskCompletion);
router.patch('/:id/enhance', enhanceTask);
router.delete('/:id', deleteTask);

module.exports = router;