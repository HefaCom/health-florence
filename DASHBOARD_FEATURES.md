# Health Florence Dashboard Features

## Overview
The Health Florence application now includes three new major dashboard sections that integrate with Florence AI to provide personalized health recommendations and gamified healthcare experiences.

## New Dashboard Components

### 1. Dietary Plan Section
**Location**: Sidebar navigation → "Dietary Plan" tab
**Purpose**: Personalized nutrition recommendations and meal tracking

**Features**:
- AI-generated dietary recommendations based on health profile
- Meal categorization (breakfast, lunch, dinner, snack)
- Nutritional information (calories, protein, carbs, fat, fiber)
- Progress tracking with completion status
- Integration with Florence AI for updates

**Florence Integration**:
- Users can ask Florence for dietary recommendations
- Florence analyzes health profile to suggest personalized meals
- Automatic updates to dietary plan based on health conditions
- Nutritional guidance for specific health goals

### 2. Health Goals Section
**Location**: Sidebar navigation → "Health Goals" tab
**Purpose**: Goal setting, progress tracking, and HAIC token rewards

**Features**:
- Multiple goal categories (fitness, nutrition, mental, medical, lifestyle)
- Progress tracking with visual indicators
- Priority levels (low, medium, high)
- Deadline management
- HAIC token rewards for goal completion
- AI-recommended goals based on health profile

**Florence Integration**:
- Florence suggests personalized health goals
- Automatic goal recommendations based on medical conditions
- Progress monitoring and encouragement
- HAIC token distribution upon goal completion

### 3. Health Profile Section
**Location**: Sidebar navigation → "Health Profile" tab
**Purpose**: Comprehensive health information with privacy controls

**Features**:
- Basic health metrics (height, weight, gender, date of birth)
- BMI calculation and categorization
- Health conditions tracking
- Allergies management
- Emergency contact information
- Privacy toggle for sensitive information
- Blood type and medical history

**Privacy Considerations**:
- Default private mode for sensitive information
- User-controlled visibility settings
- Masked display of personal health data
- Secure storage and transmission

**Florence Integration**:
- Florence can update health profile based on conversations
- AI analysis of health trends
- Personalized recommendations based on profile data
- Automatic health insights generation

## HAIC Token Integration

### Earning Opportunities
Users can earn HAIC tokens through various health activities:

1. **Complete Health Goals**: 25-100 HAIC per goal
2. **Follow Dietary Plan**: 10-50 HAIC per adherence period
3. **Attend Appointments**: 30-75 HAIC per appointment
4. **Daily Health Check-ins**: 5-15 HAIC per check-in

### XRPL Integration
- Current XRPL wallet connection for token management
- Transfer functionality to other XRPL addresses
- Real-time balance updates
- Transaction history tracking

### Future Enhancements
- Joey Wallet integration (when available)
- Direct wallet connection for users
- Automated token distribution
- Smart contract integration for rewards

## Florence AI Integration

### Natural Language Processing
Florence can understand and respond to:
- Dietary requests ("I need diet recommendations")
- Goal setting ("Help me set fitness goals")
- Health profile updates ("Update my health information")
- Reward inquiries ("How can I earn more HAIC?")

### AI-Powered Features
- Personalized dietary recommendations
- Health goal suggestions based on medical conditions
- Health profile analysis and insights
- Progress monitoring and encouragement
- Automatic HAIC reward distribution

## Technical Implementation

### Components Structure
```
src/components/dashboard/
├── DietaryPlan.tsx      # Dietary recommendations component
├── HealthGoals.tsx      # Health goals tracking component
├── HealthProfile.tsx    # Health information component
├── TokenRewards.tsx     # HAIC token management
├── HealthMetric.tsx     # Health metrics display
├── MedicationReminder.tsx # Medication tracking
└── AppointmentCard.tsx  # Appointment management
```

### Page Structure
```
src/pages/
├── Index.tsx            # Main dashboard with quick access cards
├── DietaryPlan.tsx      # Full-screen dietary plan page
├── HealthGoals.tsx      # Full-screen health goals page
├── HealthProfile.tsx    # Full-screen health profile page
├── Appointments.tsx     # Appointment management
├── FindDoctor.tsx       # Doctor search
├── Insurance.tsx        # Insurance management
└── Profile.tsx          # User profile
```

### Services
```
src/services/
├── florence.service.ts  # Florence AI integration
├── xrpl.service.ts      # XRPL blockchain integration
└── audit.service.ts     # Audit trail management
```

### Data Models
The GraphQL schema includes new types:
- `DietaryPlan`: Meal recommendations and tracking
- `HealthGoal`: Goal setting and progress
- `HealthCondition`: Medical conditions and history
- `HAICReward`: Token rewards and transactions

## Usage Instructions

### For Users
1. **Access New Features**: Use the sidebar navigation to access Dietary Plan, Health Goals, and Health Profile
2. **Dietary Plan**: Navigate to "Dietary Plan" tab and ask Florence "I need dietary recommendations"
3. **Health Goals**: Navigate to "Health Goals" tab and request "Help me set health goals"
4. **Health Profile**: Navigate to "Health Profile" tab and use "Update my health profile"
5. **HAIC Rewards**: Complete goals and activities to earn tokens
6. **Quick Access**: Use the quick access cards on the main dashboard for easy navigation

### For Developers
1. **Component Integration**: Import and use the new dashboard components
2. **Florence Service**: Use `florenceService` for AI interactions
3. **XRPL Integration**: Leverage existing XRPL context for token management
4. **Data Management**: Use GraphQL mutations for data persistence

## Privacy and Security

### Data Protection
- Health information is stored securely with user authentication
- Privacy controls allow users to hide sensitive information
- All data transmission is encrypted
- User consent required for data sharing

### Compliance
- HIPAA-compliant data handling
- User data ownership and control
- Audit trails for all health-related actions
- Secure token management

## Future Roadmap

### Short-term Goals
- Enhanced Florence AI responses
- More detailed health analytics
- Improved XRPL integration
- Mobile app development

### Long-term Vision
- Joey Wallet full integration
- Advanced AI health insights
- Blockchain-based health records
- Global health token ecosystem

## Support and Documentation

For technical support or feature requests, please refer to:
- Component documentation in code comments
- GraphQL schema definitions
- Service integration examples
- User interface guidelines 