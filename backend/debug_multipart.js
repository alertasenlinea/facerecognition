const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_URL = process.env.VITE_NTECH_API_URL || 'https://videoia.alertasenlinea.com.ar';
const API_KEY = process.env.NTECH_TOKEN || '1154141798ea58f1dbf2cb4b127571fa085620b394d11f1116c2ab6ae3fe02f6';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Token ${API_KEY}`
    },
    validateStatus: () => true
});

async function checkMultipart(endpoint, data) {
    try {
        console.log(`Checking MULTIPART POST ${endpoint} with keys: ${Object.keys(data).join(', ')} ...`);

        const form = new FormData();
        for (const [key, value] of Object.entries(data)) {
            form.append(key, String(value));
        }

        const headers = {
            ...form.getHeaders(),
            'Authorization': `Token ${API_KEY}`
        };

        const response = await client.post(endpoint, form, { headers });
        console.log(`Status: ${response.status}`);

        if (response.status === 400) {
            console.log('Error 400 Full Data:', JSON.stringify(response.data, null, 2));
        } else if (response.status !== 404 && response.status !== 405) {
            console.log('SUCCESS POTENTIAL!');
            console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log('---');
}

async function main() {
    const cardId = 2;
    const detectionId = "d66a6n699akc72ug2u8g";

    // Test with human_card
    await checkMultipart('/human-card-attachments/', { human_card: cardId, detection_id: detectionId });
    // Test with card
    await checkMultipart('/human-card-attachments/', { card: cardId, detection_id: detectionId });
}

main();
