const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Create client with service role to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TABLE_NAME = 'access_logs';

/**
 * Log an access attempt to the database
 * @param {Object} logData - Data to log
 * @returns {Promise<Object>} Created log entry
 */
const logAccess = async (logData) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([
                {
                    image_url: logData.imageUrl,
                    detection_id: logData.detectionId,
                    matched_card_id: logData.matchedCardId || null,
                    confidence: logData.confidence || null,
                    status: logData.status, // 'MATCH', 'NO_MATCH', 'ERROR'
                    metadata: logData.metadata || {}
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error logging access:', error);
        // Don't throw error to prevent blocking the main flow
        return null;
    }
};

module.exports = {
    logAccess
};
