const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration for production
const corsOptions = {
    origin: [
        'http://localhost:3300',
        'http://localhost:3000',
        'https://app.faceid.alertasenlinea.com.ar',
        'http://app.faceid.alertasenlinea.com.ar'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
