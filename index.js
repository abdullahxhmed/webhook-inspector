require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Webhook = require('./models/Webhook'); // Import the model
const axios = require('axios');
const https =require('https');

const app = express();
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// === 0. MIDDLEWARE ===
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// === 1. CONNECT TO MONGODB ===
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error('❌ DB connection error:', error));
db.once('open', () => console.log('✅ Connected to Database'));

// === 2. WEBHOOK CAPTURE ENDPOINT (Updated) ===
app.post('/webhook', async (req, res) => {
    if (req.headers['x-webhook-secret'] !== process.env.WEBHOOK_SECRET) {
    return res.status(403).send('Forbidden');
    }
    console.log('📩 New webhook incoming...');
    
    try {
        // Create a new document using the Webhook model
        const newWebhook = new Webhook({
            source: req.headers['user-agent'] || 'unknown',
            headers: req.headers,
            body: req.body
        });
        
        // Save to MongoDB
        await newWebhook.save();
        console.log('💾 Webhook saved to DB. ID:', newWebhook._id);
        
        // Always respond quickly to the sender
        res.status(200).json({ 
            status: 'Captured!', 
            savedId: newWebhook._id 
        });
        
    } catch (error) {
        console.error('❌ Error saving webhook:', error);
        res.status(500).json({ error: 'Failed to save' });
    }
});

// === 3. NEW: ENDPOINT TO LIST ALL WEBHOOKS ===
app.get('/webhooks', async (req, res) => {
    try {
        const webhooks = await Webhook.find().sort({ receivedAt: -1 }); // Newest first
        res.json(webhooks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === 4. KEEP THE TEST ROUTE ===
app.get('/', (req, res) => {
    res.send('🚀 Webhook Inspector is running! DB Connected.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});


// REPLAY endpoint
app.post('/webhooks/:id/replay', async (req, res) => {
    try {
        const webhook = await Webhook.findById(req.params.id);
        if (!webhook) return res.status(404).send('Webhook not found');
        
        // Get target URL from request body
        const { targetUrl } = req.body;
        if (!targetUrl) return res.status(400).send('targetUrl required');
        
        // Re-send the original payload
       const response = await axios.post(targetUrl, webhook.body, {
               headers: { ...webhook.headers, 'X-Replayed-From': 'Webhook    Inspector' },
        // 🔽 ADD THIS OPTION TO THE AXIOS CONFIG
               httpsAgent: new https.Agent({ rejectUnauthorized: false })
             });
        
        res.json({ 
            success: true, 
            targetUrl, 
            statusCode: response.status 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
});