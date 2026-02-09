const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Basic health check
router.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detailed diagnostics (Be careful exposing this publicly without auth in real production)
router.get('/diagnostics', async (req, res) => {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            SUPABASE_URL_CONFIGURED: !!process.env.SUPABASE_URL,
            SUPABASE_KEY_CONFIGURED: !!process.env.SUPABASE_SERVICE_KEY,
            NTECH_API_URL_CONFIGURED: !!process.env.NTECH_API_URL,
            NTECH_API_KEY_CONFIGURED: !!process.env.NTECH_API_KEY,
            NTECH_API_URL_VALUE: process.env.NTECH_API_URL || 'default',
        },
        connectivity: {
            supabase: 'pending',
            ntlab: 'pending'
        }
    };

    // Check Supabase connectivity
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        diagnostics.connectivity.supabase = 'ok';
    } catch (error) {
        diagnostics.connectivity.supabase = `error: ${error.message}`;
    }

    // Check NTLAB connectivity (basic reachability)
    try {
        // Just checking if we can reach the base URL or health endpoint if known
        // Since we don't know a lightweight health endpoint, we'll skip actual request
        // or try a simple GET to base URL which might 404 but proves connectivity
        const ntechUrl = process.env.NTECH_API_URL || 'https://videoia.alertasenlinea.com.ar';
        await axios.get(ntechUrl, { timeout: 5000 }).catch(err => {
            // Expected 404 or 401 is fine, means we reached the server
            if (err.response) return;
            throw err;
        });
        diagnostics.connectivity.ntlab = 'reachable';
    } catch (error) {
        diagnostics.connectivity.ntlab = `error: ${error.message}`;
    }

    res.json(diagnostics);
});

module.exports = router;
