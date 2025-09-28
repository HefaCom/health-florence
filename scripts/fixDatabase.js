import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import awsconfig from '../src/aws-exports.js';

// Create DynamoDB client
const client = new DynamoDBClient({
  region: awsconfig.aws_project_region
});

const docClient = DynamoDBDocumentClient.from(client);

// Get the table name from the environment
const tableName = `User-${awsconfig.aws_user_pools_id.split('_')[1]}-${awsconfig.aws_user_pools_id.split('_')[2]}`;

async function fixDatabaseRecords() {
  try {
    console.log('Starting database fix for existing users...');
    console.log(`Using table: ${tableName}`);
    
    // Scan all users
    const scanCommand = new ScanCommand({
      TableName: tableName
    });
    
    const result = await docClient.send(scanCommand);
    const users = result.Items || [];
    
    console.log(`Found ${users.length} users to fix`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        const updateExpressions = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};
        
        // Check and fix role
        if (!user.role) {
          updateExpressions.push('#role = :role');
          expressionAttributeNames['#role'] = 'role';
          expressionAttributeValues[':role'] = 'user';
          console.log(`Setting default role 'user' for ${user.email}`);
        }
        
        // Check and fix isActive
        if (user.isActive === undefined || user.isActive === null) {
          updateExpressions.push('#isActive = :isActive');
          expressionAttributeNames['#isActive'] = 'isActive';
          expressionAttributeValues[':isActive'] = true;
          console.log(`Setting default isActive true for ${user.email}`);
        }
        
        // Check and fix loginCount
        if (user.loginCount === undefined || user.loginCount === null) {
          updateExpressions.push('#loginCount = :loginCount');
          expressionAttributeNames['#loginCount'] = 'loginCount';
          expressionAttributeValues[':loginCount'] = 0;
          console.log(`Setting default loginCount 0 for ${user.email}`);
        }
        
        // Check and fix subscriptionTier
        if (!user.subscriptionTier) {
          updateExpressions.push('#subscriptionTier = :subscriptionTier');
          expressionAttributeNames['#subscriptionTier'] = 'subscriptionTier';
          expressionAttributeValues[':subscriptionTier'] = 'basic';
          console.log(`Setting default subscriptionTier 'basic' for ${user.email}`);
        }
        
        // Check and fix preferences
        if (!user.preferences) {
          updateExpressions.push('#preferences = :preferences');
          expressionAttributeNames['#preferences'] = 'preferences';
          expressionAttributeValues[':preferences'] = {};
          console.log(`Setting default preferences for ${user.email}`);
        }
        
        // Check and fix notificationSettings
        if (!user.notificationSettings) {
          updateExpressions.push('#notificationSettings = :notificationSettings');
          expressionAttributeNames['#notificationSettings'] = 'notificationSettings';
          expressionAttributeValues[':notificationSettings'] = {
            email: true,
            push: true,
            sms: false
          };
          console.log(`Setting default notificationSettings for ${user.email}`);
        }
        
        // Check and fix privacySettings
        if (!user.privacySettings) {
          updateExpressions.push('#privacySettings = :privacySettings');
          expressionAttributeNames['#privacySettings'] = 'privacySettings';
          expressionAttributeValues[':privacySettings'] = {
            profileVisibility: 'private',
            healthDataSharing: false
          };
          console.log(`Setting default privacySettings for ${user.email}`);
        }
        
        // Only update if there are fields to fix
        if (updateExpressions.length > 0) {
          const updateCommand = new UpdateCommand({
            TableName: tableName,
            Key: {
              id: user.id
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
          });
          
          await docClient.send(updateCommand);
          successCount++;
          console.log(`✅ Successfully fixed user: ${user.email}`);
        } else {
          console.log(`⏭️  No fixes needed for user: ${user.email}`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to fix user ${user.email}:`, error);
      }
    }
    
    console.log('\n=== Database Fix Summary ===');
    console.log(`Total users processed: ${users.length}`);
    console.log(`Successfully fixed: ${successCount}`);
    console.log(`Failed to fix: ${errorCount}`);
    console.log('Database fix completed!');
    
  } catch (error) {
    console.error('Database fix failed:', error);
  }
}

// Run the fix
fixDatabaseRecords(); 