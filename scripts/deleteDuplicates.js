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

const deleteUserMutation = `
  mutation DeleteUser($input: DeleteUserInput!) {
    deleteUser(input: $input) {
      id
      email
    }
  }
`;

async function deleteDuplicateAccounts() {
  try {
    console.log('Starting duplicate account cleanup...');
    
    const result = await client.graphql({
      query: listUsersQuery
    });
    
    const users = result.data.listUsers.items;
    console.log(`Found ${users.length} total users`);
    
    // Group users by email
    const emailGroups = {};
    users.forEach(user => {
      if (!emailGroups[user.email]) {
        emailGroups[user.email] = [];
      }
      emailGroups[user.email].push(user);
    });
    
    // Find emails with multiple accounts
    const duplicates = Object.entries(emailGroups).filter(([email, userList]) => userList.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate email accounts found');
      return;
    }
    
    console.log(`\n❌ Found ${duplicates.length} email(s) with multiple accounts to clean up:`);
    
    let totalDeleted = 0;
    
    for (const [email, userList] of duplicates) {
      console.log(`\n📧 Processing email: ${email}`);
      console.log(`   Total accounts: ${userList.length}`);
      
      // Sort by creation date (newest first)
      const sortedUsers = userList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Keep the most recent account (first in sorted array)
      const keepUser = sortedUsers[0];
      const deleteUsers = sortedUsers.slice(1);
      
      console.log(`   Keeping: ${keepUser.id} (created: ${new Date(keepUser.createdAt).toLocaleString()})`);
      console.log(`   Deleting: ${deleteUsers.length} duplicate account(s)`);
      
      // Delete duplicate accounts
      for (const userToDelete of deleteUsers) {
        try {
          console.log(`   🗑️  Deleting account: ${userToDelete.id}`);
          
          await client.graphql({
            query: deleteUserMutation,
            variables: { input: { id: userToDelete.id } }
          });
          
          totalDeleted++;
          console.log(`   ✅ Successfully deleted: ${userToDelete.id}`);
          
        } catch (error) {
          console.error(`   ❌ Failed to delete ${userToDelete.id}:`, error);
        }
      }
    }
    
    console.log(`\n=== Cleanup Summary ===`);
    console.log(`Total duplicate accounts deleted: ${totalDeleted}`);
    console.log(`Cleanup completed!`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
deleteDuplicateAccounts(); 