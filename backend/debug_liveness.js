const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
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

async function checkLiveness(imagePath) {
    try {
        console.log(`Checking Liveness on ${API_URL}...`);

        // Need a real image file path. 
        // I will assume there is one in 'uploads' or create a dummy one?
        // Actually, without a real face image, detection might fail or return nothing.
        // But I can check if the API accepts the parameter at least.

        // NOTE: Since I don't have a guaranteed image here, I will rely on previous knowledge 
        // or try to use a sample if available.
        // If not, I'll just check if I can send the param.

        // Better: I will create a dummy request with a tiny valid jpg buffer?
        // Or just print the plan.

        console.log("To fully test liveness, use a real face image.");
        console.log("Params to test: liveness=true, attributes=liveness");

    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

// Just a placeholder script for now since I lack a sample image in this environment context easily.
// I will instead READ THE SWAGGER CHUNKS which is more reliable for discovery.
console.log("Using Swagger analysis instead of blind probing without image.");
