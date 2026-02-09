const axios = require('axios');
const FormData = require('form-data');

const NTECH_API_URL = process.env.NTECH_API_URL || 'https://videoia.alertasenlinea.com.ar';
const NTECH_API_KEY = process.env.NTECH_API_KEY;

// Create axios client with Token authentication (not Bearer)
const ntechClient = axios.create({
    baseURL: NTECH_API_URL,
    headers: {
        'Authorization': `Token ${NTECH_API_KEY}`,
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'Content-Language': 'en'
    },
    timeout: 30000
});

/**
 * Detect faces in an image using NTLAB FindFace Multi API
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} originalname - Original filename
 * @returns {Promise<Object>} Detection result with face objects
 */
const detectFaces = async (imageBuffer, originalname) => {
    try {
        const formData = new FormData();
        formData.append('photo', imageBuffer, originalname);

        // Optional: Request specific attributes
        const attributes = {
            face: {
                age: false,
                beard: false,
                emotions: false,
                glasses: false,
                gender: false,
                medmask: false,
                headpose: false
            }
        };
        formData.append('attributes', JSON.stringify(attributes));

        const response = await ntechClient.post('/detect', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        return response.data;
    } catch (error) {
        console.error('NTech Detect Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Search for similar faces in the system (1:N search)
 * @param {string} detectionId - Detection ID from detectFaces
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results with matches
 */
const searchFaces = async (detectionId, options = {}) => {
    try {
        const params = {
            looks_like: `detection:${detectionId}`,
            ...options
        };

        const response = await ntechClient.get('/cards/humans/', { params });
        return response.data;
    } catch (error) {
        console.error('NTech Search Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Verify/compare two faces (1:1 verification)
 * @param {string} detection1Id - First detection ID
 * @param {string} detection2Id - Second detection ID
 * @param {string} cardId - Optional card ID
 * @returns {Promise<Object>} Verification result with confidence score
 */
const verifyFaces = async (detection1Id, detection2Id, cardId = null) => {
    try {
        const params = {
            object1: `detection:${detection1Id}`,
            object2: `detection:${detection2Id}`
        };

        if (cardId) {
            params.card_id = cardId;
        }

        const response = await ntechClient.get('/verify', { params });
        return response.data;
    } catch (error) {
        console.error('NTech Verify Error:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    detectFaces,
    searchFaces,
    verifyFaces
};
