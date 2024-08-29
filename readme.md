# Gmail Labeling Cloud Function
- This is a cloud function that listens to a Pub/Sub topic and labels the email in Gmail based on the content of the email using OpenAI GPT4o-mini API.
- This function only work for workspace accounts.

### Secret Manager for Environment Variables
1. Create a Secret in Secret Manager for the OpenAI API Key and service account key
    - ```sh
        gcloud secrets create openai-api-key --replication-policy automatic
        gcloud secrets create service-account-key --replication-policy automatic
        ```
2. Add the OpenAI API Key and service account key to the secret
    - There should be file named `openai-api-key.txt` and `service-account-key.json` in the root directory
    - The content of the file should be the OpenAI API Key and service account key respectively
    - ```sh
        gcloud secrets versions add openai-api-key --data-file=openai-api-key.txt
        gcloud secrets versions add service-account-key --data-file=service-account-key.json
        ```
3. Grant the Cloud Function Service Account access to the secret
    - The function name is `labelEmail`
    - ```sh
        PROJECT_ID=$(gcloud config get-value project)
        FUNCTION_NAME=labelEmail
        gcloud secrets add-iam-policy-binding openai-api-key \
        --member="serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" 
        gcloud secrets add-iam-policy-binding service-account-key \
        --member="serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" 
    ```
4. Deploy the function first time.
    - The function will have access to the secret
    - ```
        gcloud functions deploy labelEmail \
        --runtime nodejs20 \
        --trigger-topic email-labeling \
        --set-env-vars USER_EMAIL=YOUR-EMAIL_GOES-HERE,PROJECT_ID=YOUR-PROJECT
    ```
    - Replace `YOUR-EMAIL_GOES-HERE` with the email address you want to label the email for.
    - Replace `YOUR-PROJECT` with the project id.

### Deploy the function subsequent times
```sh
        gcloud functions deploy labelEmail \
        --runtime nodejs20 \
        --trigger-topic email-labeling
```
