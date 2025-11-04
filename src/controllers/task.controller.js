const Task = require('../models/Task');
const GeminiService = require('../utils/geminiService');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { completed, priority, category } = req.query;
    
    // Build query
    let query = { userId: req.user._id };
    
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (category) {
      query.category = category;
    }

    const tasks = await Task.find(query)
      .sort({ 
        priority: 1,  // high priority first
        createdAt: -1 // newest first
      });

    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const priorityStats = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    res.status(200).json({
      success: true,
      data: {
        tasks,
        stats: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          completionRate,
          priorityStats,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, estimatedDuration } = req.body;

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      priority: priority || 'medium',
      category: category || 'General',
      estimatedDuration: estimatedDuration || '1 week',
      aiGenerated: false,
    });

    console.log(`✅ New task created by user ${req.user._id}: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Update task fields
    Object.assign(task, req.body);
    await task.save();

    console.log(`✅ Task updated: ${task.title}`);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task progress percentage
// @route   PATCH /api/tasks/:id/progress
// @access  Private
exports.updateTaskProgress = async (req, res, next) => {
  try {
    const { percentage } = req.body;

    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage must be between 0 and 100',
      });
    }

    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.percentage = percentage;
    
    // Auto-complete when reaching 100%
    if (percentage >= 100) {
      task.completed = true;
    }

    await task.save();

    console.log(`✅ Task progress updated: ${task.title} - ${percentage}%`);

    res.status(200).json({
      success: true,
      message: 'Task progress updated successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
exports.toggleTaskCompletion = async (req, res, next) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.completed = !task.completed;
    
    // Update percentage based on completion
    if (task.completed) {
      task.percentage = 100;
    }
    // Keep current percentage if uncompleted

    await task.save();

    const status = task.completed ? 'completed' : 'uncompleted';
    console.log(`✅ Task ${status}: ${task.title}`);

    res.status(200).json({
      success: true,
      message: `Task marked as ${status}`,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    console.log(`🗑️ Task deleted: ${task.title}`);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enhance task with AI
// @route   PATCH /api/tasks/:id/enhance
// @access  Private
exports.enhanceTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Get user context for enhancement
    const userContext = `Profession: ${req.user.profession || 'Professional'}, Experience: ${req.user.experience || 'Mid-level'}`;

    try {
      const enhancedDescription = await GeminiService.enhanceTaskDescription(task.title, userContext);
      task.description = enhancedDescription;
      await task.save();

      console.log(`🤖 Task enhanced with AI: ${task.title}`);

      res.status(200).json({
        success: true,
        message: 'Task enhanced with AI successfully',
        data: { task },
      });
    } catch (aiError) {
      console.error('AI enhancement error:', aiError);
      res.status(500).json({
        success: false,
        message: 'Failed to enhance task with AI, but task remains unchanged',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get task categories
// @route   GET /api/tasks/categories
// @access  Private
exports.getTaskCategories = async (req, res, next) => {
  try {
    const categories = await Task.distinct('category', { userId: req.user._id });
    
    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};