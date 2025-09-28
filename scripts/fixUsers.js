import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsconfig from '../src/aws-exports.js';

// Configure Amplify
Amplify.configure(awsconfig);

// Generate API client
const client = generateClient();

// Simple query to get users without the problematic fields
const listUsersQuery = `
  query ListUsers {
    listUsers {
      items {
        id
        email
        firstName
        lastName
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

async function fixUsers() {
  try {
    console.log('Starting user fix...');
    
    // Get all users with minimal fields
    const result = await client.graphql({
      query: listUsersQuery
    });
    
    const users = result.data.listUsers.items;
    console.log(`Found ${users.length} users to fix`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        // Update each user with the required fields
        const updateData = {
          id: user.id,
          role: 'user',
          isActive: true,
          loginCount: 0,
          subscriptionTier: 'basic',
          preferences: JSON.stringify({}),
          notificationSettings: JSON.stringify({
            email: true,
            push: true,
            sms: false
          }),
          privacySettings: JSON.stringify({
            profileVisibility: 'private',
            healthDataSharing: false
          })
        };
        
        await client.graphql({
          query: updateUserMutation,
          variables: { input: updateData }
        });
        
        successCount++;
        console.log(`✅ Successfully fixed user: ${user.email}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to fix user ${user.email}:`, error);
      }
    }
    
    console.log('\n=== Fix Summary ===');
    console.log(`Total users processed: ${users.length}`);
    console.log(`Successfully fixed: ${successCount}`);
    console.log(`Failed to fix: ${errorCount}`);
    console.log('Fix completed!');
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
}

// Run the fix
fixUsers(); 