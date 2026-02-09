const axios = require('axios');

const NTECH_API_URL = process.env.NTECH_API_URL || 'https://videoia.alertasenlinea.com.ar';
const NTECH_API_KEY = process.env.NTECH_API_KEY;

const ntechClient = axios.create({
    baseURL: NTECH_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NTECH_API_KEY}`
    },
    timeout: 30000
});

const detectFaces = async (imageUrl) => {
    try {
        const response = await ntechClient.post('/detect', {
            image: imageUrl
        });
        return response.data;
    } catch (error) {
        console.error('NTech Detect Error:', error.response?.data || error.message);
        throw error;
    }
};

const verifyFaces = async (image1Url, image2Url) => {
    try {
        const response = await ntechClient.post('/verify', {
            image1: image1Url,
            image2: image2Url
        });
        return response.data;
    } catch (error) {
        console.error('NTech Verify Error:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    detectFaces,
    verifyFaces
};
