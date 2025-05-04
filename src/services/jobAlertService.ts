import { DynamoDBClient, ScanCommand, DeleteItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

// Get environment variables
const AWS_REGION ="region"; // Replace with your actual region
const AWS_ACCESS_KEY ="Your Key Here";
const AWS_SECRET_KEY ="Your Key Here"; // Replace with your actual secret key

export interface JobAlert {
  User_id: string;  // Changed from alert_id to User_id to match schema
  keyword: string;
  location: string;
  email: string;
  timestamp: string;
}

// Initialize DynamoDB client
const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY || '',
    secretAccessKey: AWS_SECRET_KEY || ''
  }
});

const TableName = 'Job_Alerts';

export const jobAlertService = {
  async createJobAlert(alertData: Omit<JobAlert, 'User_id' | 'timestamp'>): Promise<JobAlert> {
    const timestamp = new Date().toISOString();
    // Generate a unique ID using UUID format (similar to what's shown in your table)
    const User_id = `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 8)}`;

    const Item = marshall({
      User_id,
      ...alertData,
      timestamp
    });

    const params = {
      TableName,
      Item,
    };

    try {
      const command = new PutItemCommand(params);
      await dynamoDBClient.send(command);
      return { User_id, ...alertData, timestamp };
    } catch (error) {
      console.error('Error creating alert:', error);
      throw new Error('Failed to create job alert');
    }
  },

  async getUserAlerts(email: string): Promise<JobAlert[]> {
    const params = {
      TableName,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: marshall({
        ':email': email
      })
    };

    try {
      const command = new ScanCommand(params);
      const result = await dynamoDBClient.send(command);
      if (!result.Items) {
        return [];
      }
      return result.Items.map((item) => unmarshall(item) as JobAlert);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw new Error('Failed to fetch job alerts');
    }
  },

  async deleteJobAlert(User_id: string, email: string): Promise<void> {
    const params = {
      TableName,
      Key: marshall({
        User_id  // This is the primary key in your table
      }),
      // Keep the conditional check to ensure the user only deletes their own alerts
      ConditionExpression: 'email = :email',
      ExpressionAttributeValues: marshall({
        ':email': email
      })
    };

    try {
      const command = new DeleteItemCommand(params);
      await dynamoDBClient.send(command);
    } catch (error) {
      console.error('Error deleting alert:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Alert not found or you do not have permission to delete it');
      }
      throw new Error('Failed to delete job alert');
    }
  }
};