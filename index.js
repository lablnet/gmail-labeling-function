const { google } = require('googleapis');
const axios = require('axios');
const gmail = google.gmail('v1');
const path = require('path');

// Load environment variables from .env file if running locally
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Configuration for OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/engines/gpt-4/completions';

// Service Account Key file.
const SERVICE_ACCOUNT_KEY_FILE = path.join(__dirname, 'service-account-key.json');

// Function to call OpenAI API
async function classifyEmail(subject, body) {
    const prompt = `
    Classify the following email into one of these categories: freelancer-upwork, freelancer-freelancer, freelancer-fiverr, client, friend, github-repo, urgent, no-filter.
    Email Subject: ${subject}
    Email Body: ${body}
    Category:
    `;

    const response = await axios.post(OPENAI_API_URL, {
        prompt: prompt,
        max_tokens: 10,
        n: 1,
        stop: null,
        temperature: 0.5,
    }, {
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        }
    });

    const classification = response.data.choices[0].text.trim();
    return classification;
}

exports.labelEmail = async (event, context) => {
    const pubsubMessage = event.data;
    const message = Buffer.from(pubsubMessage, 'base64').toString();
    const messageData = JSON.parse(message);

    // Extract email ID from message
    const emailId = messageData.emailId;

    // Authenticate using service account key
    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/gmail.modify'],
    });

    const authClient = await auth.getClient();

    try {
        // Get the email content
        const email = await gmail.users.messages.get({
            userId: 'me',
            id: emailId,
            auth: authClient
        });

        const emailSubject = email.data.payload.headers.find(header => header.name === 'Subject').value;
        const emailBody = email.data.snippet;

        // Determine label using GPT-4
        let label = await classifyEmail(emailSubject, emailBody);

        // Fallback to no-filter if GPT-4 fails to classify
        if (!['freelancer-upwork', 'freelancer-freelancer', 'freelancer-fiverr', 'client', 'friend', 'github-repo', 'urgent'].includes(label)) {
            label = 'no-filter';
        }

        // Apply the label to the email
        await gmail.users.messages.modify({
            userId: 'me',
            id: emailId,
            auth: authClient,
            requestBody: {
                addLabelIds: [label]
            }
        });

        console.log(`Email ${emailId} labeled as ${label}`);
    } catch (error) {
        console.error(`Failed to label email ${emailId}:`, error);
    }
};
