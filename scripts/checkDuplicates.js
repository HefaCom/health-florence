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

async function checkDuplicateEmails() {
  try {
    console.log('Checking for duplicate email accounts...');
    
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
    
    console.log(`\n❌ Found ${duplicates.length} email(s) with multiple accounts:`);
    
    duplicates.forEach(([email, userList]) => {
      console.log(`\n📧 Email: ${email}`);
      console.log(`   Accounts: ${userList.length}`);
      userList.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}`);
        console.log(`      Name: ${user.firstName} ${user.lastName}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Active: ${user.isActive}`);
        console.log(`      Created: ${new Date(user.createdAt).toLocaleString()}`);
      });
    });
    
    return duplicates;
    
  } catch (error) {
    console.error('Error checking duplicates:', error);
  }
}

// Run the check
checkDuplicateEmails(); 