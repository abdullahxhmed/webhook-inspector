const mongoose = require('mongoose');

const WebhookSchema = new mongoose.Schema({
    source: String,           // Could be 'stripe', 'github', etc.
    headers: Object,          // Store all headers for perfect replay
    body: Object,             // The actual webhook payload
    receivedAt: { 
        type: Date, 
        default: Date.now     // Auto-timestamp
    }
});

module.exports = mongoose.model('Webhook', WebhookSchema);