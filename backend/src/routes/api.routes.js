const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../services/storage.service');
const { detectFaces, verifyFaces } = require('../services/ntech.service');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/detect', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const imageUrl = await uploadFile(req.file);
        const detectionResult = await detectFaces(imageUrl);

        res.json({
            imageUrl,
            detection: detectionResult
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/verify', upload.fields([{ name: 'image1' }, { name: 'image2' }]), async (req, res) => {
    try {
        if (!req.files['image1'] || !req.files['image2']) {
            return res.status(400).json({ error: 'Both images are required' });
        }

        const image1Url = await uploadFile(req.files['image1'][0]);
        const image2Url = await uploadFile(req.files['image2'][0]);

        const verificationResult = await verifyFaces(image1Url, image2Url);

        res.json({
            image1Url,
            image2Url,
            verification: verificationResult
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
