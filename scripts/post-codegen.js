import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to add missing fields to GraphQL queries
function addMissingFields() {
  const queriesPath = path.join(__dirname, '../src/graphql/queries.ts');
  
  if (!fs.existsSync(queriesPath)) {
    console.log('Queries file not found, skipping post-codegen updates');
    return;
  }

  let content = fs.readFileSync(queriesPath, 'utf8');

  // Define the user field template
  const userField = `
      user {
        id
        email
        firstName
        lastName
        phoneNumber
        dateOfBirth
        address
        city
        state
        zipCode
        emergencyContactName
        emergencyContactPhone
        allergies
        medicalConditions
        currentMedications
        height
        weight
        gender
        bloodType
        role
        isActive
        lastLoginAt
        loginCount
        preferences
        notificationSettings
        privacySettings
        subscriptionTier
        subscriptionExpiresAt
        createdAt
        updatedAt
        owner
        __typename
      }`;

  // Define the expert field template
  const expertField = `
      expert {
        id
        userId
        user {
          id
          email
          firstName
          lastName
          phoneNumber
          dateOfBirth
          address
          city
          state
          zipCode
          emergencyContactName
          emergencyContactPhone
          allergies
          medicalConditions
          currentMedications
          height
          weight
          gender
          bloodType
          role
          isActive
          lastLoginAt
          loginCount
          preferences
          notificationSettings
          privacySettings
          subscriptionTier
          subscriptionExpiresAt
          createdAt
          updatedAt
          owner
          __typename
        }
        specialization
        subSpecializations
        licenseNumber
        yearsOfExperience
        education
        certifications
        languages
        practiceName
        practiceAddress
        practicePhone
        practiceEmail
        practiceWebsite
        availability
        consultationFee
        services
        bio
        profileImage
        coverImage
        isVerified
        isActive
        verificationStatus
        createdAt
        updatedAt
        owner
        __typename
      }`;

  // Always add user field to listExperts (since it gets removed by codegen)
  if (content.includes('export const listExperts')) {
    console.log('Adding user field to listExperts...');
    
    // Find the listExperts query
    const listExpertsStart = content.indexOf('export const listExperts');
    if (listExpertsStart !== -1) {
      // Find the items block
      const itemsStart = content.indexOf('items {', listExpertsStart);
      if (itemsStart !== -1) {
        // Find userId in the items block
        const userIdPos = content.indexOf('userId', itemsStart);
        if (userIdPos !== -1) {
          // Find specialization after userId
          const specializationPos = content.indexOf('specialization', userIdPos);
          if (specializationPos !== -1) {
            // Check if user field already exists in this query
            const queryEnd = content.indexOf('}', specializationPos);
            const queryContent = content.substring(itemsStart, queryEnd);
            
            if (!queryContent.includes('user {')) {
              // Insert user field before specialization
              const beforeSpecialization = content.substring(0, specializationPos);
              const afterSpecialization = content.substring(specializationPos);
              content = beforeSpecialization + userField + '\n      ' + afterSpecialization;
              console.log('✅ Added user field to listExperts');
            } else {
              console.log('⚠️ User field already exists in listExperts');
            }
          }
        }
      }
    }
  }

  // Always add user and expert fields to listAppointments (since they get removed by codegen)
  if (content.includes('export const listAppointments')) {
    console.log('Adding user and expert fields to listAppointments...');
    
    // Find the listAppointments query
    const listAppointmentsStart = content.indexOf('export const listAppointments');
    if (listAppointmentsStart !== -1) {
      // Find the items block
      const itemsStart = content.indexOf('items {', listAppointmentsStart);
      if (itemsStart !== -1) {
        // Find followUpDate in the items block
        const followUpDatePos = content.indexOf('followUpDate', itemsStart);
        if (followUpDatePos !== -1) {
          // Find createdAt after followUpDate
          const createdAtPos = content.indexOf('createdAt', followUpDatePos);
          if (createdAtPos !== -1) {
            // Check if user field already exists in this query
            const queryEnd = content.indexOf('}', createdAtPos);
            const queryContent = content.substring(itemsStart, queryEnd);
            
            if (!queryContent.includes('user {')) {
              // Insert user and expert fields before createdAt
              const beforeCreatedAt = content.substring(0, createdAtPos);
              const afterCreatedAt = content.substring(createdAtPos);
              content = beforeCreatedAt + userField + expertField + '\n      ' + afterCreatedAt;
              console.log('✅ Added user and expert fields to listAppointments');
            } else {
              console.log('⚠️ User field already exists in listAppointments');
            }
          }
        }
      }
    }
  }

  // Remove nested fields from mutations to prevent GraphQL errors
  const mutations = ['createAppointment', 'updateAppointment', 'deleteAppointment'];
  
  mutations.forEach(mutationName => {
    if (content.includes(`export const ${mutationName}`)) {
      console.log(`Cleaning up ${mutationName} mutation...`);
      
      // Remove user and expert fields from mutations
      content = content.replace(
        new RegExp(`(export const ${mutationName} = /\\* GraphQL \\*/ \`mutation[\\s\\S]*?\\{[\s\\S]*?)(user \\{[\\s\\S]*?\\})([\\s\\S]*?\\}\`)`, 'g'),
        '$1$3'
      );
      
      content = content.replace(
        new RegExp(`(export const ${mutationName} = /\\* GraphQL \\*/ \`mutation[\\s\\S]*?\\{[\s\\S]*?)(expert \\{[\\s\\S]*?\\})([\\s\\S]*?\\}\`)`, 'g'),
        '$1$3'
      );
    }
  });

  fs.writeFileSync(queriesPath, content);
  console.log('✅ Post-codegen updates applied successfully');
}

// Run the function
addMissingFields(); 