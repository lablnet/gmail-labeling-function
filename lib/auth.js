const { google } = require('googleapis');

/**
 * Gets an authenticated Gmail API client.
 * 
 * @param {object} key - The service account key.
 * @param {string} user_email - The email address of the user to impersonate.
 * 
 * @returns {object} The authenticated Gmail API client.
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const getAuthenticatedClient = async(key, user_email) => {
    const auth = new google.auth.GoogleAuth({
        credentials: key,
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
