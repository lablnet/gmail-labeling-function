const { google } = require('googleapis');

const getAuthenticatedClient = async(key, user_email) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: key,
        scopes: [
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.readonly',
        ],
    });

    const authClient = await auth.getClient();
    authClient.subject = user_email;
    const gmail = google.gmail({ version: 'v1', auth: authClient });
    return { authClient, gmail };
}

module.exports = {
    getAuthenticatedClient,
}
