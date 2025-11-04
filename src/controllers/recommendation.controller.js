const Recommendation = require('../models/Recommendation');

// @desc    Get recommendations for user
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const { type, dismissed } = req.query;
    
    // Build query
    let query = { userId: req.user._id };
    
    if (type) {
      query.type = type;
    }
    
    if (dismissed !== undefined) {
      query.dismissed = dismissed === 'true';
    }

    const recommendations = await Recommendation.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate stats
    const stats = {
      total: recommendations.length,
      byType: {
        course: recommendations.filter(r => r.type === 'course').length,
        project: recommendations.filter(r => r.type === 'project').length,
        certification: recommendations.filter(r => r.type === 'certification').length,
        network: recommendations.filter(r => r.type === 'network').length,
      },
      dismissed: recommendations.filter(r => r.dismissed).length,
      clicked: recommendations.filter(r => r.clicked).length,
    };

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recommendation
// @route   GET /api/recommendations/:id
// @access  Private
exports.getRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { recommendation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create recommendation
// @route   POST /api/recommendations
// @access  Private
exports.createRecommendation = async (req, res, next) => {
  try {
    const { type, title, description, relevance } = req.body;

    const recommendation = await Recommendation.create({
      userId: req.user._id,
      type,
      title,
      description,
      relevance: relevance || '',
      aiGenerated: false,
    });

    console.log(`✅ New recommendation created: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Recommendation created successfully',
      data: { recommendation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark recommendation as clicked
// @route   PATCH /api/recommendations/:id/click
// @access  Private
exports.clickRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found',
      });
    }

    recommendation.clicked = true;
    await recommendation.save();

    console.log(`👆 Recommendation clicked: ${recommendation.title}`);

    res.status(200).json({
      success: true,
      message: 'Recommendation marked as clicked',
      data: { recommendation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dismiss recommendation
// @route   PATCH /api/recommendations/:id/dismiss
// @access  Private
exports.dismissRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found',
      });
    }

    recommendation.dismissed = true;
    await recommendation.save();

    console.log(`❌ Recommendation dismissed: ${recommendation.title}`);

    res.status(200).json({
      success: true,
      message: 'Recommendation dismissed successfully',
      data: { recommendation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recommendation
// @route   DELETE /api/recommendations/:id
// @access  Private
exports.deleteRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found',
      });
    }

    console.log(`🗑️ Recommendation deleted: ${recommendation.title}`);

    res.status(200).json({
      success: true,
      message: 'Recommendation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};