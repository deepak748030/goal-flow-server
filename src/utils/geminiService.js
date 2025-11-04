const { model } = require('../config/gemini');

class GeminiService {
  // Generate personalized tasks based on onboarding data
  static async generateTasksFromOnboarding(onboardingData) {
    try {
      console.log('🤖 Generating AI tasks for:', onboardingData.name);
      
      const prompt = `
You are a professional career development AI assistant. Based on the following user profile, generate exactly 8-10 actionable, specific tasks to help them achieve their career goals.

User Profile:
- Name: ${onboardingData.name}
- Profession: ${onboardingData.profession}
- Experience Level: ${onboardingData.experience}
- Industry: ${onboardingData.industry}
- Current Skills: ${onboardingData.currentSkills}
- Career Goals: ${onboardingData.goals}
- Timeline: ${onboardingData.timeline}
- Motivation: ${onboardingData.motivation}
- Learning Style: ${onboardingData.learningStyle}
- Weekly Hours Available: ${onboardingData.weeklyHours}

Generate tasks that are:
1. Specific and actionable (not vague)
2. Properly prioritized (high/medium/low based on importance for their goals)
3. Categorized appropriately (Foundation, Learning, Projects, Networking, Portfolio, etc.)
4. Progressive (easier foundational tasks first, then advanced)
5. Realistic for their experience level and available time
6. Aligned with their timeline and weekly hours

Return ONLY a valid JSON array (no other text, no markdown, no backticks) with this exact format:
[
  {
    "title": "Complete and specific task title here",
    "description": "Detailed 2-3 sentence description explaining what to do, how to do it, and why it matters for their goals",
    "priority": "high",
    "category": "Foundation",
    "estimatedDuration": "2 weeks"
  }
]

Categories to use: Foundation, Learning, Projects, Networking, Certification, Portfolio, Research, Practice, Skills
Priorities: high (critical for goals), medium (important), low (beneficial but not essential)
Duration examples: "3 days", "1 week", "2 weeks", "1 month", "6 weeks"
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 Raw AI Response:', text.substring(0, 200) + '...');
      
      // Clean up the response and parse JSON
      const cleanText = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^[\{]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();
      
      let tasks;
      try {
        tasks = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.log('📝 Cleaned Text:', cleanText);
        return this.getFallbackTasks(onboardingData);
      }
      
      // Validate and ensure we have proper task structure
      const validatedTasks = tasks.map((task, index) => ({
        title: task.title || `Career Task ${index + 1}`,
        description: task.description || 'Complete this task to advance your career goals.',
        priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
        category: task.category || 'General',
        estimatedDuration: task.estimatedDuration || '1 week',
        aiGenerated: true,
        percentage: 0,
        completed: false
      }));
      
      console.log(`✅ Generated ${validatedTasks.length} AI tasks successfully`);
      return validatedTasks;
      
    } catch (error) {
      console.error('❌ Gemini AI Task Generation Error:', error.message);
      console.log('🔄 Using fallback tasks instead');
      return this.getFallbackTasks(onboardingData);
    }
  }

  // Generate recommendations based on onboarding data and tasks
  static async generateRecommendations(onboardingData, tasks) {
    try {
      console.log('🤖 Generating AI recommendations for:', onboardingData.name);
      
      const taskTitles = tasks.map(t => t.title).join(', ');
      
      const prompt = `
Based on this user profile and their generated tasks, recommend exactly 6 specific resources to help them succeed in their career goals.

User Profile:
- Profession: ${onboardingData.profession}
- Experience: ${onboardingData.experience}
- Industry: ${onboardingData.industry}
- Goals: ${onboardingData.goals}
- Learning Style: ${onboardingData.learningStyle}
- Timeline: ${onboardingData.timeline}

Their Generated Tasks: ${taskTitles}

Create exactly 6 recommendations including:
- 2 online courses (specific course names or platforms if possible)
- 2 practical projects they can build to demonstrate skills
- 1 professional certification to pursue
- 1 community/network to join for professional growth

Return ONLY a valid JSON array (no other text, no markdown, no backticks) with this exact format:
[
  {
    "title": "Specific recommendation title",
    "description": "2-3 sentence description explaining what it is, where to find it, and why it's valuable for their goals",
    "type": "course",
    "relevance": "Brief explanation of why this specifically matches their profile and goals"
  }
]

Types to use exactly: "course", "project", "certification", "network"
Make recommendations specific to their industry and profession.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response and parse JSON
      const cleanText = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^[\{]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();
      
      let recommendations;
      try {
        recommendations = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ Recommendations JSON Parse Error:', parseError.message);
        return this.getFallbackRecommendations(onboardingData);
      }
      
      const validatedRecommendations = recommendations.map(rec => ({
        title: rec.title || 'Professional Recommendation',
        description: rec.description || 'This resource will help advance your career.',
        type: ['course', 'project', 'certification', 'network'].includes(rec.type) ? rec.type : 'course',
        relevance: rec.relevance || 'Relevant to your career goals'
      }));
      
      console.log(`✅ Generated ${validatedRecommendations.length} AI recommendations successfully`);
      return validatedRecommendations;
      
    } catch (error) {
      console.error('❌ Gemini AI Recommendation Error:', error.message);
      return this.getFallbackRecommendations(onboardingData);
    }
  }

  // Enhance task description with more details
  static async enhanceTaskDescription(taskTitle, userContext) {
    try {
      const prompt = `
Enhance this task title with a detailed, actionable description:

Task: "${taskTitle}"
User Context: ${userContext}

Provide a 2-3 sentence description that:
1. Explains exactly what to do step by step
2. Why it's important for their career
3. Expected outcome or benefit

Return only the enhanced description (no other text, no quotes).
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
      
    } catch (error) {
      console.error('❌ Task Enhancement Error:', error.message);
      return `Complete this important task: ${taskTitle}. This will help advance your career goals and build valuable skills.`;
    }
  }

  // Fallback tasks if AI fails
  static getFallbackTasks(onboardingData) {
    const profession = onboardingData.profession.toLowerCase();
    const industry = onboardingData.industry.toLowerCase();
    
    console.log('🔄 Generating fallback tasks for:', profession, 'in', industry);
    
    const baseTasks = [
      {
        title: `Update ${profession} Resume for ${onboardingData.industry}`,
        description: `Create a modern, ATS-friendly resume highlighting your ${onboardingData.experience} experience in ${onboardingData.industry}. Use industry-specific keywords and quantify your achievements to stand out to recruiters.`,
        priority: 'high',
        category: 'Foundation',
        estimatedDuration: '1 week',
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Build Professional LinkedIn Profile',
        description: 'Optimize your LinkedIn profile with professional photo, compelling headline, and detailed experience section. Connect with industry professionals and share relevant content to build your network.',
        priority: 'high',
        category: 'Networking',
        estimatedDuration: '3 days',
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Learn In-Demand Skills',
        description: `Identify and start learning 2-3 key skills that are highly valued in ${onboardingData.industry}. Focus on skills that align with your ${onboardingData.goals} and can be learned within your ${onboardingData.timeline} timeline.`,
        priority: 'medium',
        category: 'Learning',
        estimatedDuration: '1 month',
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Build Portfolio Project',
        description: `Create a practical project that demonstrates your skills in ${profession}. This will serve as tangible proof of your abilities to potential employers or clients.`,
        priority: 'medium',
        category: 'Portfolio',
        estimatedDuration: '3 weeks',
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Network with Industry Professionals',
        description: `Attend industry events, join professional groups, and connect with people working in ${onboardingData.industry}. Building relationships is crucial for career advancement.`,
        priority: 'medium',
        category: 'Networking',
        estimatedDuration: '2 weeks',
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Research Industry Trends',
        description: `Stay updated with the latest trends, tools, and technologies in ${onboardingData.industry}. This knowledge will help you stay competitive and identify new opportunities.`,
        priority: 'low',
        category: 'Research',
        estimatedDuration: '1 week',
        aiGenerated: false,
        percentage: 0,
        completed: false
      }
    ];
    
    return baseTasks.slice(0, 8); // Return 8 fallback tasks
  }

  // Fallback recommendations if AI fails
  static getFallbackRecommendations(onboardingData) {
    console.log('🔄 Generating fallback recommendations');
    
    return [
      {
        title: 'Coursera Professional Certificates',
        description: 'Explore industry-recognized certificates from top companies like Google, IBM, and Meta. These certificates can be completed in 3-6 months and are highly valued by employers.',
        type: 'course',
        relevance: 'Industry-recognized credentials that match current job market demands'
      },
      {
        title: 'Build a Portfolio Website',
        description: 'Create a professional website showcasing your work, projects, and achievements. Use platforms like GitHub Pages, Netlify, or WordPress to build an impressive online presence.',
        type: 'project',
        relevance: 'Demonstrates your skills and makes you more visible to potential employers'
      },
      {
        title: `${onboardingData.industry} Certification Program`,
        description: `Pursue a relevant professional certification in ${onboardingData.industry}. Research the most recognized certifications in your field and create a study plan.`,
        type: 'certification',
        relevance: 'Validates your expertise and shows commitment to professional development'
      },
      {
        title: `Join ${onboardingData.profession} Community`,
        description: `Connect with other professionals in ${onboardingData.profession} through LinkedIn groups, Discord servers, or local meetups. Share knowledge and learn from others' experiences.`,
        type: 'network',
        relevance: 'Building professional relationships accelerates career growth'
      },
      {
        title: 'Complete Skill-Building Project',
        description: 'Identify a gap in your skillset and create a project specifically to fill that gap. Document your learning process and share it with your network.',
        type: 'project',
        relevance: 'Hands-on experience is the best way to solidify new skills'
      },
      {
        title: 'Industry-Specific Online Course',
        description: `Find and complete a course specifically focused on ${onboardingData.industry} trends and best practices. Platforms like Udemy, LinkedIn Learning, or industry-specific sites offer great options.`,
        type: 'course',
        relevance: 'Keeps you updated with industry standards and emerging technologies'
      }
    ];
  }
}

module.exports = GeminiService;