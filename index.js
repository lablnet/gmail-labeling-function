const { getAuthenticatedClient } = require('./lib/auth')
const { classifyEmail } = require('./lib/openai')
const {
  fetchMessageDetails,
  extractEmailBody,
  extractEmailSubject
} = require('./lib/gmail')
const { getLabelId, createLabel, assignLabel } = require('./lib/label')
const { fetchHistoryDetails } = require('./lib/history')
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')

const USER_EMAIL = process.env.USER_EMAIL;
const secretManager = new SecretManagerServiceClient()

exports.labelEmail = async (event, context) => {
  const pubsubMessage = event.data
  const message = Buffer.from(pubsubMessage, 'base64').toString()
  const messageData = JSON.parse(message)
  console.log('lg0: Message Data: ', messageData)
  const historyId = messageData.historyId
  console.log('historyId: ', historyId)

  try {
    // Access OpenAI API Key from Secret Manager
    const openaiSecretName = `projects/${process.env.PROJECT_ID}/secrets/openai-api-key/versions/latest`
    const [openaiVersion] = await secretManager.accessSecretVersion({
      name: openaiSecretName
    })
    const openaiApiKey = openaiVersion.payload.data.toString()

    // Access Service Account Key from Secret Manager
    const serviceAccountSecretName = `projects/${process.env.PROJECT_ID}/secrets/service-account-key/versions/latest`
    const [serviceAccountVersion] = await secretManager.accessSecretVersion({
      name: serviceAccountSecretName
    })
    const serviceAccountKey = JSON.parse(
      serviceAccountVersion.payload.data.toString()
    )

    // Get the authenticated Gmail API client
    const { authClient, gmail } = await getAuthenticatedClient(
      serviceAccountKey,
      USER_EMAIL
    )
    const history = await fetchHistoryDetails(gmail, historyId)
    if (history.length === 0) {
      console.log('No history found.')
      return
    }
    const messageId = history[0].messages[0].id
    const message = await fetchMessageDetails(gmail, messageId)

    if (!message) {
      console.log('No message found.')
      return
    }
    if (message) {
      const emailBody = extractEmailBody(message.payload)
      const emailSubject = extractEmailSubject(message.payload)
      if (!emailBody || !emailSubject) {
        console.log('No email body or subject found.')
        return
      }
      console.log('Email Body: ', emailBody)
      console.log('Email Subject: ', emailSubject)

      const label = await classifyEmail(emailSubject, emailBody, openaiApiKey)
      console.log('Email classification:', label)
      let labelId = await getLabelId(gmail, label)
      if (!labelId) {
        labelId = await createLabel(gmail, label)
        console.log('Label created:', label)
      } else {
        console.log('Label already exists:', label)
      }

      let eLabelResponse = await assignLabel(gmail, messageId, labelId)
      console.log('Successfully labled the email')
    } else {
      console.log('No message found.')
    }
  } catch (error) {
    console.error(`Failed to label email`, error)
  }
}
