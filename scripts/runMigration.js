import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsconfig from '../src/aws-exports.js';

// Configure Amplify
Amplify.configure(awsconfig);

// Generate API client
const client = generateClient();

// GraphQL operations
const listUsersQuery = `
  query ListUsers {
    listUsers {
      items {
        id
        email
        firstName
        lastName
        role
        isActive
        loginCount
        subscriptionTier
        preferences
        notificationSettings
        privacySettings
        createdAt
        updatedAt
      }
    }
  }
`;

const updateUserMutation = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      email
      role
      isActive
      loginCount
      subscriptionTier
    }
  }
`;

async function migrateExistingUsers() {
  try {
    console.log('Starting migration of existing users...');
    
    // Get all existing users
    const result = await client.graphql({
      query: listUsersQuery
    });
    const users = result.data.listUsers.items;
    
    console.log(`Found ${users.length} users to migrate`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        // Prepare update data with default values for missing required fields
        const updateData = {
          id: user.id
        };
        
        // Set default role if missing
        if (!user.role) {
          updateData.role = 'user';
          console.log(`Setting default role 'user' for ${user.email}`);
        }
        
        // Set default isActive if missing
        if (user.isActive === undefined || user.isActive === null) {
          updateData.isActive = true;
          console.log(`Setting default isActive true for ${user.email}`);
        }
        
        // Set default loginCount if missing
        if (user.loginCount === undefined || user.loginCount === null) {
          updateData.loginCount = 0;
          console.log(`Setting default loginCount 0 for ${user.email}`);
        }
        
        // Set default subscriptionTier if missing
        if (!user.subscriptionTier) {
          updateData.subscriptionTier = 'basic';
          console.log(`Setting default subscriptionTier 'basic' for ${user.email}`);
        }
        
        // Set default preferences if missing
        if (!user.preferences) {
          updateData.preferences = {};
          console.log(`Setting default preferences for ${user.email}`);
        }
        
        // Set default notificationSettings if missing
        if (!user.notificationSettings) {
          updateData.notificationSettings = {
            email: true,
            push: true,
            sms: false
          };
          console.log(`Setting default notificationSettings for ${user.email}`);
        }
        
        // Set default privacySettings if missing
        if (!user.privacySettings) {
          updateData.privacySettings = {
            profileVisibility: 'private',
            healthDataSharing: false
          };
          console.log(`Setting default privacySettings for ${user.email}`);
        }
        
        // Only update if there are fields to update
        if (Object.keys(updateData).length > 1) { // More than just the id
          await client.graphql({
            query: updateUserMutation,
            variables: { input: updateData }
          });
          successCount++;
          console.log(`✅ Successfully migrated user: ${user.email}`);
        } else {
          console.log(`⏭️  No migration needed for user: ${user.email}`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate user ${user.email}:`, error);
      }
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total users processed: ${users.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed to migrate: ${errorCount}`);
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateExistingUsers(); 