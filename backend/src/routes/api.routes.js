const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../services/storage.service');
const { logAccess } = require('../services/db.service');
const { detectFaces, searchFaces, verifyFaces, createFace } = require('../services/ntech.service');

// ... (existing code)

// Search for similar faces in the system (1:N)
router.post('/search', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Upload image to storage
        const imageUrl = await uploadFile(req.file);

        // Detect faces first
        const detectionResult = await detectFaces(req.file.buffer, req.file.originalname);

        // Check if any faces were detected
        if (!detectionResult.objects?.face || detectionResult.objects.face.length === 0) {
            // Log no face detected
            await logAccess({
                imageUrl,
                status: 'NO_MATCH',
                metadata: { error: 'No face detected' }
            });

            return res.status(404).json({
                error: 'No faces detected in the image',
                imageUrl
            });
        }

        // Use the first detected face for search
        const firstFace = detectionResult.objects.face[0];
        const detectionId = firstFace.id;

        // Search for similar faces
        const searchOptions = {
            limit: req.query.limit || 10,
            threshold: req.query.threshold || 0.75
        };

        const searchResults = await searchFaces(detectionId, searchOptions);
        const matches = searchResults.results || [];
        const bestMatch = matches.length > 0 ? matches[0] : null;

        // Determine status
        const status = bestMatch ? 'MATCH' : 'NO_MATCH';

        // Log access
        const logEntry = await logAccess({
            imageUrl,
            detectionId,
            matchedCardId: bestMatch?.card?.id, // Adjust based on NTECH response structure
            confidence: bestMatch?.similarity,
            status,
            metadata: {
                matches_count: matches.length,
                best_match: bestMatch
            }
        });

        res.json({
            imageUrl,
            detectedFace: firstFace,
            searchResults,
            matches,
            bestMatch,
            status, // 'MATCH' or 'NO_MATCH'
            logId: logEntry?.id
        });

    } catch (error) {
        console.error('Search endpoint error:', error);
        res.status(500).json({
            error: error.message,
            details: error.response?.data || 'Internal Server Error',
            step: 'search'
        });
    }
});

// Enroll a new face
router.post('/enroll', async (req, res) => {
    try {
        const { detectionId, name, meta } = req.body;

        if (!detectionId || !name) {
            return res.status(400).json({ error: 'Detection ID and Name are required' });
        }

        const newCard = await createFace({
            detectionId,
            name,
            meta
        });

        res.json({
            message: 'Face enrolled successfully',
            card: newCard
        });

    } catch (error) {
        console.error('Enroll endpoint error:', error);
        res.status(500).json({
            error: error.message,
            details: error.response?.data || 'Internal Server Error',
            step: 'enrollment'
        });
    }
});

// Verify/compare two faces (1:1)
router.post('/verify', upload.fields([{ name: 'image1' }, { name: 'image2' }]), async (req, res) => {
    try {
        if (!req.files['image1'] || !req.files['image2']) {
            return res.status(400).json({ error: 'Both images are required' });
        }

        const file1 = req.files['image1'][0];
        const file2 = req.files['image2'][0];

        // Upload both images
        const image1Url = await uploadFile(file1);
        const image2Url = await uploadFile(file2);

        // Detect faces in both images
        const detection1 = await detectFaces(file1.buffer, file1.originalname);
        const detection2 = await detectFaces(file2.buffer, file2.originalname);

        // Check if faces were detected
        if (!detection1.objects?.face || detection1.objects.face.length === 0) {
            return res.status(404).json({ error: 'No face detected in first image' });
        }
        if (!detection2.objects?.face || detection2.objects.face.length === 0) {
            return res.status(404).json({ error: 'No face detected in second image' });
        }

        const face1Id = detection1.objects.face[0].id;
        const face2Id = detection2.objects.face[0].id;

        // Verify faces
        const verificationResult = await verifyFaces(face1Id, face2Id);

        res.json({
            image1Url,
            image2Url,
            face1: detection1.objects.face[0],
            face2: detection2.objects.face[0],
            verification: verificationResult,
            match: verificationResult.confidence?.average_conf >= 0.7
        });

    } catch (error) {
        console.error('Verify endpoint error:', error);
        res.status(500).json({
            error: error.message,
            details: error.response?.data || 'Internal Server Error',
            step: 'verification'
        });
    }
});

module.exports = router;
