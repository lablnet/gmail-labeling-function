const { decode } = require('js-base64');

/**
 * Fetches the details of a Gmail message.
 * 
 * @param {object} gmail The Gmail API client
 * @param {string} messageId The ID of the message to fetch
 * 
 * @returns {Promise<object>} The message details
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const fetchMessageDetails = async (gmail, messageId) => {
    try {
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching message details for ID ${messageId}:`, error);
    }
}

/**
 * Decodes a base64 URL string.
 * 
 * @param {string} base64Url The base64 URL string to decode
 * 
 * @returns {string} The decoded string
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const decodeBase64Url = (base64Url) => {
    // Replace URL-safe characters with base64 characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Decode base64
    return decode(base64);
}

/**
 * Extracts the body of an email from the payload.
 * 
 * @param {object} payload The payload of the email
 * 
 * @returns {object} The email body
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const extractEmailBody = (payload) => {
    const parts = payload.parts || [];
    for (const part of parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
            const bodyData = part.body.data;
            if (bodyData) {
                const decodedBody = decodeBase64Url(bodyData);
                return { mimeType: part.mimeType, body: decodedBody };
            }
        }
    }
    return null;
}

/**
 * Extracts the subject of an email from the payload.
 * 
 * @param {object} payload The payload of the email
 * 
 * @returns {string} The email subject
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const extractEmailSubject = (payload) => {
    const headers = payload.headers || [];
    for (const header of headers) {
        if (header.name.toLowerCase() === 'subject') {
            return header.value;
        }
    }
    return null;
}

module.exports = {
    fetchMessageDetails,
    extractEmailBody,
    extractEmailSubject,
}
