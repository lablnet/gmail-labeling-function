const { storeLabelInStorage, fetchLabelsFromStorage } = require('./storage');

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

        let labels = await fetchLabelsFromStorage();
        labels[labelName] = labelId;
        await storeLabelInStorage(labels);

        return labelId;
    } catch (error) {
        console.error('Error creating label:', error);
        throw error;
    }
}

/**
 * Function to Get label ID, checking Cloud Storage first
 * 
 * @param {object} gmail The Gmail API client
 * @param {string} labelName The name of the label to get the ID for
 * 
 * @returns {Promise<string>} The ID of the label
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
async function getLabelId(gmail, labelName) {
    let labels = await fetchLabelsFromStorage();
    if (labels[labelName]) {
        return labels[labelName];
    }

    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    const allLabels = labelsResponse.data.labels || [];
    const label = allLabels.find(l => l.name === labelName);

    if (label) {
        labels[labelName] = label.id;
        await storeLabelInStorage(labels);
        return label.id;
    }
    return null;
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
    getLabelId,
    assignLabel
}
