const { google } = require('googleapis');

const classifyEmail = async (subject, body, openaiApiKey) => {
    const messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": `
            Classify the following email into one of these categories: freelancer-upwork, freelancer-freelancer, freelancer-fiverr, client, friend, github-repo, urgent, any other if that make logical sense.
            Email Subject: ${subject}
            Email Body: ${body}
            Only return category without any other text.
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
