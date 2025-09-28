import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsconfig from '../src/aws-exports.js';

// Configure Amplify
Amplify.configure(awsconfig);

// Generate API client
const client = generateClient();

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
      firstName
      lastName
      role
      isActive
    }
  }
`;

async function updateUserRoles() {
  try {
    console.log('Updating user roles...');
    
    // Get all users
    const result = await client.graphql({
      query: listUsersQuery
    });
    
    const users = result.data.listUsers.items;
    console.log(`Found ${users.length} users`);
    
    // Find the specific users
    const userToMakeAdmin = users.find(user => user.email === 'okokohhezron254@gmail.com');
    const userToMakeExpert = users.find(user => user.email === 'nerdexpert1@gmail.com');
    
    if (!userToMakeAdmin) {
      console.log('❌ User okokohhezron254@gmail.com not found');
    } else {
      console.log(`\n📧 Found user: ${userToMakeAdmin.email}`);
      console.log(`   Current role: ${userToMakeAdmin.role}`);
      console.log(`   Name: ${userToMakeAdmin.firstName} ${userToMakeAdmin.lastName}`);
      
      // Update to admin
      try {
        const updateResult = await client.graphql({
          query: updateUserMutation,
          variables: {
            input: {
              id: userToMakeAdmin.id,
              role: 'admin'
            }
          }
        });
        
        const updatedUser = updateResult.data.updateUser;
        console.log(`   ✅ Successfully updated to admin role`);
        console.log(`   New role: ${updatedUser.role}`);
      } catch (error) {
        console.error(`   ❌ Failed to update to admin:`, error);
      }
    }
    
    if (!userToMakeExpert) {
      console.log('❌ User nerdexpert1@gmail.com not found');
    } else {
      console.log(`\n📧 Found user: ${userToMakeExpert.email}`);
      console.log(`   Current role: ${userToMakeExpert.role}`);
      console.log(`   Name: ${userToMakeExpert.firstName} ${userToMakeExpert.lastName}`);
      
      // Update to expert
      try {
        const updateResult = await client.graphql({
          query: updateUserMutation,
          variables: {
            input: {
              id: userToMakeExpert.id,
              role: 'expert'
            }
          }
        });
        
        const updatedUser = updateResult.data.updateUser;
        console.log(`   ✅ Successfully updated to expert role`);
        console.log(`   New role: ${updatedUser.role}`);
      } catch (error) {
        console.error(`   ❌ Failed to update to expert:`, error);
      }
    }
    
    console.log('\n=== Role Update Summary ===');
    console.log('Role updates completed!');
    
  } catch (error) {
    console.error('Error updating user roles:', error);
  }
}

// Run the role updates
updateUserRoles(); 