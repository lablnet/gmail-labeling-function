const { decode } = require('js-base64');

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

const decodeBase64Url = (base64Url) => {
    // Replace URL-safe characters with base64 characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Decode base64
    return decode(base64);
}

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
    decodeBase64Url,
    extractEmailBody,
    extractEmailSubject,
}
