const { google } = require('googleapis');

const getAuthenticatedClient = async(user_email) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_KEY_FILE,
        scopes: [
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.readonly',
        ],
    });

    const authClient = await auth.getClient();
    authClient.subject = user_email;

    return authClient;
}

module.exports = {
    getAuthenticatedClient,
}
