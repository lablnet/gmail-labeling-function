
/**
 * Function to create a label in Gmail
 * 
 * @param {object} gmail The Gmail API client
 * @param {string} labelName The name of the label to create
 * 
 * @returns {Promise<string>} The ID of the created label
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const createLabel = async (gmail, labelName) => {
    try {
        const labelResponse = await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
                name: labelName,
                messageListVisibility: 'show',
                labelListVisibility: 'labelShow',
            }
        });
        const labelId = labelResponse.data.id;
        return labelId;
    } catch (error) {
        console.error('Error creating label:', error);
        throw error;
    }
}

/**
 * Get list of labels
 * 
 * @param {object} gmail The Gmail API client
 * 
 * @returns {Promise<object>} The list of labels
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const getLabels = async (gmail) => {
    try {
        const labelsResponse = await gmail.users.labels.list({
            userId: 'me'
        });
        const labels = labelsResponse.data.labels || [];
        return labels;
    } catch (error) {
        console.error('Error listing labels:', error);
        throw error;
    }
}

/**
 * Assign a label to an email
 * 
 * @param {object} gmail The Gmail API client
 * @param {string} messageId The ID of the email message
 * @param {string} labelId The ID of the label to assign
 * 
 * @returns {Promise<object>} The response from the API
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const assignLabel = async (gmail, messageId, labelId) => {
    try {
        const response = await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds: [labelId],
            }
        });
        return response;
    } catch (error) {
        console.error('Error assigning label:', error);
        throw error;
    }
}

module.exports = {
    createLabel,
    getLabels,
    assignLabel
}
