const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_URL = process.env.VITE_NTECH_API_URL || 'https://videoia.alertasenlinea.com.ar';
const API_KEY = process.env.NTECH_TOKEN || '1154141798ea58f1dbf2cb4b127571fa085620b394d11f1116c2ab6ae3fe02f6';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function checkPost(params) {
    try {
        console.log(`Checking POST ${params.url} with data: ${JSON.stringify(params.data)}`);
        const response = await client.post(params.url, params.data);
        console.log(`Status: ${response.status}`);
        if (response.status !== 404) {
            console.log('POTENTIAL MATCH!');
            console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log('---');
}

async function main() {
    const cardId = 2; // Existing card
    const detectionId = "d66a6n699akc72ug2u8g";

    const tests = [
        { url: '/cards/humans/save_detection/', data: { card: cardId, detection_id: detectionId } },
        { url: '/cards/humans/save_detection/', data: { human_card: cardId, detection_id: detectionId } },
        { url: '/save_detection/', data: { card: cardId, detection_id: detectionId } },
        { url: '/detect/save/', data: { card: cardId, detection_id: detectionId } }
    ];

    for (const t of tests) {
        await checkPost(t);
    }
}

main();
