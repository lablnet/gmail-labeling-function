/**
 * Function to get the history by ID
 * 
 * @param {object} gmail The Gmail API client
 * @param {string} historyId The ID of the history to fetch
 * 
 * @returns {Promise<object>} The history details
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const fetchHistoryDetails = async (gmail, historyId) => {
    try {
        const response = await gmail.users.history.list({
            userId: 'me',
            startHistoryId: historyId,
        });
        return response.data.history || [];
    } catch (error) {
        console.error(`Error fetching history details for ID ${historyId}:`, error);
    }
}

module.exports = {
    fetchHistoryDetails,
}
