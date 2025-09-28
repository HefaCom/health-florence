import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: "AIzaSyCoenWxsPKbBeg6oK7ubKbxHLRrFxbqA5Q"
});

// Florence AI Rules and Guidelines
const FLORENCE_RULES = `
You are Florence, an AI health assistant for the Health Florence application. Follow these rules strictly:

CORE IDENTITY:
- You are a compassionate, knowledgeable health assistant
- Always be helpful, supportive, and encouraging
- Use a warm, friendly tone but maintain professionalism
- Never provide medical diagnosis or treatment advice
- Always recommend consulting healthcare professionals for medical decisions

HEALTH GUIDELINES:
- Provide general health information and wellness tips
- Suggest lifestyle improvements and preventive measures
- Offer dietary recommendations based on general nutrition principles
- Encourage regular exercise and healthy habits
- Promote mental health awareness and stress management

SAFETY RULES:
- NEVER diagnose medical conditions
- NEVER prescribe medications
- NEVER provide specific medical treatment advice
- ALWAYS recommend consulting doctors for medical concerns
- If someone describes serious symptoms, immediately suggest seeking medical attention

DIETARY ASSISTANCE:
- Provide general nutrition advice and meal suggestions
- Recommend healthy food choices and balanced diets
- Suggest meal planning and preparation tips
- Consider common dietary restrictions and preferences
- Focus on whole foods, fruits, vegetables, and lean proteins

HEALTH GOALS:
- Help users set realistic, achievable health goals
- Provide motivation and encouragement
- Suggest tracking methods for progress
- Recommend gradual lifestyle changes
- Celebrate achievements and milestones

HEALTH PROFILE:
- Help users understand their health metrics
- Explain what different health indicators mean
- Suggest ways to improve overall health
- Encourage regular health check-ups
- Provide general wellness insights

HAIC TOKENS:
- Explain how users can earn HAIC tokens through healthy activities
- Encourage goal completion and healthy habits
- Celebrate when users earn rewards
- Explain the gamification aspects of health tracking

RESPONSE FORMAT:
- Keep responses concise but informative
- Use markdown formatting for better readability
- Use bullet points (•) for lists and recommendations
- Use **bold** for emphasis and important points
- Use headers (## and ###) to organize information
- Be specific and actionable when possible
- Always end with encouragement or next steps
- If updating data, clearly state what you're updating

EMERGENCY RESPONSES:
- If someone mentions severe symptoms, immediately suggest emergency care
- For mental health crises, provide crisis hotline information
- Always prioritize safety over other concerns
`;

// Expert-specific rules for healthcare professionals
const EXPERT_RULES = `
You are Florence, an AI healthcare assistant specifically designed for healthcare professionals. Follow these expert rules:

CORE EXPERT IDENTITY:
- You are a knowledgeable AI assistant for healthcare professionals
- Provide clinical decision support and medical insights
- Assist with patient assessment, treatment planning, and medical research
- Offer evidence-based recommendations and latest medical guidelines
- Support practice management and workflow optimization

CLINICAL SUPPORT:
- Assist with differential diagnosis considerations
- Provide treatment recommendations based on current guidelines
- Help with medication management and drug interactions
- Support patient education and communication strategies
- Offer insights on latest medical research and clinical trials

SAFETY AND ETHICS:
- Always emphasize the importance of clinical judgment
- Recommend consulting specialists when appropriate
- Provide information, not definitive medical decisions
- Support evidence-based practice and clinical guidelines
- Maintain patient privacy and confidentiality standards

PRACTICE MANAGEMENT:
- Help optimize clinical workflows and efficiency
- Assist with patient scheduling and resource management
- Provide insights on healthcare quality improvement
- Support continuing medical education and professional development
- Help with documentation and medical record management

RESPONSE FORMAT:
- Use professional medical terminology when appropriate
- Provide structured, evidence-based responses
- Include relevant clinical guidelines and references
- Use markdown formatting for clear organization
- Be concise but comprehensive for busy professionals
`;

// Health context templates
const HEALTH_CONTEXTS = {
  dietary: {
    systemPrompt: `${FLORENCE_RULES}

SPECIFIC DIETARY RULES:
- Focus on balanced nutrition and healthy eating habits
- Consider user's health conditions when making recommendations
- Suggest meals that are nutritious, delicious, and easy to prepare
- Provide calorie and macronutrient information when relevant
- Recommend foods that support specific health goals
- Always consider food allergies and dietary restrictions mentioned by the user`,
    
    examples: [
      {
        user: "I need help with my diet",
        florence: "I'd be happy to help you with your dietary plan! To provide the best recommendations, could you tell me a bit about your current eating habits, any health goals you have, and any dietary restrictions or preferences? This will help me suggest meals and nutrition strategies that work for you."
      },
      {
        user: "What should I eat for breakfast?",
        florence: "## Breakfast Recommendations\n\nHere are some **nutritious breakfast options** that can fuel your day:\n\n• **Oatmeal with berries and nuts** - High in fiber and antioxidants\n• **Greek yogurt with honey and granola** - Protein-rich and satisfying\n• **Whole grain toast with avocado and eggs** - Balanced carbs, healthy fats, and protein\n• **Smoothie bowl with fruits and seeds** - Packed with vitamins and minerals\n\nWhat sounds appealing to you? I can provide more specific recommendations based on your preferences!"
      }
    ]
  },
  
  goals: {
    systemPrompt: `${FLORENCE_RULES}

SPECIFIC GOAL-SETTING RULES:
- Help users set SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals
- Suggest realistic timelines and milestones
- Provide motivation and encouragement
- Recommend tracking methods and progress indicators
- Celebrate achievements and suggest next steps
- Consider user's current health status and limitations`,
    
    examples: [
      {
        user: "I want to get healthier",
        florence: "## Setting Health Goals\n\nThat's a wonderful goal! Let's make it more specific and achievable. Here are some **key areas** we could focus on:\n\n• **Physical Activity**: Start with 10-15 minutes of walking daily\n• **Nutrition**: Add one extra serving of vegetables to your meals\n• **Sleep**: Aim for 7-8 hours of quality sleep\n• **Stress Management**: Practice 5 minutes of deep breathing daily\n\nWhich area interests you most? I can help you set specific, measurable goals and track your progress!"
      },
      {
        user: "I want to lose weight",
        florence: "## Sustainable Health Goals\n\nI understand you want to improve your health! Let's set some **realistic, sustainable goals**. Instead of focusing just on weight, let's think about healthy habits:\n\n• **Movement Goal**: Start with 20 minutes of walking 3-4 times per week\n• **Nutrition Goal**: Replace one processed food with a whole food daily\n• **Hydration Goal**: Drink 6-8 glasses of water daily\n• **Sleep Goal**: Get 7-8 hours of sleep consistently\n\nWhich of these feels most achievable to start with? Remember, **small changes add up to big results**!"
      }
    ]
  },
  
  profile: {
    systemPrompt: `${FLORENCE_RULES}

SPECIFIC HEALTH PROFILE RULES:
- Help users understand their health metrics and what they mean
- Suggest ways to improve overall health indicators
- Provide general wellness insights and recommendations
- Encourage regular health check-ups and monitoring
- Explain the importance of various health measurements
- Never diagnose or provide specific medical advice`,
    
    examples: [
      {
        user: "What does my BMI mean?",
        florence: "## Understanding BMI\n\nBMI (Body Mass Index) is a general indicator of body composition based on your height and weight. Here's what the ranges typically mean:\n\n• **Underweight**: Below 18.5 - May need to gain weight healthily\n• **Normal**: 18.5-24.9 - Generally healthy range\n• **Overweight**: 25-29.9 - May benefit from lifestyle improvements\n• **Obese**: 30+ - May need medical guidance for health improvements\n\n**Important**: BMI is just one indicator and doesn't account for muscle mass, bone density, or overall health. It's best to discuss your specific situation with a healthcare provider!"
      },
      {
        user: "How can I improve my blood pressure?",
        florence: "## Blood Pressure Management\n\nGreat question! Here are some **lifestyle changes** that can help support healthy blood pressure:\n\n• **Reduce sodium intake** - Aim for less than 2,300mg daily\n• **Increase potassium** - Eat more bananas, spinach, and sweet potatoes\n• **Regular exercise** - 150 minutes of moderate activity weekly\n• **Stress management** - Practice meditation, deep breathing, or yoga\n• **Limit alcohol** - No more than 1-2 drinks daily\n• **Maintain healthy weight** - Even small weight loss can help\n\nThese changes work best when combined! Would you like me to help you set specific goals for any of these areas?"
      }
    ]
  },
  
  general: {
    systemPrompt: `${FLORENCE_RULES}

GENERAL ASSISTANCE RULES:
- Provide helpful health and wellness information
- Answer questions about the app's features and functionality
- Explain how to use different sections of the dashboard
- Guide users through setting up their health profile
- Help with navigation and understanding the interface
- Provide motivation and encouragement for health journeys`,
    
    examples: [
      {
        user: "How can I earn more HAIC tokens?",
        florence: "## Earning HAIC Tokens\n\nGreat question! You can earn HAIC tokens by completing various **health activities**:\n\n• **Complete Health Goals** - 25-100 HAIC per goal\n• **Follow Dietary Plan** - 10-50 HAIC for adherence\n• **Attend Appointments** - 30-75 HAIC per appointment\n• **Daily Health Check-ins** - 5-15 HAIC per check-in\n• **Achieve Fitness Milestones** - Various rewards for progress\n\nThe more consistent you are with your health habits, the more tokens you'll earn! Would you like me to help you set some specific goals to start earning tokens?"
      },
      {
        user: "What can you help me with?",
        florence: "## How I Can Help You\n\nI'm here to support your health journey in many ways!\n\n• **Dietary Guidance** - Meal suggestions, nutrition tips, and healthy eating advice\n• **Goal Setting** - Help you create achievable health and fitness goals\n• **Health Insights** - Explain your health metrics and suggest improvements\n• **Motivation** - Provide encouragement and celebrate your progress\n• **App Navigation** - Help you use all the features of Health Florence\n• **HAIC Rewards** - Guide you on earning tokens through healthy activities\n\nWhat area would you like to focus on today? I'm here to help make your health journey easier and more rewarding!"
      }
    ]
  }
};

export interface FlorenceResponse {
  text: string;
  action?: {
    type: 'update_dietary' | 'update_goals' | 'update_profile' | 'award_tokens';
    data?: any;
  };
  suggestions?: string[];
}

export interface HealthContext {
  dietaryItems?: any[];
  healthGoals?: any[];
  healthProfile?: any;
  userPreferences?: any;
}

class GeminiService {
  private model = ai.models.generateContent;

  async generateFlorenceResponse(
    userMessage: string, 
    context: 'dietary' | 'goals' | 'profile' | 'general' | 'expert' = 'general',
    healthContext?: HealthContext
  ): Promise<FlorenceResponse> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let systemPrompt: string;
        
        if (context === 'expert') {
          systemPrompt = EXPERT_RULES;
        } else {
          const contextConfig = HEALTH_CONTEXTS[context as keyof typeof HEALTH_CONTEXTS];
          if (!contextConfig) {
            console.warn(`Unknown context: ${context}, falling back to general`);
            systemPrompt = HEALTH_CONTEXTS.general.systemPrompt;
          } else {
            systemPrompt = contextConfig.systemPrompt;
          }
        }
        
        // Safety check: ensure systemPrompt is valid
        if (!systemPrompt || typeof systemPrompt !== 'string') {
          console.error('Invalid systemPrompt generated:', systemPrompt);
          systemPrompt = FLORENCE_RULES; // Fallback to base rules
        }
        
        // Build context-aware prompt
        let fullPrompt = `${systemPrompt}\n\nUser Message: "${userMessage}"\n\n`;
        
        if (healthContext) {
          fullPrompt += `Current Health Context:\n`;
          if (healthContext.dietaryItems && Array.isArray(healthContext.dietaryItems) && healthContext.dietaryItems.length > 0) {
            fullPrompt += `- Current dietary items: ${JSON.stringify(healthContext.dietaryItems)}\n`;
          }
          if (healthContext.healthGoals && Array.isArray(healthContext.healthGoals) && healthContext.healthGoals.length > 0) {
            fullPrompt += `- Current health goals: ${JSON.stringify(healthContext.healthGoals)}\n`;
          }
          if (healthContext.healthProfile && typeof healthContext.healthProfile === 'object') {
            fullPrompt += `- Health profile: ${JSON.stringify(healthContext.healthProfile)}\n`;
          }
        }
        
        fullPrompt += `\nPlease respond as Florence, following all the rules above. Be helpful, encouraging, and provide actionable advice.`;

        // Safety check: ensure prompt is valid
        if (!fullPrompt || typeof fullPrompt !== 'string') {
          console.error('Invalid prompt generated:', fullPrompt);
          throw new Error('Failed to generate valid prompt');
        }

        console.log(`Attempt ${attempt}/${maxRetries}: Sending prompt to Gemini:`, fullPrompt.substring(0, 200) + '...');
        
        const result = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
        });
        
        console.log('Gemini API Response:', result);
        console.log('Response type:', typeof result);
        console.log('Response keys:', result ? Object.keys(result) : 'null/undefined');
        
        // Extract text from the response
        let responseText = '';
        if (result && result.candidates && result.candidates.length > 0) {
          const candidate = result.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            responseText = candidate.content.parts[0].text || '';
          }
        }
        
        // Fallback if no text found
        if (!responseText) {
          console.warn('No text found in Gemini response, using fallback');
          responseText = "I'm having trouble processing your request right now. Please try again.";
        }

        // Ensure responseText is a string
        if (typeof responseText !== 'string') {
          responseText = String(responseText);
        }
        
        // Parse response for actions
        const action = this.parseActionFromResponse(responseText, context);
        
        return {
          text: responseText,
          action,
          suggestions: this.extractSuggestions(responseText)
        };
      } catch (error: any) {
        console.error(`Gemini API Error (Attempt ${attempt}/${maxRetries}):`, error);
        
        // Check if it's a retryable error
        const isRetryableError = this.isRetryableError(error);
        
        if (attempt === maxRetries || !isRetryableError) {
          // Final attempt or non-retryable error
          return this.getFallbackResponse(error, context);
        }
        
        // Wait before retrying
        console.log(`Retrying in ${retryDelay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await this.delay(retryDelay * attempt); // Exponential backoff
      }
    }

    // This should never be reached, but just in case
    return this.getFallbackResponse(new Error('Max retries exceeded'), context);
  }

  private isRetryableError(error: any): boolean {
    // Check for specific error codes that are retryable
    if (error?.error?.code === 503 || 
        error?.error?.status === 'UNAVAILABLE' ||
        error?.error?.message?.includes('overloaded') ||
        error?.error?.message?.includes('try again later')) {
      return true;
    }
    
    // Check for network errors
    if (error?.message?.includes('network') || 
        error?.message?.includes('timeout') ||
        error?.message?.includes('connection')) {
      return true;
    }
    
    return false;
  }

  private getFallbackResponse(error: any, context: string): FlorenceResponse {
    let fallbackText = "I'm having trouble processing your request right now. ";
    
    if (error?.error?.code === 503 || error?.error?.status === 'UNAVAILABLE') {
      fallbackText += "The AI service is temporarily overloaded. Please try again in a few moments.";
    } else if (error?.error?.code === 429) {
      fallbackText += "We've reached our rate limit. Please wait a moment before trying again.";
    } else {
      fallbackText += "Please try again, or if you need immediate assistance, consider reaching out to a healthcare professional.";
    }

    const suggestions = [
      "Try again in a few moments",
      "Check your internet connection", 
      "Rephrase your question",
      "Contact support if the issue persists"
    ];

    return {
      text: fallbackText,
      suggestions
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseActionFromResponse(response: string, context: string): any {
    // Look for action indicators in the response
    if (response.toLowerCase().includes('update your dietary plan') || 
        response.toLowerCase().includes('dietary recommendations')) {
      return {
        type: 'update_dietary',
        data: { message: response }
      };
    }
    
    if (response.toLowerCase().includes('health goals') || 
        response.toLowerCase().includes('set goals')) {
      return {
        type: 'update_goals',
        data: { message: response }
      };
    }
    
    if (response.toLowerCase().includes('health profile') || 
        response.toLowerCase().includes('update your profile')) {
      return {
        type: 'update_profile',
        data: { message: response }
      };
    }
    
    if (response.toLowerCase().includes('earn haic') || 
        response.toLowerCase().includes('tokens')) {
      return {
        type: 'award_tokens',
        data: { message: response }
      };
    }
    
    return undefined;
  }

  private extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    
    // Extract bullet points or numbered items
    const lines = response.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        suggestions.push(trimmed.substring(1).trim());
      }
    });
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  async generateDietaryRecommendations(healthProfile: any): Promise<any[]> {
    // Calculate BMI for more personalized recommendations
    const bmi = healthProfile.weight && healthProfile.height 
      ? (healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)
      : null;
    
    // Determine dietary focus based on health profile
    let dietaryFocus = "balanced nutrition";
    if (healthProfile.healthConditions?.length > 0) {
      if (healthProfile.healthConditions.some((c: string) => c.toLowerCase().includes('diabetes'))) {
        dietaryFocus = "blood sugar management";
      } else if (healthProfile.healthConditions.some((c: string) => c.toLowerCase().includes('heart'))) {
        dietaryFocus = "heart health";
      } else if (healthProfile.healthConditions.some((c: string) => c.toLowerCase().includes('weight'))) {
        dietaryFocus = "weight management";
      }
    } else if (bmi && parseFloat(bmi) > 25) {
      dietaryFocus = "weight management";
    } else if (bmi && parseFloat(bmi) < 18.5) {
      dietaryFocus = "healthy weight gain";
    }

    const prompt = `You are Florence, a personalized AI nutritionist. Generate 4-6 UNIQUE, HIGHLY PERSONALIZED dietary recommendations for this specific user.

USER HEALTH PROFILE:
- Age: ${healthProfile.age || 'Not specified'}
- Gender: ${healthProfile.gender || 'Not specified'}
- Height: ${healthProfile.height || 'Not specified'} cm
- Weight: ${healthProfile.weight || 'Not specified'} kg
- BMI: ${bmi || 'Not calculated'}
- Blood Type: ${healthProfile.bloodType || 'Not specified'}
- Allergies/Dietary Restrictions: ${healthProfile.dietaryRestrictions?.join(', ') || 'None specified'}
- Health Conditions: ${healthProfile.healthConditions?.join(', ') || 'None specified'}
- Current Medications: ${healthProfile.currentMedications || 'None specified'}
- Dietary Focus: ${dietaryFocus}

EXISTING DIETARY PLANS: ${healthProfile.existingDietaryPlans?.length || 0} plans already created

PERSONALIZATION REQUIREMENTS:
1. Create UNIQUE meal combinations that this specific user hasn't seen before
2. Consider their allergies, health conditions, and medications
3. Adjust portion sizes based on their BMI and weight goals
4. Include foods that complement their blood type (if specified)
5. Avoid repeating meals from their existing dietary plans
6. Consider cultural preferences and common dietary patterns
7. Make recommendations specific to their health conditions
8. Vary meal types, cuisines, and preparation methods

Generate recommendations in this JSON format:
{
  "recommendations": [
    {
      "id": "unique_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}",
      "name": "Creative, specific meal name",
      "category": "breakfast|lunch|dinner|snack",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "isRecommended": true,
      "time": "HH:MM AM/PM",
      "reason": "Specific reason why this meal is perfect for this user's health profile, conditions, and goals"
    }
  ]
}

IMPORTANT: Make each recommendation unique and highly personalized to this specific user's health profile. Avoid generic recommendations.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      // Try to parse JSON response
      try {
        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]).recommendations || [];
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
      }

      // Fallback to default recommendations
      return this.getDefaultDietaryRecommendations();
    } catch (error) {
      console.error('Error generating dietary recommendations:', error);
      return this.getDefaultDietaryRecommendations();
    }
  }

  async generateHealthGoals(healthProfile: any): Promise<any[]> {
    // Calculate BMI and determine health focus areas
    const bmi = healthProfile.weight && healthProfile.height 
      ? (healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)
      : null;
    
    let healthFocus = "general wellness";
    if (bmi) {
      const bmiNum = parseFloat(bmi);
      if (bmiNum < 18.5) healthFocus = "healthy weight gain";
      else if (bmiNum < 25) healthFocus = "maintain healthy weight";
      else if (bmiNum < 30) healthFocus = "weight management";
      else healthFocus = "weight loss and health improvement";
    }

    // Determine priority health areas based on profile
    const priorityAreas = [];
    if (healthProfile.healthConditions?.length > 0) {
      priorityAreas.push("medical management");
    }
    if (healthProfile.age > 50) {
      priorityAreas.push("age-appropriate health maintenance");
    }
    if (healthProfile.gender === "female") {
      priorityAreas.push("women's health");
    }
    if (healthProfile.currentMedications) {
      priorityAreas.push("medication management");
    }

    const prompt = `You are Florence, a personalized AI health coach. Generate 4-6 HIGHLY PERSONALIZED health goals for this specific user.

USER HEALTH PROFILE:
- Age: ${healthProfile.age || 'Not specified'}
- Gender: ${healthProfile.gender || 'Not specified'}
- Height: ${healthProfile.height || 'Not specified'} cm
- Weight: ${healthProfile.weight || 'Not specified'} kg
- BMI: ${bmi || 'Not calculated'}
- Blood Type: ${healthProfile.bloodType || 'Not specified'}
- Health Conditions: ${healthProfile.healthConditions?.join(', ') || 'None specified'}
- Current Medications: ${healthProfile.currentMedications || 'None specified'}
- Activity Level: ${healthProfile.activityLevel || 'Not specified'}
- Health Focus: ${healthFocus}
- Priority Areas: ${priorityAreas.join(', ') || 'General wellness'}

EXISTING GOALS: ${healthProfile.currentGoals?.length || 0} goals already set

PERSONALIZATION REQUIREMENTS:
1. Create UNIQUE goals that are specific to this user's health profile
2. Consider their age, gender, BMI, and health conditions
3. Adjust difficulty and targets based on their current health status
4. Include goals that address their specific health conditions or risk factors
5. Avoid repeating goals they already have
6. Make goals relevant to their life stage and health priorities
7. Consider their blood type and any medications they're taking
8. Include both short-term (1-2 weeks) and medium-term (1-3 months) goals
9. Vary goal categories (fitness, nutrition, mental, lifestyle, medical)
10. Make each goal specific, measurable, and achievable for THIS user

Generate goals in this JSON format:
{
  "goals": [
    {
      "id": "unique_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}",
      "title": "Specific, personalized goal title",
      "description": "Detailed description explaining why this goal is important for this specific user's health profile, conditions, and goals",
      "category": "fitness|nutrition|mental|medical|lifestyle",
      "target": number,
      "unit": "steps|minutes|kg|mmHg|glasses|servings|hours|sessions|etc",
      "deadline": "YYYY-MM-DD",
      "priority": "low|medium|high",
      "reward": number,
      "reason": "Specific reason why this goal is perfect for this user's health profile, conditions, and current needs"
    }
  ]
}

IMPORTANT: Make each goal highly personalized to this specific user's health profile. Avoid generic recommendations.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      try {
        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]).goals || [];
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
      }

      return this.getDefaultHealthGoals();
    } catch (error) {
      console.error('Error generating health goals:', error);
      return this.getDefaultHealthGoals();
    }
  }

  private getDefaultDietaryRecommendations() {
    // More diverse default recommendations to avoid repetition
    const defaultMeals = [
      {
        id: "default_1",
        name: "Mediterranean Veggie Wrap with Hummus",
        category: "lunch",
        calories: 320,
        protein: 15,
        carbs: 35,
        fat: 12,
        fiber: 8,
        isRecommended: true,
        time: "12:00 PM",
        reason: "Rich in fiber and plant-based protein for sustained energy"
      },
      {
        id: "default_2",
        name: "Greek Yogurt Parfait with Mixed Berries",
        category: "breakfast",
        calories: 250,
        protein: 18,
        carbs: 30,
        fat: 6,
        fiber: 6,
        isRecommended: true,
        time: "8:00 AM",
        reason: "Probiotics and antioxidants for digestive and immune health"
      },
      {
        id: "default_3",
        name: "Asian-Inspired Tofu Stir-Fry with Brown Rice",
        category: "dinner",
        calories: 380,
        protein: 22,
        carbs: 45,
        fat: 14,
        fiber: 7,
        isRecommended: true,
        time: "6:30 PM",
        reason: "Complete plant-based protein with essential amino acids"
      },
      {
        id: "default_4",
        name: "Avocado Toast with Sprouted Bread",
        category: "breakfast",
        calories: 290,
        protein: 12,
        carbs: 28,
        fat: 16,
        fiber: 9,
        isRecommended: true,
        time: "7:30 AM",
        reason: "Healthy monounsaturated fats for heart health and satiety"
      }
    ];
    
    // Return 2-3 random meals to add variety
    return defaultMeals.sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  private getDefaultHealthGoals() {
    // More diverse default goals to provide variety
    const defaultGoals = [
      {
        id: "default_1",
        title: "Increase Daily Water Intake",
        description: "Drink at least 8 glasses of water throughout the day to stay properly hydrated and support overall health",
        category: "lifestyle",
        target: 8,
        unit: "glasses",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        priority: "medium",
        reward: 25,
        reason: "Proper hydration supports metabolism, energy levels, and overall health"
      },
      {
        id: "default_2",
        title: "Daily Mindfulness Practice",
        description: "Practice 10 minutes of mindfulness meditation or deep breathing exercises daily to reduce stress and improve mental clarity",
        category: "mental",
        target: 10,
        unit: "minutes",
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 weeks from now
        priority: "medium",
        reward: 40,
        reason: "Mindfulness reduces stress, improves focus, and supports emotional well-being"
      },
      {
        id: "default_3",
        title: "Strength Training Sessions",
        description: "Complete 2-3 strength training sessions per week to build muscle, improve bone density, and boost metabolism",
        category: "fitness",
        target: 2,
        unit: "sessions per week",
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 weeks from now
        priority: "high",
        reward: 75,
        reason: "Strength training improves muscle mass, bone health, and metabolic function"
      },
      {
        id: "default_4",
        title: "Increase Vegetable Intake",
        description: "Eat at least 5 servings of vegetables daily to boost nutrient intake and support immune function",
        category: "nutrition",
        target: 5,
        unit: "servings",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        priority: "high",
        reward: 50,
        reason: "Vegetables provide essential vitamins, minerals, and antioxidants for optimal health"
      }
    ];
    
    // Return 2-3 random goals to add variety
    return defaultGoals.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
}

export const geminiService = new GeminiService(); 