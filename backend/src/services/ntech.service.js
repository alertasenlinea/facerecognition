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

/**
 * Create a new face (card) in NTECH system
 * @param {Object} faceData - Data for the new face
 * @returns {Promise<Object>} Created card
 */
const createFace = async (faceData) => {
    try {
        // FindFace Multi expects a body with at least specific detection info or just creates a card
        // Assuming we are attaching a detection to a new card

        // 1. Get available watch lists (required for creating a card)
        const watchListsResponse = await ntechClient.get('/watch-lists/');
        const watchLists = watchListsResponse.data.results || [];

        let watchListId;
        if (watchLists.length > 0) {
            watchListId = watchLists[0].id; // Use the first available list
        } else {
            // If no list exists, try to create one or handle error
            // For now, we assume there's at least one list or we can't create a card without permissions
            console.warn('No watch lists found. Attempting to create card without list (might fail if required).');
        }

        const cardData = {
            name: faceData.name,
            meta: faceData.meta || {}
        };

        if (watchListId) {
            cardData.watch_lists = [watchListId];
        }

        // 2. Create a card (human)
        const cardResponse = await ntechClient.post('/cards/humans/', cardData);

        if (!cardResponse.data || !cardResponse.data.id) {
            throw new Error('Failed to create card');
        }

        const cardId = cardResponse.data.id;

        // 3. Save the face (detection) to the card if detection_id is provided
        if (faceData.detectionId) {
            await ntechClient.post(`/cards/humans/${cardId}/save_detection/`, {
                detection_id: faceData.detectionId
            });
        }

        return cardResponse.data;
    } catch (error) {
        console.error('NTech Create Face Error:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    detectFaces,
    searchFaces,
    verifyFaces,
    createFace
};
