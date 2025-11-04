const OnboardingData = require('../models/OnboardingData');
const Task = require('../models/Task');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const GeminiService = require('../utils/geminiService');

// @desc    Save onboarding data and generate AI tasks/recommendations
// @route   POST /api/onboarding/complete
// @access  Private
exports.completeOnboarding = async (req, res, next) => {
  try {
    const {
      name,
      email,
      profession,
      experience,
      industry,
      goals,
      timeline,
      currentSkills,
      learningStyle,
      weeklyHours,
      motivation,
    } = req.body;

    console.log(`🚀 Starting onboarding completion for user: ${req.user._id}`);

    // Save or update onboarding data
    let onboarding = await OnboardingData.findOne({ userId: req.user._id });

    if (onboarding) {
      // Update existing onboarding data
      onboarding = await OnboardingData.findOneAndUpdate(
        { userId: req.user._id },
        {
          name,
          email,
          profession,
          experience,
          industry,
          goals,
          timeline,
          currentSkills,
          learningStyle,
          weeklyHours,
          motivation,
          tasksGenerated: true,
          recommendationsGenerated: true,
          aiGeneratedAt: new Date(),
          completedAt: new Date(),
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new onboarding data
      onboarding = await OnboardingData.create({
        userId: req.user._id,
        name,
        email,
        profession,
        experience,
        industry,
        goals,
        timeline,
        currentSkills,
        learningStyle,
        weeklyHours,
        motivation,
        tasksGenerated: true,
        recommendationsGenerated: true,
        aiGeneratedAt: new Date(),
      });
    }

    console.log('✅ Onboarding data saved successfully');

    // Generate AI tasks and recommendations in parallel
    const [aiTasks, aiRecommendations] = await Promise.allSettled([
      GeminiService.generateTasksFromOnboarding(onboarding),
      GeminiService.generateRecommendations(onboarding, [])
    ]);

    let tasks = [];
    let recommendations = [];

    // Handle AI tasks result
    if (aiTasks.status === 'fulfilled') {
      const tasksWithUserId = aiTasks.value.map(task => ({
        ...task,
        userId: req.user._id,
        generatedAt: new Date()
      }));

      // Delete existing AI-generated tasks for this user
      await Task.deleteMany({ userId: req.user._id, aiGenerated: true });
      
      // Save new AI-generated tasks
      tasks = await Task.insertMany(tasksWithUserId);
      console.log(`✅ Saved ${tasks.length} AI-generated tasks`);
    } else {
      console.error('❌ AI task generation failed:', aiTasks.reason);
    }

    // Handle AI recommendations result
    if (aiRecommendations.status === 'fulfilled') {
      const recommendationsWithUserId = aiRecommendations.value.map(rec => ({
        ...rec,
        userId: req.user._id,
        aiGenerated: true,
        generatedAt: new Date()
      }));

      // Delete existing AI-generated recommendations for this user
      await Recommendation.deleteMany({ userId: req.user._id, aiGenerated: true });
      
      // Save new AI-generated recommendations
      recommendations = await Recommendation.insertMany(recommendationsWithUserId);
      console.log(`✅ Saved ${recommendations.length} AI-generated recommendations`);
    } else {
      console.error('❌ AI recommendation generation failed:', aiRecommendations.reason);
    }

    // Update user onboarding status
    await User.findByIdAndUpdate(req.user._id, { onboardingComplete: true });

    console.log('🎉 Onboarding completion process finished successfully');

    res.status(201).json({
      success: true,
      message: 'Onboarding completed successfully! Your personalized plan has been generated.',
      data: {
        onboarding,
        tasks,
        recommendations,
        stats: {
          totalTasks: tasks.length,
          totalRecommendations: recommendations.length,
          aiGenerated: true,
          generatedAt: new Date()
        }
      },
    });

  } catch (error) {
    console.error('❌ Onboarding completion error:', error);
    next(error);
  }
};

// @desc    Get onboarding data
// @route   GET /api/onboarding
// @access  Private
exports.getOnboarding = async (req, res, next) => {
  try {
    const onboarding = await OnboardingData.findOne({ userId: req.user._id });

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding data not found. Please complete the onboarding process.',
      });
    }

    res.status(200).json({
      success: true,
      data: { onboarding },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save partial onboarding data (for step-by-step saving)
// @route   POST /api/onboarding
// @access  Private
exports.saveOnboarding = async (req, res, next) => {
  try {
    const onboardingFields = req.body;

    // Update or create onboarding data
    let onboarding = await OnboardingData.findOneAndUpdate(
      { userId: req.user._id },
      { 
        ...onboardingFields,
        userId: req.user._id,
      },
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Onboarding data saved successfully',
      data: { onboarding },
    });

  } catch (error) {
    console.error('Save onboarding error:', error);
    next(error);
  }
};