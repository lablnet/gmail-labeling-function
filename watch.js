const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_KEY_FILE = path.join(__dirname, 'service-account-key.json');
const USER_EMAIL = 'umer@lablnet.com';
const TOPIC_NAME = `projects/lablnet-86a04/topics/email-labeling`;

async function initializeGmailAndPubSub() {
  const keyFileContent = fs.readFileSync(SERVICE_ACCOUNT_KEY_FILE, 'utf8');
  const keyFile = JSON.parse(keyFileContent);

  if (!keyFile.client_email) {
    throw new Error('Invalid service account key file: missing client_email.');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/pubsub'],
  });

  const client = await auth.getClient();
  const jwtClient = new google.auth.JWT({
    email: keyFile.client_email,
    key: keyFile.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/pubsub'],
    subject: USER_EMAIL,
  });

  const gmail = google.gmail({ version: 'v1', auth: jwtClient });
  const pubsub = google.pubsub({ version: 'v1', auth: jwtClient });

  return { gmail, pubsub };
}

async function watchGmail() {
  try {
    const { gmail, pubsub } = await initializeGmailAndPubSub();

    try {
      const topicResponse = await pubsub.projects.topics.get({ topic: TOPIC_NAME });
      console.log('Pub/Sub topic details:', topicResponse.data);
    } catch (error) {
      throw new Error(`Failed to verify Pub/Sub topic: ${error.message}`);
    }

    const res = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: TOPIC_NAME,
      },
    });
    console.log('Watch response:', res.data);
  } catch (error) {
    console.error('Error watching Gmail:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

async function listLabels() {
  try {
    const { gmail } = await initializeGmailAndPubSub();
    const res = await gmail.users.labels.list({ userId: 'me' });
    console.log('Labels:', res.data.labels);
  } catch (error) {
    console.error('Error listing labels:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

async function testPubSubPublish() {
  try {
    const { pubsub } = await initializeGmailAndPubSub();

    const data = Buffer.from('Test message').toString('base64');
    const res = await pubsub.projects.topics.publish({
      topic: TOPIC_NAME,
      requestBody: {
        messages: [{ data: data }],
      },
    });
    console.log('Pub/Sub publish response:', res.data);
  } catch (error) {
    console.error('Error publishing to Pub/Sub:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

listLabels();
testPubSubPublish();
watchGmail();
