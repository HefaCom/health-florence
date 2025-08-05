# Florence AI - Gemini Integration

## Overview

Florence is now powered by Google's Gemini AI, providing intelligent, context-aware health assistance with clear safety guidelines and comprehensive functionality.

## 🔧 **Technical Implementation**

### **Core Services**

#### **1. Gemini Service (`src/services/gemini.service.ts`)**
- **API Integration**: Direct integration with Google Gemini API
- **Model**: `gemini-2.0-flash-exp` for optimal performance
- **Safety Settings**: Comprehensive content filtering
- **Context Management**: Health-aware response generation

#### **2. Florence Service (`src/services/florence.service.ts`)**
- **AI Orchestration**: Manages Gemini interactions
- **Response Processing**: Handles AI responses and actions
- **Error Handling**: Graceful fallbacks and user feedback
- **Integration Layer**: Connects AI with UI components

### **API Configuration**

```typescript
// Gemini API Setup
const ai = new GoogleGenAI({
  apiKey: "AIzaSyCoenWxsPKbBeg6oK7ubKbxHLRrFxbqA5Q"
});

// Model Configuration
const response = await this.model({
  model: "gemini-2.0-flash-exp",
  contents: fullPrompt,
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1000,
  },
  safetySettings: [
    // Comprehensive safety filters
  ]
});
```

## 🧠 **AI Rules & Guidelines**

### **Core Identity**
- **Compassionate Health Assistant**: Warm, supportive, professional
- **No Medical Diagnosis**: Never provides medical diagnosis or treatment
- **Safety First**: Always recommends healthcare professionals for medical concerns
- **Educational Focus**: Provides general health information and wellness tips

### **Safety Rules**
```
❌ NEVER diagnose medical conditions
❌ NEVER prescribe medications  
❌ NEVER provide specific medical treatment advice
✅ ALWAYS recommend consulting doctors for medical concerns
✅ ALWAYS prioritize safety over other concerns
```

### **Health Guidelines**
- **Dietary Assistance**: Nutrition advice, meal suggestions, dietary planning
- **Goal Setting**: SMART health goals with realistic timelines
- **Health Profile**: Understanding metrics and wellness insights
- **HAIC Tokens**: Gamification and reward explanations

## 🎯 **Context-Aware Responses**

### **Dietary Context**
```typescript
const dietaryContext = {
  systemPrompt: "Focus on balanced nutrition and healthy eating habits",
  examples: [
    "I need help with my diet",
    "What should I eat for breakfast?"
  ]
};
```

### **Goals Context**
```typescript
const goalsContext = {
  systemPrompt: "Help users set SMART health goals",
  examples: [
    "I want to get healthier",
    "I want to lose weight"
  ]
};
```

### **Profile Context**
```typescript
const profileContext = {
  systemPrompt: "Help users understand health metrics",
  examples: [
    "What does my BMI mean?",
    "How can I improve my blood pressure?"
  ]
};
```

## 🔄 **Response Processing**

### **Response Structure**
```typescript
interface FlorenceResponse {
  text: string;                    // AI-generated response
  action?: {                       // Optional action to trigger
    type: 'update_dietary' | 'update_goals' | 'update_profile' | 'award_tokens';
    data?: any;
  };
  suggestions?: string[];          // Extracted suggestions
}
```

### **Action Detection**
- **Dietary Updates**: "update your dietary plan", "dietary recommendations"
- **Goal Updates**: "health goals", "set goals"
- **Profile Updates**: "health profile", "update your profile"
- **Token Awards**: "earn haic", "tokens"

## 🎨 **UI Integration**

### **Chat Interface**
- **Real-time AI Responses**: Instant Florence responses
- **Loading States**: "Florence is thinking..." feedback
- **Error Handling**: Graceful error messages
- **Action Triggers**: Automatic UI updates based on AI actions

### **Dashboard Components**
- **DietaryPlan**: AI-powered meal recommendations
- **HealthGoals**: Intelligent goal suggestions
- **HealthProfile**: Context-aware health insights
- **TokenRewards**: Gamification explanations

## 🚀 **Features**

### **1. Intelligent Conversations**
- **Natural Language Processing**: Understands user intent
- **Context Awareness**: Remembers conversation context
- **Personalized Responses**: Tailored to user's health profile
- **Multi-turn Conversations**: Maintains conversation flow

### **2. Health Recommendations**
- **Dietary Planning**: Personalized meal suggestions
- **Goal Setting**: SMART health objectives
- **Progress Tracking**: Motivation and encouragement
- **Wellness Insights**: Health metric explanations

### **3. Safety & Compliance**
- **Medical Safety**: Never provides medical advice
- **Content Filtering**: Comprehensive safety settings
- **Emergency Responses**: Crisis intervention guidance
- **Professional Boundaries**: Clear role definition

### **4. Gamification Integration**
- **HAIC Token Explanations**: How to earn rewards
- **Goal Achievement**: Celebration and motivation
- **Progress Tracking**: Milestone recognition
- **Engagement**: Encouraging healthy habits

## 📊 **Performance & Reliability**

### **Error Handling**
```typescript
try {
  const response = await geminiService.generateFlorenceResponse(message, context);
  return response;
} catch (error) {
  console.error('Gemini API Error:', error);
  return {
    text: "I'm having trouble processing your request right now. Please try again.",
    suggestions: ["Try rephrasing your question", "Check your internet connection"]
  };
}
```

### **Fallback Mechanisms**
- **Default Responses**: Pre-defined helpful responses
- **Graceful Degradation**: Service continues without AI
- **User Feedback**: Clear error messages
- **Retry Logic**: Automatic retry on failures

### **Rate Limiting**
- **API Quotas**: Respects Gemini API limits
- **Request Throttling**: Prevents excessive API calls
- **Caching**: Reduces redundant requests
- **Optimization**: Efficient prompt engineering

## 🔒 **Security & Privacy**

### **Data Protection**
- **No Medical Data Storage**: AI doesn't store sensitive health information
- **Secure API Communication**: Encrypted API calls
- **User Consent**: Clear data usage policies
- **Privacy Compliance**: HIPAA-aware implementation

### **Content Safety**
```typescript
safetySettings: [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH", 
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  }
]
```

## 🛠 **Usage Examples**

### **Dietary Assistance**
```
User: "I need help with my diet"
Florence: "I'd be happy to help you with your dietary plan! To provide the best recommendations, could you tell me a bit about your current eating habits, any health goals you have, and any dietary restrictions or preferences?"
```

### **Goal Setting**
```
User: "I want to get healthier"
Florence: "That's a wonderful goal! Let's make it more specific and achievable. Here are some areas we could focus on:
• Physical Activity: Start with 10-15 minutes of walking daily
• Nutrition: Add one extra serving of vegetables to your meals
• Sleep: Aim for 7-8 hours of quality sleep
• Stress Management: Practice 5 minutes of deep breathing daily"
```

### **Health Profile**
```
User: "What does my BMI mean?"
Florence: "BMI (Body Mass Index) is a general indicator of body composition based on your height and weight. Here's what the ranges typically mean:
• Underweight: Below 18.5 - May need to gain weight healthily
• Normal: 18.5-24.9 - Generally healthy range
• Overweight: 25-29.9 - May benefit from lifestyle improvements
• Obese: 30+ - May need medical guidance for health improvements"
```

## 🔮 **Future Enhancements**

### **Planned Features**
- **Voice Integration**: Speech-to-text and text-to-speech
- **Image Analysis**: Food photo recognition for dietary tracking
- **Predictive Analytics**: Health trend predictions
- **Multi-language Support**: International health assistance
- **Advanced Personalization**: Machine learning user preferences

### **Integration Opportunities**
- **Wearable Devices**: Real-time health data integration
- **Telemedicine**: Doctor consultation coordination
- **Pharmacy Integration**: Medication reminders and interactions
- **Fitness Apps**: Cross-platform health tracking
- **Social Features**: Community health challenges

## 📚 **API Reference**

### **Gemini Service Methods**
```typescript
// Generate Florence response
generateFlorenceResponse(message: string, context: string, healthContext?: HealthContext)

// Generate dietary recommendations
generateDietaryRecommendations(healthProfile: any): Promise<DietaryRecommendation[]>

// Generate health goals
generateHealthGoals(healthProfile: any): Promise<HealthGoalRecommendation[]>
```

### **Florence Service Methods**
```typescript
// Process user requests
processUserRequest(userMessage: string, context: any): Promise<FlorenceResponse>

// Generate recommendations
generateDietaryRecommendations(healthProfile: any): Promise<DietaryRecommendation[]>
generateHealthGoals(healthProfile: any, currentGoals: any[]): Promise<HealthGoalRecommendation[]>

// Award tokens
awardHAICTokens(reward: HAICReward): Promise<boolean>
```

## 🎯 **Best Practices**

### **For Developers**
1. **Always handle errors gracefully**
2. **Provide clear user feedback**
3. **Respect API rate limits**
4. **Test with various user inputs**
5. **Monitor AI response quality**

### **For Users**
1. **Be specific with questions**
2. **Provide context when needed**
3. **Follow up on recommendations**
4. **Consult healthcare professionals for medical concerns**
5. **Use Florence as a wellness companion, not medical advisor**

## 🔗 **Resources**

- **Gemini API Documentation**: [https://ai.google.dev/gemini-api/docs#javascript](https://ai.google.dev/gemini-api/docs#javascript)
- **Health Florence Documentation**: See `DASHBOARD_FEATURES.md`
- **Safety Guidelines**: See AI rules in `gemini.service.ts`
- **Component Documentation**: See individual component files

---

**Florence AI is designed to be your supportive health companion, providing guidance, motivation, and insights while always prioritizing your safety and well-being.** 