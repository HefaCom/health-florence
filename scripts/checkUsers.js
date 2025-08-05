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
        loginCount
        createdAt
        updatedAt
      }
    }
  }
`;

async function checkUsers() {
  try {
    console.log('Checking all users in database...');
    
    const result = await client.graphql({
      query: listUsersQuery
    });
    
    const users = result.data.listUsers.items;
    console.log(`Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Login Count: ${user.loginCount}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
      console.log(`   Updated: ${new Date(user.updatedAt).toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

// Run the check
checkUsers(); 