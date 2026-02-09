const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'facial-validation-photos';

const uploadFile = async (file) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        console.error('Supabase Upload Error:', error);
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

    return publicUrl;
};

module.exports = {
    uploadFile
};
