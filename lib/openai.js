const axios = require('axios');

/**
 * Classify an email into one of the specified categories using the OpenAI API.
 * 
 * @param {string} subject - The email subject.
 * @param {string} body - The email body.
 * @param {string} openaiApiKey - The OpenAI API key.
 * 
 * @returns {Promise<string>} The category of the email.
 * @since 1.0.0
 * @author Muhammad Umer Frooq<umer@lablnet.com>
 */
const classifyEmail = async (subject, body, openaiApiKey) => {
    const messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": `
            Classify the following email into one of these categories or suggest some reaasonable category: freelancer-upwork, freelancer-freelancer, freelancer-fiverr, client, friend, github-repo, urgent etc.
            Email Subject: ${subject}
            Email Body: ${body}
            Only return category without any other text, If you can't classify it then return "unknown".
            `
        }
    ];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: messages,
            max_tokens: 10,
            n: 1,
            stop: null,
            temperature: 0.5,
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            }
        });

        const classification = response.data.choices[0].message.content.trim();
        return classification;
    } catch (error) {
        console.error('Error classifying email:', error);
        throw error;
    }
}

module.exports = {
    classifyEmail,
}
