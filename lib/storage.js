const { Storage } = require('@google-cloud/storage');
const BUCKET_NAME = 'lablnet-email-labels';
const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

async function fetchLabelsFromStorage() {
    try {
        const file = bucket.file('labels.json');
        const [exists] = await file.exists();
        if (!exists) {
            return {};
        }

        const [contents] = await file.download();
        return JSON.parse(contents.toString());
    } catch (error) {
        console.error('Error fetching labels from storage:', error);
        return {};
    }
}

async function storeLabelInStorage(labels) {
    try {
        const file = bucket.file('labels.json');
        await file.save(JSON.stringify(labels), {
            contentType: 'application/json',
        });
    } catch (error) {
        console.error('Error storing label in storage:', error);
    }
}

module.exports = {
    fetchLabelsFromStorage,
    storeLabelInStorage,
};
